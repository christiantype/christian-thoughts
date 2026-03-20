// ── Weather + time gradient ──
// Oak Park, IL — 934 Washington Blvd

(async function () {
  const root = document.documentElement;
  const P    = window.PALETTES;

  function apply(p) {
    root.style.setProperty('--main',       p.main);
    root.style.setProperty('--accent',     p.accent);
    root.style.setProperty('--accent1',    p.accent1);
    root.style.setProperty('--light',      p.light);
    root.style.setProperty('--mid',        p.mid);
    root.style.setProperty('--grad-start', p.grad[0]);
    root.style.setProperty('--grad-mid',   p.grad[1]);
    root.style.setProperty('--grad-end',   p.grad[2]);
  }

  // ── Synchronous: applied immediately, before first paint ──────────────────
  const h = new Date().getHours();
  apply(h >= 6 && h < 20 ? P.sunnyPartly : P.nightClear);

  // ── Async: silently updates once weather data arrives ─────────────────────
  try {
    const LAT = 41.885, LON = -87.7954;
    const URL = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=weather_code,is_day&timezone=America%2FChicago`;
    const data = await fetch(URL).then(r => r.json());
    const code = data.current.weather_code;
    const day  = data.current.is_day === 1;

    let palette;
    if (day) {
      if      (code === 0)                                palette = P.sunnyClear;
      else if (code <= 2)                                 palette = P.sunnyPartly;
      else if (code === 3)                                palette = P.overcast;
      else if (code <= 48)                                palette = P.fog;
      else if (code <= 57)                                palette = P.drizzle;
      else if (code <= 67 || (code >= 80 && code <= 82)) palette = P.rain;
      else if (code <= 77 || (code >= 85 && code <= 86)) palette = P.snow;
      else                                                palette = P.storm;
    } else {
      if      (code === 0 || code === 1)                  palette = P.nightClear;
      else if (code <= 57 || (code >= 80 && code <= 82)) palette = P.nightRain;
      else if (code >= 95)                                palette = P.nightStorm;
      else                                                palette = P.nightCloud;
    }
    apply(palette);
  } catch (e) {
    // time-based fallback already applied above, nothing to do
  }
})();
