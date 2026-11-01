/* ── OP/AL thermal field ──────────────────────────────────────────────────────
   A solid base colour (new each load) that warms where the cursor moves and
   where the page is scrolled. Warmth accumulates over the WEEK and resets
   Monday, so the surface carries the impressions of everyone who passed
   through. Shared across visitors via a small endpoint; otherwise it remembers
   this browser's week locally.

   Lifted out of the homepage hero so it can mount anywhere. It now lives in the
   footer: a band at the bottom of every page, with the footer's own content
   sitting on top of it.

     Thermal.mount(hostElement)   // host must be position:relative
*/
window.Thermal = (function () {
  function mount(host) {
    if (!host || host.dataset.thermalMounted) return;
    host.dataset.thermalMounted = '1';

    const canvas = document.createElement('canvas');
    canvas.className = 'thermal-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    const noise = document.createElement('div');
    noise.className = 'thermal-noise';
    noise.setAttribute('aria-hidden', 'true');
    host.prepend(noise);
    host.prepend(canvas);

    const hero = host;
    const note = null;
      const ctx = canvas.getContext('2d');
      const REDUCE = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // ▸ Shared heat store (Cloudflare Worker). Empty '' = per-browser only.
      const HEAT_ENDPOINT = 'https://opal-heat.solochris14.workers.dev';
      const STORE = 90;                     // heat -> byte quantisation for storage/sync

      const GW = 148, GH = 84, N = GW * GH;
      let floorI = new Float32Array(N);     // accumulated week presence (persistent, no local decay)
      let floorR = new Float32Array(N), floorG = new Float32Array(N), floorB = new Float32Array(N);  // presence-weighted blended colour per cell
      let live = new Float32Array(N), tmp = new Float32Array(N);   // session heat (decays)
      let contrib = new Float32Array(N);    // presence deposited since last sync
      const CONTRIB = 0.008;                // how much of a hover becomes a lasting mark
      const phase = new Float32Array(N);    // per-cell breath phase (accumulated impressions gently pulse)
      for (let y = 0, k = 0; y < GH; y++) for (let x = 0; x < GW; x++, k++) phase[k] = Math.sin(x * 0.045) * 2.2 + Math.cos(y * 0.055) * 2.2;   // broad, coherent waves that flow across (tai-chi)
      const BREATH_SPEED = 0.00085, BREATH_AMP = 0.42;   // slow (~7s) + deep: traces swell and contract
      const field = document.createElement('canvas'); field.width = GW; field.height = GH;
      const fctx = field.getContext('2d');
      const img = fctx.createImageData(GW, GH), data = img.data;

      function weekKey() { const d = new Date(); const off = (d.getUTCDay() + 6) % 7; d.setUTCDate(d.getUTCDate() - off); return d.toISOString().slice(0, 10); }  // all-UTC → one shared key worldwide, no boundary fragmentation
      const PERIOD = weekKey();

      const rnd = (a, b) => a + Math.random() * (b - a);
      function hsl(h, s, l) { h /= 360; let r, g, b;
        if (s === 0) { r = g = b = l; } else {
          const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
          const hue = (t) => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1/6) return p+(q-p)*6*t; if (t < 1/2) return q; if (t < 2/3) return p+(q-p)*(2/3-t)*6; return p; };
          r = hue(h + 1/3); g = hue(h); b = hue(h - 1/3);
        } return [r*255, g*255, b*255]; }
      // (hero palette is set below — driven by Chicago time of day)

      // This session's colour — a fresh distinct hue each page load. Every mark YOU
      // leave this visit is this colour; refresh gives you a new one. With many
      // visitors, the canvas stays a spectrum. ?colors=sanzo → pick from the house palette.
      const SANZO = [[232,132,107],[230,180,34],[217,110,63],[169,199,143],[240,180,158],[217,164,65],[168,216,192],[242,168,29],[201,167,212],[159,201,204],[235,228,91],[183,199,74],[232,145,123],[232,162,104],[227,178,60],[175,201,176],[244,162,97],[224,122,95]];
      const params = new URLSearchParams(location.search);
      const COLOR_MODE = params.get('colors') === 'spectrum' ? 'spectrum' : 'sanzo';   // muted house palette by default
      const DEV_WHO = params.get('as') || '';   // dev: separate contribution budget so you can test many colours
      const you = COLOR_MODE === 'spectrum' ? hsl(Math.random() * 360, rnd(0.4, 0.55), rnd(0.6, 0.7)) : SANZO[(Math.random() * SANZO.length) | 0].slice();
      // ── Dark thermal heat-map palette ───────────────────────────────────────────
      //  Dark thermal heatmap. Deep base hue is random each refresh (subtle colour shift).
      //  Aura/tone machinery kept only for ?tone=0..1 previews (asset renders); site is dark.
      const _to = params.get('tone');
      const TONE = _to !== null && _to !== '' ? Math.max(0, Math.min(1, parseFloat(_to))) : 1;   // 1 = dark thermal (default)
      const baseHue = Math.random() * 360;                     // random deep-base tint each refresh
      const auraBase = hsl(baseHue, 0.05, 0.985);
      const auraStops = [ [0.00, auraBase], [0.10, hsl(272,0.88,0.64)], [0.24, hsl(212,0.98,0.54)], [0.38, hsl(152,0.90,0.45)], [0.52, hsl(90,0.95,0.47)], [0.66, hsl(52,1,0.52)], [0.78, hsl(30,1,0.53)], [0.88, hsl(4,0.98,0.55)], [1.00, hsl(326,0.95,0.56)] ];
      const thermalBase = hsl(baseHue, 0.45, 0.06);
      const thermalStops = [ [0.00, thermalBase], [0.33, hsl((baseHue + 200) % 360, 0.55, 0.26)], [0.60, [40,175,95]], [0.80, [240,200,55]], [1.00, [255,74,42]] ];
      function rampOf(S, h) { h = h < 0 ? 0 : h > 1 ? 1 : h; for (let i = 1; i < S.length; i++) if (h <= S[i][0]) { const a = S[i-1], b = S[i], t = (h - a[0]) / (b[0] - a[0]); return [a[1][0]+(b[1][0]-a[1][0])*t, a[1][1]+(b[1][1]-a[1][1])*t, a[1][2]+(b[1][2]-a[1][2])*t]; } return S[S.length-1][1]; }
      function ramp(h) { const a = rampOf(auraStops, h), t = rampOf(thermalStops, h); return [a[0]+(t[0]-a[0])*TONE, a[1]+(t[1]-a[1])*TONE, a[2]+(t[2]-a[2])*TONE]; }
      const base = ramp(0);
      // adapt wordmark + scroll-cue ink for light (day) vs dark (night)
      (function () {
        // high contrast at every tone: near-black ink on a light bg, white ink on a dark bg
        const L = 0.299 * base[0] + 0.587 * base[1] + 0.114 * base[2];
        const lightBg = L > 140, ink = lightBg ? 'rgb(18,18,20)' : 'rgb(255,255,255)';
        const wm = document.getElementById('hero-wordmark'); if (wm) { wm.style.color = ink; wm.style.textShadow = lightBg ? '0 1px 16px rgba(255,255,255,0.65)' : '0 2px 30px rgba(0,0,0,0.6)'; }
        // Only the cue inside the thermal field, not every cue on the page.
        // This band used to be the homepage hero and owned the only scroll cue
        // there was; it is the footer now, and it was still reaching up the
        // page and painting the homepage's cue white on white.
        const scope = host || hero;
        if (scope) {
          scope.querySelectorAll('.hs-line').forEach(el => el.style.background = ink);
          scope.querySelectorAll('.hs-tri').forEach(el => el.style.borderTopColor = ink);
        }
        if (host) host.style.background = `rgb(${base[0]|0},${base[1]|0},${base[2]|0})`;
        // grain: near-gone on the bright day end (keep white clean) → full-strength at night (dither banding on low-res)
        if (noise) noise.style.opacity = (0.12 + 0.34 * TONE).toFixed(3);
      })();

      // grid → display is cover-fit (keeps cells square on any aspect, so blobs never squish on portrait phones)
      let cover = { scale: 1, ox: 0, oy: 0, k: 1 };
      function toGrid(clientX, clientY) { const r = hero.getBoundingClientRect(); return { x: (clientX - r.left - cover.ox) / cover.scale, y: (clientY - r.top - cover.oy) / cover.scale }; }

      const m = { x: -1, y: -1 };
      const bloom = [];
      function bloomGrid(gx, gy, amt) { if (gx >= 0 && gx < GW && gy >= 0 && gy < GH) bloom.push({ x: gx, y: gy, amt }); }
      function bloomAt(clientX, clientY, amt) { const g = toGrid(clientX, clientY); bloomGrid(g.x, g.y, amt); }

      hero.addEventListener('pointermove', (e) => { const g = toGrid(e.clientX, e.clientY); m.x = g.x; m.y = g.y; });
      hero.addEventListener('pointerleave', () => { m.x = m.y = -1; });
      hero.addEventListener('pointerup', () => { m.x = m.y = -1; });
      hero.addEventListener('pointercancel', () => { m.x = m.y = -1; });

      // touch: a tap leaves a warm bloom, a drag paints a trail — page can still scroll (passive)
      hero.addEventListener('touchstart', (e) => { for (let i = 0; i < e.touches.length; i++) bloomAt(e.touches[i].clientX, e.touches[i].clientY, 3.2); }, { passive: true });
      hero.addEventListener('touchmove', (e) => { for (let i = 0; i < e.touches.length; i++) { const t = e.touches[i], g = toGrid(t.clientX, t.clientY); m.x = g.x; m.y = g.y; bloomGrid(g.x, g.y, 0.6); } }, { passive: true });
      hero.addEventListener('touchend', () => { m.x = m.y = -1; }, { passive: true });

      let scrollWarm = 0;
      window.addEventListener('wheel', (e) => { scrollWarm = Math.min(1.2, scrollWarm + Math.abs(e.deltaY) * 0.0016); }, { passive: true });
      // scrolling the page also warms the pad — a drifting ribbon (works for touch scroll, no cursor needed)
      let lastScrollY = window.scrollY || 0;
      window.addEventListener('scroll', () => { const y = window.scrollY || 0, dy = Math.abs(y - lastScrollY); lastScrollY = y; if (dy > 0) { scrollWarm = Math.min(1.2, scrollWarm + dy * 0.003); if (m.x < 0) bloomGrid(GW * (0.5 + 0.28 * Math.sin(y * 0.006)), GH * (((y * 0.004) % 1) + 1) % 1, Math.min(1.4, dy * 0.02)); } }, { passive: true });

      // presence: warms the live glow AND deposits a small lasting contribution
      function splat(cx, cy, rad, amt) {
        // wobbly, lobed radius (varies by angle + a per-spot seed) → organic, not a perfect circle
        const seed = cx * 0.7 + cy * 1.3, ex = rad * 1.35;
        const x0 = Math.max(0,(cx-ex)|0), x1 = Math.min(GW-1,(cx+ex)|0), y0 = Math.max(0,(cy-ex)|0), y1 = Math.min(GH-1,(cy+ex)|0);
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
          const dx = x-cx, dy = y-cy, d = Math.sqrt(dx*dx+dy*dy), ang = Math.atan2(dy, dx);
          const reff = rad * (0.84 + 0.1*Math.sin(ang*2 + seed) + 0.08*Math.sin(ang*3 - seed*1.7) + 0.06*Math.sin(ang*5 + seed*0.5));
          if (d >= reff || reff <= 0) continue;
          const f = 1 - d/reff, h = amt*f*f, i = y*GW+x; live[i] += h; contrib[i] += h*CONTRIB;
        }
      }
      // ambient breathing warms the live glow only (decorative, not "presence")
      function glow(cx, cy, rad, amt) {
        const x0 = Math.max(0,(cx-rad)|0), x1 = Math.min(GW-1,(cx+rad)|0), y0 = Math.max(0,(cy-rad)|0), y1 = Math.min(GH-1,(cy+rad)|0), r2 = rad*rad;
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const dx = x-cx, dy = y-cy, d2 = dx*dx+dy*dy; if (d2 > r2) continue; live[y*GW+x] += amt*(1-d2/r2); }
      }

      const amb = [ {x:rnd(0,GW), y:rnd(0,GH), p:rnd(0,6.28), s:rnd(0.006,0.011)}, {x:rnd(0,GW), y:rnd(0,GH), p:rnd(0,6.28), s:rnd(0.005,0.009)} ];
      let last = performance.now(), raf = 0;

      function frame(now) {
        const dt = Math.min(3, (now - last) / 16.67); last = now;
        for (let i = 0; i < bloom.length; i++) splat(bloom[i].x, bloom[i].y, 7.5, bloom[i].amt);
        bloom.length = 0;
        if (m.x >= 0) splat(m.x, m.y, 6.5, 0.34 * dt);
        if (scrollWarm > 0.01 && m.x >= 0) splat(m.x, m.y, 9, scrollWarm * 0.14 * dt);
        scrollWarm *= 0.93;
        for (let i = 0; i < amb.length; i++) { const a = amb[i]; a.p += a.s * dt; glow(a.x + Math.sin(a.p)*22, a.y + Math.cos(a.p*0.8)*12, 16, 0.0022 * dt); }
        const DEC = Math.pow(0.99, dt);
        for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) { const i = y*GW+x;
          const l = x>0?live[i-1]:live[i], r = x<GW-1?live[i+1]:live[i], u = y>0?live[i-GW]:live[i], d = y<GH-1?live[i+GW]:live[i];
          tmp[i] = (live[i]*0.4 + (l+r+u+d)*0.15) * DEC; }
        const t3 = live; live = tmp; tmp = t3;
        const bt = now * BREATH_SPEED;
        for (let i = 0; i < N; i++) { const breath = 1 + BREATH_AMP * Math.sin(bt + phase[i]); let v = (floorI[i] + live[i]) * breath; if (v > 1.4) v = 1.4; const c = ramp(v); const j = i*4; data[j]=c[0]; data[j+1]=c[1]; data[j+2]=c[2]; data[j+3]=255; }
        fctx.putImageData(img, 0, 0);
        drawField();
        raf = requestAnimationFrame(frame);
      }
      function drawField() { ctx.imageSmoothingEnabled = true; ctx.drawImage(field, 0, 0, GW, GH, cover.ox*cover.k, cover.oy*cover.k, GW*cover.scale*cover.k, GH*cover.scale*cover.k); }
      function renderOnce() { for (let i = 0; i < N; i++) { let v = floorI[i] + live[i]; if (v > 1.4) v = 1.4; const c = ramp(v); const j = i*4; data[j]=c[0]; data[j+1]=c[1]; data[j+2]=c[2]; data[j+3]=255; } fctx.putImageData(img,0,0); drawField(); }
      function resize() { const r = hero.getBoundingClientRect(); const DPR = Math.min(2, window.devicePixelRatio||1); canvas.width = Math.max(2, Math.round(r.width*DPR*0.5)); canvas.height = Math.max(2, Math.round(r.height*DPR*0.5)); canvas.style.width = r.width+'px'; canvas.style.height = r.height+'px';
        const scale = Math.max(r.width/GW, r.height/GH); cover.scale = scale; cover.ox = (r.width - GW*scale)/2; cover.oy = (r.height - GH*scale)/2; cover.k = canvas.width / r.width;
        if (REDUCE) renderOnce(); }

      // encode/decode a grid as a base64 byte string (heat -> STORE units)
      function enc(arr) { let s = ''; for (let i = 0; i < N; i++) { let q = (arr[i]*STORE)|0; if (q>255) q=255; if (q<0) q=0; s += String.fromCharCode(q); } return btoa(s); }
      // decode the shared grid: 4 bytes/cell [I,R,G,B]; zero uncovered cells so a cleared store propagates to open tabs
      function dec4(b64) { try { const b = atob(b64), L = b.length; for (let i = 0; i < N; i++) { const o = i*4; if (o+3 < L) { floorI[i] = b.charCodeAt(o)/STORE; floorR[i] = b.charCodeAt(o+1); floorG[i] = b.charCodeAt(o+2); floorB[i] = b.charCodeAt(o+3); } else { floorI[i]=0; floorR[i]=0; floorG[i]=0; floorB[i]=0; } } } catch (e) {} }

      function setNote(shared) { if (!note) return; note.textContent = (shared ? 'human presence this week' : 'your presence this week') + '. resets monday.'; }

      // dev bypass: add ?nolog to the URL (or localStorage opal-heat-off=1) to view/paint
      // WITHOUT writing to the shared store — for heavy testing that shouldn't count.
      const DEV_NOLOG = /[?&]nolog\b/.test(location.search) || (function(){ try { return localStorage.getItem('opal-heat-off') === '1'; } catch (e) { return false; } })();
      if (DEV_NOLOG) console.log('%c[heat] dev mode — not writing to the shared store', 'color:#e6b422');

      if (HEAT_ENDPOINT) {
        const pull = () => fetch(HEAT_ENDPOINT + '?day=' + PERIOD).then(r => r.json()).then(j => { if (j && typeof j.v === 'string') dec4(j.v); }).catch(() => {});
        pull();
        setInterval(() => {
          if (DEV_NOLOG) { contrib = new Float32Array(N); pull(); return; }   // never POST in dev mode
          let has = false; for (let i = 0; i < N; i++) if (contrib[i] > 0.001) { has = true; break; }
          if (has) { const payload = enc(contrib); contrib = new Float32Array(N);
            fetch(HEAT_ENDPOINT, { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ day: PERIOD, v: payload, c: [you[0]|0, you[1]|0, you[2]|0], who: DEV_WHO || undefined }) })
              .then(r => r.json()).then(j => { if (j && typeof j.v === 'string') dec4(j.v); }).catch(() => {});
          } else pull();
        }, 12000);
        setNote(true);
      } else {
        // per-browser fallback: intensity only, painted in this session's colour
        const KEY = 'opal-heat';
        try { const sv = JSON.parse(localStorage.getItem(KEY) || 'null'); if (sv && sv.p === PERIOD && sv.v) { const b = atob(sv.v); for (let i = 0; i < N; i++) { floorI[i] = i < b.length ? b.charCodeAt(i)/STORE : 0; floorR[i]=you[0]; floorG[i]=you[1]; floorB[i]=you[2]; } } } catch (e) {}
        const save = () => { for (let i = 0; i < N; i++) { floorI[i] += contrib[i]; if (floorI[i] > 2.8) floorI[i] = 2.8; if (contrib[i] > 0) { floorR[i]=you[0]; floorG[i]=you[1]; floorB[i]=you[2]; } } contrib = new Float32Array(N); try { localStorage.setItem(KEY, JSON.stringify({ p: PERIOD, v: enc(floorI) })); } catch (e) {} };
        setInterval(save, 5000); window.addEventListener('beforeunload', save);
        setNote(false);
      }

      resize(); window.addEventListener('resize', resize);
      if (REDUCE) renderOnce(); else raf = requestAnimationFrame(frame);
      document.addEventListener('visibilitychange', () => { if (document.hidden) { if (raf) { cancelAnimationFrame(raf); raf = 0; } } else if (!REDUCE && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); } });
  }
  return { mount: mount };
})();
