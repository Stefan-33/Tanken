const base = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
export const Pump = (p) => (
  <svg {...base} {...p}><path d="M4 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16" /><path d="M3 21h14" /><path d="M7 8h6" /><path d="M15 9h2a2 2 0 0 1 2 2v5a1.5 1.5 0 0 0 3 0V8l-3-3" /></svg>
)
export const Pin = (p) => (
  <svg {...base} fill="currentColor" stroke="none" {...p}><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" /></svg>
)
export const Crosshair = (p) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" /></svg>
)
export const Trophy = (p) => (
  <svg {...base} width="18" height="18" {...p}><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z" /><path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3" /></svg>
)
export const Leaf = (p) => (
  <svg {...base} width="18" height="18" {...p}><path d="M5 19C5 9 11 4 20 4c0 9-5 15-15 15z" /><path d="M5 19c3-5 6-8 10-10" /></svg>
)
export const Nav = (p) => (
  <svg {...base} fill="currentColor" stroke="none" {...p}><path d="M21 3 3 10.5l7 2.5 2.5 8z" /></svg>
)
export const Car = (p) => (
  <svg {...base} {...p}><path d="M5 16V12l2-5h10l2 5v4" /><path d="M3 16h18v3h-3v-1H6v1H3z" /><circle cx="7.5" cy="13.5" r=".6" fill="currentColor" /><circle cx="16.5" cy="13.5" r=".6" fill="currentColor" /></svg>
)
export const Chevron = (p) => (
  <svg {...base} width="18" height="18" {...p}><path d="m9 6 6 6-6 6" /></svg>
)
