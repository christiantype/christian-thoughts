/* ───────────────────────────────────────────────────────────────────────────
   Sound — the ground.

   Six backgrounds, drawn from the Alva Noto / Carsten Nicolai language:
   flat saturated colour on black, hard edges, no gradients and no easing.
   Everything is quantised before it is drawn, so values jump between states
   instead of sliding through them. That is the difference between this and a
   music player's visualiser, and it is mostly arithmetic rather than taste:

     • the analyser is barely smoothed — 0.35, against the 0.8 that makes a
       picture glide;
     • every number is snapped to a step — whole pixels, a 4px rail, an
       integer number of lobes, one of eight curvatures;
     • colour comes from a fixed six-stop ramp and is never blended. A band
       is one of the six, flat, or it is not drawn.

   Four of the six invert the page to black while they run, because that is
   what the work they come from does — flat colour needs a black ground to be
   saturated against. The page returns to white when the sound stops.

   The ground and the accent are drawn fresh on load and on every sketch, so
   the page is never the same twice.

   It reads the one <audio> the page already has, published by the layout as
   window.SOUND_AUDIO, and listens for the 'sketch:open' it fires when a
   different row is pressed.
   ─────────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  var cv = document.getElementById('sound-ground');
  var audio = window.SOUND_AUDIO;
  if (!cv || !audio) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var g = cv.getContext('2d');
  if (!g) return;

  /* Six flat colours, rolled fresh every time a ground is chosen. Nothing is
     ever mixed between them — a band is one of the six or it is not drawn.

     They are not six random colours. A random hue six times over gives mud
     about half the time, and the whole point of a flat palette is that the
     six read as a set. So one hue is drawn at random, and the other five are
     walked around the wheel from it by a random distance in a random
     direction, at one saturation. That keeps the set coherent and still
     makes a different palette on every load — the span can be narrow enough
     to be almost one colour or wide enough to cross the whole wheel. */
  var RGB = [], accent = '#ff2d16';

  function hsl(h, sat, li) {
    h = ((h % 360) + 360) % 360; sat /= 100; li /= 100;
    var c = (1 - Math.abs(2 * li - 1)) * sat;
    var x = c * (1 - Math.abs((h / 60) % 2 - 1));
    var m = li - c / 2, r = 0, g2 = 0, b2 = 0;
    if (h < 60)       { r = c; g2 = x; }
    else if (h < 120) { r = x; g2 = c; }
    else if (h < 180) { g2 = c; b2 = x; }
    else if (h < 240) { g2 = x; b2 = c; }
    else if (h < 300) { r = x;  b2 = c; }
    else              { r = c;  b2 = x; }
    return [Math.round((r + m) * 255), Math.round((g2 + m) * 255), Math.round((b2 + m) * 255)];
  }

  function rollPalette() {
    var base = Math.random() * 360;
    var span = 70 + Math.random() * 250;          // how far round it travels
    var dir  = Math.random() < 0.5 ? 1 : -1;
    var sat  = 72 + Math.random() * 26;           // saturated, always
    RGB = [];
    for (var i = 0; i < 6; i++) {
      /* Lightness climbs across the ramp so the six stay separable even
         when the span is narrow and the hues are nearly the same. */
      RGB.push(hsl(base + dir * span * (i / 5), sat, 40 + (i / 5) * 26));
    }
    /* The accent is off the same wheel but away from the ramp, so the one
       mark that has to be found — the playing row, the sweep arm — is never
       the same colour as the field behind it. */
    accent = 'rgb(' + hsl(base + dir * (span + 120 + Math.random() * 110), 92, 54).join(',') + ')';
  }

  /* name, label, wants a black page */
  /* No bars anywhere. Nothing is struck from the left edge and nothing
     stands up off the bottom — every ground here is a curve, a field, a
     shape or a sweep. The three that were bars (rails from the left, colour
     rails, columns from the floor) are gone rather than softened; a bar made
     quieter is still a bar. */
  var MODES = [
    ['hybrid',  'Hybrid',   false],   // the pucker/bloat: one hard shape
    ['stereo',  'Stereo',   true],    // left against right, a Lissajous
    ['fills',   'Fills',    true],    // flat filled waveforms, scanlined
    ['beads',   'Beads',    true],    // a dot field carried on the waveform
    ['grid',    'Grid',     true],    // posterised spectrogram, flat steps
    ['static',  'Static',   true],    // raster noise, modulated by the sound
    ['pulse',   'Pulse',    true],    // hard rings fired by transients
    ['polar',   'Polar',    true],    // a radial sweep, printing the spectrum
    ['moire',   'Moiré',    true],    // two gratings, interference
    ['traces',  'Traces',   true]     // stacked beaded waveform lines
  ];

  var INK_LIGHT = 0.62;        // how much ink a white ground is allowed
  var INK_DARK  = 1;           // a black ground is the picture, so all of it

  var mode = MODES[0], dark = false;
  var rings = [], lastLv = 0;
  var W = 0, H = 0, DPR = 1;
  var sweep = 0, stamp = null, stc = null, raf = null, angle = 0;
  var ctx, an, aL, aR, freq, wave, wl, wr, wired = false;

  /* `i` picks a ground by hand; left out, one is drawn at random. */
  function reroll(i) {
    mode   = MODES[(i == null) ? (Math.random() * MODES.length) | 0 : (i % MODES.length)];
    rollPalette();
    dark   = mode[2];
    document.documentElement.style.setProperty('--accent', accent);
    /* The ground names itself on the body. It is what the stylesheet would
       hook into if one of them ever needed its own rule, and it is how the
       page can be checked one ground at a time rather than by waiting for
       the random pick to come round. */
    document.body.dataset.ground = mode[0];
    document.body.classList.toggle('wants-dark', dark);
    document.body.classList.toggle('is-dark', dark && !audio.paused);
    document.documentElement.classList.toggle('is-dark', dark && !audio.paused);
    if (label) label.textContent = mode[1];
    if (count) count.textContent = (MODES.indexOf(mode) + 1) + ' / ' + MODES.length;
    reset();
  }

  function reset() {
    sweep = 0; rings = []; lastLv = 0; angle = 0;
    if (stc) stc.clearRect(0, 0, stamp.width, stamp.height);
    g.clearRect(0, 0, W, H);
  }

  function size() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = cv.clientWidth; H = cv.clientHeight;
    if (!W || !H) return;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    g.setTransform(DPR, 0, 0, DPR, 0, 0);
    /* The spectrogram's paper is a second canvas at 1:1, because it scrolls
       by copying itself sideways and that copy must land on whole pixels. */
    stamp = document.createElement('canvas');
    stamp.width = Math.max(1, Math.round(W)); stamp.height = Math.max(1, Math.round(H));
    stc = stamp.getContext('2d');
    reset();
  }

  function wire() {
    if (wired) return true;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    wired = true;
    ctx = new AC();
    var src = ctx.createMediaElementSource(audio);  // once per element, ever
    an = ctx.createAnalyser();
    an.fftSize = 2048;
    an.smoothingTimeConstant = 0.35;
    /* The analyser is a pass-through and the only path to the speakers.
       Routing an element into Web Audio without reaching ctx.destination is
       how a player goes silent. */
    src.connect(an); an.connect(ctx.destination);
    /* A second tap, split to the two channels, for the Lissajous. It is
       deliberately dead-ended: connecting it to the destination as well
       would play everything twice and six decibels louder. */
    var sp = ctx.createChannelSplitter(2); src.connect(sp);
    aL = ctx.createAnalyser(); aL.fftSize = 2048;
    aR = ctx.createAnalyser(); aR.fftSize = 2048;
    sp.connect(aL, 0); sp.connect(aR, 1);
    freq = new Uint8Array(an.frequencyBinCount);
    wave = new Uint8Array(an.fftSize);
    wl = new Float32Array(aL.fftSize); wr = new Float32Array(aR.fftSize);
    return true;
  }

  /* Logarithmic bands. Read linearly, the bottom octave gets two pixels and
     four fifths of the window is hiss nobody can hear. */
  function bands(n, peak) {
    var out = new Array(n);
    for (var b = 0; b < n; b++) {
      var lo = Math.floor(Math.pow(freq.length, b / n));
      var hi = Math.floor(Math.pow(freq.length, (b + 1) / n));
      var v = 0, c = 0;
      for (var k = lo; k <= Math.min(hi, freq.length - 1); k++) {
        if (peak) v = Math.max(v, freq[k]); else { v += freq[k]; c++; }
      }
      out[b] = (peak ? v : (c ? v / c : 0)) / 255;
    }
    return out;
  }
  function snap(v, step) { return Math.round(v / step) * step; }
  function level() { var s = 0; for (var i = 0; i < freq.length; i++) s += freq[i];
                     return s / freq.length / 255; }
  /* Where the weight of the sound is sitting, 0 low to 1 high. It is what
     decides how many lobes the shape has, so the figure changes when the
     music changes register and not merely when it gets louder. */
  function centroid() {
    var num = 0, den = 0;
    for (var i = 0; i < freq.length; i++) { num += i * freq[i]; den += freq[i]; }
    return den ? (num / den) / freq.length : 0;
  }

  /* Gielis's superformula, with all four exponents live rather than three of
     them pinned at 1.

     n2 and n3 are what make it organic. Held at 1 the equation draws
     straight edges meeting at hard points — a vector star, which is what
     this was. Let them move, and let them differ from each other, and the
     edges bow: concave on one axis, swollen on the other, the two never
     quite agreeing. m is left as a real number too, so the lobes do not
     close evenly and the figure is never symmetrical about itself. */
  function superR(th, m, n1, n2, n3) {
    var t1 = Math.pow(Math.abs(Math.cos(m * th / 4)), n2);
    var t2 = Math.pow(Math.abs(Math.sin(m * th / 4)), n3);
    return Math.pow(t1 + t2, -1 / n1);
  }

  /* The figure's parameters are eased toward their targets rather than set
     to them. Snapping was right when the whole page snapped; a thing that is
     meant to read as alive cannot teleport between shapes. */
  var hy = { m: 4, n1: 1, n2: 1, n3: 1, R: 0.3, spin: 0 };
  function ease(a, b, k) { return a + (b - a) * k; }

  function flat(i) { var c = RGB[i % RGB.length]; return 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')'; }

  var BLACK = '#0a0a0a';

  function draw() {
    raf = requestAnimationFrame(draw);
    if (!an) return;
    /* A pause leaves the last frame on the glass — it is the picture of what
       you just heard, and blanking it the instant you stop would clear the
       screen at exactly the moment you are looking at it. */
    if (audio.paused) { cancelAnimationFrame(raf); raf = null; return; }

    an.getByteFrequencyData(freq);
    an.getByteTimeDomainData(wave);
    g.setTransform(DPR, 0, 0, DPR, 0, 0);
    g.clearRect(0, 0, W, H);
    g.imageSmoothingEnabled = false;
    if (dark) { g.fillStyle = '#000'; g.fillRect(0, 0, W, H); }
    g.globalAlpha = dark ? INK_DARK : INK_LIGHT;

    var name = mode[0];

    /* ── the pucker / bloat ──────────────────────────────────────────────
       One hard black figure in the middle of a white page. Loud and bright
       bloats it round; quiet and low puckers it into cusps. */
    if (name === 'hybrid') {
      /* Solid black, not the 0.62 the other light ground uses. The work this
         comes from is one hard figure on a white page — at any less than full
         ink it stops being a shape and becomes a shadow of one. */
      g.globalAlpha = 1;
      var lv = level(), cen = centroid();

      /* Fourteen bands, smoothed around the circle twice, then read back
         with cosine interpolation. Three things had to be true for the
         ripple to read as a living edge rather than as gravel:

           — few bands. Forty-eight of them put a crag every seven degrees
             and the figure turned into a potato.
           — smoothed CIRCULARLY. The first band sits next to the last on a
             closed curve; unsmoothed across that join the outline had a
             visible seam at three o'clock.
           — interpolated between, not stepped. A stepped read gives facets,
             and a facet is the one thing an organic edge cannot have.      */
      var NB = 14, hb = bands(NB, false);
      for (var pass = 0; pass < 2; pass++) {
        var cp = hb.slice();
        for (var bi = 0; bi < NB; bi++) {
          hb[bi] = (cp[(bi - 1 + NB) % NB] + 2 * cp[bi] + cp[(bi + 1) % NB]) / 4;
        }
      }
      function bandAt(u) {
        var f = u * NB, i0 = Math.floor(f) % NB, i1 = (i0 + 1) % NB;
        var tt = (1 - Math.cos((f - Math.floor(f)) * Math.PI)) / 2;
        return hb[i0] * (1 - tt) + hb[i1] * tt;
      }

      /* Targets, then eased toward. Nothing here is quantised any more:
         a figure that is meant to breathe cannot jump between states. */
      /* n1 is kept low. Allowed to run up past 2 it bloats the outline into
         one mass and the lobes stop reading at all — which is what "organic"
         must not mean. Held under about 1.8 the limbs stay separate and the
         figure pinches between them. */
      hy.m  = ease(hy.m,  2.6 + cen * 5.5,    0.035);
      hy.n1 = ease(hy.n1, 0.32 + lv * 1.5,    0.045);
      hy.n2 = ease(hy.n2, 0.55 + hb[2]  * 1.6, 0.05);   // the low end bows
      hy.n3 = ease(hy.n3, 0.55 + hb[10] * 1.6, 0.05);   // the top end bows
      hy.R  = ease(hy.R,  0.16 + lv * 0.38,   0.09);
      hy.spin += 0.0012 + lv * 0.008;

      var R  = Math.min(W, H) * hy.R;
      var cx = W / 2, cy = H * 0.66, STEPS = 540, max = 0, pts = [];
      var t = performance.now() / 1000;

      for (var si = 0; si < STEPS; si++) {
        var u  = si / STEPS;
        var th = u * Math.PI * 2;
        var r = superR(th, hy.m, hy.n1, hy.n2, hy.n3);
        if (!isFinite(r)) r = 0;

        /* The spectrum pushes the boundary out where its energy is, gently.
           This is what stops the figure being a formula — the edge swells
           where the sound is, so the same shape never draws twice. */
        r *= 1 + bandAt(u) * 0.26;

        /* And a slow wander on three periods that do not divide into each
           other, so it is never symmetrical about itself and never repeats. */
        r *= 1 + 0.05 * Math.sin(th * 2 + t * 0.31)
               + 0.035 * Math.sin(th * 3 - t * 0.17)
               + 0.02 * Math.sin(th * 5 + t * 0.11);

        if (r > max) max = r;
        pts.push([th + hy.spin, r]);
      }

      /* Drawn through the midpoints as quadratics rather than joined
         straight. Even at 540 samples a polyline keeps a faint faceting on
         the long flanks, and faceting is the one thing an organic outline
         cannot have. */
      var XY = pts.map(function (q) {
        var rr = q[1] / (max || 1) * R;
        return [cx + Math.cos(q[0]) * rr, cy + Math.sin(q[0]) * rr];
      });
      g.beginPath();
      var last = XY[XY.length - 1], first = XY[0];
      g.moveTo((last[0] + first[0]) / 2, (last[1] + first[1]) / 2);
      for (var pi2 = 0; pi2 < XY.length; pi2++) {
        var cur = XY[pi2], nxt = XY[(pi2 + 1) % XY.length];
        g.quadraticCurveTo(cur[0], cur[1], (cur[0] + nxt[0]) / 2, (cur[1] + nxt[1]) / 2);
      }
      g.closePath();
      g.fillStyle = BLACK; g.fill();
      /* One hairline ring at the figure's resting size, so you can read how
         far it has swollen past it. */
      g.strokeStyle = accent; g.lineWidth = 1;
      g.beginPath(); g.arc(cx, cy, Math.min(W, H) * 0.22, 0, Math.PI * 2); g.stroke();

    /* ── left against right: a Lissajous ─────────────────────────────────
       The literal stereo image of the recording. An H6's XY capsule is what
       you are looking at — a correlated passage collapses to a diagonal, a
       wide one opens into a disc. One continuous curve, never a bar. */
    } else if (name === 'stereo') {
      aL.getFloatTimeDomainData(wl); aR.getFloatTimeDomainData(wr);
      var cxs = W / 2, cys = H / 2, S = Math.min(W, H) * 0.42;
      /* Auto-gain, the way a real scope has it. Drawn at true amplitude a
         field recording at -30 LUFS is a three-pixel smudge in the middle of
         a black window — honest and useless. The figure is scaled to its own
         peak instead, so the SHAPE is what is read: the level is already a
         number on the row above. The floor stops silence being amplified
         into a full-screen scribble. */
      var pk = 0;
      for (var pq = 0; pq < wl.length; pq += 4) {
        var av = Math.abs(wl[pq]); if (av > pk) pk = av;
        var bv = Math.abs(wr[pq]); if (bv > pk) pk = bv;
      }
      S = S / Math.max(pk, 0.04);
      g.strokeStyle = '#fff'; g.lineWidth = 1.2; g.beginPath();
      for (var si = 0; si < wl.length; si++) {
        var xs = cxs + wl[si] * S, ys = cys - wr[si] * S;
        si ? g.lineTo(xs, ys) : g.moveTo(xs, ys);
      }
      g.stroke();
      /* The two axes, so the figure has something to be read against. */
      /* The axes stay at a fixed size — they are the frame the figure is
         read against, and scaling them with it would hide the auto-gain. */
      var AX = Math.min(W, H) * 0.42;
      g.strokeStyle = accent; g.lineWidth = 1;
      g.beginPath(); g.moveTo(cxs - AX, cys); g.lineTo(cxs + AX, cys);
      g.moveTo(cxs, cys - AX); g.lineTo(cxs, cys + AX); g.stroke();

    /* ── flat filled waveforms, overlapping, scanlined ────────────────── */
    } else if (name === 'fills') {
      var LAYERS = 4;
      for (var L = 0; L < LAYERS; L++) {
        var lag2 = L * 457, sc = 0.34 - L * 0.055, mid = H * (0.5 + (L - 1.5) * 0.045);
        g.fillStyle = flat(L * 2 % RGB.length);
        g.beginPath(); g.moveTo(0, mid);
        for (var x2 = 0; x2 <= W; x2 += 3) {
          var wj = Math.floor(x2 / W * (wave.length - 1));
          g.lineTo(x2, mid + (wave[(wj + lag2) % wave.length] - 128) / 128 * H * sc);
        }
        g.lineTo(W, mid); g.closePath(); g.fill();
      }
      /* Scanlines. One pixel on, three off — the thing that makes a flat
         fill read as a screen rather than as a shape. */
      g.fillStyle = 'rgba(0,0,0,.55)';
      for (var sl = 0; sl < H; sl += 4) g.fillRect(0, sl, W, 1);

    /* ── a dot field carried on the waveform ──────────────────────────── */
    } else if (name === 'beads') {
      var SX = 14, SY = 12, lv2 = level();
      for (var bx = 0; bx <= W; bx += SX) {
        var wk = Math.floor(bx / W * (wave.length - 1));
        var centreY = H / 2 + (wave[wk] - 128) / 128 * H * 0.30;
        for (var k2 = -9; k2 <= 9; k2++) {
          var by = centreY + k2 * SY;
          if (by < -SY || by > H + SY) continue;
          var fall = 1 - Math.abs(k2) / 10;              // thins away from the crest
          /* The base was 0.25, which meant silence still drew the whole
             field as a dead straight band. It is the sound that puts the
             dots on the screen, so at nothing there is nothing. */
          var a = fall * fall * (0.03 + lv2 * 2.2);
          if (a < 0.03) continue;
          g.globalAlpha = Math.min(1, a);
          g.fillStyle = (Math.abs(k2) < 2) ? accent : '#fff';
          var rad = Math.abs(k2) < 2 ? 3 : 2;
          g.fillRect(Math.round(bx), Math.round(by), rad, rad);
        }
      }
      g.globalAlpha = 1;

    /* ── posterised spectrogram, flat colour steps ────────────────────── */
    } else if (name === 'grid') {
      var SB = Math.max(24, Math.floor(H / 10)), sb = bands(SB, false);
      var x3 = Math.round(sweep), cw = 4;
      stc.clearRect(x3, 0, cw + 1, stamp.height);
      var rowH = stamp.height / SB;
      for (var s3 = 0; s3 < SB; s3++) {
        var t3 = sb[s3];
        var stepI = Math.floor(t3 * RGB.length);          // six levels, no blend
        if (stepI < 1) continue;
        stc.fillStyle = flat(stepI - 1);
        stc.fillRect(x3, Math.round(stamp.height - (s3 + 1) * rowH), cw, Math.ceil(rowH) - 1);
      }
      sweep = (sweep + cw) % stamp.width;
      g.drawImage(stamp, 0, 0);
      g.fillStyle = accent; g.fillRect(Math.round(sweep), 0, 2, H);

    /* ── raster noise, modulated by the sound ──────────────────────────
       A field of hard cells switched on and off at random, where the odds
       of any one being lit are that band's level. Silence is an empty
       window; a loud passage fills it. It is the only ground here that is
       partly chance, and the chance is bounded by the audio. */
    } else if (name === 'static') {
      var cell = 6, colsN = Math.ceil(W / cell), rowsN = Math.ceil(H / cell);
      var ns = bands(24, false);
      for (var ny = 0; ny < rowsN; ny++) {
        var bandI = Math.floor(ny / rowsN * 24);
        var pOn = ns[23 - bandI] * 0.9;          // low frequencies at the foot
        if (pOn < 0.01) continue;
        for (var nx = 0; nx < colsN; nx++) {
          if (Math.random() > pOn) continue;
          g.fillStyle = (Math.random() < 0.12) ? accent
                      : flat(Math.floor(bandI / 24 * RGB.length));
          g.fillRect(nx * cell, ny * cell, cell - 1, cell - 1);
        }
      }

    /* ── a radial sweep, printing the spectrum ──────────────────────────
       The spectrogram bent into a circle: the sweep goes round once a
       revolution laying the spectrum down the radius, so a whole turn is a
       disc of the last several seconds. Flat colour steps, no blend. */
    } else if (name === 'polar') {
      var cxp2 = stamp.width / 2, cyp2 = stamp.height / 2;
      var RMAX = Math.min(stamp.width, stamp.height) * 0.46;
      var PB = 40, pb2 = bands(PB, false);
      var step2 = Math.PI / 150;
      stc.save();
      stc.translate(cxp2, cyp2); stc.rotate(angle);
      /* Clear the whole wedge once, not once per band — the wedge was being
         erased forty times a frame, each pass covering the one before it. */
      stc.globalCompositeOperation = 'destination-out';
      stc.beginPath(); stc.moveTo(0, 0);
      stc.arc(0, 0, RMAX + 2, -step2, step2); stc.closePath(); stc.fill();
      stc.globalCompositeOperation = 'source-over';
      for (var pi = 0; pi < PB; pi++) {
        var lvl2 = Math.floor(pb2[pi] * RGB.length);
        var r0 = RMAX * pi / PB, r1 = RMAX * (pi + 1) / PB;
        if (lvl2 < 1) continue;
        stc.fillStyle = flat(lvl2 - 1);
        stc.beginPath();
        stc.arc(0, 0, r1, -step2, step2);
        stc.arc(0, 0, r0, step2, -step2, true);
        stc.closePath(); stc.fill();
      }
      stc.restore();
      angle = (angle + step2 * 2) % (Math.PI * 2);
      g.drawImage(stamp, 0, 0);
      /* the sweep arm */
      g.strokeStyle = accent; g.lineWidth = 1;
      g.beginPath(); g.moveTo(W / 2, H / 2);
      g.lineTo(W / 2 + Math.cos(angle) * RMAX, H / 2 + Math.sin(angle) * RMAX);
      g.stroke();

    /* ── hard rings, fired by transients ──────────────────────────────── */
    } else if (name === 'pulse') {
      var lvp = level();
      /* A ring is born on a RISE against a rolling baseline, not on an
         absolute level — so the field answers the hits in the music rather
         than pulsing with its loudness. A fixed threshold against the last
         frame fired almost never on sustained material and left the window
         empty; measuring against where the piece has been sitting fires on
         every real attack and on nothing else. Last line guarantees the
         field is never empty while there is sound in the room. */
      lastLv = lastLv ? lastLv * 0.92 + lvp * 0.08 : lvp;
      if (rings.length < 26 && lvp > 0.015 &&
          (lvp > lastLv * 1.10 || !rings.length)) {
        rings.push({ r: 0, c: Math.floor(centroid() * RGB.length), w: 1 + Math.round(lvp * 6) });
      }
      var cxp = W / 2, cyp = H / 2, lim = Math.hypot(W, H) * 0.6;
      for (var ri = rings.length - 1; ri >= 0; ri--) {
        var R2 = rings[ri];
        R2.r += 7;
        if (R2.r > lim) { rings.splice(ri, 1); continue; }
        g.strokeStyle = flat(R2.c);
        g.lineWidth = R2.w;
        g.globalAlpha = Math.max(0, 1 - R2.r / lim);
        g.beginPath(); g.arc(cxp, cyp, snap(R2.r, 6), 0, Math.PI * 2); g.stroke();
      }
      g.globalAlpha = 1;

    /* ── two gratings, interference ───────────────────────────────────── */
    } else if (name === 'moire') {
      var bm = bands(3, false), lvm = level();
      var gap1 = 5 + Math.round(bm[0] * 22), gap2 = 5 + Math.round(bm[2] * 22);
      var ang = bm[1] * 0.5;
      /* The spacings and the angle were the only things listening, so the
         pattern held full strength through silence and only re-spaced
         itself. The ink listens too now, and an empty bar empties the
         window. */
      g.globalAlpha = Math.min(1, 0.02 + lvm * 4);
      g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1;
      for (var m1 = -H; m1 < W + H; m1 += gap1) {
        g.beginPath(); g.moveTo(m1, 0); g.lineTo(m1, H); g.stroke();
      }
      g.save();
      g.translate(W / 2, H / 2); g.rotate(ang); g.translate(-W / 2, -H / 2);
      g.strokeStyle = accent;
      for (var m2 = -H; m2 < W + H; m2 += gap2) {
        g.beginPath(); g.moveTo(m2, -H); g.lineTo(m2, H * 2); g.stroke();
      }
      g.restore();

    /* ── stacked beaded waveform lines ────────────────────────────────── */
    } else if (name === 'traces') {
      var ROWS = 16, lvt = level();
      for (var rt = 0; rt < ROWS; rt++) {
        var yrow = (rt + 0.5) * (H / ROWS);
        var lagt = rt * 193, ampt = H / ROWS * (0.5 + lvt * 3.2);
        /* Brightness rides the level as well as the swing. Without it the
           sixteen lines sat there at full white through a silent passage,
           perfectly straight, looking like ruled paper. */
        g.globalAlpha = Math.min(1, 0.05 + lvt * 3.4);
        g.fillStyle = (rt % 5 === 0) ? accent : '#fff';
        for (var xt = 0; xt < W; xt += 6) {
          var wt = Math.floor(xt / W * (wave.length - 1));
          var yt = yrow + (wave[(wt + lagt) % wave.length] - 128) / 128 * ampt;
          g.fillRect(Math.round(xt), Math.round(yt), 2, 2);
        }
      }
      g.globalAlpha = 1;

    }

    g.globalAlpha = 1;
  }

  /* ── Hook up ──────────────────────────────────────────────────────────── */
  /* The control at the foot of the page. It steps through the ten in order,
     which is the only way to actually see all of them — the page's own choice
     is random, and random takes a long time to show you the tenth. */
  var picker = document.getElementById('sound-pick');
  var label  = document.getElementById('sound-pick-name');
  var count  = document.getElementById('sound-pick-n');
  if (picker) {
    picker.hidden = false;
    picker.addEventListener('click', function () {
      reroll(MODES.indexOf(mode) + 1);
      if (!audio.paused && !raf) draw();
    });
  }

  size();
  var t;
  addEventListener('resize', function () { clearTimeout(t); t = setTimeout(size, 140); });

  audio.addEventListener('sketch:open', function () { reroll(); });
  audio.addEventListener('play', function () {
    if (!wire()) return;
    if (ctx.state === 'suspended') ctx.resume();
    document.body.classList.add('has-ground');
    if (dark) { document.body.classList.add('is-dark');
                document.documentElement.classList.add('is-dark'); }
    if (!raf) draw();
  });
  /* The page comes back to white when the sound stops, but the last frame
     stays under it until something else is played. */
  audio.addEventListener('pause', function () {
    document.body.classList.remove('is-dark');
    document.documentElement.classList.remove('is-dark');
  });

  reroll();
})();
