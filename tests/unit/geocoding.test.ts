import { describe, it, expect } from 'vitest'
import { NDAMapsClient } from '../../src/index.js'

const client = new NDAMapsClient({ apiKey: 'test-key' })

describe('GeocodingModule', () => {
  describe('forward()', () => {
    it('Google format → returns results array', async () => {
      const res = await client.geocoding.forward({ address: '12 Ngõ 1 Dịch Vọng Hậu' })
      expect(res).toHaveProperty('results')
      expect(res).toHaveProperty('status', 'OK')
      expect(res.results).toHaveLength(1)
      expect(res.results[0].geometry.location).toEqual({ lat: 21.038, lng: 105.782 })
    })

    it('OSM format → returns FeatureCollection', async () => {
      const res = await client.geocoding.forward({ text: '12 Ngõ 1 Dịch Vọng Hậu' })
      expect(res).toHaveProperty('type', 'FeatureCollection')
      expect(res).toHaveProperty('features')
    })
  })

  describe('reverse()', () => {
    it('Google format → returns results array', async () => {
      const res = await client.geocoding.reverse({ latlng: '21.076,105.813' })
      expect(res).toHaveProperty('results')
      expect(res).toHaveProperty('status', 'OK')
      expect(res.results[0].formatted_address).toContain('Dịch Vọng Hậu')
    })

    it('OSM format → returns FeatureCollection', async () => {
      const res = await client.geocoding.reverse({
        'point.lat': 21.076,
        'point.lon': 105.813,
      })
      expect(res).toHaveProperty('type', 'FeatureCollection')
    })
  })
})
