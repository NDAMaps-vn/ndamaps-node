// ─────────────────────────────────────────────
// NDAMaps SDK — HTTP Client Wrapper
// ─────────────────────────────────────────────

import {
  NDAMapsError,
  NDAMapsErrorCode,
  mapHttpStatusToErrorCode,
  RETRYABLE_STATUS_CODES,
} from './errors.js'

/** Maps API base URL (Places, Geocoding, Navigation, Forcodes) */
export const MAPS_API_BASE = 'https://mapapis.ndamaps.vn/v1'

/** Tile server base URL (Static Map + Tile Styles) */
export const TILES_BASE = 'https://nda-tiles.openmap.vn'

/** @deprecated Use TILES_BASE instead — both static maps and tile styles share the same base */
export const MAPTILES_BASE = TILES_BASE

/** NDAView API base URL (Street-level imagery) */
export const NDAVIEW_API_BASE = 'https://api-view.ndamaps.vn/v1'

export interface HttpClientOptions {
  apiKey: string
  maxRetries?: number
  baseDelayMs?: number
}

/**
 * Low-level HTTP client with automatic API key injection, retry logic,
 * and error mapping. Uses native fetch (Node 18+).
 *
 * @internal — Modules receive this via dependency injection from NDAMapsClient.
 */
export class HttpClient {
  private readonly apiKey: string
  private readonly maxRetries: number
  private readonly baseDelayMs: number

  constructor(options: HttpClientOptions) {
    this.apiKey = options.apiKey
    this.maxRetries = options.maxRetries ?? 3
    this.baseDelayMs = options.baseDelayMs ?? 500
  }

  /**
   * Perform a GET request.
   * @param baseUrl - Base URL (e.g. MAPS_API_BASE)
   * @param path - API path (e.g. "/autocomplete")
   * @param params - Query parameters (apikey is auto-injected)
   */
  async get<T>(
    baseUrl: string,
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<T> {
    const url = this.buildUrl(baseUrl, path, params)
    return this.executeWithRetry<T>(url, { method: 'GET' })
  }

  /**
   * Perform a POST request.
   * @param baseUrl - Base URL
   * @param path - API path
   * @param params - Query parameters (sent as query string, not body)
   */
  async post<T>(
    baseUrl: string,
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<T> {
    const url = this.buildUrl(baseUrl, path, params)
    return this.executeWithRetry<T>(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
  }

  /**
   * Build a full URL string (for URL-builder methods like staticMapUrl).
   * Does NOT make an HTTP request.
   */
  buildFullUrl(
    baseUrl: string,
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): string {
    return this.buildUrl(baseUrl, path, params).toString()
  }

  /** Get the API key (for URL builders that need it) */
  getApiKey(): string {
    return this.apiKey
  }

  // ── Private ───────────────────────────────

  private buildUrl(
    baseUrl: string,
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): URL {
    const url = new URL(`${baseUrl}${path}`)
    url.searchParams.set('apikey', this.apiKey)

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value))
        }
      }
    }

    return url
  }

  private async executeWithRetry<T>(
    url: URL,
    init: RequestInit,
    attempt = 0,
  ): Promise<T> {
    let response: Response

    try {
      response = await fetch(url.toString(), init)
    } catch (error) {
      // Network-level error (DNS, timeout, etc.)
      if (attempt < this.maxRetries) {
        await this.sleep(this.getBackoffDelay(attempt))
        return this.executeWithRetry<T>(url, init, attempt + 1)
      }
      throw new NDAMapsError(
        NDAMapsErrorCode.NETWORK_ERROR,
        `Network error after ${this.maxRetries + 1} attempts: ${error instanceof Error ? error.message : String(error)}`,
        undefined,
        error,
      )
    }

    // Retryable HTTP status codes
    if (
      RETRYABLE_STATUS_CODES.includes(response.status) &&
      attempt < this.maxRetries
    ) {
      await this.sleep(this.getBackoffDelay(attempt))
      return this.executeWithRetry<T>(url, init, attempt + 1)
    }

    // Non-retryable HTTP errors
    if (!response.ok) {
      let rawBody: unknown
      try {
        rawBody = await response.json()
      } catch {
        rawBody = await response.text().catch(() => null)
      }

      const errorCode = mapHttpStatusToErrorCode(response.status)
      const message =
        rawBody && typeof rawBody === 'object' && 'message' in rawBody
          ? String((rawBody as Record<string, unknown>).message)
          : `HTTP ${response.status}: ${response.statusText}`

      throw new NDAMapsError(errorCode, message, response.status, rawBody)
    }

    // Parse successful response
    const data = (await response.json()) as T
    return data
  }

  private getBackoffDelay(attempt: number): number {
    // Exponential backoff: 500ms, 1000ms, 2000ms, ...
    return this.baseDelayMs * Math.pow(2, attempt)
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
