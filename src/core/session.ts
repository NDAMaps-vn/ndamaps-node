// ─────────────────────────────────────────────
// NDAMaps SDK — Session Token Manager
// ─────────────────────────────────────────────

/**
 * Manages session tokens (UUID v4) for Autocomplete + Place Detail billing optimization.
 *
 * A session groups autocomplete requests with a subsequent place detail request,
 * so that the autocomplete calls are free and only the final place detail is billed.
 *
 * Session tokens expire after 5 minutes. The manager automatically generates
 * a new token when the current one expires.
 *
 * @example
 * ```typescript
 * const session = new SessionManager()
 *
 * // First call — generates a new token
 * const token1 = session.getOrCreate() // "a1b2c3d4-..."
 *
 * // Within 5 minutes — reuses same token
 * const token2 = session.getOrCreate() // same "a1b2c3d4-..."
 *
 * // After selecting a place, reset for next search
 * session.reset()
 * ```
 */
export class SessionManager {
  private token: string | null = null
  private createdAt: number | null = null

  /** Session token time-to-live: 5 minutes */
  private readonly TTL_MS = 5 * 60 * 1000

  /**
   * Get the current valid session token, or create a new one.
   * Automatically regenerates if the current token has expired.
   */
  getOrCreate(): string {
    if (!this.token || this.isExpired()) {
      this.token = generateUuidV4()
      this.createdAt = Date.now()
    }
    return this.token
  }

  /**
   * Get the current token without creating a new one.
   * Returns null if no token exists or if it has expired.
   */
  getCurrent(): string | null {
    if (!this.token || this.isExpired()) {
      return null
    }
    return this.token
  }

  /**
   * Reset the session (clear token).
   * Call this after a place detail request to start a fresh session.
   */
  reset(): void {
    this.token = null
    this.createdAt = null
  }

  /**
   * Check if the current token has expired.
   * Uses timestamp comparison — does NOT use setTimeout.
   */
  private isExpired(): boolean {
    return this.createdAt !== null && Date.now() - this.createdAt > this.TTL_MS
  }
}

/**
 * Generate a UUID v4 string.
 * Uses crypto.randomUUID() when available (Node 19+, modern browsers),
 * falls back to manual generation for Node 18.
 * @internal
 */
export function generateUuidV4(): string {
  // Use native crypto.randomUUID if available
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  // Fallback: manual UUID v4 generation
  const bytes = new Uint8Array(16)
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes)
  } else {
    // Last resort: Math.random (not cryptographically secure, but functional)
    for (let i = 0; i < 16; i++) {
      bytes[i] = Math.floor(Math.random() * 256)
    }
  }

  // Set version (4) and variant (10xx) bits
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-')
}
