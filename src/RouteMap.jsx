// Stilisierte Mini-Karte (SVG) – bis echte Kartendaten angebunden sind.
export default function RouteMap({ best, others }) {
  const W = 100, H = 60
  const start = [14, 40]
  const pt = ([x, y]) => [(x / 100) * W, (y / 100) * H]
  const [ex, ey] = pt(best.pos)
  const [sx, sy] = pt(start)
  const midx = (sx + ex) / 2
  const path = `M${sx},${sy} C${sx + 12},${sy + 6} ${midx - 8},${sy - 8} ${midx},${(sy + ey) / 2} S${ex - 10},${ey + 8} ${ex},${ey}`
  return (
    <div className="map">
      <span className="map-title">Deine Route</span>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label="Routenkarte">
        <rect width={W} height={H} fill="#2a2d33" />
        <g fill="#3d6a45" opacity=".75">
          <rect x="18" y="8" width="12" height="9" rx="1" />
          <rect x="34" y="38" width="10" height="12" rx="1" />
          <rect x="86" y="30" width="12" height="16" rx="1" />
        </g>
        <path d="M52,0 L56,22 L60,60" stroke="#1f4a7a" strokeWidth="4" fill="none" opacity=".8" />
        <g stroke="#4a4e56" strokeWidth="1.4" fill="none">
          <path d="M0,20 L100,14" /><path d="M0,48 L100,42" /><path d="M30,0 L26,60" /><path d="M76,0 L80,60" /><path d="M0,34 L100,30" />
        </g>
        {others.map((o) => {
          const [x, y] = pt(o.pos)
          return <circle key={o.id} cx={x} cy={y} r="1.4" fill="#8a8f98" />
        })}
        <path d={path} stroke="#ff7a12" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={sx} cy={sy} r="2.2" fill="#ff7a12" stroke="#fff" strokeWidth=".8" />
        <g transform={`translate(${ex},${ey})`}>
          <path d="M0,0 C-4,-5 -4,-9 0,-9 C4,-9 4,-5 0,0Z" fill="#ff7a12" stroke="#fff" strokeWidth=".6" transform="scale(1.1) translate(0,-1)" />
          <circle cx="0" cy="-6.5" r="1.8" fill="#fff" />
        </g>
      </svg>
    </div>
  )
}
