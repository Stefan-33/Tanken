import { useEffect, useMemo, useState } from 'react'
import { FUELS, PRESETS, STATIONS } from './data.js'
import { eur, navUrl, price3, rank } from './calc.js'
import { fetchStations } from './api.js'
import { geocode, reverseGeocode } from './geo.js'
import LeafletMap from './LeafletMap.jsx'
import RouteMap from './RouteMap.jsx'
import { Car, Chevron, Crosshair, Leaf, Nav, Pin, Pump, Trophy } from './icons.jsx'

const load = (k, d) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d }
}
const save = (k, v) => {
  try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* ignore */ }
}

export default function App() {
  const [place, setPlace] = useState(() => load('tc.place', PRESETS[0]))
  const [query, setQuery] = useState(place.label)
  const [fuel, setFuel] = useState(() => load('tc.fuel', 'E10'))
  const [roundTrip, setRoundTrip] = useState(() => load('tc.rt', true))
  const [car, setCar] = useState(() => load('tc.car', { liters: 45, consumption: 7.2 }))
  const [editing, setEditing] = useState(false)
  const [live, setLive] = useState(null) // null = Demo, sonst echte Tankstellen
  const [status, setStatus] = useState('') // Hinweistext
  const [route, setRoute] = useState(null) // echte Fahrstrecke zur besten Wahl

  // Tankstellen für den Standort laden; ohne API-Schlüssel bleibt es bei Demo-Daten.
  useEffect(() => {
    let off = false
    setStatus('Lade Tankstellen …')
    fetchStations({ lat: place.lat, lng: place.lng, rad: 5 })
      .then((list) => (list.length ? list : fetchStations({ lat: place.lat, lng: place.lng, rad: 25 })))
      .then((list) => { if (!off) { setLive(list); setStatus(list.length ? '' : 'Keine geöffneten Tankstellen gefunden. Tankerkönig deckt nur Deutschland ab – bitte einen Ort in Deutschland wählen.') } })
      .catch((e) => { if (!off) { setLive(null); setStatus(`Demo-Daten (${e.message})`) } })
    return () => { off = true }
  }, [place.lat, place.lng])

  const choosePlace = (p) => { setPlace(p); setQuery(p.label); setRoute(null); save('tc.place', p) }

  const submitQuery = async (e) => {
    e.preventDefault()
    const preset = PRESETS.find((p) => p.label.toLowerCase() === query.trim().toLowerCase())
    if (preset) return choosePlace(preset)
    try { choosePlace(await geocode(query)) } catch (err) { setStatus(`Ort nicht gefunden: ${err.message}`) }
  }

  const locate = () => {
    if (!navigator.geolocation) return setStatus('Standortbestimmung wird nicht unterstützt.')
    setStatus('Bestimme Standort …')
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        let label = 'Mein Standort'
        try { label = await reverseGeocode(coords.latitude, coords.longitude) } catch { /* Nominatim nicht erreichbar */ }
        choosePlace({ label, lat: coords.latitude, lng: coords.longitude })
      },
      () => setStatus('Standort nicht erlaubt – bitte Ort eingeben.'),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const update = (setter, key) => (v) => { setter(v); save(key, v) }

  const ranked = useMemo(
    () => rank((live ?? STATIONS).filter((x) => x.prices[fuel] > 0), fuel, { liters: car.liters, consumption: car.consumption, roundTrip }),
    [live, fuel, car, roundTrip],
  )
  const [best0, ...others] = ranked
  const best = best0 && route?.id === best0.id && live ? { ...best0, km: route.km, min: route.min, total: best0.total + (route.km - best0.km) * (roundTrip ? 2 : 1) * car.consumption / 100 * best0.price } : best0
  const next = others[0]
  const saving = next ? next.total - best.total : 0

  return (
    <main className="app">
      <header className="top">
        <div className="logo"><Pump /> <span>Tank<b>Check</b></span></div>
        {!live && <span className="badge">DEMO</span>}
      </header>

      <div className="row">
        <form className="loc" onSubmit={submitQuery}>
          <Pin />
          <input value={query} list="presets" onChange={(e) => setQuery(e.target.value)} placeholder="Ort oder Adresse" aria-label="Standort" />
          <datalist id="presets">{PRESETS.map((p) => <option key={p.label} value={p.label} />)}</datalist>
        </form>
        <button className="icon-btn" aria-label="Meinen Standort verwenden" onClick={locate}><Crosshair /></button>
      </div>
      {status && <p className="status">{status}</p>}

      <div className="seg" role="tablist">
        {FUELS.map((f) => (
          <button key={f} role="tab" aria-selected={f === fuel} className={f === fuel ? 'on' : ''} onClick={() => update(setFuel, 'tc.fuel')(f)}>{f}</button>
        ))}
      </div>

      {!best ? (
        <div className="empty">
          <p>Keine Tankstellen für „{place.label}".</p>
          <button className="cta" onClick={() => choosePlace(PRESETS[0])}>Zurück zu {PRESETS[0].label}</button>
        </div>
      ) : (<>
      <section className="best">
        <div className="best-head">
          <div>
            <span className="chip"><Trophy /> Beste Wahl</span>
            <h2>{best.name}</h2>
            <p className="sub">{best.km.toLocaleString('de-DE', { maximumFractionDigits: 1 })} km · ca. {best.min} Min.</p>
          </div>
          <div className="price-col">
            <div className="price">{price3(best.price)} <small>€/l</small></div>
            <hr />
            <div className="lbl">Gesamtkosten</div>
            <div className="total">{eur(best.total)}</div>
            <div className="lbl">{roundTrip ? 'inkl. Hin- und Rückfahrt' : 'inkl. Hinfahrt'}</div>
            {saving > 0.005 && <div className="save"><Leaf /> {eur(saving)} günstiger</div>}
          </div>
        </div>
        <a className="cta" href={navUrl(best, place)} target="_blank" rel="noreferrer"><Nav /> Dorthin fahren</a>
      </section>

      <div className="car" >
        <Car />
        <span><b>{car.liters.toLocaleString('de-DE')} l</b> · {car.consumption.toLocaleString('de-DE')} l/100 km</span>
        <button className="link" onClick={() => setEditing((v) => !v)}>Anpassen <Chevron /></button>
      </div>

      {editing && (
        <div className="edit">
          <label>Tankmenge (l)
            <input type="number" min="1" max="120" step="1" value={car.liters}
              onChange={(e) => update(setCar, 'tc.car')({ ...car, liters: Math.max(1, +e.target.value || 1) })} />
          </label>
          <label>Verbrauch (l/100 km)
            <input type="number" min="1" max="30" step="0.1" value={car.consumption}
              onChange={(e) => update(setCar, 'tc.car')({ ...car, consumption: Math.max(0.1, +e.target.value || 0.1) })} />
          </label>
        </div>
      )}

      <div className="seg two">
        <button className={!roundTrip ? 'on' : ''} onClick={() => update(setRoundTrip, 'tc.rt')(false)}>Nur Hinfahrt</button>
        <button className={roundTrip ? 'on' : ''} onClick={() => update(setRoundTrip, 'tc.rt')(true)}>Hin und zurück</button>
      </div>

      {live
        ? <LeafletMap origin={place} best={best0} others={others} onRoute={setRoute} />
        : <RouteMap best={best} others={others} origin={place} />}

      {others.map((s) => (
        <div className="alt" key={s.id}>
          <Pump className="alt-ico" />
          <div className="alt-name">
            <b>{s.name}</b>
            <span>{s.km.toLocaleString('de-DE', { maximumFractionDigits: 1 })} km · ca. {s.min} Min.</span>
          </div>
          <div className="alt-price">
            <b>{price3(s.price)} €/l</b>
            <span>{eur(s.total)}</span>
          </div>
          <a className="cta small" href={navUrl(s, place)} target="_blank" rel="noreferrer"><Nav /> Dorthin fahren</a>
        </div>
      ))}

      </>)}

      <footer>{live ? 'Preise: Tankerkönig.de (CC BY 4.0)' : 'Designvorschau · Beispieldaten'}</footer>
    </main>
  )
}
