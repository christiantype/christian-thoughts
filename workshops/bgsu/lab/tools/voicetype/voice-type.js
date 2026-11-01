/*!
 * VoiceType — set type with your voice, in real time.
 * OP/AL Lab prototype.
 *
 * Draws every letter as an SVG outline taken from a variable font (via fontkit),
 * so weight, width, height, baseline and stretch can all follow the voice live.
 * What is on screen while someone speaks is exactly what gets exported.
 *
 * Requires: window.fontkit (vendor/fontkit.min.js) and a variable font with
 * wght + wdth axes (voice-flex.ttf, a subset of Roboto Flex, OFL).
 *
 *   const vt = new VoiceType({ svg, fontData, phrase, onStatus });
 *   await vt.start();            // microphone on
 *   vt.stop(); vt.back(); vt.skip(); vt.goTo(i); vt.setPhrase(text); vt.reset();
 *   vt.exportSVG({ ink, bg });   // string, vector outlines, print-ready
 *   await vt.exportPNG({ ink, bg, widthIn: 8, dpi: 300 });   // Blob, 4:5
 *   vt.feed({ db, st });         // push one 25 ms frame from any audio source
 */
(function (global) {
  'use strict';

  const FRAME_MS = 25;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const median = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  const pct = (a, p) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * p))]; };
  const VOWELS = /[aeiouyàáâãäåæèéêëìíîïòóôõöøùúûüý]/i;
  const letterWeight = ch => VOWELS.test(ch) ? 2.5 : /[\p{L}\p{N}]/u.test(ch) ? 1 : 0.25;

  // Running mean / sd that starts from a guess and adapts to the speaker.
  class Stat {
    constructor(m, sd, k, cap) { this.n = k; this.m = m; this.s = sd * sd * (k - 1); this.cap = cap; }
    push(x) {
      if (this.n >= this.cap) { this.s *= (this.cap - 1) / this.n; this.n = this.cap - 1; }
      this.n++; const d = x - this.m; this.m += d / this.n; this.s += d * (x - this.m);
    }
    z(x) { return (x - this.m) / (Math.sqrt(this.s / (this.n - 1)) || 1); }
  }

  // Autocorrelation pitch detector (70–450 Hz).
  function detectPitch(b, sr, rms) {
    if (rms < 0.008) return null;
    const minLag = Math.floor(sr / 450), maxLag = Math.min(Math.floor(sr / 70), b.length - 256);
    let best = 0, lag = -1;
    for (let L = minLag; L <= maxLag; L++) {
      let s = 0; const n = b.length - L;
      for (let i = 0; i < n; i++) s += b[i] * b[i + L];
      s /= n; if (s > best) { best = s; lag = L; }
    }
    if (lag < 0 || best / (rms * rms) < 0.45) return null;
    return sr / lag;
  }
  function measure(buf, sr) {
    let sum = 0; for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
    const rms = Math.sqrt(sum / buf.length), db = 20 * Math.log10(rms + 1e-9);
    const hz = detectPitch(buf, sr, rms);
    return { db, hz, st: hz ? 12 * Math.log2(hz / 110) : null };
  }

  class VoiceType {
    constructor({ svg = null, fontData, phrase = '', onStatus = () => {}, onLevel = () => {}, options = {} } = {}) {
      if (!global.fontkit) throw new Error('VoiceType needs fontkit loaded first');
      this.svg = svg;
      this.font = global.fontkit.create(fontData instanceof Uint8Array ? fontData : new Uint8Array(fontData));
      this.upm = this.font.unitsPerEm;
      this.instances = new Map(); this.glyphs = new Map();
      this.opts = Object.assign({
        canvasW: 1600,      // canvas size in SVG units (4:5)
        canvasH: 2000,
        margin: 0.08,       // margin as a share of canvas width
        maxWords: 12,       // how many words fill the canvas
        lineGap: 1.55,      // line height in em
        gridColor: '#ff3b6b',
        pauseMs: 280,       // silence that ends a word
        startDb: 12,        // how far above room noise a sound must be to start a word (raise in loud rooms)
        minVoiceFrames: 4,  // shortest sound that counts as a word
        baseLetterSec: 0.06 // expected time per consonant (vowels count 2.5x)
      }, options);
      this.onStatus = onStatus; this.onLevel = onLevel;
      this.listening = false; this.noise = -70; this.dirty = true; this.showGrid = true;
      this.resetStats();
      this.setPhrase(phrase);
      this._raf = this._raf.bind(this);
    }

    /* ----- phrase + cursor ----- */
    resetStats() { this.loudStat = new Stat(-30, 7, 30, 600); this.pitchStat = new Stat(6.5, 3.5, 20, 600); }
    setPhrase(text) {
      this.words = String(text).trim().split(/\s+/).filter(Boolean).slice(0, this.opts.maxWords)
        .map((w, i) => ({ text: w, frames: [], done: false, gap: i ? 0.3 : 0 }));
      this.cur = this.words.length ? 0 : -1; this.silence = 0; this.wait = null; this.pace = 0;
      this.render();
    }
    reset() { this.resetStats(); this.setPhrase(this.words.map(w => w.text).join(' ')); }
    goTo(i) {
      if (!this.words[i]) return;
      const w = this.words[i]; w.frames = []; w.done = false; delete w.letters;
      this.cur = i; this.silence = 0; this.wait = null; this.render();
      this.onStatus('word', w.text);
    }
    back() { if (!this.words.length) return; this.goTo(this.cur < 0 ? this.words.length - 1 : Math.max(0, this.cur - 1)); }
    skip() { if (this.cur >= 0) this._commit(true); }
    get complete() { return this.words.length > 0 && this.words.every(w => w.done); }

    /* ----- audio ----- */
    async _openMic(onFrame) {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      const AC = global.AudioContext || global.webkitAudioContext;
      this.ctx = new AC();
      const src = this.ctx.createMediaStreamSource(this.stream);
      this.analyser = this.ctx.createAnalyser(); this.analyser.fftSize = 2048;
      this.buf = new Float32Array(2048); src.connect(this.analyser);
      this.listening = true; this.noise = -70; this.hist = [];
      this.tick = setInterval(() => {
        this.analyser.getFloatTimeDomainData(this.buf);
        const m = measure(this.buf, this.ctx.sampleRate);
        this.onLevel(m); onFrame(m);
      }, FRAME_MS);
      requestAnimationFrame(this._raf);
    }
    // Phrase mode: the words are known, the voice sets them one by one.
    async start() {
      if (this.listening) return;
      this.mode = 'phrase';
      if (this.cur < 0) { const n = this.words.findIndex(w => !w.done); this.cur = n < 0 ? 0 : n; if (n < 0) this.goTo(0); }
      await this._openMic(m => this.feed(m));
      this.onStatus('listening', this.words[this.cur] && this.words[this.cur].text);
    }
    stop() {
      if (!this.listening) return;
      this.listening = false; clearInterval(this.tick);
      if (this.rec) { const r = this.rec; this.rec = null; try { r.stop(); } catch (_) {} this._finalizeFree(); }
      this.stream.getTracks().forEach(t => t.stop()); this.ctx.close();
      this.render(); this.onStatus('stopped');
    }

    /* ----- free mode: transcribe whatever is said ----- */
    static get canTranscribe() { return !!(global.SpeechRecognition || global.webkitSpeechRecognition); }
    async startTranscribe({ lang = (global.navigator && navigator.language) || 'en-US', keep = false } = {}) {
      if (this.listening) return;
      const SR = global.SpeechRecognition || global.webkitSpeechRecognition;
      if (!SR) { const e = new Error('Speech recognition isn’t available in this browser'); e.name = 'NoSpeechRecognition'; throw e; }
      this.mode = 'free';
      if (!keep) { this.words = []; this.pace = 0; }
      this.cur = -1; this.fixed = this.words.length; this.seg = []; this.segUsed = 0; this.finalIdx = 0;
      await this._openMic(m => this._feedFree(m));
      const rec = new SR(); rec.continuous = true; rec.interimResults = true; rec.lang = lang;
      rec.onresult = e => this._onResult(e);
      rec.onerror = e => {
        if (e.error === 'no-speech' || e.error === 'aborted') return;
        this.onStatus('error', e.error);
        if (['not-allowed', 'service-not-allowed', 'network', 'audio-capture'].includes(e.error)) this.stop();
      };
      rec.onend = () => { if (this.rec === rec && this.listening) { this._finalizeFree(); this.finalIdx = 0; try { rec.start(); } catch (_) {} } };
      this.rec = rec; rec.start();
      this.onStatus('transcribing');
    }
    _feedFree({ db, st = null }) {
      const hist = this.hist;
      hist.push(db); if (hist.length > 120) hist.shift();
      this.noise = hist.length >= 8 ? pct(hist, 0.1) : Math.min(this.noise, db);
      if (hist.length < 12) return;
      const v = db > this.noise + this.opts.startDb - 2 && db > -60;
      this.seg.push({ db, st, v });
      if (v) { this.loudStat.push(db); if (st !== null) this.pitchStat.push(st); }
    }
    // The recognizer gives words but not timings; spread the audio heard so far across the
    // words it has heard so far, snapping to the small dips between words where there are any.
    _align(frames, n, texts) {
      let runs = [], cur = null, gap = 0;
      frames.forEach((f, i) => {
        if (f.v) { if (cur && gap <= 3) cur.end = i; else { cur = { start: i, end: i }; runs.push(cur); } gap = 0; }
        else gap++;
      });
      runs = runs.filter(r => r.end - r.start >= 2);
      if (!runs.length || !n) return texts.map(() => ({ frames: [], end: 0, gap: 0.3 }));
      while (runs.length > n) {
        let bi = 1, bg = Infinity;
        for (let i = 1; i < runs.length; i++) { const g = runs[i].start - runs[i - 1].end; if (g < bg) { bg = g; bi = i; } }
        runs[bi - 1].end = runs[bi].end; runs.splice(bi, 1);
      }
      if (runs.length === n) return runs.map((r, k) => ({
        frames: frames.slice(r.start, r.end + 1).filter(f => f.v), end: r.end + 1,
        gap: k ? clamp(0.3 + ((r.start - runs[k - 1].end) * FRAME_MS / 1000) * 0.45, 0.3, 1.6) : 0.3
      }));
      // fewer pauses than words: split the voiced time by letter weight
      const idx = []; frames.forEach((f, i) => { if (f.v) idx.push(i); });
      const wts = texts.map(t => [...t].reduce((a, c) => a + letterWeight(c), 0) || 1), tot = wts.reduce((a, b) => a + b, 0);
      let c = 0, a = 0;
      return texts.map((t, k) => {
        c += wts[k]; const b = k === n - 1 ? idx.length : Math.round(c / tot * idx.length);
        const part = idx.slice(a, Math.max(a + 1, b)).filter(i => i < frames.length); a = Math.max(a + 1, b);
        return { frames: part.map(i => frames[i]), end: part.length ? part[part.length - 1] + 1 : 0, gap: 0.3 };
      });
    }
    _onResult(e) {
      let finalText = '', interimText = '', lastFinal = this.finalIdx - 1;
      for (let i = this.finalIdx; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal && i === lastFinal + 1) { finalText += ' ' + r[0].transcript; lastFinal = i; }
        else interimText += ' ' + r[0].transcript;
      }
      const room = Math.max(0, this.opts.maxWords - this.fixed);
      const finalToks = finalText.trim().split(/\s+/).filter(Boolean).slice(0, room);
      const toks = finalToks.concat(interimText.trim().split(/\s+/).filter(Boolean)).slice(0, room);
      // only audio up to now is aligned; anything after waits for the words it belongs to
      this.segUsed = this.seg.length;
      const frames = this.seg.slice(0, this.segUsed);
      const al = this._align(frames, toks.length, toks);
      const live = toks.map((t, k) => {
        const w = this.words[this.fixed + k] || {};
        return Object.assign(w, { text: t, frames: al[k].frames, gap: this.fixed + k ? al[k].gap : 0, done: false, pace: this.pace });
      });
      this.words.length = this.fixed; this.words.push(...live);
      if (finalToks.length) {
        // freeze the finished words and drop their audio
        const cut = al[finalToks.length - 1].end;
        for (let k = 0; k < finalToks.length; k++) this._freeze(this.words[this.fixed + k]);
        this.fixed += finalToks.length; this.seg = this.seg.slice(cut); this.finalIdx = lastFinal + 1;
        // re-align the words still in progress against the audio that's left
        const rest = toks.slice(finalToks.length), al2 = this._align(this.seg, rest.length, rest);
        this.words.length = this.fixed;
        rest.forEach((t, k) => this.words.push({ text: t, frames: al2[k].frames, gap: k ? al2[k].gap : 0.3, done: false, pace: this.pace }));
      }
      this.dirty = true;
      if (this.fixed >= this.opts.maxWords) { this.stop(); this.onStatus('full'); return; }
      this.onStatus('heard', toks.join(' '));
    }
    _freeze(w) {
      w.letters = this._letters(w); w.done = true;
      if (w.letters && w.rawPace) this.pace = clamp(this.pace * 0.7 + Math.log(w.rawPace) * 0.3, -0.7, 0.9);
    }
    _finalizeFree() {
      for (let i = this.fixed; i < this.words.length; i++) this._freeze(this.words[i]);
      this.fixed = this.words.length; this.seg = []; this.dirty = true;
    }
    clear() { this.words = []; this.cur = -1; this.fixed = 0; this.seg = []; this.render(); }
    _raf() { if (this.dirty) this.render(); if (this.listening) requestAnimationFrame(this._raf); }

    // One 25 ms frame: { db, st } where st is pitch in semitones above 110 Hz (or null).
    feed({ db, st = null }) {
      // Room noise = a low percentile of the last ~3 s, so it follows the room without being dragged up by speech.
      const hist = this.hist || (this.hist = []);
      hist.push(db); if (hist.length > 120) hist.shift();
      this.noise = hist.length >= 8 ? pct(hist, 0.1) : Math.min(this.noise, db);
      if (hist.length < 12 || this.cur < 0) return;   // first 0.3 s: just listen to the room
      const w = this.words[this.cur];
      const inWord = w.frames.length > 0;
      // Hysteresis: a word starts clearly above the room, and it ends when the voice drops well below
      // the word's own peak, so breaths, hum and echo don't keep the word growing.
      const voiced = inWord
        ? db > this.noise + 8 && db > w.peak - 24
        : db > this.noise + this.opts.startDb && db > -60;
      if (voiced) {
        if (!inWord) { w.peak = db; w.pace = this.pace; }
        w.peak = Math.max(w.peak, db);
        w.frames.push({ db, st }); this.silence = 0; this.wait = null;
        this.loudStat.push(db); if (st !== null) this.pitchStat.push(st);
        this.dirty = true;
      } else if (inWord) {
        this.silence++;
        if (this.silence * FRAME_MS >= this.opts.pauseMs) {
          if (w.frames.length >= this.opts.minVoiceFrames) this._commit();
          else { w.frames = []; this.silence = 0; this.dirty = true; }
        }
      } else if (this.wait !== null && this.cur > 0) {
        // the pause before a word is part of the composition: longer silence, wider gap
        this.wait++;
        w.gap = clamp(0.3 + (this.wait * FRAME_MS / 1000) * 0.45, 0.3, 1.6);
        this.dirty = true;
      }
    }
    _commit(skipped) {
      const w = this.words[this.cur]; if (!w) return;
      // Freeze the finished word, so later speech never changes it.
      w.letters = this._letters(w);
      if (w.letters && !skipped) this.pace = clamp(this.pace * 0.7 + Math.log(w.rawPace) * 0.3, -0.7, 0.9);
      w.done = true; this.silence = 0;
      let next = this.words.findIndex((x, i) => !x.done && i > this.cur);
      if (next < 0) next = this.words.findIndex(x => !x.done);
      this.cur = next; this.wait = Math.round(this.opts.pauseMs / FRAME_MS);
      this.dirty = true;
      if (next < 0) { this.stop(); this.onStatus('complete'); }
      else this.onStatus('word', this.words[next].text);
    }

    /* ----- sound → form ----- */
    _letters(word) {
      const chars = [...word.text];
      if (!word.frames.length) return null;
      // Trim quiet onsets and tails (breath, echo) so they don't become thin last letters.
      const top = Math.max(...word.frames.map(f => f.db));
      let a0 = word.frames.findIndex(f => f.db >= top - 12), a1 = word.frames.length - 1;
      while (a1 > a0 && word.frames[a1].db < top - 12) a1--;
      const F = word.frames.slice(a0, a1 + 1);
      const wt = chars.map(letterWeight), W = wt.reduce((a, b) => a + b, 0);
      // Duration counts only the body of the word (within 18 dB of its peak), not quiet tails.
      const peak = Math.max(...F.map(f => f.db));
      const core = F.filter(f => f.db >= peak - 18).length;
      word.rawPace = Math.max(0.05, (core * FRAME_MS / 1000) / (W * this.opts.baseLetterSec));
      // ...and is measured against how long this speaker usually takes, so "long" means longer than you usually are.
      const d = clamp(word.rawPace / Math.exp(word.pace || 0), 0.35, 8);
      // shouting is decided per word, so a word never comes out in mixed case
      const wordLoud = this.loudStat.z(pct(F.map(f => f.db), 0.75));
      const caps = wordLoud > 1.7;
      let cum = 0;
      return chars.map((ch, i) => {
        const a = Math.floor(cum / W * F.length); cum += wt[i];
        const b = Math.max(a + 1, Math.floor(cum / W * F.length));
        const seg = F.slice(a, b).length ? F.slice(a, b) : [F[Math.min(F.length - 1, a)]];
        const sts = seg.map(s => s.st).filter(v => v !== null);
        return {
          ch, d, caps,
          // mostly the word's loudness, partly the letter's own, so quiet consonants don't drop out
          loud: clamp(0.65 * wordLoud + 0.35 * this.loudStat.z(pct(seg.map(s => s.db), 0.75)), -2.5, 3),
          pitch: sts.length ? clamp(this.pitchStat.z(median(sts)), -2.5, 2.5) : 0
        };
      });
    }
    _shape(s) {
      return {
        ch: s.caps ? s.ch.toUpperCase() : s.ch,
        wght: clamp(420 + s.loud * 240, 100, 1000),        // louder → heavier
        wdth: clamp(100 + (s.d - 1) * 50, 25, 151),        // slower → wider
        sx: s.d > 2 ? clamp(1 + (s.d - 2) * 0.5, 1, 4) : 1,// past the widest width: stretch the outline
        sy: clamp(1 + s.loud * 0.1, 0.8, 1.4),             // louder → taller
        dy: clamp(-s.pitch * 0.14, -0.35, 0.35),           // higher → lifted (per letter, so contour draws a line)
        op: clamp(0.55 + (s.loud + 2) * 0.18, 0.3, 1)      // softer → fainter
      };
    }
    _glyph(ch, wght, wdth) {
      wght = Math.round(wght / 20) * 20; wdth = Math.round(wdth / 4) * 4;
      const key = ch + '|' + wght + '|' + wdth;
      let g = this.glyphs.get(key); if (g) return g;
      const ik = wght + '|' + wdth;
      let f = this.instances.get(ik);
      if (!f) { if (this.instances.size > 600) this.instances.clear(); f = this.font.getVariation({ wght, wdth }); this.instances.set(ik, f); }
      const gl = f.glyphForCodePoint(ch.codePointAt(0));
      g = { d: gl.path.toSVG(), adv: gl.advanceWidth };
      if (this.glyphs.size > 20000) this.glyphs.clear();
      this.glyphs.set(key, g); return g;
    }
    // Type size is set by the word limit, so the canvas fills as you approach it rather than
    // rescaling as you go. It only shrinks if very stretched words would run off the canvas.
    _baseEm() {
      const o = this.opts, key = o.maxWords + '|' + o.canvasW + '|' + o.canvasH + '|' + o.margin + '|' + o.lineGap;
      if (this._emKey === key) return this._em;
      const m = o.canvasW * o.margin, iw = o.canvasW - 2 * m, ih = o.canvasH - 2 * m;
      let em = ih;
      for (; em > 10; em *= 0.98) {
        const perLine = Math.max(1, Math.floor(iw / (em * 2.4)));   // ~2.4 em per average word incl. space
        const lines = Math.ceil(o.maxWords / perLine);
        if (em * 1.15 + (lines - 1) * em * o.lineGap + em * 0.4 <= ih) break;
      }
      this._emKey = key; this._em = em; return em;
    }
    _layoutAt(em) {
      const o = this.opts, W = o.canvasW - 2 * o.canvasW * o.margin, k = em / this.upm;
      const items = this.words.map((word, wi) => {
        const st = word.letters !== undefined ? word.letters : this._letters(word);
        let x = 0; const gl = [];
        [...word.text].forEach((c, i) => {
          const sh = st ? this._shape(st[i]) : { ch: c, wght: 400, wdth: 100, sx: 1, sy: 1, dy: 0, op: 1 };
          const g = this._glyph(sh.ch, sh.wght, sh.wdth);
          gl.push({ d: g.d, x, sx: sh.sx, sy: sh.sy, dy: sh.dy * em, op: sh.op });
          x += g.adv * k * sh.sx;
        });
        // a single word wider than the canvas is squeezed to fit its line
        if (x > W) { const f = W / x; gl.forEach(g => { g.x *= f; g.sx *= f; }); x = W; }
        return { gl, w: x, said: !!st, cur: wi === this.cur, gap: word.gap };
      });
      // word wrap
      let line = 0, x = 0;
      items.forEach((it, i) => {
        const gap = i ? it.gap * em : 0;
        if (i && x + gap + it.w > W) { line++; x = 0; } else x += gap;
        it.x = x; it.y = em * 1.15 + line * em * o.lineGap; x += it.w;
      });
      return { items, k, em, H: em * 1.15 + line * em * o.lineGap + em * 0.4 };
    }
    _layout() {
      const o = this.opts, ih = o.canvasH - 2 * o.canvasW * o.margin;
      let em = this._baseEm(), L = this._layoutAt(em);
      for (let i = 0; i < 12 && L.H > ih; i++) { em *= Math.max(0.8, ih / L.H); L = this._layoutAt(em); }
      return L;
    }
    // Baseline grid: margins, a baseline for every line the canvas can hold, and x-height / cap-height
    // guides, all at the size the type is actually set at.
    _grid(em) {
      const o = this.opts, m = o.canvasW * o.margin, W = o.canvasW, H = o.canvasH, k = em / this.upm;
      const x0 = m, x1 = W - m, lh = em * o.lineGap, first = m + em * 1.15;
      const xh = (this.font.xHeight || 0.52 * this.upm) * k, cap = (this.font.capHeight || 0.71 * this.upm) * k;
      const ln = (y, dash, op) => `<line x1="${x0}" x2="${x1}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke-opacity="${op}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
      const sw = (W / 600).toFixed(2);   // about 1 px on screen, a hairline in print
      const gc = o.gridColor;
      let g = `<g stroke="${gc}" fill="none" stroke-width="${sw}">`;
      g += `<rect x="${m}" y="${m}" width="${W - 2 * m}" height="${H - 2 * m}" stroke-opacity="0.5" stroke-dasharray="6 6"/>`;
      let n = 0;
      for (let y = first; y <= H - m + 0.5; y += lh, n++) {
        g += ln(y, '', 0.9) + ln(y - xh, '4 4', 0.5) + ln(y - cap, '1 4', 0.5);
        g += `<text x="${(m * 0.35).toFixed(1)}" y="${(y + em * 0.02).toFixed(1)}" font-size="${(m * 0.18).toFixed(1)}" fill="${gc}" stroke="none" fill-opacity="0.8" font-family="system-ui,sans-serif">${n + 1}</text>`;
      }
      return g + '</g>';
    }
    typeInfo() {
      const { em } = this._layout(), o = this.opts, ptPerUnit = (8 * 72) / o.canvasW; // at 8 × 10 in
      return { em, pt: em * ptPerUnit, leadingPt: em * o.lineGap * ptPerUnit, shrunk: em < this._baseEm() - 0.5 };
    }
    _markup({ guides, grid = guides && this.showGrid }) {
      const o = this.opts, m = o.canvasW * o.margin;
      const { items, k, em } = this._layout();
      let out = grid ? this._grid(em) : '';
      items.forEach(it => {
        const faint = guides && !it.said && this.mode !== 'free';
        out += `<g${faint ? ' opacity="0.16"' : ''}>`;
        it.gl.forEach(g => {
          out += `<path d="${g.d}" transform="translate(${(m + it.x + g.x).toFixed(1)} ${(m + it.y + g.dy).toFixed(1)}) scale(${(k * g.sx).toFixed(5)} ${(-k * g.sy).toFixed(5)})"${it.said && g.op < 0.99 ? ` fill-opacity="${g.op.toFixed(2)}"` : ''}/>`;
        });
        out += '</g>';
        if (guides && it.cur) out += `<rect x="${(m + it.x).toFixed(1)}" y="${(m + it.y + em * 0.2).toFixed(1)}" width="${Math.max(it.w, em * 0.3).toFixed(1)}" height="${(em * 0.05).toFixed(1)}" style="fill:var(--vt-accent,#2e4bff)"/>`;
      });
      return { out, W: o.canvasW, H: o.canvasH };
    }
    render() {
      this.dirty = false;
      if (!this.svg) return;
      const { out, W, H } = this._markup({ guides: true });
      this.svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      this.svg.innerHTML = `<g fill="currentColor">${out}</g>`;
    }

    /* ----- export ----- */
    exportSVG({ ink = '#111111', bg = null, grid = false } = {}) {
      const { out, W, H } = this._markup({ guides: false, grid });
      return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">` +
        (bg ? `<rect width="${W}" height="${H}" fill="${bg}"/>` : '') + `<g fill="${ink}">${out}</g></svg>`;
    }
    // 4:5 at 8 × 10 in, 300 dpi = 2400 × 3000 px by default
    async exportPNG({ ink = '#111111', bg = '#ffffff', widthIn = 8, dpi = 300, grid = false } = {}) {
      const { canvasW: W, canvasH: H } = this.opts;
      const cw = Math.round(widthIn * dpi), ch = Math.round(cw * H / W);
      const svg = this.exportSVG({ ink, bg, grid }).replace(`width="${W}" height="${H}"`, `width="${cw}" height="${ch}"`);
      const img = new Image();
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      await img.decode();
      const c = document.createElement('canvas'); c.width = cw; c.height = ch;
      c.getContext('2d').drawImage(img, 0, 0, cw, ch);
      return new Promise((res, rej) => c.toBlob(b => b ? res(b) : rej(new Error('export failed')), 'image/png'));
    }
    get full() { return this.words.filter(w => w.done).length >= this.opts.maxWords; }
    setMaxWords(n) {
      this.opts.maxWords = Math.max(1, Math.round(n) || 1);
      if (this.mode !== 'free') this.setPhrase(this.words.map(w => w.text).join(' '));
      else { if (this.listening) this.stop(); this.words.length = Math.min(this.words.length, this.opts.maxWords); this.fixed = Math.min(this.fixed || 0, this.words.length); this.render(); }
    }
  }

  VoiceType.measure = measure;
  global.VoiceType = VoiceType;
})(typeof window !== 'undefined' ? window : globalThis);
