// ─────────────────────────────────────────────
// NDAMaps SDK — Navigation Module
// ─────────────────────────────────────────────

import { HttpClient, MAPS_API_BASE } from '../core/client.js'
import type {
  DirectionsParams,
  DirectionsResponse,
  DistanceMatrixParams,
  DistanceMatrixResponse,
  LatLng,
} from '../core/types.js'

/**
 * Convert LatLng object or string to "lat,lng" string format.
 * @internal
 */
function latLngToString(coord: string | LatLng): string {
  if (typeof coord === 'string') return coord
  return `${coord.lat},${coord.lng}`
}

/**
 * Navigation module — turn-by-turn routing and distance matrix.
 *
 * @example
 * ```typescript
 * // Simple A→B routing
 * const route = await client.navigation.directions({
 *   origin: { lat: 21.03, lng: 105.79 },
 *   destination: { lat: 21.05, lng: 105.80 },
 *   vehicle: 'car',
 * })
 * console.log(route.routes[0].legs[0].distance.text) // "3.2 km"
 *
 * // Multi-stop routing
 * const route = await client.navigation.directions({
 *   origin: '10.787,106.698',
 *   destination: ['10.791,106.702', '10.795,106.710'],
 * })
 *
 * // Distance matrix
 * const matrix = await client.navigation.distanceMatrix({
 *   sources: [{ lat: '21.03', lon: '105.79' }],
 *   targets: [{ lat: '21.05', lon: '105.79' }, { lat: '21.07', lon: '105.80' }],
 * })
 * ```
 */
export class NavigationModule {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Tìm đường đi giữa 2 hoặc nhiều điểm.
   *
   * Hỗ trợ nhiều loại phương tiện: car, bike, motor, taxi, truck, walking.
   * Destination có thể là 1 điểm hoặc nhiều điểm (join bằng ";").
   *
   * @param params - Directions params
   * @returns Route results with legs, steps, polylines
   *
   * @example
   * ```typescript
   * const route = await client.navigation.directions({
   *   origin: { lat: 10.787, lng: 106.698 },
   *   destination: { lat: 10.791, lng: 106.702 },
   *   vehicle: 'motor',
   *   language: 'vi',
   * })
   *
   * // Access route info
   * const leg = route.routes[0].legs[0]
   * console.log(`${leg.distance.text} — ${leg.duration.text}`)
   * console.log(leg.start_address, '→', leg.end_address)
   * ```
   *
   * @see https://docs.ndamaps.vn/direction
   */
  async directions(params: DirectionsParams): Promise<DirectionsResponse> {
    // Normalize origin
    const origin = latLngToString(params.origin)

    // Normalize destination(s) — arrays are joined with ";"
    let destination: string
    if (Array.isArray(params.destination)) {
      destination = params.destination.map(latLngToString).join(';')
    } else {
      destination = latLngToString(params.destination)
    }

    const queryParams: Record<string, string | number | boolean | undefined> = {
      origin,
      destination,
      vehicle: params.vehicle ?? 'car',
      alternatives: params.alternatives,
      language: params.language ?? 'vi',
      admin_v2: params.admin_v2,
    }

    return this.httpClient.get<DirectionsResponse>(
      MAPS_API_BASE,
      '/direction',
      queryParams,
    )
  }

  /**
   * Tính khoảng cách và thời gian di chuyển giữa nhiều điểm.
   *
   * @param params - Sources, targets, and options
   * @returns Distance matrix with time and distance for each source→target pair
   *
   * @example
   * ```typescript
   * const matrix = await client.navigation.distanceMatrix({
   *   sources: [{ lat: '21.03', lon: '105.79' }],
   *   targets: [
   *     { lat: '21.05', lon: '105.79' },
   *     { lat: '21.07', lon: '105.80' },
   *   ],
   * })
   *
   * // Access results
   * for (const row of matrix.sources_to_targets) {
   *   for (const entry of row) {
   *     console.log(`${entry.distance} km, ${entry.time} seconds`)
   *   }
   * }
   * ```
   *
   * @see https://docs.ndamaps.vn/distancematrix
   */
  async distanceMatrix(
    params: DistanceMatrixParams,
  ): Promise<DistanceMatrixResponse> {
    // The API takes a JSON string in the `json` query param
    const jsonBody = JSON.stringify({
      sources: params.sources,
      targets: params.targets,
    })

    const queryParams: Record<string, string | number | boolean | undefined> = {
      json: jsonBody,
      id: params.id,
      verbose: params.verbose ?? true,
      shape_format: params.shape_format ?? 'no_shape',
    }

    return this.httpClient.get<DistanceMatrixResponse>(
      MAPS_API_BASE,
      '/distancematrix',
      queryParams,
    )
  }
}
