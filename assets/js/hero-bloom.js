/* ── Hero bloom ────────────────────────────────────────────────────────────
   The first slot of the home carousel, drawn rather than filmed. It replaces
   mu-42-hero.mp4: a radial burst of fine particles in red and gold on black,
   breathing open and closed and drifting across the frame.

   What the cursor does: the burst follows the pointer, and particles already
   in flight are pushed away from it, so moving across the hero opens a wake
   through the filaments. A click throws a bloom. With no pointer — touch, or
   before the first move — the burst drifts on its own and nothing is lost.

   The canvas is one slot in a CSS fade carousel, so it is only on screen for
   a twelfth of the cycle. Simulating a burst nobody can see is wasted battery,
   so the loop reads its own opacity and idles while it is faded out.
*/
(function () {
  var canvas = document.querySelector('.site-hero-canvas');
  if (!canvas || !canvas.getContext) return;

  var reduced = window.matchMedia &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var ctx = canvas.getContext('2d', { alpha: false });
  var W = 0, H = 0, DPR = 1;

  var scale = 1;

  function resize() {
    var r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    // Scale off the SHORT edge, not the area: on a tall narrow phone the
    // geometric mean reads as a big frame and the arms shot straight out of
    // the sides. The short edge is the one the burst has to fit inside.
    scale = Math.min(r.width, r.height) / 720;
    // Past 2x the extra pixels are invisible and the fill cost is real.
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width;
    H = r.height;
    canvas.width  = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
  }

  /* ── the burst ──────────────────────────────────────────────────────────
     A core that wanders, and a set of arms radiating from it. Each arm is a
     direction that drifts slowly; particles are emitted along one with a
     little angular scatter, which is what gives the filaments their splayed,
     feathered edge rather than a clean ray.
  */
  var ARMS = 6;
  var arms = [];
  for (var i = 0; i < ARMS; i++) {
    arms.push({
      a: (Math.PI * 2 / ARMS) * i + Math.random() * 0.6,
      drift: (Math.random() - 0.5) * 0.0016,
      len: 0.45 + Math.random() * 1.15
    });
  }

  var core = { x: 0, y: 0, tx: 0, ty: 0 };
  var pointer = { x: 0, y: 0, active: false, vx: 0, vy: 0 };
  var t = 0;             // seconds, for the autonomous drift
  var pulse = 0;         // 0..1, the breath; 1 right after a bloom

  var MAX = reduced ? 220 : 1400;
  var pool = [];

  function emit(x, y, angle, speed, hueBias, life) {
    if (pool.length >= MAX) return;
    pool.push({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: life, max: life,
      size: 0.5 + Math.random() * 1.3,
      hue: hueBias + Math.random() * 14
    });
  }

  function bloom(strength) {
    pulse = Math.min(1, pulse + strength);
    var n = Math.round((reduced ? 40 : 160) * strength);
    for (var i = 0; i < n; i++) {
      var arm = arms[(Math.random() * ARMS) | 0];
      var a = arm.a + (Math.random() - 0.5) * 0.16;
      var sp = (34 + Math.random() * 150) * arm.len * strength * scale;
      emit(core.x, core.y, a, sp, 6 + Math.random() * 30, 1.0 + Math.random() * 1.4);
    }
  }

  /* Autonomous path: two incommensurate sine pairs, so the core never quite
     repeats the same loop and the hero does not read as a short cycle. */
  function wander(dt) {
    t += dt;
    core.tx = W * (0.5 + 0.26 * Math.sin(t * 0.21) + 0.08 * Math.sin(t * 0.73));
    core.ty = H * (0.5 + 0.20 * Math.cos(t * 0.17) + 0.07 * Math.cos(t * 0.61));
  }

  function step(dt) {
    // The drift always runs. When there is a pointer the burst leans toward it
    // rather than locking on: pinned to the cursor it stopped being a bloom and
    // became a comet, because the core outran its own filaments. Leaning keeps
    // the radial shape and still reads unmistakably as following the mouse.
    wander(dt);
    if (pointer.active) {
      core.tx += (pointer.x - core.tx) * 0.62;
      core.ty += (pointer.y - core.ty) * 0.62;
    }
    core.x += (core.tx - core.x) * Math.min(1, dt * 0.95);
    core.y += (core.ty - core.y) * Math.min(1, dt * 0.95);

    for (var i = 0; i < ARMS; i++) {
      arms[i].a += arms[i].drift * dt * 60;
    }

    // The breath. Speed under the cursor feeds it, so a fast sweep flares.
    var speed = Math.hypot(pointer.vx, pointer.vy);
    pulse += (speed * 0.00042 - pulse * 0.9) * dt * 2.2;
    pulse = Math.max(0, Math.min(1.4, pulse));
    var base = 0.34 + 0.3 * (Math.sin(t * 0.9) * 0.5 + 0.5);
    var rate = (base + pulse) * (reduced ? 6 : 26);

    for (var k = 0, n = rate; k < n; k++) {
      var arm = arms[(Math.random() * ARMS) | 0];
      var a = arm.a + (Math.random() - 0.5) * 0.13;
      var sp = (22 + Math.random() * 120) * arm.len * (0.6 + pulse) * scale;
      emit(core.x, core.y, a, sp, 4 + Math.random() * 32, 0.9 + Math.random() * 1.5);
    }

    var push = pointer.active ? 1 : 0;
    for (var j = pool.length - 1; j >= 0; j--) {
      var p = pool[j];
      p.life -= dt;
      if (p.life <= 0) { pool[j] = pool[pool.length - 1]; pool.pop(); continue; }

      if (push) {
        // Repel, falling off with distance: the cursor opens a wake through
        // filaments that are already in flight.
        var dx = p.x - pointer.x, dy = p.y - pointer.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < 32000 && d2 > 1) {
          var f = (1 - d2 / 32000) * 900 / Math.sqrt(d2);
          p.vx += dx * f * dt;
          p.vy += dy * f * dt;
        }
      }

      p.vx *= (1 - 1.25 * dt);       // drag, so filaments settle into dust
      p.vy *= (1 - 1.25 * dt);
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
  }

  function draw() {
    // Trails: wash the frame toward black instead of clearing it, which is
    // what leaves the filaments behind the moving head of each particle.
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < pool.length; i++) {
      var p = pool[i];
      var l = p.life / p.max;
      var alpha = l * l * 0.85;
      ctx.fillStyle = 'hsla(' + p.hue + ',92%,' + (46 + 34 * l) + '%,' + alpha + ')';
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }

    // The hot core, which is the only part of the burst that reads as light
    // rather than as dust.
    var r = (26 + 54 * Math.min(1, pulse)) * scale;
    var g = ctx.createRadialGradient(core.x, core.y, 0, core.x, core.y, r);
    g.addColorStop(0,    'rgba(255,238,205,' + (0.5 + 0.35 * Math.min(1, pulse)) + ')');
    g.addColorStop(0.25, 'rgba(255,150,60,0.30)');
    g.addColorStop(1,    'rgba(190,40,30,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(core.x, core.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }

  /* ── pointer ────────────────────────────────────────────────────────── */
  function toLocal(e) {
    var r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  window.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;        // let a touch scroll the page
    var p = toLocal(e);
    var r = canvas.getBoundingClientRect();
    if (p.x < 0 || p.y < 0 || p.x > r.width || p.y > r.height) {
      pointer.active = false;
      return;
    }
    if (pointer.active) {
      pointer.vx = p.x - pointer.x;
      pointer.vy = p.y - pointer.y;
    }
    pointer.x = p.x;
    pointer.y = p.y;
    pointer.active = true;
  }, { passive: true });

  canvas.addEventListener('pointerdown', function (e) {
    var p = toLocal(e);
    pointer.x = p.x; pointer.y = p.y; pointer.active = true;
    core.x = p.x; core.y = p.y;
    bloom(1);
  });

  window.addEventListener('blur', function () { pointer.active = false; });

  /* ── loop ───────────────────────────────────────────────────────────── */
  var last = 0, frame = 0, visible = true;

  // Reading computed opacity forces a style recalc, so it is sampled rather
  // than read every frame. A twelfth of a second of latency on a five-second
  // slot is not perceptible.
  function checkVisible() {
    if (document.hidden) return false;
    var o = parseFloat(getComputedStyle(canvas).opacity);
    return !(o >= 0 && o < 0.02);
  }

  function loop(ts) {
    requestAnimationFrame(loop);
    if (!last) { last = ts; return; }
    var dt = Math.min((ts - last) / 1000, 0.05);   // clamp, so a tab return
    last = ts;                                      // does not detonate it

    if ((frame++ % 8) === 0) visible = checkVisible();
    if (!visible) { pointer.vx = pointer.vy = 0; return; }

    if (!W || !H) resize();
    step(dt);
    draw();
    pointer.vx *= 0.82;
    pointer.vy *= 0.82;
  }

  var ro = window.ResizeObserver ? new ResizeObserver(resize) : null;
  if (ro) ro.observe(canvas); else window.addEventListener('resize', resize);

  resize();
  core.x = W / 2; core.y = H / 2;
  bloom(0.6);
  requestAnimationFrame(loop);
})();
