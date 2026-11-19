// Gesamtkosten = Tankfüllung + Spritverbrauch der Fahrt zur Tankstelle (zum Preis der Tankstelle).
export function totalCost({ price, km, liters, consumption, roundTrip }) {
  const distance = km * (roundTrip ? 2 : 1)
  const tripLiters = (distance * consumption) / 100
  return price * (liters + tripLiters)
}

export function rank(stations, fuel, opts) {
  return stations
    .map((s) => ({ ...s, price: s.prices[fuel], total: totalCost({ ...opts, price: s.prices[fuel], km: s.km }) }))
    .sort((a, b) => a.total - b.total)
}

export const eur = (n) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
export const price3 = (n) => n.toLocaleString('de-DE', { minimumFractionDigits: 3, maximumFractionDigits: 3 })

export function navUrl(s) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(s.name + ' Essen')}`
}
