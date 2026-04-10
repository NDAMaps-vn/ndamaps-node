// ─────────────────────────────────────────────
// NDAMaps SDK — Error Handling
// ─────────────────────────────────────────────

/**
 * Error codes for NDAMaps API errors.
 * Used to programmatically identify error types.
 */
export enum NDAMapsErrorCode {
  /** API key is missing or invalid (HTTP 401) */
  INVALID_API_KEY = 'INVALID_API_KEY',

  /** Forcode string is invalid (API returns status: "INVALID_FORCODES") */
  INVALID_FORCODE = 'INVALID_FORCODE',

  /** Place not found (HTTP 404 or status: "NOT_FOUND") */
  PLACE_NOT_FOUND = 'PLACE_NOT_FOUND',

  /** No results found (status: "ZERO_RESULTS") */
  ZERO_RESULTS = 'ZERO_RESULTS',

  /** Invalid request parameters (HTTP 400) */
  INVALID_PARAMS = 'INVALID_PARAMS',

  /** Network error or all retries exhausted */
  NETWORK_ERROR = 'NETWORK_ERROR',

  /** Rate limit exceeded (HTTP 429) */
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  /** Unknown or unmapped error */
  UNKNOWN = 'UNKNOWN',
}

/**
 * Custom error class for all NDAMaps API errors.
 *
 * @example
 * ```typescript
 * try {
 *   await client.forcodes.decode({ forcodes: 'INVALID' })
 * } catch (err) {
 *   if (err instanceof NDAMapsError && err.code === NDAMapsErrorCode.INVALID_FORCODE) {
 *     console.log('Invalid Forcode:', err.message)
 *   }
 * }
 * ```
 */
export class NDAMapsError extends Error {
  public readonly name = 'NDAMapsError'

  constructor(
    /** Machine-readable error code */
    public readonly code: NDAMapsErrorCode,
    /** Human-readable error message */
    message: string,
    /** HTTP status code (if applicable) */
    public readonly statusCode?: number,
    /** Raw response body (for debugging) */
    public readonly raw?: unknown,
  ) {
    super(message)
    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, NDAMapsError.prototype)
  }
}

/**
 * Map HTTP status codes to NDAMapsErrorCode.
 * @internal
 */
export function mapHttpStatusToErrorCode(status: number): NDAMapsErrorCode {
  switch (status) {
    case 400:
      return NDAMapsErrorCode.INVALID_PARAMS
    case 401:
    case 403:
      return NDAMapsErrorCode.INVALID_API_KEY
    case 404:
      return NDAMapsErrorCode.PLACE_NOT_FOUND
    case 429:
      return NDAMapsErrorCode.RATE_LIMIT_EXCEEDED
    default:
      if (status >= 500) return NDAMapsErrorCode.NETWORK_ERROR
      return NDAMapsErrorCode.UNKNOWN
  }
}

/**
 * Map API response status string to NDAMapsErrorCode.
 * Some APIs return HTTP 200 with error status in the body.
 * @internal
 */
export function mapResponseStatusToError(
  status: string,
): NDAMapsErrorCode | null {
  switch (status) {
    case 'INVALID_FORCODES':
      return NDAMapsErrorCode.INVALID_FORCODE
    case 'NOT_FOUND':
      return NDAMapsErrorCode.PLACE_NOT_FOUND
    case 'ZERO_RESULTS':
      return NDAMapsErrorCode.ZERO_RESULTS
    case 'INVALID_REQUEST':
      return NDAMapsErrorCode.INVALID_PARAMS
    case 'OK':
      return null
    default:
      return null
  }
}

/** HTTP status codes that are safe to retry with backoff */
export const RETRYABLE_STATUS_CODES = [429, 500, 502, 503, 504]
