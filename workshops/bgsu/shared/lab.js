/* ── OPL Shared Lab Template ── */
/* Lab is Original Practice: research published in a fixed framework.
   Every case study page declares a LAB object and loads this file — the same
   arrangement as shared/project.js, and the same page furniture (#hero,
   #credits, .container > .grid, .col-N, .label).

   The framework is fixed; the LAYOUT is not. Each band declares its own column
   span and start so a study reads as a composed document rather than a stack of
   identical rows — see LAYOUT below. Figures carry their own span/start too.

   Fields a case study may declare:
     number, title, pillar, medium, year, status, ongoing (bool),
     author, published (ISO), updated (ISO),
     provocation, question, position[], positionNote,
     figures[{src|html, alt, caption, credit, span, start, ratio}],
     output[], showcase[], research[], references[], next{title,url}
*/

/* ── The words come from a plain text file ───────────────────────────────────
   Each study has a .txt beside its .js. A heading in CAPITALS starts a section,
   a blank line starts a paragraph, and a # line is a private note. Whatever the
   text file supplies replaces what the .js holds, so the words can be edited
   without touching anything structural. */
function parseStudyText(src) {
  const HEADS = {
    TITLE: 'title', NAME: 'fullTitle', QUESTION: 'question', PROVOCATION: 'provocation',
    POSITION: 'position', RESEARCH: 'research',
    GROUNDS: 'grounds', REFERENCES: 'references', MEDIUM: 'medium', ACTIVE: 'active',
    EXAMPLES: 'output', SHOWCASE: 'showcase',
  };
  const SINGLE = ['title', 'fullTitle', 'question', 'provocation', 'medium', 'active'];
  const out = {};
  let key = null, buf = [];
  const flush = () => {
    if (!key) return;
    const paras = buf.join('\n').split(/\n\s*\n/).map(t => t.trim()).filter(Boolean);
    if (paras.length) out[key] = SINGLE.indexOf(key) >= 0 ? paras.join(' ') : paras;
    buf = [];
  };
  src.split(/\r?\n/).forEach(line => {
    if (/^\s*#/.test(line)) return;                       // a note to self
    const head = line.trim();
    if (HEADS[head]) { flush(); key = HEADS[head]; return; }
    buf.push(line);
  });
  flush();
  return out;
}

(function () {

  /* If the study's content file has a typo, say so plainly instead of rendering
     a blank white page — an edit that breaks should be obvious and recoverable. */
  if (typeof LAB === 'undefined' || !LAB || !LAB.title) {
    document.body.innerHTML =
      '<div style="padding:9em 10% 4em;font-family:\'Sidepiece-HoneyPie\',sans-serif;color:#000">' +
      '<p style="margin-bottom:1em"><strong>This study\u2019s text could not be read.</strong></p>' +
      '<p style="line-height:1.6;max-width:36em">Its file in <code>content/lab/</code> has a typo in it \u2014 ' +
      'usually a missing backtick or a missing comma. Open the browser console ' +
      '(View \u203a Developer \u203a JavaScript Console) and the first red line names the line number.</p></div>';
    return;
  }

  document.body.classList.add('lab-study');
  // the document's scroller is <html>, so a snap declared on <body> is
  // simply ignored — put it where the scrolling actually happens
  document.documentElement.classList.add('snap-y');

  function render() {

  /* ── Where each band sits on the twelve columns ──
     Every band stacks its label directly above its body, and the column each
     band starts in moves down the page: question at the left edge, inquiry
     indented, position held on the right inside a ruled box, the output plates
     across the full field, research low and left, references low and right. */
  /* ── Where each band sits on the twelve columns ──
     The defaults below hold every band in the same place, which is what makes a
     study read as one document. A study can move any band by declaring a
     `layout` block in its content file:

       layout: {
         position: { start: 5, span: 6 },     // column it begins in, columns wide
         research: { start: 1, span: 7, labelAbove: true },
       }

     start is 1–12, span is how many columns wide. `labelAbove: true` puts the
     band's label on its own line above the text instead of out in the margin.
     Press G on any page to see the columns. */
  /* The measure is set by the alphabet, not by the grid. Seven columns is 650px,
     which is three lowercase alphabets — about 100 characters to the line, half
     as long again as Bringhurst's comfortable maximum, and the reader loses the
     start of the next line. Five columns is 462px: 2.15 alphabets, about 71
     characters. That is the measure the two doors on Info were already set to,
     so the page had the right answer in it and the prose was not using it. */
  const DEFAULTS = {
    label:  { start: 1, span: 2 },
    body:   { start: 3, span: 7 },
    full:   { start: 1, span: 12 },
  };
  /* Bands that take the whole measure unless a study says otherwise. A band
     left off this list falls back to the seven-column text column, which is
     right for prose and wrong for a row of parts or an instrument — both of
     those were coming out two thirds of a page wide, indented from nothing. */
  const FULL_BANDS = ['output', 'showcase', 'gallery', 'quotes', 'timeline',
                      'themes', 'takeaways', 'breakdown', 'play',
                      /* an initiative band carries a wall or a carousel, and
                         both are pictures of the work — they want the page,
                         not the text measure */
                      'underscore', 'faculty', 'muradio'];
  const LAYOUT = (LAB && LAB.layout) || {};

  const place = key => {
    const set = LAYOUT[key] || {};
    const base = FULL_BANDS.indexOf(key) >= 0 ? DEFAULTS.full : DEFAULTS.body;
    return {
      start: set.start || base.start,
      span:  set.span  || base.span,
      labelStart: set.labelStart || DEFAULTS.label.start,
      labelSpan:  set.labelSpan  || DEFAULTS.label.span,
      labelAbove: set.labelAbove !== false,   // headings sit above the content, always
      /* A band that runs wider than the default has to be set larger, or its
         measure goes past three alphabets. The size travels with the column
         count in the layout block, because the two are the same decision. */
      size: set.size || null,
    };
  };

  /* ── SEO Meta Tags ── */
  const base      = 'https://more-than.design';
  const pagePath  = window.location.pathname.replace(/^\/OPL/, '');
  const canonical = base + pagePath;
  const firstFig  = (LAB.figures || []).find(f => f.src);
  const ogImage   = firstFig
    ? (/^https?:/.test(firstFig.src) ? firstFig.src : base + '/' + firstFig.src.replace(/^\//, ''))
    : base + '/workshops/bgsu/images/opal-open-graph.jpg?v=20261009';

  /* LAB.title is the department — Technology, Image, Community — and four of
     the six studies carry one. A tab or a share card reading "Technology"
     names the shelf rather than the piece, so the title, the card and the
     header all use the study's own name where it has one. */
  const shareName = LAB.fullTitle || LAB.title;

  document.title = `${shareName} — Research — OP/AL`;
  // What the header says once the mark has closed: the study's own name,
  // not the department it sits in.
  document.documentElement.dataset.pageName = shareName;

  const metas = [
    { name: 'description',         content: LAB.provocation },
    { name: 'author',              content: LAB.author || 'Christian Solorzano' },
    { property: 'og:type',         content: 'article' },
    { property: 'og:site_name',    content: 'OP/AL' },
    { property: 'og:title',        content: `${shareName} — Research — OP/AL` },
    { property: 'og:description',  content: LAB.provocation },
    { property: 'og:image',        content: ogImage },
    { property: 'og:url',          content: canonical },
    { property: 'article:published_time', content: LAB.published },
    { property: 'article:modified_time',  content: LAB.updated },
    { name: 'twitter:card',        content: 'summary_large_image' },
    { name: 'twitter:title',       content: `${shareName} — Research — OP/AL` },
    { name: 'twitter:description', content: LAB.provocation },
    { name: 'twitter:image',       content: ogImage },
  ];
  metas.forEach(({ name, property, content }) => {
    if (!content) return;
    const m = document.createElement('meta');
    if (name) m.name = name; else m.setAttribute('property', property);
    m.content = content;
    document.head.appendChild(m);
  });

  const link = document.createElement('link');
  link.rel = 'canonical'; link.href = canonical;
  document.head.appendChild(link);

  const jsonLd = document.createElement('script');
  jsonLd.type = 'application/ld+json';
  jsonLd.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    headline: shareName,
    abstract: LAB.provocation,
    image: ogImage,
    url: canonical,
    author: { '@type': 'Person', name: LAB.author || 'Christian Solorzano' },
    publisher: { '@type': 'Organization', name: 'OP/AL' },
    isPartOf: { '@type': 'CreativeWorkSeries', name: 'Lab — Original Practice', url: base + '/workshops/bgsu/lab/' },
    ...(LAB.published ? { datePublished: LAB.published } : {}),
    ...(LAB.updated   ? { dateModified:  LAB.updated   } : {}),
    ...(LAB.references && LAB.references.length ? { citation: LAB.references.map(r => r.replace(/<[^>]+>/g, '')) } : {}),
  });
  document.head.appendChild(jsonLd);

  /* ── Nav ── */
  const navScript = document.createElement('script');
  navScript.src = '/workshops/bgsu/shared/nav.js?v=20261011A';
  document.head.appendChild(navScript);

  /* ── Helpers ── */
  const esc  = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const para = v => (Array.isArray(v) ? v : [v]).map(p => `<p>${p}</p>`).join('');
  const list = v => `<ul class="lab-list">${v.map(i => `<li>${i}</li>`).join('')}</ul>`;

  const longDate = iso => {
    if (!iso) return '';
    const d = new Date(iso + (iso.length === 10 ? 'T12:00:00' : ''));
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  /* The opening line of a band. Rick's note was that the giant ghosted heading
     was too big and that the room should hold an inviting sentence instead, so
     this is what goes there: one line, conversational, saying what the section
     is for before the writing starts.

     A study can set its own with `positionLead`, `researchLead` and so on. The
     defaults below are the ones that mean the same thing on every study —
     Thinking always means the same thing — and a band with neither simply
     starts clean. */
  const LEADS = {
    position:  'This is where we test our <em>thinking</em>.',
    themes:    'The <em>themes</em> we explore.',
    output:    'Research transformed into <em>applications</em>.',
    takeaways: 'Our <em>findings</em>.',
    showcase:  'What we make <em>in situ</em>.'
  };
  const lead = (key, opts) => {
    const own = opts.lead !== undefined ? opts.lead : LAB[key + 'Lead'];
    const t = own !== undefined ? own : LEADS[key];
    return t ? `<p class="lab-lead">${t}</p>` : '';
  };

  const band = (key, label, body, opts = {}) => {
    if (!body) return null;
    const L = place(key);
    const s = document.createElement('section');
    s.className = 'lab-band lab-band--' + key + (opts.className ? ' ' + opts.className : '') +
      (L.labelAbove ? ' lab-band--stacked' : '');
    s.setAttribute('data-no-reveal', '');
    s.id = 'band-' + key;
    s.setAttribute('data-band', label);
    s.innerHTML = L.labelAbove
      ? `
      <div class="container">
        <div class="grid">
          <div class="lab-band__col" style="grid-column:${L.start} / span ${L.span}">
            <span class="label">${label}</span>
            <div class="lab-band__body${L.size ? ' lab-band__body--wide' : ''}"${L.size ? ` style="--band-size:${L.size}"` : ''}>${lead(key, opts)}${body}</div>
          </div>
        </div>
      </div>`
      : `
      <div class="container">
        <div class="grid">
          <div class="lab-band__label" style="grid-column:${L.labelStart} / span ${L.labelSpan}">
            <span class="label">${label}</span>
          </div>
          <div class="lab-band__body${L.size ? ' lab-band__body--wide' : ''}" style="grid-column:${L.start} / span ${L.span}${L.size ? `;--band-size:${L.size}` : ''}">${lead(key, opts)}${body}</div>
        </div>
      </div>`;
    // a band can carry a second row under its body — reference plates set on
    // their own columns rather than squeezed into the text measure
    if (opts.after) {
      const row = document.createElement('div');
      row.className = 'grid lab-band__after';
      row.innerHTML = opts.after;
      s.querySelector('.container').appendChild(row);
    }
    /* Or beside it. The text runs to seven columns and the right of the page
       is empty; plates that the argument is looking at belong in that field,
       level with the words that discuss them, not in a row underneath where
       you have to remember what was said. They go into the body's own grid so
       they sit on the same columns as everything else. */
    if (opts.aside) {
      const col = document.createElement('div');
      col.className = 'lab-band__aside';
      col.style.gridColumn = (opts.asideStart || 10) + ' / span ' + (opts.asideSpan || 3);
      col.innerHTML = opts.aside;
      s.querySelector('.grid').appendChild(col);
    }
    document.body.appendChild(s);
    return s;
  };

  /* Reference plates: pictures a section argues from, each with its source
     underneath. They take the image's own proportions, like every other plate
     on the site. */
  /* `bare` for the margin: a figure's own span is written for the page's twelve
     columns, and inside the aside's own two-column grid a span of four forces
     one plate to a row. In the margin the grid decides. */
  const refFigures = (figs, key, bare) => {
    const L = LAYOUT[key] || {};
    const each = L.each || Math.max(1, Math.floor(12 / figs.length));
    return figs.map((f, i) => `
      <figure class="lab-ref"${bare ? '' : ` style="grid-column:span ${f.span || each}"`}>
        <span class="lab-ref__plate">${f.src
          ? `<img data-src="${f.src}" alt="${esc(f.alt || '')}" loading="lazy">`
          : `<span class="lab-fig__pending">${esc(f.pending || 'Plate pending')}</span>`}</span>
        ${f.caption ? `<figcaption>${f.caption}</figcaption>` : ''}
      </figure>`).join('');
  };

  /* Figures: plates of uneven width, captions underneath. A figure declares its
     own span (3 or 4 columns, typically) and the row it starts in. */
  const figures = (figs, offset = 0) => {
    const plates = figs.map((f, i) => {
      const st = `grid-column:${f.start ? f.start + ' / span ' + (f.span || 4) : 'span ' + (f.span || 4)}`;
      let inner;
      if (f.video) {
        // A moving figure runs muted so it can autoplay; the reader turns the
        // sound on. Only one plays aloud at a time — starting one silences the
        // others, because four instruments at once is noise, not a showcase.
        inner =
          `<video data-src="${f.video}" muted loop playsinline preload="none"${
            f.poster ? ` poster="${f.poster}"` : ''}></video>` +
          `<button class="lab-fig__sound" type="button" aria-pressed="false"` +
          ` aria-label="Turn the sound on"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h3.5L13 19V5L7.5 9H4z" fill="currentColor" stroke="none"/><path class="spk-wave" d="M16.5 9.2a4 4 0 0 1 0 5.6"/><path class="spk-wave" d="M19 6.7a7.5 7.5 0 0 1 0 10.6"/><line class="spk-slash" x1="3.5" y1="3.5" x2="20.5" y2="20.5"/></svg></button>`;
      } else if (f.html) {
        inner = f.html;
      } else {
        inner = `<img data-src="${f.src}" alt="${esc(f.alt || '')}" loading="lazy">`;
      }
      return `
        <figure class="lab-fig${f.video ? ' lab-fig--video' : ''}" style="${st}">
          <div class="lab-fig__plate"${f.ratio ? ` style="aspect-ratio:${f.ratio}"` : ''}>${inner}</div>
          ${f.caption
            ? `<figcaption><span class="lab-fig__n">Fig. ${offset + i + 1}</span>${f.caption}${
                f.credit ? ` <span class="text-mid">${f.credit}</span>` : ''}</figcaption>`
            /* A credit with no caption is a plain line of exposure under the
               picture — no figure number, because nothing refers to it. */
            : (f.credit ? `<figcaption><span class="text-mid">${f.credit}</span></figcaption>` : '')}
        </figure>`;
    }).join('');
    return `<div class="lab-figs">${plates}</div>`;
  };

  /* Showcase: a carousel across the full twelve columns, one screen tall.
     Each slide carries its own caption and a way through to the project it
     came from. It scrolls, snaps, and answers the arrow keys and the buttons. */
  const carousel = (figs) => {
    const LINK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.2 1.2"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.2-1.2"/></svg>';
    const slides = figs.map((f) => {
      let media;
      if (f.video) {
        // `sound: true` in the content file puts a switch on the figure. A clip
        // with no audio track should not offer one — there is nothing to turn on.
        // the switch is measured from the picture, so it is wrapped with it —
        // the plate spans the columns and the artwork rarely fills them
        media = `<span class="lab-fig__media"><video data-src="${f.video}" muted loop playsinline preload="none"${
          f.poster ? ` poster="${f.poster}"` : ''}></video>` +
          (f.sound ? `<button class="lab-fig__sound" type="button" aria-pressed="false" aria-label="Turn the sound on"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h3.5L13 19V5L7.5 9H4z" fill="currentColor" stroke="none"/><path class="spk-wave" d="M16.5 9.2a4 4 0 0 1 0 5.6"/><path class="spk-wave" d="M19 6.7a7.5 7.5 0 0 1 0 10.6"/><line class="spk-slash" x1="3.5" y1="3.5" x2="20.5" y2="20.5"/></svg></button>` : '') +
          `</span>`;
      } else if (f.html) { media = f.html; }
      else { media = `<img data-src="${f.src}" alt="${esc(f.alt || '')}" loading="lazy">`; }

      // One sentence under the picture, and the way through to the project set
      // at the end of it. No toggle: a caption held behind a button is a caption
      // nobody reads.
      const cap = (f.caption || f.href)
        ? `<p class="lab-slide__cap">${f.caption || ''}${
            f.credit ? ` ${f.credit}` : ''}${
            f.href ? ` <a class="lab-slide__go" href="${f.href}" aria-label="${
              esc(f.linkText || 'Open the project')}" title="${
              esc(f.linkText || 'Open the project')}">${LINK}</a>` : ''}</p>`
        : '';

      return `
        <figure class="lab-slide${f.video ? ' lab-fig--video' : ''}">
          <div class="lab-slide__plate">${media}</div>
          ${cap}
        </figure>`;
    }).join('');
    return `
      <div class="lab-carousel">
        <div class="lab-carousel__track">${slides}</div>
        ${carNav(figs.length)}
      </div>`;
  };

  /* the arrows, either side of the count, on a line of their own */
  function carNav(n) {
    const ARROW = d => '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" ' +
      'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true">' + (d < 0
        ? '<path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/>'
        : '<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>') + '</svg>';
    return `
      <div class="lab-carousel__nav">
        <button class="lab-carousel__btn" type="button" data-car="prev" aria-label="Previous">${ARROW(-1)}</button>
        <span class="lab-carousel__count"><b>1</b> / ${n}</span>
        <button class="lab-carousel__btn" type="button" data-car="next" aria-label="Next">${ARROW(1)}</button>
      </div>`;
  }

  const wireCarousel = () => {
    document.querySelectorAll('.lab-carousel').forEach(wireOne);
  };

  const wireOne = (car) => {
    const track = car.querySelector('.lab-carousel__track');
    const slides = [...track.children];
    const count = car.querySelector('.lab-carousel__count b');
    const at = () => {
      let best = 0, d = Infinity;
      slides.forEach((s, i) => {
        const gap = Math.abs(s.getBoundingClientRect().left - track.getBoundingClientRect().left);
        if (gap < d) { d = gap; best = i; }
      });
      return best;
    };
    const go = i => {
      const n = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({ left: slides[n].offsetLeft - track.offsetLeft, behavior: 'smooth' });
    };
    car.querySelector('[data-car="prev"]').addEventListener('click', () => go(at() - 1));
    car.querySelector('[data-car="next"]').addEventListener('click', () => go(at() + 1));
    let tick = false;
    track.addEventListener('scroll', () => {
      if (tick) return; tick = true;
      requestAnimationFrame(() => { tick = false; count.textContent = at() + 1; });
    }, { passive: true });
    car.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); go(at() - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(at() + 1); }
    });
    car.tabIndex = 0;

  };

  /* One sound at a time across the whole study. */
  /* ── A film is not fetched until it is nearly on screen ──
     Three autoplaying videos on Sound pulled two megabytes before the page had
     drawn a line of type. They carry their address in data-src and are given it
     when they come within a screen of the viewport; they play there and pause
     when they leave, so a page that is never scrolled that far costs nothing. */
  const wireVideo = () => {
    const vids = [...document.querySelectorAll('video[data-src]')];
    if (!vids.length) return;
    const load = v => { if (!v.src) { v.src = v.dataset.src; } };
    if (!window.IntersectionObserver) { vids.forEach(v => { load(v); v.play().catch(() => {}); }); return; }
    const io = new IntersectionObserver(es => es.forEach(e => {
      const v = e.target;
      if (e.isIntersecting) { load(v); v.play().catch(() => {}); }
      else if (!v.paused) { v.pause(); }
    }), { rootMargin: '600px 0px' });
    vids.forEach(v => io.observe(v));
  };

  const wireSound = () => {
    const btns = document.querySelectorAll('.lab-fig__sound');
    if (!btns.length) return;
    btns.forEach(btn => btn.addEventListener('click', () => {
      const vid = btn.previousElementSibling;
      const turningOn = vid.muted;
      document.querySelectorAll('.lab-fig--video video').forEach(v => {
        v.muted = true;
        const b = v.nextElementSibling;
        if (b) { b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', 'Turn the sound on'); }
      });
      if (turningOn) {
        vid.muted = false;
        vid.currentTime = 0;
        vid.play().catch(() => {});
        btn.setAttribute('aria-pressed', 'true');
        btn.setAttribute('aria-label', 'Turn the sound off');
      }
    }));
    // a figure scrolled well out of view gives its sound back
    if (window.IntersectionObserver) {
      const io = new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting && !e.target.muted) {
          e.target.muted = true;
          const b = e.target.nextElementSibling;
          if (b) b.setAttribute('aria-pressed', 'false');
        }
      }), { threshold: 0.15 });
      document.querySelectorAll('.lab-fig--video video').forEach(v => io.observe(v));
    }
  };

  /* ── Pictures on the grid ─────────────────────────────────────────────────
     A picture fills its cell, so its edges sit on column lines. Whether it
     also fits on the screen is then decided by how many columns it is given:
     the span it was authored with is tried first, and stepped down a column at
     a time until the height clears the viewport. Nothing is ever shrunk inside
     its cell, so nothing ever ends up a few pixels off the grid. */
  const fitFiguresToGrid = () => {
    const band = document.querySelector('.lab-band--onblack');
    if (!band) return;
    band.querySelectorAll('.lab-figs').forEach(grid => fitOneGrid(grid));
  };
  const fitOneGrid = (grid) => {
    const band = grid.closest('.lab-band--onblack');
    const W = grid.clientWidth;
    if (!W) return;
    const gap = parseFloat(getComputedStyle(grid).columnGap) || 0;
    const col = (W - 11 * gap) / 12;
    const head = parseFloat(getComputedStyle(document.documentElement)
      .getPropertyValue('--header-h')) || 92;
    const bar = document.querySelector('.study-index');
    const avail = innerHeight - head - (bar ? bar.offsetHeight : 0) - 28;
    grid.querySelectorAll('.lab-fig').forEach(fig => {
      const img = fig.querySelector('img, video');
      const w = img && (img.naturalWidth || img.videoWidth);
      const h = img && (img.naturalHeight || img.videoHeight);
      if (!w || !h) {
        if (img && !img._gridWait) {
          img._gridWait = 1;
          img.addEventListener('load', fitFiguresToGrid, { once: true });
          img.addEventListener('loadedmetadata', fitFiguresToGrid, { once: true });
        }
        return;
      }
      const want = +(fig.dataset.span || (fig.style.gridColumn.match(/span (\d+)/) || [,12])[1]) || 12;
      fig.dataset.span = want;
      /* Only spans the grid means anything by — twelve, eight, six, four. A
         picture stepped down one column at a time lands on eleven, which reads
         as a measure that missed rather than as a decision. And a little over
         the screen is allowed: a hand's breadth of scroll is not the same as
         having to read a photograph in two halves. */
      const fit = (n) => (n * col + (n - 1) * gap) * h / w;
      let n = want;
      for (const c of [want, 8, 6, 4]) {
        if (c > want) continue;
        n = c;
        if (fit(c) <= avail * 1.18) break;
      }
      fig.style.gridColumn = 'span ' + n;
    });
  };
  window.addEventListener('resize', fitFiguresToGrid);
  window.addEventListener('load', fitFiguresToGrid);
  // the bands are built further down this file; the first pass runs after them
  setTimeout(fitFiguresToGrid, 0);
  setTimeout(fitFiguresToGrid, 600);

  /* ── Hero ── */
  const hero = document.createElement('section');
  hero.id = 'hero';
  hero.className = 'lab-hero-band';
  /* A study can set a picture behind its header with `headerImage` in its
     content file. Without one it uses the study's own thumbnail — the same
     picture that stands for it on the Lab index — so the index and the header
     are one image, and the thumbnails folder is the single place to change it. */
  const heroImg = LAB.headerImage ||
    (slug ? '/workshops/bgsu/thumbnails/web/' + slug + '.webp' : '') ||
    (LAB.showcaseFigures && LAB.showcaseFigures[0] && (LAB.showcaseFigures[0].poster || LAB.showcaseFigures[0].src)) ||
    (LAB.tools && LAB.tools[0] && LAB.tools[0].thumb) || '';
  if (heroImg) {
    hero.classList.add('has-image');
    hero.style.setProperty('--hero-img', `url("${heroImg}")`);
  }
  /* The hero reads down: which side of the practice, which department, what
     the study is called, and then the question it opens with. The right of the
     row carries the two facts about how it is made and whether it is finished.

     The study's full name is taken from its own address — a department is
     called Technology and lives at typography-new-0 — so no content file has
     to repeat it. A NAME section in the .txt, or `fullTitle` in the .js,
     overrides that where the project is called something the URL does not say.

     The hero is white, so the type simply sits on the page. */
  const MINOR = ['as', 'the', 'of', 'and', 'a', 'an', 'in', 'for', 'to', 'on'];
  const fullTitle = LAB.fullTitle || (slug ? slug.split('-')
    .map((w, i) => (i > 0 && MINOR.indexOf(w) >= 0) ? w : w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ') : '');
  /* The span itself: 2026–present. `Ongoing since 2026` said the same thing in
     a sentence where the field already means "when". A status is a value. */
  const since = (LAB.active || LAB.year || '').match(/\d{4}/);
  const status = LAB.status || (since
    ? (LAB.ongoing === false ? since[0] : `${since[0]}–Present`)
    : (LAB.ongoing === false ? 'Complete' : 'Ongoing'));

  /* Research and the department name sit on one line as two tags; the study's
     own name is the only thing set at the title size; the question and the
     provocation are one paragraph, because they are one thought. */
  const intro = [LAB.question, LAB.provocation].filter(Boolean).join(' ');
  hero.innerHTML = `
    <div class="container">
      <div class="grid">
        <p class="lab-hero-band__path" style="grid-column:1 / span 8"><mark class="hl">Research \u2009/\u2009 ${esc(LAB.title)}</mark></p>
      </div>
      <div class="grid">
        <h1 class="lab-hero-band__name" style="grid-column:1 / span 8"><mark class="hl">${esc(fullTitle || LAB.title)}</mark></h1>
      </div>
      <div class="grid">
        <div style="grid-column:1 / span 8">
          <p class="lab-hero-band__prov"><mark class="hl">${intro}</mark></p>
          ${LAB.lede ? `<p class="lab-hero-band__lede"><mark class="hl">${LAB.lede}</mark></p>` : ''}
        </div>
      </div>

    </div>
  `;
  document.body.appendChild(hero);

  /* The facts about a study, set the way a project's credits are: a rule the
     width of the page and the facts in columns across it. They used to sit
     inside the hero, which is one column of left-aligned text by house rule —
     a block out at the right of an otherwise empty screen reads as a caption
     to something that is not there. Out here it is the same object the
     artifact pages carry, in the same place, read the same way. */
  const studyMeta = document.createElement('section');
  studyMeta.id = 'study-meta';
  studyMeta.innerHTML = `
    <div class="container">
      <div class="grid lab-hero-band__meta">
        <div class="col-3">
          <span class="label">Medium</span>
          <p>${LAB.medium || '\u2014'}</p>
        </div>
        <div class="col-3">
          <span class="label">${LAB.updated ? 'Last updated' : 'Status'}</span>
          <p>${
            /* a study that says when it was last read back is more use than
               one that says it is ongoing; the live dot stays, because it is */
            LAB.updated
              ? `<span class="lab-live"><i class="lab-live__dot" aria-hidden="true"></i>${esc(LAB.updated)}</span>`
              : LAB.ongoing === false ? esc(status)
              : `<span class="lab-live"><i class="lab-live__dot" aria-hidden="true"></i>${esc(status)}</span>`
          }</p>
        </div>
        <div class="col-3">
          <span class="label">Researcher</span>
          <p>${esc(LAB.researchBy || 'Christian Solorzano')}<br><span class="text-mid">${
            esc(LAB.researchFor || 'OP/AL')}</span></p>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(studyMeta);

  /* ── The framework, in order ───────────────────────────────────────────────
     Looking · Thinking · Making · Living · Owing.

     Gerunds, because this is a practice and not a paper: every name is the
     same part of speech in the same tense, and together they read as a
     sequence a person actually goes through. You look, then you think about
     what you saw, then you make something with it, then the thing goes out and
     lives, and then you say who you owe.

     The research leads. What was found comes before the argument made about
     it — a reader arrives at the work rather than at a claim they have no
     reason to accept yet.

     The band ids are unchanged. A rename of the words is not a change of
     address, and every citation superscript and every section-bar anchor is
     built from the id. */

  /* Research: what was found, written after, on the soft grey ground. A
     department may set `researchFigures` — counted things, laid out on the
     grid under the prose. Every figure carries where it was counted from,
     because a number without a source is a decoration. */
  const dataGrid = (rows) => {
    const cells = rows.map(r => `
      <div class="lab-data__cell" style="grid-column:span ${r.span || 3}">
        <b class="lab-data__n">${esc(r.n)}</b>
        <span class="lab-data__l">${r.label}</span>
        ${r.note ? `<span class="lab-data__note">${r.note}</span>` : ''}
      </div>`).join('');
    return `<div class="lab-data">${cells}</div>`;
  };
  if (LAB.research) {
    /* The plates a Looking section is looking at belong beside it, in the empty
       right of the page, level with the words that name them — the same margin
       the Thinking band uses for the same job. A study that has no Thinking
       band still has things it is reading from. */
    band('research', 'Looking', para(LAB.research),
      { aside: LAB.researchRefs && LAB.researchRefs.length
          ? refFigures(LAB.researchRefs, 'researchRefs', true) : '',
        asideStart: 9, asideSpan: 4,
        after: LAB.researchFigures && LAB.researchFigures.length ? dataGrid(LAB.researchFigures) : '' });
  }

  /* Thesis: the argument the department is making, set before the work.
     A study that has folded its Looking section into this one still has the
     counted figures to show, and they belong under the argument they support —
     so when there is no Looking band, the data grid comes here instead of
     disappearing with the section it used to sit in. */
  if (LAB.position) {
    const ownFigures = !LAB.research && LAB.researchFigures && LAB.researchFigures.length;
    /* Named per study where the study has earned a better word for it.
       Community's Thinking section is the account of how the club started,
       and calling that Thinking said less than Origin does. The id does not
       move: every section-bar anchor and citation superscript is built from
       it, and a rename of the words is not a change of address. */
    band('position', LAB.positionLabel || 'Thinking',
      para(LAB.position) + (LAB.positionNote ? `<p class="lab-note">${LAB.positionNote}</p>` : ''),
      { aside: LAB.positionFigures && LAB.positionFigures.length
          ? refFigures(LAB.positionFigures, 'positionFigures', true) : '',
        asideStart: 9, asideSpan: 4,       // four columns, two plates abreast
        after: ownFigures ? dataGrid(LAB.researchFigures) : '' });
  }

  /* ── A line of dates, and what happened in each ──
     This was a horizontal scroller: a continuous rule with a filled circle on
     it every 22em. On a page that also holds sliders it read as a slider —
     track and thumb — which is the one thing a date must not look like.

     So the rule is broken rather than ridden. A hairline runs the measure and
     stops either side of each date; the date sits in the gap, set in type, and
     is the thing you click. Nothing rides the line, so nothing invites a drag.
     The account for the chosen year sits below in the text measure.

     Every account is laid into the same grid cell and the ones not chosen are
     hidden rather than removed, so the block is always as tall as its longest
     year and the page does not jump under the reader when they change year. */
  const barBand = (key, label, rows, note) => {
    const id = key + '-tl';
    const dates = rows.map((r, i) => `
      <li class="lab-tl__s">
        <button class="lab-tl__y" type="button" role="tab" id="${id}-t${i}"
          aria-controls="${id}-p${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}"
          >${esc(r.year || r.name || '')}</button>
      </li>`).join('');
    const panels = rows.map((r, i) => `
      <div class="lab-tl__p" role="tabpanel" id="${id}-p${i}" aria-labelledby="${id}-t${i}"
        ${i === 0 ? '' : 'hidden'}>
        ${r.n !== undefined ? `<p class="lab-tl__c"><span class="lab-tl__cn">${esc(String(r.n))}</span> gatherings</p>` : ''}
        <p class="lab-tl__m">${r.note || ''}</p>
      </div>`).join('');
    band(key, label,
      `<div class="lab-tl" data-tl>
         <ol class="lab-tl__axis" role="tablist" aria-label="${esc(label)} by year">${dates}</ol>
         <div class="lab-tl__panels">${panels}</div>
       </div>` +
      (note ? `<p class="lab-note">${note}</p>` : ''), { full: true });
  };

  /* Clicking a date shows its year. Arrow keys walk the line, Home and End go
     to its ends — a tablist behaves the way a reader expects a row of tabs to,
     and this is a row of tabs wearing dates. */
  const wireTimeline = () => {
    document.querySelectorAll('[data-tl]').forEach(tl => {
      const tabs = [...tl.querySelectorAll('.lab-tl__y')];
      const panels = [...tl.querySelectorAll('.lab-tl__p')];
      if (!tabs.length) return;
      const show = (i, focus) => {
        tabs.forEach((t, n) => {
          t.setAttribute('aria-selected', n === i);
          t.tabIndex = n === i ? 0 : -1;
        });
        panels.forEach((p, n) => { p.hidden = n !== i; });
        if (focus) tabs[i].focus();
      };
      tabs.forEach((t, i) => {
        t.addEventListener('click', () => show(i));
        t.addEventListener('keydown', e => {
          const k = e.key;
          let n = null;
          if (k === 'ArrowRight' || k === 'ArrowDown') n = (i + 1) % tabs.length;
          if (k === 'ArrowLeft' || k === 'ArrowUp') n = (i - 1 + tabs.length) % tabs.length;
          if (k === 'Home') n = 0;
          if (k === 'End') n = tabs.length - 1;
          if (n === null) return;
          e.preventDefault();
          show(n, true);
        });
      });
    });
  };

  if (LAB.timeline && LAB.timeline.length) {
    barBand('timeline', LAB.timelineLabel || 'Record', LAB.timeline, LAB.timelineNote);
  }

  /* What the work keeps being about: a list, set in two columns. */
  /* Themes as a field rather than a ranked list of numbers. The count sets the
     length of each bar and is never printed: the question a reader has here is
     "what does this community talk about, and how much", and a row of digits
     answers it worse than a row of lengths. A theme with no count keeps its
     name and draws no bar. */
  /* ── A chart, not a list ──
     Two datasets on one time axis: what the conversation has been about, and
     what the club has actually been doing. Each line is a rolling four-quarter
     share, so a point is a year's worth of evidence rather than one quarter's
     noise, and the line reads as a trend instead of a sawtooth.

     Drawn as plain SVG with the geometry computed here, so the picture is in
     the prerendered page rather than waiting on script. */
  const CHARTS = [];

  const chartCSS = () => {
    if (document.getElementById('ch-css')) return;
    const el = document.createElement('style');
    el.id = 'ch-css';
    el.textContent =
      '.ch{width:100%}' +
      /* doubled up to clear `.ini-lede`, which carries the same weight and is
         injected later. The measure is set to hold this standfirst on a single
         line rather than break it after "informed by". */
      '.ini-lede.ch-lede,.ch-lede{max-width:30em;margin-bottom:var(--space-7,3rem)}' +
      '.ch svg{width:100%;height:auto;display:block;overflow:visible}' +
      '.ch-panel{display:none}' +
      '.ch-panel.is-on{display:block}' +
      '.ch-tabs{display:flex;gap:0;margin:0 0 var(--space-6,2rem)}' +
      '.ch-tabs button{background:none;border:0;padding:0 0 .7em;margin-right:2em;' +
        'cursor:pointer;font-family:var(--font-label,inherit);font-size:.82rem;' +
        'color:rgba(0,0,0,.4);position:relative}' +
      '.ch-tabs button.is-on{color:#16150f}' +
      '.ch-tabs button.is-on::after{content:"";position:absolute;left:0;right:0;' +
        'bottom:0;height:1px;background:currentColor}' +

      /* the field: one hairline per step, a firmer one on the baseline */
      /* Solid, not alpha. Every grey on this chart was an rgba or hsla, so a
         rule crossing a tick, or either crossing a line, blended — the same
         fault the series had, in the chrome. These are the identical greys,
         mixed against the ground once here instead of by the compositor on
         every crossing. */
      '.ch-rule{stroke:#ebebeb;stroke-width:1;vector-effect:non-scaling-stroke;' +
        'shape-rendering:crispEdges}' +
      '.ch-rule.is-base{stroke:#cccccc}' +
      /* one mark per quarter along the base. The readings are quarterly and
         the axis only named years, so nothing said how many there were.
         Unlabelled on purpose: each point is a rolling four quarters, and a
         Q2 under a point would invite a quarter's reading off a year's
         worth of data. The tick lets them be counted, not named. */
      '.ch-qt{stroke:#dedede;stroke-width:1;' +
        'vector-effect:non-scaling-stroke;shape-rendering:crispEdges}' +
      '.ch-qt.is-year{stroke:#c2c2c2}' +
      '.ch-ax{font-family:var(--font-label,inherit);font-size:11px;' +
        'fill:#9e9e9e;letter-spacing:.04em}' +

      /* every line is quiet until one is asked for */
      /* every line in its own ink; focus dims the others rather than
         greying them, so the colours stay themselves */
      /* `non-scaling-stroke` is what makes these read as drawn rather than
         as rendered: without it the width is in viewBox units and the browser
         multiplies it by however wide the chart happens to be — 1.2px on a
         laptop, under half a pixel on a phone, which is where the fuzz came
         from. With it, the number below is screen pixels at every size. */
      '.ch-stroke{fill:none;stroke:var(--ink,#16150f);stroke-width:1;' +
      /* butt, not round: a round cap puts half a stroke-width of ink past the
         first and last reading, so every line overshot the axis it starts on
         and the left edge read as ragged. */
        'vector-effect:non-scaling-stroke;stroke-linejoin:round;stroke-linecap:butt;' +
        'shape-rendering:geometricPrecision;stroke:var(--ink-base,var(--ink,#16150f));' +
        'transition:stroke .22s ease,stroke-width .22s ease}' +
      /* An SVG fill answers the pointer whether or not it is visible, so the
         region under every curve — most of the plot — was a click target for
         its own line. Clicking what looked like empty ground hit the open
         line's own area and read as the card closing by itself. Only the
         stroke is aimed at now, through a wide transparent one drawn over it. */
      '.ch-area{fill:var(--ink,#16150f);opacity:0;pointer-events:none;' +
        'transition:opacity .22s ease}' +
      '.ch-stroke,.ch-dot,.ch-lead{pointer-events:none}' +
      /* dashed: a join between two readings, not a reading itself */
      '.ch-lead{fill:none;stroke:var(--ink,#16150f);stroke-width:1;stroke-dasharray:2 4;' +
        'vector-effect:non-scaling-stroke;opacity:.4;transition:opacity .22s ease}' +
      '.ch.is-focus .ch-lead{opacity:.08}' +
      '.ch.is-focus .ch-line.is-on .ch-lead{opacity:.6}' +
      '.ch-hit{fill:none;stroke:transparent;stroke-width:14;' +
        'vector-effect:non-scaling-stroke;pointer-events:stroke}' +
      '.ch-dot{fill:var(--ink-base,var(--ink,#16150f));r:2.2;transition:fill .22s ease,r .22s ease}' +
      '.ch-tie{fill:none;stroke:var(--ink-dim,var(--ink,#16150f));stroke-width:.75;' +
        'vector-effect:non-scaling-stroke;shape-rendering:crispEdges;' +
        'transition:opacity .22s ease}' +
      /* the name at the end of a line is the easiest thing to aim at, so it
         takes the pointer too. `bounding-box` rather than the default, or
         only the glyphs themselves would answer and the gaps between
         letters would fall through to the plot behind. */
      '.ch-end{font-family:var(--font-label,inherit);font-size:11.5px;' +
        'fill:var(--ink,#16150f);letter-spacing:.01em;cursor:pointer;' +
        'pointer-events:bounding-box;transition:opacity .22s ease}' +
      '.ch-line{cursor:pointer}' +
      /* the movement and the level, set at the end of the line they belong to */
      '.ch-move,.ch-now{font-variant-numeric:tabular-nums;letter-spacing:.01em}' +
      '.ch-now{fill:#16150f}' +
      '.ch--dark .ch-now{fill:#fff}' +
      '.ch-pct{opacity:.55}' +
      '.ch-move.is-up{fill:#1f7a4d}.ch-move.is-dn{fill:#b23b2e}' +
      '.ch-move.is-flat{fill:rgba(0,0,0,.35)}' +
      '.ch--dark .ch-move.is-up{fill:#7fd6a7}.ch--dark .ch-move.is-dn{fill:#f0795a}' +
      '.ch--dark .ch-move.is-flat{fill:hsla(0,0%,100%,.35)}' +
      /* Dimming the whole group took the names down with the lines, and a
         group's opacity caps its children's — so a label could never be
         read back up. The parts are dimmed separately: the drawing drops
         right back, the names only halfway. */
      '.ch.is-focus .ch-stroke{stroke:var(--ink-dim,#333)}' +
      '.ch.is-focus .ch-dot{fill:var(--ink-dim,#333)}' +
      '.ch.is-focus .ch-tie{stroke:var(--ink-dim,#333)}' +
      '.ch.is-focus .ch-end{opacity:.45}' +
      '.ch.is-focus .ch-line.is-on .ch-stroke{stroke:var(--ink,#16150f)}' +
      '.ch.is-focus .ch-line.is-on .ch-dot{fill:var(--ink,#16150f)}' +
      '.ch.is-focus .ch-line.is-on .ch-tie{stroke:var(--ink,#16150f)}' +
      '.ch.is-focus .ch-line.is-on .ch-end{opacity:1}' +
      '.ch .ch-line.is-on .ch-stroke{stroke-width:2;stroke:var(--ink,#16150f)}' +
      /* the wash under the active line tinted every line it covered, the
         same blending seen from underneath. Full ink and double width
         say "this one" without it. */
      '.ch .ch-line.is-on .ch-area{opacity:0}' +
      '.ch .ch-line.is-on .ch-dot{r:4.5}' +
      '.ch .ch-line.is-on .ch-end{font-weight:700}' +

      /* the ticker under it */
      '.ch-keys{list-style:none;margin:var(--space-7,3rem) 0 0;padding:0;display:grid;' +
        'grid-template-columns:repeat(auto-fill,minmax(170px,1fr));' +
        'gap:0 var(--space-6,2rem)}' +
      '.ch-key > button{display:grid;' +
        'grid-template-columns:9px 1fr auto auto;gap:.62em;' +
        'align-items:baseline;width:100%;background:none;border:0;cursor:pointer;' +
        'padding:.66em 0;text-align:left;font-family:var(--font-label,inherit);' +
        'font-size:.78rem;color:rgba(0,0,0,.5);' +
        'border-bottom:1px solid rgba(0,0,0,.09);transition:color .18s}' +
      '.ch-key__sw{width:9px;height:9px;border-radius:50%;background:var(--ink,#16150f);' +
        'align-self:center;opacity:.9}' +
      '.ch-key > button:hover,.ch-key.is-on > button{color:#16150f}' +
      '.ch-key.is-on > button{border-bottom-color:var(--ink,#16150f)}' +
      '.ch-key.is-on .ch-key__n{font-weight:700}' +
      '.ch-key__v{font-variant-numeric:tabular-nums;color:#16150f;min-width:3.1em;' +
        'text-align:right;white-space:nowrap}' +
      /* the sign sets at the figure's own size and the font's own fit —
         shrinking it and kerning it back was what made the space look
         wrong in the first place. Only the colour steps back. */
      '.ch-key__v i{font-style:normal;opacity:.55}' +
      '.ch-key__d{font-variant-numeric:tabular-nums;font-size:.74rem;' +
        'letter-spacing:.01em;min-width:2.8em;text-align:right}' +
      '.ch-key__d i{font-style:normal;margin-right:.18em}' +
      '.ch-key__d.is-up{color:#1f7a4d}' +
      '.ch-key__d.is-dn{color:#b23b2e}' +
      '.ch-key__d.is-flat{color:rgba(0,0,0,.35)}' +
      /* what one subject is, and the last few things that were it */
      '.ch-panel{position:relative}' +
      /* the plot on its own: what an open card is measured against */
      '.ch-plot{position:relative}' +
      /* the card sits over the plot rather than under it, so the line it
         describes is still on screen while you read about it. Top left,
         because that is the quietest corner of this particular picture —
         every line ends on the right. */
      '.ch-detail{position:absolute;left:4%;top:7%;width:min(400px,46%);z-index:3;' +
        '--cx:1.25rem;--cy:1.15rem;' +
        /* a family can hold ten subjects and each opens into its evidence, so
           the card has to be allowed to run out of room and scroll rather
           than grow past the plot it is sitting on */
        'max-height:86%;overflow-y:auto;overscroll-behavior:contain;' +
      /* the platform scrollbar came through as an opaque white rail sitting
         on the panel's own border. A dark hairline instead, on no track */
        'scrollbar-width:thin;scrollbar-color:hsla(0,0%,100%,.26) transparent;' +
        'background:rgba(0,0,0,.93);border:1px solid var(--ink,#16150f);' +
        'padding:1.15rem 1.25rem 1.3rem;box-shadow:0 18px 50px rgba(0,0,0,.45)}' +
      /* The head pins while the card scrolls under it. This was tried once and
         taken out again: a line of the description showed either side of the
         stuck header and, with the header's bottom rule across it, read as
         struck through. The cause was the panel's own side padding — the
         header stopped at the content edge, so text ran on in the gutters next
         to it, and an opaque ground on the header could not cover ground the
         header did not stand on.

         So it is full-bleed now: pulled out over the panel's padding by --cx
         and given it back as its own, which puts an opaque band across the
         whole width with nothing to either side of it. The card holds up to
         ten subjects and the name it belongs to was scrolling away. */
      /* A sticky child of a scroll container pins to the scrollport's CONTENT
         box, not its border box — so with top:0 the head stopped 1.15rem down,
         the panel's own padding-top, and the description scrolled visibly
         through the band above it. That band is the strike the first attempt
         was blamed for, seen from the other side.
         So the head is pulled out over the padding on all three sides by --cy
         and --cx and given the same amount back as its own, which leaves it in
         exactly the same place at rest and, once stuck, puts its opaque ground
         right up against the panel's border with nothing able to pass. */
      '.ch-detail .ch-card__head{position:sticky;' +
        'top:calc(var(--cy,1.15rem) * -1);z-index:4;' +
        'margin:calc(var(--cy,1.15rem) * -1) calc(var(--cx,1.25rem) * -1) 0;' +
        'padding:calc(var(--cy,1.15rem) + .1em) var(--cx,1.25rem) .6em;' +
        'background:#000}' +
      /* the close rides with the head now, so its offset is measured from the
         head's own padding box, which ends at the panel's inner edge */
      '.ch-detail .ch-card__head .ch-card__x{' +
        'top:calc(var(--cy,1.15rem) - .1rem);right:.28rem}' +
      '.ch:not(.ch--dark) .ch-detail .ch-card__head{background:#fff}' +
      /* inline on a phone the panel does not scroll, so nothing to stick to */
      '@media (max-width:40em){.ch-detail .ch-card__head{position:static;' +
        'margin:0;padding:.1em 0 .6em;background:none}' +
        '.ch-detail .ch-card__head .ch-card__x{top:-.15rem;' +
        'right:calc(var(--cx, .2rem) * -1 + .28rem)}}' +
      '@media (max-width:40em){.ch-detail{max-height:none;overflow:visible}}' +
      '.ch-detail::-webkit-scrollbar{width:6px;height:6px}' +
      '.ch-detail::-webkit-scrollbar-track{background:transparent}' +
      '.ch-detail::-webkit-scrollbar-thumb{background:hsla(0,0%,100%,.26);border:0}' +
      '.ch-detail::-webkit-scrollbar-thumb:hover{background:hsla(0,0%,100%,.42)}' +
      '.ch:not(.ch--dark) .ch-detail{scrollbar-color:rgba(0,0,0,.26) transparent}' +
      '.ch:not(.ch--dark) .ch-detail::-webkit-scrollbar-thumb{background:rgba(0,0,0,.26)}' +
      '.ch:not(.ch--dark) .ch-detail::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.42)}' +
      '.ch:not(.ch--dark) .ch-detail{background:rgba(255,255,255,.96);' +
        'box-shadow:0 18px 50px rgba(0,0,0,.14)}' +
      /* With the card open beneath it, the row's own underline and the
         card's top border land on the same line in the same colour and
         read as one 3px edge against 2px on the other three sides. The
         card's border is the one that belongs to the shape, so the row
         gives its line up while it is open. */
      '@media (max-width:40em){.ch-key.is-on > button{border-bottom-color:transparent}' +
        '.ch-detail{position:static;width:auto;' +
        'margin:0 0 .9em;box-shadow:none;' +
        'border-width:2px;' +
        'background:rgba(0,0,0,.035);padding:1rem 1.05rem 1.05rem;--cx:1.05rem}' +
        '.ch--dark .ch-detail{background:hsla(0,0%,100%,.05)}}' +
      /* The close sits in the card's own top-right corner. Left in the flow
         it inherited a full-width button rule and stretched to 263px, which
         is what read as a broken rule across the header. */
      '.ch-card{position:relative}' +
      '.ch-card__head{display:block;' +
        'border-bottom:1px solid var(--ink,#16150f);padding-bottom:.6em}' +
      '.ch-card__title{display:flex;align-items:baseline;gap:.55em;' +
        'padding-right:2.2rem}' +
      '.ch-card__head h3{margin:0;font-size:1.05rem;color:var(--ink,#16150f)}' +
      /* an annotation on the name, so it is set in the sans and on the scale
         rather than at some size picked to sit next to this one heading */
      '.ch-card__v{font-family:var(--font-label,inherit);font-size:var(--tag,.72rem);' +
        'letter-spacing:.03em;color:var(--ink,#16150f);opacity:.6}' +
      /* The close is anchored to the card, but the border it should sit in the
         corner of belongs to the panel outside it — so the card's own inset,
         the panel's padding, has to be given back or the × stops short of the
         rule by the width of that padding. `--cx` carries it. */
      '.ch-card .ch-card__x{position:absolute;top:-.15rem;' +
        'right:calc(var(--cx, .2rem) * -1 + .28rem);' +
        'width:2rem;min-width:0;max-width:2rem;height:2rem;flex:none;' +
      /* both of these are inherited, and on a phone the card sits inside the
         ticker row, where they come down ranged left in the label sans — the
         glyph ended up against the left wall of its own two-rem box, which is
         why it never reached the corner however far the box was pushed out */
        'text-align:center;font-family:var(--font-label,inherit);' +
        'display:grid;place-items:center;background:none;border:0;cursor:pointer;' +
        'font-size:1.15rem;line-height:1;color:inherit;opacity:.45;padding:0}' +
      '.ch-card .ch-card__x{display:grid;place-items:center}' +
      '.ch-card__x:hover{opacity:1}' +
      '.ch-card__about{margin:.5em 0 0;line-height:1.5;font-size:.88rem;' +
        'font-family:var(--font-label,inherit)}' +
      '.ch-card__about:last-of-type,.ch-card__about{margin-bottom:0}' +
      /* an annotation, so it is set in the sans — the serif above it is the
         part that is meant to be read */
      '.ch-card__since{margin:.38em 0 0;font-family:var(--font-label,inherit);' +
        'font-size:.7rem;letter-spacing:.04em;color:var(--ink,#16150f);opacity:.75}' +
      /* the subjects inside a family: a ranked list that opens one at a time.
         The heading that sat above it went when its figure moved up beside
         the family name; this is the rule that was still styling it. */
      '.ch-subs{list-style:none;margin:0;padding:0}' +
      '.ch-figs + .ch-subs{margin-top:1.2em}' +
      '.ch-subs>li{border-top:1px solid rgba(0,0,0,.1)}' +
      '.ch--dark .ch-subs>li{border-top-color:hsla(0,0%,100%,.14)}' +
      '.ch-subs>li>button{display:grid;grid-template-columns:1fr auto;gap:.8em;' +
        'align-items:baseline;width:100%;padding:.5em 0;background:none;border:0;' +
        'cursor:pointer;text-align:left;font-family:var(--font-label,inherit);' +
        'font-size:.74rem;letter-spacing:.02em;color:inherit;opacity:.72}' +
      '.ch-subs>li>button:hover,.ch-subs>li.is-open>button{opacity:1}' +
      /* a subject the club has no name for yet is marked, not hidden */
        'vertical-align:.25em;color:var(--ink,#16150f);opacity:.9}' +
      '.ch-subs__v{font-variant-numeric:tabular-nums}' +
      '.ch-subs__d{padding:0 0 .9em}' +
      '.ch-subs__a{margin:0;font-size:.84rem;line-height:1.5;' +
        'font-family:var(--font-label,inherit)}' +
      '.ch-subs .ch-card__say{margin-top:.7em;padding-top:.7em}' +
      /* the evidence: the count first, then the words themselves */
      '.ch-card__tally{margin:.2em 0 0;font-family:var(--font-label,inherit);' +
        'font-size:.68rem;letter-spacing:.03em;opacity:.5}' +
      /* the counts as figures: three quantities and a position in time.
         `align-items:end` puts the labels on one line and lets the span's
         rule meet the numerals' baseline. */
      /* three label widths plus a graph have to fit a 358px card: the graph
         column had a 5rem floor, which pushed the row 14px past the edge.
         It takes what is left instead. */
      /* the figure count is not fixed: a subject may carry episodes,
         gatherings, articles and voices, or only some of them, so the
         track count comes from the markup rather than being hard-coded.
         Before --n the row was repeat(3,auto) and a fourth figure pushed
         the span bar into an implicit fifth column, off the card. */
      '.ch-figs{display:grid;grid-template-columns:repeat(var(--n,3),auto) minmax(0,1fr);' +
        'gap:.15em clamp(.5em,2.2vw,1.15em);align-items:end;margin:1.1em 0 0}' +
      '.ch-fig{display:grid;gap:.2em;justify-items:start}' +
      '.ch-fig b{font-weight:400;font-size:1.35rem;line-height:1;' +
        'color:var(--ink,#16150f);font-variant-numeric:lining-nums tabular-nums}' +
      /* the label under a figure is an annotation, so it is the sans */
      /* sentence case, per the standard: capitals set small need .12em to
         sit evenly and the site stopped paying that price. The tracking
         comes down with the case — at sentence case it only has to open
         the word enough to read as a label. */
      '.ch-fig span{font-family:var(--font-label,inherit);font-size:var(--tag,.72rem);' +
        'letter-spacing:.02em;opacity:.5;line-height:1}' +
      '.ch-fig--span{justify-items:end;align-self:end}' +
      /* the track is the whole archive; the bar is the years this one ran */
      '.ch-span{position:relative;height:1.35rem}' +
      '.ch-span::before{content:"";position:absolute;left:0;right:0;bottom:0;' +
        'height:1px;background:currentColor;opacity:.2}' +
      '.ch-span>i{position:absolute;bottom:0;height:2px;min-width:4px;' +
        'background:var(--ink,#16150f);display:block}' +
      /* the subject's own line, drawn on the same axis as the chart above */
      '.ch-spark{display:block;width:100%;height:1.6rem;overflow:visible}' +
      '.ch-spark line,.ch-spark path{vector-effect:non-scaling-stroke}' +
      '.ch-spark__base{stroke:currentColor;stroke-width:1;opacity:.22}' +
      '.ch-spark__l{fill:none;stroke:var(--ink,#16150f);stroke-width:1.5;' +
        'stroke-linecap:round;stroke-linejoin:round}' +
      '.ch-spark__lead{fill:none;stroke:var(--ink,#16150f);stroke-width:1.5;' +
        'stroke-dasharray:2 3;opacity:.45}' +
      '.ch-spark__dot{stroke:var(--ink,#16150f);stroke-width:3.4;' +
        'stroke-linecap:round}' +
      /* the year range is one word; broken at the en dash it sits on two
         lines and its baseline leaves the other three labels behind */
      '.ch-fig--span>span{text-align:right;white-space:nowrap}' +
      /* four columns will not stand up at 390: the span takes its own row */
      /* narrow: the figures wrap into even columns — two abreast when
         there are four of them, so none is left alone on a row */
      '@media (max-width:40em){.ch-figs{grid-template-columns:repeat(var(--nm,3),1fr);' +
        'gap:.9em 1em}.ch-fig--span{grid-column:1/-1}}' +
      '.ch-card__say{list-style:none;margin:1em 0 0;padding:.9em 0 0;display:grid;gap:.5em;' +
        'border-top:1px solid rgba(0,0,0,.12)}' +
      '.ch--dark .ch-card__say{border-top-color:hsla(0,0%,100%,.18)}' +
      '.ch-card__q{display:block;font-size:.84rem;line-height:1.5;' +
        'font-family:var(--font-label,inherit)}' +
      /* source on the left, date against the right edge; the title can run
         to two lines without pushing the date onto a line of its own */
      /* .2em set the credit hard under the last line of the quote, which at
         this size reads as a third line of it rather than as the source */
      '.ch-card__w{display:flex;justify-content:space-between;align-items:baseline;' +
        'gap:.9em;margin-top:.5rem;font-family:var(--font-label,inherit);' +
        'font-size:.66rem;letter-spacing:.03em;opacity:.55}' +
      '.ch-card__d{flex:none;white-space:nowrap}' +
      /* the whole quotation is the target, so it is drawn as one card. The
         frame takes the family's own colour on hover, the same cue the line
         above it uses. */
      '.ch-say{display:block;padding:.72em .8em;color:inherit;text-decoration:none;' +
        'border:1px solid rgba(0,0,0,.14)}' +
      '.ch--dark .ch-say{border-color:hsla(0,0%,100%,.16)}' +
      'a.ch-say{transition:border-color .15s ease,background-color .15s ease}' +
      'a.ch-say:hover,a.ch-say:focus-visible{border-color:var(--ink,#16150f);' +
        'background:rgba(0,0,0,.035)}' +
      '.ch--dark a.ch-say:hover,.ch--dark a.ch-say:focus-visible{' +
        'background:hsla(0,0%,100%,.055)}' +
      'a.ch-say:hover .ch-card__w,a.ch-say:focus-visible .ch-card__w{opacity:.8}' +
      '.ch-card__list{list-style:none;margin:1rem 0 0;padding:0;display:grid;gap:0}' +
      '.ch-card__list a{display:grid;grid-template-columns:1fr auto;gap:.3em 1em;' +
        'align-items:baseline;padding:.52em 0;text-decoration:none;color:inherit;' +
        'border-bottom:1px solid rgba(0,0,0,.1);font-family:var(--font-label,inherit);' +
        'font-size:.74rem;line-height:1.45}' +
      '.ch-card__t{line-height:1.45}' +
      '.ch-card__k{grid-column:1/-1;order:-1;font-size:.68rem;letter-spacing:.04em;' +
        'opacity:.85;line-height:1.5;margin-bottom:.1em}' +
      '.ch-card__k{color:var(--ink,#16150f)}' +
      '.ch-card__d{font-variant-numeric:tabular-nums;opacity:.5}' +
      '.ch-card__list a:hover .ch-card__t{text-decoration:underline}' +
      '.ch--dark .ch-card__list a{border-bottom-color:hsla(0,0%,100%,.16)}' +
      /* the kind sits on its own line now, so it no longer needs hiding on
         a phone — it was competing for a column that no longer exists */
      '@media (max-width:40em){.ch-card__list a{grid-template-columns:1fr auto}}' +
      /* ── The subjects below the chart's floor ────────────────────────────
         None of these is big enough to draw as a line, and that is exactly
         why they are worth setting out: the club has never had a name for
         any of them, and together they are more of the conversation than
         Chicago. A list, not a picture — a drawing would overstate them. */
      '.ch-more{margin:var(--space-7,3rem) 0 0}' +
      '.ch-more__h{font-family:var(--font-label,inherit);font-size:.72rem;' +
        'letter-spacing:.04em;margin:0 0 .35em;color:var(--ink,#16150f)}' +
      '.ch-more__lede{margin:0 0 1.4em;font-size:.88rem;line-height:1.5;' +
        'max-width:34em;color:rgba(0,0,0,.6)}' +
      '.ch--dark .ch-more__lede{color:hsla(0,0%,100%,.6)}' +
      '.ch-more__l{list-style:none;margin:0;padding:0;display:grid;' +
        'grid-template-columns:repeat(auto-fill,minmax(19em,1fr));' +
        'gap:0 var(--space-6,2rem)}' +
      '.ch-more__l li{padding:.7em 0;border-top:1px solid rgba(0,0,0,.09)}' +
      '.ch--dark .ch-more__l li{border-top-color:hsla(0,0%,100%,.14)}' +
      '.ch-more__n{display:grid;grid-template-columns:1fr auto;gap:1em;' +
        'align-items:baseline;font-family:var(--font-label,inherit);' +
        'font-size:.78rem;color:var(--ink,#16150f)}' +
      '.ch-more__v{font-variant-numeric:tabular-nums;opacity:.55}' +
      '.ch-more__a{margin:.3em 0 0;font-size:.8rem;line-height:1.45;' +
        'color:rgba(0,0,0,.55)}' +
      '.ch--dark .ch-more__a{color:hsla(0,0%,100%,.55)}' +

      /* ── How the numbers were arrived at ─────────────────────────────────
         A chart that claims to say what a community talks about has to show
         its working, or it is just an assertion with a line through it. Shut
         by default, because the reading comes first; one press and the whole
         method is there. `details` rather than a scripted panel, so it still
         opens with no JavaScript and a find-in-page reaches inside it. */
      /* 46em was 3.63 alphabets — past the 3.25 the studies allow and well
         past the classical range. It was set when this text was 13px, where
         46em is a shorter line in absolute terms; at the reading size the
         same em measure runs too long. 38em brings it back inside. */
      /* ranked without numerals: the values already rank them, and ten
         numbers would be ten more things to read */
      '.ch-top{margin:var(--space-5,1.5rem) 0 0}' +
      /* two lines at this size with the default leading closed right up;
         the note is the part that wraps, so it is the part that needs air */
      '.ch-top__h{margin:0 0 .9em;font-family:var(--font-label,inherit);' +
        'font-size:var(--tag,.72rem);font-weight:400;letter-spacing:.04em;' +
        'line-height:1.65;color:#16150f}' +
      '.ch-top__note{display:inline-block}' +
      '.ch--dark .ch-top__h{color:#ffffff}' +
      '.ch-top__note{color:#999999}' +
      '.ch--dark .ch-top__note{color:#8c8c8c}' +
      '.ch--dark .ch-top__h{color:#8c8c8c}' +
      '.ch-top__l{list-style:none;margin:0;padding:0;display:grid;' +
        'grid-template-columns:repeat(5,1fr);gap:.55em 1.4em}' +
      '.ch-top__l li{border-top:1px solid #e6e6e6}' +
      '.ch-top__b{display:flex;align-items:baseline;justify-content:space-between;' +
        'gap:.6em;width:100%;padding:.4em 0 .3em;background:none;border:0;' +
        'text-align:left;cursor:pointer;color:inherit;font:inherit}' +
      '.ch-top__b:hover .ch-top__n,.ch-top__b:focus-visible .ch-top__n{' +
        'text-decoration:underline;text-underline-offset:.22em}' +
      '.ch--dark .ch-top__l li{border-top-color:#1a1a1a}' +
      '.ch-top__n{font-family:var(--font-label,inherit);font-size:.8rem}' +
      '.ch-top__v{font-family:var(--font-label,inherit);font-size:.8rem;' +
        'font-variant-numeric:tabular-nums;color:#999999;flex:none}' +
      '.ch--dark .ch-top__v{color:#8c8c8c}' +
      '@media (max-width:60em){.ch-top__l{grid-template-columns:repeat(2,1fr)}' +
        '.ch-top__note{display:block}}' +
      '.ch-method{margin:var(--space-6,2rem) 0 0;max-width:38em;' +
        'border-top:1px solid rgba(0,0,0,.12);padding-top:.9em}' +
      '.ch--dark .ch-method{border-top-color:hsla(0,0%,100%,.16)}' +
      /* Shown rather than disclosed: no summary to sit under, so the body does
         not need the gap that the summary used to hold open. */
      '.ch-method--open>.ch-method__b{margin-top:.6em}' +
      '.ch-method>summary{cursor:pointer;list-style:none;display:flex;' +
        'align-items:baseline;gap:.5em;font-family:var(--font-label,inherit);' +
        'font-size:var(--tag,.72rem);letter-spacing:.04em;color:rgba(0,0,0,.5)}' +
      '.ch-method>summary::-webkit-details-marker{display:none}' +
      '.ch--dark .ch-method>summary{color:hsla(0,0%,100%,.5)}' +
      '.ch-method>summary:hover{color:#16150f}' +
      '.ch--dark .ch-method>summary:hover{color:#fff}' +
      /* the caret is drawn, not typed, so it turns rather than swaps glyph */
      '.ch-method>summary i{font-style:normal;display:inline-block;width:.6em;' +
        'transition:transform .2s ease}' +
      '.ch-method[open]>summary i{transform:rotate(90deg)}' +
      /* The note is four paragraphs about how the numbers were made — it is
         apparatus, but it is still reading, so it takes the reading size and
         the reading face and is set back by ink instead of by size. It was
         .82rem, which is a size the site does not otherwise have. */
      '.ch-method__b{margin:1.1em 0 0;font-size:var(--body,1rem);line-height:1.6;' +
        'color:rgba(0,0,0,.72)}' +
      '.ch--dark .ch-method__b{color:hsla(0,0%,100%,.72)}' +
      '.ch-method__b p{margin:0 0 .85em}' +
      '.ch-method__b p:last-child{margin-bottom:0}' +
      '.ch-method__b b{font-weight:400;color:#16150f}' +
      '.ch--dark .ch-method__b b{color:#fff}' +
      /* The label is set small and the definition at the reading size, so the
         two sit on different baselines unless the row is told to align on one
         — nine pixels apart, which reads as the label floating. */
      '.ch-method__b dl{margin:0 0 1em;display:grid;align-items:baseline;' +
        'grid-template-columns:auto 1fr;gap:.35em 1.1em}' +
      '.ch-method__b dt{font-family:var(--font-label,inherit);font-size:var(--tag,.72rem);' +
        'letter-spacing:.04em;white-space:nowrap;opacity:.6}' +
      '.ch-method__b dd{margin:0}' +
      '@media (max-width:40em){.ch-method__b dl{grid-template-columns:1fr;gap:.1em}' +
        '.ch-method__b dd{margin-bottom:.6em}}' +
      '.ch-unit{margin:var(--space-5,1.5rem) 0 0;font-family:var(--font-label,inherit);' +
        'font-size:.72rem;line-height:1.6;color:#999999;max-width:44em}' +
      /* on black: the rules recede, the type comes up, the colours stay */
      /* the band's own ground rule and --onblack carry the same weight and
         the band's comes later, so the black needs a touch more specificity */
      '.lab-band--themes.lab-band--onblack{background:#000;color:#fff}' +
      '.ch--dark .ch-rule{stroke:#1a1a1a}' +
      '.ch--dark .ch-rule.is-base{stroke:#4c4c4c}' +
      '.ch--dark .ch-qt{stroke:#242424}' +
      '.ch--dark .ch-qt.is-year{stroke:#424242}' +
      '.ch--dark .ch-ax{fill:#737373}' +
      '.ch--dark .ch-key > button{color:#8c8c8c;' +
        'border-bottom-color:hsla(0,0%,100%,.14)}' +
      '.ch--dark .ch-key > button:hover,.ch--dark .ch-key.is-on > button{color:#fff}' +
      '.ch--dark .ch-key__v{color:#fff}' +
      '.ch--dark .ch-key__d.is-up{color:#7fd6a7}' +
      '.ch--dark .ch-key__d.is-dn{color:#f0795a}' +
      '.ch--dark .ch-key__d.is-flat{color:hsla(0,0%,100%,.35)}' +
      '.ch--dark .ch-unit{color:hsla(0,0%,100%,.45)}' +
      '.ch--dark .ch-tabs button{color:hsla(0,0%,100%,.45)}' +
      '.ch--dark .ch-tabs button.is-on{color:#fff}' +
      '.ch-scroll{width:100%}' +
      /* ── Telling a phone there is more chart to the right ────────────────
         A fade over the right edge would do it, but it would do it by hiding
         the newest readings — the ones the chart is mostly about. This is a
         rule under the plot instead: its length is the fraction of the chart
         on screen and it slides as you scroll, so it says both "there is
         more" and "you are here" without covering a single data point. It
         is drawn only when the plot actually overflows. */
      '.ch-rail{display:none;height:2px;margin:.9em 0 0;' +
        'background:rgba(0,0,0,.1);position:relative}' +
      '.ch--dark .ch-rail{background:hsla(0,0%,100%,.16)}' +
      '.ch-rail.is-on{display:block}' +
      '.ch-rail i{position:absolute;top:0;bottom:0;left:0;display:block;' +
        'background:var(--ink,#16150f);transition:opacity .2s ease}' +
      '.ch--dark .ch-rail i{background:#fff}' +
      '.ch-rail b{position:absolute;top:100%;right:0;margin-top:.55em;' +
        'font-family:var(--font-label,inherit);font-size:.66rem;font-weight:400;' +
        'letter-spacing:.04em;white-space:nowrap;opacity:.5;' +
        'transition:opacity .25s ease}' +
      '.ch-rail.is-end b{opacity:0}' +
      '@media (max-width:40em){.ch-keys{grid-template-columns:1fr}' +
        /* the plot keeps its proportions and runs past the screen instead of
           being squeezed into 350px, where six years of weekly data becomes a
           smear. It scrolls sideways; the ticker below carries the reading. */
        /* `width:100%` resolves against the parent's content box, so the
           negative margins moved the box left without lengthening it and it
           stopped forty pixels short of the right edge. `auto` lets it take
           the margins' width back. */
        '.ch-scroll{width:auto;overflow-x:auto;overflow-y:hidden;' +
          '-webkit-overflow-scrolling:touch;' +
          'scrollbar-width:none;margin-inline:calc(var(--pad, 1.25em) * -1);' +
          'padding-inline:var(--pad, 1.25em)}' +
        '.ch-scroll::-webkit-scrollbar{display:none}' +
        /* Drawn one-to-one with its own viewBox: the plot comes out 470px
           tall instead of 404, the right-hand reserve is wide enough for the
           longest name, and every size written into the drawing renders at
           the number it was authored at. */
        '.ch-scroll svg{width:1000px;max-width:none}' +
        /* at 1:1 these are the pixels they say they are */
        '.ch-ax{font-size:12px}' +
        '.ch-end{font-size:12.5px}' +
        '.ch-key > button{padding:.85em 0}}' +
      /* With the reading set beside each line, the list below it is the same
         twelve names twice. It is kept for the phone, where the chart scrolls
         sideways and those labels are off the side of it — and where it is
         also the accordion the detail opens inside. Declared last because the
         rule that gives it `display:grid` is declared above. */
      '@media (min-width:40.0625em){.ch-keys{display:none}}';
    document.head.appendChild(el);
  };

  /* A colour per subject, so a line can be followed across six years without
     being held. Picked as a muted editorial set rather than a bright
     categorical one: fourteen saturated hues on a pale ground is a pie chart,
     and these have to sit under type. */
  /* Every line was drawn at 72% and the dimmed ones at 12%, so wherever two
     crossed the browser blended them and invented a colour that is in neither
     series — and on a chart whose whole job is telling twelve hairlines apart,
     a crossing produced a thirteenth. The strengths are mixed into the ink
     here instead and the stroke is laid down opaque, so a crossing is one line
     over another and the top one wins. */
  const chMix = (hex, amt, ground) => {
    const h = String(hex).replace('#', '');
    const n = parseInt(h.length === 3 ? h.replace(/./g, c => c + c) : h, 16);
    const g = String(ground).replace('#', '');
    const gn = parseInt(g.length === 3 ? g.replace(/./g, c => c + c) : g, 16);
    const ch = (sh) => Math.round((((n >> sh) & 255) * amt) + (((gn >> sh) & 255) * (1 - amt)));
    return '#' + [16, 8, 0].map(sh => ch(sh).toString(16).padStart(2, '0')).join('');
  };

  const CH_INK = ['#b4472f', '#2e6e8e', '#c08d1f', '#6b8e4e', '#8e5572', '#3d7068',
                  '#a8552f', '#4a5d7e', '#9c6b8d', '#7c5ca8', '#8a7b5c', '#4f8a6b',
                  '#b07a3e', '#5e6a6e'];
  /* OP/AL's own accents, on the ground they were made for. The five in the
     stylesheet — pink, yellow, lime, sky, salmon — are the palette; the other
     seven fill the two wide gaps they leave (lime to sky, sky to pink) at the
     same high key, so the whole set reads as one family rather than as five
     brand colours and seven strangers. Every one clears 6:1 on black, and no
     two are closer than 28 in CIELab, which is what it takes to tell twelve
     hairlines apart. Ordered so that neighbours in the ranking are never
     neighbours on the colour wheel. */
  const CH_INK_DARK = ['#ff94c9',  /* pink    — $accent  */
                       '#00ffd4',  /* teal    */
                       '#FFED00',  /* yellow  — $accent2 */
                       '#c45cff',  /* violet  */
                       '#4de82a',  /* green   */
                       '#ff9326',  /* orange  */
                       '#79c7f1',  /* sky     — $blue    */
                       '#ff6ae0',  /* magenta */
                       '#bbff34',  /* lime    — $lime    */
                       '#6b86ff',  /* blue    */
                       '#fcc1b8',  /* salmon  — $red     */
                       '#00c766']; /* emerald */

  /* ── The receipts behind a line ───────────────────────────────────────────
     A subject on this chart is a claim about what a few hundred people spent
     six years talking about, so it carries its evidence: how many gatherings
     produced it, how many separate voices, over what span — and then the
     actual words, attributed and dated, with a link to the source. */
  /* ── What a family is made of ─────────────────────────────────────────────
     A line chart gives out somewhere around twelve series and this archive
     has forty-one, so the lines are families and the subjects live inside
     them. Opening a family is how you get the whole list back: every subject
     keeps its own share, its own count, and its own testimony. */
  const subsOf = (r) => {
    if (!r.subs || !r.subs.length) return '';
    /* The heading that stood here said "share of the whole archive · 21.5%
       together". The figure moved up beside the family name; the sentence
       around it went, and the list starts straight away. */
    return `<ol class="ch-subs">${r.subs.map(s => `<li>
        <button type="button" aria-expanded="false">
          <span class="ch-subs__n">${esc(s.name)}</span>
          <span class="ch-subs__v">${s.share.toFixed(1)}<i class="ch-pct">%</i></span>
        </button>
        <div class="ch-subs__d" hidden>
          ${s.about ? `<p class="ch-subs__a">${esc(s.about)}</p>` : ''}
          ${figsOf(s.tally, s.v)}
          ${sayOf(s.say)}
        </div>
      </li>`).join('')}</ol>`;
  };

  /* ── The counts, drawn ────────────────────────────────────────────────────
     These were a sentence of four facts separated by middots — "78 episodes ·
     57 gatherings · 133 voices · 2022–2026" — which reads as a caption and
     hides that three of them are quantities and the fourth is a position in
     time. Set as figures with their labels under them, the numbers can be
     compared at a glance; the years become a bar laid against the whole
     archive, so a subject that ran from the start reads differently from one
     that only appears in the last two years. That is information the sentence
     had and could not show.

     Written once and used by both the family card and the subject rows, which
     had drifted: the subject rows said "1 episodes". */
  /* The chart line and the mini graph in a subject card are the same
     curve, so they are the same function. It used to live inside the
     chart builder, which is why the card had nothing to draw with. */
  /* The series carry one decimal now, so any arithmetic on them lands on a
     float: 25.3 − 8.5 is 16.800000000000001, and the legend was printing it.
     Every figure that reaches the page goes through this. */
  const n1 = (x) => (Math.round(x * 10) / 10);

  const path = (pts) => {
    const n = pts.length;
    if (n < 2) return '';
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const dx = [], sl = [];
    for (let i = 0; i < n - 1; i++) {
      dx[i] = xs[i + 1] - xs[i];
      sl[i] = (ys[i + 1] - ys[i]) / dx[i];
    }
    const m = new Array(n);
    m[0] = sl[0]; m[n - 1] = sl[n - 2];
    for (let i = 1; i < n - 1; i++) {
      if (sl[i - 1] * sl[i] <= 0) { m[i] = 0; continue; }
      const w1 = 2 * dx[i] + dx[i - 1], w2 = dx[i] + 2 * dx[i - 1];
      m[i] = (w1 + w2) / (w1 / sl[i - 1] + w2 / sl[i]);
    }
    /* the ends have only one slope to answer to, so they are capped rather
       than averaged */
    if (Math.abs(m[0]) > 3 * Math.abs(sl[0])) m[0] = 3 * sl[0];
    if (Math.abs(m[n - 1]) > 3 * Math.abs(sl[n - 2])) m[n - 1] = 3 * sl[n - 2];
    const d = [`M${xs[0].toFixed(1)},${ys[0].toFixed(1)}`];
    for (let i = 0; i < n - 1; i++) {
      const t = dx[i] / 3;
      d.push(`C${(xs[i] + t).toFixed(1)},${(ys[i] + m[i] * t).toFixed(1)} ` +
             `${(xs[i + 1] - t).toFixed(1)},${(ys[i + 1] - m[i + 1] * t).toFixed(1)} ` +
             `${xs[i + 1].toFixed(1)},${ys[i + 1].toFixed(1)}`);
    }
    return d.join(' ');
  };

  const ARCHIVE = [2020, 2026];

  /* The span used to be a filled bar on a track — a shape that said when but
     not what, and looked nothing like the chart above it. A subject carries
     its own quarterly series, the same series the family line is drawn from,
     so the card draws the subject's own curve on the same axis and through
     the same function. Small, but it is the real line: where it starts, where
     it peaks, whether it is still going. */
  const spark = (v) => {
    if (!v || v.length < 2) return '';
    /* No horizontal padding: the curve runs the full width so it begins and
       ends exactly where the baseline does. With padding it sat inset and the
       rule poked out past it at both ends, which is what read as the line
       stopping short of nowhere. `overflow:visible` keeps the half of the
       stroke that falls outside the box. */
    const W = 132, H = 26, PY = 2.5;
    let max = 0;
    v.forEach(y => { if (y != null && y > max) max = y; });
    if (!max) return '';
    const X = i => i / (v.length - 1) * W;
    const Y = y => H - PY - (y / max) * (H - PY * 2);
    const pts = [];
    v.forEach((y, i) => { if (y != null) pts.push([X(i), Y(y)]); });
    if (pts.length < 2) return '';
    const first = v.findIndex(y => y != null);
    const lead = first > 0
      ? `<path class="ch-spark__lead" d="M0,${(H - PY).toFixed(1)}L${
          pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}"/>` : '';
    /* the chart above ends every line on a dot — where the reading is now.
       A zero-length segment with a round cap draws one, and unlike a circle it
       survives preserveAspectRatio="none" without turning into an ellipse. */
    const end = pts[pts.length - 1];
    const dot = `<line class="ch-spark__dot" x1="${end[0].toFixed(1)}" y1="${
      end[1].toFixed(1)}" x2="${end[0].toFixed(1)}" y2="${end[1].toFixed(1)}"/>`;
    return `<svg class="ch-spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">` +
      `<line class="ch-spark__base" x1="0" y1="${H - PY}" x2="${W}" y2="${H - PY}"/>` +
      lead + `<path class="ch-spark__l" d="${path(pts)}"/>${dot}</svg>`;
  };

  /* A piece of testimony is one thing — the words, who said them, when, and
     where to go and read the rest. It was drawn as three, with a hairline under
     the name as the only clue that any of it led anywhere, and a name is a
     small target. The whole block is the link now, framed so it reads as a card
     you can take rather than a paragraph with a word underlined in it.

     The two places that drew this had also drifted apart: one read the name
     from `w`, the other from `k`, which the data does not carry. */
  const sayOf = (say) => {
    if (!say || !say.length) return '';
    return `<ul class="ch-card__say">${say.map(x => {
      const who = esc(x.w || x.k || '');
      /* the credit names the source as well as the speaker — the same line
         used to read identically whether somebody said it on the record, said
         it in a room, or wrote it down — and the date goes to the right edge,
         off the end of a title that may run to two lines */
      const inner = `<span class="ch-card__q">${esc(x.q)}</span>` +
        `<span class="ch-card__w"><span class="ch-card__src">${who}` +
        `${x.k ? ' · ' + esc(x.k) : ''}</span>` +
        `${x.d ? `<span class="ch-card__d">${esc(x.d)}</span>` : ''}</span>`;
      return `<li>${x.u
        ? `<a class="ch-say" href="${esc(x.u)}" target="_blank" rel="noopener">${inner}</a>`
        : `<div class="ch-say">${inner}</div>`}</li>`;
    }).join('')}</ul>`;
  };

  const figsOf = (t, v) => {
    if (!t) return '';
    const figs = [];
    const plural = (n, w) => [n, n === 1 ? w : w + 's'];
    if (t.episodes)   figs.push(plural(t.episodes, 'Episode'));
    if (t.gatherings) figs.push(plural(t.gatherings, 'Gathering'));
    /* the articles joined the corpus on 18 October 2026; a subject scored only
       in writing still has to show where it came from */
    if (t.articles)   figs.push(plural(t.articles, 'Article'));
    if (t.voices)     figs.push(plural(t.voices, 'Voice'));

    /* The span cell is gone. It carried the subject's own curve redrawn small,
       with a track behind it and the years under it — the same argument the
       line above the card already makes at a size you can read. The row is the
       counts now and nothing else. `t.span`, `t.first` and `t.last` are still
       written by the pipeline and still in the data if it is ever wanted. */
    const n = figs.length;
    return `<div class="ch-figs" style="--n:${n};--nm:${n === 4 ? 2 : 3}">${
      figs.map(([v2, l]) =>
        `<div class="ch-fig"><b>${v2}</b><span>${l}</span></div>`).join('')}</div>`;
  };

  const tally = (r) => {
    const t = r.tally;
    if (!t) return '';
    return figsOf(t, r.v) +
      sayOf(r.say);
  };

  const chartField = (sets) => {
    if (!sets || !sets.length) return '';
    chartCSS();
    /* the right-hand reserve carries the whole reading now — name, movement
       and level — so it is wide enough to set them as three columns */
    /* R was 215 to hold a name, a movement and a level. The movement is
       gone — see the end labels below — so the reserve gives 45 units
       back to the plot, which is where the compression went when 2020
       came in. */
    const W = 1000, H = 470, R = 170, T = 16, B = 40;
    const LEAD_IN = false;   // the dashed run-up from the origin
    const i0 = CHARTS.length;
    const INK = sets.some(st => st.dark) ? CH_INK_DARK : CH_INK;


    const panel = (set, si) => {
      const rows = set.rows || [], at = set.at || [];
      /* A quarter may carry no reading at all — early on the club had held two
         gatherings, and a share of two is not a share. Those sit out of the
         scale and out of the line, which runs from the origin straight to the
         first quarter that can carry one. */
      const top = Math.max(10, Math.ceil(Math.max.apply(null,
        rows.map(r => Math.max.apply(null, r.v.filter(v => v != null)))) / 10) * 10);
      const step = top > 50 ? 25 : 10;
      /* `top` is rounded up past the data, so the highest tick drawn is often
         below it; the unit has to ride that tick or it never appears */
      const topTick = Math.floor(top / step) * step;
      /* The left gutter is the width of the widest number on the axis, not a
         round forty. At forty, nothing in the drawing touched the margin the
         headline is set to — the numbers floated fourteen pixels inside it and
         the plot began twenty past that, which is what read as sloppy. Sized
         from the type, the widest figure's left edge lands on the margin and
         the narrower ones range right against the axis, as they should.

         Measured from the widest label actually drawn, which is the top tick
         WITH its per-cent sign — not from `top`, which is rounded up past the
         data and carries no sign. Sized off `top` the gutter came out one
         character short and the first digit of "50%" was cut off at x = -7.7,
         outside the viewBox.

         The 4 is slack. 8.4 per character is an estimate, and the same string
         measures 24.7 wide on the desktop and 26.9 on a phone, so an estimate
         sized to fit exactly fits on one of them and clips on the other. Four
         pixels is invisible against a thirty-eight pixel gutter and costs less
         than a cut-off digit. */
      const L = 13 + Math.round(8.4 * (String(topTick).length + 1));
      /* The chart opens on the quarter before the first gathering, where every
         subject is honestly at nothing. That makes v[0] a useless baseline for
         the arrows — every one would read "up from zero" — so the movement is
         measured from the named quarter instead: 2021, the first full year. */
      const base = Math.max(0, at.indexOf(set.since));
      const x = i => L + (W - L - R) * (at.length < 2 ? 0 : i / (at.length - 1));
      const y = v => T + (H - T - B) * (1 - v / top);

      let grid = '';
      for (let v = 0; v <= top; v += step) {
        grid += `<line class="ch-rule${v === 0 ? ' is-base' : ''}" x1="${L}" y1="${y(v).toFixed(1)}" x2="${W - R}" y2="${y(v).toFixed(1)}"/>` +
                /* the top tick carries the unit, the rest are bare — the
                   Economist convention, and it stops the axis reading as a
                   count of things rather than a share of the conversation */
                `<text class="ch-ax" x="${L - 9}" y="${(y(v) + 3.5).toFixed(1)}" text-anchor="end">${
                  v}${v === topTick ? '%' : ''}</text>`;
      }
      /* The two columns in the reserve were headed SINCE 2021 / NOW. The axis
         already runs 2020 to now under them, so the headings restated the one
         thing the chart cannot be misread about, in capitals, above the plot —
         and the first year they named was not even the first year drawn. The
         method note carries the window; the columns carry themselves. Removed,
         and T came down with them to close the gap they left. */
      let years = '';
      at.forEach((lab, i) => {
        const yr = String(lab).slice(0, 4);
        /* a tick for every quarter; the one that opens a year is longer and a
           shade stronger, so the years read as groups of four */
        const isYear = i === 0 || String(at[i - 1]).slice(0, 4) !== yr;
        years += `<line class="ch-qt${isYear ? ' is-year' : ''}" x1="${x(i).toFixed(1)}" y1="${
          (H - B).toFixed(1)}" x2="${x(i).toFixed(1)}" y2="${
          (H - B + (isYear ? 5 : 3)).toFixed(1)}"/>`;
        if (isYear) {
          /* the first year ranges off the axis rather than centring on it —
             centred, half of it hung out past the plot's own left edge and
             sat under the numbers, the one thing on the row not lined up */
          years += `<text class="ch-ax" x="${x(i).toFixed(1)}" y="${H - B + 22}" text-anchor="${
            i === 0 ? 'start' : 'middle'}">${yr}</text>`;
        }
      });

      /* Names at the end of each line collide wherever two lines finish close
         together. Walk them in order and push each one down until it clears
         the one above by a line's height — the label moves, the line does
         not, and a hairline joins the two back up. */
      const LH = 14;
      const ends = rows.map((r, ri) => ({ ri, yv: y(r.v[r.v.length - 1]) }))
        .sort((a, b) => a.yv - b.yv);
      let prev = -Infinity;
      ends.forEach(e => { e.ly = Math.max(e.yv, prev + LH); prev = e.ly; });
      const labelY = {}; ends.forEach(e => { labelY[e.ri] = e.ly; });

      const lines = rows.map((r, ri) => {
        /* ── Measured, and merely connected ──────────────────────────────
           The club opens at a true zero — before 6 May 2020 it had talked
           about nothing — but the quarters between that and the first
           quarter thick enough to carry a share were never measured. Drawn
           as one continuous line, a reader takes readings off a stretch
           that is pure interpolation. So the lead-in is dashed and the
           measured series is solid: the fan out of zero survives, and the
           chart stops claiming to know 2020. */
        const firstReal = r.v.findIndex((v, i) => i > 0 && v != null);
        const measured = r.v.map((v, i) => (v == null || i < firstReal) ? null : [x(i), y(v)])
                            .filter(Boolean);
        const d = path(measured);
        /* Seven dashed lines fanning out of the origin, each at its own angle
           so the dash phases never agreed, and the flat ones lying along the
           zero rule until it read as broken. It was the loudest thing on the
           chart and the only part of it that was not measured. The chart now
           starts where the readings start. LEAD_IN restores it. */
        const lead = (LEAD_IN && firstReal > 1 && r.v[0] != null)
          ? `<path class="ch-lead" d="M${x(0).toFixed(1)},${y(r.v[0]).toFixed(1)} L${
              x(firstReal).toFixed(1)},${y(r.v[firstReal]).toFixed(1)}"/>` : '';
        const last = r.v[r.v.length - 1], first = r.v[base];
        const area = `${d} L${x(r.v.length - 1).toFixed(1)},${y(0).toFixed(1)} L${x(0).toFixed(1)},${y(0).toFixed(1)} Z`;
        const ink = INK[ri % INK.length];
        /* the ground these are laid on, so the mix lands where the eye is */
        const gnd = INK === CH_INK_DARK ? '#000000' : '#ffffff';
        const inkBase = chMix(ink, .72, gnd);
        const inkDim = chMix(ink, .18, gnd);
        return `<g class="ch-line" data-row="${ri}" style="--ink:${ink};--ink-base:${
          inkBase};--ink-dim:${inkDim}">
            <path class="ch-area" d="${area}"/>
            ${lead}
            <path class="ch-stroke" d="${d}"/>
            <path class="ch-hit" d="${d}"/>
            <circle class="ch-dot" cx="${x(r.v.length - 1).toFixed(1)}" cy="${y(last).toFixed(1)}" r="3"/>
            ${Math.abs(labelY[ri] - y(last)) < 1.2 ? ''
              /* A straight line from dot to displaced label crosses its
                 neighbours and the right edge becomes a fan. A stepped leader
                 — out, across, in — never crosses another, because every one
                 of them turns in its own vertical lane. */
              : `<path class="ch-tie" d="M${(x(r.v.length - 1) + 5).toFixed(1)},${y(last).toFixed(1)}
                   H${(x(r.v.length - 1) + 9 + (ri % 3) * 2.5).toFixed(1)}
                   V${labelY[ri].toFixed(1)}
                   H${(x(r.v.length - 1) + 15).toFixed(1)}"/>`}
            ${(() => {
              /* The ticker under the chart repeated all twelve names that are
                 already set at the end of the lines. The reading moves up here
                 instead — the name, then where it stands — and the list below
                 is kept for the phone, where these are off the side of a chart
                 that scrolls.

                 The movement column went with the rest of the restating. It
                 said in numerals what the line says in its shape, and for any
                 family that opened at zero — Community, Self — the movement
                 equalled the level exactly, so the row printed one number
                 twice. The level stays: nobody can read 16.7% off a hairline. */
              const ly = (labelY[ri] + 3.5).toFixed(1);
              return `<text class="ch-end" x="${(x(r.v.length - 1) + 18).toFixed(1)}" y="${ly}">${esc(r.name)}</text>
            <text class="ch-end ch-now" x="${W - 2}" y="${ly}" text-anchor="end">${n1(last)}<tspan class="ch-pct">%</tspan></text>`;
            })()}
            <title>${esc(r.name)} — ${last}% now, ${last - first >= 0 ? '+' : ''}${last - first} since ${esc(String(at[base]))}</title>
          </g>`;
      }).join('');

      const legend = rows.map((r, ri) => {
        const last = n1(r.v[r.v.length - 1]);
        const ink = INK[ri % INK.length];
        /* name and level, the same two the chart's own end labels carry */
        return `<li class="ch-key" data-row="${ri}" style="--ink:${ink}">
            <button type="button">
              <span class="ch-key__sw" aria-hidden="true"></span>
              <span class="ch-key__n">${esc(r.name)}</span>
              <span class="ch-key__v">${last}<i>%</i></span>
            </button>
          </li>`;
      }).join('');

      /* The lines are seven families; a family is a bin, and nobody has ever
         talked about "Practice". The subjects inside them are what was
         actually discussed, so the band under the chart names the ones the
         club is on now — read off the same `subs` the cards draw from, which
         is what keeps it from ever disagreeing with them. */
      const asOf = set.asOf || String(at[at.length - 1]).slice(0, 4);
      /* Where each subject lives, so a press can open the card the chart
         already has rather than a second description of the same subject. */
      const place = {};
      rows.forEach((r, ri) => (r.subs || []).forEach((sb, si) => {
        place[sb.name] = { ri, si, about: sb.about || '' };
      }));
      /* The band reads `recent` — a flat six months — not the line's own
         value, which is a rolling four quarters. A trend and a snapshot are
         different questions and the band is asking the second one. Falls back
         to the line's last reading if a dataset carries no snapshot. */
      const subsNow = (set.recent && set.recent.rows ? set.recent.rows
            .map(x => ({ name: x.n, now: x.v, ...(place[x.n] || {}) }))
            .filter(x => x.ri != null)
          : rows.flatMap((r, ri) => (r.subs || []).map((sb, si) => {
              const vv = (sb.v || []).filter(v => v != null);
              return { name: sb.name, about: sb.about || '', ri, si,
                       now: vv.length ? vv[vv.length - 1] : null };
            })).filter(sb => sb.now != null).sort((a, c) => c.now - a.now)
        ).slice(0, 10);
      /* "What the club is talking about now" was a sentence explaining a
         heading that is already a heading. The note under it names the window
         in months and in actual months, so a reader does not have to count
         back from one date to work out what they are looking at. */
      /* The heading names the window and the note dates it. The item count
         was in here too and told a reader nothing they could use. */
      const WORD = ['', 'one', 'two', 'three', 'four', 'five', 'six',
                    'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
      const head = set.recent
        ? `The last ${WORD[set.recent.months] || set.recent.months} months`
        : 'Trending';
      const win = set.recent && set.recent.span
        ? `Recent data · ${set.recent.span}` : '';
      const topNow = subsNow.length ? `<div class="ch-top">
            <h4 class="ch-top__h">${esc(head)}${win
              ? ` <span class="ch-top__note">${esc(win)}</span>` : ''}</h4>
            <ol class="ch-top__l">${subsNow.map(sb =>
              `<li><button type="button" class="ch-top__b" data-top-row="${sb.ri}" ` +
              `data-top-sub="${sb.si}"${sb.about ? ` title="${esc(sb.about)}"` : ''}>` +
              `<span class="ch-top__n">${esc(sb.name)}</span><span class="ch-top__v">${
                n1(sb.now)}<i class="ch-pct">%</i></span></button></li>`).join('')}</ol>
          </div>` : '';

      return `<div class="ch-panel${si ? '' : ' is-on'}" data-panel="${si}">
          ${'' /* An open card is positioned and sized against its container, so
                  that container has to be the plot and nothing else. While it
                  was the whole panel, everything added under the chart — the
                  legend, then the band of topics — made the panel taller, and
                  86% of a taller box put the foot of an open card below the
                  foot of the chart it belongs to. */}
          <div class="ch-plot">
          <div class="ch-scroll">
            <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(set.label || '')}">
              <g class="ch-grid">${grid}${years}</g>
              <g class="ch-lines">${lines}</g>
            </svg>
          </div>
          <div class="ch-detail" data-detail hidden>${rows.map((r, ri) => `
            <article class="ch-card" data-card="${ri}" style="--ink:${INK[ri % INK.length]}" hidden>
              ${'' /* The share used to sit further down, inside a line that
                      explained itself — "share of the whole archive · 21.5%
                      together". The number is the thing worth reading, so it
                      comes up here and stands next to the name, where it is
                      visible the moment the card opens and stays visible while
                      the list below it scrolls. */}
              ${'' /* when it started comes before what it is: the date is the
                      smaller, quieter line, and a reader wants the frame
                      before the sentence rather than after it.

                      It sits inside the head rather than under it. Below the
                      head's rule it was the first thing to scroll away, which
                      left the name pinned to a card whose opening line had
                      gone — and the rule between them read as a separation of
                      two things that are one. */}
              <div class="ch-card__head">
                <div class="ch-card__title">
                  <h3>${esc(r.name)}</h3>
                  ${r.share ? `<span class="ch-card__v">${r.share.toFixed(1)}<i class="ch-pct">%</i></span>` : ''}
                  <button class="ch-card__x" type="button" aria-label="Close">×</button>
                </div>
                ${r.first ? `<p class="ch-card__since">First talked about ${
                  esc(String(r.first).replace(/^(\d{4})-(Q\d)$/, '$2 $1'))}</p>` : ''}
              </div>
              ${r.about ? `<p class="ch-card__about">${r.about}</p>` : ''}
              ${tally(r)}
              ${subsOf(r)}
              ${'' /* The card says what the subject is and stops there. The four
                      most recent items were a list of links inside a panel that
                      opens and closes — restore by putting the <ol> back here;
                      the data is still on every row as `latest`. */}
            </article>`).join('')}</div>
          </div>
          <div class="ch-rail" data-rail aria-hidden="true"><i></i><b>scroll for 2026 ›</b></div>
          <ol class="ch-keys">${legend}</ol>
          ${topNow}
          ${set.unit ? `<p class="ch-unit">${esc(set.unit)}</p>` : ''}
          ${set.emerging && set.emerging.length ? `<section class="ch-more">
            <h3 class="ch-more__h">${esc(set.emergingLabel || 'Emerging')}</h3>
            ${set.emergingLede ? `<p class="ch-more__lede">${set.emergingLede}</p>` : ''}
            <ol class="ch-more__l">${set.emerging.map(e => `<li>
              <span class="ch-more__n"><span>${esc(e.name)}</span><span class="ch-more__v">${
                e.share.toFixed(2)}<i class="ch-pct">%</i></span></span>
              ${e.about ? `<p class="ch-more__a">${esc(e.about)}</p>` : ''}
            </li>`).join('')}</ol>
          </section>` : ''}
          ${'' /* A method note is normally folded away behind a line you click.
                  Set `methodLabel` to an empty string and it simply shows: there
                  is no label to click, so there is nothing to fold. An absent
                  key still gets the default summary — only an explicit empty
                  one means "no disclosure". */}
          ${set.method ? (set.methodLabel === ''
            ? `<div class="ch-method ch-method--open">
            <div class="ch-method__b">${set.method}</div>
          </div>`
            : `<details class="ch-method">
            <summary><i aria-hidden="true">›</i>${esc(set.methodLabel || 'How these themes were found')}</summary>
            <div class="ch-method__b">${set.method}</div>
          </details>`) : ''}
        </div>`;
    };

    const tabs = sets.length > 1
      ? `<div class="ch-tabs">${sets.map((st, i) =>
          `<button type="button" class="${i ? '' : 'is-on'}" data-tab="${i}">${esc(st.label)}</button>`).join('')}</div>`
      : '';
    CHARTS.push(1);
    return `<div class="ch${sets.some(st => st.dark) ? ' ch--dark' : ''}" data-chart="${i0}">${tabs}${sets.map(panel).join('')}</div>`;
  };

  /* a study may bring a counted field, a chart over time, or both */
  if ((LAB.themes && LAB.themes.length) || (LAB.charts && LAB.charts.length)) {
    /* a chart-only study brings no themes; everything below that reads them
       has to cope with that rather than throw and take the rest of the page
       down with it */
    const THEMES = LAB.themes || [];
    const counts = THEMES.map(t => +t.n || 0);
    const top = Math.max(1, ...counts);
    /* A department can name what it is exploring without counting it. Where no
       theme carries a number the bars go entirely, rather than drawing a row of
       empty rules — a bar at zero says "none of this", which is the opposite of
       what a list of open topics means. */
    const counted = THEMES.some(t => t.n !== undefined);
    /* ── Counted themes are drawn, not listed ─────────────────────────────
       Fourteen rules of different lengths is a table pretending to be a
       picture. A theme's weight is an area here, and the field is laid out on
       the golden angle — the arrangement a sunflower uses — so the discs sit
       evenly at every size without a single random number in it. The thread
       runs through them in rank order, so the shape of the ranking is the
       shape of the drawing. */
    const web = () => {
      const CX = 500, CY = 320, GOLD = 2.39996, PAD = 7;
      const N = THEMES.map((t, i) => {
        const n = +t.n || 0, ang = i * GOLD, rad = 58 * Math.sqrt(i);
        return { t, n, x: CX + Math.cos(ang) * rad, y: CY + Math.sin(ang) * rad,
                 r: 10 + 34 * Math.sqrt(n / top) };
      });
      /* Relaxation, not a simulation: the spiral seeds the field and a few
         passes push any two discs apart until none overlap, with a light pull
         back to the centre so it stays one shape. Deterministic — the same
         fourteen numbers always draw the same picture. */
      for (let pass = 0; pass < 240; pass++) {
        for (let i = 0; i < N.length; i++) for (let j = i + 1; j < N.length; j++) {
          const a = N[i], b = N[j];
          let dx = b.x - a.x, dy = b.y - a.y;
          let d = Math.hypot(dx, dy) || 0.01;
          const want = a.r + b.r + PAD;
          if (d < want) {
            const push = (want - d) / 2 / d;
            dx *= push; dy *= push;
            a.x -= dx; a.y -= dy; b.x += dx; b.y += dy;
          }
        }
        for (const p of N) { p.x += (CX - p.x) * 0.012; p.y += (CY - p.y) * 0.012; }
      }
      /* The web: every disc joined to its two nearest, which draws the field's
         own adjacency instead of a line wandering through the ranking. */
      const seen = new Set(), links = [];
      N.forEach((a, i) => {
        N.map((b, j) => ({ j, d: i === j ? 1e9 : Math.hypot(b.x - a.x, b.y - a.y) }))
         .sort((p, q) => p.d - q.d).slice(0, 2)
         .forEach(({ j }) => { const k = i < j ? i + '-' + j : j + '-' + i;
           if (!seen.has(k)) { seen.add(k); links.push([N[i], N[j]]); } });
      });
      /* Labels go OUTSIDE the whole cluster, not beside their own disc — beside
         the disc they printed on top of whatever was packed next to it. Each
         one is projected out along its own bearing to a common ring, pushed
         apart down the side it lands on, and joined back to its disc by a
         hairline. Nothing overlaps and every name is still attached. */
      const hull = Math.max(...N.map(p => Math.hypot(p.x - CX, p.y - CY) + p.r));
      const RING = hull + 26;
      N.forEach(p => {
        let dx = p.x - CX, dy = p.y - CY;
        const d = Math.hypot(dx, dy) || 0.01;
        p.right = dx >= 0;
        p.lx = CX + (dx / d) * RING * (p.right ? 1 : 1);
        p.ly = CY + (dy / d) * RING;
        // hold the label clear of the ring's own edge on the side it sits
        p.lx = p.right ? Math.max(p.lx, CX + hull + 14) : Math.min(p.lx, CX - hull - 14);
      });
      ['L', 'R'].forEach(side => {
        const col = N.filter(p => (side === 'R') === p.right).sort((a, b) => a.ly - b.ly);
        for (let k = 1; k < col.length; k++) {
          const gap = col[k].ly - col[k - 1].ly;
          if (gap < 28) col[k].ly += 28 - gap;
        }
        const over = col.length ? col[col.length - 1].ly - (CY + 300) : 0;
        if (over > 0) col.forEach(p => { p.ly -= over / 2; });
      });
      const leaders = N.map(p => {
        const ex = p.lx + (p.right ? -7 : 7);
        const dx = ex - p.x, dy = p.ly - 5 - p.y, d = Math.hypot(dx, dy) || 1;
        const sx = p.x + (dx / d) * p.r, sy = p.y + (dy / d) * p.r;
        return `<line x1="${sx.toFixed(1)}" y1="${sy.toFixed(1)}" x2="${ex.toFixed(1)}" y2="${(p.ly - 5).toFixed(1)}"/>`;
      }).join('');
      const edges = links.map(([a, b]) =>
        `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}"/>`).join('');
      /* One tone, not a spectrum. Every disc was taking its hue from its own
         count, which meant the field ran red, orange, green and blue across
         fourteen themes — and said the same thing the area already said, in a
         second language, loudly. A reader counted colours instead of reading
         sizes. The discs now draw in the band's own ink, so the only variable
         left in the picture is the one that carries meaning. */
      const dots = N.map((p, i) => `
        <g class="lab-web__node" style="--i:${i}" tabindex="0"
           data-name="${esc(p.t.name || '')}" data-n="${p.n}"
           data-note="${esc(String(p.t.note || '').replace(/<[^>]+>/g, ''))}">
          <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${p.r.toFixed(1)}"/>
          <text x="${p.lx.toFixed(1)}" y="${p.ly.toFixed(1)}" text-anchor="${p.right ? 'start' : 'end'}">${esc(p.t.name || '')} <tspan class="lab-web__n">${p.n}</tspan></text>
          <!-- No <title> here: the browser draws its own tooltip from one, which
               arrived a second after ours and sat on top of it. The name and the
               note reach a screen reader through the readout, which is aria-live. -->
        </g>`).join('');
      /* The frame used to be a fixed 1000x640 with the cluster sitting in the
         middle of it, so roughly a third of the band's width was empty on each
         side and the whole thing drew smaller than it needed to. The box is now
         measured off the drawing itself — discs, leaders and labels — and the
         picture fills the column it is given. Label widths are estimated from
         the character count at the size they are set, which is close enough:
         the box carries a pad wider than the error. */
      const EST = 8.2, PAD_X = 16, PAD_Y = 18;
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      N.forEach(p => {
        x0 = Math.min(x0, p.x - p.r); x1 = Math.max(x1, p.x + p.r);
        y0 = Math.min(y0, p.y - p.r); y1 = Math.max(y1, p.y + p.r);
        const w = (String(p.t.name || '').length + String(p.n).length + 1) * EST;
        x0 = Math.min(x0, p.right ? p.lx : p.lx - w);
        x1 = Math.max(x1, p.right ? p.lx + w : p.lx);
        y0 = Math.min(y0, p.ly - 14); y1 = Math.max(y1, p.ly + 6);
      });
      const VB = [(x0 - PAD_X).toFixed(1), (y0 - PAD_Y).toFixed(1),
                  (x1 - x0 + PAD_X * 2).toFixed(1), (y1 - y0 + PAD_Y * 2).toFixed(1)].join(' ');
      return `<svg class="lab-web" viewBox="${VB}" role="img"
        aria-label="${esc(THEMES.map(t => (t.name||'') + ' ' + (t.n||'')).join(', '))}">
        <g class="lab-web__thread">${edges}</g>
        <g class="lab-web__leaders">${leaders}</g>${dots}</svg>
        <p class="lab-web__read" aria-live="polite"></p>`;
    };
    const items = THEMES.map(t => {
      const pct = t.n !== undefined ? Math.round((+t.n / top) * 100) : 0;
      return `
      <li class="lab-theme${counted ? '' : ' lab-theme--plain'}">
        <span class="lab-theme__n">${esc(t.name || t.year || '')}</span>
        ${counted ? `<span class="lab-theme__bar"><i style="width:${pct}%"></i></span>` : ''}
        ${t.note ? `<span class="lab-theme__note">${t.note}</span>` : ''}
      </li>`;
    }).join('');
    /* A theme's note is carried on the disc itself — hover it, or read it from
       the title the drawing exposes to a screen reader. It used to be listed
       under the drawing as well, which said everything twice and turned a
       picture back into a table. */
    /* The readout follows the pointer from disc to disc, and the keyboard too —
       each disc is focusable, so the field can be stepped through with Tab. */
    /* The frame, measured rather than guessed.

       The viewBox is first computed from the geometry with the label widths
       estimated off their character count, which is fine until the type size
       changes: the phone sets these labels at 26px against the 17px the
       estimate assumed, and "Social impact 21" ran off both sides of the
       drawing. Once the SVG is in the document it can be asked what it
       actually occupies — getBBox covers the text too, at whatever size CSS
       has settled on — so the box is set from that and reset whenever the
       width changes and the type with it. */
    setTimeout(function fitFrame() {
      const svg = document.querySelector('.lab-web');
      if (!svg || !svg.getBBox) return;
      const apply = () => {
        let bb;
        try { bb = svg.getBBox(); } catch (e) { return; }
        if (!bb || !bb.width) return;
        const px = bb.width * 0.012 + 6, py = bb.height * 0.012 + 6;
        svg.setAttribute('viewBox',
          (bb.x - px).toFixed(1) + ' ' + (bb.y - py).toFixed(1) + ' ' +
          (bb.width + px * 2).toFixed(1) + ' ' + (bb.height + py * 2).toFixed(1));
      };
      apply();
      let t = 0, last = window.innerWidth;
      addEventListener('resize', () => {
        if (window.innerWidth === last) return;   // ignore a phone's address bar
        last = window.innerWidth;
        clearTimeout(t); t = setTimeout(apply, 160);
      }, { passive: true });
      /* the webfont lands after first paint and the labels change width with it */
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(apply);
    }, 0);

    setTimeout(function readout() {
      const svg = document.querySelector('.lab-web');
      const out = document.querySelector('.lab-web__read');
      if (!svg || !out) return;
      /* The note arrives at the disc, not at the foot of the section. A readout
         at the bottom of a figure this tall was off the bottom of the window
         while you were hovering — you picked a theme and nothing appeared to
         happen. It is placed against the disc instead, and clamped so it never
         leaves the drawing. */
      const band = svg.closest('.lab-band') || svg.parentElement;
      const show = g => {
        if (!g) { out.classList.remove('is-on'); return; }
        const note = g.dataset.note;
        /* Just the line, and nothing else. The name and the number are both on
           the ring beside the disc you are pointing at; repeating either of
           them inside the box was the same thing said twice, two inches apart. */
        out.textContent = note || g.dataset.name;
        /* Shown first, then measured. An absolutely positioned box that has not
           been laid out reports a width of zero, and the placement came out
           half a box to the right of where it should have been. */
        out.classList.add('is-on');
        const c = g.querySelector('circle').getBoundingClientRect();
        /* left/top are measured from whatever the box is actually positioned
           against, which is not necessarily the band — assuming it was put every
           tooltip out by the width of the container in between. */
        const b = (out.offsetParent || band).getBoundingClientRect();
        const r = out.getBoundingClientRect();
        const w = r.width, h = r.height;
        let x = c.left - b.left + c.width / 2 - w / 2;     // centred over the disc
        let y = c.top - b.top - h - 14;                    // and clear above it
        if (y < 4) y = c.bottom - b.top + 14;              // unless there is no room
        x = Math.max(8, Math.min(b.width - w - 8, x));

        /* The labels sit on a ring outside the cluster, so a box placed above a
           disc on that side lands on top of one. If it does, it goes under the
           disc instead — and if that collides too, it stays where it was. */
        const over = box => [...svg.querySelectorAll('.lab-web__node text')]
          .some(t => { const l = t.getBoundingClientRect();
            return !(box.right < l.left || box.left > l.right || box.bottom < l.top || box.top > l.bottom); });
        const probe = ty => ({ left: b.left + x, right: b.left + x + w, top: b.top + ty, bottom: b.top + ty + h });
        if (over(probe(y))) {
          const alt = (y === c.bottom - b.top + 14) ? c.top - b.top - h - 14 : c.bottom - b.top + 14;
          if (alt > 4 && !over(probe(alt))) y = alt;
        }
        out.style.left = Math.round(x) + 'px';
        out.style.top  = Math.round(y) + 'px';
      };
      const find = e => e.target.closest ? e.target.closest('.lab-web__node') : null;
      svg.addEventListener('mouseover', e => show(find(e)));
      svg.addEventListener('mouseleave', () => show(null));
      svg.addEventListener('focusin',  e => show(find(e)));
      svg.addEventListener('focusout', () => show(null));
    }, 0);

    /* The subjects, set rather than charted.

       This was a field of fourteen discs sized by count, packed apart and
       joined by threads, with the names on leader lines around the outside. It
       measured correctly and it read as a business chart — circles, rules and a
       legend, in a page that is otherwise nothing but type on paper. A reader
       had to decode it before they could read it.

       So the furniture goes and the type carries the number. Each subject is
       set at a size taken from its own count, the list runs heaviest first, and
       the whole thing sits on one baseline and wraps like a sentence. Chicago
       at eighty is four times the size of AI at twenty and you know that before
       you have read a word of the note under it. One colour, no rules, no
       shapes: the measurement and the setting are the same act.

       The curve is deliberately not linear. Type read at area rather than at
       cap height, so a straight mapping made the small end vanish; an exponent
       just under one keeps the smallest subject readable while the largest
       still dominates. */
    const field = () => {
      const lo = Math.min(...THEMES.map(t => +t.n || 0));
      const hi = top || 1;
      const span = Math.max(1, hi - lo);
      const sorted = [...THEMES].sort((a, b) => (+b.n || 0) - (+a.n || 0));
      const marks = sorted.map((t, i) => {
        const n = +t.n || 0;
        const k = Math.pow((n - lo) / span, 0.72);          // 0 at the smallest, 1 at the largest
        return `<span class="lab-field__t" style="--k:${k.toFixed(3)};--i:${i}"
                  tabindex="0" data-name="${esc(t.name || '')}" data-n="${n}"
                  data-note="${esc(String(t.note || '').replace(/<[^>]+>/g, ''))}"
               >${esc(t.name || '')}<span class="lab-field__n">${n}</span></span>`;
      }).join('');
      return `<div class="lab-field" role="img"
        aria-label="${esc(sorted.map(t => (t.name || '') + ' ' + (t.n || '')).join(', '))}">${marks}</div>
        <p class="lab-web__read" aria-live="polite"></p>`;
    };

    /* Ranked bars, drawn as a share of the whole record.

       The rule used to be scaled against the largest theme, so the biggest
       subject always filled the track completely — Chicago read as "all of it"
       while the number beside it said 80. The bar and the figure were measuring
       two different things, and the bar was the one lying. Both now answer the
       same question: of everything on the record, how much of it came back to
       this. Chicago is 80 of 227, so the rule runs just over a third.

       The shares do not total 100, and should not: one evening can be about
       Chicago and education and print at once. A theme is a tag, not a slice.

       One ink, no accents. Colour per row was tried and taken out — fourteen
       hues restated in a second language what the lengths already said. */
    const barField = () => {
      const whole = +LAB.themesOf || THEMES.reduce((m, t) => Math.max(m, +t.n || 0), 0);
      const sorted = [...THEMES].sort((a, b) => (+b.n || 0) - (+a.n || 0));
      const rows = sorted.map((t, i) => {
        const n = +t.n || 0;
        const pct = Math.round((n / whole) * 100);
        return `<li class="lab-bars__r" style="--i:${i}">
          <span class="lab-bars__head">
            <span class="lab-bars__name">${esc(t.name || '')}</span>
            <span class="lab-bars__n">${pct}%</span>
          </span>
          <span class="lab-bars__track"><i style="--w:${pct}%"></i></span>
          ${t.note ? `<span class="lab-bars__note">${t.note}</span>` : ''}
        </li>`;
      }).join('');
      return `<ol class="lab-bars">${rows}</ol>`;
    };
    /* `charts` replaces the bar field: the same counting, drawn over time. */
    if (LAB.charts && LAB.charts.length) {
      band('themes', LAB.themesLabel || 'Themes',
        /* `ini-lede`, not `lab-theme__lede`: the themes lede is set in the sans
           on purpose because it explains a chart's mechanics, but this is a
           sentence the reader reads, so it takes Signifier like every other
           lede on the page. */
        (LAB.themesLede ? `<p class="ini-lede ch-lede">${LAB.themesLede}</p>` : '') +
        chartField(LAB.charts),
        { full: true, className: LAB.charts.some(c => c.dark) ? 'lab-band--onblack' : '' });
    } else
    band('themes', LAB.themesLabel || 'Themes',
      (LAB.themesLede ? `<p class="lab-theme__lede">${LAB.themesLede}</p>` : '') +
      /* Fourteen labelled discs do not fit a phone. Scaled into 350px the
         drawing came out with ten-pixel labels — present, unclipped, and not
         worth reading. So a counted field ships both: the drawing, and the
         same fourteen numbers as a ranked list with a bar each. One is shown
         at a time, by width, and neither is hidden from a screen reader that
         is handed whichever the page is currently showing. */
      /* Either reading can be called up from the address bar — ?themes=bars or
         ?themes=field — so the two can be compared at full size on a real
         screen rather than side by side as pictures. With no parameter the
         study's own setting stands. */
      (counted
        ? ((new URLSearchParams(location.search).get('themes') ||
            LAB.themesStyle) === 'bars' ? barField() : field()) +
          `<ul class="lab-themes lab-themes--small">${items}</ul>`
        : `<ul class="lab-themes">${items}</ul>`) +
      (LAB.themesNote ? `<p class="lab-note">${LAB.themesNote}</p>` : ''), { full: true });
  }

  /* What the department would tell you if you only had a minute. */
  if (LAB.takeaways && LAB.takeaways.length) {
    /* A takeaway can be a plain sentence or a {head, body} pair. The head is
       set as a tag above its paragraph rather than as a bold lead-in inside
       it — the site does not use bold, and a finding deserves a name you can
       scan rather than a heavier first clause. */
    /* The number is its own element and the body is wrapped, because the two
       have to be put on the same row. Counted through a ::before it hung at the
       top of the item, level with the name above the finding rather than with
       the finding itself. Now the row holds the number in its first column and
       the paragraph in its second, and the two share a baseline. */
    const items = LAB.takeaways.map((t, i) => typeof t === 'string'
      ? `<li class="lab-take__i"><span class="lab-take__n">${i + 1}</span>` +
        `<span class="lab-take__b">${t}</span></li>`
      : `<li class="lab-take__i"><span class="tag lab-take__h">${t.head}</span>` +
        `<span class="lab-take__n">${i + 1}</span>` +
        `<span class="lab-take__b">${t.body}</span></li>`
    ).join('');
    band('takeaways', LAB.takeawaysLabel || 'Takeaways',
      `<ol class="lab-take">${items}</ol>`, { full: true });
  }

  /* Photographs: the department with its own eyes. A grid of pictures, each
     taking its own proportions, no captions unless one is given — the point is
     the room, not the record of it. */
  if (LAB.gallery && LAB.gallery.length) {
    const plates = LAB.gallery.map(g => `
      <figure class="lab-shot" style="grid-column:span ${g.span || 4}">
        <span class="lab-shot__plate"><img data-src="${g.src}" alt="${esc(g.alt || '')}" loading="lazy"></span>
        ${g.caption ? `<figcaption>${g.caption}</figcaption>` : ''}
      </figure>`).join('');
    band('gallery', LAB.galleryLabel || 'Room',
      `<div class="lab-shots">${plates}</div>`, { full: true });
  }


  const quoteSoloCSS = () => {
    if (document.getElementById('q-solo-css')) return;
    const s = document.createElement('style');
    s.id = 'q-solo-css';
    s.textContent =
      '.q-solo{display:flex;flex-direction:column;align-items:center;width:100%}' +
      /* The heading belongs over the quote it introduces. Centring the text
         was not enough: the lead carries a max-width, so its box sat at the
         left of the band and the words centred inside that. The box has to
         be centred too, on the same measure the quote uses. */
      '.q-band .lab-lead{text-align:center;max-width:46em;margin-inline:auto}' +
      /* inverted: the heading steps back to the size of a caption so the
         voice is the largest thing in the band */
      '.q-lead{margin-bottom:var(--space-7,3rem);font-size:1.05rem;line-height:1.4;' +
        'opacity:.6}' +
      '.q-band .label{text-align:center;display:block}' +
      /* the segments: one per voice, the current one filling as it is read */
      '.q-bar-row{width:100%;margin:0 0 var(--space-6,2rem)}' +
      '.q-bars{list-style:none;display:flex;gap:3px;padding:0;margin:0;' +
        'grid-column:5 / span 4}' +
      '.q-bar{flex:1;min-width:0}' +
      '.q-bar button{display:block;width:100%;height:1.5px;padding:0;border:0;' +
        'background:rgba(0,0,0,.16);cursor:pointer;position:relative;overflow:hidden}' +
      '.q-bar i{position:absolute;inset:0;width:0;background:currentColor;display:block}' +
      '.q-bar.is-done i{width:100%}' +
      '.q-bar.is-on i{animation:q-fill var(--q-dwell,7s) linear forwards}' +
      '@keyframes q-fill{from{width:0}to{width:100%}}' +
      /* one quote, centred, every other one kept in the flow so the block
         never changes height as they change */
      '.q-stage{display:grid;width:100%;max-width:46em;text-align:center}' +
      /* all of them in one cell: the stage takes the height of the longest
         quote and keeps it, so nothing below jumps as they change */
      '.q-item{grid-area:1/1;margin:0;opacity:0;visibility:hidden;' +
        'transition:opacity .45s ease;display:grid;grid-template-rows:1fr auto;' +
        'align-items:center}' +
      '.q-item.is-on{opacity:1;visibility:visible}' +
      /* the author is pinned to the foot of the stage so it cannot move
         as quotes of different lengths swap through. With one quote there
         is nothing to swap, so the name sits under the words it belongs
         to instead of at the bottom of an empty block. */
      /* block, not grid: the two-row grid exists only to pin the name to
         the foot of the stage while quotes of different lengths swap
         through. With one quote the row sizing just held the name 90px
         below the words it belongs to. */
      '.q-stage--one .q-item{display:block}' +
      /* the quote is set at 34px on 1.34, so its box already carries ~43px
         of leading below the last line; the margin is small on purpose */
      /* the quote sits at 34px on 1.34, so its box carries a deep skirt of
         leading under the last line; the name is pulled back up into it */
      '.q-stage--one .q-item__w{margin-top:-1.1rem}' +
      '.q-stage--one .q-item.is-on{display:block}' +
      '.q-item__t{margin:0;font-size:clamp(1.45rem,2.4vw,2.1rem);line-height:1.34;' +
        'text-wrap:pretty}' +
      '.q-item__w{display:block;margin-top:var(--space-6,2rem);font-style:normal !important;' +
        'font-family:var(--font-label,inherit);font-size:1rem;opacity:.6}' +
      '@media (prefers-reduced-motion:reduce){.q-bar.is-on i{animation:none;width:100%}' +
        '.q-item{transition:none}}';
    document.head.appendChild(s);
  };

  /* Voices: what people said, in their own words.

     These used to sit in a carousel, which asked the reader to click through
     them one at a time to find out whether there was anything else. A quote is
     not a photograph — it is read in a second, and five of them read together
     say more than five of them read in sequence. So they are laid out on the
     page, all of them at once, and the reader's eye does the paging.

     A study can ask for the carousel back with `quotesCarousel: true`. */
  if (LAB.quotes && LAB.quotes.length) {
    const qs = LAB.quotes.map(q => `
      <blockquote class="lab-quote">
        <p class="lab-quote__t">${q.text}</p>
        <cite class="lab-quote__w">${esc(q.who || '')}${
          q.where ? ` <span class="lab-quote__src">${esc(q.where)}</span>` : ''}</cite>
      </blockquote>`).join('');
    /* `quotesSolo` shows them one at a time instead, centred, with a run of
       segments above that fills as each one is read. A wall says "here is
       the evidence"; one at a time says "listen to this person" — which is
       the right register for a voice, and the reason the segments exist is
       so nobody has to wonder how many more there are. */
    if (LAB.quotesSolo) {
      quoteSoloCSS();
      const bars = LAB.quotes.map((q, i) =>
        `<li class="q-bar${i === 0 ? ' is-on' : ''}"><button type="button" data-q="${i}"
           aria-label="Voice ${i + 1} of ${LAB.quotes.length}"><i></i></button></li>`).join('');
      const items = LAB.quotes.map((q, i) => `
        <blockquote class="q-item${i === 0 ? ' is-on' : ''}" ${i === 0 ? '' : 'aria-hidden="true"'}>
          <p class="q-item__t">${q.text}</p>
          <cite class="q-item__w">${esc(q.who || '')}${
            q.where ? ` <span class="lab-quote__src">${esc(q.where)}</span>` : ''}</cite>
        </blockquote>`).join('');
      /* The heading is written into the block rather than passed as the
         band's lead, because the segments have to come above it and the
         lead is always emitted first. */
      band('quotes', LAB.quotesLabel || 'Voices',
        `<div class="q-solo" data-q-solo>
           ${LAB.quotes.length > 1
             /* a progress bar of one segment is a line, not a progress bar */
             ? `<div class="grid q-bar-row"><ol class="q-bars">${bars}</ol></div>` : ''}
           ${LAB.quotesLead ? `<p class="lab-lead q-lead">${LAB.quotesLead}</p>` : ''}
           <div class="q-stage${LAB.quotes.length > 1 ? '' : ' q-stage--one'}">${items}</div>
         </div>`, { full: true, lead: '', className: 'q-band' });
    } else
    band('quotes', LAB.quotesLabel || 'Voices',
      LAB.quotesCarousel
        ? `<div class="lab-quotes lab-carousel lab-carousel--quotes">
             <div class="lab-carousel__track">${qs}</div>
             ${carNav(LAB.quotes.length)}
           </div>`
        : `<div class="lab-quotes lab-quotes--wall">${qs}</div>`,
      { full: true });
  }


  /* Applications: the instruments themselves, running, one after another.
     A thumbnail of an instrument is a photograph of a musical instrument: it
     tells you the shape and nothing about the sound. These are the real thing,
     embedded and playing, in the order the argument builds them — the reader
     scrolls into each one rather than finding a card and guessing whether it is
     worth a click. `?embed=1` is the mode the overlay already uses: the tool's
     own nav, footer and export shelf drop away and the instrument is all that
     is left. A tool with no url of its own is still just a note. */
  /* ── Grounds ──────────────────────────────────────────────
     Why a parameter was set where it was set, with the evidence it was set
     from. Its own band and not part of the position, because a position is an
     argument and this is a set of reasons — and because a reader who wants to
     check the claims should be able to find them in one place. */
  if (LAB.grounds && LAB.grounds.length) {
    band('grounds', LAB.groundsLabel || 'Grounds', para([].concat(LAB.grounds)));
  }

  /* ── How the instrument is built ──────────────────────────────────────────
     A breakdown: the parts of one tool, named and explained in order, so the
     thing can be understood before it is touched. Three or four entries, each
     a part of the instrument rather than a feature of it.
     Shape: { breakdown: { lead?, parts: [{ name, desc, figure?, alt? }] } } */
  /* More than one instrument on a page: each gets its own breakdown, under its
     own name, with a way in at the end of it. `breakdowns` is a list of the
     same shape `breakdown` has. */
  (LAB.breakdowns || []).forEach(function (bd, bi) {
    var parts = (bd.parts || []).map(function (b, i) { return `
      <li class="lab-part">
        ${b.video
          ? `<div class="lab-part__fig"><video class="lab-part__vid" muted loop playsinline
                 preload="none"${b.poster ? ` poster="${b.poster}"` : ''}
                 aria-label="${esc(b.alt || b.name || '')}"><source data-src="${b.video}" type="video/mp4"></video></div>`
          : b.figure
          ? `<div class="lab-part__fig"><img data-src="${b.figure}" alt="${esc(b.alt || b.name || '')}" loading="lazy"></div>`
          : ''}
        <span class="lab-part__n">${i + 1}</span>
        <div class="lab-part__body">
          <h3 class="lab-part__name">${esc(b.name || '')}</h3>
          ${b.desc ? `<p class="lab-part__desc">${b.desc}</p>` : ''}
        </div>
      </li>`; }).join('');
    var sec = document.createElement('section');
    sec.className = 'lab-band lab-band--breakdown lab-band--stacked';
    sec.id = 'band-instrument-' + bi;
    sec.setAttribute('data-band', bd.name || 'Instrument');
    sec.setAttribute('data-no-reveal', '');
    sec.innerHTML = `
      <div class="container">
        <div class="grid">
          <div class="lab-band__col" style="grid-column:1 / span 12">
            <span class="label">${esc(bd.name || 'Instrument')}</span>
            <div class="lab-band__body">
              ${bd.lead ? `<p class="lab-band__lead">${bd.lead}</p>` : ''}
              <ol class="lab-parts">${parts}</ol>
              ${bd.url ? `<p class="lab-open"><a class="u" href="${bd.url}">${
                esc(bd.open || ('Open ' + (bd.name || 'it')))}</a></p>` : ''}
            </div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(sec);
  });

  if (LAB.breakdown && LAB.breakdown.parts && LAB.breakdown.parts.length) {
    const parts = LAB.breakdown.parts.map((b, i) => `
      <li class="lab-part">
        ${b.video
          ? `<div class="lab-part__fig"><video class="lab-part__vid" muted loop playsinline
                 preload="none"${b.poster ? ` poster="${b.poster}"` : ''}
                 aria-label="${esc(b.alt || b.name || '')}"><source data-src="${b.video}" type="video/mp4"></video></div>`
          : b.figure
          ? `<div class="lab-part__fig"><img data-src="${b.figure}" alt="${esc(b.alt || b.name || '')}" loading="lazy"></div>`
          : ''}
        <span class="lab-part__n">${i + 1}</span>
        <div class="lab-part__body">
          <h3 class="lab-part__name">${esc(b.name || '')}</h3>
          ${b.desc ? `<p class="lab-part__desc">${b.desc}</p>` : ''}
        </div>
      </li>`).join('');
    band('breakdown', LAB.breakdownLabel || 'How it is built',
      `${LAB.breakdown.lead ? `<p class="lab-band__lead">${LAB.breakdown.lead}</p>` : ''}
       <ol class="lab-parts">${parts}</ol>`, { full: true });
  }

  /* ── The instrument itself ────────────────────────────────────────────────
     Full width, and silent until it is asked for: an instrument that makes
     sound the moment it loads cannot be put on a page that someone is reading.
     The frame holds nothing until the reader taps it.
     Shape: { play: { url, name, note? } } */
  if (LAB.play && LAB.play.url) {
    const pl = LAB.play;
    band('play', LAB.playLabel || 'Play it', `
      <figure class="lab-play">
        <div class="lab-play__frame">
          <iframe data-src="${pl.url}" title="${esc(pl.name || 'Instrument')}"
                  loading="lazy" allow="microphone; autoplay; clipboard-write"></iframe>
          <button class="lab-play__tap" type="button">
            <span class="lab-play__name">${esc(pl.name || 'Open the instrument')}</span>
            <span class="lab-play__go">Tap to play</span>
          </button>
        </div>
        ${pl.note ? `<figcaption class="lab-play__note">${pl.note}</figcaption>` : ''}
      </figure>`, { full: true });
  }

  if (LAB.tools && LAB.tools.length) {
    /* What makes an instrument embeddable is the public shell under
       /lab/tools/ — `_public.js`, which strips the page furniture and builds
       the controls into a bar. An application with a front door of its own
       (Angel, say, which also makes sound the moment it opens) has no such
       shell and does not belong in the stack running. It keeps a card, and
       `embed: false` says so for anything else that would rather not play. */
    const embeds = t => t.url && t.embed !== false && /^\/lab\/tools\//.test(t.url);
    const rigs = LAB.tools.map(t => {
      const cap = `
        <figcaption class="lab-rig__cap">
          <span class="lab-rig__name">${esc(t.name)}</span>
          <span class="lab-rig__desc">${t.desc || ''}</span>
        </figcaption>`;
      if (!embeds(t)) {
        const plate = t.thumb
          ? `<img data-src="${t.thumb}" alt="${esc(t.alt || t.name)}" loading="lazy">`
          : `<div class="lab-fig__pending">${esc(t.note || 'Unpublished')}</div>`;
        const inner = `<div class="lab-rig__frame lab-rig__frame--still">${plate}</div>${cap}`;
        return t.url
          ? `<button class="lab-rig lab-rig--still" type="button" data-tool="${t.url}" data-name="${esc(t.name)}">${inner}</button>`
          : `<figure class="lab-rig lab-rig--still">${inner}</figure>`;
      }
      const src = t.url + (t.url.indexOf('?') < 0 ? '?' : '&') + 'embed=1';
      /* The src is withheld until the rig is near the viewport. Four canvas
         instruments all starting at once would spend the page's whole frame
         budget before a word of it had been read. */
      /* The name sits on the artwork, top left, on its own ground — a caption
         under a picture that fills its frame is a long way from the thing it
         names, and these instruments draw on black as readily as on white, so
         the plate carries its own contrast rather than borrowing the canvas's. */
      return `<figure class="lab-rig" data-tool-rig>
        <div class="lab-rig__frame">
          <iframe data-src="${src}" title="${esc(t.name)}" loading="lazy" data-rail
                  scrolling="no" allow="microphone; clipboard-write"></iframe>
          <button class="lab-rig__tap" type="button" data-tool="${t.url}" data-name="${esc(t.name)}"
                  aria-label="Open ${esc(t.name)}">
            <span>Open ${esc(t.name)}</span></button>
        </div>
        ${cap}</figure>`;
    }).join('');
    band('output', LAB.outputLabel || 'Applications', `<div class="lab-rigs">${rigs}</div>`, { full: true });
  } else if (LAB.weeks && LAB.weeks.length) {
    /* A study that runs in instalments. Each week is a section of its own —
       the number, what it is called, the question it puts and the rule it
       sets — and the photographs made under that rule sit inside it rather
       than being gathered into a showcase at the foot of the page. A reader
       should not have to hold a rule in their head while scrolling to find
       what it produced.

       Figure numbers run on across the whole sequence, so Fig. 6 in week two
       is the sixth photograph of the study and not the first of the week.
       A week with no pictures yet says so, and says nothing else. */
    let fign = 0;
    const weeks = LAB.weeks.map(w => {
      const figs = w.figures && w.figures.length ? figures(w.figures, fign) : '';
      if (w.figures) fign += w.figures.length;
      const head = `
        <div class="lab-week__head">
          ${w.n ? `<span class="lab-week__n">${esc(w.n)}</span>` : ''}
          <div class="lab-week__ask">
            ${w.date ? `<time class="lab-week__date">${esc(w.date)}</time>` : ''}
            <h3 class="lab-week__name">${esc(w.name || '')}</h3>
            ${w.question ? `<p class="lab-week__q">${w.question}</p>` : ''}
            ${w.brief ? `<p class="lab-week__brief">${w.brief}</p>` : ''}
          </div>
        </div>`;
      const note = w.note ? `<div class="lab-week__note">${para([].concat(w.note))}</div>` : '';
      /* No link out. The week is the record; sending a reader off the page to
         read it somewhere else says the record is kept elsewhere. */
      const pending = '';
      return `<li class="lab-week${w.n ? '' : ' lab-week--plain'}${figs ? '' : ' lab-week--pending'}">${head}${note}${figs}${pending}</li>`;
    }).join('');
    /* On black, like the showcase: the work is lit against a dark ground, the
       way it would be on a wall. A study that publishes photographs should not
       publish them on paper white. */
    band('output', LAB.outputLabel || 'Applications',
      `<ol class="lab-weeks">${weeks}</ol>`, { full: true, className: 'lab-band--onblack' });
  } else if (LAB.output) {
    band('output', LAB.outputLabel || 'Applications', Array.isArray(LAB.output) ? list(LAB.output) : para(LAB.output));
  }

  /* The things a department runs, side by side, each under its own mark. A
     logo carries a name faster than a line of type does, and four of them in a
     row say "these are siblings" without a word. */
  if (LAB.initiatives && LAB.initiatives.length) {
    const cells = LAB.initiatives.map(i => {
      const inner = `
        <span class="lab-init__mark"><img data-src="${i.logo}" alt="${esc(i.name)}" loading="lazy"></span>
        <span class="lab-init__n">${esc(i.name)}</span>
        ${i.note ? `<span class="lab-init__note">${i.note}</span>` : ''}`;
      return i.url
        ? `<a class="lab-init" href="${i.url}">${inner}</a>`
        : `<div class="lab-init">${inner}</div>`;
    }).join('');
    // the same band id as Making, because this IS that band: one entry in the
    // section bar, one anchor, one place in the framework
    band('output', LAB.initiativesLabel || 'Initiatives',
      `<div class="lab-inits">${cells}</div>`, { full: true });
  }

  /* ── Initiatives, each held open ──
     Initiatives lists the four applications as names and a line each. These
     bands are those same four opened up: what each has actually produced,
     shown rather than described. One renderer serves all of them, and an
     entry takes only the parts it defines — prose, a counted field, a wall
     of covers, a carousel.

     A wall is right where the work is one thing repeated a hundred times and
     the point is the mass of it. A carousel is right where each piece wants
     looking at. Underscore is the first case; the other three are the
     second. */

  /* The wall swaps a cell at a time out of a pool, the way the Underscore
     page does. The covers are square and uniform, so a grid of them reads as
     one object — a contact sheet of six years — and the slow exchange keeps
     it from being a screenshot. Markup only here; the swapping is wired
     after the bands are in the page. */
  const WALLS = [];
  const wall = (g) => {
    const files = g.files && g.files.length
      ? g.files
      : (g.nums || []).map(n => String(g.pattern || '{n}').replace('{n}', n));
    if (!files.length) return '';
    const cols = g.cols || 6, rows = g.rows || 4;
    /* The narrow grid was a flat three columns whatever the cell count, so a
       wall of sixteen ran five rows and left one tile alone on a sixth. The
       count comes from the cells instead: the widest of four, three or two
       that divides them exactly, and no widow at any size. */
    const n = cols * rows;
    const smCols = [4, 3, 2].find(c => n % c === 0) || 2;
    const i = WALLS.push({ base: g.base || '', files, cols, rows }) - 1;
    const cells = Array.from({ length: n }, () =>
      `<div class="brady-cell">` +
      `<img class="brady-cell__img brady-cell__img--back" alt="" loading="lazy">` +
      `<img class="brady-cell__img brady-cell__img--front" alt="" loading="lazy">` +
      `</div>`).join('');
    return `<div class="brady-wrap" data-wall="${i}">` +
           `<div class="brady-grid" style="--brady-cols:${cols};--brady-rows:${rows};` +
           `--brady-cols-sm:${smCols}">${cells}</div></div>`;
  };

  /* The wall's rules travel with the renderer rather than the stylesheet, so
     a study that never builds one carries none of this. */
  const wallCSS = () => {
    if (document.getElementById('brady-css')) return;
    const s = document.createElement('style');
    s.id = 'brady-css';
    s.textContent =
      '.brady-wrap{width:100%;margin:0}' +
      '.brady-grid{display:grid;grid-template-columns:repeat(var(--brady-cols,6),1fr);gap:.5em}' +
      '.brady-cell{position:relative;aspect-ratio:1/1;overflow:hidden}' +
      '.brady-cell__img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}' +
      '.brady-cell__img--back{opacity:0;transition:opacity .45s ease-in-out;z-index:1}' +
      '.brady-cell__img--front{opacity:1;z-index:0}' +
      '@media (max-width:700px){.brady-grid{' +
        'grid-template-columns:repeat(var(--brady-cols-sm,3),1fr)}}' +
      '@media (prefers-reduced-motion:reduce){.brady-cell__img--back{transition:none}}';
    document.head.appendChild(s);
  };

  /* ── A field of mixes ──
     Every published mix as a node, clustered by who made it. The shape is
     the finding: one large cluster and a scatter of small ones is what "wide
     and shallow" looks like when you draw it. A node is sized by how long
     the mix runs, and pressing one loads that mix's player — the preview is
     the real thing rather than a sample of it.

     Positions are computed from the data and never from a random seed, so
     the field prerenders to the same picture it renders at runtime. */
  const NODE_FIELDS = [];
  const nodeField = (mixes) => {
    if (!mixes || !mixes.length) return '';
    const W = 1000, H = 620, CX = W / 2, CY = H / 2 - 10;

    const secs = mixes.map(m => +m.s || 0);
    const lo = Math.min(...secs), hi = Math.max(...secs);
    const rOf = s => 13 + 19 * Math.sqrt(hi > lo ? ((+s || 0) - lo) / (hi - lo) : 0.5);

    /* In date order, on a phyllotactic spiral — the arrangement a sunflower
       uses, and the one that spaces a fixed number of things evenly without
       any two landing on each other. The oldest mix sits at the middle and
       the newest at the rim, so the field reads as the run growing outward.
       Nothing is grouped by who made it: a mix is a mix. */
    const run = [...mixes].sort((a, b) => String(a.d).localeCompare(String(b.d)));
    const GOLDEN = Math.PI * (3 - Math.sqrt(5));
    const RX = 545, RY = 325;

    let nodes = '', labels = '';
    const i0 = NODE_FIELDS.length;
    /* the drawn extent, gathered as we go, so the viewBox can be fitted to
       the field rather than the field floated in a guessed box */
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    const seen = (x, y, r) => {
      x0 = Math.min(x0, x - r); x1 = Math.max(x1, x + r);
      y0 = Math.min(y0, y - r); y1 = Math.max(y1, y + r);
    };

    run.forEach((m, i) => {
      const t = Math.sqrt((i + 0.5) / run.length);
      const a = i * GOLDEN;
      const x = CX + Math.cos(a) * RX * t;
      const y = CY + Math.sin(a) * RY * t;
      const r = rOf(m.s);
      const id = 'mu-c-' + i0 + '-' + i;
      const who = m.w || 'unattributed';
      seen(x, y, r);
      nodes += `<g class="mu-node" tabindex="0" role="button"
          data-k="${esc(m.k)}" data-w="${esc(who)}" data-d="${esc(m.d)}"
          data-m="${Math.round((+m.s || 0) / 60)}"
          aria-label="${esc(who)}, ${esc(m.d)}">
          <clipPath id="${id}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}"/></clipPath>
          <image href="${esc(m.p)}" x="${(x - r).toFixed(1)}" y="${(y - r).toFixed(1)}"
                 width="${(r * 2).toFixed(1)}" height="${(r * 2).toFixed(1)}"
                 preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/>
          <circle class="mu-ring" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}"/>
          <g class="mu-ic" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(r / 15).toFixed(3)})">
            <circle class="mu-ic__bg" r="15"/>
            <path class="mu-ic__play" d="M -4 -7 L 8 0 L -4 7 Z"/>
            <g class="mu-ic__pause"><rect x="-5.6" y="-7" width="3.6" height="14"/><rect x="2" y="-7" width="3.6" height="14"/></g>
          </g>
        </g>`;
    });

    const PAD = 26;
    const vb = [ (x0 - PAD).toFixed(1), (y0 - PAD).toFixed(1),
                 (x1 - x0 + PAD * 2).toFixed(1), (y1 - y0 + PAD * 2).toFixed(1) ].join(' ');

    const i = NODE_FIELDS.push({ count: mixes.length }) - 1;
    return `
      <div class="mu-field" data-mu="${i}">
        <svg viewBox="${vb}" role="group" aria-label="Every published mix, oldest at the centre">
          ${labels}
          ${nodes}
        </svg>
        <div class="mu-player" data-mu-player aria-hidden="true"></div>
      </div>`;
  };

  const nodeCSS = () => {
    if (document.getElementById('mu-css')) return;
    const s = document.createElement('style');
    s.id = 'mu-css';
    s.textContent =
      '.mu-field{width:100%}' +
      '.mu-field > svg{width:100%;height:auto;display:block;overflow:visible}' +
      '.mu-node{cursor:pointer}' +
      '.mu-node .mu-ring{fill:none;stroke:rgba(0,0,0,.28);stroke-width:1;' +
        'transition:stroke .2s ease,stroke-width .2s ease}' +
      '.mu-node:hover .mu-ring,.mu-node:focus-visible .mu-ring{stroke:#000;stroke-width:2.5}' +
      '.mu-node:focus{outline:none}' +
      '.mu-node.is-on .mu-ring{stroke:#000;stroke-width:3}' +
      '.mu-node image{transition:opacity .2s ease}' +
      '.mu-field:hover .mu-node:not(:hover) image{opacity:.55}' +
      /* the control lives on the node: play on hover, pause while running */
      '.mu-ic{opacity:0;pointer-events:none;transition:opacity .16s ease}' +
      '.mu-node:hover .mu-ic,.mu-node:focus-visible .mu-ic,.mu-node.is-on .mu-ic{opacity:1}' +
      '.mu-ic__bg{fill:rgba(0,0,0,.52)}' +
      '.mu-ic__play,.mu-ic__pause{fill:#fff}' +
      '.mu-ic__pause{opacity:0}' +
      '.mu-node.is-on .mu-ic__play{opacity:0}' +
      '.mu-node.is-on .mu-ic__pause{opacity:1}' +
      /* the widget is the audio and nothing else: kept rendered so it keeps
         playing, kept out of sight because the node is the interface */
      '.mu-player{position:absolute;width:1px;height:1px;overflow:hidden;' +
        'opacity:0;pointer-events:none}' +
      '.mu-player iframe{width:400px;height:120px;border:0}' +

      /* the run as a list */
      '.mu-list{list-style:none;margin:0;padding:0;min-height:0;' +
        'border-top:1px solid rgba(0,0,0,.14)}' +
      '.mu-list--two{display:grid;grid-auto-flow:column;' +
        'grid-template-rows:repeat(var(--mu-rows,21),auto);' +
        'grid-template-columns:repeat(2,minmax(0,1fr));' +
        'column-gap:var(--space-6,2rem);align-content:start}' +
      '@media (max-width:900px){.mu-list--two{grid-auto-flow:row;' +
        'grid-template-rows:none;grid-template-columns:1fr}}' +
      '.mu-row{border-bottom:1px solid rgba(0,0,0,.14);list-style:none;margin:0;padding:0}' +
      '.mu-row__go{display:grid;grid-template-columns:1.2em minmax(0,1fr) auto auto 1.9em;' +
        'align-items:start;gap:.5em;width:100%;background:none;border:0;padding:.46em 0;' +
        'cursor:pointer;text-align:left;font:inherit;color:inherit;' +
        'font-family:var(--font-label,inherit);font-size:.76rem;letter-spacing:.01em}' +
      /* A track row is a button, and on a phone it was 26px tall — under the
         44px a thumb needs and under the 30 the QA sweep allows. The row is
         padded rather than re-laid-out: the ink stays where it is, the row
         just stops being a hairline to hit. Only on touch widths, because a
         pointer can hit 26px and the desktop list wants to stay dense. */
      '@media (max-width:40em){.mu-row__go{min-height:44px;padding:.78em 0}}' +
      '.mu-row__n{overflow-wrap:anywhere;line-height:1.25}' +
      '.mu-row__go:hover{color:#000}' +
      '.mu-row__ic{display:block;width:12px;height:12px;margin-top:.15em}' +
      '.mu-row__ic svg{width:12px;height:12px;display:block;fill:currentColor;opacity:.55}' +
      '.mu-row:hover .mu-row__ic svg{opacity:1}' +
      '.mu-row__stop{opacity:0}' +
      '.mu-row.is-on .mu-row__play{opacity:0}' +
      '.mu-row.is-on .mu-row__stop{opacity:1}' +
      '.mu-row.is-on .mu-row__ic svg{opacity:1}' +
      '.mu-row__d{opacity:.5;font-variant-numeric:tabular-nums;line-height:1.25;white-space:nowrap}' +
      '.mu-row__t{opacity:.55;font-variant-numeric:tabular-nums;line-height:1.25;white-space:nowrap}' +
      /* four bars, moving only while that row is the one playing */
      '.mu-row__eq{display:flex;align-items:flex-end;gap:2px;height:12px;opacity:0;margin-top:.1em}' +
      '.mu-row.is-on .mu-row__eq{opacity:1}' +
      '.mu-row__eq i{width:2px;height:3px;background:currentColor;display:block}' +
      '.mu-row.is-on .mu-row__eq i{animation:mu-eq .9s ease-in-out infinite}' +
      '.mu-row.is-on .mu-row__eq i:nth-child(2){animation-delay:.15s}' +
      '.mu-row.is-on .mu-row__eq i:nth-child(3){animation-delay:.3s}' +
      '.mu-row.is-on .mu-row__eq i:nth-child(4){animation-delay:.45s}' +
      '@keyframes mu-eq{0%,100%{height:3px}50%{height:12px}}' +
      '@media (prefers-reduced-motion:reduce){.mu-row.is-on .mu-row__eq i{animation:none;height:8px}}' +
      '.ini-black .mu-list{border-top-color:hsla(0,0%,100%,.22)}' +
      '.ini-black .mu-row{border-bottom-color:hsla(0,0%,100%,.22)}' +
      '.mu-more{margin:var(--space-5,1.5rem) 0 0;font-family:var(--font-label,inherit);' +
        'font-size:.78rem}';
    document.head.appendChild(s);
  };


  /* ── The run, as a list ──
     The same mixes as data rather than as a picture: numbered, dated, with
     their length, and a play control on each row. A reader looking for a
     particular one reads down a list far faster than they hunt a field of
     circles, and the covers were never what anybody came for. */
  const mixList = (mixes, more) => {
    if (!mixes || !mixes.length) return '';
    const run = [...mixes].sort((a, b) => String(a.d).localeCompare(String(b.d)));

    /* An index entry, not a title: the number, then who made it, joined the
       way a filename is. No leading zero on the number — the house rule is
       1, 2, 3 everywhere, and an index is not an exception to it. */
    const name = w => String(w || 'Unattributed')
      .replace(/\s*\([^)]*\)/g, '')     // the guises in brackets are one maker
      .trim() || 'Unattributed';
    const slug = w => name(w).replace(/\s+/g, '_');

    const stamp = d => {
      const q = String(d).split('-');
      return q.length > 1 ? q[1] + '_' + q[0] : String(d);
    };
    const clock = sec => {
      const n = Math.max(0, Math.round(+sec || 0));
      return Math.floor(n / 60) + ':' + String(n % 60).padStart(2, '0');
    };

    /* One per maker — their most recent — so the list reads as who is in the
       room rather than as the whole archive. The number each one keeps is its
       real place in the run, which is why they are not consecutive: MU-39 is
       the thirty-ninth mix, not the fourteenth row. The rest are a click away. */
    const latest = new Map();
    run.forEach((m, i) => latest.set(name(m.w), { m: m, n: i + 1 }));
    const picks = [...latest.values()].sort((a, b) => a.n - b.n);

    const rows = picks.map(({ m, n }) => `
      <li class="mu-row" data-k="${esc(m.k)}" data-d="${esc(m.d)}"
          data-m="${Math.round((+m.s || 0) / 60)}">
        <button class="mu-row__go" type="button"
                aria-label="Play Mu ${n} by ${esc(name(m.w))}">
          <span class="mu-row__ic" aria-hidden="true">
            <svg viewBox="0 0 12 12"><path class="mu-row__play" d="M3 1.5 L10 6 L3 10.5 Z"/>
              <g class="mu-row__stop"><rect x="2.4" y="2" width="2.6" height="8"/><rect x="7" y="2" width="2.6" height="8"/></g></svg>
          </span>
          <span class="mu-row__n">MU-${n}-${esc(slug(m.w))}</span>
          <span class="mu-row__d">${esc(stamp(m.d))}</span>
          <span class="mu-row__t">${clock(m.s)}</span>
          <span class="mu-row__eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
        </button>
      </li>`).join('');

    return `<div class="mu-field"><ol class="mu-list">${rows}</ol>` +
      (more ? `<p class="mu-more"><a class="u" href="${more}">Explore all ${run.length}</a></p>` : '') +
      `<div class="mu-player" data-mu-player aria-hidden="true"></div></div>`;
  };


  const countedField = (rows, of) => {
    const whole = +of || rows.reduce((s, r) => s + (+r.n || 0), 0);
    const list = [...rows].sort((a, b) => (+b.n || 0) - (+a.n || 0)).map((r, i) => {
      const pct = Math.round(((+r.n || 0) / whole) * 100);
      return `<li class="lab-bars__r" style="--i:${i}">
        <span class="lab-bars__head">
          <span class="lab-bars__name">${esc(r.name || '')}</span>
          <span class="lab-bars__n">${esc(String(r.n))}</span>
        </span>
        <span class="lab-bars__track"><i style="--w:${pct}%"></i></span>
        ${r.note ? `<span class="lab-bars__note">${r.note}</span>` : ''}
      </li>`;
    }).join('');
    return `<ol class="lab-bars">${list}</ol>`;
  };

  /* Each initiative gets the screen to itself. A band is held to the full
     height of the window and its contents centred in it, so the reader
     arrives at one application at a time rather than scrolling through four
     of them at once. `min-height`, never `height` — Underscore's wall and
     its prose together run past a short window, and a fixed height would
     crop them. */
  const bandHeightCSS = () => {
    if (document.getElementById('ini-band-css')) return;
    const s = document.createElement('style');
    s.id = 'ini-band-css';
    const B = '.lab-band--underscore,.lab-band--faculty,.lab-band--muradio';
    s.textContent =
      /* One screen each, exactly. `height`, not `min-height`: the wall and
         the node field are the only tall things in these bands and both can
         be asked to take whatever room is left, so the band never has to
         grow past the window. The flex chain below hands that leftover
         height down through the container, the grid and the body to the
         picture at the bottom of it. */
      B + '{height:100vh;height:100svh;display:flex;flex-direction:column;' +
        'justify-content:center;overflow:hidden;' +
        'padding-top:var(--space-7,3rem);padding-bottom:var(--space-7,3rem)}' +
      B + ' > .container{flex:1;min-height:0;display:flex;flex-direction:column}' +
      B + ' > .container > .grid{flex:1;min-height:0}' +
      B + ' .lab-band__col{min-height:0;display:flex;flex-direction:column}' +
      B + ' .lab-band__body{flex:1;min-height:0;display:flex;flex-direction:column}' +
      /* the picture takes the remainder */
      B + ' .brady-wrap,' + B + ' .mu-field{flex:1;min-height:0;display:flex;flex-direction:column}' +
      B + ' .brady-grid{flex:1;min-height:0;' +
        /* minmax(0,1fr), not 1fr: a grid track\'s automatic minimum is its
           content, so rows of images refuse to shrink below the pictures
           and the wall runs past the band it was told to fit */
        'grid-template-rows:repeat(var(--brady-rows,4),minmax(0,1fr));' +
        'grid-template-columns:repeat(var(--brady-cols,6),minmax(0,1fr))}' +
      B + ' .brady-cell{aspect-ratio:auto;min-height:0}' +
      B + ' .mu-field > svg{flex:1;min-height:0;height:100%;width:100%}' +
      /* the section bar is sticky and would otherwise sit over the first
         line when a band is jumped to from the index */
      '.lab-band--underscore,.lab-band--faculty,.lab-band--muradio{scroll-margin-top:7rem}' +
      '@media (max-height:860px){' + B + '{padding-top:var(--space-5,1.5rem);' +
        'padding-bottom:var(--space-5,1.5rem)}}' +
      '@media (max-width:900px){' + B + '{height:auto !important;' +
        'padding-top:var(--space-8,4rem);padding-bottom:var(--space-8,4rem)}}' +

      /* two columns: words left on the page grid, work right */
      '.ini-split{align-items:stretch;height:100%;min-height:0}' +
      /* both columns take the full row and centre their own contents, so the
         words sit level with the middle of the work beside them rather than
         level with the middle of a row the work happens to define */
      '.ini-split__t{grid-column:1 / span 6;align-self:stretch;min-height:0;' +
        'display:flex;flex-direction:column;justify-content:center}' +
      '.ini-split__m{grid-column:7 / span 6;min-height:0;height:100%;' +
        'display:flex;flex-direction:column;justify-content:center}' +
      '.ini-split__t .lab-lead{margin-bottom:0}' +
      /* Signifier, like every other piece of reading on the page. The
         themes lede is set in the sans on purpose — it names a thing — but
         these sentences are read, so they take the reading face. */
      '.ini-lede{margin:.5em 0 0;max-width:26em;line-height:1.45}' +
      /* the figures sit under the description, no box, side by side */
      '.ini-figs{margin-top:var(--space-6,2rem)}' +
      '.ini-figs .lab-data{display:grid;grid-auto-flow:row;' +
        'grid-template-columns:repeat(6,minmax(0,1fr));' +
        'column-gap:var(--grid-gap,.5em);row-gap:.3em;margin:0;border:0}' +
      '.ini-figs .lab-data__cell{padding:0;border:0}' +
      /* the count runs in with its own label instead of standing over it:
         one line, one baseline, the number italic so it still reads as a
         figure rather than as a word */
      '.ini-figs .lab-data__n{display:inline;font-size:1.05rem;line-height:1.45;' +
        'font-style:italic;font-weight:400;margin-right:.32em}' +
      '.ini-figs .lab-data__l{display:inline;font-size:1.05rem;line-height:1.45}' +
      '.ini-figs .lab-data__cell{font-size:1.05rem;line-height:1.45}' +
      /* below 40em the page grid becomes six columns with a 1em gap; the
         figures' own grid has to change with it or they drift 4px off the
         lines they are meant to sit on */
      '@media (max-width:40em){.ini-figs .lab-data{gap:1em}}' +
      '@media (max-width:900px){.ini-split__t{grid-column:1 / -1}' +
        '.ini-split__m{grid-column:1 / -1;margin-top:var(--space-6,2rem)}}' +

      /* the grounds */
      /* the offering's own mark, above its headline. Height, not width, is
         what makes three different drawings sit as one family. */
      '.ini-mark{display:block;margin:0 0 var(--space-6,2rem)}' +
      /* Held in one box rather than set to one height: the three marks are
         drawn at very different proportions — Underscore is nine times as
         wide as it is tall, Mu is nearly square — so a shared height made
         one enormous beside the other. A shared box brings Underscore and
         Faculty to the same width and lets Mu reach the same cap height. */
      '.ini-mark img{display:block;width:150px;height:38px;' +
        /* a shared box, each mark fitted inside it and set to the left —
           max-width alone left Mu at its drawn size, 39px, because it was
           already smaller than the cap */
        'object-fit:contain;object-position:left center}' +
      /* The mark on a photographic ground is the one that cannot be drawn in
         a fixed colour: the Faculty band cycles five covers, and a black mark
         that reads on a pale one disappears on a dark one. Difference inverts
         it against whatever it happens to be standing on, so it is legible on
         every frame of the rotation without a second file per image. The nav
         uses the same device over the hero. */
      '.ini-image .ini-mark img{mix-blend-mode:difference;filter:invert(1)}' +
      /* the themes band's lede sits right under its headline, the way the
         offerings further down do — it was a whole rest lower */
      /* The site is set in one weight and strong is not drawn heavier —
         styles.scss says so and means it. These three are the exception,
         asked for by name: the pillars the whole study is built on, and
         they open their own paragraphs. 700, because Signifier is cut at
         400 and 700 and anything between is a weight nobody drew. */
      '.lab-band strong.pillar{font-weight:700}' +
      '.lab-band--themes .lab-lead{margin-bottom:.5em}' +
      '.ini-grey{background:#f4f4f3}' +
      /* a flat colour ground, in the same soft register as the pink the
         voices sit on, so black type still reads at full strength */
      '.ini-tint{color:#16150f}' +
      /* a band whose ground is the work itself. The scrim is what keeps
         type legible over a picture that was never chosen for contrast. */
      '.ini-image{background-size:cover;background-position:center;' +
        'background-repeat:no-repeat;position:relative}' +
      '.ini-image > .container{position:relative;z-index:1}' +
      '.ini-bg{position:absolute;inset:0;overflow:hidden;z-index:0}' +
      '.ini-bg i{position:absolute;inset:0;background-size:cover;' +
        'background-position:center;opacity:0;transition:opacity .9s ease}' +
      '.ini-bg i.is-on{opacity:1}' +
      '.ini-bg__scrim{position:absolute;inset:0;background:rgba(0,0,0,.54)}' +
      /* pinned to the foot of the container, which is the foot of the picture
         inside the band's padding; the container's own right padding puts the
         line on the grid's last column. `margin-top:auto` could not do it —
         the split grid is set to the full height and leaves nothing to push
         against. */
      '.ini-cap-row{position:absolute;left:0;right:0;bottom:var(--space-7,3rem);z-index:1}' +
      /* on a phone the band is auto-height and the figures reach the foot,
         so the caption rejoins the flow instead of lying over them */
      '@media (max-width:900px){.ini-cap-row{position:static;' +
        'margin-top:var(--space-6,2rem)}}' +
      '.ini-bg-cap{margin:0;text-align:left;' +
        'font-family:var(--font-label,inherit);font-size:.76rem;line-height:1.9}' +
      '.ini-bg-cap mark.hl{background:#f4f2ed;color:#16150f;box-shadow:none;' +
        /* hangs left by what it pads, like the heading above it, so the
           first glyph starts on the grid's first column */
        'padding:.14em .34em;margin-left:-.34em;' +
        'box-decoration-break:clone;-webkit-box-decoration-break:clone}' +
      /* the same segments the voices use, so the two read as one device */
      '.ini-bar-row{margin:0 0 var(--space-5,1.5rem)}' +
      '.ini-bars{list-style:none;display:flex;gap:3px;padding:0;margin:0;' +
        'grid-column:1 / span 4}' +
      '.ini-bars li{flex:1;min-width:0}' +
      /* The bar is a hairline and has to stay one — it is a progress reading,
         not a control that wants to be noticed. But it is also the way you
         jump to a spread, and a 1.5px target cannot be hit with a thumb.

         So the BUTTON is 32px and the INK is 1.5px. The negative margin hands
         the extra 30.5px back to the layout, so the row is still a hairline
         on the page while the thing you press is a finger tall. Drawing the
         band on ::before instead was the first attempt and does not work: a
         pseudo-element does not change the button's own box, which is what a
         tap target is measured as — by the QA sweep and by the browser. */
      '.ini-bars button{display:block;width:100%;height:32px;margin:-15.25px 0;' +
        'padding:0;border:0;background:none;cursor:pointer;position:relative}' +
      '.ini-bars button::before{content:"";position:absolute;left:0;right:0;' +
        'top:50%;height:1.5px;margin-top:-.75px;background:hsla(0,0%,100%,.3)}' +
      '.ini-bars i{position:absolute;left:0;top:50%;height:1.5px;margin-top:-.75px;' +
        'width:0;background:#fff;display:block}' +
      '.ini-bars li.is-done i{width:100%}' +
      '.ini-bars li.is-on i{animation:q-fill var(--bg-dwell,5s) linear forwards}' +
      '@media (prefers-reduced-motion:reduce){.ini-bars li.is-on i{animation:none;width:100%}' +
        '.ini-bg i{transition:none}}' +
      /* a marker, not a shadow: paper-white behind the words, which is also
         the only thing that holds against a photograph of printed matter */
      /* The marker hangs into the margin by exactly what it pads, so the words
         still begin on the grid line and nothing is indented. The hang sits on
         the paragraph, not on the mark: a margin on the mark is applied to its
         first line fragment alone, so every line after the first stood .3em to
         the right of it and the left edge read as ragged. */
      '.ini-image .lab-lead,.ini-image .ini-lede{margin-left:-.3em}' +
      '.ini-image .lab-lead mark.hl,.ini-image .ini-lede mark.hl{' +
        'background:#f4f2ed;color:#16150f;box-shadow:none;' +
        'padding:.1em .3em;' +
        'box-decoration-break:clone;-webkit-box-decoration-break:clone}' +
      '.ini-black .ini-lede,.ini-black .lab-band__body > p{color:#fff}' +
      '.ini-black .lab-data__n{color:#fff}' +
      '.ini-black .lab-data__l{color:hsla(0,0%,100%,.85)}' +
      '.ini-black .lab-data__note,.ini-black .lab-note{color:hsla(0,0%,100%,.55)}' +
      '.ini-black .lab-bars__name,.ini-black .lab-bars__n{color:#fff}' +
      '.ini-black .lab-bars__note{color:hsla(0,0%,100%,.55)}' +
      '.ini-black .lab-bars__track{background:hsla(0,0%,100%,.18)}' +
      '.ini-black .lab-bars__track i{background:#fff}' +
      '.ini-black .mu-node .mu-ring{stroke:hsla(0,0%,100%,.4)}' +
      '.ini-black .mu-node:hover .mu-ring,.ini-black .mu-node.is-on .mu-ring{stroke:#fff}' +
      '.ini-black .mu-lab{fill:hsla(0,0%,100%,.6)}' +

      /* The height is declared again, last. Set only at the top of this
         sheet it does not take: the band comes out its content's height
         while every other declaration in the same rule — the flex, the
         padding, the overflow — applies. No other rule in any stylesheet
         sets a height on these sections, so the cause is not a rule I can
         find and remove; re-stating it at the end is what makes it hold.
         Measured, not assumed: 1047px before, 900 after, at a 900 window. */
      B + '{height:100vh;height:100svh}' +
      /* and the chain that hands that height down, for the same reason */
      B + ' > .container{flex:1;min-height:0;display:flex;flex-direction:column}' +
      B + ' > .container > .grid{flex:1;min-height:0}' +
      B + ' .lab-band__col{min-height:0;display:flex;flex-direction:column}' +
      B + ' .lab-band__body{flex:1;min-height:0;display:flex;flex-direction:column}' +
      B + ' .brady-wrap,' + B + ' .mu-field{flex:1;min-height:0;display:flex;flex-direction:column}' +
      B + ' .brady-grid{flex:1;min-height:0;' +
        'grid-template-rows:repeat(var(--brady-rows,4),minmax(0,1fr));' +
        'grid-template-columns:repeat(var(--brady-cols,6),minmax(0,1fr))}' +
      B + ' .brady-cell{aspect-ratio:auto;min-height:0}' +
      B + ' .mu-field > svg{flex:1;min-height:0;height:100%;width:100%}' +
      /* the list and the way out of it travel together, centred in the
         column — the list is short enough now that stretching it only
         pushed the link to a corner of the page by itself */
      B + ' .mu-field{justify-content:center}' +
      B + ' .mu-list{flex:0 1 auto;min-height:0;overflow-y:auto}';
    document.head.appendChild(s);
  };

  (LAB.initiativeBands || []).forEach((ini, idx) => {
    if (!ini || !ini.key) return;
    bandHeightCSS();
    if (ini.wall) wallCSS();
    if (ini.nodes || ini.list) nodeCSS();   // the list's rules live there too

    /* The heading takes the left of the page and the figures the right,
       level with it — a reader meets the claim and the count at the same
       moment instead of scrolling to find out how big the thing is. The
       figures stack rather than sitting in a row, because three numbers
       down a margin read as a list and three across read as a table. */
    /* Two columns: the words and their figures on the left, the work on
       the right. The left column keeps the page's own grid, so a band with
       a picture behind it indents nothing — the highlight behind the text
       hangs into the margin instead, which is what `.hl` is for. */
    const media =
      (ini.wall ? wall(ini.wall) : '') +
      (ini.list ? mixList(ini.list, ini.listMore) : '') +
      (ini.nodes ? nodeField(ini.nodes) : '') +
      (ini.figures && ini.figures.length ? carousel(ini.figures) : '');

    const words =
      /* the offering's own mark, above its headline. Drawn in black, so on a
         dark ground it is inverted rather than swapped for a second file. */
      (ini.logo ? `<span class="ini-mark"><img src="${ini.logo}" alt="${
        esc(ini.label || ini.key)}" loading="lazy"></span>` : '') +
      (ini.lead ? `<p class="lab-lead">${ini.lead}</p>` : '') +
      (ini.lede ? `<p class="ini-lede">${ini.lede}</p>` : '') +
      (ini.body ? para([].concat(ini.body)) : '') +
      (ini.counted && ini.counted.length ? countedField(ini.counted, ini.countedOf) : '') +
      (ini.data && ini.data.length
        /* Stacked, one to a line, each taking the whole of the heading's six
           columns — so every figure starts on the same column line as the
           words above it and none of them has to share a row. */
        ? `<div class="ini-figs">${dataGrid(ini.data.map(d =>
            Object.assign({}, d, { span: 6 })))}</div>`
        : '') +
      (ini.note ? `<p class="lab-note">${ini.note}</p>` : '');

    const body =
      `<div class="grid ini-split">
         <div class="ini-split__t">${words}</div>
         ${media ? `<div class="ini-split__m">${media}</div>` : ''}
       </div>`;

    /* Grey, black, grey — the grounds alternate down the page so one
       application ends and the next plainly begins. Index, not a hand-set
       value, so a fifth initiative keeps the rhythm without being told. */
    const g = ini.ground || (idx % 2 ? 'black' : 'grey');
    const ground = g === 'black' ? 'lab-band--onblack ini-black'
                 : g === 'image' ? 'lab-band--onblack ini-black ini-image'
                 : g === 'tint'  ? 'ini-tint'
                 : 'ini-grey';

    const sec = band(ini.key, ini.label || ini.key, body, { lead: '', className: ground });
    if (sec && ini.bg) sec.style.backgroundImage = 'url("' + ini.bg + '")';
    if (sec && ini.tint) sec.style.backgroundColor = ini.tint;

    /* A band whose ground is the work can show more than one piece of it.
       The spreads are stacked as layers and crossfaded rather than swapped
       on one element, because changing a background-image shows the bare
       ground for a frame. The scrim rides with them so type never sits on
       raw photograph. */
    if (sec && ini.bgs && ini.bgs.length) {
      const srcOf = g => (g && g.src) ? g.src : g;
      const capOf = g => (g && g.cap) ? g.cap : '';
      const layers = ini.bgs.map((g, i) =>
        `<i class="${i === 0 ? 'is-on' : ''}" data-cap="${esc(capOf(g))}"
            style="background-image:url('${srcOf(g)}')"></i>`).join('');
      const wrap = document.createElement('div');
      wrap.className = 'ini-bg';
      wrap.setAttribute('aria-hidden', 'true');
      wrap.innerHTML = layers + '<span class="ini-bg__scrim"></span>';
      sec.insertBefore(wrap, sec.firstChild);

      /* The segments are a grid row of their own, four columns wide, sitting
         above the heading. Set inside the heading's column they took its
         width; on the page's own grid they are a fixed four columns at every
         size, which is what every other measured thing here does. */
      const barRow = document.createElement('div');
      barRow.className = 'grid ini-bar-row';
      barRow.innerHTML = '<ol class="ini-bars">' + ini.bgs.map((u, i) =>
        `<li class="${i === 0 ? 'is-on' : ''}"><button type="button" data-b="${i}"
           aria-label="Spread ${i + 1} of ${ini.bgs.length}"><i></i></button></li>`).join('') + '</ol>';
      const holder = sec.querySelector('.container');
      if (holder) holder.insertBefore(barRow, holder.firstChild);

      /* The caption belongs to the photograph, so it sits along the foot of
         it rather than in the column of words — hard right, on the grid's
         last line, in the same marker the heading uses. */
      if (ini.bgs.some(g => g && g.cap)) {
        /* given its own .container so it picks up the page's gutter, and
           hung off the section so it sits at the foot of the band whatever
           the grid inside is doing */
        const row = document.createElement('div');
        row.className = 'ini-cap-row';
        row.innerHTML = '<div class="container"><p class="ini-bg-cap" data-bg-cap></p></div>';
        sec.appendChild(row);
      }
    }
    /* The height is set on the element, not left to the stylesheet. Declared
       in CSS it holds for some of these bands and not others — the ones whose
       content is shorter than the window fall back to their content height,
       while every other property in the same rule applies. An inline value is
       the one thing that is honoured every time; the phone override below is
       `!important` because it has to beat this. */
    if (sec) sec.style.setProperty('height', '100svh');
  });

  /* In situ: the instruments out in the world, doing the work. */
  if (LAB.showcaseFigures && LAB.showcaseFigures.length) {
    band('showcase', 'In situ', carousel(LAB.showcaseFigures));
  } else if (LAB.showcaseTiles && LAB.showcaseTiles.length) {
    /* A wall of tiles rather than a carousel: a department about rooms full of
       people should show rooms full of people, all at once, the way a contact
       sheet does. Each tile changes on its own clock, so the wall is never the
       same wall twice and no single picture is being argued for.

       Nothing fades until the next picture has decoded — fading up an <img>
       that has not loaded shows an empty cell for a beat, which reads as a
       hole in the wall rather than as a change. */
    band('showcase', 'In situ',
      `<div class="lab-tiles" data-tiles='${JSON.stringify(LAB.showcaseTiles)}'></div>`,
      { full: true });
    (function tiles() {
      const host = document.querySelector('.lab-tiles');
      if (!host) return;
      const SRC = JSON.parse(host.dataset.tiles);
      const narrow = matchMedia('(max-width: 52em)').matches;
      const CELLS = narrow ? 6 : 8;
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const shuffled = SRC.slice().sort(() => Math.random() - 0.5);
      const pool = shuffled.slice(CELLS);
      const cells = shuffled.slice(0, CELLS).map(src => {
        const cell = document.createElement('span');
        cell.className = 'lab-tile';
        const back = document.createElement('img');
        back.className = 'lab-tile__img lab-tile__img--back'; back.alt = '';
        const front = document.createElement('img');
        front.className = 'lab-tile__img'; front.src = src; front.alt = '';
        cell.append(back, front);
        host.appendChild(cell);
        return { front, back, current: src, busy: false };
      });
      if (reduce || !pool.length) return;
      const swap = (c) => {
        if (c.busy) return schedule(c);
        c.busy = true;
        const i = Math.floor(Math.random() * pool.length);
        const next = pool[i];
        pool[i] = c.current;
        const warm = new Image();
        warm.onload = () => {
          c.back.src = next;
          requestAnimationFrame(() => requestAnimationFrame(() => {
            c.back.style.opacity = '1';
            setTimeout(() => {
              c.front.src = next; c.back.style.opacity = '0';
              c.current = next; c.busy = false; schedule(c);
            }, 520);
          }));
        };
        warm.onerror = () => { c.busy = false; schedule(c); };
        warm.src = next;
      };
      const schedule = (c) => setTimeout(() => swap(c), 2600 + Math.random() * 2600);
      cells.forEach(c => setTimeout(() => schedule(c), Math.random() * 2000));
    })();
  } else if (LAB.showcase) {
    band('showcase', 'In situ', Array.isArray(LAB.showcase) ? list(LAB.showcase) : para(LAB.showcase));
  }

  if (LAB.references && LAB.references.length) {
    band('references', 'Citations',
      `<ol class="lab-refs">${LAB.references.map((r, i) =>
        `<li id="ref-${i + 1}">${r}</li>`).join('')}</ol>`);
  }

  /* ── Marking the citations ──
     The writing already names its sources in the running text, the way an
     essay does. This adds the number after the name and makes it a way down to
     the entry, so a reader can check a claim without losing their place — and
     the reference list stops being a decoration at the foot of the page.

     The match is made on the author's surname as it appears at the head of
     each reference, and only the first mention in a paragraph is marked: a
     number after every occurrence of "Licko" would be noise, not apparatus. */
  const wireCitations = () => {
    const list = document.querySelectorAll('.lab-refs li');
    if (!list.length) return;
    /* Two ways in. A reference is matched by its title where the prose names
       the book, and by its author's surname otherwise.

       The surname alone is not enough: an author with three books in the list
       could only ever have the first of them pointed at, because the surname is
       used up on the first match — so Oliveros's Deep Listening and two of
       Eno's three read as uncited on pages that discuss them by name. The title
       is the specific thing the prose is pointing at, so it is tried first and
       the surname is left to catch the rest. */
    const keys = [...list].map((li, i) => {
      const t = (li.textContent || '').trim();
      const m = t.match(/^([A-Z][\p{L}'’-]+)(?=,)/u);
      const cite = li.querySelector('cite');
      return { name: m ? m[1] : '', title: cite ? cite.textContent.trim() : '', n: i + 1 };
    }).filter(k => k.name || k.title);
    if (!keys.length) return;

    /* Grounds counts as prose for this purpose: it is where the evidence is
       argued, so it is where the numbers belong. A band that cites and is not
       scanned leaves its references looking unused. */
    const bodies = document.querySelectorAll(
      '.lab-band--position .lab-band__body p, .lab-band--research .lab-band__body p,' +
      ' .lab-band--grounds .lab-band__body p');

    const marked = new Set();
    const supFor = (n, label) => {
      const sup = document.createElement('sup');
      sup.className = 'lab-cite';
      const a = document.createElement('a');
      a.href = '#ref-' + n;
      a.textContent = String(n);
      a.setAttribute('aria-label', 'Reference ' + n + ', ' + label);
      sup.appendChild(a);
      return sup;
    };

    // 1. the prose names the book
    bodies.forEach(para => {
      para.querySelectorAll('cite').forEach(c => {
        const t = c.textContent.trim();
        const k = keys.find(k => k.title && k.title === t && !marked.has(k.n));
        if (!k) return;
        c.after(supFor(k.n, k.name || t));
        marked.add(k.n);
      });
    });

    // 2. and otherwise the author, once per paragraph
    bodies.forEach(para => {
      const used = new Set();
      keys.forEach(k => {
        if (!k.name || marked.has(k.n) || used.has(k.name)) return;
        const walker = document.createTreeWalker(para, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
          if (node.parentElement.closest('a, sup, cite')) continue;
          const i = node.textContent.indexOf(k.name);
          if (i < 0) continue;
          const after = node.splitText(i + k.name.length);
          after.parentNode.insertBefore(supFor(k.n, k.name), after);
          used.add(k.name);
          marked.add(k.n);
          break;
        }
      });
    });
  };
  wireCitations();


  /* A part's example plays only while it is on the screen. Three clips running
     the whole way down a page is three canvases' worth of work for a reader
     who is looking at one of them. */
  (function partVideos() {
    const vids = [...document.querySelectorAll('.lab-part__vid')];
    if (!vids.length || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(es => es.forEach(e => {
      const v = e.target;
      if (e.isIntersecting) {
        const src = v.querySelector('source[data-src]');
        if (src && !src.src) { src.src = src.dataset.src; v.load(); }
        v.play().catch(() => {});
      } else v.pause();
    }), { threshold: 0.25 });
    vids.forEach(v => io.observe(v));
  })();

  /* The instrument loads on the tap and not before. Angel starts its audio
     context as it opens, so a page with it running is a page making noise at
     somebody who came to read. */
  (function armPlay() {
    document.querySelectorAll('.lab-play').forEach(fig => {
      const frame = fig.querySelector('iframe');
      const tap   = fig.querySelector('.lab-play__tap');
      if (!frame || !tap) return;
      tap.addEventListener('click', () => {
        if (!frame.src) frame.src = frame.dataset.src;
        fig.classList.add('is-live');
        tap.remove();
      });
    });
  })();

  /* ── Where you are in the study ──
     A department runs to ten sections and a reader loses their place in it.
     The index sits directly under the hero as one line of names and sticks to
     the top of the screen from there on. The section being read is marked by a
     short rule — the same mark the dates on Record use, so the page has one
     way of saying "this one". Nothing greys out; the site has no greys.

     The bar takes its ground from the band behind it, so it is legible over
     the white sections and over In situ without a second declaration. */
  const wireIndex = () => {
    const bands = [...document.querySelectorAll('.lab-band[data-band]')];
    if (bands.length < 3) return;
    const nav = document.createElement('nav');
    nav.className = 'study-index';
    nav.setAttribute('aria-label', 'Sections');
    nav.innerHTML = '<div class="container"><ol>' + bands.map(b =>
      `<li><a href="#${b.id}">${b.getAttribute('data-band')}</a></li>`).join('') + '</ol></div>';
    /* The bar goes under the facts, not over them. A study opens with what it
       is, who made it and when — and only then offers the way down through
       the argument. Anchored to the meta band when it is there, to the hero
       when it is not. */
    const anchorEl = document.getElementById('study-meta') || document.getElementById('hero');
    if (anchorEl && anchorEl.nextSibling) anchorEl.parentNode.insertBefore(nav, anchorEl.nextSibling);
    else document.body.appendChild(nav);
    const links = [...nav.querySelectorAll('a')];

    /* A name in this bar moves you down the page; it does not teleport you.
       A hash jump lands with no sense of how far you went, and on a study —
       where the bands are the argument in order — that distance is the point.
       The offset is measured, not guessed: the fixed header and this bar both
       sit over the page, and a plain scrollIntoView puts the band's first line
       underneath them. */
    nav.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const target = document.getElementById(a.getAttribute('href').slice(1));
      if (!target) return;
      e.preventDefault();
      const header = document.querySelector('body > nav:not(.study-index)');
      const over = (header ? header.getBoundingClientRect().height : 0)
                 + nav.getBoundingClientRect().height;
      const to = Math.max(0, target.getBoundingClientRect().top + scrollY - over);
      const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
      scrollTo({ top: to, behavior: still ? 'auto' : 'smooth' });
      // the address still says where you are, without the jump the hash causes
      history.replaceState(null, '', a.getAttribute('href'));
    });

    // A band is "current" when it holds the reading line — a third of the way
    // down the screen — rather than when it merely touches the viewport, which
    // would light two of them at once on every scroll.
    let tick = false, lastN = -1;
    const mark = () => {
      tick = false;
      const line = innerHeight * 0.33;
      let n = 0;
      bands.forEach((b, i) => { if (b.getBoundingClientRect().top <= line) n = i; });
      if (n !== lastN) {
        lastN = n;
        links.forEach((a, i) => a.setAttribute('aria-current', i === n ? 'true' : 'false'));
        // keep the current name in view when the row has to scroll sideways
        const a = links[n], ol = a && a.parentNode.parentNode;
        if (a && ol.scrollWidth > ol.clientWidth + 2) {
          const ar = a.getBoundingClientRect(), or_ = ol.getBoundingClientRect();
          if (ar.left < or_.left + 8 || ar.right > or_.right - 8)
            ol.scrollTo({ left: a.offsetLeft - ol.clientWidth / 2 + a.offsetWidth / 2,
                          behavior: 'smooth' });
        }
      }
      // The bar is black wherever it is. It follows the reader the whole way
      // down the page, so it reads as one fixed piece of furniture rather than
      // something that changes colour under them — and black is the site's
      // showcase ground.
    };
    /* The header floats over the hero with no ground of its own — a difference
       blend, so the wordmark reads on any photograph. The moment this bar
       sticks, the two become one black block at the top of the screen, so the
       header drops the blend and takes the bar's ground. */
    // re-queried each time: the header is written by shared/nav.js, which may
    // not have run when this does
    const fit = () => {
      const header = document.querySelector('body > nav:not(.study-index)');
      if (!header) return;
      const h = Math.round(header.getBoundingClientRect().height);
      if (h) document.documentElement.style.setProperty('--header-h', h + 'px');
    };
    /* The header carries a difference blend so the wordmark reads on any
       photograph. A blend cannot be transitioned, and switching it off to put a
       black ground under it snapped. So the blend stays on for the whole page
       and a black scrim fades in behind the header instead: over the hero the
       wordmark blends with the picture, and once the bar sticks it blends with
       black, which is the same thing as turning white. One property animates,
       and it is opacity. */
    let scrim = document.querySelector('.nav-scrim');
    if (!scrim) {
      scrim = document.createElement('div');
      scrim.className = 'nav-scrim';
      scrim.setAttribute('aria-hidden', 'true');
      document.body.insertBefore(scrim, document.body.firstChild);
    }

    let stuck = null;
    const stick = () => {
      const top = parseFloat(getComputedStyle(nav).top) || 0;
      const isStuck = nav.getBoundingClientRect().top <= top + 1;
      if (isStuck === stuck) return;
      stuck = isStuck;
      document.body.classList.toggle('is-stuck', isStuck);
    };

    addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(() => { mark(); stick(); }); } }, { passive: true });
    addEventListener('resize', () => { fit(); mark(); stick(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    fit(); mark(); stick();
    setTimeout(fit, 250); setTimeout(fit, 900);
  };

  /* A wall fills itself, then exchanges one cell at a time out of the covers
     it is not currently showing. Nothing fades until the incoming picture has
     decoded — fading up an unloaded <img> shows an empty cell for a beat,
     which reads as a hole in the grid rather than a change in it. */
  const wireWalls = () => {
    document.querySelectorAll('[data-wall]').forEach(el => {
      const g = WALLS[+el.getAttribute('data-wall')];
      if (!g) return;
      const cells = [...el.querySelectorAll('.brady-cell')];
      const deck = g.files.slice();
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      const live = cells.map((c, i) => {
        const front = c.querySelector('.brady-cell__img--front');
        const back = c.querySelector('.brady-cell__img--back');
        const name = deck[i % deck.length];
        front.src = g.base + name;
        return { front, back, name, busy: false };
      });
      let pool = deck.slice(cells.length);
      if (!pool.length) return;                    // nothing held back to swap in

      const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (still) return;                           // a static contact sheet is fine

      let running = false;
      const swap = () => {
        if (!running || !pool.length) return;
        const idx = Math.floor(Math.random() * live.length);
        const c = live[idx];
        if (c.busy) return;
        c.busy = true;
        const pi = Math.floor(Math.random() * pool.length);
        const next = pool[pi];
        pool[pi] = c.name;                         // the one leaving goes back in
        const pre = new Image();
        pre.onload = () => {
          c.back.src = g.base + next;
          requestAnimationFrame(() => requestAnimationFrame(() => {
            c.back.style.opacity = '1';
            setTimeout(() => {
              c.front.src = g.base + next;
              c.back.style.opacity = '0';
              c.name = next;
              c.busy = false;
            }, 470);
          }));
        };
        pre.onerror = () => { c.busy = false; };
        pre.src = g.base + next;
      };

      let timer = 0;
      const start = () => { if (running) return; running = true; timer = setInterval(swap, 900); };
      const stop = () => { running = false; clearInterval(timer); };

      /* A wall off the screen is pulling pictures nobody is looking at. */
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? start() : stop()),
          { rootMargin: '200px' }).observe(el);
      } else start();
    });
  };
  wireWalls();

  /* Pressing a node runs thirty seconds through the whole mix rather than
     thirty seconds of its opening — six five-second stops spaced across the
     running time, so a preview of an hour is actually a preview of an hour.
     Mixcloud's widget API does the seeking; the player is left behind and
     playing, so anyone who wants the rest just takes over.

     Seeking is not granted on every cloudcast. When `seek` comes back false
     the run is abandoned and the mix is left playing from where it is,
     which is the old behaviour and still useful. */
  const MIX_API = 'https://widget.mixcloud.com/media/js/widgetApi.js';
  let apiReady = null;
  const mixcloudApi = () => {
    if (window.Mixcloud) return Promise.resolve(window.Mixcloud);
    if (apiReady) return apiReady;
    apiReady = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = MIX_API;
      s.onload = () => res(window.Mixcloud);
      s.onerror = () => rej(new Error('widget api blocked'));
      document.head.appendChild(s);
    });
    return apiReady;
  };

  const wireNodes = () => {
    document.querySelectorAll('.mu-field').forEach(field => {
      const host = field.querySelector('[data-mu-player]');
      const STOPS = 6, HOLD = 5000;
      let timer = 0, token = 0, playing = null, widget = null;

      const clear = () => {
        clearTimeout(timer);
        field.querySelectorAll('.is-on').forEach(n => n.classList.remove('is-on'));
        playing = null;
      };

      const stop = () => {
        token++;                                   // orphan any run in flight
        clearTimeout(timer);
        if (widget) { try { widget.pause(); } catch (e) {} }
        clear();
      };

      const open = (g) => {
        const mine = ++token;                      // a later press cancels this one
        clearTimeout(timer);
        field.querySelectorAll('.is-on').forEach(n => n.classList.remove('is-on'));
        g.classList.add('is-on');
        playing = g;

        const key = g.getAttribute('data-k');
        const mins = +g.getAttribute('data-m') || 0;

        /* a fresh iframe each time: rebinding the widget API to a frame
           whose feed has changed underneath it does not reliably work */
        host.innerHTML = '';
        const frame = document.createElement('iframe');
        frame.setAttribute('allow', 'autoplay');
        frame.setAttribute('title', 'Mu Radio audio');
        frame.src = 'https://www.mixcloud.com/widget/iframe/?hide_cover=1&light=1&autoplay=1&feed=' +
                    encodeURIComponent(key);
        host.appendChild(frame);

        mixcloudApi().then(M => {
          if (token !== mine) return;
          const w = M.PlayerWidget(frame);
          widget = w;
          /* the mix ending, or the listener stopping it in the widget,
             has to take the pause icon off the node */
          try { w.events.ended.on(() => { if (token === mine) clear(); }); } catch (e) {}
          try { w.events.pause.on(() => { if (token === mine) clearTimeout(timer); }); } catch (e) {}
          return w.ready.then(() => {
            if (token !== mine) return;
            const total = mins * 60;
            let i = 0;
            const step = () => {
              if (token !== mine) return;
              if (i >= STOPS) return;              // left playing where it landed
              /* spread across the body of the mix, never the last scrap of it */
              const frac = 0.04 + (0.84 - 0.04) * (i / (STOPS - 1));
              i++;
              Promise.resolve(w.seek(Math.round(total * frac))).then(ok => {
                if (token !== mine || ok === false) return;
                timer = setTimeout(step, HOLD);
              }).catch(() => {});
            };
            return Promise.resolve(w.play()).then(step).catch(step);
          });
        }).catch(() => {});
      };

      field.querySelectorAll('.mu-node, .mu-row').forEach(g => {
        const hit = () => { (playing === g) ? stop() : open(g); };
        g.addEventListener('click', hit);
        g.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hit(); }
        });
      });
    });
  };
  /* One voice at a time. The segment above fills over the dwell, and the
     run pauses while it is off the screen or under the pointer — a quote
     that changes while someone is reading it is worse than no quote. */
  const wireQuotes = () => {
    document.querySelectorAll('[data-q-solo]').forEach(box => {
      const items = [...box.querySelectorAll('.q-item')];
      const bars = [...box.querySelectorAll('.q-bar')];
      if (items.length < 2) return;
      const DWELL = 7000;
      let at = 0, timer = 0, held = false, seen = true;

      const show = (n) => {
        at = (n + items.length) % items.length;
        items.forEach((el, i) => {
          el.classList.toggle('is-on', i === at);
          if (i === at) el.removeAttribute('aria-hidden');
          else el.setAttribute('aria-hidden', 'true');
        });
        bars.forEach((b, i) => {
          b.classList.remove('is-on', 'is-done');
          if (i < at) b.classList.add('is-done');
        });
        /* restarting a CSS animation needs the class off, a reflow, then on */
        const cur = bars[at];
        if (cur) { void cur.offsetWidth; cur.classList.add('is-on'); }
      };

      const tick = () => {
        clearTimeout(timer);
        if (held || !seen) return;
        timer = setTimeout(() => { show(at + 1); tick(); }, DWELL);
      };

      bars.forEach((b, i) => b.addEventListener('click', () => { show(i); tick(); }));
      box.addEventListener('mouseenter', () => { held = true; clearTimeout(timer); });
      box.addEventListener('mouseleave', () => { held = false; tick(); });

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(es => es.forEach(e => {
          seen = e.isIntersecting; seen ? tick() : clearTimeout(timer);
        }), { threshold: 0.2 }).observe(box);
      }
      show(0); tick();
    });
  };

  /* Hovering or pressing a name lifts its line out of the thicket; pressing it
     again puts it back. The tabs swap the dataset without redrawing anything. */
  const wireCharts = () => {
    document.querySelectorAll('.ch').forEach(ch => {
      const focus = (panel, ri, open) => {
        panel.querySelectorAll('.ch-line, .ch-key').forEach(n =>
          n.classList.toggle('is-on', ri !== null && +n.dataset.row === ri));
        ch.classList.toggle('is-focus', ri !== null);
        /* the card only opens on a press, never on a hover — a panel that
           appears and disappears under the pointer is unreadable */
        const det = panel.querySelector('[data-detail]') || panel._det;
        if (!det) return;
        panel._det = det;
        if (open && ri !== null) {
          const key = panel.querySelector(`.ch-key[data-row="${ri}"]`);
          /* On a phone the card belongs to the row that opened it — an overlay
             on the plot would cover the plot, and a panel at the foot of a
             twelve-row list is nowhere near the name you pressed. So it moves
             into the row and reads as an accordion. */
          if (window.matchMedia('(max-width:40em)').matches) {
            if (key && det.parentElement !== key) key.appendChild(det);
            det.classList.add('is-inline');
          } else {
            const plot = panel.querySelector('.ch-plot') || panel;
            if (det.parentElement !== plot) plot.appendChild(det);
            det.classList.remove('is-inline');
          }
          det.hidden = false;
          det.querySelectorAll('.ch-card').forEach(c => { c.hidden = +c.dataset.card !== ri; });
          if (key) det.style.setProperty('--ink', getComputedStyle(key).getPropertyValue('--ink'));
        } else if (open === true || ri === null) {
          det.hidden = true;
        }
      };
      /* the rail under the plot: only drawn where the plot overflows, which
         is the phone. Passive listener — it must never fight the scroll. */
      ch.querySelectorAll('.ch-panel').forEach(panel => {
        const sc = panel.querySelector('.ch-scroll');
        const rail = panel.querySelector('[data-rail]');
        if (sc && rail) {
          const bar = rail.querySelector('i');
          const sync = () => {
            const over = sc.scrollWidth - sc.clientWidth;
            rail.classList.toggle('is-on', over > 8);
            if (over <= 8) return;
            const frac = sc.clientWidth / sc.scrollWidth;
            bar.style.width = (frac * 100).toFixed(2) + '%';
            bar.style.left = ((sc.scrollLeft / sc.scrollWidth) * 100).toFixed(2) + '%';
            rail.classList.toggle('is-end', sc.scrollLeft >= over - 4);
          };
          sc.addEventListener('scroll', sync, { passive: true });
          window.addEventListener('resize', sync);
          sync();
          /* the drawing is only in the DOM once the band has been reached, and
             on a phone the band is below the fold, so measure again on sight */
          if ('IntersectionObserver' in window) {
            new IntersectionObserver((es) => { if (es.some(e => e.isIntersecting)) sync(); })
              .observe(panel);
          }
        }
      });
      ch.querySelectorAll('.ch-panel').forEach(panel => {
        let held = null;
        const keys = [...panel.querySelectorAll('.ch-key')];
        const lines = [...panel.querySelectorAll('.ch-line')];
        /* A press on a row in the ticker closes it again — those are discrete
           targets, and on a phone the card opens inside the row, where closing
           by pressing the row back is what an accordion does. A press on the
           plot only ever opens: a line is a thin thing in a crowd of thin
           things, and a near-miss that shut the card read as it closing by
           itself. Either way the close and Escape always work. */
        const bind = (nodes, toggles) => nodes.forEach(n => {
          const ri = +n.dataset.row;
          n.addEventListener('mouseenter', () => { if (held === null) focus(panel, ri, false); });
          n.addEventListener('mouseleave', () => { if (held === null) focus(panel, null, false); });
          n.addEventListener('click', () => {
            held = (toggles && held === ri) ? null : ri;
            focus(panel, held, true);
          });
        });
        bind(keys, true); bind(lines, false);
        /* a subject opens inside its family; one at a time, so the card stays
           a readable length however many subjects the family holds */
        panel.querySelectorAll('.ch-subs > li > button').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const li = btn.parentElement, open = li.classList.contains('is-open');
            /* `:scope >` — the evidence inside an open subject is a list of
               `li` too, and without it they get swept up and asked to close */
            li.closest('.ch-subs').querySelectorAll(':scope > li').forEach(o => {
              o.classList.remove('is-open');
              o.querySelector('.ch-subs__d').hidden = true;
              o.querySelector(':scope > button').setAttribute('aria-expanded', 'false');
            });
            if (!open) {
              li.classList.add('is-open');
              li.querySelector('.ch-subs__d').hidden = false;
              btn.setAttribute('aria-expanded', 'true');
            }
          });
        });
        /* The band under the chart is a shortcut into the cards: press a topic
           and its family opens with that subject already expanded, so the
           definition and the eight quotations come from the one place that
           holds them rather than being written out twice. */
        panel.querySelectorAll('.ch-top__b').forEach(btn => {
          btn.addEventListener('click', () => {
            const ri = +btn.dataset.topRow, si = +btn.dataset.topSub;
            held = ri;
            focus(panel, ri, true);
            const det = panel.querySelector('[data-detail]') || panel._det;
            const card = det && det.querySelector(`.ch-card[data-card="${ri}"]`);
            const sub = card && card.querySelectorAll('.ch-subs > li')[si];
            const sb = sub && sub.querySelector(':scope > button');
            if (sb && !sub.classList.contains('is-open')) sb.click();
            if (sub) sub.scrollIntoView({ block: 'nearest' });
          });
        });
        const close = () => { held = null; focus(panel, null, true); };
        panel.querySelectorAll('.ch-card__x').forEach(btn =>
          btn.addEventListener('click', e => { e.stopPropagation(); close(); }));
        document.addEventListener('keydown', e => {
          if (e.key === 'Escape' && held !== null) close();
        });
      });
      ch.querySelectorAll('.ch-tabs button').forEach(btn => {
        btn.addEventListener('click', () => {
          const i = +btn.dataset.tab;
          ch.querySelectorAll('.ch-tabs button').forEach(b =>
            b.classList.toggle('is-on', +b.dataset.tab === i));
          ch.querySelectorAll('.ch-panel').forEach(p =>
            p.classList.toggle('is-on', +p.dataset.panel === i));
          ch.classList.remove('is-focus');
          ch.querySelectorAll('.is-on.ch-line, .is-on.ch-key').forEach(n => n.classList.remove('is-on'));
        });
      });
    });
  };
  wireCharts();

  wireQuotes();

  /* The grounds change on the same clock the voices use. Same reasons too:
     it holds while the pointer is on the band, and it does not run at all
     while the band is off the screen. */
  const wireGrounds = () => {
    document.querySelectorAll('.ini-bg').forEach(bgWrap => {
      const sec = bgWrap.closest('.lab-band');
      const layers = [...bgWrap.querySelectorAll('i')];
      const bars = sec ? [...sec.querySelectorAll('.ini-bars li')] : [];
      if (layers.length < 2) return;
      const DWELL = 5000;
      let at = 0, timer = 0, held = false, seen = true;

      const cap = sec ? sec.querySelector('[data-bg-cap]') : null;
      const show = (n) => {
        at = (n + layers.length) % layers.length;
        layers.forEach((el, i) => el.classList.toggle('is-on', i === at));
        /* innerHTML, not textContent: a caption may italicise a title, and
           the attribute it comes from was escaped on the way in */
        if (cap) {
          const t = layers[at].getAttribute('data-cap') || '';
          cap.innerHTML = t ? '<mark class="hl">' + t + '</mark>' : '';
        }
        bars.forEach((b, i) => {
          b.classList.remove('is-on', 'is-done');
          if (i < at) b.classList.add('is-done');
        });
        const cur = bars[at];
        if (cur) { void cur.offsetWidth; cur.classList.add('is-on'); }
      };
      const tick = () => {
        clearTimeout(timer);
        if (held || !seen) return;
        timer = setTimeout(() => { show(at + 1); tick(); }, DWELL);
      };
      bars.forEach((b, i) => {
        const btn = b.querySelector('button');
        if (btn) btn.addEventListener('click', () => { show(i); tick(); });
      });
      if (sec) {
        sec.addEventListener('mouseenter', () => { held = true; clearTimeout(timer); });
        sec.addEventListener('mouseleave', () => { held = false; tick(); });
        if ('IntersectionObserver' in window) {
          new IntersectionObserver(es => es.forEach(e => {
            seen = e.isIntersecting; seen ? tick() : clearTimeout(timer);
          }), { threshold: 0.15 }).observe(sec);
        }
      }
      show(0); tick();
    });
  };
  wireGrounds();

  wireNodes();

  wireCarousel();
  wireTimeline();
  wireIndex();
  wireVideo();
  wireSound();




  /* ── The instruments wake as you reach them ───────────────────────────────
     Every rig holds its src in data-src until it is about a screen and a half
     away, so arriving at the page costs one instrument, not four. Once woken a
     rig stays woken: an instrument you have set up and scrolled past should be
     where you left it when you come back. */
  (function rigs() {
    const frames = [...document.querySelectorAll('.lab-rig iframe[data-src]')];
    if (!frames.length) return;
    const wake = f => {
      if (!f.dataset.src) return;
      f.removeAttribute('loading');
      f.src = f.dataset.src;
      delete f.dataset.src;
    };
    if (!('IntersectionObserver' in window)) { frames.forEach(wake); return; }
    const io = new IntersectionObserver((es, o) => {
      es.forEach(e => { if (e.isIntersecting) { wake(e.target); o.unobserve(e.target); } });
    }, { rootMargin: '150% 0px' });
    frames.forEach(f => io.observe(f));
  })();

  /* ── Reading progress: a rainbow rule across the top that fills as you read ── */
  (function progress() {
    const bar = document.createElement('div');
    bar.className = 'lab-progress';
    bar.innerHTML = '<span class="lab-progress__fill"></span>';

    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    const fill = bar.firstChild;
    let tick = false;
    const run = () => {
      tick = false;
      const h = document.documentElement.scrollHeight - innerHeight;
      const p = h > 0 ? Math.min(1, Math.max(0, scrollY / h)) : 0;
      /* Width, not scaleX: a scaled element stretches its background with it,
         so the rainbow would be squeezed into the first tenth of the bar at the
         top of the page and pulled apart by the bottom. Changing the width
         uncovers a gradient that is already the full width and never moves. */
      fill.style.width = (p * 100).toFixed(3) + '%';
    };
    addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(run); } }, { passive: true });
    addEventListener('resize', run);
    run();
  })();

    /* ── Shared scripts: appended last, after the study is in the document ── */
    [
      '/workshops/bgsu/shared/tool-overlay.js',
      '/workshops/bgsu/shared/footer.js',
      '/workshops/bgsu/shared/grid.js',
      '/workshops/bgsu/shared/cursor.js',
      '/workshops/bgsu/shared/animate.js?v=20261009B'
    ].forEach(src => {
      const s = document.createElement('script');
      s.src = src;
      document.body.appendChild(s);
    });


  }   // end render

  /* The .txt beside this study holds its words. Fetch it, let it replace what
     the .js carries, then draw — so the page never flashes the older copy. */
  const slug = (location.pathname.match(/\/lab\/([^/]+)\/?$/) || [])[1];
  if (slug) {
    fetch('/workshops/bgsu/content/lab/' + slug + '.txt', { cache: 'no-store' })
      .then(r => (r.ok ? r.text() : null))
      .then(txt => { if (txt) Object.assign(LAB, parseStudyText(txt)); })
      .catch(() => {})
      .then(render);
  } else {
    render();
  }

})();
