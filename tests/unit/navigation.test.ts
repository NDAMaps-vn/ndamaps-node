import { describe, it, expect } from 'vitest'
import { NDAMapsClient } from '../../src/index.js'

const client = new NDAMapsClient({ apiKey: 'test-key' })

describe('NavigationModule', () => {
  describe('directions()', () => {
    it('single destination → returns route', async () => {
      const res = await client.navigation.directions({
        origin: '10.787,106.698',
        destination: '10.791,106.702',
      })
      expect(res).toHaveProperty('routes')
      expect(res.routes).toHaveLength(1)
      expect(res.routes[0].legs[0].distance.text).toBe('3.2 km')
    })

    it('LatLng object input → auto convert to string', async () => {
      const res = await client.navigation.directions({
        origin: { lat: 10.787, lng: 106.698 },
        destination: { lat: 10.791, lng: 106.702 },
        vehicle: 'motor',
      })
      expect(res).toHaveProperty('routes')
      expect(res.routes[0].legs[0].duration.text).toBe('10 phút')
    })

    it('multiple destinations → joined with ";"', async () => {
      const res = await client.navigation.directions({
        origin: '10.787,106.698',
        destination: [
          { lat: 10.791, lng: 106.702 },
          '10.795,106.710',
        ],
      })
      expect(res).toHaveProperty('routes')
    })
  })

  describe('distanceMatrix()', () => {
    it('1-to-many → returns matrix', async () => {
      const res = await client.navigation.distanceMatrix({
        sources: [{ lat: '21.03', lon: '105.79' }],
        targets: [
          { lat: '21.05', lon: '105.79' },
          { lat: '21.07', lon: '105.80' },
        ],
      })
      expect(res).toHaveProperty('sources_to_targets')
      expect(res.sources_to_targets).toHaveLength(1)
      expect(res.sources_to_targets[0]).toHaveLength(2)
      expect(res.sources_to_targets[0][0].distance).toBe(3.2)
      expect(res.units).toBe('km')
    })
  })
})
