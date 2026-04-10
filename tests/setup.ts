// ─────────────────────────────────────────────
// MSW Test Setup
// ─────────────────────────────────────────────

import { afterAll, afterEach, beforeAll } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// ── Mock Response Data ────────────────────────

export const MOCK_RESPONSES = {
  autocompleteGoogle: {
    predictions: [
      {
        description: 'Lotte Mall Tây Hồ, Phú Thượng, Tây Hồ, Hà Nội',
        place_id: 'aQA0KHmLGXVtbpFgpMqFfA0OjpRAAVFg',
        matched_substrings: [{ length: 5, offset: 0 }],
        structured_formatting: {
          main_text: 'Lotte Mall Tây Hồ',
          secondary_text: 'Phú Thượng, Tây Hồ, Hà Nội',
        },
        terms: [
          { offset: 0, value: 'Lotte Mall Tây Hồ' },
          { offset: 20, value: 'Phú Thượng' },
        ],
        types: ['establishment'],
        distance_meters: null,
        has_child: false,
      },
    ],
    status: 'OK',
  },

  autocompleteOsm: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [105.788, 21.033],
        },
        properties: {
          name: 'Lotte Mall Tây Hồ',
          id: 'feature-id-1',
          label: 'Lotte Mall Tây Hồ, Phú Thượng, Tây Hồ, Hà Nội',
          country: 'Việt Nam',
          country_code: 'VN',
          category: ['establishment'],
          region: 'Hà Nội',
          county: 'Tây Hồ',
          locality: 'Phú Thượng',
          source: 'ndamaps',
          has_child: false,
          continent: 'Asia',
        },
      },
    ],
  },

  placeDetailGoogle: {
    result: {
      place_id: 'aQA0KHmLGXVtbpFgpMqFfA0OjpRAAVFg',
      formatted_address: 'Lotte Mall Tây Hồ, Phú Thượng, Tây Hồ, Hà Nội',
      geometry: {
        location: { lat: 21.033, lng: 105.788 },
        viewport: null,
      },
      address_components: [
        { long_name: 'Lotte Mall Tây Hồ', short_name: 'Lotte Mall' },
      ],
      name: 'Lotte Mall Tây Hồ',
      url: 'https://ndamaps.vn/place/aQA0KHmLGXVtbpFgpMqFfA0OjpRAAVFg',
      types: ['establishment'],
    },
    status: 'OK',
  },

  children: {
    predictions: [
      {
        description: 'Cổng A, Lotte Mall Tây Hồ',
        place_id: 'child-1',
        matched_substrings: null,
        structured_formatting: {
          main_text: 'Cổng A',
          secondary_text: 'Lotte Mall Tây Hồ',
        },
        terms: [],
        types: ['point_of_interest'],
        distance_meters: null,
        has_child: false,
      },
    ],
    status: 'OK',
  },

  nearby: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [105.852, 21.026] },
        properties: {
          name: 'Phở Thìn',
          id: 'nearby-1',
          label: 'Phở Thìn, 13 Lò Đúc',
          country: 'Việt Nam',
          country_code: 'VN',
          category: ['restaurant'],
          region: 'Hà Nội',
          county: 'Hai Bà Trưng',
          locality: 'Phạm Đình Hổ',
          source: 'ndamaps',
          has_child: false,
          continent: 'Asia',
          distance: 0.5,
        },
      },
    ],
  },

  forwardGeocodeGoogle: {
    results: [
      {
        address: '12 Ngõ 1 Dịch Vọng Hậu',
        address_components: [
          { long_name: '12', short_name: '12' },
          { long_name: 'Ngõ 1', short_name: 'Ngõ 1' },
        ],
        formatted_address: '12 Ngõ 1 Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
        geometry: { location: { lat: 21.038, lng: 105.782 } },
        name: '12 Ngõ 1 Dịch Vọng Hậu',
        place_id: 'geocode-place-1',
        types: ['street_address'],
      },
    ],
    status: 'OK',
  },

  reverseGeocodeGoogle: {
    results: [
      {
        address: '12 Ngõ 1 Dịch Vọng Hậu',
        address_components: [
          { long_name: '12', short_name: '12' },
        ],
        formatted_address: '12 Ngõ 1 Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
        geometry: { location: { lat: 21.076, lng: 105.813 } },
        name: '12 Ngõ 1 Dịch Vọng Hậu',
        place_id: 'reverse-place-1',
        types: ['street_address'],
      },
    ],
    status: 'OK',
  },

  directions: {
    geocoded_waypoints: [
      { geocoder_status: 'OK', place_id: 'origin-1' },
      { geocoder_status: 'OK', place_id: 'dest-1' },
    ],
    routes: [
      {
        bounds: {},
        legs: [
          {
            distance: { text: '3.2 km', value: 3200 },
            duration: { text: '10 phút', value: 600 },
            start_address: 'Điểm A',
            end_address: 'Điểm B',
            start_location: { lat: 10.787, lng: 106.698 },
            end_location: { lat: 10.791, lng: 106.702 },
            steps: [
              {
                distance: { text: '100 m', value: 100 },
                duration: { text: '1 phút', value: 60 },
                start_location: { lat: 10.787, lng: 106.698 },
                end_location: { lat: 10.788, lng: 106.699 },
                html_instructions: 'Đi về hướng đông',
                maneuver: 'straight',
                polyline: { points: 'encoded_polyline' },
                travel_mode: 'DRIVING',
              },
            ],
          },
        ],
        overview_polyline: { points: 'full_encoded_polyline' },
        summary: 'Đường Láng',
        warnings: [],
        waypoint_order: [],
      },
    ],
  },

  distanceMatrix: {
    sources_to_targets: [
      [
        { distance: 3.2, time: 600, from_index: 0, to_index: 0, date_time: null },
        { distance: 7.5, time: 1200, from_index: 0, to_index: 1, date_time: null },
      ],
    ],
    locations: [
      { lat: '21.03', lon: '105.79' },
      { lat: '21.05', lon: '105.79' },
      { lat: '21.07', lon: '105.80' },
    ],
    units: 'km',
    warnings: [],
  },

  forcodeEncode: {
    forcodes: 'HN4TZUZBPKRN0F',
    lat: 20.990396,
    lng: 105.868825,
    resolution: 13,
    admin_code: 'HN',
    status: 'OK',
  },

  forcodeDecode: {
    forcodes: 'HN4TZUZBPKRN0F',
    lat: 20.990396,
    lng: 105.868825,
    resolution: 13,
    status: 'OK',
  },

  forcodeDecodeInvalid: {
    forcodes: 'INVALID',
    lat: null,
    lng: null,
    resolution: null,
    status: 'INVALID_FORCODES',
  },

  ndaviewSearch: {
    type: 'FeatureCollection',
    features: [
      {
        id: 'e213daed-3ae2-4259-940b-444a4056c101',
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [105.788, 21.033] },
        bbox: [105.787, 21.032, 105.789, 21.034],
        assets: {
          hd: { href: 'https://cdn.ndamaps.vn/hd.jpg', title: 'HD', type: 'image/jpeg', description: 'Full resolution', roles: ['data'] },
          sd: { href: 'https://cdn.ndamaps.vn/sd.jpg', title: 'SD', type: 'image/jpeg', description: '2048px', roles: ['data'] },
          thumb: { href: 'https://cdn.ndamaps.vn/thumb.jpg', title: 'Thumbnail', type: 'image/jpeg', description: '500px', roles: ['thumbnail'] },
        },
        asset_templates: {},
        links: [],
        properties: {
          datetime: '2024-01-15T08:30:00Z',
          created: '2024-01-16T10:00:00Z',
          width: 8192,
          height: 4096,
          'view:azimuth': 276,
          'ndaview_vn:status': 'published',
          'ndaview_vn:thumbnail': 'https://cdn.ndamaps.vn/thumb.jpg',
          'ndaview_vn:image': 'https://cdn.ndamaps.vn/hd.jpg',
        },
      },
    ],
    links: [],
  },
}

// ── MSW Handlers ──────────────────────────────

const MAPS_API_BASE = 'https://mapapis.ndamaps.vn/v1'
const NDAVIEW_API_BASE = 'https://api-view.ndamaps.vn/v1'

export const handlers = [
  // Autocomplete
  http.get(`${MAPS_API_BASE}/autocomplete`, ({ request }) => {
    const url = new URL(request.url)
    if (url.searchParams.get('text')) {
      return HttpResponse.json(MOCK_RESPONSES.autocompleteOsm)
    }
    return HttpResponse.json(MOCK_RESPONSES.autocompleteGoogle)
  }),

  // Place Detail
  http.get(`${MAPS_API_BASE}/place`, ({ request }) => {
    const url = new URL(request.url)
    if (url.searchParams.get('format') === 'osm') {
      return HttpResponse.json({
        type: 'FeatureCollection',
        features: [MOCK_RESPONSES.autocompleteOsm.features[0]],
      })
    }
    return HttpResponse.json(MOCK_RESPONSES.placeDetailGoogle)
  }),

  // Children
  http.get(`${MAPS_API_BASE}/place/children`, () => {
    return HttpResponse.json(MOCK_RESPONSES.children)
  }),

  // Nearby
  http.get(`${MAPS_API_BASE}/nearby`, () => {
    return HttpResponse.json(MOCK_RESPONSES.nearby)
  }),

  // Forward Geocode
  http.get(`${MAPS_API_BASE}/geocode/forward`, ({ request }) => {
    const url = new URL(request.url)
    if (url.searchParams.get('text')) {
      return HttpResponse.json(MOCK_RESPONSES.autocompleteOsm)
    }
    return HttpResponse.json(MOCK_RESPONSES.forwardGeocodeGoogle)
  }),

  // Reverse Geocode
  http.get(`${MAPS_API_BASE}/geocode/reverse`, ({ request }) => {
    const url = new URL(request.url)
    if (url.searchParams.get('point.lat')) {
      return HttpResponse.json(MOCK_RESPONSES.autocompleteOsm)
    }
    return HttpResponse.json(MOCK_RESPONSES.reverseGeocodeGoogle)
  }),

  // Directions
  http.get(`${MAPS_API_BASE}/direction`, () => {
    return HttpResponse.json(MOCK_RESPONSES.directions)
  }),

  // Distance Matrix
  http.get(`${MAPS_API_BASE}/distancematrix`, () => {
    return HttpResponse.json(MOCK_RESPONSES.distanceMatrix)
  }),

  // Forcodes Encode
  http.get(`${MAPS_API_BASE}/forcodes/encode`, () => {
    return HttpResponse.json(MOCK_RESPONSES.forcodeEncode)
  }),

  // Forcodes Decode
  http.get(`${MAPS_API_BASE}/forcodes/decode`, ({ request }) => {
    const url = new URL(request.url)
    const forcodes = url.searchParams.get('forcodes')
    if (forcodes === 'INVALID') {
      return HttpResponse.json(MOCK_RESPONSES.forcodeDecodeInvalid)
    }
    return HttpResponse.json(MOCK_RESPONSES.forcodeDecode)
  }),

  // NDAView Search
  http.get(`${NDAVIEW_API_BASE}/search`, () => {
    return HttpResponse.json(MOCK_RESPONSES.ndaviewSearch)
  }),
]

// ── Server Setup ──────────────────────────────

export const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
