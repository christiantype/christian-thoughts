/* One shape becomes many: thirty seconds, then round again.
   A circle goes soft and strange, flat at first, then picks up depth and turns over three times
   as a run of abstract forms (squircles, lenses, blobs, petals, cogs, drops) and lies flat again.
   Every outline is the same 360 points read off a ray from the centre, so any shape can melt
   into any other. The change does not land all at once: it runs round the outline as a wave,
   from the top down both sides, and each point springs a little past where it is going before
   it settles. The 3D is the outline pushed back into a prism and turned, sides shaded against
   one light, the face drawn last.
   window.OPALMorph(canvas) → { resize(w, h, dpr), frame(sec), LENGTH } */
(function () {
  'use strict';
  // 360 rays, one a degree: enough that no curve shows a facet
  var N = 360, LENGTH = 30, TAU = Math.PI * 2;

  function fn(f) { var out = []; for (var i = 0; i < N; i++) out.push(f(-Math.PI / 2 + i * TAU / N)); return out; }
  // a = angle measured so that the top of the shape is a = -π/2; u = angle from the top, 0 … 2π
  var top = function (a) { return a + Math.PI / 2; };
  function blob(seed) {
    var R = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    var w = [2, 3, 4, 5].map(function (k) { return [k, (.04 + R() * .09) / (k * .5), R() * TAU]; });
    return fn(function (a) { return .8 + w.reduce(function (t, q) { return t + q[1] * Math.cos(q[0] * a + q[2]); }, 0); });
  }
  function superellipse(n, sx, sy, rot) {
    return fn(function (a) { var c = Math.abs(Math.cos(a + rot)) / sx, s = Math.abs(Math.sin(a + rot)) / sy; return Math.pow(Math.pow(c, n) + Math.pow(s, n), -1 / n); });
  }

  var SHAPE = {
    circle:   fn(function () { return .88; }),
    squircle: superellipse(4.2, .9, .9, 0),
    tall:     superellipse(2.6, .62, 1.05, 0),
    diamond:  superellipse(1.35, .98, .98, Math.PI / 4),
    lens:     fn(function (a) { return .98 / (1 + .75 * Math.pow(Math.abs(Math.cos(a)), 1.4)); }),
    peanut:   fn(function (a) { return .5 + .44 * Math.pow(Math.cos(a), 2); }),
    blobA:    blob(3), blobB: blob(17), blobC: blob(41),
    petals:   fn(function (a) { return .52 + .42 * Math.pow(Math.abs(Math.cos(a * 2)), .7); }),
    softstar: fn(function (a) { return .7 + .22 * Math.cos(5 * top(a)); }),
    cog:      fn(function (a) { return .76 + .13 * Math.tanh(4 * Math.cos(9 * a)); }),
    spiro:    fn(function (a) { return .72 + .15 * Math.cos(7 * a) + .07 * Math.cos(3 * a + 1); }),
    drop:     fn(function (a) { var u = (1 + Math.cos(top(a))) / 2; return .5 + .48 * Math.pow(1 - u, 1.6); }),
    roundtri: fn(function (a) { return .74 + .17 * Math.cos(3 * top(a)); }),
    ripple:   fn(function (a) { return .8 + .07 * Math.sin(14 * a); })
  };

  // the score: [time, shape, depth (0 flat … 1 deep), colour]
  var STEEL = [70, 130, 180], SUN = [255, 196, 22], RED = [227, 36, 27], LAV = [168, 160, 220], INK = [20, 20, 24],
      GREEN = [47, 138, 75], ORANGE = [238, 122, 38], PINK = [233, 139, 176], CREAM = [236, 226, 192], TEAL = [59, 179, 201];
  var KEYS = [
    [0.0,  'circle',   0, INK],
    [1.6,  'circle',   0, INK],
    [3.4,  'squircle', 0, RED],
    [5.2,  'blobA',    0, SUN],
    [7.0,  'lens',     0, LAV],
    [8.8,  'tall',     1, STEEL],
    [10.6, 'petals',   1, PINK],
    [12.4, 'blobB',    1, ORANGE],
    [14.2, 'cog',      1, INK],
    [16.0, 'drop',     1, TEAL],
    [17.8, 'diamond',  1, SUN],
    [19.6, 'spiro',    1, GREEN],
    [21.4, 'peanut',   1, RED],
    [23.2, 'softstar', 1, LAV],
    [25.0, 'ripple',   1, STEEL],
    [26.6, 'blobC',    0, CREAM],
    [28.2, 'circle',   0, INK],
    [30.0, 'circle',   0, INK]
  ];
  var ease = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  // the ramp each point rides: slow out, quick through the middle, a small spring past the mark, then rest
  var spring = function (t) {
    if (t <= 0) return 0; if (t >= 1) return 1;
    var e = ease(Math.min(1, t * 1.25));
    return e + Math.sin(Math.PI * Math.min(1, Math.max(0, (t - .55) / .45))) * .09 * (1 - t) * 2.2;
  };
  var mix = function (a, b, t) { return a + (b - a) * t; };
  // when each point moves: the top goes first, the wave runs down both sides and the bottom goes last
  var LAG = [], SPREAD = .55;
  for (var i = 0; i < N; i++) LAG.push((1 - Math.cos(i * TAU / N)) / 2 * SPREAD);
  function at(sec) {
    var t = ((sec % LENGTH) + LENGTH) % LENGTH, j = 0;
    while (j < KEYS.length - 2 && KEYS[j + 1][0] <= t) j++;
    var A = KEYS[j], B = KEYS[j + 1], v = Math.min(1, (t - A[0]) / (B[0] - A[0])), u = ease(v);
    var ra = SHAPE[A[1]], rb = SHAPE[B[1]], r = [];
    for (var k = 0; k < N; k++) r.push(Math.max(.05, mix(ra[k], rb[k], spring((v * (1 + SPREAD) - LAG[k])))));
    return { t: t, r: r, depth: mix(A[2], B[2], u), col: [0, 1, 2].map(function (c) { return mix(A[3][c], B[3][c], u); }) };
  }
  // the turn: three whole turns between lying flat and lying flat again, so it lands facing us
  function turn(t) {
    var u = Math.max(0, Math.min(1, (t - 7.0) / (26.6 - 7.0))), e = ease(u);
    return { yaw: e * TAU * 3, pitch: .5 * Math.sin(Math.PI * e) + .12 * Math.sin(TAU * 2 * e), roll: .12 * Math.sin(TAU * e) };
  }

  window.OPALMorph = function (canvas) {
    var ctx = canvas.getContext('2d'), W = 1, H = 1, D = 1;
    function resize(w, h, dpr) { D = dpr || 1; W = w; H = h; canvas.width = Math.round(w * D); canvas.height = Math.round(h * D); }
    function frame(sec) {
      ctx.lineJoin = 'round';
      var S = at(sec), T = turn(S.t), size = Math.min(W, H) * .3, depth = S.depth * 1.1;
      ctx.setTransform(D, 0, 0, D, 0, 0);
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
      var cy = Math.cos(T.yaw), sy = Math.sin(T.yaw), cp = Math.cos(T.pitch), sp = Math.sin(T.pitch), cr = Math.cos(T.roll), sr = Math.sin(T.roll);
      function rot(x, y, z) {
        var x1 = x * cy + z * sy, z1 = -x * sy + z * cy;           // yaw
        var y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;          // pitch
        return [x1 * cr - y2 * sr, x1 * sr + y2 * cr, z2];        // roll
      }
      function proj(v) { var f = 5 / (5 + v[2]); return [W / 2 + v[0] * size * f, H / 2 + v[1] * size * f, v[2]]; }
      var front = [], back = [];
      for (var i = 0; i < N; i++) {
        var a = -Math.PI / 2 + i * TAU / N, x = Math.cos(a) * S.r[i], y = Math.sin(a) * S.r[i];
        front.push(rot(x, y, -depth / 2)); back.push(rot(x, y, depth / 2));
      }
      // the light comes from up and to the left, on our side; lying flat, the shape is just its colour
      var L = [-.45, -.6, -.66], lit = Math.min(1, depth * 2.5), shade = function (n, k) {
        var d = Math.max(0, n[0] * L[0] + n[1] * L[1] + n[2] * L[2]);
        return 'rgb(' + S.col.map(function (c) { var v = c * (k + (1 - k) * d) + 40 * d * d; return Math.round(Math.min(255, c + (v - c) * lit)); }).join(',') + ')';
      };
      function poly(pts) { ctx.beginPath(); pts.forEach(function (v, i) { var p = proj(v); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.closePath(); }
      if (depth > .002) {
        var sides = [];
        for (var j = 0; j < N; j++) {
          var a0 = front[j], a1 = front[(j + 1) % N], b1 = back[(j + 1) % N], b0 = back[j];
          var ux = a1[0] - a0[0], uy = a1[1] - a0[1], uz = a1[2] - a0[2], vx = b0[0] - a0[0], vy = b0[1] - a0[1], vz = b0[2] - a0[2];
          var n = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx], m = Math.hypot(n[0], n[1], n[2]) || 1;
          n = [n[0] / m, n[1] / m, n[2] / m];
          if (n[2] > 0) continue;                                       // facing away
          sides.push({ q: [a0, a1, b1, b0], z: (a0[2] + a1[2] + b0[2] + b1[2]) / 4, n: n });
        }
        sides.sort(function (p, q) { return q.z - p.z; });
        sides.forEach(function (sd) { poly(sd.q); ctx.fillStyle = shade(sd.n, .42); ctx.fill(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1; ctx.stroke(); });
      }
      // the face that looks at us goes on last
      var fn0 = rot(0, 0, -1), faceFront = fn0[2] < 0;
      poly(faceFront ? front : back);
      ctx.fillStyle = shade(faceFront ? fn0 : [-fn0[0], -fn0[1], -fn0[2]], .62); ctx.fill();
      // a hairline of the face's own colour closes the seam where it meets the sides
      if (depth > .002) { ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = .8; ctx.stroke(); }
    }
    return { resize: resize, frame: frame, LENGTH: LENGTH };
  };
})();
