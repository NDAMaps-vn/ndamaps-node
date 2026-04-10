/**
 * Integration tests — require a real NDAMaps API key.
 *
 * Run with: npm run test:integration
 *
 * Set NDAMAPS_API_KEY environment variable before running.
 * These tests are skipped in CI.
 *
 * ALL tests verify actual server responses — no URL-builder-only tests.
 */
import { describe, it, expect } from 'vitest'
import { NDAMapsClient, NDAMapsError, NDAMapsErrorCode } from '../../src/index.js'

const API_KEY = process.env.NDAMAPS_API_KEY || ''
const SKIP = !API_KEY

const client = SKIP ? null : new NDAMapsClient({ apiKey: API_KEY })

// ── Places ────────────────────────────────────

describe.skipIf(SKIP)('Integration: Places', () => {
  it('autocomplete Google format → server returns predictions', async () => {
    const res = await client!.places.autocomplete({ input: 'Hồ Hoàn Kiếm' })
    expect(res.predictions.length).toBeGreaterThan(0)
    expect(res.status).toBe('OK')
    console.log('  ✔ autocomplete:', res.predictions[0].description)
  })

  it('autocomplete OSM format → server returns FeatureCollection', async () => {
    const res = await client!.places.autocomplete({ text: 'Lotte Mall' })
    expect(res.type).toBe('FeatureCollection')
    expect(res.features.length).toBeGreaterThan(0)
    console.log('  ✔ autocomplete OSM:', res.features[0].properties.name)
  })

  it('placeDetail → server returns result with session reuse', async () => {
    const autocompleteRes = await client!.places.autocomplete({ input: 'Lotte Mall' })
    const placeId = autocompleteRes.predictions[0]?.place_id
    expect(placeId).toBeTruthy()

    const detail = await client!.places.placeDetail({ ids: placeId })
    expect(detail).toHaveProperty('result')
    const result = (detail as any).result
    expect(result.name).toBeTruthy()
    expect(result.geometry.location).toHaveProperty('lat')
    expect(result.geometry.location).toHaveProperty('lng')
    console.log('  ✔ placeDetail:', result.name, result.geometry.location)
  })

  it('nearby → server returns FeatureCollection', async () => {
    const res = await client!.places.nearby({
      categories: 'restaurant',
      'point.lat': 21.0265,
      'point.lon': 105.8524,
      size: 3,
    })
    expect(res.type).toBe('FeatureCollection')
    expect(res.features.length).toBeGreaterThan(0)
    console.log('  ✔ nearby:', res.features.map(f => f.properties.name).join(', '))
  })
})

// ── Geocoding ─────────────────────────────────

describe.skipIf(SKIP)('Integration: Geocoding', () => {
  it('forward geocode → server returns coordinates', async () => {
    const res = await client!.geocoding.forward({ address: '12 Ngõ 1 Dịch Vọng Hậu, Cầu Giấy, Hà Nội' })
    expect(res.results.length).toBeGreaterThan(0)
    expect(res.results[0].geometry.location.lat).toBeGreaterThan(20)
    expect(res.results[0].geometry.location.lng).toBeGreaterThan(105)
    console.log('  ✔ forward:', res.results[0].geometry.location)
  })

  it('reverse geocode → server returns address', async () => {
    const res = await client!.geocoding.reverse({ latlng: '21.075951,105.812662' })
    expect(res.results.length).toBeGreaterThan(0)
    expect(res.results[0].formatted_address).toBeTruthy()
    console.log('  ✔ reverse:', res.results[0].formatted_address)
  })
})

// ── Navigation ────────────────────────────────

describe.skipIf(SKIP)('Integration: Navigation', () => {
  it('directions → server returns route with distance/duration', async () => {
    const res = await client!.navigation.directions({
      origin: { lat: 21.03, lng: 105.79 },
      destination: { lat: 21.05, lng: 105.80 },
      vehicle: 'car',
    })
    expect(res.routes.length).toBeGreaterThan(0)
    expect(res.routes[0].legs[0].distance.value).toBeGreaterThan(0)
    expect(res.routes[0].legs[0].duration.value).toBeGreaterThan(0)
    console.log('  ✔ directions:', res.routes[0].legs[0].distance.text, res.routes[0].legs[0].duration.text)
  })

  it('distanceMatrix → server returns matrix', async () => {
    const res = await client!.navigation.distanceMatrix({
      sources: [{ lat: '21.03', lon: '105.79' }],
      targets: [{ lat: '21.05', lon: '105.79' }, { lat: '21.07', lon: '105.80' }],
    })
    expect(res.sources_to_targets.length).toBeGreaterThan(0)
    expect(res.sources_to_targets[0].length).toBe(2)
    expect(res.sources_to_targets[0][0].distance).toBeGreaterThan(0)
    console.log('  ✔ distanceMatrix:', res.sources_to_targets[0].map(e => `${e.distance}km/${e.time}s`).join(', '))
  })

  it('optimizedRoute → server returns reordered route', async () => {
    const res = await client!.navigation.optimizedRoute({
      locations: [
        { lat: 21.03624, lon: 105.77142 },
        { lat: 21.03326, lon: 105.78743 },
        { lat: 21.00329, lon: 105.81834 },
        { lat: 21.02863, lon: 105.85164 },
        { lat: 21.03624, lon: 105.77142 }
      ],
    })
    expect(res.trip.locations.length).toBe(5)
    expect(res.trip.summary.time).toBeGreaterThan(0)
    console.log('  ✔ optimizedRoute:', res.trip.summary.time, 'seconds')
  })
})

// ── Forcodes ──────────────────────────────────

describe.skipIf(SKIP)('Integration: Forcodes', () => {
  it('encode + decode roundtrip → server returns matching coordinates', async () => {
    const encoded = await client!.forcodes.encode({ lat: 20.990396, lng: 105.868825, resolution: 13 })
    expect(encoded.status).toBe('OK')
    expect(encoded.forcodes).toBeTruthy()
    expect(encoded.admin_code).toBeTruthy()
    console.log('  ✔ encoded:', encoded.forcodes, 'admin_code:', encoded.admin_code)

    const decoded = await client!.forcodes.decode({ forcodes: encoded.forcodes })
    expect(decoded.status).toBe('OK')
    expect(decoded.lat).toBeCloseTo(20.990396, 2)
    expect(decoded.lng).toBeCloseTo(105.868825, 2)
    console.log('  ✔ decoded:', decoded.lat, decoded.lng)
  })

  it('decode invalid → server returns error', async () => {
    try {
      await client!.forcodes.decode({ forcodes: 'TOTALLYINVALID123' })
      expect.fail('Should have thrown')
    } catch (err) {
      expect(err).toBeInstanceOf(NDAMapsError)
      const error = err as NDAMapsError
      expect([NDAMapsErrorCode.INVALID_FORCODE, NDAMapsErrorCode.INVALID_PARAMS]).toContain(error.code)
      console.log('  ✔ invalid decode correctly threw:', error.code, error.message)
    }
  })
})

// ── Maps (Static Map) ─────────────────────────

describe.skipIf(SKIP)('Integration: Maps', () => {
  it('staticMapUrl → server returns image (PNG)', async () => {
    const url = client!.maps.staticMapUrl({
      mode: { mode: 'center', center: { lat: 21.03, lng: 105.79 }, zoom: 15 },
      width: 300,
      height: 200,
      styleId: 'day-v1',
    })

    const res = await fetch(url)
    expect(res.ok).toBe(true)
    expect(res.headers.get('content-type')).toContain('image/')
    const blob = await res.blob()
    expect(blob.size).toBeGreaterThan(1000) // A real image is at least a few KB
    console.log('  ✔ staticMap: received', blob.size, 'bytes,', res.headers.get('content-type'))
  })

  it('styleUrl day-v1 → server returns valid style.json', async () => {
    const url = client!.maps.styleUrl('day-v1')
    const res = await fetch(url)
    expect(res.ok).toBe(true)
    const json = await res.json()
    expect(json).toHaveProperty('version', 8)
    expect(json).toHaveProperty('sources')
    expect(json).toHaveProperty('layers')
    console.log('  ✔ day-v1 style.json: version', json.version, 'name:', json.name)
  })

  it('styleUrl night-v1 → server returns valid style.json', async () => {
    const url = client!.maps.styleUrl('night-v1')
    const res = await fetch(url)
    expect(res.ok).toBe(true)
    const json = await res.json()
    expect(json).toHaveProperty('version', 8)
    expect(json).toHaveProperty('sources')
    console.log('  ✔ night-v1 style.json: version', json.version, 'name:', json.name)
  })

  it('styleUrl satellite-v1 → server returns valid style.json', async () => {
    const url = client!.maps.styleUrl('satellite-v1')
    const res = await fetch(url)
    expect(res.ok).toBe(true)
    const json = await res.json()
    expect(json).toHaveProperty('version', 8)
    expect(json).toHaveProperty('sources')
    console.log('  ✔ satellite-v1 style.json: version', json.version, 'name:', json.name)
  })
})

// ── NDAView ───────────────────────────────────

describe.skipIf(SKIP)('Integration: NDAView', () => {
  it('staticThumbnailUrl → server returns JPEG image', async () => {
    const url = client!.ndaview.staticThumbnailUrl({
      placePosition: { lat: 21.033, lng: 105.788 },
      yaw: 276,
    })

    const res = await fetch(url)
    expect(res.ok).toBe(true)
    expect(res.headers.get('content-type')).toContain('image/')
    const blob = await res.blob()
    expect(blob.size).toBeGreaterThan(1000)
    console.log('  ✔ thumbnail: received', blob.size, 'bytes,', res.headers.get('content-type'))
  })

  it('search → server returns FeatureCollection', async () => {
    const res = await client!.ndaview.search({
      placePosition: { lat: 21.033, lng: 105.788 },
      limit: 3,
    })
    expect(res.type).toBe('FeatureCollection')
    expect(res.features.length).toBeGreaterThan(0)
    expect(res.features[0]).toHaveProperty('assets')
    expect(res.features[0].assets.thumb.href).toBeTruthy()
    console.log('  ✔ search:', res.features.length, 'features, thumb:', res.features[0].assets.thumb.href.slice(0, 60) + '...')
  })
})
