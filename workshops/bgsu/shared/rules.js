/* ── The rules across the pictures ────────────────────────────────────────────
   The house rule, stated once and used on every index:

     A rule is struck from a picture — its TOP edge, its CENTRE, or its FOOT —
     and then runs the whole width of the window, edge to edge, outside the
     grid the pictures are set on. Every other picture gets one, and the three
     places come round in turn, so the set is scattered without being random:
     the same page draws the same rules every time it is opened.

   The pictures sit on top. A rule reads across the white and goes behind the
   work when it meets it, so a plate's own edge is never doubled by one.

   The rules drift against the page as it scrolls — a slip of a few pixels,
   each at its own rate — and each one is let go of as it reaches the fixed
   header and taken up again below it, because a hairline crossing the wordmark
   reads as a strike-through.

   Width is measured, not 100vw: vw counts the scrollbar and would put a few
   pixels of horizontal scroll on the page.

   Call it with the section to hang the layer in and the plates to strike from:
     OPAL.rules('#feed', '.feed-item__plate')                                 */
(function () {
  const WHERE = ['top', 'middle', 'bottom'];

  /* ── A rule made of slashes ───────────────────────────────────────────────
     The rule still runs where it ran — struck from a picture's top edge, its
     centre or its foot, and out to both edges of the window. What changed is
     what it is made of: instead of one continuous hairline it is a row of
     slashes, / / / /, each one at the angle of the mark.

     Each slash is drawn by hand into a canvas sized in device pixels, one
     pixel per row, so the stroke is a true single pixel and steps across the
     grid rather than being smoothed over it. The tile's width is the slash's
     own horizontal run plus the gap, so it repeats forever without a seam, and
     both sides are whole multiples of the pixel ratio so the browser never
     resamples it. */
  const SLASH_RUN = 111.9, SLASH_RISE = 184.5;    // the mark's own stroke

  function slashTile(dpr, rgba, h, gap) {
    const k = Math.max(1, Math.round(dpr));
    const H = Math.max(k * 4, Math.round(h) * k);
    const run = Math.max(k, Math.round(H * (SLASH_RUN / SLASH_RISE)));
    const W = run + Math.max(k * 2, Math.round(gap) * k);
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d');
    g.clearRect(0, 0, W, H);
    g.fillStyle = rgba;
    for (let y = 0; y < H; y++) {
      const x = Math.round((H - 1 - y) * (run / (H - 1 || 1)));
      g.fillRect(Math.min(x, W - 1), y, 1, 1);
    }
    return { url: c.toDataURL(), w: W / k, h: H / k };
  }

  function rules(sectionSel, plateSel, opts) {
    opts = opts || {};
    const feed = document.querySelector(sectionSel);
    if (!feed) return;
    const plates = [...feed.querySelectorAll(plateSel)];
    if (!plates.length) return;
    if (getComputedStyle(feed).position === 'static') feed.style.position = 'relative';

    const layer = document.createElement('div');
    layer.className = 'feed-rules';
    layer.setAttribute('aria-hidden', 'true');
    feed.appendChild(layer);

    const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const CAP = REDUCE ? 6 : 22;
    let tick = false;

    const paint = () => {
      tick = false;
      const nav = document.querySelector('nav');
      const hide = nav ? nav.getBoundingClientRect().bottom + 6 : 0;
      const fade = 26, mid = innerHeight / 2;
      [...layer.children].forEach(i => {
        const y = i._y - scrollY;                       // where it was struck
        const d = Math.max(-CAP, Math.min(CAP, -(y - mid) * i._k));
        i.style.transform = 'translateY(' + d.toFixed(2) + 'px)';
        const at = y + d;                               // where it now reads
        const o = at >= hide + fade ? 1 : at <= hide ? 0 : (at - hide) / fade;
        i.style.setProperty('--o', o.toFixed(3));
        // and how far it has been drawn, by how far the page has been read
        const p2 = Math.max(0, Math.min(1, (scrollY + innerHeight * 0.62 - i._y) / 300));
        i.style.clipPath = 'inset(0 ' + ((1 - p2) * 100).toFixed(2) + '% 0 0)';
      });
    };

    const strike = () => {
      const f = feed.getBoundingClientRect();
      layer.style.left = Math.round(-f.left) + 'px';
      layer.style.width = document.documentElement.clientWidth + 'px';
      layer.style.height = Math.round(f.height) + 'px';
      /* Three places, and they come round in turn:

           top     the top edge of a picture
           bottom  its foot
           middle  halfway down the gap BETWEEN one row of pictures and the
                   next — the rule sits in the white, not across the work

         The pictures are grouped into rows first, because "between images"
         only means anything once you know which ones are side by side. */
      const boxes = plates.map(p => p.getBoundingClientRect()).filter(r => r.height >= 40);
      const rows = [];
      boxes.slice().sort((a, b) => a.top - b.top).forEach(r => {
        const row = rows.find(q => Math.abs(q.top - r.top) < 80);
        if (row) { row.top = Math.min(row.top, r.top); row.bottom = Math.max(row.bottom, r.bottom); }
        else rows.push({ top: r.top, bottom: r.bottom });
      });

      const ys = [];
      rows.forEach((row, i) => {
        const w = WHERE[i % 3];
        if (w === 'top')    ys.push(row.top);
        if (w === 'bottom') ys.push(row.bottom - 1);
        if (w === 'middle') {
          const next = rows[i + 1];
          // the gap under this row; the last row has none, so it takes its foot
          if (next && next.top > row.bottom) ys.push((row.bottom + next.top) / 2);
          else ys.push(row.bottom - 1);
        }
      });
      ys.splice(0, 0);
      const out = ys.map(y => Math.round(y - f.top));
      ys.length = 0; out.forEach(y => ys.push(y));
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      /* Air between them. At a nine-pixel mark every twelve pixels the slashes
         fused into a grey hatch and stopped reading as marks at all — the rule
         looked like a band, which is the opposite of the point.

         A smaller mark, and the gap kept in proportion to it: the slashes are
         set at a smaller point size than they were, and the air between them
         comes down with them so the rhythm holds. */
      const t = slashTile(dpr, opts.ink || 'rgba(0,0,0,.5)', opts.mark || 7, opts.gap || 15);
      /* The rule is drawn, not placed: it runs out from its left edge as the
         page is read, and runs back the same way. Clipped rather than scaled,
         so the marks keep their size and their spacing as the rule grows. */
      layer.innerHTML = ys.map(y => '<i style="top:' + (y - t.h / 2) + 'px;height:' + t.h +
        'px;background-image:url(' + t.url + ');background-size:' + t.w + 'px ' + t.h +
        'px;clip-path:inset(0 100% 0 0)"></i>').join('');
      const top = f.top + scrollY;
      [...layer.children].forEach((i, n) => {
        i._y = top + ys[n];
        i._k = (REDUCE ? 0.006 : 0.016) + ((n * 37) % 5) / 420;   // its own rate
      });
      paint();
    };

    const onScroll = () => { if (!tick) { tick = true; requestAnimationFrame(paint); } };
    strike();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', strike);
    addEventListener('load', strike);
    // a lazy picture arriving changes a plate's height and moves everything
    // below it — the positions are only right once the heights are real
    [...feed.querySelectorAll('img')].forEach(i => i.addEventListener('load', strike));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(strike);
  }

  /* ── The cards drift ──────────────────────────────────────────────────────
     The feed reads slower than it scrolls: each card moves against the page at
     its own rate, so a row never arrives as a row. It is the whole card that
     moves, not the picture inside its frame — a frame cut to the picture's own
     proportions has no overhang, so sliding the picture inside it would uncover
     an edge and the only cure for that is a crop. Nothing here is cropped.

     The travel is capped well inside the row gap, so two cards can never meet,
     and it settles to nothing as a card crosses the middle of the window —
     which is where it is being read. Reduced motion gets a tenth of it. */
  function drift(sectionSel, cardSel) {
    const host = document.querySelector(sectionSel);
    if (!host) return;
    const cards = [...host.querySelectorAll(cardSel)];
    if (!cards.length) return;
    if (matchMedia('(max-width: 40em)').matches) return;   // one column: nothing to stagger

    const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const CAP = REDUCE ? 4 : 26;
    cards.forEach((c, i) => {
      c._k = (REDUCE ? 0.004 : 0.016) + ((i * 29) % 6) / 300;   // its own rate
      c.style.willChange = 'transform';
    });

    let tick = false;
    const run = () => {
      tick = false;
      const mid = innerHeight / 2;
      cards.forEach(c => {
        const r = c.getBoundingClientRect();
        if (r.bottom < -300 || r.top > innerHeight + 300) return;
        const d = (r.top + r.height / 2) - mid;
        const y = Math.max(-CAP, Math.min(CAP, -d * c._k));
        c.style.transform = 'translate3d(0,' + y.toFixed(2) + 'px,0)';
      });
    };
    addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(run); } }, { passive: true });
    addEventListener('resize', run);
    run();
  }

  /* ── The slash field ──────────────────────────────────────────────────────
     Rick's note: instead of horizontal rules, a field of diagonals at the same
     angle as the slash in the wordmark, with the pictures floating on top.

     The angle is not chosen, it is measured. The slash in the OP/AL mark is the
     subpath `M723.6,398.3 h37.2 l111.9,-184.5`, so its stroke runs 111.9 across
     and 184.5 up: 58.763° from horizontal, rising to the right. A CSS gradient
     is given as the direction the bands march in, measured from "to top"
     clockwise, and the bands lie across it — so 58.763deg lays them rising to
     the right, parallel to the mark. (121.237 lays them the other way, which
     draws a backslash; it was the first thing tried and it was wrong.)

     A repeating gradient and not 1px elements, because a diagonal hairline made
     of elements is antialiased along its whole length and shimmers as the page
     drifts. The gradient is rasterised once per layer and holds still.

     The field is a layer like the rules are — behind the work, pointer-blind,
     and let go of under the header. */
  const SLASH = 58.763;

  function field(sectionSel, opts) {
    opts = opts || {};
    const host = document.querySelector(sectionSel);
    if (!host) return;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';

    const step = opts.step || 13;        // perpendicular distance between lines

    /* One DEVICE pixel, drawn and not described.

       Rick's note is that each line is really just a pixel. A CSS gradient
       cannot honour that: ask it for 1px and a retina screen gives you two
       device pixels; ask it for 0.5px and it blends the line across the grid
       and you get a smudge. Either way the pixel is not yours to place.

       So the field is a tile, drawn into a canvas sized in device pixels, where
       every pixel is set by hand. The slash's own slope is 184.5 / 111.9 =
       1.64879. The tile uses 33/20 — 1.65, which is 58.785° against the mark's
       58.763°, a difference of two hundredths of a degree — because a rational
       slope is what lets the tile repeat forever without a seam. 20 across and
       33 down, and the line steps through it exactly once.

       The result is a true one-device-pixel line, hard-edged, at any density. */
    const RUN = 20, RISE = 33;           // the rational slope the tile repeats on

    const tile = (dpr, rgba) => {
      /* A tile of W x H carrying a single line corner to corner repeats into a
         family of parallel lines. For the line to rejoin itself across the seam
         the tile's own proportion MUST be the slope: H / W = RISE / RUN. Any
         other width and the line reaches the edge at the wrong height and the
         field breaks into dashes — which is exactly what the first attempt did.

         So the tile is RUN x RISE device pixels, times k for the screen's
         density and times m for how far apart the lines sit. That fixes the
         spacing to multiples of RUN*RISE/hypot(RUN,RISE) = 17.1px measured
         across the lines; `step` is snapped to the nearest one, because a
         seamless field is worth more than an arbitrary gap.

         Both sides are whole multiples of k, so the tile is laid down at a
         whole number of CSS pixels and is never resampled. */
      const k = Math.max(1, Math.round(dpr));
      const UNIT = RUN * RISE / Math.hypot(RUN, RISE);     // 17.1px per repeat
      const m = Math.max(1, Math.round(step / UNIT));
      const W = RUN * k * m, H = RISE * k * m;
      const c = document.createElement('canvas');
      c.width = W; c.height = H;
      const g = c.getContext('2d');
      g.clearRect(0, 0, W, H);
      g.fillStyle = rgba;
      /* One pixel per row, placed by hand — no stroke, no blending, no
         antialiasing. The line runs from the bottom-left corner to the top
         right, which is the direction the slash runs. */
      for (let y = 0; y < H; y++) {
        const x = Math.round((H - 1 - y) * (W / H));
        g.fillRect(Math.min(x, W - 1), y, 1, 1);
      }
      return { url: c.toDataURL(), w: W, h: H, k: k };
    };

    const draw = () => {
      const dpr  = Math.max(1, window.devicePixelRatio || 1);
      const base = opts.alpha || 0.13;
      const rgb  = opts.rgb || '0,0,0';
      const ink  = opts.ink || 'rgba(' + rgb + ',' + Math.min(0.95, base * dpr).toFixed(3) + ')';
      const t = tile(dpr, ink);
      const k = t.k;
      layer.style.backgroundImage = 'url(' + t.url + ')';
      layer.style.backgroundRepeat = 'repeat';
      // the tile is in device pixels; laid down at exactly 1/k of that, which
      // is a whole number of CSS pixels, so one canvas pixel is one screen pixel
      layer.style.backgroundSize = (t.w / k) + 'px ' + (t.h / k) + 'px';
      layer._tileH = t.h / k;
    };

    const layer = document.createElement('div');
    layer.className = 'slash-field';
    layer.setAttribute('aria-hidden', 'true');
    host.appendChild(layer);
    draw();
    addEventListener('resize', draw);

    const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let tick = false;
    const paint = () => {
      tick = false;
      /* The field slips against the page. The offset is quantised to whole
         device pixels: a fractional background-position lands the gradient
         between pixels and Chrome softens every line to cover it, which is the
         one thing that turns these from pixels into smudges. Rounded, they stay
         hard-edged through the whole slip. */
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const raw = REDUCE ? 0 : (scrollY * 0.06) % step;
      const d = Math.round(raw * dpr) / dpr;
      layer.style.backgroundPosition = '0 ' + d + 'px';
      const nav = document.querySelector('nav');
      const hide = nav ? nav.getBoundingClientRect().bottom : 0;
      const r = host.getBoundingClientRect();
      layer.style.setProperty('--clip', Math.max(0, hide - r.top).toFixed(0) + 'px');
    };
    addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(paint); } }, { passive: true });
    addEventListener('resize', paint);
    paint();
  }

  /* ── A few of the grid's own lines, shown ─────────────────────────────────
     Not the whole twelve-column overlay — a handful of its verticals, left
     visible down the length of the feed. The page is set on a grid and this
     says so, quietly, without turning the page into a diagram.

     Which ones is fixed, not random: the same page shows the same lines every
     time it is opened. They do not drift. The slashes slip against the page
     because they are laid over it; the grid is what the page is built on, and
     a grid that moves is not a grid.

     The positions are read from the live grid rather than recomputed, so they
     are the actual column edges at whatever width the window happens to be. */
  function columns(sectionSel, gridSel, opts) {
    opts = opts || {};
    const host = document.querySelector(sectionSel);
    const grid = document.querySelector(gridSel);
    if (!host || !grid) return;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';

    const layer = document.createElement('div');
    layer.className = 'feed-cols';
    layer.setAttribute('aria-hidden', 'true');
    host.appendChild(layer);

    /* Three of the twelve, and each one only runs part of the way down — it
       starts somewhere and stops somewhere, so the grid is glimpsed rather than
       drawn. The column, the start and the length are fixed numbers, not random
       ones: the same page shows the same lines every time it is opened.

       Each entry is [column, where it starts, how far it runs], the last two as
       fractions of the feed's height. */
    const PICK = opts.pick || [[3, 0.06, 0.21], [8, 0.38, 0.17], [5, 0.71, 0.24]];

    const place = () => {
      const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').map(parseFloat);
      if (!cols.length || cols.some(isNaN)) return;
      const gb = grid.getBoundingClientRect(), hb = host.getBoundingClientRect();
      const gap = parseFloat(getComputedStyle(grid).columnGap) || 0;
      const left = gb.left - hb.left;
      const xs = [];
      let run = 0;
      cols.forEach(w => { xs.push(left + run); run += w + gap; });
      xs.push(left + run - gap);                 // the right edge of the last column
      const H = hb.height;
      layer.style.height = Math.round(H) + 'px';
      /* The picks are written against the twelve-column desktop grid. A phone
         grid has two columns and three edges, so each pick is mapped onto
         whatever edges this grid actually has rather than dropped — the lines
         belong on a phone as much as anywhere, they were simply switched off
         there, which is why they never drew. */
      const span = xs.length - 1;                 // how many edges this grid has
      const coarse = span < 11;                   // a phone: two columns, three edges

      /* On the desktop grid a line stands on a real column edge, in the gutter,
         beside the work. A phone grid has one interior edge, so standing on it
         put all three lines in the same place and the grid read as a single
         broken rule.

         There, the lines are let off the grid: they fall where the desktop
         column would have fallen as a fraction of the measure, which puts them
         through the pictures rather than beside them. They are drawn over the
         work for that reason — a line hidden behind a photograph for its whole
         length is not a line — and blended, so one declaration reads on a
         bright picture and a dark one alike. */
      layer.classList.toggle('is-free', coarse);

      const gw = gb.width;
      const place1 = (col, k) => coarse
        ? left + gw * (col / 12)                  // off the grid, through the work
        : xs[Math.max(0, Math.min(span, col))];   // on a real column edge

      layer.innerHTML = PICK.map((q, k) =>
        '<i style="left:' + place1(q[0], k).toFixed(1) + 'px;top:' + (H * q[1]).toFixed(0) +
        'px;height:' + (H * q[2]).toFixed(0) + 'px"></i>').join('');
      // each line remembers where it is in the document, so it can be drawn
      const top = hb.top + scrollY;
      [...layer.children].forEach(i => {
        /* offsetTop/offsetHeight, not getBoundingClientRect: the rect is
           measured AFTER the transform, and a line at scaleY(0) measures zero
           high. Reading the rect gave every line a height of 1px, so the
           progress was over the moment it began and nothing ever appeared to
           be drawn — it was simply there. Layout geometry ignores transforms. */
        i._top = i.offsetTop + hb.top + scrollY;
        i._h = i.offsetHeight || 1;
        i._p = 0;
      });
      ink();
    };

    /* ── The lines draw themselves ─────────────────────────────────────────
       A line is not placed, it is drawn: it grows from its top as you read
       down, and goes back the same way when you read up. The pen follows the
       page in both directions, so the grid is only ever as built as you have
       got — it is a record of the reading, not a decoration that arrives.

       scaleY from the top edge, which costs nothing to animate; reduced motion
       gets the finished line and no drawing at all. */
    const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
    /* The pen leads the fold. Drawing to the very bottom edge of the window
       meant the tip was always at the last visible pixel — the line was being
       drawn where you cannot watch it, and it simply appeared to be there
       already. The pen runs at 62% of the screen instead, so the line extends
       in front of you in the middle of the page. */
    const LEAD = 0.62;
    let tick = false;
    const ink = () => {
      tick = false;
      const edge = scrollY + innerHeight * LEAD;
      [...layer.children].forEach(i => {
        if (i._top === undefined) return;
        const p = REDUCE ? 1 : Math.max(0, Math.min(1, (edge - i._top) / i._h));
        if (Math.abs(p - i._p) < 0.0005) return;      // nothing worth repainting
        i._p = p;
        i.style.transform = 'scaleY(' + p.toFixed(4) + ')';
      });
    };
    addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(ink); } }, { passive: true });
    place();
    addEventListener('resize', place);
    addEventListener('load', place);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
  }

  /* ── The plate films ──────────────────────────────────────────────────────
     A thumbnail that happens to move is a picture, not a player. iOS decides
     for itself: a video it has not been able to start muted and inline gets the
     full native furniture — play, skip, AirPlay, picture-in-picture — over the
     artwork, which is what was happening on the phone.

     Three things stop it, and all three are needed:
       · muted and playsInline set as PROPERTIES, not just attributes written
         into markup, and set before play() is asked for
       · controls removed and the remote-playback and picture-in-picture
         affordances explicitly turned off
       · the element made untouchable in CSS, so a tap never summons them back

     Then it is asked to play, and asked again whenever it comes into view —
     an `autoplay` attribute on an injected element is not reliably honoured. */
  function films(sel) {
    const vids = [...document.querySelectorAll(sel || '.feed-item__plate video, .lab-entry__plate video')];
    if (!vids.length) return;
    const go = v => {
      v.muted = true; v.defaultMuted = true;
      v.playsInline = true;
      v.controls = false;
      v.removeAttribute('controls');
      v.disablePictureInPicture = true;
      v.setAttribute('disableremoteplayback', '');
      v.loop = true;
      const q = v.play(); if (q) q.catch(() => {});
    };
    /* The still goes in FIRST, and the film is revealed only once it is
       actually running.

       iOS refuses autoplay outright in Low Power Mode, on a Data Saver
       setting, and sometimes on a cold first load — and a <video> it will not
       start is not blank, it is a poster with the full native furniture drawn
       over it: play, skip ten, AirPlay, picture-in-picture. The film is
       pointer-blind so the card underneath takes the tap, which means pressing
       that play button opened the project. A control that does nothing but
       navigate is worse than no control.

       This used to be handled by waiting a second and a half and then swapping
       the film for its poster. That works, and it is still a second and a half
       of iOS furniture sitting on the artwork — which is exactly what gets
       photographed. So the order is turned around: the card holds its own
       first frame from the start, the film lies over it invisibly, and the
       film fades up on its `playing` event. A film that is never allowed to
       play is never seen, and nor is anything drawn on top of it. */
    const dress = v => {
      if (v.dataset.dressed) return;
      v.dataset.dressed = '1';
      const plate = v.parentElement;
      const src = v.getAttribute('poster') ||
                  (v.getAttribute('src') || '').replace(/\.mp4(\?.*)?$/, '-poster.jpg');
      if (src && plate && !plate.querySelector('.plate-still')) {
        const img = document.createElement('img');
        img.className = 'plate-still';
        img.src = src; img.alt = ''; img.loading = 'lazy';
        img.setAttribute('aria-hidden', 'true');
        plate.insertBefore(img, v);
      }
      v.classList.add('plate-film');
      /* `playing`, not `play`: play fires on the attempt, playing on the first
         frame actually rendered, and only the second is evidence. */
      v.addEventListener('playing', () => v.classList.add('is-running'));
      // if it stalls, errors or the system pauses it, the still comes back
      ['pause', 'stalled', 'emptied', 'error'].forEach(e =>
        v.addEventListener(e, () => v.classList.remove('is-running')));
      /* iOS pauses an inline film for its own reasons — a scroll it reads as
         a gesture, a moment of memory pressure — and the observer below only
         fires when a film CROSSES the edge of the window, so one that is
         already in view when it stops has nothing left to restart it. Ask
         again, a few times, and then let it be a still. */
      let retries = 0;
      v.addEventListener('pause', () => {
        if (retries++ > 3 || document.hidden || !near(v)) return;
        setTimeout(() => { if (v.paused && near(v)) go(v); }, 400);
      });
    };

    const near = v => {
      const r = v.getBoundingClientRect();
      return r.bottom > -600 && r.top < innerHeight + 600;
    };

    const start = v => { dress(v); go(v); };

    // every film gets its still at once; only the ones in view are asked to run
    vids.forEach(v => { dress(v); if (near(v)) go(v); });
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) start(e.target); }),
        { rootMargin: '300px' });
      vids.forEach(v => io.observe(v));
    }
    // iOS pauses a film when the tab goes away; ask again when it comes back
    addEventListener('pageshow', () => vids.forEach(go));
    document.addEventListener('visibilitychange', () => { if (!document.hidden) vids.forEach(go); });
  }

  /* ── The diagonals ────────────────────────────────────────────────────────
     Strokes at the angle of the mark, running across the page with the work
     sitting on them — the way they were sketched. Not one line from corner to
     corner of the page: shorter strokes, each one hung off a corner of a
     picture, each a different length.

     A stroke is not placed at a guessed fraction of the page; it is struck
     FROM the work. One end of every line lands exactly on a plate's corner —
     the four corners come round in turn, and the end that touches alternates,
     so a line sometimes runs away from a picture and sometimes arrives at one.
     Because the pictures move with the layout, so do the lines.

     A stroke is a single SVG line in a box whose proportion IS the slash's
     slope — 111.9 across to 184.5 up — so it runs at 58.763° without being
     rotated, and `crispEdges` keeps it aliased: it steps across the pixel grid
     rather than being smoothed over it.

     And each one draws itself. The stroke is dashed with a single dash as long
     as the line, and the gap pulled back as you read down — so the line grows
     from its top end, and goes back the same way when you read up. The pen
     leads the fold by a little under half a screen, so you watch it extend
     rather than finding it already there at the bottom edge. */
  const SLOPE = 184.5 / 111.9;      // the mark's own stroke, across to up

  /* Clip a convex polygon by a half-plane — Sutherland and Hodgman, the short
     version. A picture starts as its own rectangle and every line that slivers
     it takes another bite, so one picture can be cut by two different strokes
     and one stroke can cut two pictures. */
  function clipHalf(poly, m, c, keepBelow) {
    const inside = ([x, y]) => keepBelow ? (y - (m * x + c)) >= 0 : (y - (m * x + c)) <= 0;
    const cross = (p1, p2) => {
      const d1 = p1[1] - (m * p1[0] + c), d2 = p2[1] - (m * p2[0] + c);
      const t = d1 / (d1 - d2);
      return [p1[0] + t * (p2[0] - p1[0]), p1[1] + t * (p2[1] - p1[1])];
    };
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length];
      const ia = inside(a), ib = inside(b);
      if (ia) out.push(a);
      if (ia !== ib) out.push(cross(a, b));
    }
    return out;
  }
  const polyArea = pts => Math.abs(pts.reduce((a, q, i) => {
    const n = pts[(i + 1) % pts.length];
    return a + (q[0] * n[1] - n[0] * q[1]);
  }, 0)) / 2;

  function diagonals(sectionSel, opts) {
    opts = opts || {};
    const host = document.querySelector(sectionSel);
    if (!host) return;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';

    const layer = document.createElement('div');
    layer.className = 'feed-diagonals';
    layer.setAttribute('aria-hidden', 'true');
    host.appendChild(layer);

    const plateSel = opts.plates || '.feed-item__plate';
    const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const LEAD = 0.62;

    /* How much of a picture each sliver takes, cycled. Small numbers: the cut
       is a corner coming away, not a shape being made. */
    const SLIVERS = opts.slivers || [0.030, 0.018, 0.045, 0.024, 0.038, 0.015];
    /* Which corner, cycled. Only these two run with the slash — a cut at the
       other pair would lean the wrong way. */
    const CORNERS = ['tl', 'br'];
    /* How far the stroke runs past the picture it was cut from, as a multiple
       of the page's width. */
    const REACH = opts.reach || [0.20, 0.12, 0.26, 0.15];

    const place = () => {
      const hb = host.getBoundingClientRect();
      const W = Math.ceil(document.documentElement.clientWidth);
      const H = Math.round(hb.height);
      layer.style.left = Math.round(-hb.left) + 'px';
      layer.style.width = W + 'px';
      layer.style.height = H + 'px';

      const els = [...host.querySelectorAll(plateSel)]
        .filter(el => el.getBoundingClientRect().height > 60);

      const svgs = [];
      /* Every stroke runs at the same angle, so two of them are the same line
         when their intercepts match. A new stroke has to clear the ones already
         placed by a visible distance or it is not drawn at all. */
      const drawn = [];
      const APART = 90;                 // measured across the lines, in pixels
      els.forEach(el => { el.style.clipPath = ''; el._poly = null; });
      els.forEach((el, i) => {
        if (i % 2) return;                        // every other picture
        const r = el.getBoundingClientRect();
        const pw = r.width, ph = r.height;

        /* The sliver. A right triangle whose hypotenuse runs at the mark's own
           slope: legs p across and q down, with q / p = 184.5 / 111.9. Its area
           is p·q/2, so p falls out of the fraction we want to take away. */
        const corner = CORNERS[(i / 2) % CORNERS.length];

        /* How big a sliver, and from which corner, is not simply taken from the
           list: the list is where the search starts. A line that slivers one
           picture usually runs through the middle of the next, where cutting
           along it would take half the picture rather than a corner. So every
           sliver size on the list is tried, and the one that also grazes a
           corner of another picture wins — which is how a single line comes to
           cut two. Where none does, the first size stands. */
        const sizeFor = () => {
          const mk = f => {
            let a = Math.sqrt(2 * f * pw * ph / SLOPE), b2 = a * SLOPE;
            if (b2 > ph * 0.92) { b2 = ph * 0.92; a = b2 / SLOPE; }
            if (a > pw * 0.92) { a = pw * 0.92; b2 = a * SLOPE; }
            return [a, b2];
          };
          const start = (i / 2) % SLIVERS.length;
          for (let k = 0; k < SLIVERS.length; k++) {
            const [a, b2] = mk(SLIVERS[(start + k) % SLIVERS.length]);
            // the line this sliver would sit on, in layer pixels
            const P = corner === 'tl'
              ? [r.left - hb.left, r.top - hb.top + b2]
              : [r.left - hb.left + pw - a, r.top - hb.top + ph];
            const mm = -SLOPE, cc = P[1] - mm * P[0];
            const cuts = els.some((other, j) => {
              if (j === i) return false;
              const o = other.getBoundingClientRect();
              if (o.width < 60 || o.height < 60) return false;
              const ol = o.left - hb.left, ot = o.top - hb.top;
              const poly = other._poly || [[0,0],[o.width,0],[o.width,o.height],[0,o.height]];
              const c3 = (cc + mm * ol) - ot;
              const u = clipHalf(poly, mm, c3, false), d3 = clipHalf(poly, mm, c3, true);
              if (u.length < 3 || d3.length < 3) return false;
              const keep = polyArea(u) >= polyArea(d3) ? u : d3;
              const lost = (polyArea(poly) - polyArea(keep)) / (o.width * o.height);
              return lost >= 0.01 && lost <= 0.10;
            });
            if (cuts || k === SLIVERS.length - 1) return [a, b2];
          }
        };
        let [p1, q1] = sizeFor();
        const px = x => (x / pw * 100).toFixed(2) + '%';
        const py = y => (y / ph * 100).toFixed(2) + '%';

        // the two points the cut passes through, in the plate's own pixels
        let A, B;
        let own;
        if (corner === 'tl') {
          A = [0, q1]; B = [p1, 0];
          own = [[p1,0],[pw,0],[pw,ph],[0,ph],[0,q1]];
        } else {
          A = [pw - p1, ph]; B = [pw, ph - q1];
          own = [[0,0],[pw,0],[pw,ph-q1],[pw-p1,ph],[0,ph]];
        }
        /* And the stroke runs along that same cut, out past the picture on both
           sides — so the line and the picture's new edge are one line. */
        const reach = REACH[(i / 2) % REACH.length] * W;
        const ux = 1 / Math.hypot(1, SLOPE), uy = -SLOPE / Math.hypot(1, SLOPE);
        const ax = r.left - hb.left + A[0], ay = r.top - hb.top + A[1];
        const bx = r.left - hb.left + B[0], by = r.top - hb.top + B[1];
        const m2 = -SLOPE;                         // the line, in layer pixels
        const c2 = ay - m2 * ax;

        /* How far this line sits from the ones already drawn, measured across
           them: for two lines of the same slope that is the gap in intercept
           brought onto the perpendicular. Too close and it is not drawn — two
           strokes a few pixels apart read as one rule printed twice.

           This is asked FIRST, before a single picture is cut. It used to be
           asked at the end, by which point the slivers had already been taken:
           a stroke that lost the test left a picture sliced along a line that
           was never drawn, which is a corner cut off for no reason. Nothing is
           cut unless the line that cuts it is going to be there. */
        const sep = Math.abs(Math.cos(Math.atan(SLOPE)));
        if (drawn.some(c4 => Math.abs(c4 - c2) * sep < APART)) return;
        drawn.push(c2);

        el._poly = own;
        el.style.clipPath = 'polygon(' + own.map(c => px(c[0]) + ' ' + py(c[1])).join(', ') + ')';

        /* ── The same line, carried on through whatever it meets ────────────
           A stroke does not belong to one thumbnail. Every picture its line
           passes through gets a sliver taken off, including ones another stroke
           has already cut — each picture keeps its own polygon and every line
           that slivers it takes another bite. */
        let far = 0;
        els.forEach((other, j) => {
          if (j === i) return;
          const o = other.getBoundingClientRect();
          const ow = o.width, oh = o.height;
          if (ow < 60 || oh < 60) return;
          const ol = o.left - hb.left, ot = o.top - hb.top;
          const mm = m2, cc = (c2 + m2 * ol) - ot;
          const poly = other._poly || [[0,0],[ow,0],[ow,oh],[0,oh]];
          const whole = ow * oh;
          const up = clipHalf(poly, mm, cc, false), dn = clipHalf(poly, mm, cc, true);
          if (up.length < 3 || dn.length < 3) return;
          const keep2 = polyArea(up) >= polyArea(dn) ? up : dn;
          const lost2 = (polyArea(poly) - polyArea(keep2)) / whole;
          if (lost2 < 0.01 || lost2 > 0.10) return;
          other._poly = keep2;
          other.style.clipPath = 'polygon(' + keep2.map(q =>
            (q[0] / ow * 100).toFixed(2) + '% ' + (q[1] / oh * 100).toFixed(2) + '%').join(', ') + ')';
          // how far along the line that picture sits, so the stroke reaches it
          [[0, cc], [ow, mm * ow + cc]].forEach(([hx, hy]) => {
            const d2 = (ol + hx - ax) * ux + (ot + hy - ay) * uy;
            if (Math.abs(d2) > Math.abs(far)) far = d2;
          });
        });

        const out1 = Math.max(reach, far < 0 ? -far + reach * 0.4 : 0);
        const out2 = Math.max(reach, far > 0 ?  far + reach * 0.4 : 0);
        const x1 = ax - ux * out1, y1 = ay - uy * out1;
        const x2 = bx + ux * out2, y2 = by + uy * out2;
        /* The box is rounded to whole pixels so the stroke renders crisp, but the
           LINE is then placed at its true position inside that box rather than
           drawn corner to corner. Corner to corner, the line inherited the
           box's rounding — up to a pixel of slope and offset — and drifted off
           the edge it had just cut. The viewBox matches the box in size, so one
           unit is one pixel and a fractional coordinate lands where it means. */
        const bw = Math.abs(x2 - x1), bh = Math.abs(y1 - y2);
        const rx = Math.round(Math.min(x1, x2)), ry = Math.round(Math.min(y1, y2));
        const rw = Math.max(1, Math.round(bw)), rh = Math.max(1, Math.round(bh));
        const f4 = n => n.toFixed(2);
        svgs.push('<svg style="left:' + rx + 'px;top:' + ry + 'px;width:' + rw +
          'px;height:' + rh + 'px" viewBox="0 0 ' + rw + ' ' + rh +
          '" preserveAspectRatio="none" focusable="false">' +
          '<line x1="' + f4(x1 - rx) + '" y1="' + f4(y1 - ry) +
          '" x2="' + f4(x2 - rx) + '" y2="' + f4(y2 - ry) + '"/></svg>');
      });
      layer.innerHTML = svgs.join('');

      [...layer.children].forEach(svg => {
        const r = svg.getBoundingClientRect();
        const ln = svg.querySelector('line');
        const len = Math.hypot(r.width, r.height) || 1;
        ln.style.strokeDasharray = len + ' ' + len;
        ln.style.strokeDashoffset = len;
        svg._len = len; svg._top = r.top + scrollY; svg._h = r.height || 1; svg._p = -1;
      });
      ink();
    };

    let tick = false;
    const ink = () => {
      tick = false;
      const edge = scrollY + innerHeight * LEAD;
      [...layer.children].forEach(svg => {
        if (svg._top === undefined) return;
        const p2 = REDUCE ? 1 : Math.max(0, Math.min(1, (edge - svg._top) / svg._h));
        if (Math.abs(p2 - svg._p) < 0.001) return;
        svg._p = p2;
        svg.querySelector('line').style.strokeDashoffset = (svg._len * (1 - p2)).toFixed(1);
      });
    };

    place();
    addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(ink); } }, { passive: true });
    addEventListener('resize', place);
    addEventListener('load', place);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
  }

  (window.OPAL = window.OPAL || {}).rules = rules;
  window.OPAL.diagonals = diagonals;
  window.OPAL.films = films;
  window.OPAL.columns = columns;
  window.OPAL.field = field;
  window.OPAL.SLASH = SLASH;
  window.OPAL.drift = drift;
})();
