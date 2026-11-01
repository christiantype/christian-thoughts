/* ── The system, building itself ─────────────────────────────────────────────
   A square, a cube, a system of 27, a building, a city — and then color,
   pulsing up through it. Every cube is named by where it ends up in the city,
   so each state grows out of the one before: the cube is the middle of the
   system, the system closes into the base of the tower, the tower stands on a
   slab, and the slab spreads under the other towers.

   Shared by the talk (/workshops/bgsu/) and the reel (/workshops/bgsu/reel.html):

     var sys = OPALSystem(canvas);
     sys.resize(cssWidth, cssHeight, dpr);
     sys.frame(seconds);          // draws the state at that time; pure, so a
                                  // reel can step it frame by frame
     sys.CITY, sys.FULL           // when the city stands; when the color is in */
(function () {
  'use strict';

  function OPALSystem(cv) {
    var cx = cv.getContext('2d');
    var C = [3, 3, 2];
    var cubes = [], seen = {};
    function add(i, j, k, f, g) { var key = i + ',' + j + ',' + k; if (seen[key]) return; seen[key] = 1; cubes.push({ p: [i, j, k], f: f, g: g, key: key }); }
    function block(x0, y0, z0, w, d, h, f, g) { for (var k = z0; k < z0 + h; k++) for (var i = x0; i < x0 + w; i++) for (var j = y0; j < y0 + d; j++) add(i, j, k, f, g); }
    add(C[0], C[1], C[2], 0, 'one');
    block(2, 2, 1, 3, 3, 3, 2, 'system');
    block(0, 0, 0, 7, 7, 1, 3, 'slab');
    block(2, 2, 4, 3, 3, 3, 3, 'top');
    block(0, 0, 0, 14, 14, 1, 4, 'city');
    [[6, 1, 2, 2, 4], [10, 1, 3, 2, 9], [1, 6, 2, 3, 5], [5, 5, 4, 4, 11], [11, 5, 2, 3, 3],
     [1, 11, 3, 2, 3], [6, 11, 2, 2, 6], [10, 10, 3, 3, 8]].forEach(function (t) { block(t[0], t[1], 1, t[2], t[3], t[4], 4, 'city'); });

    var lattice = function (c) { return c.p[0] >= 2 && c.p[0] <= 4 && c.p[1] >= 2 && c.p[1] <= 4 && c.p[2] >= 1 && c.p[2] <= 3; };
    var hash = function (c) { var h = Math.sin(c.p[0] * 12.9898 + c.p[1] * 78.233 + c.p[2] * 37.719) * 43758.5453; return h - Math.floor(h); };
    function at(c, ph) {
      if (ph === 2 && lattice(c)) return c.p.map(function (v, n) { return C[n] + (v - C[n]) * 1.8; });
      return c.p;
    }
    /* when, within a step (0–1), a cube starts to move; each then takes WIN of the step */
    /* Cubes that move (the system closing up) move together. Cubes that arrive come
       solid, never faded: a tower's cubes fall in from above the frame, a foundation's
       rise in from below it. The columns arrive at scattered moments, each from its own
       height, but within a column the cubes always come bottom first and fall in step,
       so no cube ever passes through another. Foundations come before what stands on
       them, and nothing lands on the system until it has closed.                     */
    var WIN = 0.5;
    var hash2 = function (c) { var h = Math.sin(c.p[0] * 93.989 + c.p[1] * 67.345 + c.p[2] * 21.123) * 24634.6345; return h - Math.floor(h); };
    var col1 = function (c) { var h = Math.sin(c.p[0] * 41.31 + c.p[1] * 17.77) * 15731.743; return h - Math.floor(h); };
    var col2 = function (c) { var h = Math.sin(c.p[0] * 11.13 + c.p[1] * 71.97) * 35711.137; return h - Math.floor(h); };
    function rises(c) { return c.p[2] === 0 && (c.f === 3 || c.f === 4); }
    function delay(c, to) {
      if (to === 2) return hash(c) * 0.5;
      if (to === 3) {
        if (c.g === 'system') return 0;
        if (c.g === 'slab') return 0.3 + col1(c) * 0.3;
        return 0.5 + col1(c) * 0.12 + (c.p[2] - 4) * 0.03;
      }
      if (to === 4) {
        if (rises(c)) return col1(c) * 0.28;
        return 0.3 + col1(c) * 0.28 + c.p[2] * 0.008;
      }
      return 0;
    }

    /* easing: motion is sine in-out (no snap at either end); a falling cube eases out, like settling */
    var sine = function (t) { return -(Math.cos(Math.PI * t) - 1) / 2; };
    var settle = function (t) { return 1 - Math.pow(1 - t, 4); };
    var smoother = function (t) { return t * t * t * (t * (t * 6 - 15) + 10); };
    var clamp = function (t) { return Math.max(0, Math.min(1, t)); };

    /* ── physics, in seconds ──────────────────────────────────────────────────
       One gravity for every cube in every step. A cube falls from rest, hits at the
       speed the fall gave it, comes back up at a fixed share of that speed (so a
       hard landing hops and a soft one barely lifts), and stops when the bounce is
       too small to see. It squashes only while it is touching down, by how hard it
       hit. Foundations rise on a damped spring; the system's cubes grow on one.   */
    var G = 46, E = 0.1, CONTACT = 0.11, GAP = 0.3;
    function fall(tau, h) {
      var tf = Math.sqrt(2 * h / G);
      if (tau < tf) return { z: h - G * tau * tau / 2, sq: 0, settled: false };
      var v = G * tf, t0 = tf;
      for (;;) {
        var u = tau - t0, sq = u < CONTACT ? Math.min(0.09, v * 0.002) * Math.sin(Math.PI * u / CONTACT) : 0;
        var vb = v * E;
        if (vb < 2) return { z: 0, sq: sq, settled: u >= CONTACT };
        var dur = 2 * vb / G;
        if (u < dur) return { z: vb * u - G * u * u / 2, sq: sq, settled: false };
        t0 += dur; v = vb;
      }
    }
    function impacts(start, h) {           // when it hits, and how hard: for the shudder
      var out = [], tf = Math.sqrt(2 * h / G), v = G * tf, t0 = start + tf;
      while (v > 8) { out.push([t0, v]); var vb = v * E; t0 += 2 * vb / G; v = vb; }
      return out;
    }
    function spring(tau, zeta, w) {        // 0 → 1, a damped spring's step
      if (tau <= 0) return 0;
      var wd = w * Math.sqrt(1 - zeta * zeta), env = Math.exp(-zeta * w * tau);
      return 1 - env * (Math.cos(wd * tau) + (zeta * w / wd) * Math.sin(wd * tau));
    }

    /* the camera: front-on for the square, turning isometric as it becomes a cube */
    function P(x, y, z, pb) { return [x * (1 - pb) + (x - y) * 0.866 * pb, -z * (1 - pb) + ((x + y) * 0.5 - z) * pb]; }
    function bounds(ph) {
      var pb = ph === 0 ? 0 : 1, b = [1e9, 1e9, -1e9, -1e9];
      cubes.forEach(function (c) {
        if (c.f > ph) return;
        var q = at(c, ph);
        for (var n = 0; n < 8; n++) {
          var v = P(q[0] + (n & 1), q[1] + (n >> 1 & 1), q[2] + (n >> 2 & 1), pb);
          b[0] = Math.min(b[0], v[0]); b[1] = Math.min(b[1], v[1]); b[2] = Math.max(b[2], v[0]); b[3] = Math.max(b[3], v[1]);
        }
      });
      return b;
    }
    var BOUNDS = [0, 1, 2, 3, 4].map(bounds);

    /* the score: hold, step, hold, step … then the color comes in */
    var SCORE = [[1.2, 0], [2.4, 1], [1.0, 0], [3.0, 1], [1.0, 0], [4.6, 1], [1.0, 0], [8.5, 1]];
    var CITY = SCORE.reduce(function (a, s) { return a + s[0]; }, 0);
    var COLOR_IN = 3.2, FULL = CITY + 0.6 + COLOR_IN;
    function phaseAt(sec) {
      var ph = 0;
      for (var n = 0; n < SCORE.length; n++) {
        var d = SCORE[n][0];
        if (sec < d) return SCORE[n][1] ? ph + sec / d : ph;
        sec -= d; if (SCORE[n][1]) ph++;
      }
      return 4;
    }
    var STEP = {};                          // step n (to state n): [start, length] in seconds
    (function () { var at0 = 0, ph = 0; SCORE.forEach(function (s) { if (s[1]) STEP[++ph] = [at0, s[0]]; at0 += s[0]; }); })();

    /* every arriving cube gets its moment. Columns come at scattered times; within a
       column the cubes land bottom first, each once the one beneath has settled, all
       from the same height — so none ever passes through another. */
    var IMPACTS = [];
    (function () {
      var cols = {}, slabAt = {};
      cubes.forEach(function (c) {
        if (c.f < 2) return;
        var st = STEP[c.f], S = st[0], D = st[1];
        if (c.f === 2) { c.how = 'grow'; c.start = S + hash(c) * 0.5 * D; return; }
        if (rises(c)) {
          c.how = 'rise'; c.far = 14 + col2(c) * 6;
          c.start = S + (c.f === 3 ? 0.3 + col1(c) * 0.3 : col1(c) * 0.22) * D;
          slabAt[c.p[0] + ',' + c.p[1] + ',' + c.f] = c.start;
          return;
        }
        if (c.f === 3 && c.g === 'system') return;
        var key = c.p[0] + ',' + c.p[1] + ',' + c.f;
        (cols[key] = cols[key] || []).push(c);
      });
      Object.keys(cols).forEach(function (key) {
        var list = cols[key].sort(function (a, b) { return a.p[2] - b.p[2]; }), c0 = list[0];
        var st = STEP[c0.f], S = st[0], D = st[1];
        var first = c0.f === 3 ? S + (0.55 + col1(c0) * 0.12) * D : S + (0.3 + col1(c0) * 0.25) * D;
        var under = slabAt[key]; if (under != null) first = Math.max(first, under + 1.3);
        var h = 18 + col2(c0) * 8, tf = Math.sqrt(2 * h / G);
        list.forEach(function (c, n) {
          c.how = 'fall'; c.h = h; c.start = first + n * GAP - tf;
          impacts(c.start, h).forEach(function (im) { IMPACTS.push(im); });
        });
      });
    })();

    /* ── as the system evolves, some cubes become other shapes ─────────────────
       While the 27 hang apart, a few of them turn into spheres, cylinders and pyramids,
       and turn back into cubes as the system closes. Once the city stands, some of the
       cells with nothing on top of them change for good. Each change pops in on a spring. */
    var hash3 = function (c) { var h = Math.sin(c.p[0] * 29.17 + c.p[1] * 53.71 + c.p[2] * 87.13) * 51473.913; return h - Math.floor(h); };
    var hash4 = function (c) { var h = Math.sin(c.p[0] * 63.11 + c.p[1] * 19.37 + c.p[2] * 45.79) * 27183.281; return h - Math.floor(h); };
    var KINDS = ['sphere', 'cylinder', 'pyramid'];
    cubes.forEach(function (c) {
      c.kind = KINDS[Math.floor(hash4(c) * KINDS.length)];
      if (lattice(c) && hash3(c) < 0.3) {
        var s2 = STEP[2], s3 = STEP[3];
        c.morph = [s2[0] + s2[1] * (0.62 + hash(c) * 0.3), s3[0] + s3[1] * 0.08];
      }
      var open = !seen[c.p[0] + ',' + c.p[1] + ',' + (c.p[2] + 1)];
      if (open && c.f >= 3 && hash3(c) > 0.7) {
        var from = Math.max((c.start || 0) + 1.4, CITY - 2.6 + hash2(c) * 3.4);
        c.morph = c.morph ? c.morph.concat([from, 1e9]) : [from, 1e9];
      }
    });
    function shapeOf(c, sec) {               // → [kind or null, seconds since the last change]
      var m = c.morph; if (!m) return [null, 1e9];
      var since = sec, on = false;
      for (var n = 0; n < m.length; n += 2) {
        if (sec >= m[n] && sec < m[n + 1]) return [c.kind, sec - m[n]];
        if (sec >= m[n + 1]) since = sec - m[n + 1];
      }
      return [null, since];
    }

    /* the color: metal — graphite up through gunmetal and steel to silver — with a
       sheen travelling up the towers, and a few cubes picked out in steel blue and sunflower */
    var RAMP = [[34, 37, 43], [70, 76, 86], [118, 126, 138], [168, 175, 186], [214, 218, 224], [238, 240, 243]];
    var STEEL = [70, 130, 180], SUNFLOWER = [255, 196, 22];
    var TILE = [[14, 14, 18], [84, 84, 98], [198, 200, 236], [228, 228, 248], [248, 240, 214], [236, 226, 192]];
    function ramp(v) {
      v = clamp(v) * (RAMP.length - 1);
      var i = Math.min(RAMP.length - 2, Math.floor(v)), f = v - i, a = RAMP[i], b = RAMP[i + 1];
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
    }
    function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
    function css(c) { return 'rgb(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ')'; }

    var W = 0, H = 0, dpr = 1;
    function resize(w, h, d) {
      dpr = d || 1; W = Math.round(w * dpr); H = Math.round(h * dpr);
      cv.width = W; cv.height = H;
    }

    function frame(sec) {
      var D = phaseAt(sec);
      var k = Math.min(3, Math.floor(D)), t = D - k;
      if (D >= 4) { k = 3; t = 1; }
      var pb = k === 0 ? smoother(t) : 1;
      var col = sec <= CITY + 0.6 ? 0 : smoother(clamp((sec - CITY - 0.6) / COLOR_IN));
      var time = Math.max(0, sec - CITY);

      var shudder = 0;                       // (the knock read as jitter; landings are bounce alone)

      var live = [], rest = {};
      cubes.forEach(function (c) {
        if (c.f > k + 1) return;
        var q, sc = 1, sq = 0, settled = true;
        // in its own step, or still bouncing just after it
        if (c.how && (c.f === k + 1 || (c.how !== 'grow' && sec < c.start + 3))) {
          {
            var tau = sec - c.start;
            if (tau <= 0) return;                                  // not here yet
            q = c.p.slice();
            if (c.how === 'grow') { q = at(c, 2).slice(); sc = spring(tau, 0.72, 10); settled = tau > 1.2; if (settled) sc = 1; }
            else if (c.how === 'rise') { var sp = spring(tau, 0.92, 6); q[2] -= (1 - sp) * c.far; settled = tau > 2.4; if (settled) q[2] = c.p[2]; }
            else { var F = fall(tau, c.h); q[2] += F.z; sq = F.sq; settled = F.settled; }
          }
        }
        if (!q) {
          var raw = clamp((t - delay(c, k + 1)) / WIN), u = sine(raw), A = at(c, k), B = at(c, k + 1);
          q = A.map(function (v, n) { return v + (B[n] - v) * u; });
        }
        var still = settled && sc === 1 && sq === 0 && q[0] === c.p[0] && q[1] === c.p[1] && q[2] === c.p[2];
        if (still && shudder) { q = q.slice(); q[2] -= shudder; }
        if (still && !shapeOf(c, sec)[0]) rest[c.key] = 1;
        live.push({ c: c, q: q, sc: sc, sq: sq, still: still });
      });
      live.sort(function (m, n) { return (m.q[0] + m.q[1] + m.q[2]) - (n.q[0] + n.q[1] + n.q[2]) || m.q[2] - n.q[2]; });

      var e = smoother(t), b0 = BOUNDS[k], b1 = BOUNDS[k + 1];
      var b = b0.map(function (v, n) { return v + (b1[n] - v) * e; });
      var bw = b[2] - b[0], bh = b[3] - b[1];
      var unit = Math.min(W * 0.8 / bw, H * 0.72 / bh, Math.min(W, H) * 0.24);
      unit *= 1 + 0.035 * col * Math.sin(time * 0.35);              // the city breathes once it is lit
      var ox = W / 2 - (b[0] + bw / 2) * unit, oy = H / 2 - (b[1] + bh / 2) * unit;

      cx.setTransform(1, 0, 0, 1, 0, 0);
      // it comes into focus: the first square sharpens out of a blur
      var blur = 0;                          // (the talk now hands it over already in focus, from the idea's square)
      var GREY = [206, 206, 210], ground = mix([255, 255, 255], GREY, col);
      cx.fillStyle = css(ground); cx.fillRect(0, 0, W, H);

      // a soft glow rising behind the city as the color arrives
      if (col > 0) {
        var gy = oy + (b[3] - (b[3] - b[1]) * (0.5 + 0.5 * Math.sin(time * 0.8))) * unit;
        var gl = cx.createRadialGradient(W / 2, gy, 0, W / 2, gy, Math.max(W, H) * 0.6);
        var gc = mix(STEEL, SUNFLOWER, 0.5 + 0.5 * Math.sin(time * 0.45));
        gl.addColorStop(0, 'rgba(' + (gc[0] | 0) + ',' + (gc[1] | 0) + ',' + (gc[2] | 0) + ',' + (0.16 * col) + ')');
        gl.addColorStop(1, 'rgba(206,206,210,0)');
        cx.fillStyle = gl; cx.fillRect(0, 0, W, H);
      }

      if (blur > 0.2) cx.filter = 'blur(' + blur.toFixed(1) + 'px)';
      var lw = Math.max(1, Math.min(2.6, unit * 0.055 / dpr)) * dpr;
      // once it colors itself the outlines go: each edge turns the color of its own face,
      // so the blocks read as color alone (and no seam of ground shows between faces)
      cx.lineJoin = 'round'; cx.lineWidth = lw * (1 - 0.6 * col);

      // Each face is a tile: one tone from the OP/AL story palette — black, graphite,
      // lavender-silver, cream — falling to black down its height. The tones drift slowly
      // from cube to cube, a sheen climbs the towers, and a few cubes hold steel blue or sunflower.
      function shade(z, f, c0) {
        if (!col) return [[255, 255, 255], [255, 255, 255]];
        var cube = { p: c0 }, h = hash2(cube);
        var c;
        if (h < 0.035) c = STEEL;
        else if (h > 0.975) c = SUNFLOWER;
        else {
          var v = (hash(cube) * TILE.length + time * 0.18 + z * 0.07) % TILE.length;
          var i = Math.floor(v), fr = smoother(v - i);
          c = mix(TILE[i], TILE[(i + 1) % TILE.length], fr);
        }
        var sheen = Math.pow(0.5 + 0.5 * Math.sin(z * 0.75 - time * 2.6), 6);
        var tint = mix(STEEL, SUNFLOWER, 0.5 + 0.5 * Math.sin(time * 0.55));
        c = mix(c, mix(tint, [255, 255, 255], 0.35), 0.5 * sheen);
        var top = f === 0 ? mix(c, [255, 255, 255], 0.12) : f === 2 ? mix(c, [0, 0, 0], 0.18) : c;
        var foot = mix(top, [0, 0, 0], f === 0 ? 0.35 : 0.82);
        return [mix([255, 255, 255], top, col), mix([255, 255, 255], foot, col)];
      }
      function face(pts, fill) {
        var y0 = 1e9, y1 = -1e9;
        cx.beginPath();
        for (var n = 0; n < pts.length; n++) {
          var v = pts[n], s = P(v[0], v[1], v[2], pb), X = ox + s[0] * unit, Y = oy + s[1] * unit;
          if (Y < y0) y0 = Y; if (Y > y1) y1 = Y;
          if (n) cx.lineTo(X, Y); else cx.moveTo(X, Y);
        }
        cx.closePath();
        if (col > 0 && y1 - y0 > 1) {
          var g = cx.createLinearGradient(0, y0, 0, y1);
          g.addColorStop(0, css(fill[0])); g.addColorStop(1, css(fill[1]));
          cx.fillStyle = g;
        } else cx.fillStyle = css(fill[0]);
        cx.fill();
        // the outline fades away as the color arrives — gradually, never switched off
        if (col < 1) { cx.globalAlpha = 1 - col; cx.strokeStyle = '#000'; cx.stroke(); cx.globalAlpha = 1; }
      }
      function edge() { if (col < 1) { cx.globalAlpha = 1 - col; cx.strokeStyle = '#000'; cx.stroke(); cx.globalAlpha = 1; } }
      function scr(x, y, z) { var s = P(x, y, z, pb); return [ox + s[0] * unit, oy + s[1] * unit]; }
      function grad(x0, y0, x1, y1, fill) {
        if (!col) return css(fill[0]);
        var g = cx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, css(fill[0])); g.addColorStop(1, css(fill[1])); return g;
      }
      // the other shapes, each sitting in its cell the way a cube would
      function other(kind, x, y, z, s, p) {
        var mx = x + 0.5, my = y + 0.5;
        if (kind === 'sphere') {
          var c0 = scr(mx, my, z + s / 2), r = 0.5 * s * unit, f = shade(z + s, 0, p);
          cx.beginPath(); cx.arc(c0[0], c0[1], r, 0, Math.PI * 2);
          if (col) { var g = cx.createRadialGradient(c0[0] - r * 0.35, c0[1] - r * 0.4, r * 0.05, c0[0], c0[1], r); g.addColorStop(0, css(f[0])); g.addColorStop(1, css(f[1])); cx.fillStyle = g; }
          else cx.fillStyle = '#fff';
          cx.fill(); edge();
        } else if (kind === 'cylinder') {
          var r2 = 0.46 * s, rx = 1.2247 * r2 * unit * pb + r2 * unit * (1 - pb), ry = 0.7071 * r2 * unit * pb;
          var b = scr(mx, my, z), t = scr(mx, my, z + s), fs = shade(z + s / 2, 1, p), ft = shade(z + s, 0, p);
          cx.beginPath(); cx.moveTo(t[0] - rx, t[1]); cx.lineTo(b[0] - rx, b[1]);
          cx.ellipse(b[0], b[1], rx, Math.max(0.01, ry), 0, Math.PI, 0, true); cx.lineTo(t[0] + rx, t[1]); cx.closePath();
          cx.fillStyle = grad(b[0] - rx, 0, b[0] + rx, 0, fs); cx.fill(); edge();
          cx.beginPath(); cx.ellipse(t[0], t[1], rx, Math.max(0.01, ry), 0, 0, Math.PI * 2);
          cx.fillStyle = col ? css(ft[0]) : '#fff'; cx.fill(); edge();
        } else {
          var h0 = (1 - s) / 2, a = [mx, my, z + s];
          face([[x + 1 - h0, y + h0, z], [x + 1 - h0, y + 1 - h0, z], a], shade(z + s / 2, 1, p));
          face([[x + h0, y + 1 - h0, z], [x + 1 - h0, y + 1 - h0, z], a], shade(z + s / 2, 2, p));
        }
      }
      for (var i = 0; i < live.length; i++) {
        var Lk = live[i], sh0 = shapeOf(Lk.c, sec);
        if (sh0[0]) {
          var pop = spring(sh0[1], 0.45, 14), s0 = Lk.sc * Math.max(0, pop);
          other(sh0[0], Lk.q[0], Lk.q[1], Lk.q[2] + (1 - s0) / 2 * 0, s0, Lk.c.p);
          continue;
        }
        if (sh0[1] < 0.8) live[i] = Lk = { c: Lk.c, q: Lk.q, sc: Lk.sc * spring(sh0[1], 0.45, 14), sq: Lk.sq, still: false };
        // a squash keeps the cube on its base: shorter, a little wider, then springs back
        var L = live[i], sc = L.sc, sw = sc * (1 + L.sq * 0.5), sh = sc * (1 - L.sq), p = L.c.p;
        var x = L.q[0] + (1 - sw) / 2, y = L.q[1] + (1 - sw) / 2, z = L.q[2] + (1 - sc) / 2;
        var hid = function (dx, dy, dz) { return L.still && rest[(p[0] + dx) + ',' + (p[1] + dy) + ',' + (p[2] + dz)]; };
        if (!hid(0, 0, 1)) face([[x, y, z + sh], [x + sw, y, z + sh], [x + sw, y + sw, z + sh], [x, y + sw, z + sh]], shade(z + sh, 0, p));
        if (!hid(1, 0, 0)) face([[x + sw, y, z], [x + sw, y + sw, z], [x + sw, y + sw, z + sh], [x + sw, y, z + sh]], shade(z + sh / 2, 1, p));
        if (!hid(0, 1, 0)) face([[x, y + sw, z], [x + sw, y + sw, z], [x + sw, y + sw, z + sh], [x, y + sw, z + sh]], shade(z + sh / 2, 2, p));
      }
      cx.filter = 'none';
      return col;
    }

    // the colors the city lights up in, chosen on the slide: six tones the tiles drift between, and the two
    // accents that pick out a few cubes and tint the sheen and the glow
    function rgb(h) { h = String(h).replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
    function hex(c) { return '#' + c.map(function (v) { return ('0' + Math.round(v).toString(16)).slice(-2); }).join(''); }
    function colors(o) {
      if (o) { if (o.tiles && o.tiles.length) TILE = o.tiles.map(rgb); if (o.a) STEEL = rgb(o.a); if (o.b) SUNFLOWER = rgb(o.b); }
      return { tiles: TILE.map(hex), a: hex(STEEL), b: hex(SUNFLOWER) };
    }
    return { resize: resize, frame: frame, colors: colors, CITY: CITY, FULL: FULL };
  }

  window.OPALSystem = OPALSystem;
})();
