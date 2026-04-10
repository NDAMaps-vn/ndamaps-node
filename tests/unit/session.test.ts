import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SessionManager, generateUuidV4 } from '../../src/core/session.js'

describe('SessionManager', () => {
  let session: SessionManager

  beforeEach(() => {
    session = new SessionManager()
  })

  it('getOrCreate() → generates new UUID v4 token', () => {
    const token = session.getOrCreate()
    expect(token).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    )
  })

  it('getOrCreate() → reuses same token within TTL', () => {
    const token1 = session.getOrCreate()
    const token2 = session.getOrCreate()
    expect(token1).toBe(token2)
  })

  it('token expires after 5 minutes → generates new token', () => {
    const token1 = session.getOrCreate()

    // Advance time by 5 minutes + 1ms
    vi.useFakeTimers()
    vi.advanceTimersByTime(5 * 60 * 1000 + 1)

    const token2 = session.getOrCreate()
    expect(token2).not.toBe(token1)
    expect(token2).toMatch(/^[0-9a-f]{8}-/)

    vi.useRealTimers()
  })

  it('reset() → clears token, next getOrCreate() returns new one', () => {
    const token1 = session.getOrCreate()
    session.reset()

    expect(session.getCurrent()).toBeNull()

    const token2 = session.getOrCreate()
    expect(token2).not.toBe(token1)
  })

  it('getCurrent() → returns null when no token', () => {
    expect(session.getCurrent()).toBeNull()
  })

  it('getCurrent() → returns token when valid', () => {
    const token = session.getOrCreate()
    expect(session.getCurrent()).toBe(token)
  })

  it('getCurrent() → returns null when expired', () => {
    session.getOrCreate()

    vi.useFakeTimers()
    vi.advanceTimersByTime(5 * 60 * 1000 + 1)

    expect(session.getCurrent()).toBeNull()

    vi.useRealTimers()
  })
})

describe('generateUuidV4()', () => {
  it('returns valid UUID v4 format', () => {
    const uuid = generateUuidV4()
    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    )
  })

  it('generates unique UUIDs', () => {
    const uuids = new Set(Array.from({ length: 100 }, () => generateUuidV4()))
    expect(uuids.size).toBe(100)
  })
})
