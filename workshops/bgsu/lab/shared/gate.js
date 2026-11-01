(function () {
  // Default password for the tools: sha-256("0p4l") — set 2026-07-28.
  // NOTE: this is a soft client-side gate, not real security — the hash is public in this
  // file and the check runs in the browser, so a determined visitor can bypass it.
  // A page can still override per-tool with data-hash / data-scope on the <script> tag.
  // Workshop pass: data-pass is the hash of a second, shareable word and data-until the
  // moment it stops working (ISO). The pass opens only pages that carry it, never the
  // rest of the lab; 0p4l still opens everything. ?pass=word in the URL unlocks too.
  const DEFAULT_HASH = 'd066b86c567f44e9bb705cb51bde34307d93081ef5c6e957327d5360ee37e0bf';
  const DEFAULT_SCOPE = 'opal-lab-v2';

  const ds = (document.currentScript && document.currentScript.dataset) || {};
  const HASH = ds.hash || DEFAULT_HASH;
  // Per-scope session key so unlocking one password group doesn't unlock another.
  const KEY = ds.scope ? 'opal-gate-' + ds.scope : DEFAULT_SCOPE;

  const PASS = ds.pass || '';
  const UNTIL = ds.until ? new Date(ds.until) : null;
  const PASS_KEY = 'opal-pass-' + (ds.scope || 'lab');
  const passOpen = PASS && !(UNTIL && Date.now() > UNTIL);

  if (sessionStorage.getItem(KEY) === '1') return;
  if (sessionStorage.getItem(DEFAULT_SCOPE) === '1') return;
  if (passOpen && sessionStorage.getItem(PASS_KEY) === '1') return;


  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-family: 'Sidepiece-HoneyDrip';
      src: url('/workshops/bgsu/shared/fonts/Sidepiece-HoneyDrip.woff2') format('woff2');
      font-weight: 400;
      font-style: normal;
      font-display: swap;
    }
    html.zlmc-locked body > *:not(.zlmc-gate) { display: none !important; }
    .zlmc-gate {
      position: fixed; inset: 0; z-index: 200;
      background: #FFFFFF;
      display: flex; align-items: center; justify-content: center;
      padding: 0 10em;
      font-family: 'Untitled Sans', system-ui, sans-serif;
      color: #000000;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .zlmc-gate-card {
      width: 100%;
      max-width: 28em;
      display: flex; flex-direction: column;
    }
    .zlmc-gate-eyebrow {
      font-size: 12px;
      letter-spacing: 0.09375em;
      text-transform: uppercase;
      color: #868686;
      margin-bottom: 0.75em;
    }
    .zlmc-gate-title {
      font-size: 16px;
      font-weight: 400;
      line-height: 1.5;
      margin: 0;
      padding-bottom: 0.75em;
      border-bottom: 0.3px solid #868686;
    }
    .zlmc-gate-row {
      display: flex;
      align-items: center;
      gap: 0.5em;
      border-bottom: 0.3px solid #868686;
      padding: 0.75em 0;
    }
    .zlmc-gate-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      font: inherit;
      font-size: 16px;
      color: inherit;
      padding: 0;
    }
    .zlmc-gate-input::placeholder { color: #868686; }
    .zlmc-gate-submit {
      background: transparent;
      border: none;
      cursor: pointer;
      font: inherit;
      font-size: 12px;
      letter-spacing: 0.09375em;
      text-transform: uppercase;
      color: #868686;
      transition: color 0.2s;
      padding: 0;
    }
    .zlmc-gate-submit:hover { color: #000000; }
    .zlmc-gate-err {
      margin-top: 0.75em;
      font-size: 12px;
      letter-spacing: 0.09375em;
      text-transform: uppercase;
      color: #ff94c9;
      min-height: 1em;
    }
    @media (max-width: 64em) { .zlmc-gate { padding: 0 4em; } }
    @media (max-width: 40em) { .zlmc-gate { padding: 0 1.25em; } }
  `;
  document.documentElement.classList.add('zlmc-locked');
  (document.head || document.documentElement).appendChild(style);

  async function sha256(text) {
    const buf = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest('SHA-256', buf);
    return [...new Uint8Array(digest)]
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // A link that carries the pass word opens the page straight away, then drops it from the bar.
  const fromUrl = new URLSearchParams(location.search).get('pass');
  if (passOpen && fromUrl) {
    sha256(fromUrl.trim().toLowerCase()).then((h) => {
      if (h !== PASS) return;
      sessionStorage.setItem(PASS_KEY, '1');
      const u = new URL(location.href); u.searchParams.delete('pass');
      location.replace(u.href);
    });
  }

  function mount() {
    const wrap = document.createElement('div');
    wrap.className = 'zlmc-gate';
    wrap.innerHTML = `
      <form class="zlmc-gate-card" autocomplete="off">
        <div class="zlmc-gate-eyebrow">${PASS ? (ds.label || 'Workshop') + ' · OP/AL Tools' : 'Private · OP/AL Tools'}</div>
        <h1 class="zlmc-gate-title">${!PASS ? 'Enter password to continue.' : passOpen ? 'Enter the workshop pass to continue.' : 'The workshop pass has closed.'}</h1>
        <div class="zlmc-gate-row">
          <input class="zlmc-gate-input" type="password" autocomplete="current-password" placeholder="${PASS ? 'Pass' : 'Password'}" />
          <button class="zlmc-gate-submit" type="submit">Unlock →</button>
        </div>
        <div class="zlmc-gate-err" aria-live="polite"></div>
      </form>
    `;
    document.body.appendChild(wrap);

    const input = wrap.querySelector('input');
    const err = wrap.querySelector('.zlmc-gate-err');
    input.focus();

    wrap.querySelector('form').addEventListener('submit', async (e) => {
      e.preventDefault();
      err.textContent = '';
      const hashed = await sha256(input.value);
      if (hashed === HASH) {
        sessionStorage.setItem(KEY, '1');
        location.reload();
      } else if (passOpen && (await sha256(input.value.trim().toLowerCase())) === PASS) {
        sessionStorage.setItem(PASS_KEY, '1');
        location.reload();
      } else {
        err.textContent = 'Incorrect password.';
        input.select();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
