// ─────────────────────────────────────────────
// NDAMaps SDK — Maps Module (Static Map URL Builder + Tile Styles)
// ─────────────────────────────────────────────

import { TILES_BASE, MAPTILES_BASE } from '../core/client.js'
import type { StaticMapParams, StaticMapCenterParams, MapTileStyle } from '../core/types.js'

/**
 * Available map tile styles provided by NDAMaps.
 *
 * Use these with `client.maps.styleUrl()` to get the style.json URL
 * for rendering vector tiles with MapLibre GL JS or similar libraries.
 */
export const MAP_TILE_STYLES = {
  /** Daytime map style — bright, clear colors */
  DAY: 'day-v1' as const,
  /** Nighttime/dark map style */
  NIGHT: 'night-v1' as const,
  /** Satellite imagery style */
  SATELLITE: 'satellite-v1' as const,
}

/**
 * Maps module — static map image URL builder + tile style URLs.
 *
 * **This module does NOT make HTTP requests.**
 * It builds URL strings that can be used in `<img src="...">` tags,
 * or as MapLibre GL style URLs for interactive maps.
 *
 * @example
 * ```typescript
 * // Static map image
 * const url = client.maps.staticMapUrl({
 *   mode: { mode: 'center', center: { lat: 21.03, lng: 105.79 }, zoom: 15 },
 *   width: 600,
 *   height: 400,
 *   retina: true,
 * })
 * // → https://maptiles.openmap.vn/styles/ndamap/static/105.79,21.03,15/600x400@2x.png?apikey=...
 *
 * // Tile style URL for MapLibre GL
 * const styleUrl = client.maps.styleUrl('day-v1')
 * // → https://maptiles.openmap.vn/styles/day-v1/style.json?apikey=...
 * ```
 */
export class MapsModule {
  constructor(
    private readonly apiKey: string,
    private readonly tilesBase: string = TILES_BASE,
    private readonly maptilesBase: string = MAPTILES_BASE,
  ) {}

  /**
   * Get the MapLibre GL style.json URL for a given map tile style.
   *
   * Use these URLs with MapLibre GL JS, MapLibre Native, or compatible renderers
   * to display interactive vector tile maps.
   *
   * Available styles:
   * - `day-v1` — Daytime map (bright, clear)
   * - `night-v1` — Nighttime map (dark mode)
   * - `satellite-v1` — Satellite imagery
   *
   * **No HTTP request is made** — returns a URL string.
   *
   * @param style - Map tile style identifier (default: 'day-v1')
   * @returns Style JSON URL string
   *
   * @example
   * ```typescript
   * // Day style
   * const dayUrl = client.maps.styleUrl('day-v1')
   *
   * // Night style
   * const nightUrl = client.maps.styleUrl('night-v1')
   *
   * // Satellite
   * const satUrl = client.maps.styleUrl('satellite-v1')
   *
   * // Use with MapLibre GL JS
   * const map = new maplibregl.Map({
   *   container: 'map',
   *   style: client.maps.styleUrl('day-v1'),
   *   center: [105.79, 21.03],
   *   zoom: 15,
   * })
   *
   * // Use convenience constants
   * import { MAP_TILE_STYLES } from '@ndamaps/sdk'
   * const url = client.maps.styleUrl(MAP_TILE_STYLES.NIGHT)
   * ```
   */
  styleUrl(style: MapTileStyle = 'day-v1'): string {
    const url = new URL(`${this.maptilesBase}/styles/${style}/style.json`)
    url.searchParams.set('apikey', this.apiKey)
    return url.toString()
  }

  /**
   * Build a static map image URL.
   *
   * Supports 3 modes:
   * 1. **center**: Specify center coordinate + zoom level
   * 2. **area**: Specify bounding box [minLon, minLat, maxLon, maxLat]
   * 3. **auto**: Auto-fit to markers/path (only useful when marker/path is provided)
   *
   * @param params - Static map configuration
   * @returns URL string (no HTTP request is made)
   *
   * @example
   * ```typescript
   * // Use in HTML
   * const url = client.maps.staticMapUrl({
   *   mode: { mode: 'center', center: { lat: 21.03, lng: 105.79 }, zoom: 15 },
   *   width: 600,
   *   height: 400,
   *   format: 'png',
   *   retina: true,
   *   marker: '105.79,21.03|https://example.com/marker.svg',
   * })
   * document.getElementById('map')!.src = url
   * ```
   */
  staticMapUrl(params: StaticMapParams): string {
    const styleId = params.styleId ?? 'ndamap'
    const format = params.format ?? 'png'
    const sizeStr = params.retina
      ? `${params.width}x${params.height}@2x`
      : `${params.width}x${params.height}`

    // Build the center/area/auto path segment
    let centerPath: string
    const modeConfig = params.mode

    switch (modeConfig.mode) {
      case 'center': {
        const m = modeConfig as StaticMapCenterParams
        // API expects: lon,lat,zoom[@bearing[,pitch]]
        let path = `${m.center.lng},${m.center.lat},${m.zoom}`
        if (m.bearing !== undefined) {
          path += `@${m.bearing}`
          if (m.pitch !== undefined) {
            path += `,${m.pitch}`
          }
        }
        centerPath = path
        break
      }
      case 'area': {
        // bbox: [minLon, minLat, maxLon, maxLat]
        centerPath = modeConfig.bbox.join(',')
        break
      }
      case 'auto': {
        centerPath = 'auto'
        break
      }
    }

    // Build URL
    const baseUrl = `${this.tilesBase}/styles/${styleId}/static/${centerPath}/${sizeStr}.${format}`
    const url = new URL(baseUrl)

    // Add query params
    url.searchParams.set('apikey', this.apiKey)

    if (params.marker) {
      url.searchParams.set('marker', params.marker)
    }
    if (params.path) {
      url.searchParams.set('path', params.path)
    }
    if (params.padding !== undefined) {
      url.searchParams.set('padding', String(params.padding))
    }

    return url.toString()
  }
}
