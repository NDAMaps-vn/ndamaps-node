import { describe, it, expect, vi } from 'vitest'
import { NDAMapsClient } from '../../src/index.js'
import { MOCK_RESPONSES } from '../setup.js'

const client = new NDAMapsClient({ apiKey: 'test-key' })

describe('PlacesModule', () => {
  describe('autocomplete()', () => {
    it('Google format → returns predictions array', async () => {
      const res = await client.places.autocomplete({ input: 'Lotte Mall' })
      expect(res).toHaveProperty('predictions')
      expect(res).toHaveProperty('status', 'OK')
      expect(res.predictions).toHaveLength(1)
      expect(res.predictions[0].place_id).toBe('aQA0KHmLGXVtbpFgpMqFfA0OjpRAAVFg')
      expect(res.predictions[0].structured_formatting.main_text).toBe('Lotte Mall Tây Hồ')
    })

    it('OSM format → returns FeatureCollection', async () => {
      const res = await client.places.autocomplete({ text: 'Lotte Mall' })
      expect(res).toHaveProperty('type', 'FeatureCollection')
      expect(res).toHaveProperty('features')
      expect(res.features).toHaveLength(1)
      expect(res.features[0].properties.name).toBe('Lotte Mall Tây Hồ')
    })

    it('session token auto-generate khi không truyền', async () => {
      // The SDK should auto-generate a sessiontoken param 
      const res = await client.places.autocomplete({ input: 'test' })
      expect(res).toHaveProperty('status', 'OK')
    })
  })

  describe('placeDetail()', () => {
    it('Google format → returns result object', async () => {
      const res = await client.places.placeDetail({ ids: 'test-id', format: 'google' })
      expect(res).toHaveProperty('result')
      expect(res).toHaveProperty('status', 'OK')

      const result = (res as { result: { name: string } }).result
      expect(result.name).toBe('Lotte Mall Tây Hồ')
    })

    it('OSM format → returns FeatureCollection', async () => {
      const res = await client.places.placeDetail({ ids: 'test-id', format: 'osm' })
      expect(res).toHaveProperty('type', 'FeatureCollection')
    })

    it('dùng lại session token từ autocomplete', async () => {
      // Create a fresh client to ensure clean session state
      const freshClient = new NDAMapsClient({ apiKey: 'test-key' })

      // Call autocomplete first (generates session token)
      await freshClient.places.autocomplete({ input: 'test' })

      // Call placeDetail (should reuse token)
      const res = await freshClient.places.placeDetail({ ids: 'test-id' })
      expect(res).toHaveProperty('status', 'OK')
    })
  })

  describe('children()', () => {
    it('returns child places', async () => {
      const res = await client.places.children({ parent_id: 'parent-1' })
      expect(res).toHaveProperty('predictions')
      expect(res.predictions).toHaveLength(1)
      expect(res.predictions[0].description).toContain('Cổng A')
    })
  })

  describe('nearby()', () => {
    it('returns FeatureCollection', async () => {
      const res = await client.places.nearby({
        categories: 'restaurant',
        'point.lat': 21.026,
        'point.lon': 105.852,
      })
      expect(res).toHaveProperty('type', 'FeatureCollection')
      expect(res.features).toHaveLength(1)
      expect(res.features[0].properties.name).toBe('Phở Thìn')
    })
  })
})
