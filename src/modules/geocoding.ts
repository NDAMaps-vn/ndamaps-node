// ─────────────────────────────────────────────
// NDAMaps SDK — Geocoding Module
// ─────────────────────────────────────────────

import { HttpClient, MAPS_API_BASE } from '../core/client.js'
import { NDAMapsError, mapResponseStatusToError } from '../core/errors.js'
import type {
  ForwardGeocodeGoogleParams,
  ForwardGeocodeOsmParams,
  ReverseGeocodeGoogleParams,
  ReverseGeocodeOsmParams,
  GeocodeGoogleResponse,
  ReverseGeocodeGoogleResponse,
  FeatureCollection,
} from '../core/types.js'

/**
 * Geocoding module — convert between addresses and coordinates.
 *
 * Supports both Google format and OSM format:
 * - **Google format**: use `address` (forward) or `latlng` (reverse)
 * - **OSM format**: use `text` (forward) or `point.lat` + `point.lon` (reverse)
 *
 * @example
 * ```typescript
 * // Forward geocode (Google format)
 * const res = await client.geocoding.forward({ address: '12 Ngõ 1 Dịch Vọng Hậu, Hà Nội' })
 * console.log(res.results[0].geometry.location)
 *
 * // Reverse geocode (OSM format)
 * const res = await client.geocoding.reverse({ 'point.lat': 21.076, 'point.lon': 105.813 })
 * console.log(res.features[0].properties.label)
 * ```
 */
export class GeocodingModule {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Chuyển đổi địa chỉ/tên địa điểm thành tọa độ.
   *
   * @param params - Google format: use `address`; OSM format: use `text`
   * @returns Geocode results (Google) or FeatureCollection (OSM)
   *
   * @example
   * ```typescript
   * // Google format
   * const res = await client.geocoding.forward({ address: '12 Ngõ 1 Dịch Vọng Hậu' })
   * const { lat, lng } = res.results[0].geometry.location
   *
   * // OSM format
   * const res = await client.geocoding.forward({ text: '12 Ngõ 1 Dịch Vọng Hậu', size: 3 })
   * const coords = res.features[0].geometry.coordinates // [lng, lat]
   * ```
   *
   * @see https://docs.ndamaps.vn/geocoding
   */
  async forward(params: ForwardGeocodeGoogleParams): Promise<GeocodeGoogleResponse>
  async forward(params: ForwardGeocodeOsmParams): Promise<FeatureCollection>
  async forward(
    params: ForwardGeocodeGoogleParams | ForwardGeocodeOsmParams,
  ): Promise<GeocodeGoogleResponse | FeatureCollection> {
    const queryParams: Record<string, string | number | boolean | undefined> = {
      admin_v2: params.admin_v2,
    }

    if ('address' in params) {
      queryParams.address = params.address
    } else {
      queryParams.text = params.text
      queryParams.size = params.size
    }

    const response = await this.httpClient.get<GeocodeGoogleResponse | FeatureCollection>(
      MAPS_API_BASE,
      '/geocode/forward',
      queryParams,
    )

    // Check status for Google format
    if ('status' in response) {
      const errorCode = mapResponseStatusToError(response.status)
      if (errorCode) {
        throw new NDAMapsError(errorCode, `Forward geocode failed: ${response.status}`, undefined, response)
      }
    }

    return response
  }

  /**
   * Chuyển đổi tọa độ thành địa chỉ/tên địa điểm.
   *
   * @param params - Google format: use `latlng`; OSM format: use `point.lat` + `point.lon`
   * @returns Reverse geocode results
   *
   * @example
   * ```typescript
   * // Google format
   * const res = await client.geocoding.reverse({ latlng: '21.075951,105.812662' })
   * console.log(res.results[0].formatted_address)
   *
   * // OSM format
   * const res = await client.geocoding.reverse({ 'point.lat': 21.076, 'point.lon': 105.813 })
   * console.log(res.features[0].properties.label)
   * ```
   *
   * @see https://docs.ndamaps.vn/geocoding
   */
  async reverse(params: ReverseGeocodeGoogleParams): Promise<ReverseGeocodeGoogleResponse>
  async reverse(params: ReverseGeocodeOsmParams): Promise<FeatureCollection>
  async reverse(
    params: ReverseGeocodeGoogleParams | ReverseGeocodeOsmParams,
  ): Promise<ReverseGeocodeGoogleResponse | FeatureCollection> {
    const queryParams: Record<string, string | number | boolean | undefined> = {
      admin_v2: params.admin_v2,
    }

    if ('latlng' in params) {
      queryParams.latlng = params.latlng
    } else {
      queryParams['point.lat'] = params['point.lat']
      queryParams['point.lon'] = params['point.lon']
      queryParams['boundary.circle.radius'] = params['boundary.circle.radius']
      queryParams.size = params.size
    }

    const response = await this.httpClient.get<ReverseGeocodeGoogleResponse | FeatureCollection>(
      MAPS_API_BASE,
      '/geocode/reverse',
      queryParams,
    )

    // Check status for Google format
    if ('status' in response && 'results' in response) {
      const errorCode = mapResponseStatusToError(response.status)
      if (errorCode) {
        throw new NDAMapsError(errorCode, `Reverse geocode failed: ${response.status}`, undefined, response)
      }
    }

    return response
  }
}
