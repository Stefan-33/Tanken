import { useMemo, useState } from 'react'
import { FUELS, LOCATIONS, STATIONS } from './data.js'
import { eur, navUrl, price3, rank } from './calc.js'
import RouteMap from './RouteMap.jsx'
import { Car, Chevron, Crosshair, Leaf, Nav, Pin, Pump, Trophy } from './icons.jsx'

const load = (k, d) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d }
}
const save = (k, v) => {
  try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* ignore */ }
}

export default function App() {
  const [location, setLocation] = useState(() => load('tc.loc', LOCATIONS[0]))
  const [fuel, setFuel] = useState(() => load('tc.fuel', 'E10'))
  const [roundTrip, setRoundTrip] = useState(() => load('tc.rt', true))
  const [car, setCar] = useState(() => load('tc.car', { liters: 45, consumption: 7.2 }))
  const [editing, setEditing] = useState(false)

  const update = (setter, key) => (v) => { setter(v); save(key, v) }

  const ranked = useMemo(
    () => rank(STATIONS, fuel, { liters: car.liters, consumption: car.consumption, roundTrip }),
    [fuel, car, roundTrip],
  )
  const [best, ...others] = ranked
  const next = others[0]
  const saving = next ? next.total - best.total : 0

  return (
    <main className="app">
      <header className="top">
        <div className="logo"><Pump /> <span>Tank<b>Check</b></span></div>
        <span className="badge">DEMO</span>
      </header>

      <div className="row">
        <label className="loc">
          <Pin />
          <select value={location} onChange={(e) => update(setLocation, 'tc.loc')(e.target.value)}>
            {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </label>
        <button className="icon-btn" aria-label="Standort bestimmen" onClick={() => update(setLocation, 'tc.loc')(LOCATIONS[0])}>
          <Crosshair />
        </button>
      </div>

      <div className="seg" role="tablist">
        {FUELS.map((f) => (
          <button key={f} role="tab" aria-selected={f === fuel} className={f === fuel ? 'on' : ''} onClick={() => update(setFuel, 'tc.fuel')(f)}>{f}</button>
        ))}
      </div>

      <section className="best">
        <div className="best-head">
          <div>
            <span className="chip"><Trophy /> Beste Wahl</span>
            <h2>{best.name}</h2>
            <p className="sub">{best.km.toLocaleString('de-DE')} km · ca. {best.min} Min.</p>
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
        <a className="cta" href={navUrl(best)} target="_blank" rel="noreferrer"><Nav /> Dorthin fahren</a>
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

      <RouteMap best={best} others={others} />

      {others.map((s) => (
        <div className="alt" key={s.id}>
          <Pump className="alt-ico" />
          <div className="alt-name">
            <b>{s.name}</b>
            <span>{s.km.toLocaleString('de-DE')} km · ca. {s.min} Min.</span>
          </div>
          <div className="alt-price">
            <b>{price3(s.price)} €/l</b>
            <span>{eur(s.total)}</span>
          </div>
          <a className="cta small" href={navUrl(s)} target="_blank" rel="noreferrer"><Nav /> Dorthin fahren</a>
        </div>
      ))}

      <footer>Designvorschau · Beispieldaten</footer>
    </main>
  )
}
