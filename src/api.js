// Tankerkönig-Daten über /api/stations (Netlify-Function bzw. Vite-Proxy).
export async function fetchStations({ lat, lng, rad = 5 }) {
  const r = await fetch(`/api/stations?lat=${lat}&lng=${lng}&rad=${rad}`)
  const j = await r.json().catch(() => null)
  if (!r.ok || !j?.ok) throw new Error(j?.message || `Tankstellen-API nicht erreichbar (${r.status})`)
  return j.stations
    .filter((s) => s.isOpen)
    .map((s) => ({
      id: s.id,
      name: s.brand || s.name,
      street: [s.street, s.houseNumber].filter(Boolean).join(' '),
      km: s.dist,
      min: Math.max(1, Math.round(s.dist * 2.5)), // grobe Schätzung, wird für die beste Wahl durch Google ersetzt
      prices: { E10: s.e10, E5: s.e5, Diesel: s.diesel },
      lat: s.lat,
      lng: s.lng,
    }))
}
