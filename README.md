# @ndamaps/sdk

Official TypeScript/JavaScript SDK for **NDAMaps** — Vietnam's national digital map platform API.

## Features

- 🗺️ **Places** — Autocomplete, place detail, children, nearby search
- 📍 **Geocoding** — Forward & reverse geocoding (address ↔ coordinates)
- 🚗 **Navigation** — Turn-by-turn routing & distance matrix
- 🖼️ **Maps** — Static map image URL builder
- 📸 **NDAView** — Street-level 360° imagery
- 🔢 **Forcodes** — Encode/decode coordinates to compact location codes
- 🔄 **Session management** — Automatic billing optimization
- 💪 **Fully typed** — Complete TypeScript types for all params & responses
- ⚡ **Zero dependencies** — Uses native `fetch` (Node 18+)

## Quick Start

### 1. Install

```bash
npm install @ndamaps/sdk
```

### 2. Initialize

```typescript
import { NDAMapsClient } from '@ndamaps/sdk'

const client = new NDAMapsClient({ apiKey: 'YOUR_API_KEY' })
```

### 3. Use

```typescript
// Autocomplete search
const results = await client.places.autocomplete({ input: 'Lotte Mall Tây Hồ' })
console.log(results.predictions[0].description)
// → "Lotte Mall Tây Hồ, Phú Thượng, Tây Hồ, Hà Nội"
```

## API Reference

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
console.log(res.results[0].geometry.location) // { lat: 21.038, lng: 105.782 }

// Forward: address → coordinates (OSM format)
const res = await client.geocoding.forward({ text: '12 Ngõ 1 Dịch Vọng Hậu', size: 3 })

// Reverse: coordinates → address (Google format)
const res = await client.geocoding.reverse({ latlng: '21.076,105.813' })
console.log(res.results[0].formatted_address)

// Reverse: coordinates → address (OSM format)
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
console.log(route.routes[0].legs[0].distance.text) // "3.80 km"
console.log(route.routes[0].legs[0].duration.text)  // "8 phút"

// Directions (multiple destinations — joined with ";")
const route = await client.navigation.directions({
  origin: '10.787,106.698',
  destination: ['10.791,106.702', { lat: 10.795, lng: 106.710 }],
})

// Distance matrix
const matrix = await client.navigation.distanceMatrix({
  sources: [{ lat: '21.03', lon: '105.79' }],
  targets: [{ lat: '21.05', lon: '105.79' }, { lat: '21.07', lon: '105.80' }],
})
```

### Maps (Static Map URL Builder)

```typescript
// Center mode — NO HTTP request, returns URL string
const url = client.maps.staticMapUrl({
  mode: { mode: 'center', center: { lat: 21.03, lng: 105.79 }, zoom: 15 },
  width: 600,
  height: 400,
  retina: true,
  marker: '105.79,21.03|https://example.com/icon.svg',
})
// → https://maptiles.openmap.vn/styles/ndamap/static/105.79,21.03,15/600x400@2x.png?marker=...&apikey=...

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

### NDAView (Street-level 360° Imagery)

```typescript
// Static thumbnail URL (NO HTTP request)
const thumbUrl = client.ndaview.staticThumbnailUrl({
  placePosition: { lat: 21.033, lng: 105.788 },
  yaw: 276,
  pitch: 20,
})

// Search for nearby imagery
const results = await client.ndaview.search({
  placePosition: { lat: 21.033, lng: 105.788 },
  placeDistance: '3-15',
  limit: 10,
})
const hdUrl = results.features[0].assets.hd.href  // Full resolution
const sdUrl = results.features[0].assets.sd.href   // 2048px
```

### Forcodes

```typescript
// Encode coordinates → Forcode
const encoded = await client.forcodes.encode({
  lat: 20.990396,
  lng: 105.868825,
  resolution: 13, // ≈3.5m precision (default)
})
console.log(encoded.forcodes)    // "HNVTDXJEB2UBBO"
console.log(encoded.admin_code)  // "HNVT"

// Decode Forcode → coordinates
const decoded = await client.forcodes.decode({ forcodes: 'HNVTDXJEB2UBBO' })
console.log(decoded.lat, decoded.lng) // 20.990384, 105.868851

// Resolution guide:
// 15 ≈ 0.5m  (ultra-precise)
// 13 ≈ 3.5m  (house/room — default)
// 11 ≈ 25m   (building)
// 8  ≈ 461m  (city block)
// 5  ≈ 8.5km (district)
```

## Session Token Guide (Billing Optimization)

The SDK automatically manages session tokens for `autocomplete()` → `placeDetail()` flows:

1. When you call `autocomplete()` without a `sessiontoken`, the SDK generates a UUID v4 token
2. When you call `placeDetail()`, the SDK reuses the token from the last `autocomplete()` call
3. This groups the requests into one billing session (free autocomplete + billed place detail)
4. Tokens expire after 5 minutes and are automatically regenerated

```typescript
// ✅ Automatic — no manual token management needed
const results = await client.places.autocomplete({ input: 'Lotte' })
const detail = await client.places.placeDetail({ ids: results.predictions[0].place_id })
// Both use the same session token automatically!

// Manual token management (if needed)
const myToken = crypto.randomUUID()
const results = await client.places.autocomplete({ input: 'Lotte', sessiontoken: myToken })
const detail = await client.places.placeDetail({ ids: '...', sessiontoken: myToken })
```

## Error Handling

```typescript
import { NDAMapsClient, NDAMapsError, NDAMapsErrorCode } from '@ndamaps/sdk'

try {
  await client.forcodes.decode({ forcodes: 'INVALID' })
} catch (err) {
  if (err instanceof NDAMapsError) {
    console.log(err.code)       // 'INVALID_FORCODE' | 'INVALID_API_KEY' | ...
    console.log(err.message)    // Human-readable message
    console.log(err.statusCode) // HTTP status code (if applicable)
  }
}
```

**Error codes**: `INVALID_API_KEY`, `INVALID_FORCODE`, `PLACE_NOT_FOUND`, `ZERO_RESULTS`, `INVALID_PARAMS`, `NETWORK_ERROR`, `RATE_LIMIT_EXCEEDED`, `UNKNOWN`

**Retry**: The SDK automatically retries failed requests (status 429, 500, 502, 503, 504) up to 3 times with exponential backoff.

## Configuration

```typescript
const client = new NDAMapsClient({
  apiKey: 'YOUR_KEY',         // Required
  maxRetries: 3,              // Default: 3
  baseDelayMs: 500,           // Default: 500ms (exponential backoff)
  mapsApiBase: '...',         // Override Maps API base URL
  tilesBase: '...',           // Override Tiles base URL
  ndaviewApiBase: '...',      // Override NDAView API base URL
})
```

## Requirements

- Node.js 18+ (uses native `fetch`)
- TypeScript 5.0+ (for best type inference)

## Links

- 📖 [NDAMaps Documentation](https://docs.ndamaps.vn)
- 🗺️ [NDAMaps Platform](https://ndamaps.vn)

## License

MIT
