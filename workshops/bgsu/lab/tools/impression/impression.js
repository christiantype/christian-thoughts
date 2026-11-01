/*!
 * Impression — letterpress, struck by the voice.
 * OP/AL Lab prototype.
 *
 * The type is fixed, as metal type is; the voice is the press. How loud a word
 * is said sets how deep it bites into the sheet; whether it is voiced or
 * whispered decides if it carries ink or goes down blind; how long it is held
 * is dwell, and the ink squashes past the letter's edge; a voice that slides in
 * pitch slurs the impression, and a shout bruises the paper.
 *
 * Every word is kept as a strike — its text, its ink, and what the voice did —
 * and the sheet is drawn from the strikes at whatever resolution is asked for,
 * so the screen and the 300 dpi export are the same print.
 *
 *   const im = new Impression({ canvas, overlay, font, onStatus, onLevel, onStrike });
 *   await im.start(); im.stop(); im.back(); im.clear();
 *   im.setPhrase('words to strike');          // empty = free speech
 *   im.set({ ink, stock, size, sensitivity });
 *   await im.exportPNG();                      // Blob, 8 × 10 in at 300 dpi
 *   im.strikeWith('word', stats);              // strike from any source
 */
(function (global) {
  'use strict';

  // The sheet is 8 × 10 in, drawn in units of 1/200 in.
  const SHEET_W = 1600, SHEET_H = 2000, UNITS_PER_PT = 200 / 72;
  const MARGIN_X = 150, MARGIN_TOP = 190, MARGIN_BOTTOM = 210;
  const FRAME_MS = 25;

  const INKS = {
    black: [20, 20, 20], red: [213, 43, 30], blue: [29, 63, 187],
    white: [243, 242, 238], blind: null
  };
  const STOCKS = { white: [244, 244, 240], black: [22, 22, 22] };

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const pct = (a, p) => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * p))]; };
  const mean = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0;
  const sd = a => { if (a.length < 2) return 0; const m = mean(a); return Math.sqrt(mean(a.map(x => (x - m) * (x - m)))); };
  const letterWeight = w => Math.max(1, w.replace(/[^\p{L}\p{N}]/gu, '').length);

  // ── Paper and ink grain: value noise in SHEET units, so a re-render at
  //    another resolution lands every fibre in the same place. ─────────────
  function hash(x, y, s) {
    let h = (x * 374761393 + y * 668265263 + s * 2246822519) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  function vnoise(x, y, s) {
    const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
    const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    const a = hash(ix, iy, s), b = hash(ix + 1, iy, s), c = hash(ix, iy + 1, s), d = hash(ix + 1, iy + 1, s);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  // fine tooth, plus longer fibres laid along the grain of the sheet
  const fibre = (x, y, s) => 0.55 * vnoise(x / 1.3, y / 1.3, s) + 0.45 * vnoise(x / 3.5, y / 11, s + 7);

  // Separable box blur, twice — close enough to a gaussian for paper.
  function blur(src, w, h, r) {
    r = Math.max(1, Math.round(r));
    const tmp = new Float32Array(src.length), out = new Float32Array(src.length);
    const pass = (a, b) => {
      const n = 2 * r + 1;
      for (let y = 0; y < h; y++) {
        const o = y * w; let acc = 0;
        for (let x = -r; x <= r; x++) acc += a[o + clamp(x, 0, w - 1)];
        for (let x = 0; x < w; x++) {
          b[o + x] = acc / n;
          acc += a[o + Math.min(w - 1, x + r + 1)] - a[o + Math.max(0, x - r)];
        }
      }
      for (let x = 0; x < w; x++) {
        let acc = 0;
        for (let y = -r; y <= r; y++) acc += b[clamp(y, 0, h - 1) * w + x];
        for (let y = 0; y < h; y++) {
          a[y * w + x] = acc / n;
          acc += b[Math.min(h - 1, y + r + 1) * w + x] - b[Math.max(0, y - r) * w + x];
        }
      }
    };
    out.set(src); pass(out, tmp); pass(out, tmp);
    return out;
  }

  // ── Listening ────────────────────────────────────────────────────────────
  // Autocorrelation pitch on a 2× decimated buffer (70–450 Hz).
  function detectPitch(b, sr, rms) {
    if (rms < 0.006) return null;
    const n = b.length >> 1, d = new Float32Array(n);
    for (let i = 0; i < n; i++) d[i] = (b[2 * i] + b[2 * i + 1]) * 0.5;
    const r2 = sr / 2, minLag = Math.floor(r2 / 450), maxLag = Math.min(Math.floor(r2 / 70), n - 128);
    let e0 = 0; for (let i = 0; i < n; i++) e0 += d[i] * d[i];
    let best = 0, lag = -1;
    for (let L = minLag; L <= maxLag; L++) {
      let s = 0; const m = n - L;
      for (let i = 0; i < m; i++) s += d[i] * d[i + L];
      s = s / m / (e0 / n);
      if (s > best) { best = s; lag = L; }
    }
    return lag > 0 && best > 0.5 ? r2 / lag : null;
  }
  // Spectral flatness over the speech band: near 0 for a voiced vowel, high for breath.
  function flatness(spec, binHz) {
    const a = Math.max(1, Math.floor(300 / binHz)), b = Math.min(spec.length - 1, Math.floor(6000 / binHz));
    let lg = 0, ar = 0, n = 0;
    for (let i = a; i <= b; i++) { const p = Math.pow(10, spec[i] / 10) + 1e-12; lg += Math.log(p); ar += p; n++; }
    return Math.exp(lg / n) / (ar / n);
  }

  // What the voice did over a run of frames, measured against the room.
  function measureRun(frames) {
    if (!frames.length) return null;
    const floor = pct(frames.map(f => f.floor), 0.5);
    const peak = pct(frames.map(f => f.db), 0.9);
    const voicedF = frames.filter(f => f.hz);
    const sts = voicedF.map(f => f.st);
    // a slide is where the pitch ends up against where it started; folding out
    // octave jumps, which the detector makes and a voice does not
    let slide = 0;
    if (sts.length >= 6) {
      const t = Math.floor(sts.length / 3);
      slide = Math.abs(pct(sts.slice(-t), 0.5) - pct(sts.slice(0, t), 0.5));
      if (slide > 9) slide = Math.abs(slide - 12);
    }
    return {
      peak, lift: peak - floor,
      voiced: voicedF.length / frames.length,
      flat: mean(frames.map(f => f.flat)),
      slide,
      pitch: sts.length ? mean(sts) : null,
      dur: frames.length * FRAME_MS,
      clip: frames.some(f => f.peak > 0.97)
    };
  }

  class Impression {
    constructor({ canvas, overlay = null, font = 'Signifier, Georgia, serif', onStatus = () => {}, onLevel = () => {}, onStrike = () => {} } = {}) {
      this.canvas = canvas; this.overlay = overlay; this.font = font;
      this.onStatus = onStatus; this.onLevel = onLevel; this.onStrike = onStrike;
      this.opts = { ink: 'black', stock: 'white', size: 48, sensitivity: 50 };
      this.strikes = []; this.phrase = []; this.phraseIdx = 0;
      this.listening = false; this.live = 0; this.interim = '';
      this.full = false; this.seed = 1;
      this.pitchM = null;               // the speaker's own middle, learned as they speak
      canvas.width = SHEET_W; canvas.height = SHEET_H;
      if (overlay) { overlay.width = SHEET_W; overlay.height = SHEET_H; }
      this._m = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
      this.render();
    }

    static get canTranscribe() { return !!(global.SpeechRecognition || global.webkitSpeechRecognition); }
    get mode() { return this.phrase.length ? 'phrase' : 'free'; }

    set(o) {
      const relayout = ('size' in o && o.size !== this.opts.size) || ('stock' in o && o.stock !== this.opts.stock);
      Object.assign(this.opts, o);
      if (relayout) this.render(); else this._drawOverlay();
    }
    setPhrase(text) {
      this.phrase = String(text || '').trim().split(/\s+/).filter(Boolean);
      this.phraseIdx = 0; this._drawOverlay();
    }
    back() { this.strikes.pop(); this.render(); }
    clear() { this.strikes = []; this.phraseIdx = 0; this.loudM = this.pitchM = null; this.render(); }

    // ── the microphone ─────────────────────────────────────────────────────
    async start() {
      if (this.listening) return;
      if (this.mode === 'free' && !Impression.canTranscribe) {
        const e = new Error('no recognition'); e.name = 'NoSpeechRecognition'; throw e;
      }
      // the press reads the real loudness, so the browser must not even it out
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
      });
      const AC = global.AudioContext || global.webkitAudioContext;
      this.ac = new AC();
      const src = this.ac.createMediaStreamSource(this.stream);
      this.an = this.ac.createAnalyser(); this.an.fftSize = 2048; this.an.smoothingTimeConstant = 0;
      src.connect(this.an);
      this.buf = new Float32Array(this.an.fftSize);
      this.spec = new Float32Array(this.an.frequencyBinCount);
      this.hist = []; this.log = []; this.cursor = performance.now(); this.burst = null; this.quiet = 0;
      this.listening = true;
      this.timer = setInterval(() => this._tick(), FRAME_MS);
      if (this.mode === 'free') this._listenWords();
      this.onStatus(this.mode === 'free' ? 'transcribing' : 'phrase', this.phrase[this.phraseIdx]);
    }
    stop() {
      this.listening = false;
      clearInterval(this.timer);
      if (this.rec) { try { this.rec.onend = null; this.rec.abort(); } catch (e) {} this.rec = null; }
      if (this.stream) this.stream.getTracks().forEach(t => t.stop());
      if (this.ac) this.ac.close().catch(() => {});
      this.stream = this.ac = null; this.live = 0; this.interim = '';
      this.onLevel({ db: -100, live: 0 });
      this._drawOverlay();
      this.onStatus('stopped');
    }

    _listenWords() {
      const SR = global.SpeechRecognition || global.webkitSpeechRecognition;
      const rec = this.rec = new SR();
      rec.continuous = true; rec.interimResults = true; rec.lang = navigator.language || 'en-US';
      rec.onresult = e => {
        let interim = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) this._final(r[0].transcript); else interim += r[0].transcript;
        }
        this.interim = interim.trim();
      };
      rec.onerror = e => { if (e.error !== 'no-speech' && e.error !== 'aborted') this.onStatus('error', e.error); };
      // the browser ends a session after a silence; the press keeps listening
      rec.onend = () => { if (this.listening && this.rec === rec) try { rec.start(); } catch (e) {} };
      rec.start();
    }

    // One 25 ms frame.
    _tick() {
      const an = this.an, b = this.buf;
      an.getFloatTimeDomainData(b); an.getFloatFrequencyData(this.spec);
      let sum = 0, pk = 0;
      for (let i = 0; i < b.length; i++) { sum += b[i] * b[i]; const a = Math.abs(b[i]); if (a > pk) pk = a; }
      const rms = Math.sqrt(sum / b.length), db = 20 * Math.log10(rms + 1e-9);
      const hz = detectPitch(b, this.ac.sampleRate, rms);
      const flat = flatness(this.spec, this.ac.sampleRate / an.fftSize);
      this.feed({ db, hz, flat, peak: pk });
    }

    // Push one frame from any source: { db, hz (or null), flat, peak }.
    feed({ db, hz = null, flat = 0.1, peak = 0 }) {
      const now = performance.now();
      // the room = a low percentile of the last three seconds, so it follows the room
      // without being dragged up by the speech in it
      this.hist.push(db); if (this.hist.length > 120) this.hist.shift();
      // no real microphone is quieter than this; digital silence would make every word a shout
      const floor = Math.max(-66, pct(this.hist, 0.1));
      const open = 15 - this.opts.sensitivity * 0.08;       // dB over the room to count as speech
      const f = { t: now, db, hz, st: hz ? 12 * Math.log2(hz / 110) : null, flat, peak, floor };
      f.on = db > floor + open * 0.6 && db > -64;
      this.log.push(f);
      while (this.log.length && now - this.log[0].t > 20000) this.log.shift();

      this.live = clamp((db - floor - 6) / this._span(), 0, 1) * (f.on ? 1 : 0.3);
      this.onLevel({ db, live: this.live });

      // phrase mode: a burst of voice ending in a pause is one strike
      if (this.mode === 'phrase') {
        if (!this.burst) {
          if (db > floor + open && db > -64) { this.burst = [f]; this.quiet = 0; }
        } else {
          this.burst.push(f);
          this.quiet = db < floor + open * 0.5 ? this.quiet + FRAME_MS : 0;
          if (this.quiet >= 170 || this.burst.length * FRAME_MS > 4000) {
            const frames = this.burst.slice(0, this.burst.length - Math.round(this.quiet / FRAME_MS));
            this.burst = null;
            if (frames.length >= 3) this._strikePhrase(measureRun(frames));
          }
        }
      }
      this._drawOverlay();
    }

    _span() { return 40 - this.opts.sensitivity * 0.24; }

    _strikePhrase(m) {
      if (this.phraseIdx >= this.phrase.length) { this.onStatus('spent'); return; }
      this.strikeWith(this.phrase[this.phraseIdx++], m);
      this.onStatus(this.phraseIdx >= this.phrase.length ? 'spent' : 'phrase', this.phrase[this.phraseIdx]);
    }

    // The recognizer gives words but no timings. Split the voiced audio since the
    // last result into runs at its pauses, then merge or split runs until there is
    // one per word, and give each word its run.
    _final(text) {
      const words = text.trim().split(/\s+/).filter(Boolean);
      if (!words.length) return;
      const frames = this.log.filter(f => f.t > this.cursor);
      this.cursor = performance.now();
      let runs = [], cur = null, gap = 0;
      frames.forEach(f => {
        if (f.on) { if (!cur) { cur = []; runs.push(cur); } cur.push(f); gap = 0; }
        else if (cur && ++gap > 2) cur = null;
      });
      runs = runs.filter(r => r.length >= 2);
      if (!runs.length) runs = [frames.length ? frames : [{ db: -70, floor: -70, hz: null, flat: 0.3, peak: 0 }]];
      while (runs.length > words.length) {
        let k = 0, g = Infinity;
        for (let i = 0; i < runs.length - 1; i++) {
          const d = runs[i + 1][0].t - runs[i][runs[i].length - 1].t;
          if (d < g) { g = d; k = i; }
        }
        runs.splice(k, 2, runs[k].concat(runs[k + 1]));
      }
      while (runs.length < words.length) {
        // split the run carrying the most letters per frame, at its quietest middle frame
        let k = 0, best = -1;
        const lettersAt = i => letterWeight(words[Math.min(i, words.length - 1)]);
        runs.forEach((r, i) => { const v = r.length / lettersAt(i); if (r.length >= 4 && v > best) { best = v; k = i; } });
        const r = runs[k];
        if (r.length < 4) { runs.push(r); continue; }
        let at = r.length >> 1, lo = Infinity;
        for (let i = Math.floor(r.length * 0.3); i < Math.ceil(r.length * 0.7); i++) if (r[i].db < lo) { lo = r[i].db; at = i; }
        runs.splice(k, 1, r.slice(0, at), r.slice(at));
      }
      words.forEach((w, i) => this.strikeWith(w, measureRun(runs[i])));
    }

    // ── one strike ────────────────────────────────────────────────────────
    // The voice, read as a press.
    _press(m) {
      // Pressure is read against how loud this speaker usually is, so a normal
      // word is a normal impression whatever the microphone, and the press
      // answers to the voice getting louder or softer, not to the room.
      const mid = this.loudM == null ? m.peak : this.loudM;
      this.loudM = mid * 0.8 + m.peak * 0.2;
      const pressure = clamp(0.5 + (m.peak - mid) / 22 + (this.opts.sensitivity - 50) / 160, 0.05, 1);
      const whisper = m.voiced < 0.18 || (m.voiced < 0.3 && m.flat > 0.25);
      const inkLevel = this.opts.ink === 'blind' || whisper ? 0 : clamp(0.3 + m.voiced * 1.1, 0, 1) * (0.5 + 0.5 * pressure);
      const over = (m.peak - mid - 9) / 8 + (m.clip ? 0.5 : 0);
      let tilt = 0;
      if (m.pitch != null) {
        this.pitchM = this.pitchM == null ? m.pitch : this.pitchM * 0.85 + m.pitch * 0.15;
        tilt = clamp((m.pitch - this.pitchM) * 0.25, -1.4, 1.4);
      }
      return {
        pressure, inkLevel, blind: inkLevel === 0,
        squash: clamp((m.dur - 200) / 700, 0, 1),
        slur: clamp((m.slide - 1.5) / 5, 0, 1),
        bruise: over > 0 || m.clip ? clamp(over, 0.3, 1) : 0,
        tilt
      };
    }

    strikeWith(text, m) {
      if (this.full || !text) return;
      const p = this._press(m || { peak: -30, lift: 25, voiced: 0.8, flat: 0.05, slide: 0, pitch: null, dur: 300, clip: false });
      const s = { text, ink: this.opts.ink, seed: this.seed++, ...p, raw: m };
      this.strikes.push(s);
      if (!this._layout()) { this.strikes.pop(); this.full = true; this.onStatus('full'); return; }
      this._strikeOnto(this.canvas.getContext('2d'), 1, s, true);
      this.onStrike(s);
      this._drawOverlay();
    }

    // Set every strike on the sheet at the current size. False if the last one runs off the foot.
    _layout() {
      const size = this.opts.size * UNITS_PER_PT, lead = size * 1.32, space = size * 0.3;
      const ctx = this._m; ctx.font = size + 'px ' + this.font;
      let x = MARGIN_X, y = MARGIN_TOP + size;
      for (const s of this.strikes) {
        const w = ctx.measureText(s.text).width;
        if (x > MARGIN_X && x + w > SHEET_W - MARGIN_X) { x = MARGIN_X; y += lead; }
        s.bx = x; s.by = y; s.w = w;
        x += w + space;
      }
      this._next = { x, y, size, lead };
      return y <= SHEET_H - MARGIN_BOTTOM;
    }

    // Where the next word would go: same line if it fits, else the next.
    _nextAt(text) {
      const n = this._next, w = (this._m.font = n.size + 'px ' + this.font, this._m.measureText(text).width);
      if (n.x > MARGIN_X && n.x + w > SHEET_W - MARGIN_X) return { x: MARGIN_X, y: n.y + n.lead };
      return { x: n.x, y: n.y };
    }

    render(canvas = this.canvas, scale = 1) {
      this.full = !this._layout() && this.strikes.length > 0;
      const ctx = canvas.getContext('2d');
      const W = canvas.width, H = canvas.height, img = ctx.createImageData(W, H), d = img.data;
      const base = STOCKS[this.opts.stock], amp = this.opts.stock === 'black' ? 7 : 9;
      for (let y = 0; y < H; y++) {
        const uy = y / scale;
        for (let x = 0; x < W; x++) {
          const n = (fibre(x / scale, uy, 0) - 0.5) * amp, i = (y * W + x) * 4;
          d[i] = base[0] + n; d[i + 1] = base[1] + n; d[i + 2] = base[2] + n * 1.1; d[i + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
      for (const s of this.strikes) this._strikeOnto(ctx, scale, s, false);
      if (canvas === this.canvas) this._drawOverlay();
    }

    // Press one word into whatever is already on the sheet.
    _strikeOnto(ctx, k, s, animate) {
      const size = this.opts.size * UNITS_PER_PT * k;
      const m = this._m; m.font = size + 'px ' + this.font;
      const tm = m.measureText(s.text);
      const asc = Math.ceil(tm.actualBoundingBoxAscent || size * 0.75), desc = Math.ceil(tm.actualBoundingBoxDescent || size * 0.25);
      const pad = Math.ceil(size * 0.4);
      const w = Math.ceil(tm.width + pad * 2), h = asc + desc + pad * 2;
      const X = Math.round(s.bx * k - pad), Y = Math.round(s.by * k - asc - pad);

      // the face of the type, as a mask
      m.canvas.width = w; m.canvas.height = h;
      m.font = size + 'px ' + this.font;
      m.clearRect(0, 0, w, h); m.fillStyle = '#fff';
      m.save(); m.translate(w / 2, h / 2); m.rotate(s.tilt * Math.PI / 180); m.translate(-w / 2, -h / 2);
      m.fillText(s.text, pad, pad + asc); m.restore();
      const md = m.getImageData(0, 0, w, h).data, mask = new Float32Array(w * h);
      for (let i = 0; i < mask.length; i++) mask[i] = md[i * 4 + 3] / 255;

      const P = s.pressure, Q = s.squash;
      const rWall = Math.max(1, size * 0.016 * (0.6 + P));      // how soft the walls of the bite are
      const wall = blur(mask, w, h, rWall);
      const pillow = blur(mask, w, h, size * 0.09);               // the paper dragged down around the letters
      const edge = blur(mask, w, h, Math.max(1, size * 0.007));
      const spread = blur(mask, w, h, Math.max(1, size * (0.006 + 0.022 * Q)));

      const depth = (0.3 + 1.3 * P) * (1 + 0.8 * s.bruise);
      const hgt = new Float32Array(w * h);
      for (let i = 0; i < hgt.length; i++) hgt[i] = depth * (0.82 * wall[i] + 0.3 * pillow[i] * (1 + s.bruise));

      const inkRGB = INKS[s.ink];
      const C = inkRGB && !s.blind ? s.inkLevel : 0;
      const thr = 0.5 - 0.22 * Q;
      const slurPx = Math.round(size * 0.05 * s.slur);
      const stockDark = this.opts.stock === 'black';

      const x0 = Math.max(0, X), y0 = Math.max(0, Y), x1 = Math.min(ctx.canvas.width, X + w), y1 = Math.min(ctx.canvas.height, Y + h);
      if (x1 <= x0 || y1 <= y0) return;
      const region = ctx.getImageData(x0, y0, x1 - x0, y1 - y0), rd = region.data, RW = x1 - x0;
      const before = animate ? new ImageData(new Uint8ClampedArray(rd), RW, y1 - y0) : null;

      for (let yy = y0; yy < y1; yy++) {
        const y = yy - Y;
        for (let xx = x0; xx < x1; xx++) {
          const x = xx - X, i = y * w + x;
          const o = ((yy - y0) * RW + (xx - x0)) * 4;
          // light from the top left: a wall facing it is lit, one facing away is in shadow
          const a = hgt[Math.max(0, i - w - 1)], b = hgt[Math.min(hgt.length - 1, i + w + 1)];
          const g = (a - b) * rWall * 0.5;
          const shadow = clamp(-g, 0, 1) * (stockDark ? 0.5 : 0.42) + 0.035 * depth * wall[i];
          const light = clamp(g, 0, 1) * (stockDark ? 0.16 : 0.5);

          let ink = 0;
          if (C > 0) {
            const n = fibre(xx / k, yy / k, s.seed);
            // a starved forme leaves the fibres showing; the floor of a deep bite takes ink best
            const keep = clamp((n + C * 1.1 - 0.78 + 0.12 * wall[i]) / 0.22, 0, 1);
            const inkM = smooth(thr - 0.12, thr + 0.12, spread[i]);
            const ring = inkM * (1 - smooth(0.55, 0.92, edge[i])) * Q * (0.4 + P);
            ink = clamp(inkM * keep * 0.92 + ring * 0.35, 0, 0.96);
            // a slur is the sheet dragging under the forme: the ink smeared along
            // the line, fading as it goes — a copy laid beside it would read as a shadow
            if (slurPx) {
              let acc = 0, n = 0;
              for (let d = 1; d <= 6; d++) {
                const dx = Math.round(slurPx * d / 6);
                if (x - dx < 0) break;
                acc += smooth(thr - 0.12, thr + 0.12, spread[i - dx]) * (1 - d / 7); n++;
              }
              const sl = n ? acc / 6 * keep * 0.55 * s.slur : 0;
              ink = 1 - (1 - ink) * (1 - sl);
            }
          }
          for (let c = 0; c < 3; c++) {
            let v = rd[o + c];
            v = v * (1 - shadow);
            v = v + (255 - v) * light;
            if (ink) v = v + (inkRGB[c] - v) * ink;
            rd[o + c] = v;
          }
        }
      }
      ctx.putImageData(region, x0, y0);
      if (animate && this.overlay) this._fade(before, x0, y0);
    }

    // The sheet already holds the new strike; the paper as it was fades off it.
    _fade(before, x, y) {
      const c = document.createElement('canvas'); c.width = before.width; c.height = before.height;
      c.getContext('2d').putImageData(before, 0, 0);
      (this._fades || (this._fades = [])).push({ c, x, y, t0: performance.now() });
      const run = () => { this._drawOverlay(); if (this._fades.length) requestAnimationFrame(run); };
      requestAnimationFrame(run);
    }

    // The overlay: paper fading off fresh strikes, and the next word waiting in the forme.
    _drawOverlay() {
      const o = this.overlay; if (!o || !this._next) return;
      const ctx = o.getContext('2d'); ctx.clearRect(0, 0, o.width, o.height);
      const now = performance.now();
      this._fades = (this._fades || []).filter(f => {
        const t = (now - f.t0) / 220; if (t >= 1) return false;
        ctx.globalAlpha = 1 - t * t; ctx.drawImage(f.c, f.x, f.y); return true;
      });
      ctx.globalAlpha = 1;
      if (this.full) return;
      const word = this.mode === 'phrase' ? this.phrase[this.phraseIdx] : this.interim;
      if (!word) return;
      const at = this._nextAt(word.split(/\s+/)[0]);
      const rgb = INKS[this.opts.ink] || (this.opts.stock === 'black' ? [240, 240, 240] : [20, 20, 20]);
      ctx.font = this._next.size + 'px ' + this.font;
      ctx.fillStyle = 'rgb(' + rgb.join(',') + ')';
      ctx.globalAlpha = 0.07 + (this.listening ? 0.3 * this.live : 0);
      ctx.fillText(word, at.x, at.y);
      ctx.globalAlpha = 1;
    }

    // 8 × 10 in at 300 dpi: the sheet drawn again from its strikes, not scaled up.
    exportPNG() {
      const c = document.createElement('canvas');
      c.width = SHEET_W * 1.5; c.height = SHEET_H * 1.5;
      this.render(c, 1.5);
      return new Promise((res, rej) => c.toBlob(b => b ? res(b) : rej(new Error('toBlob')), 'image/png'));
    }
  }

  Impression.INKS = INKS; Impression.STOCKS = STOCKS;
  Impression.SHEET = { w: SHEET_W, h: SHEET_H };
  global.Impression = Impression;
})(window);
