// Proxy zur Tankerkönig-API – der API-Schlüssel bleibt serverseitig (Env: TANKERKOENIG_KEY).
export default async (req) => {
  const key = process.env.TANKERKOENIG_KEY
  if (!key) return Response.json({ ok: false, message: 'TANKERKOENIG_KEY fehlt' }, { status: 503 })

  const u = new URL(req.url)
  const lat = Number(u.searchParams.get('lat'))
  const lng = Number(u.searchParams.get('lng'))
  const rad = Math.min(25, Math.max(1, Number(u.searchParams.get('rad')) || 5))
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return Response.json({ ok: false, message: 'lat/lng ungültig' }, { status: 400 })
  }

  const api = `https://creativecommons.tankerkoenig.de/json/list.php?lat=${lat}&lng=${lng}&rad=${rad}&sort=dist&type=all&apikey=${encodeURIComponent(key)}`
  const r = await fetch(api)
  const body = await r.text()
  return new Response(body, { status: r.status, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=60' } })
}
export const config = { path: '/api/stations' }
