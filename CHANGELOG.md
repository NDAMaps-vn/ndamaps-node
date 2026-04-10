# Changelog

## [0.1.0] — 2026-04-11

### Added

- Initial release of `@ndamaps/sdk`
- **Places module**: `autocomplete()`, `placeDetail()`, `children()`, `nearby()`
- **Geocoding module**: `forward()`, `reverse()`
- **Navigation module**: `directions()`, `distanceMatrix()`
- **Maps module**: `staticMapUrl()` (URL builder, no HTTP request)
- **NDAView module**: `staticThumbnailUrl()` (URL builder), `search()`
- **Forcodes module**: `encode()`, `decode()`
- Dual format support (Google / OSM) for autocomplete, place detail, geocoding
- Automatic session token management for billing optimization
- Custom error class `NDAMapsError` with typed error codes
- Retry logic with exponential backoff for transient errors
- Full TypeScript type definitions for all params and responses
- Zero runtime dependencies (native `fetch`, Node 18+)
- Dual ESM/CJS output with `.d.ts` declarations
- 53 unit tests (vitest + MSW) + 9 integration tests
