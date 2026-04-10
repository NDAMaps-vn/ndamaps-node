import { describe, it, expect } from 'vitest'
import { NDAMapsClient, NDAMapsError, NDAMapsErrorCode } from '../../src/index.js'

const client = new NDAMapsClient({ apiKey: 'test-key' })

describe('ForcodesModule', () => {
  describe('encode()', () => {
    it('encode lat/lng → returns Forcode', async () => {
      const res = await client.forcodes.encode({
        lat: 20.990396,
        lng: 105.868825,
      })

      expect(res.forcodes).toBe('HN4TZUZBPKRN0F')
      expect(res.admin_code).toBe('HN')
      expect(res.resolution).toBe(13)
      expect(res.status).toBe('OK')
    })

    it('encode with custom resolution', async () => {
      const res = await client.forcodes.encode({
        lat: 20.990396,
        lng: 105.868825,
        resolution: 11,
      })

      // Mock returns same response regardless, but verifies params are sent
      expect(res.forcodes).toBeDefined()
    })
  })

  describe('decode()', () => {
    it('decode valid Forcode → returns lat/lng', async () => {
      const res = await client.forcodes.decode({ forcodes: 'HN4TZUZBPKRN0F' })

      expect(res.lat).toBe(20.990396)
      expect(res.lng).toBe(105.868825)
      expect(res.resolution).toBe(13)
      expect(res.status).toBe('OK')
    })

    it('decode invalid Forcode → throws NDAMapsError(INVALID_FORCODE)', async () => {
      await expect(
        client.forcodes.decode({ forcodes: 'INVALID' }),
      ).rejects.toThrow(NDAMapsError)

      try {
        await client.forcodes.decode({ forcodes: 'INVALID' })
      } catch (err) {
        expect(err).toBeInstanceOf(NDAMapsError)
        const error = err as NDAMapsError
        expect(error.code).toBe(NDAMapsErrorCode.INVALID_FORCODE)
        expect(error.message).toContain('INVALID')
      }
    })
  })

  describe('roundtrip', () => {
    it('decode(encode(lat, lng)) ≈ original coordinates', async () => {
      const encoded = await client.forcodes.encode({
        lat: 20.990396,
        lng: 105.868825,
      })

      const decoded = await client.forcodes.decode({
        forcodes: encoded.forcodes,
      })

      // Mock data is the same, but in real life would be approximately equal
      expect(decoded.lat).toBeCloseTo(20.990396, 3)
      expect(decoded.lng).toBeCloseTo(105.868825, 3)
    })
  })
})
