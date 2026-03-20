// ─────────────────────────────────────────────────────────────────────────────
// SITE COLOR PALETTES
// Edit any value here to change how the site looks under that condition.
//
// Each palette sets 8 variables:
//   main    → text, headings, links, borders, cursor
//   accent  → paragraph gradient end, secondary accents
//   accent1 → selection highlight, tertiary accents
//   light   → lighter accent
//   mid     → mid-tone accent
//   grad    → [bottom-left, mid, top-right] of the background gradient
//             grad[0] = darkest (bottom-left)
//             grad[2] = lightest (top-right)
// ─────────────────────────────────────────────────────────────────────────────

window.PALETTES = {

  // ── Daytime ────────────────────────────────────────────────────────────────

  sunnyClear: {
    label:   'Sunny / Clear Sky',
    main:    '#B5541A', accent:  '#6B21A8', accent1: '#BE185D',
    light:   '#0C4A6E', mid:     '#78350F',
    grad:   ['#FFE0A0', '#FFF4E0', '#FFFFFF'],  // amber → cream → white
  },

  sunnyPartly: {
    label:   'Partly Cloudy',
    main:    '#1D4ED8', accent:  '#7C3AED', accent1: '#DB2777',
    light:   '#0369A1', mid:     '#4338CA',
    grad:   ['#BFDBFE', '#DCF0FF', '#F8FBFF'],  // blue → pale blue → white
  },

  overcast: {
    label:   'Overcast',
    main:    '#374151', accent:  '#4F46E5', accent1: '#7C3AED',
    light:   '#6B7280', mid:     '#4B5563',
    grad:   ['#9CA3AF', '#D1D5DB', '#F3F4F6'],  // medium gray → light gray
  },

  fog: {
    label:   'Fog',
    main:    '#44403C', accent:  '#57534E', accent1: '#78716C',
    light:   '#A8A29E', mid:     '#292524',
    grad:   ['#A8A29E', '#D6D3D1', '#F5F5F4'],  // warm gray → off-white
  },

  drizzle: {
    label:   'Drizzle',
    main:    '#1E40AF', accent:  '#6D28D9', accent1: '#0369A1',
    light:   '#1D4ED8', mid:     '#3730A3',
    grad:   ['#93C5FD', '#BFDBFE', '#EFF6FF'],  // slate blue → pale blue
  },

  rain: {
    label:   'Rain',
    main:    '#1E3A8A', accent:  '#312E81', accent1: '#4338CA',
    light:   '#1D4ED8', mid:     '#3730A3',
    grad:   ['#6B8CAE', '#A8C4DC', '#DDE9F4'],  // navy → steel → pale
  },

  snow: {
    label:   'Snow',
    main:    '#312E81', accent:  '#4338CA', accent1: '#5B21B6',
    light:   '#4F46E5', mid:     '#6D28D9',
    grad:   ['#A5B4FC', '#C7D2FE', '#EEF2FF'],  // indigo → periwinkle → icy white
  },

  storm: {
    label:   'Thunderstorm',
    main:    '#0F172A', accent:  '#1E1B4B', accent1: '#312E81',
    light:   '#1E40AF', mid:     '#1E3A8A',
    grad:   ['#475569', '#94A3B8', '#CBD5E1'],  // dark steel → light blue-gray
  },

  // ── Nighttime ──────────────────────────────────────────────────────────────

  nightClear: {
    label:   'Night / Clear',
    main:    '#FCD34D', accent:  '#C084FC', accent1: '#F9A8D4',
    light:   '#6EE7B7', mid:     '#FB923C',
    grad:   ['#020810', '#0E1A2B', '#1E3048'],  // near-black → deep navy
  },

  nightCloud: {
    label:   'Night / Cloudy',
    main:    '#CBD5E1', accent:  '#A78BFA', accent1: '#F0ABFC',
    light:   '#93C5FD', mid:     '#C4B5FD',
    grad:   ['#09090B', '#18181B', '#27272A'],  // near-black → dark slate
  },

  nightRain: {
    label:   'Night / Rain',
    main:    '#7DD3FC', accent:  '#818CF8', accent1: '#F9A8D4',
    light:   '#93C5FD', mid:     '#A5B4FC',
    grad:   ['#020508', '#0B1622', '#162436'],  // near-black → deep blue
  },

  nightStorm: {
    label:   'Night / Storm',
    main:    '#F472B6', accent:  '#A78BFA', accent1: '#67E8F9',
    light:   '#FDE68A', mid:     '#F97316',
    grad:   ['#020204', '#09090F', '#14101E'],  // near-black → deep dark purple
  },

};
