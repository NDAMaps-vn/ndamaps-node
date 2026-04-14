<p align="center">
  <img src="https://ndamaps.vn/logo.png" width="200" alt="NDAMaps Logo" />
</p>

# @ndamaps/sdk

Official TypeScript/JavaScript SDK for **NDAMaps** — Vietnam's national digital map platform API.

## Features

- **Places** — Autocomplete (Google & OSM), place detail, children, nearby search
- **Geocoding** — Forward and reverse geocoding (address ↔ coordinates)
- **Navigation** — Directions, distance matrix, optimized multi-stop route
- **Maps** — Static map image URLs and MapLibre `style.json` URLs (`MAP_TILE_STYLES`)
- **NDAView** — Street-level 360° imagery (thumbnails + search)
- **Forcodes** — Encode/decode coordinates to compact location codes
- **Session management** — Automatic billing optimization for autocomplete → place detail
- **Typed** — TypeScript types for parameters and responses
- **Runtime** — Uses native `fetch` (no HTTP dependency)

## Requirements

- Node.js **18+**
- TypeScript **5.0+** recommended for inference

## Install

```bash
npm install @ndamaps/sdk
```

## Quick start

```typescript
import { NDAMapsClient } from '@ndamaps/sdk'

const client = new NDAMapsClient({ apiKey: 'YOUR_API_KEY' })

const results = await client.places.autocomplete({ input: 'Lotte Mall Tây Hồ' })
console.log(results.predictions[0].description)
// → "Lotte Mall Tây Hồ, Phú Thượng, Tây Hồ, Hà Nội"
```

## API reference

### Places

```typescript
// Autocomplete (Google format)
const res = await client.places.autocomplete({ input: 'Hồ Hoàn Kiếm' })
console.log(res.predictions[0].place_id)

// Autocomplete (OSM/GeoJSON format)
const res = await client.places.autocomplete({ text: 'Hồ Hoàn Kiếm' })
console.log(res.features[0].properties.id)

// Place detail (reuses session token from autocomplete automatically)
const detail = await client.places.placeDetail({ ids: 'PLACE_ID', format: 'google' })
console.log(detail.result.name, detail.result.geometry.location)

// Children (sub-locations of a place)
const children = await client.places.children({ parent_id: 'PARENT_ID' })

// Nearby search
const nearby = await client.places.nearby({
  categories: 'restaurant',
  'point.lat': 21.0265,
  'point.lon': 105.8524,
  size: 10,
})
```

### Geocoding

```typescript
// Forward: address → coordinates (Google format)
const res = await client.geocoding.forward({ address: '12 Ngõ 1 Dịch Vọng Hậu, Hà Nội' })
console.log(res.results[0].geometry.location)

// Forward (OSM format)
const res = await client.geocoding.forward({ text: '12 Ngõ 1 Dịch Vọng Hậu', size: 3 })

// Reverse (Google format)
const res = await client.geocoding.reverse({ latlng: '21.076,105.813' })
console.log(res.results[0].formatted_address)

// Reverse (OSM format)
const res = await client.geocoding.reverse({ 'point.lat': 21.076, 'point.lon': 105.813 })
```

### Navigation

```typescript
// Directions (single destination)
const route = await client.navigation.directions({
  origin: { lat: 21.03, lng: 105.79 },
  destination: { lat: 21.05, lng: 105.80 },
  vehicle: 'car', // car | bike | motor | taxi | truck | walking
  language: 'vi',
})
console.log(route.routes[0].legs[0].distance.text, route.routes[0].legs[0].duration.text)

// Multiple destinations (joined with ";")
const route = await client.navigation.directions({
  origin: '10.787,106.698',
  destination: ['10.791,106.702', { lat: 10.795, lng: 106.710 }],
})

// Distance matrix
const matrix = await client.navigation.distanceMatrix({
  sources: [{ lat: '21.03', lon: '105.79' }],
  targets: [{ lat: '21.05', lon: '105.79' }, { lat: '21.07', lon: '105.80' }],
})

// Optimized multi-stop route (traveling-salesperson style)
const optimized = await client.navigation.optimizedRoute({
  locations: [
    { lat: 21.03624, lon: 105.77142 },
    { lat: 21.03326, lon: 105.78743 },
    { lat: 21.00329, lon: 105.81834 },
    { lat: 21.03624, lon: 105.77142 },
  ],
  costing: 'auto',
})
console.log(optimized.trip.summary)
```

### Maps

```typescript
import { MAP_TILE_STYLES } from '@ndamaps/sdk'

// MapLibre style URL (no HTTP request from the SDK)
const styleUrl = client.maps.styleUrl(MAP_TILE_STYLES.DAY)

// Static map image URL (center mode)
const url = client.maps.staticMapUrl({
  mode: { mode: 'center', center: { lat: 21.03, lng: 105.79 }, zoom: 15 },
  width: 600,
  height: 400,
  retina: true,
  marker: '105.79,21.03|https://example.com/icon.svg',
})

// Area mode (bounding box)
const url = client.maps.staticMapUrl({
  mode: { mode: 'area', bbox: [105.7, 21.0, 105.9, 21.1] },
  width: 800,
  height: 600,
})

// Auto mode (fit to markers/path)
const url = client.maps.staticMapUrl({
  mode: { mode: 'auto' },
  width: 600,
  height: 400,
  path: '105.78,21.03,105.80,21.05',
})
```

### NDAView

```typescript
const thumbUrl = client.ndaview.staticThumbnailUrl({
  placePosition: { lat: 21.033, lng: 105.788 },
  yaw: 276,
  pitch: 20,
})

const results = await client.ndaview.search({
  placePosition: { lat: 21.033, lng: 105.788 },
  placeDistance: '3-15',
  limit: 10,
})
const hdUrl = results.features[0].assets.hd.href
```

### Forcodes

```typescript
const encoded = await client.forcodes.encode({
  lat: 20.990396,
  lng: 105.868825,
  resolution: 13,
})
console.log(encoded.forcodes, encoded.admin_code)

const decoded = await client.forcodes.decode({ forcodes: 'HNVTDXJEB2UBBO' })
console.log(decoded.lat, decoded.lng)
```

**Resolution (approx.):** 15 ≈ 0.5m · 13 ≈ 3.5m (default) · 11 ≈ 25m · 8 ≈ 461m · 5 ≈ 8.5km

## Session tokens (billing)

For Google-format **autocomplete** → **placeDetail** flows, the SDK:

1. Generates a UUID v4 `sessiontoken` when you omit it on `autocomplete({ input })`.
2. Reuses that token on the next `placeDetail()` and then clears it.
3. Tokens expire after **5 minutes**.

```typescript
const results = await client.places.autocomplete({ input: 'Lotte' })
const detail = await client.places.placeDetail({ ids: results.predictions[0].place_id })

// Manual session (optional)
const myToken = crypto.randomUUID()
await client.places.autocomplete({ input: 'Lotte', sessiontoken: myToken })
await client.places.placeDetail({ ids: '...', sessiontoken: myToken })
```

## Error handling

```typescript
import { NDAMapsClient, NDAMapsError, NDAMapsErrorCode } from '@ndamaps/sdk'

try {
  await client.forcodes.decode({ forcodes: 'INVALID' })
} catch (err) {
  if (err instanceof NDAMapsError) {
    console.log(err.code, err.message, err.statusCode)
  }
}
```

**Codes:** `INVALID_API_KEY`, `INVALID_FORCODE`, `PLACE_NOT_FOUND`, `ZERO_RESULTS`, `INVALID_PARAMS`, `NETWORK_ERROR`, `RATE_LIMIT_EXCEEDED`, `UNKNOWN`

**Retries:** **429** and **5xx** responses are retried up to **3** times with exponential backoff.

## Configuration

```typescript
const client = new NDAMapsClient({
  apiKey: 'YOUR_KEY',
  maxRetries: 3,
  baseDelayMs: 500,
  mapsApiBase: '...',
  tilesBase: '...',
  maptilesBase: '...', // static map tile host override (optional)
  ndaviewApiBase: '...',
})
```

## Links

- [NDAMaps documentation](https://docs.ndamaps.vn)
- [NDAMaps platform](https://ndamaps.vn)

## License

MIT
