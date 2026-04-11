# Changelog

## 1.0.0 (2026-04-11)


### Features

* add NDAMapsClient entry point ([46bae31](https://github.com/NDAMaps-vn/ndamaps-node/commit/46bae31ebe68bb64994e1d12cb50eb374ca8f237))
* **core:** add types, errors, session manager, and HTTP client ([6b1c302](https://github.com/NDAMaps-vn/ndamaps-node/commit/6b1c3026886c2d4fa824063d51ef9a24c2b97998))
* **forcodes:** add Forcodes module for coordinate encoding ([3697763](https://github.com/NDAMaps-vn/ndamaps-node/commit/369776357ebaf67e493d91524c1682c016ba3a9b))
* **maps:** add Maps module with static map + tile style URL builders ([c6cb6af](https://github.com/NDAMaps-vn/ndamaps-node/commit/c6cb6affa2833d14d734bcc9cde452a912aa6485))
* **navigation:** add Navigation module ([38eb0f2](https://github.com/NDAMaps-vn/ndamaps-node/commit/38eb0f27c2883ce48af02570cf44e6e0e18a0d4a))
* **navigation:** add optimizedRoute SDK method ([33e1217](https://github.com/NDAMaps-vn/ndamaps-node/commit/33e121755ee49c04ef5988037b4e79a299d90dc6))
* **ndaview:** add NDAView module for 360° street-level imagery ([64eba62](https://github.com/NDAMaps-vn/ndamaps-node/commit/64eba621d662c09bf73a04443957b71903ea4dcb))
* **places, geocoding:** add Places and Geocoding modules ([4aad900](https://github.com/NDAMaps-vn/ndamaps-node/commit/4aad900559abaa37987f1299e6c3b93949e20a75))


### Bug Fixes

* **maps:** update map tiles base url to maptiles.ndamaps.vn ([bb49ca4](https://github.com/NDAMaps-vn/ndamaps-node/commit/bb49ca4ff29e9747821b9fbad056ea4b4039a33b))

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
