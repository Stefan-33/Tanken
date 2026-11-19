import { useEffect, useRef, useState } from 'react'
import { loadGoogle } from './maps.js'

const DARK = [
  { elementType: 'geometry', stylers: [{ color: '#2a2d33' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#9ba0a8' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#14161a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#4a4e56' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#1f4a7a' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#2f4d36' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
]
const pinIcon = (g, color) => ({ path: g.maps.SymbolPath.CIRCLE, scale: 9, fillColor: color, fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 })

// Karte mit Standort, bester Tankstelle, Alternativen und Fahrroute.
// onRoute({km, min}) meldet die echte Fahrstrecke zur besten Wahl zurück.
export default function GoogleMap({ origin, best, others, onRoute }) {
  const el = useRef(null)
  const state = useRef({})
  const [err, setErr] = useState('')

  useEffect(() => {
    let off = false
    loadGoogle().then((g) => {
      if (off || !el.current) return
      const s = state.current
      s.g = g
      s.map ??= new g.maps.Map(el.current, { center: origin, zoom: 14, disableDefaultUI: true, zoomControl: true, styles: DARK, gestureHandling: 'cooperative' })
      s.markers ??= []
      s.markers.forEach((m) => m.setMap(null))
      s.line?.setMap(null)
      const bounds = new g.maps.LatLngBounds(origin)
      s.markers = [
        new g.maps.Marker({ map: s.map, position: origin, icon: pinIcon(g, '#ff7a12'), title: 'Dein Standort' }),
        ...others.map((o) => new g.maps.Marker({ map: s.map, position: o, icon: { ...pinIcon(g, '#8a8f98'), scale: 6 }, title: o.name })),
      ]
      if (best) {
        s.markers.push(new g.maps.Marker({ map: s.map, position: best, title: best.name, label: { text: '⛽', fontSize: '16px' }, icon: { ...pinIcon(g, '#ff7a12'), scale: 14 } }))
        bounds.extend(best)
        new g.maps.DirectionsService().route({ origin, destination: best, travelMode: 'DRIVING' }).then((res) => {
          if (off) return
          const route = res.routes[0]
          s.line = new g.maps.Polyline({ map: s.map, path: route.overview_path, strokeColor: '#ff7a12', strokeWeight: 5 })
          const leg = route.legs[0]
          onRoute?.({ km: leg.distance.value / 1000, min: Math.max(1, Math.round(leg.duration.value / 60)) })
        }).catch(() => {
          // Directions API nicht freigeschaltet → Luftlinie
          s.line = new g.maps.Polyline({ map: s.map, path: [origin, best], strokeColor: '#ff7a12', strokeWeight: 4, strokeOpacity: 0.8 })
        })
      }
      s.map.fitBounds(bounds, 48)
    }).catch((e) => setErr(e.message))
    return () => { off = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin.lat, origin.lng, best?.id])

  return (
    <div className="map">
      <span className="map-title">Deine Route</span>
      <div ref={el} className="gmap" />
      {err && <div className="map-err">{err}</div>}
    </div>
  )
}
