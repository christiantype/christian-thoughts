/* ── OPL Shared Footer ── */
/* Edit contact info, address, and social links here */

/* The mark, not the name spelled out. */
const OPAL_MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="155.3 212.9 1285.8 186.2" fill="currentColor" role="img"><title>OP/AL</title><path d="M1356.2,353.2h72.1v-13h-59.1v-100.6h-13v113.5ZM1077.3,313.7l13.5-61.1h10.6l13.3,61.1h-37.5ZM1055.3,353.2h13.3l5.8-26.5h43.3l5.8,26.5h13.3l-25.2-113.5h-30.6l-25.6,113.5ZM723.6,398.3h37.2l111.9-184.5h-37.2l-111.9,184.5ZM478.1,296.2v-43.6h28.1c5.9,0,8.3.9,13,4.7,5.2,4.3,5.9,6.1,5.9,10.6v13c0,4.5-.7,6.3-5.9,10.6-4.7,3.8-7,4.7-13,4.7h-28.1ZM465.1,353.2h13v-44h28.1c9.4,0,14.2-2,22.5-9,8.3-7,9.4-10.3,9.4-18.6v-14.4c0-8.3-1.1-11.5-9.4-18.6-8.3-7-13.2-9-22.5-9h-41.1v113.5ZM199.1,340.2h-11.9c-5.9,0-8.3-.9-13-4.7-5.2-4.3-5.9-6.1-5.9-10.6v-57c0-4.5.7-6.3,5.9-10.6,4.7-3.8,7-4.7,13-4.7h11.9c5.9,0,8.5.9,13.2,4.7,5,4.1,5.8,6.1,5.8,10.6v57c0,4.5-.7,6.5-5.8,10.6-4.7,3.8-7.2,4.7-13.2,4.7M187.2,353.2h11.9c9.4,0,14.2-2,22.5-9,8.3-7,9.4-10.3,9.4-18.6v-58.4c0-8.3-1.1-11.5-9.4-18.6-8.3-7-13.2-9-22.5-9h-11.9c-9.4,0-14.2,2-22.5,9-8.3,7-9.4,10.3-9.4,18.6v58.4c0,8.3,1.1,11.5,9.4,18.6,8.3,7,13.2,9,22.5,9"/></svg>`;
// the count and the year, nothing else — the mark is already set once above,
// in the call to action, and twice in one footer is once too many
const FOOTER_MARK = `<span id="vc-n">—</span><br>Since 2026`;
const FOOTER_COL1 = FOOTER_MARK;
const FOOTER_COL2 = `708.427.9188<br>hi<span style="color:var(--color-accent);">@</span>opal.design<a href="https://www.instagram.com/this.is.opal/" target="_blank" rel="noopener" aria-label="OP/AL on Instagram" style="display:inline-flex;vertical-align:middle;margin-left:9px;color:inherit;"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2.6" y="2.6" width="18.8" height="18.8" rx="5"/><circle cx="12" cy="12" r="4.1"/><circle cx="17.4" cy="6.6" r="1.15" fill="currentColor" stroke="none"/></svg></a><a href="https://www.linkedin.com/company/original-practice-applied-learning" target="_blank" rel="noopener" aria-label="OP/AL on LinkedIn" style="display:inline-flex;vertical-align:middle;margin-left:9px;color:inherit;"><svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>`;
const FOOTER_COL3 = `1029 Lake Street Suite 104<br>Oak Park IL 60301`;

/* Path to the footer wordmark SVG — drop opl-footer.svg at the project root */
const FOOTER_SVG = 'opl-footer.svg';

(function () {
  /* An instrument embedded in a study is a picture, not a page: it has no foot
     of its own, and the site's does not belong inside someone else's frame.
     The gradient rule was landing at the top of the tool's fixed layout — a
     pink hairline above the artwork — and the call to action was duplicating
     the one already at the foot of the study. Both stay out of an embed. */
  if (/[?&]embed=1/.test(window.location.search)) return;

  const inProject = window.location.pathname.includes('/workshops/bgsu/artifact/');
  const base = inProject ? '../' : '';

  /* ── Gradient bar ── */
  const bar = document.createElement('div');
  bar.style.cssText = 'position:relative;z-index:10;height:3px;background:linear-gradient(90deg,var(--color-dark),var(--color-accent),var(--color-light),var(--color-dark),var(--color-accent),var(--color-light),var(--color-dark));background-size:300% 100%;animation:footer-gradient 8s linear infinite;';
  document.body.appendChild(bar);

  /* Inject keyframe once */
  if (!document.getElementById('footer-gradient-style')) {
    const s = document.createElement('style');
    s.id = 'footer-gradient-style';
    s.textContent = '@keyframes footer-gradient{0%{background-position:100% 0}100%{background-position:0% 0}}@keyframes vc-blink{0%,50%{opacity:1}51%,100%{opacity:0}}#vc-pipe{animation:vc-blink 1.1s steps(1) infinite}@media (prefers-reduced-motion:reduce){#vc-pipe{animation:none}}';
    document.head.appendChild(s);
  }

  /* ── The footer sits on the thermal field ──
     The heat pad used to be the homepage hero. It reads better as the ground the
     page ends on: a half-viewport band at the bottom of every page that warms
     where people move through it. The footer's own content sits on top of it. */
  const band = document.createElement('div');
  band.className = 'footer-thermal';
  document.body.appendChild(band);

  /* ── The call to action, above the three columns ── */
  const cta = document.createElement('div');
  cta.className = 'footer-cta';
  cta.setAttribute('data-no-reveal', '');   // the mark does not fade in
  cta.innerHTML = `
    <div class="container">
      <div class="grid">
        <div class="footer-cta__col">
          <p class="footer-cta__line"><span class="footer-cta__mark" role="img" aria-label="OP/AL">${OPAL_MARK}</span></p>
          <div class="footer-cta__acts">
            <a class="footer-cta__btn" href="/workshops/bgsu/inquire.html">Inquire</a>
            <a class="footer-cta__btn" href="/workshops/bgsu/apply.html">Apply</a>
          </div>
        </div>
      </div>
    </div>
  `;

  /* ── 3-column footer ── */
  const footer = document.createElement('footer');
  footer.style.cssText = 'position:relative;z-index:10;padding-top:var(--space-8);padding-bottom:var(--space-8);';
  footer.innerHTML = `
    <div class="container">
      <div class="grid footer-grid" style="align-items:start;text-align:center;">
        <div class="col-4" style="font-size:var(--body);line-height:var(--leading-loose);color:var(--color-ink);">${FOOTER_COL1}</div>
        <div class="col-4" style="font-size:var(--body);line-height:var(--leading-loose);color:var(--color-ink);">${FOOTER_COL3}</div>
        <div class="col-4" style="font-size:var(--body);line-height:var(--leading-loose);color:var(--color-ink);">${FOOTER_COL2}</div>
      </div>
    </div>
  `;
  band.appendChild(cta);
  band.appendChild(footer);

  /* ── Wordmark SVG — spans full viewport width ── */
  const wm = document.createElement('div');
  wm.style.cssText = 'position:relative;z-index:10;line-height:0;padding:0;margin:0;margin-bottom:0px;pointer-events:none;user-select:none;';
  wm.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1137.52 29.84" fill="#e6e6e5" style="display:block;width:100%;height:auto;"><path d="M1129.48,24.11h4.9c1.75,0,3.15-1.43,3.15-3.15v-4.43h-1.25v4.4c0,1.11-.85,1.95-1.95,1.95h-4.84c-1.11,0-1.95-.87-1.95-1.95v-5.83c0-.47.12-.99.23-1.31l2.51-5.68c.29-.61.99-1.14,1.78-1.14h5.48v-1.22h-5.48c-1.6,0-2.45.82-3.09,2.3l-2.53,5.63c-.06.32-.12,1.08-.12,1.54v5.74c0,1.75,1.43,3.15,3.18,3.15M1089.85,24.11h1.19v-15.94h.82l6.76,15.94h2.45V5.75h-1.19v16.03h-.82l-6.79-16.03h-2.42v18.36ZM1063.17,24.11h1.22V5.75h-1.22v18.36ZM1026.45,24.11h1.19v-15.94h.82l6.76,15.94h2.45V5.75h-1.2v16.03h-.82l-6.79-16.03h-2.42v18.36ZM991.48,14.58v-7.61h5.25c1.25,0,1.75.2,2.71.96,1.11.87,1.22,1.22,1.22,2.13v1.43c0,.9-.15,1.25-1.22,2.13-.96.76-1.46.96-2.71.96h-5.25ZM990.25,24.11h1.22v-8.31h4.37l4.75,8.31h1.43l-4.72-8.34c1.17-.09,1.92-.47,3.06-1.43,1.34-1.14,1.52-1.66,1.52-3v-1.14c0-1.34-.18-1.86-1.52-3-1.34-1.14-2.13-1.46-3.64-1.46h-6.47v18.36ZM955.57,18.31l2.77-11.34h2.13l2.71,11.34h-7.61ZM952.85,24.11h1.31l1.11-4.58h8.19l1.08,4.58h1.28l-4.52-18.36h-3.88l-4.58,18.36ZM917.57,24.11h11.31v-1.22h-10.09v-7.69h8.66v-1.22h-8.66v-7h10.09v-1.22h-11.31v18.36ZM881.92,24.11h11.22v-1.22h-10V5.75h-1.22v18.36ZM825.63,22.89h-5.6V6.92h5.6c.82,0,1.51.52,1.84,1.17l2.62,5.33c.17.38.32.96.32,1.49,0,.49-.15,1.17-.32,1.51l-2.62,5.28c-.29.61-.96,1.19-1.84,1.19M818.81,24.11h6.85c1.46,0,2.21-.64,2.94-2.04l2.65-5.25c.23-.5.38-1.17.38-1.87s-.15-1.49-.38-1.95l-2.65-5.28c-.64-1.31-1.49-2.01-2.94-2.01h-6.85v18.39ZM782.58,24.11h11.31v-1.22h-10.09v-7.69h8.66v-1.22h-8.66v-7h10.09v-1.22h-11.31v18.36ZM755.89,24.11h1.22V5.75h-1.22v18.36ZM720.24,24.11h11.22v-1.22h-10V5.75h-1.22v18.36ZM684.78,15.34V6.98h5.07c1.25,0,1.75.2,2.71.96,1.11.87,1.22,1.22,1.22,2.13v2.19c0,.9-.15,1.25-1.22,2.13-.96.76-1.46.96-2.71.96h-5.07ZM683.56,24.11h1.22v-7.55h5.07c1.52,0,2.3-.32,3.64-1.46,1.34-1.14,1.52-1.66,1.52-3v-1.89c0-1.34-.18-1.86-1.52-3-1.34-1.14-2.13-1.46-3.64-1.46h-6.3v18.36ZM648.1,15.34V6.98h5.07c1.25,0,1.75.2,2.71.96,1.11.87,1.22,1.22,1.22,2.13v2.19c0,.9-.15,1.25-1.22,2.13-.96.76-1.46.96-2.71.96h-5.07ZM646.88,24.11h1.22v-7.55h5.07c1.52,0,2.3-.32,3.64-1.46,1.34-1.14,1.52-1.66,1.52-3v-1.89c0-1.34-.18-1.86-1.52-3-1.34-1.14-2.13-1.46-3.64-1.46h-6.3v18.36ZM612.19,18.31l2.77-11.34h2.13l2.71,11.34h-7.61ZM609.48,24.11h1.31l1.11-4.58h8.19l1.08,4.58h1.28l-4.52-18.36h-3.88l-4.58,18.36ZM564.75,29.84h4.69l18.09-29.84h-4.69l-18.09,29.84ZM532.27,24.11h11.31v-1.22h-10.08v-7.69h8.66v-1.22h-8.66v-7h10.08v-1.22h-11.31v18.36ZM501.61,24.11h5.83v-1.22h-5.86c-.87,0-1.55-.64-1.81-1.19l-2.62-5.31c-.18-.35-.32-.93-.32-1.46s.15-1.14.35-1.52l2.59-5.33c.29-.58,1.02-1.14,1.81-1.14h5.86v-1.22h-5.83c-1.46,0-2.33.76-2.97,2.01l-2.65,5.28c-.23.49-.38,1.25-.38,1.92s.15,1.37.41,1.89l2.62,5.25c.7,1.34,1.49,2.04,2.97,2.04M469.98,24.11h1.22V5.75h-1.22v18.36ZM439.42,24.11h1.22V6.98h4.93v-1.22h-11.05v1.22h4.9v17.14ZM404.82,24.11h5.83v-1.22h-5.86c-.87,0-1.55-.64-1.81-1.19l-2.62-5.31c-.18-.35-.32-.93-.32-1.46s.15-1.14.35-1.52l2.59-5.33c.29-.58,1.02-1.14,1.81-1.14h5.86v-1.22h-5.83c-1.46,0-2.33.76-2.97,2.01l-2.65,5.28c-.23.49-.38,1.25-.38,1.92s.15,1.37.41,1.89l2.62,5.25c.7,1.34,1.49,2.04,2.97,2.04M366.08,18.31l2.77-11.34h2.13l2.71,11.34h-7.61ZM363.37,24.11h1.31l1.11-4.58h8.19l1.08,4.58h1.28l-4.52-18.36h-3.88l-4.58,18.36ZM329.33,14.58v-7.61h5.25c1.25,0,1.75.2,2.71.96,1.11.87,1.22,1.22,1.22,2.13v1.43c0,.9-.15,1.25-1.22,2.13-.96.76-1.46.96-2.71.96h-5.25ZM328.11,24.11h1.22v-8.31h4.37l4.75,8.31h1.43l-4.72-8.34c1.17-.09,1.92-.47,3.06-1.43,1.34-1.14,1.52-1.66,1.52-3v-1.14c0-1.34-.17-1.86-1.52-3-1.34-1.14-2.13-1.46-3.64-1.46h-6.47v18.36ZM292.65,15.34V6.98h5.07c1.25,0,1.75.2,2.71.96,1.11.87,1.22,1.22,1.22,2.13v2.19c0,.9-.15,1.25-1.22,2.13-.96.76-1.46.96-2.71.96h-5.07ZM291.43,24.11h1.22v-7.55h5.07c1.51,0,2.3-.32,3.64-1.46,1.34-1.14,1.51-1.66,1.51-3v-1.89c0-1.34-.17-1.86-1.51-3-1.34-1.14-2.13-1.46-3.64-1.46h-6.3v18.36ZM239.84,24.11h11.22v-1.22h-10V5.75h-1.22v18.36ZM205.15,18.31l2.77-11.34h2.13l2.71,11.34h-7.61ZM202.44,24.11h1.31l1.11-4.58h8.19l1.08,4.58h1.28l-4.52-18.36h-3.88l-4.58,18.36ZM166.79,24.11h1.19v-15.94h.82l6.76,15.94h2.45V5.75h-1.19v16.03h-.82l-6.79-16.03h-2.42v18.36ZM140.11,24.11h1.22V5.75h-1.22v18.36ZM106.83,24.11h4.9c1.75,0,3.15-1.43,3.15-3.15v-4.43h-1.25v4.4c0,1.11-.84,1.95-1.95,1.95h-4.84c-1.11,0-1.95-.87-1.95-1.95v-5.83c0-.47.12-.99.23-1.31l2.51-5.68c.29-.61.99-1.14,1.78-1.14h5.48v-1.22h-5.48c-1.6,0-2.45.82-3.09,2.3l-2.54,5.63c-.06.32-.12,1.08-.12,1.54v5.74c0,1.75,1.43,3.15,3.18,3.15M77.23,24.11h1.22V5.75h-1.22v18.36ZM42.26,14.58v-7.61h5.25c1.25,0,1.75.2,2.71.96,1.11.87,1.22,1.22,1.22,2.13v1.43c0,.9-.15,1.25-1.22,2.13-.96.76-1.46.96-2.71.96h-5.25ZM41.03,24.11h1.22v-8.31h4.37l4.75,8.31h1.43l-4.72-8.34c1.17-.09,1.92-.47,3.06-1.43,1.34-1.14,1.52-1.66,1.52-3v-1.14c0-1.34-.17-1.86-1.52-3-1.34-1.14-2.13-1.46-3.64-1.46h-6.47v18.36ZM7.08,22.89h-1.92c-1.25,0-1.72-.17-2.74-.96-1.05-.85-1.19-1.22-1.19-2.13v-9.74c0-.9.15-1.28,1.19-2.13,1.02-.79,1.49-.96,2.74-.96h1.92c1.22,0,1.75.2,2.71.96,1.05.85,1.22,1.22,1.22,2.13v9.74c0,.9-.17,1.28-1.22,2.13-.96.76-1.49.96-2.71.96M5.16,24.11h1.92c1.52,0,2.3-.32,3.64-1.46,1.34-1.14,1.52-1.66,1.52-3v-9.44c0-1.34-.17-1.86-1.52-3-1.34-1.14-2.13-1.46-3.64-1.46h-1.92c-1.52,0-2.3.32-3.64,1.46S0,8.87,0,10.21v9.44c0,1.34.18,1.86,1.52,3s2.13,1.46,3.64,1.46"/></svg>`;
  band.appendChild(wm);

  /* Inquire and Apply are pages now, not overlays, so there is nothing for the
     footer to load: /inquire.html and /apply.html each pull in forms.js. */

  /* ── Light the field ── */
  (function lightThermal() {
    const go = () => { if (window.Thermal) window.Thermal.mount(band); };
    if (window.Thermal) return go();
    const t = document.createElement('script');
    t.src = '/workshops/bgsu/shared/thermal.js';
    t.onload = go;
    document.body.appendChild(t);
  })();

  /* ── Old-school visit counter (site-wide) — increments once per browser session;
     ?nolog (or localStorage opal-heat-off=1) never counts. Number inherits the
     footer ink colour; the pipe blinks like a live cursor. ── */
  (function visitCounter() {
    const nEl = document.getElementById('vc-n'); if (!nEl) return;
    const HEAT_ENDPOINT = 'https://opal-heat.solochris14.workers.dev';
    const nolog = /[?&]nolog\b/.test(location.search) || (function () { try { return localStorage.getItem('opal-heat-off') === '1'; } catch (e) { return false; } })();
    let seen = false; try { seen = sessionStorage.getItem('opal-visit') === '1'; sessionStorage.setItem('opal-visit', '1'); } catch (e) {}
    const inc = (!seen && !nolog) ? '1' : '0';
    fetch(HEAT_ENDPOINT + '/count?inc=' + inc).then(r => r.json()).then(j => { if (j && typeof j.count === 'number') nEl.textContent = j.count.toLocaleString(); }).catch(() => {});
  })();
})();
