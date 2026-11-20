import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { drivingRoute } from './geo.js'

const dot = (cls) => L.divIcon({ className: '', html: `<div class="pin ${cls}"></div>`, iconSize: [22, 22], iconAnchor: [11, 11] })
const ICONS = { me: dot('me'), best: L.divIcon({ className: '', html: '<div class="pin best">⛽</div>', iconSize: [34, 34], iconAnchor: [17, 17] }), alt: dot('alt') }

// Echte OpenStreetMap-Karte mit Standort, bester Tankstelle, Alternativen und Fahrroute.
export default function LeafletMap({ origin, best, others, onRoute }) {
  const el = useRef(null)
  const map = useRef(null)
  const layer = useRef(null)

  useEffect(() => {
    map.current = L.map(el.current, { zoomControl: false, attributionControl: true, scrollWheelZoom: false }).setView([origin.lat, origin.lng], 14)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19, subdomains: 'abcd',
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(map.current)
    L.control.zoom({ position: 'topright' }).addTo(map.current)
    layer.current = L.layerGroup().addTo(map.current)
    return () => { map.current.remove(); map.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let off = false
    const m = map.current, g = layer.current
    g.clearLayers()
    L.marker([origin.lat, origin.lng], { icon: ICONS.me, title: 'Dein Standort' }).addTo(g)
    others.forEach((o) => L.marker([o.lat, o.lng], { icon: ICONS.alt, title: o.name }).addTo(g))
    const bounds = L.latLngBounds([[origin.lat, origin.lng]])
    if (best) {
      L.marker([best.lat, best.lng], { icon: ICONS.best, title: best.name, zIndexOffset: 1000 }).addTo(g)
      bounds.extend([best.lat, best.lng])
      const line = L.polyline([[origin.lat, origin.lng], [best.lat, best.lng]], { color: '#ff7a12', weight: 4, opacity: 0.6, dashArray: '6 8' }).addTo(g)
      drivingRoute(origin, best).then((r) => {
        if (off) return
        line.remove()
        const real = L.polyline(r.path, { color: '#ff7a12', weight: 5 }).addTo(g)
        m.fitBounds(real.getBounds(), { padding: [30, 30] })
        onRoute?.({ id: best.id, km: r.km, min: r.min })
      }).catch(() => { /* Luftlinie bleibt */ })
    }
    m.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 })
    return () => { off = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin.lat, origin.lng, best?.id, others.length])

  return (
    <div className="map">
      <span className="map-title">Deine Route</span>
      <div ref={el} className="gmap" />
    </div>
  )
}
