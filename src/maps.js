// Google Maps JS API dynamisch laden + Geocoding.
export const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY

let loader
export function loadGoogle() {
  if (!MAPS_KEY) return Promise.reject(new Error('VITE_GOOGLE_MAPS_KEY fehlt'))
  if (window.google?.maps) return Promise.resolve(window.google)
  loader ??= new Promise((resolve, reject) => {
    window.__gmapsReady = () => resolve(window.google)
    const s = document.createElement('script')
    s.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&callback=__gmapsReady&loading=async&language=de&region=DE`
    s.async = true
    s.onerror = () => reject(new Error('Google Maps konnte nicht geladen werden'))
    document.head.appendChild(s)
  })
  return loader
}

export async function geocode(text) {
  const g = await loadGoogle()
  const { results } = await new g.maps.Geocoder().geocode({ address: text, region: 'de' })
  if (!results?.length) throw new Error('Ort nicht gefunden')
  const loc = results[0].geometry.location
  const short = results[0].address_components.find((c) => c.types.includes('sublocality') || c.types.includes('locality'))
  return { lat: loc.lat(), lng: loc.lng(), label: short?.long_name || text }
}

export async function reverseGeocode(lat, lng) {
  const g = await loadGoogle()
  const { results } = await new g.maps.Geocoder().geocode({ location: { lat, lng } })
  const c = results?.[0]?.address_components || []
  return (c.find((x) => x.types.includes('sublocality_level_1') || x.types.includes('sublocality')) || c.find((x) => x.types.includes('locality')))?.long_name || 'Mein Standort'
}
