// ─────────────────────────────────────────────
// NDAMaps SDK — Forcodes Module
// ─────────────────────────────────────────────

import { HttpClient, MAPS_API_BASE } from '../core/client.js'
import { NDAMapsError, NDAMapsErrorCode } from '../core/errors.js'
import type {
  ForcodeEncodeParams,
  ForcodeDecodeParams,
  ForcodeEncodeResponse,
  ForcodeDecodeResponse,
} from '../core/types.js'

/**
 * Forcodes module — encode/decode geographic coordinates to compact Forcode strings.
 *
 * Forcodes are unique to NDAMaps: they combine a Vietnamese admin code prefix
 * with an H3-based hexagonal grid index to create human-readable location codes.
 *
 * **Resolution guide** (for `encode()`):
 * | Resolution | Precision | Use Case |
 * |------------|-----------|----------|
 * | 15 | ≈0.5m | Ultra-precise (survey, engineering) |
 * | 13 | ≈3.5m | House/room level (default) |
 * | 11 | ≈25m | Single building |
 * | 8 | ≈461m | City block |
 * | 5 | ≈8.5km | District level |
 *
 * @example
 * ```typescript
 * // Encode coordinates to Forcode
 * const result = await client.forcodes.encode({ lat: 20.990396, lng: 105.868825 })
 * console.log(result.forcodes) // "HN4TZUZBPKRN0F"
 *
 * // Decode Forcode back to coordinates
 * const decoded = await client.forcodes.decode({ forcodes: 'HN4TZUZBPKRN0F' })
 * console.log(decoded.lat, decoded.lng)
 *
 * // Roundtrip: decode(encode(lat, lng)) ≈ (lat, lng)
 * ```
 */
export class ForcodesModule {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Chuyển đổi tọa độ (lat/lng) thành chuỗi Forcode.
   *
   * @param params - Latitude, longitude, and optional resolution (0-15, default 13)
   * @returns Forcode string with admin code and coordinates
   *
   * @example
   * ```typescript
   * const result = await client.forcodes.encode({
   *   lat: 20.990396,
   *   lng: 105.868825,
   *   resolution: 13, // ≈3.5m precision
   * })
   * console.log(result.forcodes)    // "HN4TZUZBPKRN0F"
   * console.log(result.admin_code)  // "HN" (Hà Nội)
   * ```
   *
   * @see https://docs.ndamaps.vn/forcodes
   */
  async encode(params: ForcodeEncodeParams): Promise<ForcodeEncodeResponse> {
    const queryParams: Record<string, string | number | boolean | undefined> = {
      lat: params.lat,
      lng: params.lng,
      resolution: params.resolution,
    }

    return this.httpClient.get<ForcodeEncodeResponse>(
      MAPS_API_BASE,
      '/forcodes/encode',
      queryParams,
    )
  }

  /**
   * Giải mã chuỗi Forcode thành tọa độ (lat/lng).
   *
   * **Lưu ý**: API trả về HTTP 200 nhưng `status: "INVALID_FORCODES"` nếu chuỗi không hợp lệ.
   * SDK sẽ tự động throw `NDAMapsError` với code `INVALID_FORCODE` trong trường hợp này.
   *
   * @param params - Forcode string to decode
   * @returns Decoded coordinates and resolution
   * @throws {NDAMapsError} With code `INVALID_FORCODE` if the Forcode string is invalid
   *
   * @example
   * ```typescript
   * const decoded = await client.forcodes.decode({ forcodes: 'HN4TZUZBPKRN0F' })
   * console.log(decoded.lat)        // 20.990396
   * console.log(decoded.lng)        // 105.868825
   * console.log(decoded.resolution) // 13
   *
   * // Invalid Forcode
   * try {
   *   await client.forcodes.decode({ forcodes: 'INVALID' })
   * } catch (err) {
   *   // NDAMapsError { code: 'INVALID_FORCODE', message: 'Invalid Forcode: INVALID' }
   * }
   * ```
   *
   * @see https://docs.ndamaps.vn/forcodes
   */
  async decode(params: ForcodeDecodeParams): Promise<ForcodeDecodeResponse> {
    const queryParams: Record<string, string | number | boolean | undefined> = {
      forcodes: params.forcodes,
    }

    const response = await this.httpClient.get<ForcodeDecodeResponse>(
      MAPS_API_BASE,
      '/forcodes/decode',
      queryParams,
    )

    // API returns HTTP 200 but status: "INVALID_FORCODES" for invalid inputs
    if (response.status === 'INVALID_FORCODES') {
      throw new NDAMapsError(
        NDAMapsErrorCode.INVALID_FORCODE,
        `Invalid Forcode: ${params.forcodes}`,
        undefined,
        response,
      )
    }

    return response
  }
}
