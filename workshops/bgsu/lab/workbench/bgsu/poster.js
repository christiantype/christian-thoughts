/* ── BGSU poster instruments — one engine, four tools ──────────────────────────
   Made for the Liminal Space workshop at Bowling Green, 1–2 November 2026: one
   instrument per poster. The page says which one it is with <body data-mode>:

     shapes   circles, squares, triangles, bars, halves — black and white
     colour   the same, coloured from a palette
     type     a question, set; the rule decides where the words fall
     both     type and shapes on one sheet

   A rule lays the sheet out (reseed for another), and the hand finishes it:
   drag a piece to move it, drag its corner to scale it, [ and ] to turn it.
   Anything the hand has touched stays where it was put when the rule reseeds —
   the scribble between the system and the touch. "Let go" hands it back.

   Everything is kept in fractions of the sheet (x of its width, y of its
   height, size of its width), so the same composition draws on the screen, at
   300 dpi for print, and as SVG.                                                */
(function () {
  'use strict';

  var MODE = document.body.getAttribute('data-mode') || 'shapes';
  var TECH       = MODE === 'tech';      // the fifth: a layer of technology over poster four
  var HAS_SHAPES = MODE !== 'type';
  var HAS_TYPE   = MODE === 'type' || MODE === 'both' || TECH;
  var HAS_COLOUR = MODE === 'colour' || MODE === 'both' || TECH;

  var FONT_DIR = '/workshops/bgsu/shared/fonts/';
  var FONTS = [
    ['Signifier', 'signifier-regular.woff2'],
    ['Untitled Sans', 'untitled-sans-regular.woff2'],
    ['Univers Next Light', 'UniversNextPro-Light.ttf'],
    ['Univers Next Thin', 'UniversNextPro-Thin.ttf'],
    ['The Future Mono', 'the-future-mono-regular.woff2'],
    ['IBM Plex Mono', 'ibm-plex-mono-400.woff2'],
    ['Eunuverse', 'Eunuverse-Roman.otf'],
    ['Sidepiece HoneyPie', 'Sidepiece-HoneyPie.woff2'],
    ['Sidepiece HoneyDrip', 'Sidepiece-HoneyDrip.woff2'],
    ['Sidepiece HoneyGlob', 'Sidepiece-HoneyGlob.woff2'],
    ['Sidepiece HoneyNugget', 'Sidepiece-HoneyNugget.woff2'],
    ['Chaparral', 'chaparral-regular.ttf'],
    ['Playfair', 'playfair-regular.ttf'],
    ['Zilla Slab', 'zillaslab-regular.ttf'],
    ['Pirata One', 'pirata-one.ttf']
  ];
  var PALETTES = {
    'Bauhaus': ['#e8322b', '#2b53e8', '#f4c21c', '#000000'],
    'Riso':    ['#ff48b0', '#0078bf', '#ffe800', '#00a95c'],
    'Field':   ['#1f4d3a', '#d9a441', '#c2462e', '#e9e1cf'],
    'Night':   ['#0b1f4d', '#5a7bd8', '#f2b8c6', '#fefefe'],
    'Citrus':  ['#ff6a13', '#ffc20e', '#7ac143', '#00274c']
  };
  var SIZES = { tabloid: [11, 17, 'Tabloid · 11 × 17 in'], poster: [18, 24, 'Poster · 18 × 24 in'] };
  var TYPES = ['circle', 'square', 'triangle', 'bar', 'half'];
  var TYPE_NAMES = { circle: 'Circle', square: 'Square', triangle: 'Triangle', bar: 'Bar', half: 'Half' };
  var SCREEN_W = 1100;   // the drawing buffer's width on screen; print is 300 dpi

  /* ── state ── */
  var DEFAULTS = {
    seed: 1, cseed: 1, size: 'tabloid', ground: 'paper',
    count: 7, chaos: 35, scale: 50, outline: 0, stroke: 6,
    types: { circle: true, square: true, triangle: true, bar: true, half: true },
    palette: 'Bauhaus', colours: PALETTES.Bauhaus.slice(),
    text: MODE === 'both' ? 'How\ncan I?' : 'What\nif?',
    font: 0, tsize: 24, lead: 96, track: 0, align: 'left', brk: 'typed', tchaos: 0, bx: 8, by: 8,
    tcol: -1,
    over: {}, extra: []
  };
  // the layer reads poster four as it was left in Type and Shapes, and never writes it back
  var KEY = 'opal-bgsu-' + (TECH ? 'both' : MODE);
  var S = load();
  var LKEY = 'opal-bgsu-tech';
  var L = { layer: 'detect', amount: 60, seed: (Math.random() * 1e9) | 0, src: 'poster' };
  try { var lr = localStorage.getItem(LKEY); if (lr) { var lm = JSON.parse(lr); for (var lk in lm) if (lk in L) L[lk] = lm[lk]; } } catch (e) {}
  var IMG = null;

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function load() {
    var s = clone(DEFAULTS);
    s.seed = (Math.random() * 1e9) | 0; s.cseed = (Math.random() * 1e9) | 0;
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) { var m = JSON.parse(raw); for (var k in m) if (k in s) s[k] = m[k]; }
    } catch (e) {}
    return s;
  }
  var saveT = 0;
  function save() {
    clearTimeout(saveT);
    saveT = setTimeout(function () {
      try { if (TECH) localStorage.setItem(LKEY, JSON.stringify(L)); else localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
    }, 250);
  }

  /* ── seeded random ── */
  function rng(a) {
    a = a >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* ── the sheet ── */
  function sheet() { var z = SIZES[S.size] || SIZES.tabloid; return { w: z[0], h: z[1], ratio: z[1] / z[0] }; }
  function groundColour() {
    if (S.ground === 'ink') return '#000000';
    if (S.ground === 'paper') return '#ffffff';
    var i = parseInt(S.ground, 10);
    return HAS_COLOUR && S.colours[i] ? S.colours[i] : '#ffffff';
  }
  function inkColour() {
    var g = groundColour().replace('#', '');
    var r = parseInt(g.substr(0, 2), 16), gg = parseInt(g.substr(2, 2), 16), b = parseInt(g.substr(4, 2), 16);
    return (0.299 * r + 0.587 * gg + 0.114 * b) > 140 ? '#000000' : '#ffffff';
  }

  /* ── colour: presets, or a harmony from the colour seed ── */
  function hsl(h, s, l) {
    s /= 100; l /= 100;
    var k = function (n) { return (n + h / 30) % 12; };
    var a = s * Math.min(l, 1 - l);
    var f = function (n) { return l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); };
    var x = function (v) { return ('0' + Math.round(v * 255).toString(16)).slice(-2); };
    return '#' + x(f(0)) + x(f(8)) + x(f(4));
  }
  function generated(seed) {
    var R = rng(seed), h = R() * 360, scheme = (R() * 3) | 0;
    var offs = scheme === 0 ? [0, 120, 240] : scheme === 1 ? [0, 30, 180] : [0, 150, 210];
    var out = offs.map(function (o) { return hsl((h + o) % 360, 62 + R() * 30, 42 + R() * 18); });
    out.push(R() < 0.5 ? hsl(h, 40, 12) : hsl(h, 30, 92));
    return out;
  }

  /* ── type: fonts load on demand ── */
  var loaded = {};
  function fam(i) { return 'BGSU ' + FONTS[i][0]; }
  function ensureFont(i) {
    if (loaded[i]) return loaded[i];
    var f = new FontFace(fam(i), 'url(' + FONT_DIR + FONTS[i][1] + ')');
    loaded[i] = f.load().then(function (ff) { document.fonts.add(ff); draw(); return ff; }, function () { return null; });
    return loaded[i];
  }

  var canvas = document.getElementById('art');
  var ctx = canvas.getContext('2d');
  var mctx = document.createElement('canvas').getContext('2d');   // measuring only

  function measure(text, px) {
    mctx.font = px + 'px "' + fam(S.font) + '", serif';
    var w = mctx.measureText(text).width;
    return w + (S.track / 1000) * px * Math.max(0, text.length - 1);
  }

  /* ── the rule: shapes ── */
  function genShapes() {
    var out = [];
    if (!HAS_SHAPES) return out;
    var R = rng(S.seed), C = rng(S.cseed + 7);
    var sh = sheet(), ratio = sh.ratio;
    var on = TYPES.filter(function (t) { return S.types[t]; });
    if (!on.length) on = ['circle'];
    var n = S.count, t = S.chaos / 100;
    var cols = Math.max(1, Math.round(Math.sqrt(n / ratio))), rows = Math.ceil(n / cols);
    var m = 0.1, cw = (1 - 2 * m) / cols, ch = (1 - 2 * m) / rows;
    var s0 = Math.min(cw, ch * ratio) * 0.7 * (S.scale / 50);
    for (var i = 0; i < n; i++) {
      var r = [R(), R(), R(), R(), R(), R(), R()];
      var gx = m + cw * (i % cols + 0.5), gy = m + ch * (Math.floor(i / cols) + 0.5);
      var it = {
        kind: 'shape', key: 's' + i,
        type: r[0] < t ? on[(r[1] * on.length) | 0] : on[i % on.length],
        x: lerp(gx, 0.06 + r[2] * 0.88, t),
        y: lerp(gy, 0.05 + r[3] * 0.9, t),
        s: lerp(s0, s0 * (0.25 + r[4] * 2.6), t),
        rot: (r[5] - 0.5) * 360 * t,
        o: r[6] * 100 < S.outline,
        c: (C() * 4) | 0
      };
      out.push(it);
    }
    S.extra.forEach(function (e, j) {
      out.push({ kind: 'shape', key: 'x' + j, type: e.type, x: 0.5, y: 0.5, s: 0.22, rot: 0, o: false, c: j % 4 });
    });
    return out;
  }

  /* ── the rule: words ── */
  function genWords() {
    var out = [];
    if (!HAS_TYPE) return out;
    var R = rng(S.seed ^ 0x9E3779B9);
    var sh = sheet(), H = sh.ratio;                  // in sheet-width units, the sheet is 1 wide and H tall
    var px = S.tsize / 100, lead = px * S.lead / 100, t = S.tchaos / 100;
    var lines = S.text.split('\n');
    if (S.brk === 'word') lines = S.text.split(/\s+/).filter(Boolean);
    var k = 0;
    var unit = 1000;                                  // measure at 1000px, scale to the sheet
    var space = measure(' ', unit) / unit * px;
    lines.forEach(function (line, li) {
      var words = line.split(/\s+/).filter(Boolean);
      var ws = words.map(function (w) { return measure(w, unit) / unit * px; });
      var lw = ws.reduce(function (a, b) { return a + b; }, 0) + space * Math.max(0, words.length - 1);
      var ax = S.bx / 100;
      var x = S.align === 'centre' ? ax - lw / 2 : S.align === 'right' ? ax - lw : ax;
      if (S.brk === 'stagger') x += (R() - 0.5) * 0.4;
      var base = S.by / 100 * H + px * 0.8 + li * lead;
      words.forEach(function (w, wi) {
        var r = [R(), R(), R(), R()];
        out.push({
          kind: 'word', key: 'w' + k++, text: w,
          x: x + (r[0] - 0.5) * 0.8 * t,
          y: (base + (r[1] - 0.5) * H * 0.6 * t) / H,
          size: px * (1 + (r[2] - 0.5) * 1.2 * t),
          rot: (r[3] - 0.5) * 180 * t,
          w: ws[wi]
        });
        x += ws[wi] + space;
      });
    });
    return out;
  }

  var ITEMS = [];
  function build() {
    ITEMS = genShapes().concat(genWords()).map(function (it) {
      var o = S.over[it.key];
      if (o) for (var p in o) it[p] = o[p];
      if (it.kind === 'word') it.w = measure(it.text, 1000) / 1000 * it.size;
      return it;
    }).filter(function (it) { return !it.hidden; });
  }

  /* ── colour of a piece ── */
  function colourOf(it) {
    if (it.kind === 'word') {
      if (HAS_COLOUR && S.tcol >= 0) return S.colours[S.tcol] || inkColour();
      return inkColour();
    }
    if (HAS_COLOUR) return S.colours[it.c % S.colours.length];
    return inkColour();
  }

  /* ── drawing: one routine for screen and print ── */
  function shapePath(c, type, s) {
    c.beginPath();
    var h = s / 2;
    if (type === 'circle') c.arc(0, 0, h, 0, Math.PI * 2);
    else if (type === 'square') c.rect(-h, -h, s, s);
    else if (type === 'triangle') { c.moveTo(0, -h); c.lineTo(h, h); c.lineTo(-h, h); c.closePath(); }
    else if (type === 'bar') c.rect(-h, -s * 0.125, s, s * 0.25);
    else if (type === 'half') { c.moveTo(-h, s / 4); c.arc(0, s / 4, h, Math.PI, Math.PI * 2); c.closePath(); }
  }
  function boxOf(it) {      // half-extents in sheet-width units, about the piece's centre
    if (it.kind === 'word') return [it.w / 2, it.size * 0.45];
    if (it.type === 'bar') return [it.s / 2, it.s * 0.125];
    if (it.type === 'half') return [it.s / 2, it.s / 4];
    return [it.s / 2, it.s / 2];
  }
  function centreOf(it, W, H) {   // in px
    if (it.kind === 'word') return [(it.x + it.w / 2) * W, it.y * H - it.size * 0.35 * W];
    return [it.x * W, it.y * H];
  }
  function render(c, W, H, sel) {
    c.save();
    c.fillStyle = groundColour();
    c.fillRect(0, 0, W, H);
    var picture = TECH && L.src === 'image';
    if (picture && IMG) cover(c, IMG, W, H);
    if (!picture) ITEMS.forEach(function (it) {
      var p = centreOf(it, W, H), col = colourOf(it);
      c.save();
      c.translate(p[0], p[1]);
      c.rotate(it.rot * Math.PI / 180);
      if (it.kind === 'shape') {
        shapePath(c, it.type, it.s * W);
        if (it.o) { c.lineWidth = S.stroke * W / SCREEN_W; c.strokeStyle = col; c.lineJoin = 'miter'; c.stroke(); }
        else { c.fillStyle = col; c.fill(); }
      } else {
        var px = it.size * W, tr = (S.track / 1000) * px;
        c.font = px + 'px "' + fam(S.font) + '", serif';
        c.fillStyle = col; c.textBaseline = 'alphabetic';
        var x = -it.w * W / 2, y = px * 0.35;
        if (!tr) c.fillText(it.text, x, y);
        else for (var i = 0; i < it.text.length; i++) { c.fillText(it.text[i], x, y); x += c.measureText(it.text[i]).width + tr; }
      }
      c.restore();
    });
    if (sel) {
      var b = boxOf(sel), q = centreOf(sel, W, H);
      c.save();
      c.translate(q[0], q[1]); c.rotate(sel.rot * Math.PI / 180);
      var hw = b[0] * W + 8, hh = b[1] * W + 8;
      c.lineWidth = 1.5; c.setLineDash([6, 5]);
      c.strokeStyle = '#ff2fa0';
      c.strokeRect(-hw, -hh, hw * 2, hh * 2);
      c.setLineDash([]); c.fillStyle = '#ff2fa0';
      c.fillRect(hw - 9, hh - 9, 18, 18);
      c.restore();
    }
    c.restore();
  }

  var selKey = null;
  function selected() { for (var i = 0; i < ITEMS.length; i++) if (ITEMS[i].key === selKey) return ITEMS[i]; return null; }

  function draw() {
    var sh = sheet();
    var W = SCREEN_W, H = Math.round(SCREEN_W * sh.ratio);
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
    build();
    render(ctx, W, H, selected());
    if (TECH) layer(ctx, W, H);
    var n = Object.keys(S.over).length + S.extra.length;
    var lg = document.getElementById('letGo');
    if (lg) { lg.disabled = !n; lg.textContent = n ? 'Let go of ' + n + (n === 1 ? ' hand edit' : ' hand edits') : 'Nothing held by hand'; }
    var sr = document.getElementById('seedR'); if (sr) sr.textContent = (TECH ? L.seed : S.seed) % 10000;
    save();
  }

  /* ── the hand ── */
  function toSheet(e) {
    var r = canvas.getBoundingClientRect();
    return [(e.clientX - r.left) * canvas.width / r.width, (e.clientY - r.top) * canvas.height / r.height];
  }
  function local(it, p) {
    var W = canvas.width, H = canvas.height, q = centreOf(it, W, H);
    var a = -it.rot * Math.PI / 180, dx = p[0] - q[0], dy = p[1] - q[1];
    return [dx * Math.cos(a) - dy * Math.sin(a), dx * Math.sin(a) + dy * Math.cos(a)];
  }
  function hit(p) {
    for (var i = ITEMS.length - 1; i >= 0; i--) {
      var it = ITEMS[i], l = local(it, p), b = boxOf(it), W = canvas.width;
      if (Math.abs(l[0]) <= b[0] * W + 6 && Math.abs(l[1]) <= b[1] * W + 6) return it;
    }
    return null;
  }
  function onHandle(it, p) {
    var l = local(it, p), b = boxOf(it), W = canvas.width;
    return Math.abs(l[0] - (b[0] * W + 8)) < 22 && Math.abs(l[1] - (b[1] * W + 8)) < 22;
  }
  function hold(it, props) {
    var o = S.over[it.key] || (S.over[it.key] = {});
    for (var p in props) o[p] = props[p];
  }

  var drag = null;
  canvas.addEventListener('pointerdown', function (e) {
    if (TECH) return;                       // the layer is applied, not handled
    var p = toSheet(e), sel = selected();
    canvas.setPointerCapture(e.pointerId);
    if (sel && onHandle(sel, p)) {
      var q = centreOf(sel, canvas.width, canvas.height);
      drag = { mode: 'scale', it: sel, d0: Math.hypot(p[0] - q[0], p[1] - q[1]), v0: sel.kind === 'word' ? sel.size : sel.s };
      return;
    }
    var it = hit(p);
    selKey = it ? it.key : null;
    if (it) drag = { mode: 'move', it: it, p0: p, x0: it.x, y0: it.y };
    draw();
  });
  canvas.addEventListener('pointermove', function (e) {
    if (TECH) return;
    var p = toSheet(e);
    if (!drag) {
      var sel = selected();
      canvas.style.cursor = sel && onHandle(sel, p) ? 'nwse-resize' : hit(p) ? 'move' : 'default';
      return;
    }
    var it = drag.it, W = canvas.width, H = canvas.height;
    if (drag.mode === 'move') {
      hold(it, { x: drag.x0 + (p[0] - drag.p0[0]) / W, y: drag.y0 + (p[1] - drag.p0[1]) / H });
    } else {
      var q = centreOf(it, W, H), k = Math.max(0.05, Math.hypot(p[0] - q[0], p[1] - q[1]) / drag.d0);
      if (it.kind === 'word') {
        // a word scales about its centre, so its left edge moves with it
        var c = it.x + it.w / 2, ns = drag.v0 * k, nw = it.w / it.size * ns;
        hold(it, { size: ns, x: c - nw / 2 });
      } else hold(it, { s: drag.v0 * k });
    }
    draw();
  });
  function endDrag() { drag = null; }
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  document.addEventListener('keydown', function (e) {
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var sel = selected();
    if (e.key === 'r' || e.key === 'R') { if (TECH) { L.seed = (Math.random() * 1e9) | 0; draw(); } else reseed(); e.preventDefault(); return; }
    if (!sel) return;
    var step = e.shiftKey ? 0.02 : 0.004;
    if (e.key === '[' || e.key === ']') hold(sel, { rot: sel.rot + (e.key === ']' ? 15 : -15) });
    else if (e.key === 'Delete' || e.key === 'Backspace') { hold(sel, { hidden: true }); selKey = null; }
    else if (e.key === 'ArrowLeft') hold(sel, { x: sel.x - step });
    else if (e.key === 'ArrowRight') hold(sel, { x: sel.x + step });
    else if (e.key === 'ArrowUp') hold(sel, { y: sel.y - step });
    else if (e.key === 'ArrowDown') hold(sel, { y: sel.y + step });
    else if (e.key === 'Escape') selKey = null;
    else if (HAS_COLOUR && /^[1-4]$/.test(e.key) && sel.kind === 'shape') hold(sel, { c: +e.key - 1 });
    else if (sel.kind === 'shape' && (e.key === 'o' || e.key === 'O')) hold(sel, { o: !sel.o });
    else return;
    e.preventDefault();
    draw();
  });

  function reseed() { S.seed = (Math.random() * 1e9) | 0; selKey = null; draw(); }

  /* ── export ── */
  function stamp() { return 'bgsu-' + MODE + '-' + ((TECH ? L.seed : S.seed) % 10000); }
  function download(href, name) {
    var a = document.createElement('a'); a.href = href; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
  }
  function exportPNG(dpi) {
    var sh = sheet();
    var W = dpi ? Math.round(sh.w * dpi) : SCREEN_W, H = dpi ? Math.round(sh.h * dpi) : Math.round(SCREEN_W * sh.ratio);
    var c = document.createElement('canvas'); c.width = W; c.height = H;
    build(); render(c.getContext('2d'), W, H, null);
    if (TECH) layer(c.getContext('2d'), W, H);
    c.toBlob(function (b) {
      var u = URL.createObjectURL(b);
      download(u, stamp() + (dpi ? '-' + dpi + 'dpi' : '') + '.png');
      setTimeout(function () { URL.revokeObjectURL(u); }, 4000);
    }, 'image/png');
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function svgShape(it, W, col) {
    var s = it.s * W, h = s / 2, d;
    if (it.type === 'circle') d = '<circle r="' + h.toFixed(2) + '"';
    else if (it.type === 'square') d = '<rect x="' + (-h).toFixed(2) + '" y="' + (-h).toFixed(2) + '" width="' + s.toFixed(2) + '" height="' + s.toFixed(2) + '"';
    else if (it.type === 'triangle') d = '<polygon points="0,' + (-h).toFixed(2) + ' ' + h.toFixed(2) + ',' + h.toFixed(2) + ' ' + (-h).toFixed(2) + ',' + h.toFixed(2) + '"';
    else if (it.type === 'bar') d = '<rect x="' + (-h).toFixed(2) + '" y="' + (-s * 0.125).toFixed(2) + '" width="' + s.toFixed(2) + '" height="' + (s * 0.25).toFixed(2) + '"';
    else d = '<path d="M' + (-h).toFixed(2) + ' ' + (s / 4).toFixed(2) + ' A' + h.toFixed(2) + ' ' + h.toFixed(2) + ' 0 0 1 ' + h.toFixed(2) + ' ' + (s / 4).toFixed(2) + ' Z"';
    return d + (it.o ? ' fill="none" stroke="' + col + '" stroke-width="' + (S.stroke * W / SCREEN_W).toFixed(2) + '"' : ' fill="' + col + '"') + '/>';
  }
  function exportSVG() {
    var sh = sheet(), W = sh.w * 72, H = sh.h * 72;   // points, so it opens at 11 × 17 in
    build();
    var body = ITEMS.map(function (it) {
      var p = centreOf(it, W, H), col = colourOf(it);
      var tf = 'translate(' + p[0].toFixed(2) + ' ' + p[1].toFixed(2) + ') rotate(' + it.rot.toFixed(2) + ')';
      if (it.kind === 'shape') return '<g transform="' + tf + '">' + svgShape(it, W, col) + '</g>';
      var px = it.size * W;
      return '<text transform="' + tf + '" x="' + (-it.w * W / 2).toFixed(2) + '" y="' + (px * 0.35).toFixed(2) + '" font-family="' + esc(FONTS[S.font][0]) +
        '" font-size="' + px.toFixed(2) + '" letter-spacing="' + ((S.track / 1000) * px).toFixed(2) + '" fill="' + col + '">' + esc(it.text) + '</text>';
    }).join('\n  ');
    var finish = function (fontCss) {
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + sh.w + 'in" height="' + sh.h + 'in" viewBox="0 0 ' + W + ' ' + H + '">\n' +
        (fontCss ? '  <style>' + fontCss + '</style>\n' : '') +
        '  <rect width="' + W + '" height="' + H + '" fill="' + groundColour() + '"/>\n  ' + body + '\n</svg>\n';
      var u = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
      download(u, stamp() + '.svg');
      setTimeout(function () { URL.revokeObjectURL(u); }, 4000);
    };
    if (!HAS_TYPE) return finish('');
    // the face travels inside the file, so the poster opens the same anywhere
    fetch(FONT_DIR + FONTS[S.font][1]).then(function (r) { return r.blob(); }).then(function (b) {
      var fr = new FileReader();
      fr.onload = function () { finish('@font-face{font-family:"' + FONTS[S.font][0] + '";src:url(' + fr.result + ');}'); };
      fr.readAsDataURL(b);
    }).catch(function () { finish(''); });
  }


  /* ── the fifth poster: a layer of technology ──────────────────────────────
     Poster four, read back by a machine. Each layer is fixed — a student picks
     one and how far it goes, and reseeds it; they do not author it. That is
     the point: the layer is something a tool does to the work.               */
  var LAYERS = [
    ['detect',  'Detection',  'The poster as an object detector reads it: boxes, labels, confidence — and, as it goes further, the wrong names.'],
    ['patches', 'Patches',    'Cut into the square patches a vision model sees, each one averaged and numbered like a token.'],
    ['dither',  'Dither',     'One bit per pixel: the poster as a machine would print it with a single ink.'],
    ['halftone','Halftone',   'A screen of dots, each sized by how dark the poster is under it.'],
    ['sort',    'Pixel sort', 'Bright runs of each row sorted by brightness, so the poster melts sideways.'],
    ['scan',    'Scan',       'A bad transmission: the colour channels slip and bands of the sheet jump.'],
    ['ascii',   'Characters', 'The poster rewritten as text, one character for each cell.']
  ];
  var WRONG = ['sun', 'moon', 'eye', 'door', 'wheel', 'mountain', 'window', 'planet', 'coin', 'hill', 'sign', 'bird', 'face', 'button', 'cloud', 'flag', 'mouth', 'island'];

  function cover(c, img, W, H) {
    var k = Math.max(W / img.width, H / img.height), w = img.width * k, h = img.height * k;
    c.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
  }
  function lum(d, i) { return 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; }
  function cellAvg(d, W, x0, y0, cw, ch, H) {
    var r = 0, g = 0, b = 0, n = 0, x1 = Math.min(W, x0 + cw), y1 = Math.min(H, y0 + ch), step = Math.max(1, Math.floor(cw / 6));
    for (var y = y0; y < y1; y += step) for (var x = x0; x < x1; x += step) { var i = (y * W + x) * 4; r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
    return n ? [r / n, g / n, b / n] : [255, 255, 255];
  }
  function rgb(a) { return 'rgb(' + (a[0] | 0) + ',' + (a[1] | 0) + ',' + (a[2] | 0) + ')'; }

  function layer(c, W, H) {
    var t = L.amount / 100, R = rng(L.seed), k = W / SCREEN_W;
    if (!t) return;
    c.save();
    if (L.layer === 'detect') {
      // boxes round what the poster is made of; the further it goes, the surer and wronger it gets
      var items = L.src === 'image' ? [] : ITEMS.slice();
      if (!items.length) for (var q = 0; q < 6; q++) items.push(null);
      c.lineWidth = 2.5 * k; c.font = (15 * k) + 'px "BGSU IBM Plex Mono", monospace'; c.textBaseline = 'top';
      items.forEach(function (it) {
        var r1 = R(), r2 = R(), r3 = R(), x0, y0, x1, y1, name;
        if (r1 > 0.3 + t * 0.7) return;
        if (it) {
          var b = boxOf(it), p = centreOf(it, W, H), a = it.rot * Math.PI / 180, hw = b[0] * W, hh = b[1] * W;
          var ex = Math.abs(hw * Math.cos(a)) + Math.abs(hh * Math.sin(a)), ey = Math.abs(hw * Math.sin(a)) + Math.abs(hh * Math.cos(a));
          x0 = p[0] - ex; x1 = p[0] + ex; y0 = p[1] - ey; y1 = p[1] + ey;
          name = it.kind === 'word' ? 'text "' + it.text + '"' : it.type;
        } else {
          var bw = W * (0.15 + r2 * 0.4), bh = H * (0.1 + r3 * 0.3);
          x0 = R() * (W - bw); y0 = R() * (H - bh); x1 = x0 + bw; y1 = y0 + bh; name = 'object';
        }
        var pad = 6 * k; x0 -= pad; y0 -= pad; x1 += pad; y1 += pad;
        if (r2 < t * 0.6) name = WRONG[(r3 * WRONG.length) | 0];
        var conf = (0.55 + r3 * 0.44).toFixed(2);
        c.strokeStyle = '#00e05a'; c.strokeRect(x0, y0, x1 - x0, y1 - y0);
        var lab = name + ' ' + conf, lw = c.measureText(lab).width + 10 * k;
        c.fillStyle = '#00e05a'; c.fillRect(x0 - c.lineWidth / 2, y0 - 22 * k, lw, 22 * k);
        c.fillStyle = '#000'; c.fillText(lab, x0 + 5 * k, y0 - 18 * k);
      });
    } else if (L.layer === 'patches') {
      var n = Math.round(24 - t * 16), cw = W / n, d = c.getImageData(0, 0, W, H).data;
      c.font = (10 * k) + 'px "BGSU IBM Plex Mono", monospace'; c.textBaseline = 'top';
      for (var py = 0; py * cw < H; py++) for (var px = 0; px < n; px++) {
        var avg = cellAvg(d, W, Math.floor(px * cw), Math.floor(py * cw), Math.ceil(cw), Math.ceil(cw), H);
        c.globalAlpha = 0.35 + t * 0.65; c.fillStyle = rgb(avg); c.fillRect(px * cw, py * cw, cw + 0.5, cw + 0.5);
        c.globalAlpha = 1; c.fillStyle = lum(avg, 0) > 140 ? 'rgba(0,0,0,.55)' : 'rgba(255,255,255,.6)';
        c.fillText(String((R() * 50257) | 0), px * cw + 3 * k, py * cw + 3 * k);
      }
      c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1 * k;
      for (var gx = 0; gx <= n; gx++) { c.beginPath(); c.moveTo(gx * cw, 0); c.lineTo(gx * cw, H); c.stroke(); }
      for (var gy = 0; gy * cw <= H; gy++) { c.beginPath(); c.moveTo(0, gy * cw); c.lineTo(W, gy * cw); c.stroke(); }
    } else if (L.layer === 'dither') {
      var px2 = Math.max(1, Math.round(k * (1 + t * 5))), w = Math.ceil(W / px2), h = Math.ceil(H / px2);
      var sm = document.createElement('canvas'); sm.width = w; sm.height = h;
      var sx = sm.getContext('2d'); sx.drawImage(c.canvas, 0, 0, w, h);
      var im = sx.getImageData(0, 0, w, h), dd = im.data, g = new Float32Array(w * h);
      for (var i = 0; i < w * h; i++) g[i] = lum(dd, i * 4);
      for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
        var o = y * w + x, v = g[o] < 128 ? 0 : 255, e = (g[o] - v) / 8;
        g[o] = v;
        [[1, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [0, 2]].forEach(function (s2) {
          var xx = x + s2[0], yy = y + s2[1]; if (xx >= 0 && xx < w && yy < h) g[yy * w + xx] += e;
        });
      }
      for (i = 0; i < w * h; i++) { dd[i * 4] = dd[i * 4 + 1] = dd[i * 4 + 2] = g[i]; dd[i * 4 + 3] = 255; }
      sx.putImageData(im, 0, 0);
      c.imageSmoothingEnabled = false; c.globalAlpha = Math.min(1, 0.4 + t); c.drawImage(sm, 0, 0, w * px2, h * px2);
    } else if (L.layer === 'halftone') {
      var cell = k * (6 + t * 22), d2 = c.getImageData(0, 0, W, H).data;
      c.fillStyle = '#fff'; c.fillRect(0, 0, W, H);
      for (var hy = 0; hy < H; hy += cell) for (var hx = 0; hx < W; hx += cell) {
        var a2 = cellAvg(d2, W, Math.floor(hx), Math.floor(hy), Math.ceil(cell), Math.ceil(cell), H);
        var dark = 1 - lum(a2, 0) / 255; if (dark < 0.02) continue;
        c.fillStyle = dark > 0.85 ? '#000' : rgb(a2.map(function (v) { return v * 0.85; }));
        c.beginPath(); c.arc(hx + cell / 2, hy + cell / 2, cell * 0.62 * Math.sqrt(dark), 0, Math.PI * 2); c.fill();
      }
    } else if (L.layer === 'sort') {
      var img = c.getImageData(0, 0, W, H), d3 = img.data, thr = 250 - t * 200;
      for (var sy = 0; sy < H; sy++) {
        if (R() > 0.35 + t * 0.65) continue;
        var row = sy * W, x2 = 0;
        while (x2 < W) {
          while (x2 < W && lum(d3, (row + x2) * 4) < thr) x2++;
          var st = x2;
          while (x2 < W && lum(d3, (row + x2) * 4) >= thr - 60) x2++;
          if (x2 - st > 2) {
            var run = [];
            for (var z = st; z < x2; z++) { var ii = (row + z) * 4; run.push([d3[ii], d3[ii + 1], d3[ii + 2]]); }
            run.sort(function (m, n2) { return (m[0] + m[1] + m[2]) - (n2[0] + n2[1] + n2[2]); });
            for (z = st; z < x2; z++) { var jj = (row + z) * 4, cc = run[z - st]; d3[jj] = cc[0]; d3[jj + 1] = cc[1]; d3[jj + 2] = cc[2]; }
          }
          x2++;
        }
      }
      c.putImageData(img, 0, 0);
    } else if (L.layer === 'scan') {
      var src = document.createElement('canvas'); src.width = W; src.height = H; src.getContext('2d').drawImage(c.canvas, 0, 0);
      var off = t * W * 0.012;
      c.globalCompositeOperation = 'multiply';
      [['#ff0000', -off, 0], ['#00ffff', off, off * 0.4]].forEach(function (ch) {
        var tc = document.createElement('canvas'); tc.width = W; tc.height = H;
        var tx = tc.getContext('2d'); tx.drawImage(src, 0, 0); tx.globalCompositeOperation = 'screen'; tx.fillStyle = ch[0]; tx.fillRect(0, 0, W, H);
        c.drawImage(tc, ch[1], ch[2]);
      });
      c.globalCompositeOperation = 'source-over';
      var bands = Math.round(3 + t * 26);
      for (var bi = 0; bi < bands; bi++) {
        var by0 = R() * H, bh2 = H * (0.004 + R() * 0.04), sh = (R() - 0.5) * W * 0.25 * t;
        c.drawImage(src, 0, by0, W, bh2, sh, by0, W, bh2);
      }
      c.fillStyle = 'rgba(0,0,0,' + (0.05 + t * 0.12) + ')';
      for (var ly = 0; ly < H; ly += 3 * k) c.fillRect(0, ly, W, 1 * k);
    } else if (L.layer === 'ascii') {
      var ce = k * (9 + t * 14), d4 = c.getImageData(0, 0, W, H).data, ramp = ' .:-=+*#%@';
      c.fillStyle = '#fff'; c.fillRect(0, 0, W, H);
      c.font = ce * 1.15 + 'px "BGSU IBM Plex Mono", monospace'; c.textBaseline = 'top';
      for (var ay = 0; ay < H; ay += ce * 1.2) for (var ax = 0; ax < W; ax += ce * 0.62) {
        var a4 = cellAvg(d4, W, Math.floor(ax), Math.floor(ay), Math.ceil(ce * 0.62), Math.ceil(ce * 1.2), H);
        var dk = 1 - lum(a4, 0) / 255, ch2 = ramp[Math.min(ramp.length - 1, Math.floor(dk * ramp.length))];
        if (ch2 === ' ') continue;
        c.fillStyle = dk > 0.85 ? '#000' : rgb(a4.map(function (v) { return v * 0.8; }));
        c.fillText(ch2, ax, ay);
      }
    }
    c.restore();
  }

  function techControls() {
    var mono = FONTS.map(function (f) { return f[0]; }).indexOf('IBM Plex Mono');
    ensureFont(mono);
    group('Source',
      select('src', 'Poster', [['poster', 'My poster four'], ['image', 'An image of my own']], L.src) +
      '<button class="btn" id="pick" type="button">Choose an image</button>' +
      '<input id="file" type="file" accept="image/*" hidden>' +
      '<p class="rowhint">Poster four is read from the Type and Shapes tool in this browser, as you left it.</p>');
    group('Layer',
      select('layer', 'Layer', LAYERS.map(function (x) { return [x[0], x[1]]; }), L.layer) +
      '<p class="rowhint" id="layerNote"></p>' +
      range('amount', 'How far', 0, 100, L.amount) +
      '<div class="duo"><button class="btn" id="reseed" type="button">Reseed</button><span class="rowhint seedline">Seed <b id="seedR"></b> · r</span></div>');
    group('Export',
      '<div class="grid2"><button class="btn" id="png" type="button">PNG</button><button class="btn" id="print" type="button">Print · 300 dpi</button></div>' +
      '<p class="rowhint">The layer is made of pixels, so this one exports as PNG.</p>');
    var note = function () { var x = LAYERS.filter(function (y) { return y[0] === L.layer; })[0]; document.getElementById('layerNote').textContent = x ? x[2] : ''; };
    note();
    var pick = document.getElementById('pick'), file = document.getElementById('file');
    pick.hidden = L.src !== 'image';
    document.getElementById('src').addEventListener('change', function (e) { L.src = e.target.value; pick.hidden = L.src !== 'image'; if (L.src === 'image' && !IMG) file.click(); draw(); });
    pick.addEventListener('click', function () { file.click(); });
    file.addEventListener('change', function () {
      var f = file.files && file.files[0]; if (!f) return;
      var im = new Image(); im.onload = function () { IMG = im; draw(); }; im.src = URL.createObjectURL(f);
    });
    document.getElementById('layer').addEventListener('change', function (e) { L.layer = e.target.value; note(); draw(); });
    var am = document.getElementById('amount');
    am.addEventListener('input', function () { L.amount = +am.value; document.getElementById('amountR').textContent = am.value; draw(); });
    document.getElementById('reseed').addEventListener('click', function () { L.seed = (Math.random() * 1e9) | 0; draw(); });
  }

  /* ── the controls ── */
  var dock = document.getElementById('dock');
  function el(html) { var d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }
  function group(title, html) { var g = el('<div class="group"><div class="group__t">' + title + '</div>' + html + '</div>'); dock.appendChild(g); return g; }
  function range(id, label, min, max, val, step) {
    return '<div class="knob"><label>' + label + ' <b id="' + id + 'R">' + val + '</b></label><input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="' + (step || 1) + '" value="' + val + '"></div>';
  }
  function select(id, label, opts, val) {
    return '<div class="knob"><label>' + label + '</label><select id="' + id + '">' +
      opts.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(val) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') +
      '</select></div>';
  }
  function bindRange(id, key, after) {
    var r = document.getElementById(id), b = document.getElementById(id + 'R');
    r.addEventListener('input', function () { S[key] = +r.value; b.textContent = r.value; if (after) after(); draw(); });
  }
  function bindSelect(id, key, after) {
    var s = document.getElementById(id);
    s.addEventListener('change', function () { S[key] = s.value; if (after) after(s.value); draw(); });
  }

  if (!TECH) {
  var ruleHTML = '<div class="duo"><button class="btn" id="reseed" type="button">Reseed</button><span class="rowhint seedline">Seed <b id="seedR"></b> · r</span></div>';
  if (HAS_SHAPES) ruleHTML +=
    range('chaos', 'Order to chaos', 0, 100, S.chaos) +
    '<div class="duo">' + range('count', 'Count', 1, 40, S.count) + range('scale', 'Size', 10, 160, S.scale) + '</div>' +
    '<div class="duo">' + range('outline', 'Outlined', 0, 100, S.outline) + range('stroke', 'Line', 1, 40, S.stroke) + '</div>' +
    '<div class="knob"><label>Shapes</label><div class="types">' +
    TYPES.map(function (t) { return '<button type="button" class="btn" data-type="' + t + '" aria-pressed="' + !!S.types[t] + '">' + TYPE_NAMES[t] + '</button>'; }).join('') +
    '</div></div>';
  if (MODE === 'type') ruleHTML += range('tchaos', 'Order to chaos', 0, 100, S.tchaos);
  group('Rule', ruleHTML);

  if (HAS_TYPE) {
    group('Type',
      '<textarea class="opal-input" id="text" rows="3" spellcheck="false" placeholder="Your question">' + esc(S.text) + '</textarea>' +
      select('font', 'Typeface', FONTS.map(function (f, i) { return [i, f[0]]; }), S.font) +
      '<div class="duo">' + range('tsize', 'Size', 3, 80, S.tsize) + range('lead', 'Leading', 60, 200, S.lead) + '</div>' +
      '<div class="duo">' + range('track', 'Tracking', -100, 400, S.track) +
      (MODE === 'both' ? range('tchaos', 'Word chaos', 0, 100, S.tchaos) : '<span></span>') + '</div>' +
      '<div class="duo">' + select('align', 'Align', [['left', 'Left'], ['centre', 'Centre'], ['right', 'Right']], S.align) +
      select('brk', 'Lines', [['typed', 'As typed'], ['word', 'A word to a line'], ['stagger', 'Stagger']], S.brk) + '</div>' +
      '<div class="duo">' + range('bx', 'Across', 0, 100, S.bx) + range('by', 'Down', 0, 100, S.by) + '</div>');
  }

  if (HAS_COLOUR) {
    group('Colour',
      select('palette', 'Palette', Object.keys(PALETTES).map(function (k) { return [k, k]; }).concat([['Generated', 'Generated from the seed']]), S.palette) +
      '<div class="chips" id="chips"></div>' +
      '<button class="btn" id="recolour" type="button">Recolour</button>' +
      (MODE === 'both' ? select('tcol', 'Type colour', [[-1, 'Ink'], [0, 'Colour one'], [1, 'Colour two'], [2, 'Colour three'], [3, 'Colour four']], S.tcol) : '') +
      '<p class="rowhint">Select a shape, then 1–4 to give it a colour.</p>');
  }

  var groundOpts = [['paper', 'Paper'], ['ink', 'Ink']];
  if (HAS_COLOUR) groundOpts = groundOpts.concat([['0', 'Colour one'], ['1', 'Colour two'], ['2', 'Colour three'], ['3', 'Colour four']]);
  group('Sheet',
    select('size', 'Size', Object.keys(SIZES).map(function (k) { return [k, SIZES[k][2]]; }), S.size) +
    select('ground', 'Ground', groundOpts, S.ground));

  group('Hand',
    (HAS_SHAPES ? '<div class="knob"><label>Add a shape</label><div class="types">' +
      TYPES.map(function (t) { return '<button type="button" class="btn" data-add="' + t + '">' + TYPE_NAMES[t] + '</button>'; }).join('') + '</div></div>' : '') +
    '<p class="rowhint">Drag a piece to move it, drag its corner to scale it. [ and ] turn it, arrows nudge it, delete takes it away' +
    (HAS_SHAPES ? ', o outlines it' : '') + '. What the hand has touched stays put when you reseed.</p>' +
    '<button class="btn" id="letGo" type="button">Let go</button>');

  group('Export',
    '<div class="grid2"><button class="btn" id="png" type="button">PNG</button><button class="btn" id="svg" type="button">SVG</button></div>' +
    '<button class="btn" id="print" type="button">PNG for print · 300 dpi</button>' +
    '<p class="rowhint">SVG opens at full size in Illustrator, typeface included.</p>');

  /* wire them */
  document.getElementById('reseed').addEventListener('click', reseed);
  if (HAS_SHAPES) {
    ['chaos', 'count', 'scale', 'outline', 'stroke'].forEach(function (k) { bindRange(k, k); });
    dock.querySelectorAll('[data-type]').forEach(function (b) {
      b.addEventListener('click', function () {
        var t = b.getAttribute('data-type');
        S.types[t] = !S.types[t];
        if (!TYPES.some(function (x) { return S.types[x]; })) S.types[t] = true;   // keep one
        b.setAttribute('aria-pressed', String(S.types[t]));
        draw();
      });
    });
    dock.querySelectorAll('[data-add]').forEach(function (b) {
      b.addEventListener('click', function () {
        S.extra.push({ type: b.getAttribute('data-add') });
        selKey = 'x' + (S.extra.length - 1);
        draw();
      });
    });
  }
  if (HAS_TYPE) {
    var ta = document.getElementById('text');
    ta.addEventListener('input', function () { S.text = ta.value; clearWords(); draw(); });
    bindSelect('font', 'font', function (v) { S.font = +v; ensureFont(S.font); });
    ['tsize', 'lead', 'track', 'tchaos', 'bx', 'by'].forEach(function (k) { bindRange(k, k); });
    bindSelect('align', 'align', function (v) {
      S.bx = v === 'centre' ? 50 : v === 'right' ? 92 : 8;
      var r = document.getElementById('bx'); r.value = S.bx; document.getElementById('bxR').textContent = S.bx;
      clearWords();
    });
    bindSelect('brk', 'brk', clearWords);
  }
  // words are held by their place in the line; when the lines change, the hand lets go of them
  function clearWords() { Object.keys(S.over).forEach(function (k) { if (k[0] === 'w') delete S.over[k]; }); }

  if (HAS_COLOUR) {
    var chips = document.getElementById('chips');
    var paintChips = function () {
      chips.innerHTML = S.colours.map(function (c, i) {
        return '<label class="chip"><input type="color" class="sw" data-i="' + i + '" value="' + c + '"><span>' + ['One', 'Two', 'Three', 'Four'][i] + '</span></label>';
      }).join('');
      chips.querySelectorAll('input').forEach(function (inp) {
        inp.addEventListener('input', function () { S.colours[+inp.getAttribute('data-i')] = inp.value; draw(); });
      });
    };
    paintChips();
    bindSelect('palette', 'palette', function (v) {
      S.colours = v === 'Generated' ? generated(S.seed) : PALETTES[v].slice();
      paintChips();
    });
    document.getElementById('recolour').addEventListener('click', function () {
      S.cseed = (Math.random() * 1e9) | 0;
      Object.keys(S.over).forEach(function (k) { if (S.over[k].c != null) delete S.over[k].c; });
      if (S.palette === 'Generated') { S.colours = generated(S.cseed); paintChips(); }
      draw();
    });
    if (MODE === 'both') bindSelect('tcol', 'tcol', function (v) { S.tcol = +v; });
  }
  bindSelect('size', 'size');
  bindSelect('ground', 'ground');
  document.getElementById('letGo').addEventListener('click', function () { S.over = {}; S.extra = []; selKey = null; draw(); });
  document.getElementById('svg').addEventListener('click', exportSVG);
  } else techControls();
  document.getElementById('png').addEventListener('click', function () { exportPNG(0); });
  document.getElementById('print').addEventListener('click', function () { exportPNG(300); });

  if (HAS_TYPE) ensureFont(S.font);
  draw();
  window.addEventListener('resize', draw);
})();
