// ─────────────────────────────────────────────
// NDAMaps SDK — Places Module
// ─────────────────────────────────────────────

import { HttpClient, MAPS_API_BASE } from '../core/client.js'
import { NDAMapsError, NDAMapsErrorCode, mapResponseStatusToError } from '../core/errors.js'
import { SessionManager } from '../core/session.js'
import type {
  AutocompleteGoogleParams,
  AutocompleteOsmParams,
  AutocompleteGoogleResponse,
  AutocompleteOsmResponse,
  PlaceDetailParams,
  PlaceDetailGoogleResponse,
  PlaceDetailOsmResponse,
  PlaceChildrenParams,
  NearbyParams,
  FeatureCollection,
} from '../core/types.js'

/**
 * Places module — autocomplete, place detail, children, nearby.
 *
 * Session tokens are automatically managed for billing optimization:
 * - `autocomplete()` generates a token if not provided
 * - `placeDetail()` reuses the token from the last autocomplete (if still valid)
 *
 * @example
 * ```typescript
 * // Google format autocomplete
 * const res = await client.places.autocomplete({ input: 'Lotte Mall Tây Hồ' })
 * console.log(res.predictions[0].place_id)
 *
 * // Then get detail (session token reused automatically)
 * const detail = await client.places.placeDetail({ ids: res.predictions[0].place_id })
 * ```
 */
export class PlacesModule {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly sessionManager: SessionManager,
  ) {}

  /**
   * Tìm kiếm địa điểm với tính năng gợi ý tức thì.
   *
   * @param params - Google format: use `input`; OSM format: use `text`
   * @returns Predictions array (Google) or FeatureCollection (OSM)
   *
   * @example
   * ```typescript
   * // Google format
   * const res = await client.places.autocomplete({ input: 'Lotte Mall Tây Hồ' })
   * console.log(res.predictions[0].place_id)
   *
   * // OSM format
   * const res = await client.places.autocomplete({ text: 'Lotte Mall' })
   * console.log(res.features[0].properties.id)
   * ```
   *
   * @see https://docs.ndamaps.vn/autocomplete
   */
  async autocomplete(params: AutocompleteGoogleParams): Promise<AutocompleteGoogleResponse>
  async autocomplete(params: AutocompleteOsmParams): Promise<AutocompleteOsmResponse>
  async autocomplete(
    params: AutocompleteGoogleParams | AutocompleteOsmParams,
  ): Promise<AutocompleteGoogleResponse | AutocompleteOsmResponse> {
    // Auto-inject session token if not provided
    const sessiontoken = params.sessiontoken ?? this.sessionManager.getOrCreate()

    const queryParams: Record<string, string | number | boolean | undefined> = {
      sessiontoken,
      admin_v2: params.admin_v2,
      size: params.size,
    }

    if ('input' in params) {
      // Google format
      queryParams.input = params.input
      queryParams.location = params.location
      queryParams.origin = params.origin
      queryParams.radius = params.radius
    } else {
      // OSM format
      queryParams.text = params.text
      queryParams['boundary.circle.lat'] = params['boundary.circle.lat']
      queryParams['boundary.circle.lon'] = params['boundary.circle.lon']
      queryParams['boundary.circle.radius'] = params['boundary.circle.radius']
    }

    const response = await this.httpClient.get<
      AutocompleteGoogleResponse | AutocompleteOsmResponse
    >(MAPS_API_BASE, '/autocomplete', queryParams)

    // Check response status for Google format
    if ('status' in response) {
      const errorCode = mapResponseStatusToError(response.status)
      if (errorCode) {
        throw new NDAMapsError(errorCode, `Autocomplete failed: ${response.status}`, undefined, response)
      }
    }

    return response
  }

  /**
   * Lấy thông tin chi tiết của một địa điểm theo place_id.
   *
   * Session token từ lần autocomplete gần nhất sẽ được reuse tự động
   * nếu người dùng không truyền sessiontoken.
   *
   * @param params - Place detail params
   * @returns Place detail (Google or OSM format)
   *
   * @example
   * ```typescript
   * const detail = await client.places.placeDetail({
   *   ids: 'aQA0KHmLGXVtbpFgpMqFfA...',
   *   format: 'google',
   * })
   * console.log(detail.result.name)
   * ```
   *
   * @see https://docs.ndamaps.vn/place-detail
   */
  async placeDetail(
    params: PlaceDetailParams,
  ): Promise<PlaceDetailGoogleResponse | PlaceDetailOsmResponse> {
    // Reuse session token from autocomplete if available and not expired
    const sessiontoken =
      params.sessiontoken ?? this.sessionManager.getCurrent() ?? undefined

    const queryParams: Record<string, string | number | boolean | undefined> = {
      ids: params.ids,
      format: params.format ?? 'google', // SDK defaults to 'google' (API defaults to 'osm')
      sessiontoken,
      admin_v2: params.admin_v2,
    }

    const response = await this.httpClient.get<
      PlaceDetailGoogleResponse | PlaceDetailOsmResponse
    >(MAPS_API_BASE, '/place', queryParams)

    // Check response status for Google format
    if ('status' in response) {
      const errorCode = mapResponseStatusToError(response.status)
      if (errorCode) {
        throw new NDAMapsError(errorCode, `Place detail failed: ${response.status}`, undefined, response)
      }
    }

    return response
  }

  /**
   * Lấy danh sách các điểm con của một địa điểm.
   * Chỉ áp dụng khi has_child = true trong kết quả autocomplete/place detail.
   *
   * @param params - Parent place ID
   * @returns Child places in Google format
   *
   * @example
   * ```typescript
   * const children = await client.places.children({ parent_id: 'sCCOPkcjbElM...' })
   * console.log(children.predictions) // sub-locations
   * ```
   */
  async children(
    params: PlaceChildrenParams,
  ): Promise<AutocompleteGoogleResponse> {
    const queryParams: Record<string, string | number | boolean | undefined> = {
      parent_id: params.parent_id,
      admin_v2: params.admin_v2,
    }

    return this.httpClient.get<AutocompleteGoogleResponse>(
      MAPS_API_BASE,
      '/place/children',
      queryParams,
    )
  }

  /**
   * Tìm kiếm địa điểm lân cận theo danh mục.
   *
   * @param params - Nearby search params
   * @returns GeoJSON FeatureCollection
   *
   * @example
   * ```typescript
   * const nearby = await client.places.nearby({
   *   categories: 'restaurant',
   *   'point.lat': 21.0265,
   *   'point.lon': 105.8524,
   *   size: 10,
   * })
   * console.log(nearby.features.length)
   * ```
   */
  async nearby(params: NearbyParams): Promise<FeatureCollection> {
    const queryParams: Record<string, string | number | boolean | undefined> = {
      categories: params.categories,
      'point.lat': params['point.lat'],
      'point.lon': params['point.lon'],
      size: params.size,
      'boundary.circle.radius': params['boundary.circle.radius'],
      admin_v2: params.admin_v2,
    }

    return this.httpClient.get<FeatureCollection>(
      MAPS_API_BASE,
      '/nearby',
      queryParams,
    )
  }
}
