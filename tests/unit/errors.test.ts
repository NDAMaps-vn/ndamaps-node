import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../setup.js'
import { NDAMapsClient, NDAMapsError, NDAMapsErrorCode } from '../../src/index.js'
import { mapHttpStatusToErrorCode, mapResponseStatusToError } from '../../src/core/errors.js'

const MAPS_API_BASE = 'https://mapapis.ndamaps.vn/v1'

describe('Error Handling', () => {
  describe('mapHttpStatusToErrorCode()', () => {
    it('400 → INVALID_PARAMS', () => {
      expect(mapHttpStatusToErrorCode(400)).toBe(NDAMapsErrorCode.INVALID_PARAMS)
    })

    it('401 → INVALID_API_KEY', () => {
      expect(mapHttpStatusToErrorCode(401)).toBe(NDAMapsErrorCode.INVALID_API_KEY)
    })

    it('403 → INVALID_API_KEY', () => {
      expect(mapHttpStatusToErrorCode(403)).toBe(NDAMapsErrorCode.INVALID_API_KEY)
    })

    it('404 → PLACE_NOT_FOUND', () => {
      expect(mapHttpStatusToErrorCode(404)).toBe(NDAMapsErrorCode.PLACE_NOT_FOUND)
    })

    it('429 → RATE_LIMIT_EXCEEDED', () => {
      expect(mapHttpStatusToErrorCode(429)).toBe(NDAMapsErrorCode.RATE_LIMIT_EXCEEDED)
    })

    it('500 → NETWORK_ERROR', () => {
      expect(mapHttpStatusToErrorCode(500)).toBe(NDAMapsErrorCode.NETWORK_ERROR)
    })
  })

  describe('mapResponseStatusToError()', () => {
    it('INVALID_FORCODES → INVALID_FORCODE', () => {
      expect(mapResponseStatusToError('INVALID_FORCODES')).toBe(NDAMapsErrorCode.INVALID_FORCODE)
    })

    it('NOT_FOUND → PLACE_NOT_FOUND', () => {
      expect(mapResponseStatusToError('NOT_FOUND')).toBe(NDAMapsErrorCode.PLACE_NOT_FOUND)
    })

    it('ZERO_RESULTS → ZERO_RESULTS', () => {
      expect(mapResponseStatusToError('ZERO_RESULTS')).toBe(NDAMapsErrorCode.ZERO_RESULTS)
    })

    it('OK → null (no error)', () => {
      expect(mapResponseStatusToError('OK')).toBeNull()
    })
  })

  describe('HTTP error integration', () => {
    it('HTTP 401 → throws NDAMapsError(INVALID_API_KEY)', async () => {
      server.use(
        http.get(`${MAPS_API_BASE}/autocomplete`, () => {
          return HttpResponse.json({ status: 'ERROR', message: 'Invalid API key' }, { status: 401 })
        }),
      )

      const client = new NDAMapsClient({ apiKey: 'bad-key' })

      try {
        await client.places.autocomplete({ input: 'test' })
        expect.fail('Should have thrown')
      } catch (err) {
        expect(err).toBeInstanceOf(NDAMapsError)
        const error = err as NDAMapsError
        expect(error.code).toBe(NDAMapsErrorCode.INVALID_API_KEY)
        expect(error.statusCode).toBe(401)
      }
    })

    it('HTTP 500 → retry 3 times then throw NETWORK_ERROR', async () => {
      let attempts = 0
      server.use(
        http.get(`${MAPS_API_BASE}/autocomplete`, () => {
          attempts++
          return HttpResponse.json({ status: 'ERROR', message: 'Server error' }, { status: 500 })
        }),
      )

      const client = new NDAMapsClient({
        apiKey: 'test-key',
        maxRetries: 3,
        baseDelayMs: 10, // Speed up test
      })

      try {
        await client.places.autocomplete({ input: 'test' })
        expect.fail('Should have thrown')
      } catch (err) {
        expect(err).toBeInstanceOf(NDAMapsError)
        const error = err as NDAMapsError
        expect(error.code).toBe(NDAMapsErrorCode.NETWORK_ERROR)
        expect(attempts).toBe(4) // 1 initial + 3 retries
      }
    })
  })

  describe('NDAMapsError class', () => {
    it('instanceof works correctly', () => {
      const error = new NDAMapsError(NDAMapsErrorCode.INVALID_API_KEY, 'bad key', 401)
      expect(error).toBeInstanceOf(NDAMapsError)
      expect(error).toBeInstanceOf(Error)
      expect(error.name).toBe('NDAMapsError')
      expect(error.code).toBe(NDAMapsErrorCode.INVALID_API_KEY)
      expect(error.statusCode).toBe(401)
      expect(error.message).toBe('bad key')
    })
  })
})
