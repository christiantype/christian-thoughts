/* ── A Day ────────────────────────────────────────────────────────────────────
   Music for a day, and a painting that takes a day to make.

   What makes this not a loop: the playhead is the clock. It crosses the field
   once, at the speed of the actual day, and the piece is over when the day is.
   Nothing is saved and nothing repeats — the five layers underneath run on
   periods that do not divide into one another (13, 17, 23, 31 and 43 minutes),
   so their phase relationships take weeks to come round. That is Eno's method
   and the only one that gives back more than it was given.

   Kandinsky, in Point and Line to Plane, holds that a mark carries weight,
   direction, tension and a temporal character, and that these are musical terms
   because nothing else was precise enough. Here that is taken at its word:
   every sound puts a mark on the field at the place and the size the sound has,
   and the mark lasts as long as the sound does. The picture is not a
   visualisation. It is the same event, seen.

   Four parts:
     1  The field      the day, the light, and the line crossing it
     2  The marks      what is on your day, each with a character
     3  The layers     what plays underneath, never in step
     4  The sky        the light and the weather, which you do not set
   ──────────────────────────────────────────────────────────────────────────── */
(function (root) {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var cv = $('field'), ctx = cv.getContext('2d');
  var W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);

  /* ── 2. The marks ─────────────────────────────────────────────────────────
     Not notes and not instruments: characters a stretch of day can have. Each
     is a set of conditions the engine reads. Meeting is the important one — it
     refuses transients altogether, because a sound with an edge on it takes
     attention from a person who is speaking. */
  var KINDS = {
    rest:    { name: 'Rest',    hue: 224, density: .10, bright: .20, reg: -12, strike: 0,   drift: .22 },
    meeting: { name: 'Meeting', hue: 28,  density: .06, bright: .14, reg: -7,  strike: 0,   drift: .10 },
    deep:    { name: 'Focus',   hue: 150, density: .22, bright: .36, reg: -3,  strike: .06, drift: .38 },
    warm:    { name: 'Lunch',   hue: 352, density: .34, bright: .60, reg: 2,   strike: .30, drift: .55 },
    open:    { name: 'Open',    hue: 46,  density: .18, bright: .42, reg: 0,   strike: .14, drift: .32 }
  };
  var ORDER = ['rest', 'meeting', 'deep', 'warm', 'open'];
  var kind = 'deep';
  var marks = [];                      // { from, to, kind } in hours

  /* ── 4. The sky ───────────────────────────────────────────────────────────
     What you do not set. Sunrise and sunset put a curve under the whole day, so
     register and color follow the light rather than the clock; pressure sets
     how thick the air is, temperature how bright, wind how far the layers drift
     against each other. Fetched once and left — weather that updates every
     minute is a readout, and this is a condition. */
  var sky = { sunrise: 6.5, sunset: 19.5, temp: 14, press: 1013, wind: 8, rain: 0, ready: false };

  function loadSky(lat, lon) {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon +
          '&current=temperature_2m,pressure_msl,wind_speed_10m,precipitation&daily=sunrise,sunset' +
          '&timezone=auto&forecast_days=1')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var hrs = function (s) { var t = s.split('T')[1].split(':'); return +t[0] + (+t[1]) / 60; };
        sky.sunrise = hrs(d.daily.sunrise[0]);
        sky.sunset  = hrs(d.daily.sunset[0]);
        sky.temp    = d.current.temperature_2m;
        sky.press   = d.current.pressure_msl;
        sky.wind    = d.current.wind_speed_10m;
        sky.rain    = d.current.precipitation || 0;
        sky.ready   = true; say();
      })
      .catch(function () { sky.ready = true; say(); });
  }
  loadSky(41.8781, -87.6298);                    // Chicago, until the browser says otherwise
  if (navigator.geolocation) navigator.geolocation.getCurrentPosition(
    function (p) { loadSky(p.coords.latitude.toFixed(3), p.coords.longitude.toFixed(3)); },
    function () {}, { timeout: 6000, maximumAge: 36e5 });

  function say() {
    $('sky').textContent = sky.ready
      ? Math.round(sky.temp) + '°   ' + Math.round(sky.press) + ' hPa   ' +
        Math.round(sky.wind) + ' km/h   light ' + clock(sky.sunrise) + '–' + clock(sky.sunset)
      : '—';
  }
  function clock(h) {
    var hh = Math.floor(h) % 24, mm = Math.round((h - Math.floor(h)) * 60);
    if (mm === 60) { mm = 0; hh = (hh + 1) % 24; }
    return (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm;
  }
  function nowHours() {
    var d = new Date(); return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
  }

  /* how much light there is at a given hour: nothing at night, one at midday */
  function light(h) {
    if (h <= sky.sunrise - 1 || h >= sky.sunset + 1) return 0;
    var t = (h - (sky.sunrise - 1)) / ((sky.sunset + 1) - (sky.sunrise - 1));
    return Math.sin(Math.PI * Math.max(0, Math.min(1, t)));
  }

  function conditionsAt(h) {
    var k = KINDS.open;
    for (var i = 0; i < marks.length; i++)
      if (h >= marks[i].from && h < marks[i].to) { k = KINDS[marks[i].kind]; break; }
    var day   = light(h);
    var heavy = Math.max(0, Math.min(1, (1018 - sky.press) / 28));
    var warm  = Math.max(0, Math.min(1, (sky.temp + 5) / 35));
    return {
      k: k, day: day,
      density: k.density * (0.75 + day * 0.5) * (1 + heavy * 0.35),
      bright:  Math.max(0.05, k.bright * (0.45 + day * 0.75) * (0.7 + warm * 0.6)),
      reg:     k.reg + Math.round(day * 5 - 2),
      strike:  k.strike * (0.4 + day * 0.8),
      drift:   k.drift * (0.6 + Math.min(1, sky.wind / 28) * 0.9)
    };
  }

  /* ── 1. The field ─────────────────────────────────────────────────────────
     The whole day across the screen, and the light under it. Nothing scrolls:
     a day you have to scroll is a day you cannot see. */
  function size() {
    W = innerWidth; H = innerHeight;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  addEventListener('resize', size, { passive: true });
  size();

  /* The ground: deep indigo before dawn, opening through the morning, pale at
     noon, down again by evening. Two stops, one for the hour at the left of the
     screen and one for the right, so the field itself is a day. */
  function ground(h) {
    var d = light(h);
    var top = [
      9 + d * 13,                          // lightness: night, to a gray morning
      216 - d * 30,                        // hue: indigo toward a cool gray
      22 - d * 11                          // saturation
    ];
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, 'hsl(' + top[1] + ',' + top[2] + '%,' + (top[0] + 6) + '%)');
    g.addColorStop(0.55, 'hsl(' + (top[1] - 10) + ',' + (top[2] + 4) + '%,' + top[0] + '%)');
    g.addColorStop(1, 'hsl(' + (top[1] - 24) + ',' + (top[2] + 8) + '%,' + Math.max(5, top[0] - 7) + '%)');
    return g;
  }

  /* ── what the timeline shows ──────────────────────────────────────────────
     A track for the day and a lane for each layer under it. The lanes are the
     point: five voices on periods that do not divide into one another, drawn so
     you can see them failing to line up. A lane brightens while its voice is
     sounding and goes back down as the note releases, so the picture is a
     reading of the piece rather than a decoration on it. */
  var lanes = [];                       // { on, until, step }
  var pulses = [];                      // short-lived marks for struck notes

  function trackBox() {
    var pad = Math.max(28, W * 0.045);
    var top = Math.max(120, H * 0.30);
    return { x: pad, y: top, w: W - pad * 2, h: Math.max(92, H * 0.17) };
  }
  function laneBox() {
    var t = trackBox();
    return { x: t.x, y: t.y + t.h + Math.max(34, H * 0.07), w: t.w, h: Math.max(110, H * 0.22) };
  }

  function paint() {
    var h = nowHours();
    var T = trackBox(), L = laneBox();
    var x = T.x + (h / 24) * T.w;

    // the ground, carrying the light
    ctx.fillStyle = ground(h);
    ctx.fillRect(0, 0, W, H);

    /* ── the day track ────────────────────────────────────────────────────── */
    // the light across the day, as a band inside the track
    for (var i = 0; i < 96; i++) {
      var hh = (i / 96) * 24, l = light(hh);
      ctx.fillStyle = 'rgba(255,255,255,' + (0.025 + l * 0.085).toFixed(3) + ')';
      ctx.fillRect(T.x + (i / 96) * T.w, T.y, T.w / 96 + 1, T.h);
    }

    // what you have put on the day
    marks.forEach(function (m) {
      var k = KINDS[m.kind];
      var x0 = T.x + (m.from / 24) * T.w, x1 = T.x + (m.to / 24) * T.w;
      ctx.fillStyle = 'hsla(' + k.hue + ',52%,60%,.30)';
      ctx.fillRect(x0, T.y, x1 - x0, T.h);
      ctx.fillStyle = 'hsla(' + k.hue + ',62%,70%,.95)';
      ctx.fillRect(x0, T.y, 1.5, T.h);
      if (x1 - x0 > 56) {
        ctx.font = '400 10px "Untitled Sans", system-ui, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,.82)';
        ctx.fillText(k.name.toUpperCase(), x0 + 9, T.y + 18);
      }
    });

    // the track's own rule, and the hours on it
    ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 1;
    ctx.strokeRect(T.x + .5, T.y + .5, T.w - 1, T.h - 1);
    ctx.font = '400 10px "Untitled Sans", system-ui, sans-serif';
    for (var hr = 0; hr <= 24; hr += 2) {
      var hx = T.x + (hr / 24) * T.w;
      var major = hr % 6 === 0;
      ctx.fillStyle = 'rgba(255,255,255,' + (major ? .34 : .16) + ')';
      ctx.fillRect(hx, T.y + T.h, 1, major ? 9 : 5);
      if (major && hr < 24) ctx.fillText((hr < 10 ? '0' : '') + hr + ':00', hx + 6, T.y + T.h + 20);
    }

    /* ── the lanes ────────────────────────────────────────────────────────── */
    var lh = L.h / PERIODS.length, now = performance.now();
    PERIODS.forEach(function (per, i) {
      var y = L.y + i * lh + lh / 2;
      var st = lanes[i] || { on: false };
      var live = st.on && now < st.until;

      // the lane
      ctx.strokeStyle = 'rgba(255,255,255,.10)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(L.x, y); ctx.lineTo(L.x + L.w, y); ctx.stroke();

      /* Two hours either side of now, not the whole day. Drawn across
         twenty-four hours a thirteen-minute period is a hundred and ten cycles
         and reads as noise; across four it is nine, against the forty-three's
         three — and the thing you can finally see is that they do not line up,
         which is the whole mechanism. */
      var WINDOW = 4 * 60;                              // minutes across the lane
      var t0 = nowHours() * 60 - WINDOW / 2;
      ctx.beginPath();
      for (var px = 0; px <= L.w; px += 2) {
        var t = t0 + (px / L.w) * WINDOW;
        var v = Math.sin(((t / per) + (st.phase || 0)) * Math.PI * 2);
        var yy = y + v * (lh * 0.32);
        px ? ctx.lineTo(L.x + px, yy) : ctx.moveTo(L.x + px, yy);
      }
      ctx.strokeStyle = live
        ? 'hsla(' + (st.hue || 200) + ',70%,70%,.92)'
        : 'rgba(255,255,255,.17)';
      ctx.lineWidth = live ? 1.6 : 1; ctx.stroke();

      // how long this layer's note has left to run
      if (live) {
        var frac = 1 - (st.until - now) / st.len;
        ctx.fillStyle = 'hsla(' + st.hue + ',70%,70%,.26)';
        ctx.fillRect(L.x, y - lh * 0.34, L.w * frac, lh * 0.68);
      }

      ctx.font = '400 9px "Untitled Sans", system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,' + (live ? .72 : .3) + ')';
      ctx.fillText(per + ' MIN', L.x + L.w + 10, y + 3);
      if (i === PERIODS.length - 1) {                   // now, read down the lanes
        ctx.fillStyle = 'rgba(255,255,255,.18)';
        ctx.fillRect(L.x + L.w / 2, L.y, 1, L.h);
      }
    });

    /* struck notes: a short vertical on the track, where and when they land */
    for (var q = pulses.length - 1; q >= 0; q--) {
      var pu = pulses[q], age = (now - pu.t) / 2600;
      if (age >= 1) { pulses.splice(q, 1); continue; }
      ctx.fillStyle = 'hsla(' + pu.hue + ',80%,74%,' + ((1 - age) * .9).toFixed(3) + ')';
      ctx.fillRect(pu.x, T.y - 14 - (1 - age) * 10, 1.5, 12);
    }

    /* where you are */
    ctx.fillStyle = 'rgba(255,255,255,.92)';
    ctx.fillRect(Math.round(x), T.y - 22, 1, T.h + 30);
    ctx.beginPath(); ctx.arc(x, T.y - 22, 3, 0, 6.2832); ctx.fill();

    /* the stretch being dragged */
    if (dragging) {
      var a0 = T.x + Math.min(dragging.from, dragging.to === undefined ? dragging.from : dragging.to) / 24 * T.w;
      var a1 = T.x + Math.max(dragging.from, dragging.to === undefined ? dragging.from : dragging.to) / 24 * T.w;
      ctx.fillStyle = 'hsla(' + KINDS[kind].hue + ',60%,64%,.26)';
      ctx.fillRect(a0, T.y, a1 - a0, T.h);
    }
    requestAnimationFrame(paint);
  }

  /* dragging a stretch of day */
  var dragging = null;
  function hourAt(e) {
    var T = trackBox();
    var cx = (e.touches ? e.touches[0].clientX : e.clientX) - T.x;
    return Math.max(0, Math.min(24, (cx / T.w) * 24));
  }
  cv.addEventListener('mousedown', function (e) { dragging = { from: hourAt(e) }; });
  cv.addEventListener('touchstart', function (e) { dragging = { from: hourAt(e) }; e.preventDefault(); }, { passive: false });
  addEventListener('mousemove', function (e) { if (dragging) dragging.to = hourAt(e); });
  addEventListener('touchmove', function (e) { if (dragging) { dragging.to = hourAt(e); e.preventDefault(); } }, { passive: false });
  function release() {
    if (!dragging || dragging.to === undefined) { dragging = null; return; }
    var a = Math.min(dragging.from, dragging.to), b = Math.max(dragging.from, dragging.to);
    if (b - a > 0.2) {
      marks = marks.filter(function (m) { return m.to <= a || m.from >= b; });
      marks.push({ from: a, to: b, kind: kind });
      marks.sort(function (p, q) { return p.from - q.from; });
    }
    dragging = null;
    window.__marks = marks;          // so the harness can see what landed
  }
  addEventListener('mouseup', release); addEventListener('touchend', release);

  var bar = $('marks');
  ORDER.forEach(function (k) {
    var b = document.createElement('button');
    b.className = 'd-mark'; b.type = 'button'; b.textContent = KINDS[k].name;
    b.setAttribute('aria-pressed', k === kind ? 'true' : 'false');
    b.addEventListener('click', function () {
      kind = k;
      [].forEach.call(bar.children, function (c) { c.setAttribute('aria-pressed', 'false'); });
      b.setAttribute('aria-pressed', 'true');
      $('say').textContent = 'Drag across the field to mark ' + KINDS[k].name.toLowerCase();
    });
    bar.appendChild(b);
  });

  /* ── 3. The layers ────────────────────────────────────────────────────────
     Five voices on periods that do not divide into one another. Their phase
     relationships take weeks to come round, which is why nothing repeats
     without anything being randomised. */
  var PERIODS = [13, 17, 23, 31, 43];
  var SCALE = [0, 2, 3, 5, 7, 8, 10];            // D natural minor

  function startAudio() {
    var out  = new Tone.Gain(0.9).toDestination();
    if (root.OpalTransport) root.OpalTransport.mount({ gain: out });
    var verb = new Tone.Reverb({ decay: 16, wet: 0.74, preDelay: 0.1 }).connect(out);
    var air  = new Tone.Filter(900, 'lowpass').connect(verb);

    var drone = new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'sine' },
      envelope: { attack: 10, decay: 6, sustain: .88, release: 20 } }).connect(air);
    drone.volume.value = -20;

    var pad = new Tone.PolySynth(Tone.AMSynth, { harmonicity: 2.01,
      envelope: { attack: 7, decay: 4, sustain: .72, release: 15 },
      modulationEnvelope: { attack: 9, decay: 3, sustain: .5, release: 12 } }).connect(air);
    pad.volume.value = -24;

    var bell = new Tone.FMSynth({ harmonicity: 3.01, modulationIndex: 7,
      envelope: { attack: .01, decay: 3.4, sustain: 0, release: 5 } }).connect(verb);
    bell.volume.value = -28;

    /* ── 5. The field ────────────────────────────────────────────────────
       Rain, water, traffic and air under the voices. Synthesised for now and
       built to take recordings: give OpalField a url per bed and it granulates
       the file instead, which is where Christian's own recordings go. The beds
       read the same conditions the synths do, and the weather decides what is
       under the day — if it is raining where you are, you hear rain. */
    var field = root.OpalField ? root.OpalField.make(verb, {
      // recordings: { rain: '/workshops/bgsu/lab/day/beds/rain.mp3', water: ..., traffic: ..., air: ... }
    }) : null;
    if (field) field.weather(sky);

    /* ── 6. The shift ──────────────────────────────────────────────────────
       The root moves. Every twenty-odd minutes it steps to another degree of
       the scale, and the whole field is heard against a different floor without
       anything announcing it. This is what keeps eight hours from settling: the
       layers never repeat because of their periods, but without a shift the
       harmony would still be one chord all day, and one chord all day is a
       drone and not a piece. */
    var tonic = 0;
    (function shift() {
      setTimeout(function () {
        tonic = SCALE[Math.floor(Math.random() * SCALE.length)] - 3;
        shift();
      }, (16 + Math.random() * 14) * 60 * 1000);
    })();

    function freq(reg, step) {
      var deg = SCALE[((step % 7) + 7) % 7];
      return Tone.Frequency(38 + tonic + deg + Math.floor(step / 7) * 12 + reg, 'midi').toFrequency();
    }

    /* ── 7. The chimes ─────────────────────────────────────────────────────
       Wind chimes behave in gusts, not in time: a flurry of strikes and then
       nothing, for as long as the air takes to move again. So they are not on a
       clock — a gust arrives, strikes five or nine of the tubes in a handful of
       seconds, and the next one is as far off as the wind is slow. Five tubes,
       pentatonic, because a chime maker tunes out the semitones for the same
       reason: any two tubes have to be able to ring together. */
    var tubes = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 5.1, modulationIndex: 11,
      oscillator: { type: 'sine' }, modulation: { type: 'triangle' },
      envelope: { attack: .002, decay: 5.5, sustain: 0, release: 6 },
      modulationEnvelope: { attack: .004, decay: .6, sustain: 0, release: 1 }
    }).connect(verb);
    tubes.volume.value = -26;

    var PENT = [0, 2, 5, 7, 9];
    function gust() {
      var c = conditionsAt(nowHours());
      var windy = Math.min(1, (sky.wind || 6) / 26);
      var n = 2 + Math.floor(Math.random() * (3 + windy * 7));
      if (c.k.strike > 0) {                       // a meeting gets no chimes at all
        for (var i = 0; i < n; i++) setTimeout(function () {
          var deg = PENT[Math.floor(Math.random() * PENT.length)];
          var oct = 12 * (1 + Math.floor(Math.random() * 2));
          tubes.triggerAttackRelease(
            Tone.Frequency(60 + tonic + deg + oct + Math.round(c.reg / 2), 'midi').toFrequency(),
            2 + Math.random() * 3,
            undefined,
            0.25 + Math.random() * 0.45);
        }, Math.random() * (900 + windy * 2600));
      }
      setTimeout(gust, (18 + Math.random() * 70) * 1000 / (0.5 + windy));
    }
    setTimeout(gust, 6000);

    /* ── 8. The figure ─────────────────────────────────────────────────────
       Something to recognize. Five degrees, decided once and then carried for
       the rest of the movement: played slowly, a note at a time, with the gaps
       between them longer than the notes. It comes round every few minutes
       transposed and on a different voice, so it is the same shape and never
       the same event — which is the only kind of recurrence that survives being
       heard all day. */
    var figure = [0, 2, 4, 2, 5].map(function () { return Math.floor(Math.random() * 7); });
    (function sayFigure() {
      var c = conditionsAt(nowHours());
      var lift = Math.floor(Math.random() * 3) * 2;       // a different height each pass
      var voice = Math.random() < .45 ? tubes : pad;
      figure.forEach(function (d, i) {
        setTimeout(function () {
          if (conditionsAt(nowHours()).k.density < .08) return;   // not through a meeting
          voice.triggerAttackRelease(
            freq(c.reg + 12, d + lift),
            voice === tubes ? 3 : 9,
            undefined,
            voice === tubes ? .4 : .5);
        }, i * (5200 + Math.random() * 4200));
      });
      // and once in a while the shape itself is rewritten
      if (Math.random() < .22)
        figure = figure.map(function () { return Math.floor(Math.random() * 7); });
      setTimeout(sayFigure, (3.5 + Math.random() * 4) * 60 * 1000);
    })();

    PERIODS.forEach(function (per, i) {
      var every = per * 60 * 1000;
      (function tick() {
        var c = conditionsAt(nowHours());
        air.frequency.rampTo(380 + c.bright * 2800, 9);
        if (field) { field.weather(sky); field.conditions(c); }

        if (Math.random() < 0.35 + c.density) {
          var step = Math.floor(Math.random() * 7) - 2 + i;
          var f = freq(c.reg, step);
          var len = per * 60 * (i < 2 ? 0.9 : 0.6);
          (i < 2 ? drone : pad).triggerAttackRelease(f, len);
          lanes[i] = { on: true, len: len * 1000, until: performance.now() + len * 1000,
                       hue: c.k.hue + (Math.random() - .5) * 26,
                       phase: (lanes[i] && lanes[i].phase || 0) + 0.11, step: step };
        }

        if (Math.random() < c.strike) setTimeout(function () {
          var s = Math.floor(Math.random() * 7);
          bell.triggerAttackRelease(freq(c.reg + 12, s), 0.8);
          var T2 = trackBox();
          pulses.push({ x: T2.x + (nowHours() / 24) * T2.w,
                        hue: c.k.hue + 30, t: performance.now() });
        }, Math.random() * 9000);

        setTimeout(tick, every * (0.8 + Math.random() * 0.4));
      })();
    });
  }

  $('gate').addEventListener('click', function () {
    Tone.start().then(function () {
      document.documentElement.classList.add('is-on');
      startAudio();
    });
  });

  say(); paint();
  setInterval(function () { $('now').textContent = clock(nowHours()); }, 1000);
})(window);
