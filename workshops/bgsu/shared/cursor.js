/* ── OP/AL cursor ─────────────────────────────────────────────────────────────
   The same cursor the Chicago Graphic Design Club site uses: one dot that
   tracks the pointer exactly and grows over anything you can click.

   The dot takes a colour from the house palette on every load and a fresh one
   each time it arrives on something clickable. Tracking is 1:1 with no easing,
   because a cursor that lags is a cursor that feels broken.

   There used to be a tapering trail drawn behind it. It is gone: a cursor that
   leaves a drawing behind it is a second thing to look at, and the dot on its
   own says everything the trail was saying.

   Nothing runs on a touch screen.
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  if (!window.matchMedia('(hover: hover)').matches) return;   // not a pointer
  document.documentElement.classList.add('has-custom-cursor');

  /* ── The dot ──
     It takes a colour from the house palette on every load, so no two visits
     open on the same one, and a different one whenever it passes over
     something you can click. The colours are the site's own accents, which are
     all light enough to read on black and saturated enough to read on white,
     so the dot needs no blend to stay visible. */
  /* The deepened accents, not the pastels. A pale dot multiplied onto white
     came out at 1.6:1 — a mark you had to look for. These are the same five
     the punctuation and the department names use, chosen to hold on white. */
  const PALETTE = ['#ff4f9e', '#e0a000', '#2f9bd6', '#ef5a45', '#7aae1f'];
  const pick = not => {
    const options = PALETTE.filter(c => c !== not);
    return options[Math.floor(Math.random() * options.length)];
  };
  let colourNow = pick(null);

  const dot = document.createElement('div');
  dot.className = 'opl-cursor';
  dot.setAttribute('aria-hidden', 'true');
  dot.style.background = colourNow;
  // parked until the pointer is actually somewhere: at 0,0 half the dot sits in
  // the top-left corner of the page until the first move
  dot.style.transform = 'translate(-100px, -100px)';
  document.documentElement.appendChild(dot);

  /* A blend needs to know what it is blending against, and the answer changes
     as the pointer travels: a study page is white and then drops into a black
     In situ band halfway down. Reading the body's colour once meant the dot
     kept multiplying — and multiply over black paints nothing at all, so the
     dot simply vanished for the length of the band. So it reads what is
     actually painted beneath it: multiply on a light ground, difference on a
     dark one. Once per frame at most, and only when the answer changes. */
  const lumOf = c => {
    const m = /rgba?\(([^)]+)\)/.exec(c || ''); if (!m) return null;
    const n = m[1].split(',').map(parseFloat);
    if (n.length > 3 && n[3] < 0.5) return null;            // see through it
    return (0.2126 * n[0] + 0.7152 * n[1] + 0.0722 * n[2]) / 255;
  };
  let onDark = null, pending = 0, at = { x: -1, y: -1 };
  const readGround = () => {
    pending = 0;
    // elementsFromPoint, not elementFromPoint: the dot is on top of the very
    // thing it is asking about, so it has to look past itself
    const stack = document.elementsFromPoint(at.x, at.y) || [];
    let L = null;
    // the header's scrim is pointer-events:none, so hit-testing cannot see it
    const scrim = document.querySelector('.nav-scrim');
    if (scrim && +getComputedStyle(scrim).opacity > 0.5) {
      const r = scrim.getBoundingClientRect();
      if (at.y >= r.top && at.y <= r.bottom) L = lumOf(getComputedStyle(scrim).backgroundColor);
    }
    if (L === null) for (const el of stack) {
      if (el === dot) continue;
      const l = lumOf(getComputedStyle(el).backgroundColor);
      if (l !== null) { L = l; break; }
    }
    // Every band on a study page is transparent — the colour comes from the
    // page itself, which elementsFromPoint may not hand back. Ask it directly
    // before falling back to white, or the dot multiplies over a dark page and
    // disappears.
    if (L === null) L = lumOf(getComputedStyle(document.body).backgroundColor);
    if (L === null) L = lumOf(getComputedStyle(document.documentElement).backgroundColor);
    if (L === null) L = 1;
    const dark = L < 0.5;
    if (dark !== onDark) { onDark = dark; dot.classList.toggle('on-dark', dark); }
  };

  document.addEventListener('mousemove', e => {
    dot.style.transform = 'translate(' + e.clientX + 'px, ' + e.clientY + 'px)';
    at.x = e.clientX; at.y = e.clientY;
    if (!pending) pending = requestAnimationFrame(readGround);
  });
  const park = () => { dot.style.transform = 'translate(-100px, -100px)'; };
  document.addEventListener('mouseleave', park);
  /* An iframe swallows the pointer: the events go to the document inside it and
     this one stops hearing about them, so the dot stayed exactly where it
     crossed the edge — a frozen mark sitting on the artwork. The tool pages
     draw a dot of their own, so this one gets out of the way the moment the
     pointer arrives on a frame, and comes back when it leaves. */
  document.addEventListener('mouseover', e => {
    if (e.target && e.target.tagName === 'IFRAME') park();
  });
  addEventListener('blur', park);

  const CLICKABLE = 'a, button, [role="button"], label[for], select, summary,' +
    ' input[type="submit"], input[type="button"], input[type="checkbox"],' +
    ' input[type="radio"], input[type="range"], input[type="color"],' +
    // an instrument's artwork is a thing you act on — you type into it, draw on
    // it, drag it. Those ids exist only on the tool pages.
    ' #art, #render-canvas';
  let overClickable = false;
  document.addEventListener('mouseover', e => {
    const on = !!(e.target.closest && e.target.closest(CLICKABLE));
    dot.classList.toggle('is-hover', on);
    // a new colour each time it arrives on something, not on every mouseover
    if (on !== overClickable) {
      overClickable = on;
      colourNow = pick(colourNow);
      dot.style.background = colourNow;
    }
  });
})();
