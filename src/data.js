// Beispieldaten (Demo). Koordinaten sind relativ zum Standort auf der Mini-Karte (0..100).
export const PRESETS = [
  { label: 'Essen-Altenessen', lat: 51.4983, lng: 7.0039 },
  { label: 'Essen', lat: 51.4556, lng: 7.0116 },
  { label: 'Gelsenkirchen', lat: 51.5177, lng: 7.0857 },
  { label: 'Oberhausen', lat: 51.4963, lng: 6.8638 },
]

export const STATIONS = [
  { id: 'C', name: 'Tankstelle C', km: 1.2, min: 4, prices: { E10: 1.619, E5: 1.679, Diesel: 1.559 }, pos: [82, 22] },
  { id: 'B', name: 'Tankstelle B', km: 1.8, min: 5, prices: { E10: 1.629, E5: 1.689, Diesel: 1.569 }, pos: [60, 60] },
  { id: 'A', name: 'Tankstelle A', km: 0.6, min: 2, prices: { E10: 1.689, E5: 1.749, Diesel: 1.629 }, pos: [38, 35] },
  { id: 'D', name: 'Tankstelle D', km: 3.4, min: 9, prices: { E10: 1.639, E5: 1.699, Diesel: 1.579 }, pos: [88, 74] },
]

export const FUELS = ['E10', 'E5', 'Diesel']
