/* ── Transport ────────────────────────────────────────────────────────────────
   Pause, volume, mute — shared by the instruments.

   An instrument meant to run for a working day has to be stoppable without
   closing the tab, and quietenable without reaching for the system volume,
   because the system volume is also the volume of the call you are about to
   take. That is the whole argument for this existing.

   Pausing is a fade and then a suspend, not a suspend. Cutting the audio clock
   dead leaves the reverb tail hanging mid-air, which is a sound in itself and a
   worse one than the music. So the master is taken to nothing over a second and
   a half, the context is suspended once it is there, and coming back is the
   same move in reverse.
   ──────────────────────────────────────────────────────────────────────────── */
(function (root) {
  'use strict';

  function mount(opts) {
    opts = opts || {};
    var gain = opts.gain;                       // the master Tone.Gain
    var host = opts.host || document.body;
    var level = 0.9, muted = false, paused = false, fading = null;

    var wrap = document.createElement('div');
    wrap.className = 'op-transport';
    wrap.innerHTML =
      '<button class="op-t__btn" id="opPause" type="button" aria-label="Pause" aria-pressed="false">' +
        '<span class="op-t__glyph" aria-hidden="true">‖</span></button>' +
      '<button class="op-t__btn" id="opMute" type="button" aria-label="Mute" aria-pressed="false">' +
        '<span class="op-t__glyph" aria-hidden="true">●</span></button>' +
      '<label class="op-t__vol"><span class="visually-hidden">Volume</span>' +
        '<input id="opVol" type="range" min="0" max="100" value="90" aria-label="Volume"></label>';
    host.appendChild(wrap);

    var bPause = wrap.querySelector('#opPause'),
        bMute  = wrap.querySelector('#opMute'),
        vol    = wrap.querySelector('#opVol');

    function target() { return paused || muted ? 0 : level; }
    function apply(sec) { if (gain) gain.gain.rampTo(target(), sec === undefined ? 0.4 : sec); }

    function setPaused(on) {
      paused = on;
      bPause.setAttribute('aria-pressed', on ? 'true' : 'false');
      bPause.setAttribute('aria-label', on ? 'Play' : 'Pause');
      bPause.querySelector('.op-t__glyph').textContent = on ? '▶' : '‖';
      wrap.classList.toggle('is-paused', on);
      clearTimeout(fading);
      if (on) {
        apply(1.5);
        // suspended only once the tail has gone, or the tail is what you hear
        fading = setTimeout(function () {
          try { Tone.getContext().rawContext.suspend(); } catch (e) {}
        }, 1700);
      } else {
        try { Tone.getContext().rawContext.resume(); } catch (e) {}
        apply(1.2);
      }
      if (opts.onPause) opts.onPause(on);
    }

    bPause.addEventListener('click', function () { setPaused(!paused); });
    bMute.addEventListener('click', function () {
      muted = !muted;
      bMute.setAttribute('aria-pressed', muted ? 'true' : 'false');
      bMute.setAttribute('aria-label', muted ? 'Unmute' : 'Mute');
      bMute.querySelector('.op-t__glyph').textContent = muted ? '○' : '●';
      wrap.classList.toggle('is-muted', muted);
      apply(0.5);
    });
    vol.addEventListener('input', function () {
      level = (+vol.value / 100) * 0.9;
      if (muted) { muted = false; bMute.setAttribute('aria-pressed', 'false');
        bMute.querySelector('.op-t__glyph').textContent = '●'; wrap.classList.remove('is-muted'); }
      apply(0.15);
    });

    /* Space and M, because a tool you leave running is a tool you will want to
       silence without finding it on the screen first. Not while typing. */
    addEventListener('keydown', function (e) {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName || '')) ) return;
      if (e.code === 'Space') { e.preventDefault(); setPaused(!paused); }
      if (e.key === 'm' || e.key === 'M') bMute.click();
    });

    return { pause: setPaused, isPaused: function () { return paused; } };
  }

  root.OpalTransport = { mount: mount };
})(window);
