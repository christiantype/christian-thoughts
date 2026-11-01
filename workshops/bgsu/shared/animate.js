/* ── OPL Animate — fade in from above on scroll ── */
(function () {
  // Reduced motion: drop the MOVEMENT, keep the fade. A translate is motion and
  // is switched off; a cross-fade with no displacement is not, and switching the
  // whole reveal off meant anyone with the OS setting on saw a static page.
  const REDUCE = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const SHIFT = REDUCE ? 'none' : 'translateY(-10px)';

  const sel = [
    'h1', 'h2', 'h3',
    'p', '.label', '.section-name', '.member-name',
    '.nav-wordmark',
    '.project-image', '.project-image--full',
    '.gallery-grid .gb-entry',
    '.next-title',
    '.apply-link',
    '.canvas-wrap', '.canvas-controls',
    '.word-input', '.gb-btn'
  ].join(', ');

  const els = [...document.querySelectorAll(sel)].filter(
    el => !el.closest('nav') && !el.closest('.project-row') &&
          !el.classList.contains('project-mockup') &&
          // Mockups (.lumen) run their own animations and inject after this
          // script — never apply the scroll-reveal opacity to their content,
          // or semantic h1/h3/p inside a mockup can get stranded at opacity:0.
          !el.closest('.lumen') &&
          !el.closest('[data-no-reveal]') &&
          // Same for the extracted-feature vignettes (the dark card band).
          !el.closest('.proj-cards-band')
  );

  els.forEach(el => {
    el.style.opacity  = '0';
    if (!REDUCE) el.style.transform = SHIFT;
    el.style.transition = REDUCE ? 'opacity 0.55s ease' : 'opacity 0.55s ease, transform 0.55s ease';
  });

  /* An escape hatch for the QA harness, which measures geometry and has to see
     the page as it is when everything has arrived. Nothing else sets it. */
  if (document.documentElement.classList.contains('reveal-off')) {
    els.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
    return;
  }

  /* Arriving is the only direction. A line fades in as it enters the screen
     and then it has arrived — scrolling back up does not take it away again.
     Reversing the reveal made the page feel unfinished: things that were read
     a moment ago were gone when you looked back, and the reader was being asked
     to re-earn what they had already seen. The stagger stays, so a band still
     comes in in reading order; it just happens once.

     The root is inset by a tenth of the screen so nothing arrives while it is
     still well below the fold. */
  const show = (el, delay) => {
    clearTimeout(el._rv);
    el._rv = setTimeout(() => {
      el.style.opacity = '1';
      if (!REDUCE) el.style.transform = 'translateY(0)';
      el._shown = 1;
    }, delay);
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      show(entry.target, entry.target._seen ? 0 : i * 65);
      entry.target._seen = 1;
      observer.unobserve(entry.target);
    });
  }, { threshold: 0, rootMargin: '-10% 0px -10% 0px' });

  els.forEach(el => observer.observe(el));

  /* Safety net: anything the reader has already gone past is shown at once.
     The observer never fires for an element that was jumped over — a fast
     flick, an anchor jump or a restored scroll position — and now that each
     element is let go of once it has arrived, a missed one would be stranded
     at nothing for good. */
  let elSweeping = false;
  const sweepEls = () => {
    elSweeping = false;
    els.forEach(el => {
      if (el._shown) return;
      const r = el.getBoundingClientRect();
      if (r.bottom <= 0) { show(el, 0); observer.unobserve(el); }
    });
  };
  addEventListener('scroll', () => {
    if (!elSweeping) { elSweeping = true; requestAnimationFrame(sweepEls); }
  }, { passive: true });
  addEventListener('load', sweepEls);

  /* ── Plates: a settle on entry ──
     The plate fades while the image inside it rises a little and eases out of a
     slight zoom, so a picture arrives rather than appears. The PLATE's transform
     is reserved for the scroll drift, so the settle rides on the IMAGE — the two
     never fight over the same property.

     Reduced motion makes this gentler, not absent: the distances shrink and the
     continuous scroll-linked drift is what gets dropped, since that is the part
     that actually causes discomfort. */
  const LIFT = REDUCE ? 5 : 16;      // px the image rises into place
  const ZOOM = REDUCE ? 1.012 : 1.045;
  const EASE = 'cubic-bezier(0.2, 0.7, 0.2, 1)';

  const plateSel = [
    '.lab-fig', '.lab-tool', '.lab-entry', '.feed-item',
    '.info-half', '.info-person', '.lab-band__body', '[data-reveal]'
  ].join(', ');

  const plates = [...document.querySelectorAll(plateSel)]
    .filter(el => !el.closest('nav') && !el.closest('[data-no-reveal-plate]'));

  plates.forEach(el => {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.9s cubic-bezier(0.2, 0.7, 0.2, 1)';
    const img = el.querySelector('img, canvas, video');
    if (img) {
      img.style.transform = `translateY(${LIFT}px) scale(${ZOOM})`;
      img.style.transition = `transform 1.05s ${EASE}`;
      img.style.willChange = 'transform';
    }
  });

  const settle = el => {
    el.style.opacity = '1';
    const img = el.querySelector('img, canvas, video');
    if (img) img.style.transform = 'translateY(0) scale(1)';
  };

  /* The first screenful cascades: whatever is already in view when the page
     opens eases in one after another, in document order, at a pace you can
     actually read. After that, plates settle as they are scrolled to. */
  let firstPass = true;
  setTimeout(() => { firstPass = false; }, 1200);

  const plateObserver = new IntersectionObserver(entries => {
    const showing = entries.filter(e => e.isIntersecting);
    if (!showing.length) return;
    // in document order, so the cascade runs down the page rather than by
    // whichever element the observer happened to report first
    showing.sort((a, b) =>
      a.target.compareDocumentPosition(b.target) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
    const step = firstPass ? 130 : 80;
    showing.forEach((entry, i) => {
      setTimeout(() => settle(entry.target), i * step);
      plateObserver.unobserve(entry.target);
    });
  }, { threshold: 0.02, rootMargin: '0px 0px -4% 0px' });

  plates.forEach(el => plateObserver.observe(el));

  /* Safety net: anything the reader has already scrolled past is shown at once.
     An IntersectionObserver never fires for an element that was jumped over —
     a fast flick, an anchor jump or a restored scroll position would otherwise
     strand it at opacity 0 for good. */
  let sweeping = false;
  const sweep = () => {
    sweeping = false;
    plates.forEach(el => {
      if (el.style.opacity === '1') return;
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) return;   // in view: let the observer stagger it
      if (r.bottom <= 0) { settle(el); plateObserver.unobserve(el); }
    });
  };
  addEventListener('scroll', () => { if (!sweeping) { sweeping = true; requestAnimationFrame(sweep); } }, { passive: true });
  addEventListener('load', sweep);
})();

/* ── Colored periods ── */
(function () {
  // Deepened/saturated so every random pick stays legible on white
  // (was light pastels: #ff94c9 #FFED00 #79c7f1 #fcc1b8 #bbff34)
  const colors = ['#ff4f9e', '#e0a000', '#2f9bd6', '#ef5a45', '#7aae1f'];
  const skip = new Set(['SCRIPT', 'STYLE', 'svg', 'path']);

  function colorPeriods(node) {
    if (skip.has(node.nodeName)) return;
    // Leave product-UI mockups alone — the Lumen interface keeps plain,
    // un-recolored punctuation (the colored-punctuation treatment is OP/AL's,
    // not the product's).
    if (node.nodeType === Node.ELEMENT_NODE && node.classList &&
        (node.classList.contains('lumen') ||
         node.classList.contains('proj-card__vig') ||
         // A specimen is the alphabet laid out as evidence. Colouring every
         // ampersand and bracket in it turns a character set into a sentence
         // about the house palette, which is not what it is for.
         node.classList.contains('specimen') ||
         node.classList.contains('specimen__set'))) return;
    const punctRe = /([.,\-–—:;!?()[\]{}"'\/\\&@#])/;
    if (node.nodeType === Node.TEXT_NODE && punctRe.test(node.textContent)) {
      const frag = document.createDocumentFragment();
      node.textContent.split(punctRe).forEach(part => {
        if (punctRe.test(part) && part.length === 1) {
          const s = document.createElement('span');
          s.textContent = part;
          s.style.color = colors[Math.floor(Math.random() * colors.length)];
          frag.appendChild(s);
        } else if (part) {
          frag.appendChild(document.createTextNode(part));
        }
      });
      node.parentNode.replaceChild(frag, node);
      return;
    }
    node.childNodes.forEach(colorPeriods);
  }

  colorPeriods(document.body);

  /* ── A name inside a sentence ──
     Where the site used to put a heading over a paragraph, the paragraph now
     opens with the name and the name is set in colour — the hierarchy is in
     the copy rather than in a line above it. Same five colours as the
     punctuation, and no two keys on a page take the same one, so Research and
     Artifact read as two things rather than one treatment. */
  /* A key that names its own ink is left alone: Research and Artifact hold
     one colour each across the site, so they are not in the shuffle. */
  const keys = [...document.querySelectorAll('.key')].filter(el => !('ink' in el.dataset));
  const bag = colors.slice();
  keys.forEach(el => {
    if (!bag.length) bag.push(...colors);
    const i = Math.floor(Math.random() * bag.length);
    el.style.color = bag.splice(i, 1)[0];
  });
})();

/* ── The ghosted heading never runs off the page ──
   A section heading is set on one line so it reads as a single mark behind the
   text. A long one — “What it keeps being about” — is wider than the measure,
   and the band clips its overflow, so the last word simply disappears. Rather
   than let the words decide, the heading is stepped down until it fits the band
   it sits in. Short headings never reach the loop. */
(function fitLabels() {
  /* A letter's left sidebearing is part of the drawing, not part of the
     measure. Set flush to a box, “Research” starts 6px right of “Thesis” at
     120px, because R carries more air on its left than T does — so the
     headings did not line up with each other or with the column of text under
     them. Each one is pulled left by its own first glyph's sidebearing, less
     the body text's, so every heading's ink starts on the same line as the
     writing. This is what a compositor did by eye and by hand. */
  const inkOffset = (fontShorthand, ch) => {
    const c = inkOffset._c || (inkOffset._c = document.createElement('canvas').getContext('2d'));
    c.font = fontShorthand;
    const m = c.measureText(ch);
    if (typeof m.actualBoundingBoxLeft !== 'number') return 0;
    return -m.actualBoundingBoxLeft;    // ink's distance right of the origin
  };

  const run = () => {
    const labels = [...document.querySelectorAll('.lab-band .label')]
      .filter(l => parseFloat(getComputedStyle(l).fontSize) > 40);
    if (!labels.length) return;
    labels.forEach(l => { l.dataset.fs = l.dataset.fs || getComputedStyle(l).fontSize; });
    labels.forEach(l => {
      const band = l.closest('.lab-band');
      if (!band) return;
      l.style.fontSize = l.dataset.fs;
      l.style.marginLeft = '';
      const room = band.getBoundingClientRect().right - l.getBoundingClientRect().left;
      const want = l.scrollWidth;
      if (room > 0 && want > room) {
        l.style.fontSize = (parseFloat(l.dataset.fs) * (room / want)).toFixed(2) + 'px';
      }
      // optical alignment, measured against the text this heading sits behind
      const body = band.querySelector('.lab-band__body') || band;
      const ch = (l.textContent || '').trim()[0];
      if (!ch) return;
      const ls = getComputedStyle(l), bs = getComputedStyle(body);
      const head = inkOffset(ls.fontWeight + ' ' + ls.fontSize + ' ' + ls.fontFamily, ch);
      const text = inkOffset(bs.fontWeight + ' ' + bs.fontSize + ' ' + bs.fontFamily, 'n');
      const shift = head - text;
      if (Math.abs(shift) > 0.5) l.style.marginLeft = (-shift).toFixed(1) + 'px';
    });
  };
  run();
  addEventListener('resize', run);
  addEventListener('load', run);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
  // a department page draws its bands after this file has run
  setTimeout(run, 400); setTimeout(run, 1200);
})();
