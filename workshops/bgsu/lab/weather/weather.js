/* ── Weather ──────────────────────────────────────────────────────────────────
   A simulation, not a sequencer. Masses drift across a field under conditions
   you set, and the music is what happens where two of them meet.

   Why a system and not a score: a score is finite, and the thing wanted here is
   something that can run all day without a decision in it. The conditions are
   the whole interface — warmth, weight, movement, size — and they are
   deliberately not musical terms. You cannot place a note. You can only make
   the kind of weather in which a certain note becomes likely, which is the
   difference between composing and gardening.

   Four parts:
     1  The field        masses, drifting, under the conditions
     2  The conditions   four dials, none of them musical
     3  The meetings     where two masses overlap, something sounds
     4  The bed          the field layer underneath, shared with A Day
   ──────────────────────────────────────────────────────────────────────────── */
(function (root) {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var cv = $('field'), ctx = cv.getContext('2d');
  var W, H, DPR = Math.min(devicePixelRatio || 1, 2);
  function size() { W = innerWidth; H = innerHeight;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); }
  addEventListener('resize', size, { passive: true }); size();

  /* ── 2. The conditions ────────────────────────────────────────────────────
     Not pitch, not tempo, not key. The dials describe the air, and the music is
     downstream of them — which is the only way a listener can set something up
     and then stop making decisions. */
  var C = { warmth: 0.52, weight: 0.38, movement: 0.34, size: 0.5 };
  var DIALS = [
    ['warmth', 'Warmth', 'how bright the air is',
      'Opens the filter over everything and lifts the colour of the field. Low is muffled and far away; high is near and bright. It changes how a sound arrives, never which one.'],
    ['weight', 'Weight', 'how low and how thick',
      'Pulls the register down, so a meeting is answered by the low voice rather than the pad. High weight puts a floor under the piece; low weight leaves it hanging.'],
    ['movement', 'Movement', 'how far things drift',
      'How fast the masses cross the field. This is the one that decides how often anything happens at all \u2014 nothing here is on a clock, so more movement is more meetings, and stillness is silence.'],
    ['size', 'Size', 'how large the masses are',
      'How far each mass reaches. Large ones overlap more and hold longer, which thickens the texture; small ones meet rarely and leave more air between events.']
  ];
  var dials = $('dials');
  DIALS.forEach(function (d) {
    var wrap = document.createElement('div'); wrap.className = 'w-dial';
    var lab = document.createElement('label');
    lab.innerHTML = '<span class="w-dial__n">' + d[1] + '</span><b>' + Math.round(C[d[0]] * 100) + '</b>';

    /* What the dial does, said in a sentence and shown when it is asked for.
       None of these names is musical on purpose, so none of them explains
       itself \u2014 which makes the mark beside it part of the instrument rather
       than a courtesy to it. */
    var info = document.createElement('button');
    info.type = 'button'; info.className = 'op-info'; info.textContent = 'i';
    info.setAttribute('aria-label', 'What ' + d[1] + ' does');
    info.setAttribute('aria-expanded', 'false');
    lab.querySelector('.w-dial__n').appendChild(info);

    var note = document.createElement('p');
    note.className = 'op-note'; note.hidden = true; note.textContent = d[3];
    info.addEventListener('click', function (e) {
      e.preventDefault();
      var open = info.getAttribute('aria-expanded') === 'true';
      info.setAttribute('aria-expanded', open ? 'false' : 'true');
      note.hidden = open;
    });

    var inp = document.createElement('input');
    inp.type = 'range'; inp.min = 0; inp.max = 100; inp.value = Math.round(C[d[0]] * 100);
    inp.setAttribute('aria-label', d[1] + ' \u2014 ' + d[2]);
    inp.addEventListener('input', function () {
      C[d[0]] = +inp.value / 100;
      lab.querySelector('b').textContent = inp.value;
    });
    wrap.appendChild(lab); wrap.appendChild(inp); wrap.appendChild(note);
    dials.appendChild(wrap);
  });

  /* ── 1. The field ─────────────────────────────────────────────────────────
     Eleven masses. Each carries a pitch class and a colour, drifts on its own
     slow heading, and is turned by the movement dial rather than by a clock. */
  var SCALE = [0, 2, 3, 5, 7, 8, 10];               // D natural minor
  var masses = [];
  for (var i = 0; i < 11; i++) masses.push({
    x: Math.random(), y: Math.random(),
    vx: (Math.random() - .5) * .00035, vy: (Math.random() - .5) * .00025,
    r: .09 + Math.random() * .14,
    deg: Math.floor(Math.random() * 7),
    oct: Math.floor(Math.random() * 3) - 1,
    hue: 196 + Math.random() * 150,
    lit: 0
  });

  var lastMeet = {};                                  // so one meeting sounds once

  function step() {
    var spd = 0.25 + C.movement * 2.6;
    masses.forEach(function (m) {
      m.x += m.vx * spd; m.y += m.vy * spd;
      if (m.x < -.3) m.x = 1.3; if (m.x > 1.3) m.x = -.3;
      if (m.y < -.3) m.y = 1.3; if (m.y > 1.3) m.y = -.3;
      m.lit *= 0.985;
    });
  }

  /* ── 3. The meetings ──────────────────────────────────────────────────────
     Two masses overlapping is the event. Nothing is scheduled: whether anything
     sounds this minute is a question about where things have drifted to. */
  function meetings(now) {
    var out = [];
    for (var a = 0; a < masses.length; a++)
      for (var b = a + 1; b < masses.length; b++) {
        var p = masses[a], q = masses[b];
        var dx = (p.x - q.x) * W, dy = (p.y - q.y) * H;
        var d = Math.sqrt(dx * dx + dy * dy);
        var reach = (p.r + q.r) * Math.min(W, H) * (0.5 + C.size * 0.9);
        if (d < reach) {
          var key = a + ':' + b;
          if (!lastMeet[key] || now - lastMeet[key] > 9000) {
            lastMeet[key] = now;
            out.push({ p: p, q: q, depth: 1 - d / reach });
          }
        }
      }
    return out;
  }

  var audio = null;
  function paint() {
    step();
    var now = performance.now();

    // the air
    var g = ctx.createLinearGradient(0, 0, 0, H);
    var L = 7 + C.warmth * 9;
    g.addColorStop(0, 'hsl(' + (218 - C.warmth * 44) + ',' + (20 + C.weight * 14) + '%,' + (L + 5) + '%)');
    g.addColorStop(1, 'hsl(' + (206 - C.warmth * 34) + ',' + (24 + C.weight * 16) + '%,' + Math.max(4, L - 4) + '%)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    if (audio) meetings(now).forEach(function (mt) { audio.meet(mt); });

    ctx.globalCompositeOperation = 'lighter';
    masses.forEach(function (m) {
      var R = m.r * Math.min(W, H) * (0.5 + C.size * 0.9);
      var x = m.x * W, y = m.y * H;
      var rg = ctx.createRadialGradient(x, y, 0, x, y, R);
      var a = (0.055 + m.lit * 0.30) * (0.5 + C.warmth * 0.9);
      rg.addColorStop(0, 'hsla(' + m.hue + ',' + (52 + C.warmth * 26) + '%,' + (54 + C.warmth * 16) + '%,' + a.toFixed(3) + ')');
      rg.addColorStop(1, 'hsla(' + m.hue + ',60%,54%,0)');
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(x, y, R, 0, 6.2832); ctx.fill();
    });
    ctx.globalCompositeOperation = 'source-over';

    requestAnimationFrame(paint);
  }

  function start() {
    var out  = new Tone.Gain(0.9).toDestination();
    if (root.OpalTransport) root.OpalTransport.mount({ gain: out });
    var verb = new Tone.Reverb({ decay: 18, wet: .8, preDelay: .12 }).connect(out);
    var air  = new Tone.Filter(1200, 'lowpass').connect(verb);

    var pad = new Tone.PolySynth(Tone.AMSynth, { harmonicity: 2.02,
      envelope: { attack: 8, decay: 5, sustain: .74, release: 18 },
      modulationEnvelope: { attack: 10, decay: 4, sustain: .5, release: 14 } }).connect(air);
    pad.volume.value = -23;

    var low = new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'sine' },
      envelope: { attack: 12, decay: 8, sustain: .9, release: 24 } }).connect(air);
    low.volume.value = -18;

    /* 4. the bed — the same field layer A Day uses */
    var field = root.OpalField ? root.OpalField.make(verb, {}) : null;
    if (field) field.weather({ rain: 0, wind: 14 });

    audio = {
      meet: function (mt) {
        var m = mt.p;
        var midi = 38 + SCALE[m.deg % 7] + (m.oct + Math.round(C.weight * -8 + 4)) * 12;
        var f = Tone.Frequency(midi, 'midi').toFrequency();
        var len = 10 + mt.depth * 26 + C.size * 20;
        (midi < 50 ? low : pad).triggerAttackRelease(f, len);
        mt.p.lit = Math.min(1, mt.p.lit + .5); mt.q.lit = Math.min(1, mt.q.lit + .5);
      }
    };

    setInterval(function () {
      air.frequency.rampTo(300 + C.warmth * 3400, 10);
      pad.volume.rampTo(-26 + C.weight * 5, 8);
      if (field) field.conditions({ bright: 0.25 + C.warmth * 0.7 });
      $('read').textContent =
        'warmth ' + Math.round(C.warmth * 100) + '   weight ' + Math.round(C.weight * 100) +
        '   movement ' + Math.round(C.movement * 100) + '   size ' + Math.round(C.size * 100);
    }, 1500);
  }

  $('gate').addEventListener('click', function () {
    Tone.start().then(function () {
      document.documentElement.classList.add('is-on');
      start();
    });
  });

  paint();
})(window);
