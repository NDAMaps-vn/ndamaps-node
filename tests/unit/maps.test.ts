import { describe, it, expect } from 'vitest'
import { NDAMapsClient, MAP_TILE_STYLES } from '../../src/index.js'

const client = new NDAMapsClient({ apiKey: 'test-key' })

describe('MapsModule', () => {
  describe('styleUrl()', () => {
    it('day-v1 → correct style.json URL', () => {
      const url = client.maps.styleUrl('day-v1')
      expect(url).toBe('https://maptiles.openmap.vn/styles/day-v1/style.json?apikey=test-key')
    })

    it('night-v1 → correct style.json URL', () => {
      const url = client.maps.styleUrl('night-v1')
      expect(url).toContain('/styles/night-v1/style.json')
      expect(url).toContain('apikey=test-key')
    })

    it('satellite-v1 → correct style.json URL', () => {
      const url = client.maps.styleUrl('satellite-v1')
      expect(url).toContain('/styles/satellite-v1/style.json')
    })

    it('default style is day-v1', () => {
      const url = client.maps.styleUrl()
      expect(url).toContain('/styles/day-v1/')
    })

    it('MAP_TILE_STYLES constants work', () => {
      expect(client.maps.styleUrl(MAP_TILE_STYLES.DAY)).toContain('day-v1')
      expect(client.maps.styleUrl(MAP_TILE_STYLES.NIGHT)).toContain('night-v1')
      expect(client.maps.styleUrl(MAP_TILE_STYLES.SATELLITE)).toContain('satellite-v1')
    })

    it('custom style name works', () => {
      const url = client.maps.styleUrl('custom-v2')
      expect(url).toContain('/styles/custom-v2/style.json')
    })
  })

  describe('staticMapUrl()', () => {
    it('center mode → correct URL pattern', () => {
      const url = client.maps.staticMapUrl({
        mode: { mode: 'center', center: { lat: 21.03, lng: 105.79 }, zoom: 15 },
        width: 600,
        height: 400,
      })

      expect(url).toContain('maptiles.openmap.vn')
      expect(url).toContain('/styles/ndamap/static/')
      expect(url).toContain('105.79,21.03,15')
      expect(url).toContain('600x400')
      expect(url).toContain('.png')
      expect(url).toContain('apikey=test-key')
    })

    it('center mode with bearing and pitch', () => {
      const url = client.maps.staticMapUrl({
        mode: { mode: 'center', center: { lat: 21.03, lng: 105.79 }, zoom: 15, bearing: 90, pitch: 30 },
        width: 600,
        height: 400,
      })

      expect(url).toContain('105.79,21.03,15@90,30')
    })

    it('retina (@2x) → URL includes @2x', () => {
      const url = client.maps.staticMapUrl({
        mode: { mode: 'center', center: { lat: 21.03, lng: 105.79 }, zoom: 15 },
        width: 600,
        height: 400,
        retina: true,
      })

      expect(url).toContain('600x400@2x')
    })

    it('with marker → URL has marker param', () => {
      const url = client.maps.staticMapUrl({
        mode: { mode: 'center', center: { lat: 21.03, lng: 105.79 }, zoom: 15 },
        width: 600,
        height: 400,
        marker: '105.79,21.03|https://example.com/icon.svg',
      })

      expect(url).toContain('marker=')
      expect(url).toContain('icon.svg')
    })

    it('area mode → bbox in URL', () => {
      const url = client.maps.staticMapUrl({
        mode: { mode: 'area', bbox: [105.7, 21.0, 105.9, 21.1] },
        width: 800,
        height: 600,
        format: 'jpg',
      })

      expect(url).toContain('105.7,21,105.9,21.1')
      expect(url).toContain('.jpg')
    })

    it('auto mode → "auto" in URL', () => {
      const url = client.maps.staticMapUrl({
        mode: { mode: 'auto' },
        width: 600,
        height: 400,
        path: '105.78,21.03,105.80,21.05',
      })

      expect(url).toContain('/auto/')
      expect(url).toContain('path=')
    })

    it('custom style and format', () => {
      const url = client.maps.staticMapUrl({
        mode: { mode: 'center', center: { lat: 21.03, lng: 105.79 }, zoom: 10 },
        width: 300,
        height: 200,
        styleId: 'satellite',
        format: 'webp',
      })

      expect(url).toContain('/styles/satellite/')
      expect(url).toContain('.webp')
    })
  })
})
