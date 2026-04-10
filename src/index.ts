// ─────────────────────────────────────────────
// NDAMaps SDK — Entry Point
// ─────────────────────────────────────────────

import { HttpClient } from './core/client.js'
import { SessionManager } from './core/session.js'
import { PlacesModule } from './modules/places.js'
import { GeocodingModule } from './modules/geocoding.js'
import { NavigationModule } from './modules/navigation.js'
import { MapsModule } from './modules/maps.js'
import { NdaViewModule } from './modules/ndaview.js'
import { ForcodesModule } from './modules/forcodes.js'
import type { NDAMapsClientOptions } from './core/types.js'

/**
 * Main entry point for the NDAMaps SDK.
 *
 * Creates a single client instance with access to all API modules:
 * - `places` — Autocomplete, place detail, children, nearby
 * - `geocoding` — Forward and reverse geocoding
 * - `navigation` — Routing and distance matrix
 * - `maps` — Static map URL builder
 * - `ndaview` — Street-level 360° imagery
 * - `forcodes` — Encode/decode Forcode strings
 *
 * @example
 * ```typescript
 * import { NDAMapsClient } from '@ndamaps/sdk'
 *
 * const client = new NDAMapsClient({ apiKey: 'YOUR_API_KEY' })
 *
 * // Autocomplete
 * const results = await client.places.autocomplete({ input: 'Lotte Mall' })
 *
 * // Routing
 * const route = await client.navigation.directions({
 *   origin: { lat: 21.03, lng: 105.79 },
 *   destination: { lat: 21.05, lng: 105.80 },
 * })
 *
 * // Forcodes
 * const forcode = await client.forcodes.encode({ lat: 21.03, lng: 105.79 })
 * ```
 */
export class NDAMapsClient {
  /** Place search, autocomplete, detail, children, nearby */
  readonly places: PlacesModule

  /** Forward and reverse geocoding */
  readonly geocoding: GeocodingModule

  /** Routing and distance matrix */
  readonly navigation: NavigationModule

  /** Static map image URL builder + tile style URLs */
  readonly maps: MapsModule

  /** Street-level 360° imagery */
  readonly ndaview: NdaViewModule

  /** Encode/decode Forcode strings */
  readonly forcodes: ForcodesModule

  /** @internal */
  private readonly httpClient: HttpClient

  /** @internal */
  private readonly sessionManager: SessionManager

  constructor(options: NDAMapsClientOptions) {
    if (!options.apiKey) {
      throw new Error('NDAMapsClient requires an apiKey')
    }

    this.httpClient = new HttpClient({
      apiKey: options.apiKey,
      maxRetries: options.maxRetries,
      baseDelayMs: options.baseDelayMs,
    })

    this.sessionManager = new SessionManager()

    // Initialize modules with dependency injection
    this.places = new PlacesModule(this.httpClient, this.sessionManager)
    this.geocoding = new GeocodingModule(this.httpClient)
    this.navigation = new NavigationModule(this.httpClient)
    this.maps = new MapsModule(
      options.apiKey,
      options.tilesBase,
      options.maptilesBase,
    )
    this.ndaview = new NdaViewModule(
      this.httpClient,
      options.ndaviewApiBase,
    )
    this.forcodes = new ForcodesModule(this.httpClient)
  }
}

// ── Re-exports ────────────────────────────────

// Default export
export default NDAMapsClient

// Core
export { NDAMapsError, NDAMapsErrorCode } from './core/errors.js'
export { SessionManager } from './core/session.js'
export { MAPS_API_BASE, TILES_BASE, MAPTILES_BASE, NDAVIEW_API_BASE } from './core/client.js'

// All types
export type * from './core/types.js'

// Modules (for advanced users who want to instantiate individually)
export { PlacesModule } from './modules/places.js'
export { GeocodingModule } from './modules/geocoding.js'
export { NavigationModule } from './modules/navigation.js'
export { MapsModule, MAP_TILE_STYLES } from './modules/maps.js'
export { NdaViewModule } from './modules/ndaview.js'
export { ForcodesModule } from './modules/forcodes.js'
