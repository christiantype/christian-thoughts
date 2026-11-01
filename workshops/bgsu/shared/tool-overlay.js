/* ── OPL Tool Overlay ──────────────────────────────────────────────────────────
   A tool opens over the page it was opened from, not as a separate destination.
   The reader stays where they were: close it and the page is still behind, at
   the same scroll position.

   It claims:
     • any [data-tool="<url>"] button (the tool cards in a Lab case study)
     • any <a data-overlay href="…">
     • any <a href> pointing at /lab/tools/… (the public instruments)
     • on the workbench, every .tool-tile

   Escape, the close button, or a click on the surround dismisses it. ⌘/ctrl or
   middle click still opens the tool in its own tab, which is what those
   modifiers are for.
*/
/* shared/lab.js appends this file to every study after rendering, and several
   pages also carry their own <script src> for it. Evaluated twice, the IIFE
   used to build a second dialog with its own bar and its own click handler —
   two identical breadcrumbs stacked above the tool. One page, one overlay. */
if (window.ToolOverlay) { /* already installed */ } else {
window.ToolOverlay = (function () {
  const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  let ov, stage, nameEl, whereEl, lastFocus;

  function build() {
    if (ov) return ov;
    document.querySelectorAll('.lab-ov').forEach(n => n.remove());
    ov = document.createElement('div');
    ov.className = 'lab-ov';
    ov.setAttribute('aria-hidden', 'true');
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    // focusable without being a tab stop, so opening can move focus into the
    // dialog without ringing a button that nobody pressed
    ov.setAttribute('tabindex', '-1');
    // A page can ask for the overlay without its breadcrumb bar. The workbench
    // does: the tool loaded underneath already names itself in its own subhead
    // ("Flash · A roll of names, set in Eunuverse"), so the bar was a second
    // header saying the same thing. Only the close mark is kept, floated over
    // the top-right. A study still gets the bar — there the crumb says which
    // study the instrument was opened from, which the tool cannot say itself.
    const bare = document.body.getAttribute('data-overlay-chrome') === 'none';
    if (bare) ov.classList.add('lab-ov--bare');
    ov.innerHTML =
      (bare ? '' :
      '<div class="lab-ov__bar"><div class="lab-ov__barrow">' +
        '<span class="lab-ov__name">Research <span class="lab-ov__slash">/</span> <i class="lab-ov__where"></i><b></b></span>') +
        // A drawn cross, not the × character: the glyph's box is taller than its
        // ink and sits high in it, so a text × centred by its box floats above
        // the line it is supposed to sit on. Two lines in a square are centred
        // because they are drawn centred.
        '<button class="lab-ov__close" type="button" aria-label="Close">' +
          '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">' +
            '<path d="M3 3l10 10M13 3L3 13" fill="none" stroke="currentColor" ' +
            'stroke-width="1.4" stroke-linecap="round"/></svg></button>' +
      (bare ? '' : '</div></div>') +
      '<div class="lab-ov__stage"></div>';
    document.body.appendChild(ov);
    stage   = ov.querySelector('.lab-ov__stage');
    nameEl  = ov.querySelector('.lab-ov__name b');     // null when bare
    whereEl = ov.querySelector('.lab-ov__where');
    ov.querySelector('.lab-ov__close').addEventListener('click', close);
    ov.addEventListener('click', e => { if (e.target === ov) close(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && ov.classList.contains('is-open')) close();
    });
    return ov;
  }

  /* The study this tool was opened from, so the path reads
     Research / Typography New.0 / VoiceType. A tool opened from somewhere with
     no title of its own just reads Lab / <tool>. */
  function where() {
    // A page can name itself. The workbench must: its heading is two lines of
    // markup that run together as text ("Original Practice The Lab"), and a
    // glitch animation rewrites that heading every few seconds — read it at the
    // wrong moment and the crumb says "ORIG#NA/ PR%CT<CE".
    const d = (document.body.getAttribute('data-crumb') || '').trim();
    if (d) return d;
    const h = document.querySelector('#hero h1, h1');
    const t = h ? (h.textContent || '').replace(/\s+/g, ' ').trim() : '';
    return t && t.toLowerCase() !== 'lab' ? t : '';
  }

  function open(url, name, fromHistory) {
    build();
    /* A tool opened over the workbench is still a place: give it its own
       address so it can be linked, bookmarked and sent to someone, and so the
       back button closes it instead of leaving the site. The URL is the tool's
       own page, which exists and renders standalone, so a reload or a pasted
       link lands on the instrument either way. */
    if (!fromHistory) {
      try { history.pushState({ tool: url, name: name || '' }, '', url); } catch (e) {}
    }
    lastFocus = document.activeElement;
    const w = where();
    if (whereEl) whereEl.innerHTML = w
      ? esc(w) + ' <span class="lab-ov__slash">/</span> '
      : '';
    if (nameEl) nameEl.textContent = name || '';
    // ?embed=1 strips the tool page back to the instrument — no nav, no hero,
    // no credits, no footer. An overlay should not contain a whole second page.
    // the dev server 301s a .html path to its extensionless form and drops the
    // query string with it, so strip the extension before adding the flag
    const clean = url.replace(/\.html(?=$|[?#])/, '');
    const src = clean + (clean.indexOf('?') >= 0 ? '&' : '?') + 'embed=1';
    stage.innerHTML = '<iframe src="' + src + '" title="' + (name || 'Tool') + '"></iframe>';
    ov.classList.add('is-open');
    ov.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
    /* Focus the dialog, not its close button. Focusing the × drew the
       browser's ring around it every time a tool was tapped open — a black box
       on the bar that nobody asked for. The dialog still takes focus, so a
       keyboard is not left behind the page. */
    ov.focus({ preventScroll: true });
  }

  function doClose() {
    if (!ov) return;
    ov.classList.remove('is-open');
    ov.setAttribute('aria-hidden', 'true');
    stage.innerHTML = '';                       // stop the instrument's animation loop
    document.documentElement.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* Closing walks the history back rather than closing outright: the address
     has to come off with the overlay, and going back is also what the browser's
     own back button does, so both routes end in the same place. */
  function close() {
    if (ov && ov.classList.contains('is-open') &&
        history.state && history.state.tool) { history.back(); return; }
    doClose();
  }

  window.addEventListener('popstate', function (e) {
    const st = e.state;
    if (st && st.tool) open(st.tool, st.name, true);
    else doClose();
  });

  /* Which links are tools. Case studies also live at /lab/<slug>/, so a bare
     path is not enough — a study is never a tool. */
  const STUDIES = [
    'typography-new-0', 'meditation-as-creative-practice',
    'community-from-the-inside-out', 'archive-and-the-humanities',
    'sound-as-design', 'photography-as-connection'
  ];

  function toolHref(a) {
    if (a.hasAttribute('data-overlay')) return a.getAttribute('href');
    const href = a.getAttribute('href') || '';
    if (/^https?:|^mailto:|^tel:|^#/.test(href)) return null;
    if (href.indexOf('/workshops/bgsu/lab/tools/') === 0) return href;
    // Every instrument lives at /lab/workbench/<slug>/ now. That is two path
    // segments, which the single-segment match below was never going to catch,
    // and a tool linked from a case study rather than from a tile would have
    // navigated away from the study instead of opening over it.
    if (href.indexOf('/workshops/bgsu/lab/workbench/') === 0) return href;
    if (a.classList.contains('tool-tile')) return href;
    const m = href.match(/^\/lab\/([^/?#]+)\/?$/);
    if (m && STUDIES.indexOf(m[1]) === -1 &&
        ['tools', 'shared', 'workbench.html', 'images'].indexOf(m[1]) === -1) return href;
    return null;
  }

  function label(el) {
    // .tool-tile__title first: a workbench tile opens with its catalogue number,
    // so falling through to textContent named every tool "OP-LAB-040".
    const t = el.getAttribute('data-name') ||
              (el.querySelector('.tool-tile__title, .tool-tile__name, h2, h3, .lab-tool__name') || {}).textContent ||
              el.textContent || '';
    return t.replace(/\s+/g, ' ').trim().slice(0, 60);
  }

  document.addEventListener('click', e => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    // A control can sit inside a tool link without being the way in — the
    // workbench puts an add/remove mark on each row. This listener is on the
    // capture phase, so without an opt-out it would swallow that click before
    // the control's own handler ever saw it.
    if (e.target.closest && e.target.closest('[data-no-overlay]')) return;

    const btn = e.target.closest('[data-tool]');
    if (btn) { e.preventDefault(); open(btn.getAttribute('data-tool'), btn.getAttribute('data-name') || label(btn)); return; }

    const a = e.target.closest('a[href]');
    if (!a || a.target === '_blank') return;
    const href = toolHref(a);
    if (!href) return;
    e.preventDefault();
    e.stopPropagation();                        // nav.js also intercepts clicks for page transitions
    open(href, label(a));
  }, true);                                     // capture, so this runs before the transition handler

  return { open: open, close: close };
})();
}
