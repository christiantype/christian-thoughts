/* Heart, Intuition and Technology: the talk and the workshop share this script */
(function () {
  'use strict';
  /* the frame stays white while the red screen is up */
  // (any red screen: the title and, since 1 Nov, the closing run of red screens)
  var reds = new Set();
  if ('IntersectionObserver' in window) {
    var redIO = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.intersectionRatio > 0.5) reds.add(en.target); else reds.delete(en.target); });
      document.body.classList.toggle('on-red', reds.size > 0);
    }, { threshold: [0, 0.5, 1] });
    document.querySelectorAll('.s.red, .s.black, .s.proj--fit').forEach(function (sec) { redIO.observe(sec); });   // (and the blue of Lake Opeka, where difference turned it orange)
    // over the golden yellow of the closing screens the frame is plain black (difference turned it blue)
    var golds = new Set(), goldIO = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.intersectionRatio > 0.5) golds.add(en.target); else golds.delete(en.target); });
      document.body.classList.toggle('on-gold', golds.size > 0);
    }, { threshold: [0, 0.5, 1] });
    document.querySelectorAll('.s.gold').forEach(function (sec) { goldIO.observe(sec); });
  }

  /* the title as a true particle dispersion. The two lines are drawn once, offscreen, exactly where the
     real text sits, and every few pixels of ink becomes a particle with a home. A wave runs across the
     words: as it passes, particles lift off on a drifting current, scatter and fade, then come back out
     of the air and settle into their letters. Some part of the title is always on the move. */
  document.querySelectorAll('[data-particles]').forEach(function (cv) {
    var sec = cv.closest('.s'), ctx = cv.getContext('2d'), P = [], W = 0, H = 0, D = 1, raf = 0, t0 = performance.now(), on = true;
    function sample() {
      var r = sec.getBoundingClientRect(); D = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height; cv.width = Math.round(W * D); cv.height = Math.round(H * D);
      var off = document.createElement('canvas'); off.width = cv.width; off.height = cv.height;
      var o = off.getContext('2d'); o.scale(D, D); o.fillStyle = '#fff'; o.textBaseline = 'alphabetic';
      // draw every line of the real text where the browser has put it
      sec.querySelectorAll('.particle-src').forEach(function (el) {
        var cs = getComputedStyle(el); o.font = cs.fontSize + ' ' + cs.fontFamily;
        var walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        while (walk.nextNode()) {
          var node = walk.currentNode, range = document.createRange();
          for (var i = 0; i < node.length; i++) {
            range.setStart(node, i); range.setEnd(node, i + 1);
            var q = range.getBoundingClientRect(), ch = node.nodeValue[i];
            if (!q.width || /\s/.test(ch)) continue;
            var fs = parseFloat(cs.fontSize);
            o.fillText(ch, q.left - r.left, q.top - r.top + (q.height + fs * .7) / 2);
          }
        }
      });
      var img = o.getImageData(0, 0, off.width, off.height).data, step = Math.max(2, Math.round(2.9 * D)), seed = 7;
      var R = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
      P = [];
      for (var y = 0; y < off.height; y += step) for (var x = 0; x < off.width; x += step) {
        if (img[(y * off.width + x) * 4 + 3] < 128) continue;
        var a = -Math.PI / 2 + (R() - .3) * 1.6;
        P.push({ hx: x / D, hy: y / D, vx: Math.cos(a), vy: Math.sin(a), far: 60 + R() * 260, lag: R() * .12, sz: (step / D) * (.7 + R() * .5), ph: R() * 6.28 });
      }
    }
    var T = 7.5;                                                        // one pass of the wave, in seconds
    var ease = function (x) { return x * x * (3 - 2 * x); };
    function frame(now) {
      var t = (now - t0) / 1000;
      ctx.setTransform(D, 0, 0, D, 0, 0); ctx.clearRect(0, 0, W, H); ctx.fillStyle = '#fff';
      var buckets = [[], [], [], [], [], [], [], []];
      for (var i = 0; i < P.length; i++) {
        var p = P[i], ph = ((t / T - p.hx / W * .85 + p.lag) % 1 + 1) % 1, x = p.hx, y = p.hy, a = 1;
        if (ph > .64) {
          // away: up and out on a current, then back out of the air into the letter
          var k = ph < .84 ? ease((ph - .64) / .2) : 1 - ease((ph - .84) / .16);
          var curl = Math.sin(p.hy * .03 + t * 1.3 + p.ph) * 26 * k;
          x += (p.vx * p.far + curl) * k; y += (p.vy * p.far + Math.cos(p.hx * .02 + t + p.ph) * 14) * k;
          a = 1 - k * .92;
        }
        buckets[Math.min(7, Math.floor(a * 7.99))].push(x, y, p.sz);
      }
      buckets.forEach(function (b, n) {
        if (!b.length) return; ctx.globalAlpha = (n + .5) / 8;
        for (var j = 0; j < b.length; j += 3) ctx.fillRect(b[j], b[j + 1], b[j + 2], b[j + 2]);
      });
      ctx.globalAlpha = 1;
      raf = on ? requestAnimationFrame(frame) : 0;
    }
    function start() { if (!raf) raf = requestAnimationFrame(frame); }
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () { sample(); start(); });
    window.addEventListener('resize', function () { sample(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
      es.forEach(function (en) { on = en.isIntersecting; if (on) start(); });
    }, { threshold: 0.05 }).observe(sec);
  });

  /* the title, letter by letter, each on its own clock so no word is whole for long */
  document.querySelectorAll('[data-vapour]').forEach(function (el) {
    var texts = [], walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    while (walk.nextNode()) texts.push(walk.currentNode);
    texts.forEach(function (node) {
      var frag = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var word = document.createElement('span'); word.className = 'word'; word.setAttribute('aria-hidden', 'true');
        part.split('').forEach(function (ch) {
          var c = document.createElement('span');
          c.textContent = ch; c.setAttribute('data-ch', ch);
          c.style.cssText = '--d:' + (2.6 + Math.random() * 2.4).toFixed(2) + 's;--o:' + (-Math.random() * 5).toFixed(2) + 's;--x:' + ((Math.random() - .5) * .3).toFixed(2) + 'em';
          word.appendChild(c);
        });
        frag.appendChild(word);
      });
      node.parentNode.replaceChild(frag, node);
    });
  });

  /* Christian's 84 hand-drawn circles, each with its own pair of colors: a soft ground and a muted ink
     from across the wheel, never under 4.5:1. The same rule as the circles reel. */
  var CIRCLES = (function () {
    var seed = 84, R = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    function rgb(h, s, l) {
      s /= 100; l /= 100;
      var k = function (n) { return (n + h / 30) % 12; }, a = s * Math.min(l, 1 - l);
      var f = function (n) { return l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); };
      return [f(0), f(8), f(4)].map(function (v) { return Math.round(v * 255); });
    }
    function lum(c) { return c.map(function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }).reduce(function (t, v, i) { return t + v * [.2126, .7152, .0722][i]; }, 0); }
    function contrast(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }
    var css = function (c) { return 'rgb(' + c.join(',') + ')'; }, PAIRS = [];
    for (var i = 0; i < 84; i++) {
      var h = (i * 360 / 84 * 2 + R() * 18) % 360, bg = rgb(h, 22 + R() * 16, 86 + R() * 6);
      var ih = (h + 165 + R() * 30) % 360, l = 38, ink = rgb(ih, 34 + R() * 18, l);
      while (contrast(bg, ink) < 4.5 && l > 6) { l -= 3; ink = rgb(ih, 38, l); }
      PAIRS.push([css(bg), css(ink)]);
    }
    var api = { n: 0 };
    api.url = function (n) { return 'url(/workshops/bgsu/circles/circle-' + (n + 1) + '.svg)'; };
    api.paint = function (sec, n) { sec.style.backgroundColor = PAIRS[n][0]; sec.style.color = PAIRS[n][1]; };
    return api;
  })();

  /* the timeline as metaballs: a row of dots and a node at each date, all in one group that is
     blurred and then cut back to a hard edge, so whatever comes close runs together. A wave runs
     along the line once, from the cave paintings to Now, swelling the dots it passes until they fuse.
     The line stops at Now. When the wave gets there, Now blooms pink, and the line rests. */
  document.querySelectorAll('[data-goo]').forEach(function (svg) {
    var NS = 'http://www.w3.org/2000/svg', box = svg.parentNode, raf = 0, t0 = 0, dots = [], nodes = [], tall = false, len = 1, start = 0, end = 1, clipR = null;
    var id = 'goo' + Math.random().toString(36).slice(2, 7), RUN = 3.4, WASH = 2.2, played = false;
    var NOW_PINK = '#b0e0e6', SPECTRUM = ['#e3241b', '#ee7a26', '#e0a500', '#2f8a4b', '#1f9bb3', '#2e57b8', '#6b4aa0', '#b0e0e6'];   // Now is powder blue
    function mk(name, attrs, parent) { var e = document.createElementNS(NS, name); for (var k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; }
    function build() {
      var r = box.getBoundingClientRect(); tall = window.matchMedia('(max-width: 48em)').matches;
      svg.setAttribute('viewBox', '0 0 ' + r.width + ' ' + r.height); svg.innerHTML = '';
      var marks = [].slice.call(box.querySelectorAll('.mark')).map(function (m) { var q = m.getBoundingClientRect(); return tall ? q.top - r.top + 12 : q.left - r.left + q.width / 2; });
      start = tall ? 0 : marks[0]; end = marks[marks.length - 1]; len = (end - start) || 1;
      var defs = mk('defs', {}, svg), y = r.height / 2;
      var f = mk('filter', { id: id, x: '-20%', y: '-200%', width: '140%', height: '500%' }, defs);
      mk('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: 2.2 }, f);
      mk('feColorMatrix', { values: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -6' }, f);
      var spec = mk('linearGradient', { id: id + '-spec', gradientUnits: 'userSpaceOnUse', x1: start, y1: 0, x2: tall ? 0 : end, y2: tall ? end : 0 }, defs);
      SPECTRUM.forEach(function (c, i) { mk('stop', { offset: i / (SPECTRUM.length - 1), 'stop-color': c }, spec); });
      var clip = mk('clipPath', { id: id + '-clip' }, defs);
      clipR = mk('rect', { x: tall ? -60 : end + 60, y: tall ? end + 60 : -60, width: tall ? 120 : 0, height: tall ? 0 : r.height + 120 }, clip);
      // two copies of the same dots and nodes: plain, and in color behind a clip that opens from Now
      var plain = mk('g', { filter: 'url(#' + id + ')', fill: 'currentColor' }, svg);
      // (the colored copy of the line is gone: only Now takes color, and one filtered layer is half the work)
      function pair(cx, cy, r) { var c = mk('circle', { cx: cx, cy: cy, r: r }, plain); return [c, c]; }
      dots = []; nodes = [];
      var stop = end - (tall ? 7 : 9.5) * 1.15 * 1.55 - 14;              // the line ends short of Now, so the two never touch
      for (var p = start; p <= stop; p += 12) dots.push({ e: pair(tall ? 0 : p, tall ? p : y, 2.6), u: (p - start) / len });
      marks.forEach(function (m, i) {
        var big = i === marks.length - 1, base = (tall ? 7 : 9.5) * (big ? 1.15 : 1);
        if (!big) { nodes.push({ e: pair(tall ? 0 : m, tall ? m : y, base), u: (m - start) / len, r: base, now: false }); return; }
        // Now sits outside the goo: a clean circle, black until the wave reaches it, then pink
        var c = mk('circle', { cx: tall ? 0 : m, cy: tall ? m : y, r: base, fill: 'currentColor', class: 'goo-now' }, svg);
        nodes.push({ e: [c, c], u: 1, r: base, now: true });
      });
    }
    var easeOut = function (x) { return 1 - Math.pow(1 - x, 3); };
    function draw(t) {
      var head = Math.min(1, t / RUN) * 1.04 - .02, arrived = Math.max(0, t - RUN);
      var bloom = Math.min(1, arrived / .9);
      dots.forEach(function (d) {
        var k = t < RUN ? Math.exp(-Math.pow((d.u - head) / .085, 2)) : 0;   // a worm: a long body of swollen dots
        var rd = (2.6 + 5.2 * k).toFixed(2);                              // once the wave reaches Now, nothing runs back d.e[0].setAttribute('r', rd); d.e[1].setAttribute('r', rd);
      });
      nodes.forEach(function (n) {
        var k = t < RUN ? Math.exp(-Math.pow((n.u - head) / .085, 2)) : 0, grow = n.now ? 1 + .9 * Math.sin(Math.PI / 2 * bloom) - .25 * bloom * (1 - Math.cos(t * 2.4)) * .5 : 1;
        if (n.now) grow = 1 + .55 * Math.sin(Math.PI / 2 * bloom);
        var rn = (n.r * (1 + .35 * k) * grow + (n.now ? 0 : .4 * Math.sin(t * 2 + n.u * 9))).toFixed(2); n.e[0].setAttribute('r', rn); n.e[1].setAttribute('r', rn);
        if (n.now) n.e[0].setAttribute('fill', bloom > 0 ? NOW_PINK : 'currentColor');
      });
      // only Now takes color: the colored copy of the line stays shut
      var from = end + 60;
      if (tall) { clipR.setAttribute('y', from); clipR.setAttribute('height', Math.max(0, end + 60 - from)); }
      else { clipR.setAttribute('x', from); clipR.setAttribute('width', Math.max(0, end + 60 - from)); }
    }
    // once the wave has reached Now and it has bloomed, the line holds still: no work while you move on
    function tick(now) { var t = (now - t0) / 1000; if (t > RUN + 1.2) { draw(RUN + 1.2); raf = 0; return; } draw(t); raf = requestAnimationFrame(tick); }
    build(); draw(0);
    window.addEventListener('resize', function () { build(); draw(raf ? (performance.now() - t0) / 1000 : played ? RUN + 1.2 : 0); });
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (still) { draw(RUN + WASH + 1); return; }
    if (!('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (es) {
      // each time the screen comes up the worm crawls from the cave paintings to Now again; leaving it
      // changes nothing, and nothing ever runs back the other way
      es.forEach(function (en) { if (!en.isIntersecting) return; played = true; cancelAnimationFrame(raf); build(); t0 = performance.now(); raf = requestAnimationFrame(tick); });
    }, { threshold: 0.4 }).observe(box.closest('.s'));
  });

  /* the timeline's pulses (kept for the set-aside Now screen): one dot every few pixels, each a little later than the one before */
  document.querySelectorAll('[data-pulse]').forEach(function (el) {
    var n = el.closest('.now') ? 90 : 72, html = '';
    for (var i = 0; i <= n; i++) html += '<i style="--p:' + (i / n * 100).toFixed(2) + '%;--d:' + (i / n * 2.2 - 2.8).toFixed(2) + 's"></i>';
    el.innerHTML = html;
  });

  /* projects: look in /talks/bgsu/projects for 1.jpg, 2.mp4, 3.png … and show what is there, in order,
     in place of the empty frames. Stops at the first gap of three numbers. */
  (function () {
    var grid = document.querySelector('.work--studio .work__grid'); if (!grid || !window.fetch) return;
    var EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'mov'], found = [], miss = 0;
    function look(n) {
      if (miss >= 3 || n > 60) { if (found.length) fill(); return; }
      var i = 0;
      (function tryExt() {
        if (i >= EXT.length) { miss++; look(n + 1); return; }
        var url = '/workshops/bgsu/projects/' + n + '.' + EXT[i++];
        fetch(url, { method: 'HEAD' }).then(function (r) { if (r.ok) { found.push(url); miss = 0; look(n + 1); } else tryExt(); }, tryExt);
      })();
    }
    function fill() {
      grid.innerHTML = found.map(function (u) {
        return /\.(mp4|mov)$/i.test(u) ? '<figure><video src="' + u + '" muted loop playsinline preload="auto"></video></figure>' : '<figure><img src="' + u + '" alt=""></figure>';
      }).join('');
      grid.dispatchEvent(new Event('projects'));
    }
    look(1);
  })();

  /* what I do: one project at a time, the next every three seconds; a film plays only while it is up */
  document.querySelectorAll('.work--studio').forEach(function (sec) {
    var figs = [].slice.call(sec.querySelectorAll('figure')), k = 0, timer = 0;
    sec.querySelector('.work__grid').addEventListener('projects', function () { figs = [].slice.call(sec.querySelectorAll('figure')); k = 0; figs[0].classList.add('on'); });
    function play(f, on) { var v = f.querySelector('video'); if (!v) return; if (on) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); }
    function show(n) { figs[k].classList.remove('on'); play(figs[k], false); k = n % figs.length; figs[k].classList.add('on'); play(figs[k], true); }
    figs[0].classList.add('on');
    if (!('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        clearInterval(timer);
        if (en.isIntersecting) { show(0); timer = setInterval(function () { show(k + 1); }, 3000); } else play(figs[k], false);
      });
    }, { threshold: 0.6 }).observe(sec);
  });

  /* write: what the six lines can be about, turning over */
  document.querySelectorAll('[data-rotate]').forEach(function (el) {
    var words = el.getAttribute('data-rotate').split('|'), k = 0, timer = 0;
    var INKS = ['#e3241b', '#2e57b8', '#e0a500', '#2f8a4b', '#ee7a26', '#6b4aa0', '#e05a93', '#1f9bb3', '#8a5a34', '#4682b4', '#c2185b', '#5a8f29'];
    el.style.color = INKS[0];
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (still || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        clearInterval(timer); k = 0; el.textContent = words[0]; el.style.color = INKS[0];
        if (en.isIntersecting) timer = setInterval(function () { k = (k + 1) % words.length; el.textContent = words[k]; el.style.color = INKS[k % INKS.length]; }, 1000);
      });
    }, { threshold: 0.6 }).observe(el.closest('.s'));
  });

  /* Typography New.0: each instrument loads when its screen comes near, as its own page with only the
     stage showing (the artwork and its controls), so it can be played with right here */
  // (specific enough to beat the lab shell's own `html.zlmc-locked body > *` rule)
  var TOOL_CSS = 'html:root body > *:not(.pt-stage):not(script):not(style){display:none !important}' +
    'html:root .sp-nav,html:root #hero,html:root #credits,html:root footer,html:root .site-footer,html:root .pt-for{display:none !important}' +
    'html,body{overflow:hidden !important;height:100% !important;width:100% !important;margin:0 !important;padding:0 !important;background:#fff !important}' +
    '.pt-stage{height:100vh !important;height:100dvh !important;padding-top:1em !important;margin:0 !important}' +
    // the whole screen: the canvas fills it edge to edge, top to bottom, the controls hidden
    'html:root .pt-stage{max-width:none !important;padding:0 !important;margin:0 !important;gap:0 !important;display:block !important;height:100vh !important;min-height:0 !important}' +
    // (the tool page caps its artwork box at 90em and centres it; on a wide screen that pushed the canvas off to one side)
    'html:root .pt-stage #wrap{position:fixed !important;inset:0 !important;left:0 !important;top:0 !important;width:100vw !important;max-width:none !important;height:100vh !important;max-height:none !important;margin:0 !important;padding:0 !important;transform:none !important;display:block !important}' +
    'html:root .pt-bar,html:root .pt-transport,html:root .pt-bar--drawer,html:root [class*="pt-drawer"],html:root #sizeDock,html:root #recDot{display:none !important}' +
    'html:root .pt-stage #art,html:root .pt-stage #render-canvas{position:absolute !important;inset:0 !important;left:0 !important;top:0 !important;margin:0 !important;transform:none !important;width:100vw !important;height:100vh !important;max-width:none !important;max-height:none !important;object-fit:cover !important;border:0 !important;box-shadow:none !important}' +
    'html:root .pt-stage svg#type{position:absolute !important;inset:9rem max(10rem,calc((100vw - 80rem) / 2)) 2rem !important;width:auto !important;height:auto !important;max-width:none !important;max-height:none !important}' +
    // press ` (the key above Tab) and the tool's own controls slide in down the right side
    'html.talk-ctl:root #dock{display:block !important;position:fixed !important;top:0 !important;right:0 !important;bottom:0 !important;left:auto !important;width:min(24rem,34vw) !important;max-height:none !important;overflow:auto !important;z-index:100 !important;margin:0 !important;padding:1.5rem 1.25rem 2rem !important;background:#fff !important;color:#111 !important;border-left:1px solid #111 !important;transform:none !important;grid-column:auto !important}';
  var FS_CSS = 'html:root #exitFs,html:root #hint,html:root #sizeDock,html:root #arr,html:root .opal-topbar,html:root .opal-subhead,html:root #output{display:none !important}' +
    'html:not(.talk-ctl):root #dock{display:none !important}html:root #wrap{top:0 !important;left:0 !important;padding:0 !important}' +   // (Facet has no full screen of its own)
    'html.talk-ctl:root #dock{display:block !important;position:fixed !important;top:0 !important;right:0 !important;bottom:0 !important;left:auto !important;width:min(24rem,34vw) !important;overflow:auto !important;z-index:100 !important;background:#fff !important;border-left:1px solid #000 !important;transform:none !important}' +
    'html:root body.fs #wrap > canvas#art{width:100% !important;height:100% !important;max-width:none !important;max-height:none !important;object-fit:cover}' +   // (Opeka Type: its canvas fills the screen)
    'html.talk-ctl:root #rail{display:block !important;position:fixed !important;top:0 !important;right:0 !important;bottom:0 !important;left:auto !important;width:min(24rem,34vw) !important;overflow:auto !important;z-index:100 !important;background:#fff !important;border-left:1px solid #000 !important;transform:none !important}';   // (Kirlian keeps its controls in a rail, not a dock)
  var ctlOn = false;
  function applyCtl(fr) { try { fr.contentDocument.documentElement.classList.toggle('talk-ctl', ctlOn); } catch (e) {} }
  function toggleCtl() {
    if (!toolOnScreen() && window.__sysPanel && window.__sysPanel()) return;   // on the city: its colors
    var closing = ctlOn; ctlOn = !ctlOn; document.body.classList.toggle('tool-ctl', ctlOn); document.querySelectorAll('[data-tool]').forEach(applyCtl);
    if (closing) { var fr = toolOnScreen(); if (fr) saveTool(fr); }
  }
  /* a slide's own start: close the controls (`) and whatever you set becomes how that tool opens next
     time, on this computer; it is also copied, so it can be pasted to Claude to make it the default for
     good. Shift-` (~) forgets it and reloads the tool as it was. Angel saves its whole patch as a track. */
  // a tool is shown only once it has settled: its slide's settings applied and, when settings were saved
  // for it, those restored too (they land 0.7s after the page). Until then it stays invisible.
  function settle(fr) {
    if (fr.classList.contains('is-ready') || fr.__readyT) return;
    var saved = false; try { saved = !!localStorage.getItem(toolKey(fr)) || (fr.contentDocument && fr.contentDocument.getElementById('loadTrack') && /bgsu-talk2/.test(localStorage.getItem('angel-tracks') || '')); } catch (e) {}
    fr.__readyT = setTimeout(function () { fr.__readyT = null; if (fr.classList.contains('is-dressed')) fr.classList.add('is-ready'); }, saved ? 1400 : 250);
  }
  function unready(fr) { clearTimeout(fr.__readyT); fr.__readyT = null; fr.classList.remove('is-dressed', 'is-ready'); }
  function toolKey(fr) { return 'talk-tool3:' + fr.getAttribute('data-tool'); }
  function toast(msg) {
    var t = document.getElementById('talk-toast'); if (!t) { t = document.createElement('div'); t.id = 'talk-toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('is-on'); clearTimeout(t.__h); t.__h = setTimeout(function () { t.classList.remove('is-on'); }, 2600);
  }
  function saveTool(fr) {
    try {
      var d = fr.contentDocument;
      if (!fr.classList.contains('is-dressed') || fr.style.display) return;   // only a tool that is up on its screen
      if (d.getElementById('saveTrack') && d.getElementById('trackName')) { d.getElementById('trackName').value = 'bgsu-talk2'; d.getElementById('saveTrack').click(); toast('Saved as this slide’s start'); return; }
      var o = {};
      d.querySelectorAll('input[id], select[id], textarea[id]').forEach(function (el) {
        if (/^(file|button|submit|reset|hidden)$/.test(el.type) || el.closest('.opal-export') || /^(docW|docH|format|aspect|canvas-[wh]-input|letterIn|text|words|text-input|charIn)$/.test(el.id)) return;   // never the canvas size or the words: the slide owns those (a stray key once saved a lone C over Mitsuo's image)
        o[el.id] = (el.type === 'checkbox' || el.type === 'radio') ? (el.checked ? '1:c' : '0:c') : el.value;
      });
      var fc = d.querySelectorAll('#fanColList input[type=color]');   // Mitsuo's fan colours have no ids of their own
      if (fc.length) o.__fanColors = [].map.call(fc, function (el) { return el.value; });
      localStorage.setItem(toolKey(fr), JSON.stringify(o));
      if (navigator.clipboard) navigator.clipboard.writeText(fr.getAttribute('data-tool') + '\n' + JSON.stringify(o)).catch(function () {});
      toast('Saved as this slide’s start · copied, to send to Claude');
    } catch (e) {}
  }
  function restoreTool(fr) {
    try {
      var d = fr.contentDocument;
      if (d.getElementById('loadTrack') && d.getElementById('trackList')) {
        var tr = JSON.parse(localStorage.getItem('angel-tracks') || '{}');
        if (tr['bgsu-talk2']) { d.getElementById('trackList').value = 'bgsu-talk2'; d.getElementById('loadTrack').click(); }
        return;
      }
      var o = JSON.parse(localStorage.getItem(toolKey(fr)) || 'null'); if (!o) return;
      ['docW', 'docH', 'format', 'aspect', 'canvas-w-input', 'canvas-h-input', 'letterIn', 'text', 'words', 'text-input', 'charIn'].forEach(function (k) { delete o[k]; });   // (older saves may hold them)
      var apply = function (sel) { Object.keys(o).forEach(function (id) {
        var el = d.getElementById(id), v = o[id]; if (!el || !el.matches(sel)) return;
        if (/:c$/.test(v) ? el.checked === (v.charAt(0) === '1') : el.value === v) return;   // unchanged: a menu re-sent would re-apply itself (Mitsuo's palette turned the fan red)
        if (/:c$/.test(v)) el.checked = v.charAt(0) === '1'; else el.value = v;
        ['input', 'change'].forEach(function (ev) { el.dispatchEvent(new Event(ev, { bubbles: true })); });
      }); };
      apply('select'); setTimeout(function () {
        apply('input, textarea');
        (o.__fanColors || []).forEach(function (c, i) { var el = d.querySelectorAll('#fanColList input[type=color]')[i]; if (el && el.value !== c) { el.value = c; el.dispatchEvent(new Event('input', { bubbles: true })); } });
      }, 400);   // menus first: an engine rebuilds its sliders
    } catch (e) {}
  }
  function resetTool() {
    var fr = toolOnScreen(); if (!fr) return;
    try { localStorage.removeItem(toolKey(fr)); var tr = JSON.parse(localStorage.getItem('angel-tracks') || '{}'); if (tr['bgsu-talk2'] && fr.contentDocument.getElementById('loadTrack')) { delete tr['bgsu-talk2']; localStorage.setItem('angel-tracks', JSON.stringify(tr)); } } catch (e) {}
    fr.__restored = fr.__worded = fr.__knobbed = fr.__imaged = false; unready(fr);
    try { fr.contentWindow.location.reload(); } catch (e) {}
    toast('Back to the start Claude set');
  }
  document.addEventListener('keydown', function (e) {
    if ((e.key !== '`' && e.key !== '~') || e.metaKey || e.ctrlKey || e.altKey) return;
    e.preventDefault(); e.stopImmediatePropagation(); if (e.key === '~') resetTool(); else toggleCtl();
  }, true);
  addEventListener('wheel', function (e) { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
  addEventListener('keydown', function (e) { if ((e.metaKey || e.ctrlKey) && /^[=+\-0]$/.test(e.key)) e.preventDefault(); });
  ['gesturestart', 'gesturechange'].forEach(function (g) { addEventListener(g, function (e) { e.preventDefault(); }); });
  document.querySelectorAll('[data-tool]').forEach(function (fr) {
    function dress() {
      try {
        var d = fr.contentDocument; if (fr.__reloading || !d || !d.head || !d.body) return;
        if (d.URL === 'about:blank' || d.readyState === 'loading') return;   // the blank page a frame starts as: dress the real one
        // the tool's page must never scroll inside its frame (that left a white strip down one side)
        if (!d.__pinned) { d.__pinned = true; fr.contentWindow.addEventListener('scroll', function () { if (fr.contentWindow.scrollX || fr.contentWindow.scrollY) fr.contentWindow.scrollTo(0, 0); }); }
        if (!d.__talkKeys) { d.addEventListener('keyup', function (e) { if (e.key === 'm' || e.key === 'M') document.dispatchEvent(new KeyboardEvent('keyup', { key: e.key })); }, true); }
        if (!d.__talkKeys) { d.__talkKeys = true; d.addEventListener('keydown', function (e) { var tgt = e.target; if (fr.hasAttribute('data-ui') && tgt && (/^(INPUT|TEXTAREA|SELECT)$/.test(tgt.tagName) || tgt.isContentEditable)) { if (/^(ArrowUp|ArrowDown|PageUp|PageDown)$/.test(e.key)) { e.preventDefault(); tgt.blur(); document.dispatchEvent(new KeyboardEvent('keydown', { key: e.key })); } return; }   /* a tool shown whole (Opeka Type): its own fields take their keys, but up and down always change the slide */ if (e.key === '`' || e.key === '~') { e.preventDefault(); e.stopImmediatePropagation(); if (e.key === '~') resetTool(); else toggleCtl(); return; } if ((!toolOnScreen() && /^[mgnfMGNF]$/.test(e.key)) || /^[mM]$/.test(e.key)) { document.dispatchEvent(new KeyboardEvent('keydown', { key: e.key })); e.preventDefault(); return; } typeKey(e); if (!e.defaultPrevented && /^(Arrow|Page)/.test(e.key)) { document.dispatchEvent(new KeyboardEvent('keydown', { key: e.key })); e.preventDefault(); } }, true); }
        // a page shown as it is (OPEN, the first homepage): only its own chrome taken away
        // the wheel over a tool never zooms it (nor the page): it moves to the next or previous screen,
        // except inside the tool's own controls while they are open
        if (!d.__wheel) {
          d.__wheel = true; var acc = 0, lastNav = 0, accT = 0;
          fr.contentWindow.addEventListener('wheel', function (e) {
            var tg = e.target; if ((ctlOn || fr.hasAttribute('data-ui')) && tg && tg.closest && tg.closest('#dock, #panel, #panelL, .rail')) return;
            e.preventDefault(); e.stopImmediatePropagation(); if (e.ctrlKey) return;
            acc += e.deltaY; clearTimeout(accT); accT = setTimeout(function () { acc = 0; }, 220);
            var now = Date.now(); if (Math.abs(acc) > 50 && now - lastNav > 850) { go(current() + (acc > 0 ? 1 : -1)); lastNav = now; acc = 0; }
          }, { capture: true, passive: false });
        }
        if (!fr.__restored) { fr.__restored = true; setTimeout(function () { restoreTool(fr); }, 700); }
        if (fr.hasAttribute('data-plain')) {
          if (fr.dataset.hide && !d.getElementById('talk-plain')) { var ps = d.createElement('style'); ps.id = 'talk-plain'; ps.textContent = fr.dataset.hide + '{display:none !important}'; d.head.appendChild(ps); }
          // one part of a page, alone on the screen (the Lake Opeka record's type tool, out of its long page)
          if (fr.dataset.solo && !d.getElementById('talk-solo')) { var so = d.createElement('style'); so.id = 'talk-solo'; so.textContent = 'html:root,html:root body{overflow:hidden !important}html:root ' + fr.dataset.solo + '{position:fixed !important;inset:0 !important;width:100vw !important;height:100vh !important;margin:0 !important;z-index:2147483000 !important}'; d.head.appendChild(so); fr.contentWindow.dispatchEvent(new Event('resize')); }
          fr.classList.add('is-dressed'); settle(fr); return;
        }
        // a tool with its own full screen (Angel Music, Image Train): switch it on, keep its controls for `
        if (fr.hasAttribute('data-fs')) {
          if (!d.getElementById('talk-fs')) { var fs = d.createElement('style'); fs.id = 'talk-fs'; fs.textContent = FS_CSS; d.head.appendChild(fs); }
          if (!d.body.classList.contains('fs')) { d.body.classList.add('fs'); fr.contentWindow.dispatchEvent(new Event('resize')); }
          var asp = d.getElementById('aspect'), wide16 = asp && [].filter.call(asp.options, function (o) { return /16\s*:\s*9/.test(o.textContent); })[0];
          if (wide16 && asp.value !== wide16.value) { asp.value = wide16.value; asp.dispatchEvent(new Event('change', { bubbles: true })); }
          // pictures to start from (Image Train, Kirlian): dropped in as if dragged onto it
          if (fr.dataset.images && !fr.__imaged && d.readyState === 'complete') {
            fr.__imaged = true; var pageAt = d;
            setTimeout(function () { if (fr.contentDocument === pageAt) Promise.all(fr.dataset.images.split('|').map(function (u) { return fetch(u).then(function (r) { return r.blob(); }).then(function (b) { return new File([b], decodeURIComponent(u.split('/').pop()), { type: b.type || 'image/webp' }); }); }))
              .then(function (files) { var w = fr.contentWindow, dt = new w.DataTransfer(); files.forEach(function (f) { dt.items.add(new w.File([f], f.name, { type: f.type })); }); w.document.dispatchEvent(new w.DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true })); })
              .catch(function () {}); }, 900);
          }
          fr.classList.add('is-dressed'); settle(fr); applyCtl(fr); return;
        }
        if (fr.hasAttribute('data-instrument')) {
          // the Instrument lays itself out for a slide (?talk); if for any reason it has not, make it
          if (!d.body.classList.contains('talk')) { d.body.classList.add('talk'); var dw = d.getElementById('docW'), dh = d.getElementById('docH'); if (dw && dh) { dw.value = 1920; dh.value = 1080; dw.dispatchEvent(new Event('input', { bubbles: true })); } }
          fr.classList.add('is-dressed'); settle(fr); applyCtl(fr); fr.contentWindow.scrollTo(0, 0); fr.contentWindow.dispatchEvent(new Event('resize')); return;
        }   // the Instrument lays itself out for a slide (?talk)
        if (!d.getElementById('talk-embed')) { var st = d.createElement('style'); st.id = 'talk-embed'; st.textContent = TOOL_CSS; d.head.appendChild(st); fr.classList.add('is-dressed'); settle(fr); }
        applyCtl(fr);
        // a wide canvas for the projector: the tool's own 16:9 preset, where it has a size control
        var sel = d.getElementById('aspect');
        // (checked on every pass: the shell rebuilds the size list once it loads, back on square)
        if (sel) {
          var wide = [].filter.call(sel.options, function (o) { return /16\s*:\s*9/.test(o.textContent) || /^(1920[\/x:]1080|16[\/:]9)$/.test(o.value); })[0];
          if (wide && sel.value !== wide.value) { sel.value = wide.value; sel.dispatchEvent(new Event('input', { bubbles: true })); sel.dispatchEvent(new Event('change', { bubbles: true })); }
        }
        if (fr.dataset.fit === 'page' && !d.getElementById('talk-page')) {
          var pg = d.createElement('style'); pg.id = 'talk-page';
          pg.textContent = 'html:root,html:root body,html:root .pt-stage,html:root #wrap{background:transparent !important}' +
            'html:root .pt-stage svg#type{inset:11% 10% 11% !important;background:transparent !important}html:root svg#type rect{fill:transparent !important}html:root svg#type text{fill:#1d1a16 !important}';
          d.head.appendChild(pg);
        }
        // a tool can open on words of our own (Ripple: Wilde, The Decay of Lying), until something is typed
        if (fr.dataset.words && !fr.__worded && typed.frame !== fr) {
          var bar0 = d.querySelector('.pt-bar__words');
          if (bar0 && d.getElementById(bar0.dataset.words)) { typeInto(fr, fr.dataset.words); fr.__worded = true; }
        }
        // and its own settings (Ripple: the passage once through, at a size that fits the screen)
        if (fr.dataset.knobs && !fr.__knobbed) {
          var ok = true;
          fr.dataset.knobs.split(',').forEach(function (kv) {
            var p2 = kv.split('='), inp = d.getElementById(p2[0]);
            if (!inp) { ok = false; return; }
            inp.value = p2[1]; inp.dispatchEvent(new Event('input', { bubbles: true })); inp.dispatchEvent(new Event('change', { bubbles: true }));
          });
          fr.__knobbed = ok;
        }
        // Flora sizes its canvas in pixels: 1280 × 720 keeps it under its 4-megapixel limit, so it draws at double density
        var fw = d.getElementById('canvas-w-input'), fh = d.getElementById('canvas-h-input');
        if (fw && fh && (fw.value !== '1280' || fh.value !== '720')) {
          fw.value = '1280'; fh.value = '720';
          [fw, fh].forEach(function (inp) { ['input', 'change', 'blur'].forEach(function (ev) { inp.dispatchEvent(new Event(ev, { bubbles: true })); }); });
        }
        fr.contentWindow.scrollTo(0, 0); fr.contentWindow.dispatchEvent(new Event('resize'));
      } catch (e) {}
    }
    // the frame stays hidden until its page is dressed, so the site's own header never flashes up
    function load() {
      if (fr.getAttribute('src')) return;
      // ask for a canvas near the screen's own resolution, so a background is sharp, not stretched
      var u = fr.getAttribute('data-tool'), L = Math.min(2200, Math.round(Math.max(innerWidth, innerHeight * 16 / 9) * Math.min(2, devicePixelRatio || 1)));
      if (/mitsuo|liquid-type|connected/.test(u)) u += (u.indexOf('?') < 0 ? '?' : '&') + 'long=' + L;
      if (fr.hasAttribute('data-instrument')) try { sessionStorage.setItem('opal-gate-bgsu', '1'); } catch (e) {}   // the talk lets itself through the students' gate
      if (fr.hasAttribute('data-fs') || fr.hasAttribute('data-ui')) try { sessionStorage.setItem('opal-lab-v2', '1'); } catch (e) {}           // and the lab's own (Image Train)
      fr.src = u; fr.__load = null; fr.__loadedAt = performance.now();
      var n = 0, poll = setInterval(function () { dress(); if (++n > 30) clearInterval(poll); }, 250);
    }
    fr.addEventListener('load', function () { fr.__reloading = false; dress(); setTimeout(dress, 400); setTimeout(dress, 1500); });
    fr.__load = load;
    if (!('IntersectionObserver' in window)) { load(); return; }
    // within two screens: load it and run it. One screen away: hide it, which stops it drawing. Further
    // than that: unload it altogether, so at most the tools around the current screen are alive and the
    // rest of the talk never pays for them (with every tool kept running, the talk fell to 12fps)
    function unload() {
      if (!fr.getAttribute('src')) return;
      fr.removeAttribute('src'); fr.style.display = ''; unready(fr);
      fr.__restored = fr.__worded = fr.__knobbed = fr.__imaged = false;
    }
    new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) { var back = !!fr.style.display; load(); if (fr.style.display) { fr.style.display = ''; try { fr.contentWindow.dispatchEvent(new Event('resize')); } catch (e) {} } }
        else if (fr.getAttribute('src')) fr.style.display = 'none';
      });
    }, { rootMargin: '100% 0px' }).observe(fr.closest('.s'));   // the screen, not the frame: a hidden frame never counts as on screen
    new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) load(); else unload(); });
    }, { rootMargin: '200% 0px' }).observe(fr.closest('.s'));
    // the tool starts over each time its screen comes up: it is reloaded just after the screen is left,
    // out of sight, so by the time it is back it has its first frame and settings again, already settled
    new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (fr.closest('.book')) return;
        if (en.isIntersecting) { clearTimeout(fr.__leaveT); fr.__seen = true; return; }
        if (!fr.__seen || !fr.getAttribute('src')) return;
        clearTimeout(fr.__leaveT);
        fr.__leaveT = setTimeout(function () {
          if (!fr.getAttribute('src')) return;
          if (fr.style.display === 'none') { fr.__seen = false; unload(); return; }   // already out of sight: let it go; it loads fresh on the way back (a page reloaded while hidden starts at no size: the glass scene's WebGL failed)
          fr.__seen = false; fr.__restored = fr.__worded = fr.__knobbed = fr.__imaged = false; fr.__vBase = null; fr.__vLast = 0;
          unready(fr); fr.__loadedAt = performance.now(); fr.__reloading = true;   // dress() waits for the new page
          try { fr.contentWindow.location.reload(); } catch (e) {}
        }, 900);
      });
    }, { threshold: 0.6 }).observe(fr.closest('.s'));
    // a tool shown whole, as on the site (Opeka Type): the talk's own header and count step aside while it is up
    if (fr.hasAttribute('data-ui')) new IntersectionObserver(function (es) { es.forEach(function (en) { document.body.classList.toggle('ui-tool', en.isIntersecting); }); }, { threshold: 0.6 }).observe(fr.closest('.s'));
    // a tool that sees (Kirlian): the camera is on only while its screen is up, and off the moment it is not;
    // the hand photograph stays underneath, for a room without a camera or permission to use it
    if (fr.hasAttribute('data-camera')) {
      var camOn = false;
      var cam = function () { try { var w = fr.contentWindow; if (w && w.kirlianCamera && fr.classList.contains('is-dressed')) w.kirlianCamera(camOn); } catch (e) {} };
      fr.addEventListener('load', function () { setTimeout(cam, 1200); });
      new IntersectionObserver(function (es) { es.forEach(function (en) { camOn = en.isIntersecting; cam(); }); }, { threshold: 0.6 }).observe(fr.closest('.s'));
    }
    // a tool with sound (Angel): it plays while its screen is up and is muted the moment it is not. Any key
    // already pressed in the talk counts as the gesture a browser asks for before sound, for this page too
    if (fr.hasAttribute('data-sound')) {
      var soundOn = false;
      var sound = function () { try { var w = fr.contentWindow; if (!w || !w.Tone) return;
        if (soundOn) { if (!w.__talkWoke) { w.__talkWoke = true; w.dispatchEvent(new w.PointerEvent('pointerdown', { bubbles: true })); } w.Tone.start(); w.Tone.Destination.mute = false; }
        else w.Tone.Destination.mute = true; } catch (e) {} };
      fr.addEventListener('load', function () { setTimeout(sound, 1200); });
      new IntersectionObserver(function (es) { es.forEach(function (en) { soundOn = en.isIntersecting; sound(); }); }, { threshold: 0.6 }).observe(fr.closest('.s'));
    }
  });

  /* type into the tools: on a tool's screen every key goes into its words, so the instrument redraws
     whatever is typed. The first key replaces what was there; Backspace takes a letter off. The arrow
     keys still move through the talk. Works whether the page or the tool has the focus. */
  var typed = { frame: null, text: '' };
  function toolOnScreen() { var s = secs[current()]; return s && s.classList.contains('tool') ? s.querySelector('.tool__frame') : null; }
  function typeInto(fr, text) {
    try {
      var d = fr.contentDocument, bar = d.querySelector('.pt-bar__words'), src = bar && d.getElementById(bar.dataset.words);
      if (fr.hasAttribute('data-instrument')) { bar = null; src = d.getElementById('text'); }
      [bar, src].forEach(function (el) {
        if (!el) return;
        var max = +el.getAttribute('maxlength') || 20000;
        el.value = text.slice(0, max);
        el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true }));
      });
    } catch (e) {}
  }
  function typeKey(e) {
    var fr = toolOnScreen(); if (!fr || e.metaKey || e.ctrlKey || e.altKey) return;
    var k = e.key;
    if (k === 'm' || k === 'M') return;                                       // m is always the mic, on a tool too (type an m in the tool's Text box)
    if (!(k.length === 1 || k === 'Backspace' || k === 'Enter')) return;    // arrows and the rest pass through
    e.preventDefault(); e.stopImmediatePropagation();
    if (typed.frame !== fr) { typed.frame = fr; typed.text = ''; }
    if (k === 'Backspace') typed.text = typed.text.slice(0, -1);
    else if (k === 'Enter') typed.text += '\n';
    else typed.text += k;
    typeInto(fr, typed.text);
  }
  document.addEventListener('keydown', typeKey, true);
  window.addEventListener('scroll', function () { if (typed.frame && toolOnScreen() !== typed.frame) typed.frame = null; }, { passive: true });

  function isNear(el) { var r = el.getBoundingClientRect(); return r.bottom > -innerHeight * 1.2 && r.top < innerHeight * 2.2; }

  /* Typography New.0: screens that do something once they are up */
  document.querySelectorAll('.tn--says').forEach(function (sec) {
    if (!('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (es) { es.forEach(function (en) { sec.classList.toggle('is-on', en.isIntersecting); }); }, { threshold: 0.6 }).observe(sec);
  });
  // legibility: the words drift towards illegible and come back, one at a time
  document.querySelectorAll('[data-legible]').forEach(function (el) {
    el.innerHTML = el.textContent.split(' ').map(function (w) { return '<span>' + w + '</span>'; }).join(' ');
    var spans = [].slice.call(el.children), timer = 0;
    function wobble() {
      spans.forEach(function (sp) {
        var far = Math.random() < .35 ? Math.random() : 0;
        sp.style.filter = 'blur(' + (far * .09).toFixed(3) + 'em)';
        sp.style.letterSpacing = (far * .25).toFixed(3) + 'em';
        sp.style.transform = 'translateY(' + ((Math.random() - .5) * far * .3).toFixed(3) + 'em)';
      });
    }
    function rest() { spans.forEach(function (sp) { sp.style.filter = ''; sp.style.letterSpacing = ''; sp.style.transform = ''; }); }
    if (!('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (es) {
      es.forEach(function (en) { clearInterval(timer); rest(); if (en.isIntersecting) timer = setInterval(wobble, 1600); });
    }, { threshold: 0.6 }).observe(el.closest('.s'));
  });

  /* idea and action, a true collision. Every letter is a solid body, drawn whole. The words hit at
     full speed; the front letters stop dead and are crushed, and the crush runs back through each word
     like a pile-up: each letter squashed narrower and taller, wedged into the one ahead, the front ones
     kicked over and left leaning. The screen shakes, the wrecks rebound a little apart, and stay
     crushed. Plays each time the screen arrives. */
  document.querySelectorAll('.collide').forEach(function (sec) {
    var cv = sec.querySelector('.collide__art'), ctx = cv.getContext('2d'), h2 = sec.querySelector('.collide__words');
    var W = 0, H = 0, D = 1, fs = 100, font = '', words = [], raf = 0, t0 = 0, baseY = 0;
    function letters(txt) {                                          // each letter's place and width, kerning kept
      ctx.font = font; var out = [], total = ctx.measureText(txt).width;
      for (var j = 0; j < txt.length; j++) {
        var x = ctx.measureText(txt.slice(0, j)).width, x1 = ctx.measureText(txt.slice(0, j + 1)).width;
        out.push({ ch: txt[j], x: x, w: x1 - x });
      }
      return { ls: out, w: total };
    }
    function setup() {
      var r = sec.getBoundingClientRect(), cs = getComputedStyle(h2); D = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height;
      cv.width = Math.round(W * D); cv.height = Math.round(H * D);
      fs = parseFloat(cs.fontSize); font = cs.fontWeight + ' ' + fs * D + 'px ' + cs.fontFamily;
      words = [letters('Idea'), letters('Action')];
      baseY = (H / 2 + fs * .53) * D;                                 // the baseline, so the words sit on the screen's centre
    }
    var ease = function (x) { return x * x * x; };                    // accelerating in: no braking before the hit
    function spring(u, w, z) {                                       // 0 → 1, a little past, and back
      if (u <= 0) return 0;
      var wd = w * Math.sqrt(1 - z * z);
      return 1 - Math.exp(-z * w * u) * (Math.cos(wd * u) + z * w / wd * Math.sin(wd * u));
    }
    function n(x, s) { return Math.sin(x * 1.37 + s) * .5 + Math.sin(x * 3.11 + s * 2.3) * .3 + Math.sin(x * 7.7 + s * .7) * .2; }
    function frame(now) {
      var t = (now - t0) / 1000, cx = W / 2 * D, hit = .9, u = t - hit, shift = 0, jx = 0, jy = 0;
      if (t < hit) shift = (1 - ease(t / hit)) * (W / 2 + 40) * D;      // still flying in
      else {
        shift = fs * .07 * D * (1 - Math.exp(-4 * u));                 // the wrecks rebound a little apart
        var sh = fs * .045 * D * Math.exp(-11 * u);                     // the shake
        jx = n(u * 90, 1) * sh; jy = n(u * 70, 4) * sh * .6;
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.font = font; ctx.fillStyle = '#000'; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'center';
      [0, 1].forEach(function (side) {
        var g = words[side], dir = side ? 1 : -1, m = g.ls.length;    // idea sits left of the line, action right
        var front = fs * D * .025;                                     // the two noses jam into each other a little
        for (var i = 0; i < m; i++) {                                  // i counts back from the impact
          var L = g.ls[side ? i : m - 1 - i];
          var near = side ? L.x : g.w - L.x - L.w;                     // its nearer edge, from the line, uncrushed
          var c = Math.exp(-i * .7);                                  // how hard this letter is hit
          var sq = 1 - .6 * c;                                        // its crushed width, as a share
          var p = spring(u - i * .035, 34, .42), pq = spring(u - i * .035, 46, .5);   // the crush reaches it a moment later
          // where the crushed letters end up: packed in from the line, each wedged into the one ahead
          var packed = -front, k;
          for (k = 0; k < i; k++) { var Lk = g.ls[side ? k : m - 1 - k], ck = Math.exp(-k * .7); packed += Lk.w * (1 - .6 * ck) - fs * D * .13 * ck; }
          packed -= fs * D * .13 * c * .5;
          var dNear = near + (packed - near) * p;                      // slides from its place into the pile
          var sx = 1 - (1 - sq) * pq, sy = 1 + (1 / sq - 1) * .14 * pq;   // narrower, and taller: the mass goes somewhere
          var w = L.w * sx, mid = dNear + w / 2;
          var lean = (n(i * 2.3, side * 5) * .6 + .8) * .42 * c;        // the front letters keel over, and stay
          var rot = dir * -(lean * pq + .35 * c * Math.exp(-7 * Math.max(0, u - i * .035)) * Math.sin(18 * Math.max(0, u - i * .035)));
          var lift = -fs * D * .16 * c * pq * (.5 + .5 * n(i * 1.7, side));    // and ride up
          ctx.setTransform(1, 0, 0, 1, jx, jy);
          ctx.translate(cx + dir * (mid + shift), baseY + lift);
          ctx.rotate(rot); ctx.scale(sx, sy);
          ctx.fillText(L.ch, 0, 0);
        }
      });
      raf = t < 4 ? requestAnimationFrame(frame) : 0;
    }
    function play() { cancelAnimationFrame(raf); setup(); t0 = performance.now(); raf = requestAnimationFrame(frame); }
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(setup);
    window.addEventListener('resize', function () { setup(); if (!raf) frame(t0 + 4000); });
    if (!('IntersectionObserver' in window)) { play(); return; }
    new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) play(); }); }, { threshold: 0.6 }).observe(sec);
  });

  /* the work: a screen of pictures that cross-fade one into the next while it is up */
  document.querySelectorAll('[data-cycle]').forEach(function (box) {
    var pics = [].slice.call(box.children), k = 0, timer = 0, ms = +box.dataset.cycle || 2600;
    function show(n) { pics.forEach(function (p, i) { p.classList.toggle('on', i === n); }); }
    if (!('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (es) { es.forEach(function (en) {
      clearInterval(timer);
      if (en.isIntersecting) { pics.forEach(function (p) { p.loading = 'eager'; }); timer = setInterval(function () { k = (k + 1) % pics.length; show(k); }, ms); }
      else { k = 0; show(0); }
    }); }, { threshold: 0.6 }).observe(box.closest('.s'));
  });

  /* overnight: the night sky. A few hundred stars, each its own size and pace of twinkle, a faint band
     of the Milky Way across, and a shooting star every so often. Only drawn while the screen is up. */
  document.querySelectorAll('.night').forEach(function (sec) {
    var cv = sec.querySelector('.night__sky'), ctx = cv.getContext('2d'), W = 0, H = 0, D = 1, stars = [], raf = 0, shoot = null, nextShoot = 0;
    function setup() {
      var r = sec.getBoundingClientRect(); D = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height;
      cv.width = Math.round(W * D); cv.height = Math.round(H * D); stars = [];
      var n = Math.round(W * H / 3200);
      for (var i = 0; i < n; i++) {
        var band = Math.random() < .35, x = Math.random() * W, y;
        y = band ? (H * .15 + x * .45 + (Math.random() - .5) * H * .22) : Math.random() * H;   // the Milky Way, a diagonal drift
        stars.push({ x: x, y: y, r: Math.pow(Math.random(), 3) * 1.5 + .25, a: .25 + Math.random() * .75, f: .4 + Math.random() * 2.2, p: Math.random() * 6.28, warm: Math.random() < .12 });
      }
    }
    function frame(now) {
      var t = now / 1000;
      ctx.setTransform(D, 0, 0, D, 0, 0); ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < stars.length; i++) {
        var st = stars[i], tw = .55 + .45 * Math.sin(t * st.f + st.p);
        ctx.globalAlpha = st.a * tw; ctx.fillStyle = st.warm ? '#ffe6c4' : '#e8f0ff';
        ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, 6.283); ctx.fill();
        if (st.r > 1.3) { ctx.globalAlpha = st.a * tw * .18; ctx.beginPath(); ctx.arc(st.x, st.y, st.r * 3.2, 0, 6.283); ctx.fill(); }
      }
      if (!shoot && t > nextShoot) { shoot = { x: Math.random() * W * .7 + W * .1, y: Math.random() * H * .35, t0: t, vx: 520 + Math.random() * 300, vy: 190 + Math.random() * 120 }; }
      if (shoot) {
        var u = t - shoot.t0, x = shoot.x + shoot.vx * u, y = shoot.y + shoot.vy * u, life = 1 - u / .9;
        if (life <= 0) { shoot = null; nextShoot = t + 4 + Math.random() * 7; }
        else { var g = ctx.createLinearGradient(x, y, x - shoot.vx * .18, y - shoot.vy * .18); g.addColorStop(0, 'rgba(255,255,255,' + (.9 * life) + ')'); g.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.globalAlpha = 1; ctx.strokeStyle = g; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - shoot.vx * .18, y - shoot.vy * .18); ctx.stroke(); }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }
    setup(); addEventListener('resize', setup);
    if (!('IntersectionObserver' in window)) { raf = requestAnimationFrame(frame); return; }
    new IntersectionObserver(function (es) { es.forEach(function (en) { cancelAnimationFrame(raf); raf = 0; if (en.isIntersecting) { nextShoot = performance.now() / 1000 + 2; raf = requestAnimationFrame(frame); } }); }, { threshold: 0.1 }).observe(sec);
  });

  /* faculty: cover, turn, the hummingbird, turn, the first spread, and it rests there. Two faces on one
     card: each turn shows the face that was behind, and the face now hidden takes the next picture */
  document.querySelectorAll('[data-flip]').forEach(function (box) {
    var pics = box.dataset.flip.split('|'), card = box.querySelector('.flip__card'), a = box.querySelector('.flip__face--a'), b = box.querySelector('.flip__face--b'), timers = [];
    pics.forEach(function (u) { var im = new Image(); im.src = u; });   // ready before they turn
    function reset() { timers.forEach(clearTimeout); timers = []; card.style.transition = 'none'; card.style.transform = 'rotateY(0deg)'; a.src = pics[0]; b.src = pics[1]; void card.offsetWidth; card.style.transition = ''; }
    // the covers turn to the hummingbird, then on through the spreads, one turn every few seconds, round
    // and round the spreads for as long as the screen is up. Each turn loads the face that is about to show
    function play() {
      reset();
      var i = 1;
      function turn() {
        var face = i % 2 ? b : a, n = i < pics.length ? i : 2 + (i - 2) % Math.max(1, pics.length - 2);
        face.src = pics[n];
        card.style.transform = 'rotateY(' + (180 * i) + 'deg)';
        i++;
        if (i < pics.length || pics.length > 3) timers.push(setTimeout(turn, i === 2 ? 3850 : 3200));
      }
      timers.push(setTimeout(turn, 2600));
    }
    reset();
    if (!('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) play(); else reset(); }); }, { threshold: 0.6 }).observe(box.closest('.s'));
  });

  /* a screen that plays each time it arrives (Open mind's balloon): is-on while it is up, off when it is left */
  document.querySelectorAll('[data-arrive]').forEach(function (sec) {
    if (!('IntersectionObserver' in window)) { sec.classList.add('is-on'); return; }
    new IntersectionObserver(function (es) { es.forEach(function (en) { sec.classList.toggle('is-on', en.isIntersecting); }); }, { threshold: 0.6 }).observe(sec);
  });

  /* the constraints: the words rise one by one to the line of "What do we want to", each turning its own
     color as it reaches it. Starts over each time the screen arrives */
  document.querySelectorAll('.constraints').forEach(function (sec) {
    var col = sec.querySelector('.rules__words'); if (!col) return;
    var words = [].slice.call(col.children), COLORS = ['#e3241b', '#ee7a26', '#e0a500', '#2f8a4b', '#1f9bb3', '#2e57b8'], timer = 0, k = 0;
    function show() {
      var step = words.length > 1 ? words[1].offsetTop - words[0].offsetTop : 0;
      col.style.transform = 'translateY(' + (-k * step) + 'px)';
      words.forEach(function (w, i) { w.style.color = i === k ? COLORS[i % COLORS.length] : ''; });
    }
    function reset() { clearInterval(timer); k = 0; col.style.transition = 'none'; words.forEach(function (w) { w.style.transition = 'none'; w.style.color = ''; }); col.style.transform = ''; void col.offsetWidth; col.style.transition = ''; words.forEach(function (w) { w.style.transition = ''; }); }
    if (!('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (es) { es.forEach(function (en) {
      reset(); if (!en.isIntersecting) return;
      setTimeout(function () { if (k === 0) show(); }, 700);                     // the first word takes its color where it stands
      timer = setInterval(function () { if (k >= words.length - 1) { clearInterval(timer); return; } k++; show(); }, 1700);
    }); }, { threshold: 0.6 }).observe(sec);
  });

  /* a video with its sound (the Values reel): heard only while its screen is up, from the top each time it
     arrives, silent the moment it is left (a key already pressed in the talk is the gesture browsers ask for) */
  document.querySelectorAll('video[data-sound]').forEach(function (v) {
    if (!('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (es) { es.forEach(function (en) {
      if (en.isIntersecting) { v.currentTime = 0; v.muted = false; var pl = v.play(); if (pl && pl.catch) pl.catch(function () { v.muted = true; v.play().catch(function () {}); }); }
      else v.muted = true;
    }); }, { threshold: 0.6 }).observe(v.closest('.s'));
  });

  /* beginner's mind: the circle comes in each time the screen arrives */
  document.querySelectorAll('.enso').forEach(function (sec) {
    if (!('IntersectionObserver' in window)) { sec.classList.add('is-on'); return; }
    new IntersectionObserver(function (es) { es.forEach(function (en) { sec.classList.toggle('is-on', en.isIntersecting); }); }, { threshold: 0.6 }).observe(sec);
  });

  /* the book spread spans an even number of grid columns, centred, so both outer edges land on column lines */
  document.querySelectorAll('.book__spread').forEach(function (sp) {
    var sec = sp.closest('.s');
    function fit() {
      sp.style.width = sp.style.height = sp.style.bottom = '';
      if (innerWidth <= innerHeight) return;
      var pr = document.createElement('i'); pr.style.cssText = 'position:absolute;visibility:hidden;width:var(--gutter);height:var(--grid-gap)'; document.body.appendChild(pr);
      var g = pr.getBoundingClientRect().width, gp = pr.getBoundingClientRect().height; pr.remove();
      var gap = gp;
      var col = (innerWidth - 2 * g - 11 * gap) / 12, top = sp.offsetTop, room = sec.clientHeight - top - 6.5 * parseFloat(getComputedStyle(document.documentElement).fontSize);
      for (var k = 12; k >= 2; k -= 2) { var w = k * col + (k - 1) * gap; if (w / 1.44 <= room || k === 2) { sp.style.width = w + 'px'; sp.style.height = w / 1.44 + 'px'; sp.style.bottom = 'auto'; break; } }
    }
    fit(); window.addEventListener('resize', fit);
  });

  /* into Now: as the next screen comes up, the pink Now dot leaves the timeline, travels to the
     centre and swells until it is the whole screen. Driven by the scroll, so it runs backwards too. */
  document.querySelectorAll('.zoomnow').forEach(function (sec) {
    var tl = document.querySelector('.time'), dot = document.createElement('i'), raf = 0;
    dot.className = 'zoomnow__dot'; dot.setAttribute('aria-hidden', 'true'); document.body.appendChild(dot);
    function nowCircle() { return tl && tl.querySelector('.goo-now'); }
    function update() {
      raf = 0;
      var r = sec.getBoundingClientRect(), vh = innerHeight, vw = innerWidth, c = nowCircle();
      var p = Math.max(0, Math.min(1, 1 - r.top / vh));
      var full = p >= .999 && r.bottom > 0;
      sec.classList.toggle('is-full', full); sec.classList.toggle('is-on', full);
      var nx = sec.nextElementSibling, nr = nx && nx.classList.contains('pinkbg') ? nx.getBoundingClientRect() : null;
      document.body.classList.toggle('on-pink', (p > .5 && r.bottom > vh * .5) || !!(nr && nr.top < vh * .5 && nr.bottom > vh * .5));
      if (p <= 0 || full || r.bottom <= 0 || !c) { dot.style.display = 'none'; if (c) c.style.opacity = ''; return; }
      c.style.opacity = 0;                                                   // the dot has left the line
      var q = c.getBoundingClientRect(), d0 = Math.max(8, q.width), x0 = q.left + q.width / 2, y0 = q.top + q.height / 2;
      var e = p * p * (3 - 2 * p), grow = Math.pow(p, 3.4);                  // it travels smoothly and swells late, as if arriving
      var D = Math.hypot(vw, vh) * 1.05, x = x0 + (vw / 2 - x0) * e, y = y0 + (vh / 2 - y0) * e, d = d0 + (D - d0) * grow;
      // drawn once at full size and scaled down, so the browser only moves it, never repaints it
      if (dot.__D !== D) { dot.__D = D; dot.style.width = dot.style.height = D + 'px'; }
      dot.style.display = 'block'; dot.style.transform = 'translate(' + (x - D / 2) + 'px,' + (y - D / 2) + 'px) scale(' + (d / D) + ')';
    }
    function ask() { if (!raf) raf = requestAnimationFrame(update); }
    addEventListener('scroll', ask, { passive: true }); addEventListener('resize', ask); update();
  });

  /* a designer today is: the word on the line keeps changing */
  document.querySelectorAll('[data-roles]').forEach(function (el) {
    var roles = el.getAttribute('data-roles').split('|'), k = 0, timer = 0;
    // a different color for every word, word and underscore together
    var INKS = ['#e3241b', '#2e57b8', '#e0a500', '#2f8a4b', '#ee7a26', '#6b4aa0', '#e05a93', '#1f9bb3', '#8a5a34', '#4682b4', '#c2185b', '#5a8f29'];
    var art = el.closest('h2').querySelector('.is-a__art');
    function paint() { el.parentNode.style.color = INKS[k % INKS.length]; if (art) art.textContent = /^[aeiou]/i.test(el.textContent) ? 'an' : 'a'; }
    paint();
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (still || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        clearInterval(timer); k = 0; el.textContent = roles[0]; paint();
        if (en.isIntersecting) timer = setInterval(function () { k = (k + 1) % roles.length; el.textContent = roles[k]; paint(); }, 900);
      });
    }, { threshold: 0.6 }).observe(el.closest('.s'));
  });

  /* a designer today is: a column of titles rising. Each locks in the middle, in its own color and
     underlined, then moves on up as the next arrives. Designer opens it and designer closes it. */
  document.querySelectorAll('[data-trail]').forEach(function (box) {
    var INKS = ['#e3241b', '#2e57b8', '#e0a500', '#2f8a4b', '#ee7a26', '#6b4aa0', '#e05a93', '#1f9bb3', '#8a5a34', '#4682b4', '#c2185b', '#5a8f29'];
    var words = box.getAttribute('data-trail').split('|').map(function (w, i) {
      var sp = document.createElement('span'); sp.className = 'trail__w'; sp.textContent = w; box.appendChild(sp); return sp;
    });
    var k = 0, timer = 0, lock = 0, HOLD = 1500, MOVE = 750;
    // a title takes its color once it lands in the middle and keeps it on the way up; the ones still to come are black.
    // The underline is only for the one locked in the middle: off before it moves, on once the next lands
    function ink(i) { return i === 0 || i === words.length - 1 ? '#000' : INKS[(i - 1) % INKS.length]; }
    function mark(n) { words.forEach(function (sp, i) { sp.classList.toggle('on', i === n); if (i === n) sp.style.color = ink(i); }); }
    function place() { words.forEach(function (sp, i) { sp.style.setProperty('--o', i - k); }); }
    function step() { mark(-1); k++; place(); clearTimeout(lock); lock = setTimeout(function () { mark(k); }, MOVE); }
    function reset() { clearInterval(timer); clearTimeout(lock); box.classList.add('is-still'); k = 0; words.forEach(function (sp) { sp.style.color = ''; }); place(); mark(0); box.offsetWidth; box.classList.remove('is-still'); }
    reset();
    if (!('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        reset();
        if (en.isIntersecting) timer = setInterval(function () { if (k >= words.length - 1) { clearInterval(timer); return; } step(); }, HOLD);
      });
    }, { threshold: 0.6 }).observe(box.closest('.s'));
  });

  /* one shape becomes many: thirty seconds, from the top each time the screen arrives */
  document.querySelectorAll('.morph__art').forEach(function (cv) {
    if (!window.OPALMorph) return;
    var m = OPALMorph(cv), raf = 0, t0 = 0;
    function size() { var b = cv.getBoundingClientRect(); m.resize(Math.max(1, b.width), Math.max(1, b.height), Math.max(2, Math.min(3, window.devicePixelRatio || 1))); }
    function tick(now) { m.frame((now - t0) / 1000); raf = requestAnimationFrame(tick); }
    size(); m.frame(0);
    window.addEventListener('resize', function () { size(); if (!raf) m.frame(0); });
    if (!('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        cancelAnimationFrame(raf); raf = 0;
        if (en.isIntersecting) { size(); t0 = performance.now(); raf = requestAnimationFrame(tick); } else m.frame(0);
      });
    }, { threshold: 0.6 }).observe(cv.closest('.s'));
  });

  /* one idea: a square that can barely hold itself in. Its sides bloat and pucker, its corners
     jitter, and every so often it gives a kick, as if something inside wants out */
  document.querySelectorAll('[data-energy]').forEach(function (svg) {
    var path = svg.querySelector('path'), raf = 0, t0 = 0;
    var C = [[-40, -40], [40, -40], [40, 40], [-40, 40]];
    function n1(t, a, b) { return Math.sin(t * a + b) * .6 + Math.sin(t * a * 2.31 + b * 1.7) * .4; }
    function draw(t) {
      // mostly a hum: a fine jitter and a slow swell in the sides, now and then a small shove
      var kick = Math.pow(Math.max(0, Math.sin(t * 2.2)), 24), beat = 1 + .012 * Math.sin(t * 5.3) + .025 * kick;
      var shake = .45 + 1.1 * kick, pts = C.map(function (c, i) {
        return [c[0] * beat + (Math.random() - .5) * shake + n1(t, 3.1, i) * .6, c[1] * beat + (Math.random() - .5) * shake + n1(t, 2.7, i + 4) * .6];
      });
      var d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
      for (var i = 0; i < 4; i++) {
        var a = pts[i], b = pts[(i + 1) % 4], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        // the side's middle pushes out (bloat) or draws in (pucker)
        var bulge = (n1(t, 1.9 + i * .37, i * 2.1) * 3.2 + 1.6 * kick) * beat, nx = mx === 0 ? 0 : Math.sign(mx), ny = my === 0 ? 0 : Math.sign(my);
        if (Math.abs(mx) > Math.abs(my)) ny = 0; else nx = 0;
        d += ' Q' + (mx + nx * bulge * 2).toFixed(1) + ' ' + (my + ny * bulge * 2).toFixed(1) + ' ' + b[0].toFixed(1) + ' ' + b[1].toFixed(1);
      }
      path.setAttribute('d', d + 'Z');
    }
    function tick(now) { draw((now - t0) / 1000); raf = requestAnimationFrame(tick); }
    draw(0);
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (still || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (es) {
      es.forEach(function (en) { cancelAnimationFrame(raf); raf = 0; if (en.isIntersecting) { t0 = performance.now(); raf = requestAnimationFrame(tick); } });
    }, { threshold: 0.3 }).observe(svg.closest('.s') || svg.closest('[data-pin]'));
  });

  /* input → the scribble → output. Two flat cones meet the scribble from either side: a gradient of
     light pours in through the input, into the scribble, and comes out of the output as color */
  document.querySelectorAll('[data-flow]').forEach(function (svg) {
    var NS = 'http://www.w3.org/2000/svg', raf = 0, t0 = 0, last = 0, bits = [], tall = false, G = {};
    var INKS = ['#e3241b', '#2e57b8', '#e0a500', '#2f8a4b', '#ee7a26', '#6b4aa0', '#e05a93', '#1f9bb3'];
    function el(name, attrs, parent) { var e = document.createElementNS(NS, name); for (var k in attrs) e.setAttribute(k, attrs[k]); (parent || svg).appendChild(e); return e; }
    // geometry along the flow, written for left → right; a phone turns it to run top → bottom
    function at(u, v) { return tall ? [G.H / 2 + v, u] : [u, G.H / 2 + v]; }
    function build() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      tall = window.innerHeight > window.innerWidth * 1.1;
      var L = tall ? 1500 : 1600, H = tall ? 640 : 620;
      G = { L: L, H: H, mouth: H * .29, neck: 26, r: tall ? 150 : 170 };
      var gap = tall ? 95 : 30;
      G.c = L / 2; G.inA = L * .07; G.inB = G.c - G.r - 30; G.outA = G.c + G.r + gap; G.outB = L * .93;
      svg.setAttribute('viewBox', tall ? '0 0 ' + H + ' ' + L : '0 0 ' + L + ' ' + H);
      G.defs = el('defs', {});
      G.ink = getComputedStyle(svg).color;
      var reach = Math.hypot(G.c - G.inA, G.mouth) + 4;
      G.gin = light('flow-in', reach, -1); G.gout = light('flow-out', reach, 1);
      cone(G.inA, G.c - G.r * .35, G.mouth, G.neck, 'url(#flow-in)', 'cin'); cone(G.outB, G.c + G.r * .35, G.mouth, G.neck, 'url(#flow-out)', 'cout');
      var img = el('image', { href: '/workshops/bgsu/circles/circle-1.svg', width: G.r * 2, height: G.r * 2 });  // drawn after the cones, so it sits over their ends
      var c = at(G.c, 0); img.setAttribute('x', c[0] - G.r); img.setAttribute('y', c[1] - G.r); G.ring = img;
      var fs = tall ? 46 : 52, f2 = tall ? 20 : 19;
      label('Input', G.inA + (G.inB - G.inA) * .38, -G.mouth - 46, fs, 'lab');
      label('Output', G.outA + (G.outB - G.outA) * .62, -G.mouth - 46, fs, 'lab');
    }
    function cone(wide, narrow, R, r, fill, id) {
      // flat: the cone as a plain outline from its open mouth, filled with moving light, and fading out
      // as it reaches into the scribble, so it has no end of its own
      var A = at(wide, -R), B = at(narrow, -r), C = at(narrow, r), D = at(wide, R);
      var fade = el('linearGradient', { id: id + '-fade', gradientUnits: 'userSpaceOnUse' }, G.defs), f0 = at(wide, 0), f1 = at(narrow, 0);
      fade.setAttribute('x1', f0[0]); fade.setAttribute('y1', f0[1]); fade.setAttribute('x2', f1[0]); fade.setAttribute('y2', f1[1]);
      el('stop', { offset: 0, 'stop-color': '#fff' }, fade); el('stop', { offset: .5, 'stop-color': '#fff' }, fade); el('stop', { offset: 1, 'stop-color': '#000' }, fade);
      var mask = el('mask', { id: id + '-mask', maskUnits: 'userSpaceOnUse', x: -2000, y: -2000, width: 6000, height: 6000 }, G.defs);
      el('rect', { x: -2000, y: -2000, width: 6000, height: 6000, fill: 'url(#' + id + '-fade)' }, mask);
      var g = el('g', { mask: 'url(#' + id + '-mask)' });
      el('path', { d: 'M' + A + ' L' + B + ' L' + C + ' L' + D + ' Z', fill: fill, stroke: 'none' }, g);
    }
    // the light runs along the cone in straight bands, square across it (not rings round the scribble).
    // On the way in the bands close on the scribble; on the way out they open away from it, in color
    var STOPS = 40, SPEC = [[227, 36, 27], [238, 122, 38], [224, 165, 0], [47, 138, 75], [31, 155, 179], [46, 87, 184], [107, 74, 160], [224, 90, 147]];
    function light(id, reach, dir) {
      var c = at(G.c, 0), e = at(G.c + dir * reach, 0), g = el('linearGradient', { id: id, gradientUnits: 'userSpaceOnUse', x1: c[0], y1: c[1], x2: e[0], y2: e[1] }, G.defs);
      g.stops = [];
      for (var i = 0; i < STOPS; i++) g.stops.push(el('stop', { offset: (i / (STOPS - 1)).toFixed(3) }, g));
      return g;
    }
    function spec(x) {
      x = ((x % 1) + 1) % 1 * SPEC.length; var i = Math.floor(x), f = x - i, a = SPEC[i], b = SPEC[(i + 1) % SPEC.length];
      return 'rgb(' + [0, 1, 2].map(function (k) { return Math.round(a[k] + (b[k] - a[k]) * f); }).join(',') + ')';
    }
    function shine(clock) {
      G.gin.stops.forEach(function (st, i) {
        var o = i / (STOPS - 1), band = .5 + .5 * Math.cos(Math.PI * 2 * (o * 5 + clock * .7));
        st.setAttribute('stop-color', G.ink); st.setAttribute('stop-opacity', (.04 + .2 * band * band).toFixed(3));
      });
      G.gout.stops.forEach(function (st, i) {
        var o = i / (STOPS - 1);
        st.setAttribute('stop-color', spec(o * 1.4 - clock * .22)); st.setAttribute('stop-opacity', .58);
      });
    }
    function label(text, u, v, size, cls) {
      var p = at(u, v), t = el('text', { class: cls, x: p[0], y: p[1], 'font-size': size, 'text-anchor': 'middle', 'dominant-baseline': 'middle' });
      if (tall && cls === 'lab') { var q = at(u, 0); t.setAttribute('x', q[0] - G.mouth - 40); t.setAttribute('y', q[1]); t.setAttribute('text-anchor', 'end'); }
      if (tall && cls === 'sub') {
        var q2 = at(G.c, 0); t.setAttribute('x', q2[0] - G.r - 16); t.setAttribute('y', q2[1] - 14); t.setAttribute('text-anchor', 'end');
        t.innerHTML = '<tspan>The scribble:</tspan><tspan x="' + (q2[0] - G.r - 16) + '" dy="1.3em">the human part</tspan>'; return;
      }
      t.textContent = text;
    }
    var clock = 0;
    function step(dt) {
      clock += dt;
      shine(clock);
      // the scribble turns over slowly, its own circle changing now and then
      if (Math.random() < dt * 1.2) G.ring.setAttribute('href', '/workshops/bgsu/circles/circle-' + (1 + Math.floor(Math.random() * 84)) + '.svg');
    }
    function tick(now) { var dt = Math.min(.05, (now - last) / 1000); last = now; step(dt); raf = requestAnimationFrame(tick); }
    build(); step(0);
    window.addEventListener('resize', function () { build(); step(0); });
    if (!('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        cancelAnimationFrame(raf); raf = 0;
        if (en.isIntersecting) { last = performance.now(); raf = requestAnimationFrame(tick); }
      });
    }, { threshold: 0.4 }).observe(svg.closest('.s'));
  });

  /* now: the news comes in around the mark, word by word, each time the screen arrives */
  document.querySelectorAll('.now').forEach(function (sec) {
    if (!('IntersectionObserver' in window)) { sec.classList.add('is-on'); return; }
    new IntersectionObserver(function (es) {
      es.forEach(function (en) { sec.classList.toggle('is-on', en.isIntersecting); });
    }, { threshold: 0.6 }).observe(sec);
  });

  /* cut paper: twenty shapes of every kind, a little off where the scissors wandered */
  var CUT = (function () {
    var seed = 11, R = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    var PAPER = ['#d8352a', '#2e57b8', '#f2bf1d', '#2f8a4b', '#ee7a26', '#1d1d1d', '#e98bb0', '#6b4aa0', '#8a5a34', '#3bb3c9'];
    function ring(n, f) { var p = []; for (var i = 0; i < n; i++) { var a = i / n * Math.PI * 2; p.push(f(a, i)); } return p; }
    function pol(r, a) { return [50 + Math.cos(a) * r, 50 + Math.sin(a) * r]; }
    var SHAPES = [
      function () { return ring(40, function (a) { return pol(40, a); }); },                                   // circle
      function () { return [[14, 14], [86, 14], [86, 86], [14, 86]]; },                                         // square
      function () { return [[50, 10], [90, 86], [10, 86]]; },                                                   // triangle
      function () { var p = []; for (var i = 0; i <= 24; i++) { var t = Math.PI + i / 24 * Math.PI; p.push([50 + Math.cos(t) * 42, 66 + Math.sin(t) * 42]); } return p; }, // half circle
      function () { var o = ring(32, function (a) { return pol(42, a); }), n = ring(32, function (a) { return pol(20, -a); }); return o.concat([o[0], n[0]]).concat(n).concat([n[0]]); }, // ring
      function () { return ring(10, function (a, i) { return pol(i % 2 ? 17 : 42, a - Math.PI / 2); }); },     // star
      function () { return [[8, 36], [92, 36], [92, 64], [8, 64]]; },                                           // bar
      function () { return [[50, 8], [90, 50], [50, 92], [10, 50]]; },                                          // diamond
      function () { var o = ring(30, function (a) { return pol(40, a); }), n = ring(30, function (a) { return [58 + Math.cos(-a) * 32, 44 + Math.sin(-a) * 32]; }); return o.slice(0, 19).concat(n.slice(11, 30)); }, // crescent
      function () { return [[12, 12], [40, 12], [40, 60], [88, 60], [88, 88], [12, 88]]; },                     // L
      function () { return [[36, 10], [64, 10], [64, 36], [90, 36], [90, 64], [64, 64], [64, 90], [36, 90], [36, 64], [10, 64], [10, 36], [36, 36]]; }, // cross
      function () { return [[28, 18], [72, 18], [92, 82], [8, 82]]; },                                          // trapezoid
      function () { var p = []; for (var i = 0; i <= 8; i++) p.push([8 + i * 10.5, i % 2 ? 30 : 12]); for (var j = 8; j >= 0; j--) p.push([8 + j * 10.5, j % 2 ? 88 : 70]); return p; }, // zigzag strip
      function () { return ring(36, function (a) { var r = 40 * (1 - .55 * Math.pow(Math.max(0, Math.cos(a + Math.PI / 2)), 6)); return [50 + Math.cos(a) * r * .7, 50 + Math.sin(a) * r]; }); }, // teardrop
      function () { var p = []; for (var i = 0; i <= 20; i++) { var t = i / 20; p.push([8 + t * 84, 32 + Math.sin(t * Math.PI * 1.5) * 16]); } for (var j = 20; j >= 0; j--) { var u = j / 20; p.push([8 + u * 84, 60 + Math.sin(u * Math.PI * 1.5) * 16]); } return p; }, // wave
      function () { var p = [[10, 90]]; for (var i = 0; i <= 20; i++) { var t = i / 20 * Math.PI / 2; p.push([10 + Math.cos(t) * 80, 90 - Math.sin(t) * 80]); } return p; }, // quarter circle
      function () { return ring(30, function (a) { return [50 + Math.cos(a) * 42, 50 + Math.sin(a) * 26]; }).map(function (q) { return [q[0], q[1] + (q[0] - 50) * .3]; }); }, // leaf-ish oval
      function () { return ring(9, function (a) { return pol(28 + R() * 16, a); }); },                         // a wrong one
      function () { return [[18, 90], [18, 40]].concat(ring(20, function (a) { return [50 - Math.cos(a / 2) * 32, 40 - Math.sin(a / 2) * 32]; }).slice(1)).concat([[82, 40], [82, 90], [64, 90], [64, 46], [36, 46], [36, 90]]); }, // arch
      function () { return ring(14, function (a, i) { return pol(i % 2 ? 30 : 42, a); }); }                    // scalloped
    ];
    // a pair of scissors never quite follows the line
    function cut(p) {
      return 'M' + p.map(function (q) { return (q[0] + (R() - .5) * 2.4).toFixed(1) + ' ' + (q[1] + (R() - .5) * 2.4).toFixed(1); }).join(' L') + 'Z';
    }
    return { R: R, PAPER: PAPER, SHAPES: SHAPES, cut: cut };
  })();

  /* by hand: the twenty, cut one after another */
  document.querySelectorAll('[data-cuts]').forEach(function (box) {
    var R = CUT.R, PAPER = CUT.PAPER, SHAPES = CUT.SHAPES, cut = CUT.cut;
    var figs = SHAPES.map(function (make, i) {
      var f = document.createElement('figure'), col = PAPER[i % PAPER.length], rot = ((R() - .5) * 24).toFixed(1);
      f.innerHTML = '<svg viewBox="0 0 100 100" style="--r:' + rot + 'deg"><path d="' + cut(make()) + '" fill="' + col + '"/></svg>';
      box.appendChild(f); return f;
    });
    var sec = box.closest('.s'), timer = 0;
    function reset() { clearTimeout(timer); figs.forEach(function (f) { f.classList.remove('is-cut'); }); }
    function run(i) { if (i >= figs.length) return; figs[i].classList.add('is-cut'); timer = setTimeout(function () { run(i + 1); }, 260); }
    if (!('IntersectionObserver' in window)) { sec.classList.add('is-on'); figs.forEach(function (f) { f.classList.add('is-cut'); }); return; }
    new IntersectionObserver(function (es) {
      es.forEach(function (en) { sec.classList.toggle('is-on', en.isIntersecting); reset(); if (en.isIntersecting) timer = setTimeout(function () { run(0); }, 500); });
    }, { threshold: 0.6 }).observe(sec);
  });

  /* compose: five of the twenty, each a different color, rearranged every few seconds */
  document.querySelectorAll('[data-compose]').forEach(function (box) {
    var seed = 7, R = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    var els = [];
    for (var i = 0; i < 5; i++) {
      var el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      el.setAttribute('viewBox', '0 0 100 100'); el.innerHTML = '<path/>';
      box.appendChild(el); els.push(el);
    }
    var lines = box.getAttribute('data-words') ? box.getAttribute('data-words').split('|') : [];
    var texts = lines.map(function (t) { var d = document.createElement('div'); d.className = 'word-line'; d.textContent = t; box.appendChild(d); return d; });
    // with words on top, black paper would swallow them
    var paper = texts.length ? CUT.PAPER.filter(function (c) { return c !== '#1d1d1d'; }) : CUT.PAPER;
    var mctx = document.createElement('canvas').getContext('2d');
    function measure(text) { mctx.font = '100px Signifier, Georgia, serif'; return mctx.measureText(text).width; }
    function pick(n, from) { var a = from.slice(), out = []; while (out.length < n) out.push(a.splice(Math.floor(R() * a.length), 1)[0]); return out; }
    function compose() {
      var shapes = pick(5, CUT.SHAPES.map(function (_, i) { return i; })), cols = pick(5, paper), cells = pick(5, [0, 1, 2, 3, 4, 5]);
      els.forEach(function (el, i) {
        var w = 22 + R() * 46;                      // as a share of the canvas width
        el.querySelector('path').setAttribute('d', CUT.cut(CUT.SHAPES[shapes[i]]()));
        el.querySelector('path').setAttribute('fill', cols[i]);
        el.style.width = w + '%';
        // each shape gets its own part of the sheet, then wanders in it, so they meet without piling up
        var c = cells[i], cx = (c % 2) * 50 + 25 + (R() - .5) * 30, cy = Math.floor(c / 2) * 33 + 17 + (R() - .5) * 20;
        el.style.left = (cx - w / 2) + '%';
        el.style.top = (cy - w * 11 / 17 / 2) + '%';
        el.style.transform = 'rotate(' + ((R() - .5) * 70).toFixed(1) + 'deg)';
      });
      // the eight lines: some big and some small, mostly level, now and then turned to run up a shape.
      // every line is measured first so it always lands whole on the sheet
      var W = box.clientWidth || 300, H = box.clientHeight || W * 17 / 11;
      texts.forEach(function (t, i) {
        var w100 = measure(t.textContent);                // width at 100px
        var turn = R() < .2, size = W * (R() < .3 ? .075 + R() * .03 : .032 + R() * .022);
        size = Math.min(size, (turn ? H * .8 : W * .9) * 100 / w100);
        var len = w100 * size / 100, x, y;
        if (turn) { x = W * .04 + R() * (W * .9 - size); y = len + R() * Math.max(0, H * .96 - len - size) ; }
        else { x = W * .04 + R() * Math.max(0, W * .92 - len); y = H * (.06 + i * .86 / texts.length) + (R() - .5) * H * .04; }
        t.style.fontSize = size.toFixed(1) + 'px';
        t.style.left = (x / W * 100).toFixed(2) + '%';
        t.style.top = (y / H * 100).toFixed(2) + '%';
        t.style.transform = 'rotate(' + (turn ? -90 : (R() - .5) * 8).toFixed(1) + 'deg)';
      });
    }
    compose();
    if (document.fonts && texts.length) document.fonts.ready.then(compose);
    var sec = box.closest('.s'), timer = 0;
    if (!('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (es) {
      es.forEach(function (en) { clearInterval(timer); if (en.isIntersecting) timer = setInterval(compose, 3200); });
    }, { threshold: 0.6 }).observe(sec);
  });

  /* the build: the step on screen sets the stage. From the circle on, each circle has its own ground and ink,
     four a second; inside it, the words take turns twice a second */
  document.querySelectorAll('[data-build]').forEach(function (build) {
    var stage = build.querySelector('.build__stage'), box = build.querySelector('[data-circles]');
    var steps = [].slice.call(build.querySelectorAll('.build__step'));
    var words = [].slice.call(build.querySelectorAll('.inside__words > span'));
    var els = [], k = 0, w = 0, spin = 0, talk = 0, step = -1;
    for (var i = 0; i < 84; i++) {
      var el = document.createElement('i');
      el.style.setProperty('--m', CIRCLES.url(i));
      if (i === 25) el.className = 'pair';   // the touching pair, kept as one
      box.appendChild(el); els.push(el);
    }
    function show(n) { els[k].classList.remove('on'); k = n % 84; els[k].classList.add('on'); CIRCLES.paint(stage, k); }
    function say(n) { words[w].classList.remove('on'); w = n % words.length; words[w].classList.add('on'); }
    els[0].classList.add('on'); say(0);
    // how far the circle has to grow, and travel, to fill the screen from where it sits
    function aim() {
      var r = box.getBoundingClientRect(), h = r.height || 1;
      build.style.setProperty('--zoom', (window.innerHeight * 1.18 / h).toFixed(2));
      if (window.innerHeight > window.innerWidth) build.style.setProperty('--zoom', (window.innerWidth * 1.65 / h).toFixed(2));
      var cx = r.left + r.width / 2, cy = stage.getBoundingClientRect().top + stage.clientHeight / 2;
      box.style.setProperty('--dx', (window.innerWidth / 2 - cx).toFixed(1) + 'px');
      box.style.setProperty('--dy', (cy - (r.top + r.height / 2)).toFixed(1) + 'px');
    }
    function set(n) {
      if (n === step) return;
      step = n; build.setAttribute('data-step', n);
      clearInterval(spin); clearInterval(talk); clearTimeout(talk);
      if (n < 2) { stage.style.backgroundColor = ''; stage.style.color = ''; return; }
      CIRCLES.paint(stage, k);
      spin = setInterval(function () { show(k + 1); }, 250);
      if (n === 3) { say(0); talk = setTimeout(function () { talk = setInterval(function () { say(w + 1); }, 550); }, 1900); }
    }
    function update() {
      var mid = window.innerHeight / 2, n = -1;
      steps.forEach(function (st, i) { var r = st.getBoundingClientRect(); if (r.top <= mid && r.bottom > mid) n = i; });
      if (n < 0) { clearInterval(spin); clearInterval(talk); step = -1; return; }
      if (step !== 3 && n === 3) aim();
      set(n);
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', function () { aim(); update(); });
    aim(); update();
  });

  /* typed lines: one letter at a time, a pause between lines, from the top each time the screen arrives */
  document.querySelectorAll('[data-type]').forEach(function (el) {
    var lines = el.getAttribute('data-type').split('|'), timer = 0, speed = +el.getAttribute('data-speed') || 1;
    function render(li, ci) {
      var html = '';
      for (var i = 0; i <= li && i < lines.length; i++) {
        var t = i < li ? lines[i] : lines[i].slice(0, ci);
        html += (i ? '<br>' : '') + t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      }
      el.innerHTML = html + '<span class="caret"></span>';
    }
    function run() {
      var li = 0, ci = 0;
      clearTimeout(timer); render(0, 0);
      (function step() {
        if (li >= lines.length) return;
        if (ci < lines[li].length) { ci++; render(li, ci); timer = setTimeout(step, (55 + Math.random() * 70) * speed); }
        else if (li < lines.length - 1) { li++; ci = 0; timer = setTimeout(step, 900 * speed); }
      })();
    }
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (still || !('IntersectionObserver' in window)) { render(lines.length - 1, lines[lines.length - 1].length); return; }
    render(0, 0);
    new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) timer = setTimeout(run, 400); else { clearTimeout(timer); render(0, 0); } });
    }, { threshold: 0.6 }).observe(el.closest('.s'));
  });

  /* ── the system: drawn by system.js; this only starts it, and keeps the color moving ── */
  (function () {
    var cv = document.querySelector('.sys__art');
    if (!cv || !window.OPALSystem) return;
    var sys = OPALSystem(cv), t0 = 0, raf = 0, on = false;
    // its colors can be chosen on the slide: ` opens a panel of the six tones and two accents; they are kept
    // on this computer (and copied, to send to Claude) as the city's colors, ~ in the panel puts mine back
    var SYS_KEY = 'talk-sys-colors', BASE = sys.colors();
    try { var savedCols = JSON.parse(localStorage.getItem(SYS_KEY) || 'null'); if (savedCols) sys.colors(savedCols); } catch (e) {}
    var panel = null;
    function buildPanel() {
      panel = document.createElement('div'); panel.id = 'sys-colors';
      var cur = sys.colors(), html = '<p class="sys-colors__t">The city’s colors</p><p class="sys-colors__h">Six tones the blocks drift between, and two accents for the few bright cubes and the glow.</p><div class="sys-colors__grid">';
      cur.tiles.forEach(function (c, i) { html += '<label><input type="color" data-i="' + i + '" value="' + c + '"><span>Tone ' + (i + 1) + '</span></label>'; });
      html += '<label><input type="color" data-k="a" value="' + cur.a + '"><span>Accent 1</span></label><label><input type="color" data-k="b" value="' + cur.b + '"><span>Accent 2</span></label></div><button type="button" class="sys-colors__reset">Back to the start</button>';
      panel.innerHTML = html; document.body.appendChild(panel);
      panel.addEventListener('input', function (e) {
        var t = e.target; if (t.type !== 'color') return;
        var c = sys.colors(); if (t.dataset.i != null) c.tiles[+t.dataset.i] = t.value; else c[t.dataset.k] = t.value;
        sys.colors(c); if (!on) sys.frame(sys.FULL + 2);
      });
      panel.querySelector('.sys-colors__reset').addEventListener('click', function () {
        sys.colors(BASE); try { localStorage.removeItem(SYS_KEY); } catch (e) {}
        panel.remove(); panel = null; buildPanel(); panel.classList.add('is-on');
      });
    }
    window.__sysPanel = function () {
      var s0 = secs[current()]; if (!s0 || !s0.classList.contains('sys')) { if (panel && panel.classList.contains('is-on')) { panel.classList.remove('is-on'); document.body.classList.remove('tool-ctl'); } return false; }
      if (!panel) buildPanel();
      var open = !panel.classList.contains('is-on'); panel.classList.toggle('is-on', open); document.body.classList.toggle('tool-ctl', open);
      if (!open) { var c = sys.colors(); try { localStorage.setItem(SYS_KEY, JSON.stringify(c)); } catch (e) {} if (navigator.clipboard) navigator.clipboard.writeText('system colors\n' + JSON.stringify(c)).catch(function () {}); toast('Saved as the city’s colors · copied, to send to Claude'); }
      return true;
    };
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function size() { var r = cv.getBoundingClientRect(); sys.resize(r.width, r.height, Math.min(2, window.devicePixelRatio || 1)); }
    function tick(now) {
      sys.frame(still ? sys.FULL + 2 : (now - t0) / 1000);
      raf = on && !still ? requestAnimationFrame(tick) : 0;
    }
    function play() { cancelAnimationFrame(raf); size(); t0 = performance.now(); on = true; raf = requestAnimationFrame(tick); }
    function stop() { on = false; cancelAnimationFrame(raf); raf = 0; size(); sys.frame(0); }
    var pin = cv.closest('[data-pin]'), steps = [].slice.call(pin.querySelectorAll('.pin__step')), step = -1;
    steps[1].addEventListener('click', play);
    // the step on screen decides: the idea holds its square; the next step lets the system out of it
    function update() {
      var mid = window.innerHeight / 2, n = -1;
      steps.forEach(function (st, i) { var r = st.getBoundingClientRect(); if (r.top <= mid && r.bottom > mid) n = i; });
      if (n === step) return;
      step = n; pin.setAttribute('data-step', n);
      if (n === 1) play(); else if (on) stop();
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', function () { if (!on) { size(); sys.frame(0); } else size(); });
    size(); sys.frame(0); update();
  })();

  /* ── the mad lib: copy the sentence as filled, blanks marked if left empty ── */
  var lib = document.querySelector('.lib');
  if (lib) {
    var btn = lib.querySelector('.lib__copy');
    lib.querySelectorAll('.blank').forEach(function (b) {
      b.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); b.blur(); } e.stopPropagation(); });
      b.addEventListener('paste', function (e) { e.preventDefault(); document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text').replace(/\s+/g, ' ')); });
    });
    btn.addEventListener('click', function () {
      var text = '';
      lib.querySelector('.lib__text').childNodes.forEach(function (n) {
        text += n.nodeType === 3 ? n.nodeValue : (n.textContent.trim() || '______');
      });
      text = text.replace(/\s+/g, ' ').trim();
      var done = function () { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = 'Copy prompt'; }, 1600); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () { window.prompt('Copy this:', text); });
      else window.prompt('Copy this:', text);
    });
  }

  /* the example: copy it as one prompt */
  document.querySelectorAll('[data-copy-example]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var box = btn.closest('.s').querySelector('[data-example]'), parts = [];
      [].forEach.call(box.children, function (n) {
        if (n.tagName === 'UL') [].forEach.call(n.children, function (li) { parts.push('- ' + li.textContent.trim()); });
        else parts.push(n.textContent.trim());
      });
      var text = parts.join('\n');
      var done = function () { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = 'Copy prompt'; }, 1600); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () { window.prompt('Copy this:', text); });
      else window.prompt('Copy this:', text);
    });
  });

  /* ── moving through it ── */
  var secs = [].slice.call(document.querySelectorAll('.s'));
  var count = document.querySelector('.count');
  var links = [].slice.call(document.querySelectorAll('.chrome a'));
  var hint = document.querySelector('.hint');
  var ws = document.getElementById('workshop') ? secs.indexOf(document.getElementById('workshop')) : secs.length;   // the talk and the workshop are two pages now

  function current() {
    var mid = window.innerHeight / 2, best = 0;
    secs.forEach(function (s, i) { var r = s.getBoundingClientRect(); if (r.top <= mid) best = i; });
    return best;
  }
  function update() {
    var i = current();
    count.textContent = (i + 1) + ' / ' + secs.length;
    links.forEach(function (a) { a.classList.toggle('is-on', a.dataset.sec === (i >= ws ? 'workshop' : 'talk')); });
    if (i > 0) hint.classList.add('is-gone');
  }
  function go(i) { i = Math.max(0, Math.min(secs.length - 1, i)); secs[i].scrollIntoView({ behavior: 'instant' }); }   // a cut, like slides: no scrolling between screens

  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var k = e.key;
    if (k === 'ArrowDown' || k === 'ArrowRight' || k === 'PageDown' || (k === ' ' && !e.shiftKey)) { e.preventDefault(); go(current() + 1); }
    else if (k === 'ArrowUp' || k === 'ArrowLeft' || k === 'PageUp' || (k === ' ' && e.shiftKey)) { e.preventDefault(); go(current() - 1); }
    else if (k === 'Home') { e.preventDefault(); go(0); }
    else if (k === 'End') { e.preventDefault(); go(secs.length - 1); }
    else if (k === 'n' || k === 'N') { document.body.classList.toggle('notes'); }
    else if (k === 'f' || k === 'F') {
      if (document.fullscreenElement) document.exitFullscreen(); else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
    }
  });
  // the wheel and the trackpad cut to the next screen too, as the keys do, instead of scrolling through
  // (the same pace as over a tool; panels of controls keep their own scrolling)
  (function () {
    var acc = 0, accT = 0, lastNav = 0;
    addEventListener('wheel', function (e) {
      if (e.ctrlKey || e.defaultPrevented) return;
      var tg = e.target; if (tg && tg.closest && tg.closest('#sys-colors, .ctl, [data-scroll]')) return;
      e.preventDefault();
      acc += e.deltaY; clearTimeout(accT); accT = setTimeout(function () { acc = 0; }, 220);
      var now = Date.now(); if (Math.abs(acc) > 50 && now - lastNav > 850) { go(current() + (acc > 0 ? 1 : -1)); lastNav = now; acc = 0; }
    }, { passive: false });
  })();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();

  /* ── type size: - smaller, = larger, 0 back to the size set in the stylesheet; remembered here ── */
  (function () {
    var root = document.documentElement, KEY = 'bgsu-talk-fs';
    var base = parseFloat(getComputedStyle(root).getPropertyValue('--fs')) || 1;
    try { var saved = parseFloat(localStorage.getItem(KEY)); if (saved) root.style.setProperty('--fs', saved); } catch (e) {}
    document.addEventListener('keydown', function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey || e.target.isContentEditable || (toolOnScreen && toolOnScreen())) return;
      var now = parseFloat(getComputedStyle(root).getPropertyValue('--fs')) || base, next = null;
      if (e.key === '-' || e.key === '_') next = Math.max(.5, now - .05);
      else if (e.key === '=' || e.key === '+') next = Math.min(1.4, now + .05);
      else if (e.key === '0') next = base;
      if (next === null) return;
      next = Math.round(next * 100) / 100; root.style.setProperty('--fs', next);
      try { localStorage.setItem(KEY, next); } catch (e2) {}
      window.dispatchEvent(new Event('resize'));
    });
  })();

  /* ── the grid: press g to see the website's twelve columns over any screen ── */
  var grid = document.createElement('div'); grid.className = 'grid-overlay'; grid.setAttribute('aria-hidden', 'true');
  grid.innerHTML = new Array(13).join('<i></i>'); document.body.appendChild(grid);
  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey || e.target.isContentEditable) return;
    if (e.key === 'g' || e.key === 'G') grid.classList.toggle('is-on');
  });

  /* ── the mic: hold m and the talk listens; it is off the rest of the time. Silence does nothing;
     speaking lifts the letters on screen away like feathers, further the louder, and the white ground
     takes a light tint (louder a little deeper, a lower voice warmer, a higher one cooler, during the
     talk only). Go quiet or let go of m and the letters drift back together. ── */
  var mic = null;
  // one audio engine for the whole talk, made (and woken) inside the key press itself: one made later,
  // after the permission prompt, starts paused in Chrome and only ever hears silence
  var AC = null;
  function wake() {
    if (!AC) { var C = window.AudioContext || window.webkitAudioContext; if (C) AC = new C(); }
    if (AC && AC.state === 'suspended') AC.resume();
  }
  function micStart() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !AC) return;
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }).then(function (stream) {
      if (!held) { stream.getTracks().forEach(function (t) { t.stop(); }); return; }   // let go before the mic arrived
      if (AC.state === 'suspended') AC.resume();
      var ac = AC, an = ac.createAnalyser(), srcNode = ac.createMediaStreamSource(stream);
      an.fftSize = 2048; an.smoothingTimeConstant = .8;
      // the whole voice, with only the rumble under 80 Hz taken out (as in the Instrument)
      var hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 80;
      srcNode.connect(hp); hp.connect(an);
      var td = new Float32Array(an.fftSize), fd = new Uint8Array(an.frequencyBinCount), level = 0, hue = 120, amt = 0, hot = 0;
      mic && (mic.cal = null);
      mic = { stream: stream, src: srcNode, raf: 0, off: false };
      (function listen() {
        an.getFloatTimeDomainData(td); an.getByteFrequencyData(fd);
        var sum = 0; for (var i = 0; i < td.length; i++) sum += td[i] * td[i];
        var rms = Math.sqrt(sum / td.length), lv = Math.min(1, rms * 20);   // the Instrument's response: straight from the voice, no gate
        var num = 0, den = 0, bin = ac.sampleRate / an.fftSize;
        for (var j = 3; j < fd.length / 4; j++) { num += j * bin * fd[j]; den += fd[j]; }
        var centroid = den ? num / den : 800, h = 25 + Math.max(0, Math.min(1, (centroid - 400) / 2200)) * 195;
        // only the click of the m key itself is ignored: the first fifth of a second after the press
        if (performance.now() - pressAt < 200) lv = 0;
        level += (lv - level) * (lv > level ? .5 : .08); if (lv > .05) hue += (h - hue) * .08;   // quick to rise, slow to fall
        // only while m is held: let go and everything eases back together
        amt += ((held ? Math.min(1, Math.max(0, level - .03) / .6) : 0) - amt) * (held ? .4 : .025);
        var talk = current() < ws;
        document.body.style.backgroundColor = talk && amt > .005 ? 'hsl(' + hue.toFixed(0) + ',' + (18 + amt * 40).toFixed(0) + '%,' + (98 - amt * 9).toFixed(1) + '%)' : '';
        var now = performance.now(), dt = Math.min(.05, (now - (mic.last || now)) / 1000); mic.last = now;
        if (mic.off) level = 0;
        melt(secs[current()], level, dt);
        var want = held && !mic.off ? Math.min(1, Math.max(0, level - .04) / .5) * Math.min(1, gather * 1.6) : 0;   // builds over a few seconds, like the letters
        toolLv += (want - toolLv) * (want > toolLv ? .3 : Math.min(1, dt * .7)); if (toolLv < .003 && !want) toolLv = 0;   // and settles back slowly
        var tf = toolOnScreen(); if (tf) voiceTool(tf, toolLv);
        if (mic.off && amt < .002 && !toolLv && !(meltSec && meltSec.__letters && meltSec.__letters.some(function (c) { return c.__o; }))) { micStop(); return; }
        mic.raf = requestAnimationFrame(listen);
      })();
    }).catch(function () { document.body.classList.remove('mic-on'); });
  }
  /* the voice also gets into the type: the louder you speak, the more the letters on screen come apart.
     They loosen, drip, tip and blur, and pull back together when you stop. Words that change on their
     own (the rotating word, the typed lines, the title) are left alone. */
  var gather = 0, meltSec = null, SKIP = '[data-roles], [data-trail], .thanks__word, [data-rotate], .typed, [data-vapour], [data-legible], .lib, .tool__frame, .particle-src, .collide__words';
  // every piece of type on the screen comes apart, small as well as big: the slide, the pinned stage it
  // sits on (thinking/doing, the idea), and the frame's own title and links. Not the speaker notes, the
  // live tools, drawings, or the words that change by themselves.
  var NOT = '.note, script, style, svg, iframe, canvas, textarea, input, button, .count, .hint, .mic-dot, .grid-overlay, ' + SKIP;
  var WHOLE = '.is-a__blank, [data-rotate], .typed, [data-vapour], [data-legible]';
  function roots(sec) {
    var r = [sec], stage = sec.closest('[data-build], [data-pin]'), chrome = document.querySelector('.chrome');
    if (stage) r.push(stage.querySelector('.build__stage, .pin__stage'));
    if (chrome) r.push(chrome);
    return r.filter(Boolean);
  }
  function split(root) {
    var walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: function (n) {
      var el = n.parentNode;
      if (!n.nodeValue.trim() || el.classList.contains('ml') || el.closest(NOT)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    } }), nodes = [];
    while (walk.nextNode()) nodes.push(walk.currentNode);
    nodes.forEach(function (node) {
      var frag = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var w = document.createElement('span'); w.style.cssText = 'display:inline-block;white-space:nowrap';
        part.split('').forEach(function (ch) {
          var c = document.createElement('span'); c.className = 'ml'; c.textContent = ch; c.style.display = 'inline-block'; c.style.transformOrigin = '50% 0';
          w.appendChild(c);
        });
        frag.appendChild(w);
      });
      node.parentNode.replaceChild(frag, node);
    });
  }
  function letters(sec) {
    if (sec.__letters) return sec.__letters;
    var out = [];
    roots(sec).forEach(function (r) {
      split(r);
      [].forEach.call(r.querySelectorAll('.ml'), function (c) { if (!c.closest(NOT) && (r !== sec ? true : c.closest('.s') === sec)) out.push(c); });
    });
    // the words that change by themselves (the designer's role, the poem's rotating word, typed and
    // vapour lines) can't be cut into letters without breaking them, so each lifts away whole
    [].forEach.call(sec.querySelectorAll(WHOLE), function (w) {
      if (w.closest('.note') || (w.parentNode.closest && w.parentNode.closest(WHOLE))) return;
      if (getComputedStyle(w).display === 'inline') w.style.display = 'inline-block';
      w.style.transformOrigin = '50% 0'; out.push(w);
    });
    return (sec.__letters = out);
  }

  function rest(sec) { if (sec && sec.__letters) sec.__letters.forEach(function (c) { c.__o = null; c.style.transform = ''; c.style.filter = ''; }); }
  // each letter lifts away like a feather: it drifts off in its own direction with the voice, carried
  // more by inertia than force, swaying side to side and rocking as it goes. Quiet, and it glides home.
  function melt(sec, voice, dt) {
    if (!sec) return;
    if (sec !== meltSec) { rest(meltSec); meltSec = sec; }
    var W = window.innerWidth, H = window.innerHeight, t = performance.now() / 1000;
    // progressive, never an explosion: the sound has to keep going to gather strength (about three
    // seconds of steady voice to reach full), and it falls away again in the pauses
    var speak0 = held ? Math.min(1, Math.max(0, voice - .04) / .4) : 0;
    gather = Math.max(0, Math.min(1, gather + (speak0 > 0 ? dt * speak0 * .33 : -dt * (held ? .25 : 1))));
    letters(sec).forEach(function (c) {
      if (c.__th == null) c.__th = Math.random() * .65;              // when this letter lets go: a few first, then more, then all
      var o = c.__o, p = Math.min(1, Math.max(0, (gather - c.__th) / .35)), speak = speak0 * p;
      if (!o) {
        if (speak <= 0) return;
        var a = Math.random() * Math.PI * 2;
        var q = c.getBoundingClientRect();
        o = c.__o = { x: 0, y: 0, vx: 0, vy: 0, r: 0, dx: Math.cos(a), dy: Math.sin(a) - .35, sp: .5 + Math.random(), ph: Math.random() * 6.28, sw: .6 + Math.random() * .8, bx: q.left, by: q.top, bw: q.width, bh: q.height };
      }
      if (speak > 0) {
        // the voice is a wind that builds: hold a long, loud sound (hellOOOOO) and the letters keep
        // gathering speed and fly further; a short word only nudges them. Still eased, never thrown
        var gust = Math.pow(speak, 1.5) * 900 * o.sp;
        o.vx += o.dx * gust * dt; o.vy += o.dy * gust * dt;
        var drag = Math.pow(.45, dt); o.vx *= drag; o.vy *= drag;
        var vmax = 40 + 1100 * p * p, v = Math.hypot(o.vx, o.vy); if (v > vmax) { o.vx *= vmax / v; o.vy *= vmax / v; }   // slow at first, faster as it gathers
      } else {
        var damp = Math.pow(.08, dt); o.vx *= damp; o.vy *= damp;
        var home = Math.min(1, dt * (held ? 1.1 : .75));        // quiet: drift home slowly, with m still held or not; never rushed
        o.x += (0 - o.x) * home; o.y += (0 - o.y) * home;
      }
      o.x += o.vx * dt; o.y += o.vy * dt;
      // never past the edge of the screen: at the edge a letter turns back, softly
      var m = 24, lo = Math.min(0, m - o.bx), hi = Math.max(0, W - m - o.bw - o.bx), top = Math.min(0, m + 40 - o.by), bot = Math.max(0, H - m - o.bh - o.by);   // home is always allowed
      if (o.x < lo) { o.x = lo; o.dx = Math.abs(o.dx); o.vx = Math.abs(o.vx) * .3; }
      if (o.x > hi) { o.x = hi; o.dx = -Math.abs(o.dx); o.vx = -Math.abs(o.vx) * .3; }
      if (o.y < top) { o.y = top; o.dy = Math.abs(o.dy); o.vy = Math.abs(o.vy) * .3; }
      if (o.y > bot) { o.y = bot; o.dy = -Math.abs(o.dy); o.vy = -Math.abs(o.vy) * .3; }
      var far = Math.min(1, Math.hypot(o.x, o.y) / 120);         // the further it has drifted, the more it sways
      var sway = Math.sin(t * 1.1 * o.sw + o.ph) * 16 * far, rock = Math.sin(t * .9 * o.sw + o.ph + 1) * 22 * far;
      if (!held && Math.abs(o.x) + Math.abs(o.y) < .4) { c.__o = null; c.style.transform = ''; return; }
      var sx = Math.max(lo, Math.min(hi, o.x + sway));
      c.style.transform = 'translate(' + sx.toFixed(1) + 'px,' + o.y.toFixed(1) + 'px) rotate(' + rock.toFixed(1) + 'deg)';
    });
  }
  /* the voice in the tools: hold m on a tool's screen and it answers. The Instrument takes the voice as its own
     sound (it pushes the engine, the way its Listen does); Mitsuo, Liquid, Connected, Flora and Facet push one
     setting each (data-voice: id:value at full voice); the rest swell and brighten. Quiet, and all goes back. */
  function voiceTool(fr, v) {
    try {
      if (v < .002 && !(fr.__vLast > .002)) return;   // quiet and already home: nothing to do
      fr.__vLast = v;
      var w = fr.contentWindow, d = fr.contentDocument;
      if (fr.hasAttribute('data-instrument')) { w.__talkLevel = v; return; }
      if (fr.dataset.voice) {
        var now = performance.now(); if (v >= .002 && now - (fr.__vT || 0) < 60) return; fr.__vT = now;
        fr.__vBase = fr.__vBase || {};
        fr.dataset.voice.split(',').forEach(function (kv) {
          var q = kv.split(':'), el = d.getElementById(q[0]); if (!el) return;
          if (!(q[0] in fr.__vBase)) fr.__vBase[q[0]] = +el.value;
          var base = fr.__vBase[q[0]]; el.value = v < .002 ? base : base + (+q[1] - base) * v;
          el.dispatchEvent(new Event('input', { bubbles: true }));
        });
        if (v < .002) fr.__vBase = null;               // home again: next time, start from whatever is set then
        return;
      }
      fr.style.transform = v < .002 ? '' : 'scale(' + (1 + v * .07).toFixed(3) + ')';
      fr.style.filter = v < .002 ? '' : 'brightness(' + (1 + v * .45).toFixed(2) + ') saturate(' + (1 + v * .8).toFixed(2) + ')';
    } catch (e) {}
  }
  function micStop() {
    if (!mic) return;
    var tf0 = toolOnScreen(); if (tf0) voiceTool(tf0, 0);
    toolLv = 0;
    rest(meltSec); meltSec = null;
    cancelAnimationFrame(mic.raf); mic.stream.getTracks().forEach(function (t) { t.stop(); }); try { mic.src.disconnect(); } catch (e) {}
    mic = null; document.body.style.backgroundColor = ''; document.body.classList.remove('mic-on');
  }
  // the mic is on only while m is held down. Let go and the microphone switches off at once; the
  // letters then glide home, and when they are all back the listening loop stops too
  var held = false, pressAt = 0, quiet = [], floor = 0, toolLv = 0;
  function press() {
    held = true; pressAt = performance.now(); quiet = []; floor = 0; gather = 0; wake();
    if (mic && !mic.off) return;                                     // already listening
    if (mic) { cancelAnimationFrame(mic.raf); try { mic.src.disconnect(); } catch (e) {} mic = null; }  // pressed again while the letters were still gliding home
    document.body.classList.add('mic-on');
    micStart();
  }
  function letGo() {
    held = false;
    if (mic && mic.stream) { mic.stream.getTracks().forEach(function (t) { t.stop(); }); mic.off = true; }
    if (!mic) document.body.classList.remove('mic-on');
  }
  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey || e.target.isContentEditable) return;
    if ((e.key === 'm' || e.key === 'M') && !e.repeat) press();
  });
  document.addEventListener('keyup', function (e) { if (e.key === 'm' || e.key === 'M') letGo(); });
  // (not on window blur: the permission prompt and a click into a tool both blur the window)
  document.addEventListener('visibilitychange', function () { if (document.hidden) letGo(); });
})();
