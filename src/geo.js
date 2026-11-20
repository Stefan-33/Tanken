// Ortssuche (Nominatim) und Fahrroute (OSRM) auf Basis von OpenStreetMap – ohne API-Schlüssel.
const shortName = (a = {}) => a.suburb || a.city_district || a.village || a.town || a.city || a.municipality

export async function geocode(text) {
  const r = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&countrycodes=de&accept-language=de&q=${encodeURIComponent(text)}`)
  const j = await r.json()
  if (!j.length) throw new Error('Ort nicht gefunden')
  return { lat: +j[0].lat, lng: +j[0].lon, label: shortName(j[0].address) || text }
}

export async function reverseGeocode(lat, lng) {
  const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=14&accept-language=de&lat=${lat}&lon=${lng}`)
  const j = await r.json()
  return shortName(j.address) || 'Mein Standort'
}

// Liefert { path: [[lat,lng],…], km, min } oder wirft bei Fehler.
export async function drivingRoute(from, to) {
  const r = await fetch(`https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`)
  const j = await r.json()
  const route = j.routes?.[0]
  if (!route) throw new Error('Keine Route')
  return { path: route.geometry.coordinates.map(([x, y]) => [y, x]), km: route.distance / 1000, min: Math.max(1, Math.round(route.duration / 60)) }
}
