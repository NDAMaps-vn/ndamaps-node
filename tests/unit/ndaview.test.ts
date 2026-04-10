import { describe, it, expect } from 'vitest'
import { NDAMapsClient } from '../../src/index.js'

const client = new NDAMapsClient({ apiKey: 'test-key' })

describe('NdaViewModule', () => {
  describe('staticThumbnailUrl()', () => {
    it('by coordinates → correct URL', () => {
      const url = client.ndaview.staticThumbnailUrl({
        placePosition: { lat: 21.033, lng: 105.788 },
        yaw: 276,
        pitch: 20,
      })

      expect(url).toContain('api-view.ndamaps.vn/v1/items/static/thumbnail.jpeg')
      expect(url).toContain('place_position=105.788%2C21.033')
      expect(url).toContain('yaw=276')
      expect(url).toContain('pitch=20')
      expect(url).toContain('apikey=test-key')
    })

    it('by ID → correct URL', () => {
      const url = client.ndaview.staticThumbnailUrl({
        id: 'e213daed-3ae2-4259-940b-444a4056c101',
      })

      expect(url).toContain('id=e213daed-3ae2-4259-940b-444a4056c101')
    })
  })

  describe('search()', () => {
    it('by position → returns FeatureCollection', async () => {
      const res = await client.ndaview.search({
        placePosition: { lat: 21.033, lng: 105.788 },
        limit: 5,
      })

      expect(res).toHaveProperty('type', 'FeatureCollection')
      expect(res.features).toHaveLength(1)
      expect(res.features[0].id).toBe('e213daed-3ae2-4259-940b-444a4056c101')
      expect(res.features[0].assets.thumb.href).toContain('thumb.jpg')
      expect(res.features[0].assets.hd.href).toContain('hd.jpg')
    })
  })
})
