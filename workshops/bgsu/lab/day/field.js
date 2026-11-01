/* ── The field layer ──────────────────────────────────────────────────────────
   Weather, water and traffic, under the synthesised voices.

   Schafer's argument in The Tuning of the World — cited in OP/AL's Sound
   position — is that the soundscape is a designed object with the same standing
   as a built one, and that every recording performs a split between a sound and
   its source, which he calls schizophonia. An instrument for a working day that
   makes only synthetic sound is arguing one thing and doing another. This is
   the other half.

   Two ways to make a bed:

     a recording   granulated, never looped. Short grains scattered at varying
                   rate and pitch, so three minutes of material plays for eight
                   hours and never seams. Give a bed a `url` and it works this
                   way. This is what Christian's own recordings go into.

     synthesised   noise shaped until it behaves like the thing. Honest for
                   rain, water, wind and traffic, which are all filtered noise
                   with a envelope on them. NOT honest for birds — a synthesised
                   bird is a parody of one, so that bed stays empty until there
                   is a recording to put in it.

   Either way the bed reads the same conditions the synths do, so a meeting
   pulls the high end out of the traffic and rest brings the water forward.
   ──────────────────────────────────────────────────────────────────────────── */
(function (root) {
  'use strict';

  function makeField(dest, opts) {
    opts = opts || {};
    var beds = {};

    /* ── a bed from a recording ─────────────────────────────────────────────
       Tone's GrainPlayer reads a buffer as grains rather than as a line, so the
       playback rate and the pitch come apart and nothing has to loop. */
    function fromFile(url, cfg) {
      var g = new Tone.GrainPlayer({
        url: url, loop: true, grainSize: cfg.grain || 0.22, overlap: cfg.overlap || 0.14,
        playbackRate: cfg.rate || 1, detune: 0
      });
      var filt = new Tone.Filter(cfg.cut || 1800, 'lowpass');
      var vol  = new Tone.Gain(0);
      g.connect(filt); filt.connect(vol); vol.connect(dest);
      Tone.loaded().then(function () { try { g.start(); } catch (e) {} });
      return { kind: 'file', g: g, filt: filt, vol: vol, cfg: cfg,
        drift: function () { g.detune = (Math.random() - .5) * (cfg.detune || 180); } };
    }

    /* ── a bed from noise ───────────────────────────────────────────────────
       Rain is hiss plus patter. Water is hiss through something resonant that
       moves. Traffic is the low end with slow swells on it, because a car is a
       swell. Wind is the same with the cutoff wandering. */
    function fromNoise(cfg) {
      var n    = new Tone.Noise(cfg.colour || 'pink');
      var filt = new Tone.Filter({ frequency: cfg.cut || 1200, type: cfg.type || 'lowpass', Q: cfg.q || 0.7 });
      var vol  = new Tone.Gain(0);
      n.connect(filt); filt.connect(vol); vol.connect(dest);
      n.start();

      /* The slow movement that makes noise sound like weather rather than like
         noise. Walked on a timer rather than driven by an LFO: an LFO connected
         to the cutoff owns that parameter, and the conditions have to be able
         to move it too — two things writing one signal is what Tone refuses,
         and rightly. */
      var walk = null, home = cfg.cut || 1200;
      (function sway() {
        walk = setTimeout(function () {
          var target = home * (0.65 + Math.random() * 0.8);
          filt.frequency.rampTo(Math.max(120, target), 9 + Math.random() * 14);
          sway();
        }, (8 + Math.random() * 16) * 1000);
      })();

      var drops = null;
      if (cfg.patter) {                       // rain: the grains on top of the hiss
        var dn  = new Tone.Noise('white');
        var dEnv = new Tone.AmplitudeEnvelope({ attack: .001, decay: .035, sustain: 0, release: .02 });
        var dF  = new Tone.Filter(cfg.patter, 'bandpass');
        var dG  = new Tone.Gain(0);
        dn.connect(dEnv); dEnv.connect(dF); dF.connect(dG); dG.connect(dest); dn.start();
        drops = { env: dEnv, gain: dG, timer: null };
        (function tick() {
          drops.timer = setTimeout(function () {
            if (dG.gain.value > 0.001) dEnv.triggerAttackRelease(0.02);
            tick();
          }, 18 + Math.random() * 90);
        })();
      }
      return { kind: 'noise', n: n, filt: filt, vol: vol, drops: drops, cfg: cfg,
               setHome: function (f) { home = f; } };
    }

    /* The four that synthesise honestly. Birds are deliberately absent. */
    var DEFS = {
      rain:    { colour: 'pink',  cut: 2600, sway: .035, patter: 5200, base: .030 },
      water:   { colour: 'pink',  cut: 900,  sway: .021, q: 2.2, type: 'bandpass', base: .026 },
      traffic: { colour: 'brown', cut: 320,  sway: .012, base: .034 },
      air:     { colour: 'pink',  cut: 700,  sway: .008, base: .022 }
    };

    Object.keys(DEFS).forEach(function (k) {
      var url = (opts.recordings || {})[k];
      beds[k] = url ? fromFile(url, DEFS[k]) : fromNoise(DEFS[k]);
      beds[k].base = DEFS[k].base;
    });

    var mix = { rain: 0, water: .5, traffic: .25, air: .6 };

    return {
      beds: beds,

      /* The weather decides what is under the day. Rain is not a mood here: if
         it is raining where you are, you hear rain. */
      weather: function (sky) {
        var wet = Math.max(0, Math.min(1, (sky.rain || 0) / 2.5));
        mix.rain    = wet;
        mix.water   = 0.30 + wet * 0.35;
        mix.air     = 0.25 + Math.min(1, (sky.wind || 0) / 30) * 0.85;
        mix.traffic = 0.35;
      },

      /* And the day decides how it is heard. A meeting takes the top off
         everything, which is what makes a room feel further away. */
      conditions: function (c) {
        Object.keys(beds).forEach(function (k) {
          var b = beds[k];
          var g = b.base * mix[k] * (0.35 + c.bright * 1.25);
          b.vol.gain.rampTo(g, 6);
          var cut = (b.cfg.cut || 1200) * (0.4 + c.bright * 1.5);
          if (b.setHome) b.setHome(Math.max(140, cut));      // the walk wanders around this
          else if (b.filt) b.filt.frequency.rampTo(Math.max(140, cut), 8);
          if (b.drops) b.drops.gain.gain.rampTo(k === 'rain' ? 0.05 * mix.rain * (0.3 + c.bright) : 0, 6);
          if (b.drift) b.drift();
        });
      }
    };
  }

  root.OpalField = { make: makeField };
})(window);
