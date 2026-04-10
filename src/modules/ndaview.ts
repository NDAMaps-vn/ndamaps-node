// ─────────────────────────────────────────────
// NDAMaps SDK — NDAView Module (Street-level 360° Imagery)
// ─────────────────────────────────────────────

import { HttpClient, NDAVIEW_API_BASE } from '../core/client.js'
import type {
  NdaViewStaticParams,
  NdaViewSearchParams,
  NdaViewFeatureCollection,
} from '../core/types.js'

/**
 * NDAView module — street-level 360° imagery viewer.
 *
 * Two methods:
 * - `staticThumbnailUrl()` — URL builder for static thumbnail images (no HTTP call)
 * - `search()` — search for 360° imagery by location, bbox, or datetime
 *
 * @example
 * ```typescript
 * // Get a static thumbnail URL
 * const thumbUrl = client.ndaview.staticThumbnailUrl({
 *   placePosition: { lat: 21.033, lng: 105.788 },
 *   yaw: 276,
 *   pitch: 20,
 * })
 *
 * // Search for street-level imagery
 * const results = await client.ndaview.search({
 *   placePosition: { lat: 21.033, lng: 105.788 },
 *   limit: 5,
 * })
 * const hdUrl = results.features[0].assets.hd.href
 * ```
 */
export class NdaViewModule {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly ndaviewBase: string = NDAVIEW_API_BASE,
  ) {}

  /**
   * Build a URL for a static street-level thumbnail image.
   *
   * **No HTTP request is made** — returns a URL string for use in `<img src="...">`.
   *
   * @param params - Thumbnail params (id or placePosition required)
   * @returns URL string for the JPEG thumbnail
   *
   * @example
   * ```typescript
   * // By coordinates
   * const url = client.ndaview.staticThumbnailUrl({
   *   placePosition: { lat: 21.033, lng: 105.788 },
   *   yaw: 276,
   * })
   *
   * // By item ID
   * const url = client.ndaview.staticThumbnailUrl({
   *   id: 'e213daed-3ae2-4259-940b-444a4056c101',
   * })
   * ```
   */
  staticThumbnailUrl(params: NdaViewStaticParams): string {
    const url = new URL(`${this.ndaviewBase}/items/static/thumbnail.jpeg`)
    url.searchParams.set('apikey', this.httpClient.getApiKey())

    if (params.id) {
      url.searchParams.set('id', params.id)
    }
    if (params.placePosition) {
      // API expects "lon,lat" format
      url.searchParams.set(
        'place_position',
        `${params.placePosition.lng},${params.placePosition.lat}`,
      )
    }
    if (params.yaw !== undefined) {
      url.searchParams.set('yaw', String(params.yaw))
    }
    if (params.pitch !== undefined) {
      url.searchParams.set('pitch', String(params.pitch))
    }

    return url.toString()
  }

  /**
   * Tìm kiếm ảnh 360° theo vị trí, bounding box, thời gian, hoặc ID.
   *
   * Returns a STAC FeatureCollection with assets for different resolutions:
   * - `thumb` — 500px width thumbnail
   * - `sd` — 2048px width standard definition
   * - `hd` — full resolution
   *
   * @param params - Search parameters
   * @returns STAC FeatureCollection with NDAView features
   *
   * @example
   * ```typescript
   * const results = await client.ndaview.search({
   *   placePosition: { lat: 21.033, lng: 105.788 },
   *   placeDistance: '3-15',
   *   limit: 10,
   * })
   *
   * for (const feature of results.features) {
   *   console.log(feature.id, feature.assets.thumb.href)
   * }
   * ```
   *
   * @see https://docs.ndamaps.vn/ndaview
   */
  async search(params: NdaViewSearchParams): Promise<NdaViewFeatureCollection> {
    const queryParams: Record<string, string | number | boolean | undefined> = {}

    if (params.placePosition) {
      // API expects "lon,lat"
      queryParams.place_position = `${params.placePosition.lng},${params.placePosition.lat}`
    }
    if (params.placeDistance) {
      queryParams.place_distance = params.placeDistance
    }
    if (params.placeFovTolerance !== undefined) {
      queryParams.place_fov_tolerance = params.placeFovTolerance
    }
    if (params.bbox) {
      queryParams.bbox = params.bbox
    }
    if (params.datetime) {
      queryParams.datetime = params.datetime
    }
    if (params.limit !== undefined) {
      queryParams.limit = params.limit
    }
    if (params.ids) {
      queryParams.ids = params.ids
    }
    if (params.collections) {
      queryParams.collections = params.collections
    }

    return this.httpClient.get<NdaViewFeatureCollection>(
      this.ndaviewBase,
      '/search',
      queryParams,
    )
  }
}
