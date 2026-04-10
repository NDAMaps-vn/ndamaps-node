// ─────────────────────────────────────────────
// NDAMaps SDK — Shared Type Definitions
// Source of truth: ndamaps-openapi.yaml
// ─────────────────────────────────────────────

// ── Primitives ────────────────────────────────

/** Place ID string returned by NDAMaps API */
export type PlaceId = string

/** Forcode — compact location code unique to NDAMaps */
export type Forcode = string

/** Map style identifier (for static map images) */
export type StyleId = 'ndamap' | 'satellite' | (string & {})

/**
 * Map tile style identifier (for vector tile rendering with MapLibre GL).
 * - `day-v1` — Daytime map style
 * - `night-v1` — Nighttime/dark map style
 * - `satellite-v1` — Satellite imagery style
 */
export type MapTileStyle = 'day-v1' | 'night-v1' | 'satellite-v1' | (string & {})

/** Supported vehicle types for routing */
export type VehicleType = 'car' | 'bike' | 'motor' | 'taxi' | 'truck' | 'walking'

/** Response format: Google-style or OSM/GeoJSON-style */
export type ResponseFormat = 'google' | 'osm'

/** Image output format */
export type ImageFormat = 'png' | 'jpg' | 'webp'

// ── Core Geometry ─────────────────────────────

/** Coordinate pair — always { lat, lng } */
export interface LatLng {
  lat: number
  lng: number
}

/** Text + numeric value pair (used in route distance/duration) */
export interface TextValue {
  text: string
  value: number
}

/** GeoJSON Point — coordinates are [longitude, latitude] */
export interface GeoJsonPoint {
  type: 'Point'
  coordinates: [number, number] // [lng, lat]
}

// ── Address & Place ───────────────────────────

export interface AddressComponent {
  long_name: string
  short_name: string
}

export interface PlaceProperties {
  name: string
  housenumber?: string | null
  street?: string | null
  short_address?: string | null
  postalcode?: string | null
  label: string
  country: string
  country_code: string
  category: string[]
  website?: string | null
  phone?: string | null
  opening_hours?: unknown
  region: string
  county: string
  locality: string
  distance?: number | null
  id: string
  continent: string
  source: string
  has_child: boolean
}

// ── GeoJSON ───────────────────────────────────

export interface Feature {
  type: 'Feature'
  geometry: GeoJsonPoint
  properties: PlaceProperties
}

export interface FeatureCollection {
  type: 'FeatureCollection'
  features: Feature[]
  bbox?: number[]
  errors?: unknown
}

// ── Autocomplete ──────────────────────────────

export interface MatchedSubstring {
  length: number
  offset: number
}

export interface StructuredFormatting {
  main_text: string
  secondary_text: string
}

export interface Term {
  offset: number
  value: string
}

export interface AutocompletePrediction {
  description: string
  place_id: string
  matched_substrings: MatchedSubstring[] | null
  structured_formatting: StructuredFormatting
  terms: Term[]
  types: string[]
  distance_meters: number | null
  has_child: boolean
}

export interface AutocompleteGoogleResponse {
  predictions: AutocompletePrediction[]
  status: 'OK' | 'ZERO_RESULTS' | 'INVALID_REQUEST'
}

/** OSM format autocomplete response (same as FeatureCollection) */
export type AutocompleteOsmResponse = FeatureCollection

// ── Autocomplete Params ───────────────────────

export interface AutocompleteGoogleParams {
  /** Search keyword (Google format) */
  input: string
  /** Location bias as "lat,lng" */
  location?: string
  /** Origin point for distance_meters calculation as "lat,lng" */
  origin?: string
  /** Search radius in km (default 50) */
  radius?: number
  /** Number of results */
  size?: number
  /** UUID v4 session token (auto-generated if omitted) */
  sessiontoken?: string
  /** Return updated admin info (post-2025 consolidation) */
  admin_v2?: boolean
}

export interface AutocompleteOsmParams {
  /** Search keyword (OSM format) */
  text: string
  /** Latitude for search boundary */
  'boundary.circle.lat'?: number
  /** Longitude for search boundary */
  'boundary.circle.lon'?: number
  /** Radius in km (default 50) */
  'boundary.circle.radius'?: number
  /** Number of results */
  size?: number
  /** UUID v4 session token */
  sessiontoken?: string
  /** Return updated admin info */
  admin_v2?: boolean
}

// ── Place Detail ──────────────────────────────

export interface PlaceDetailResult {
  place_id: string
  formatted_address: string
  geometry: {
    location: LatLng
    viewport?: unknown
  }
  address_components: AddressComponent[]
  name: string
  url: string
  types: string[]
}

export interface PlaceDetailGoogleResponse {
  result: PlaceDetailResult
  status: 'OK' | 'NOT_FOUND' | 'INVALID_REQUEST'
}

/** OSM format place detail response */
export type PlaceDetailOsmResponse = FeatureCollection

export interface PlaceDetailParams {
  /** Place ID string */
  ids: PlaceId
  /** Response format (default: 'google') */
  format?: ResponseFormat
  /** Session token — reused from autocomplete if available */
  sessiontoken?: string
  /** Return updated admin info */
  admin_v2?: boolean
}

// ── Children ──────────────────────────────────

export interface PlaceChildrenParams {
  /** ID of the parent place */
  parent_id: PlaceId
  /** Return updated admin info */
  admin_v2?: boolean
}

// ── Nearby ────────────────────────────────────

export interface NearbyParams {
  /** Place category filter (e.g. "restaurant") */
  categories: string
  /** Center latitude */
  'point.lat'?: number
  /** Center longitude */
  'point.lon'?: number
  /** Maximum number of results (default 5) */
  size?: number
  /** Search radius in km (default 5) */
  'boundary.circle.radius'?: number
  /** Return updated admin info */
  admin_v2?: boolean
}

// ── Geocoding ─────────────────────────────────

export interface ForwardGeocodeGoogleParams {
  /** Address string (Google format) */
  address: string
  /** Return updated admin info */
  admin_v2?: boolean
}

export interface ForwardGeocodeOsmParams {
  /** Address string (OSM format) */
  text: string
  /** Number of results (default 1) */
  size?: number
  /** Return updated admin info */
  admin_v2?: boolean
}

export interface ReverseGeocodeGoogleParams {
  /** Coordinates as "lat,lng" (Google format) */
  latlng: string
  /** Return updated admin info */
  admin_v2?: boolean
}

export interface ReverseGeocodeOsmParams {
  /** Latitude (OSM format) */
  'point.lat': number
  /** Longitude (OSM format) */
  'point.lon': number
  /** Search radius in km (default 1) */
  'boundary.circle.radius'?: number
  /** Number of results (default 1) */
  size?: number
  /** Return updated admin info */
  admin_v2?: boolean
}

export interface GeocodeResult {
  address: string
  address_components: AddressComponent[]
  formatted_address: string
  geometry: {
    location: LatLng
  }
  name: string
  place_id: string
  types: string[]
}

export interface GeocodeGoogleResponse {
  results: GeocodeResult[]
  status: 'OK' | 'ZERO_RESULTS' | 'INVALID_REQUEST'
}

export interface ReverseGeocodeGoogleResponse {
  results: GeocodeResult[]
  status: 'OK' | 'ZERO_RESULTS' | 'INVALID_REQUEST'
}

// ── Navigation ────────────────────────────────

export interface DirectionsParams {
  /** Origin coordinate as "lat,lng" or LatLng object */
  origin: string | LatLng
  /** Destination(s) — single or multiple points; arrays joined with ";" */
  destination: string | LatLng | Array<string | LatLng>
  /** Vehicle type (default 'car') */
  vehicle?: VehicleType
  /** Return alternative routes */
  alternatives?: boolean
  /** Language for instructions (default 'vi') */
  language?: 'en' | 'vi'
  /** Return updated admin info */
  admin_v2?: boolean
}

export interface RouteStep {
  distance: TextValue
  duration: TextValue
  start_location: LatLng
  end_location: LatLng
  html_instructions: string
  maneuver: string
  polyline: { points: string }
  travel_mode: string
}

export interface RouteLeg {
  distance: TextValue
  duration: TextValue
  start_address: string
  end_address: string
  start_location: LatLng
  end_location: LatLng
  steps: RouteStep[]
}

export interface Route {
  bounds: unknown
  legs: RouteLeg[]
  overview_polyline: { points: string }
  summary: string
  warnings: string[]
  waypoint_order: number[]
}

export interface DirectionsResponse {
  geocoded_waypoints: Array<{
    geocoder_status: string
    place_id: string
  }>
  routes: Route[]
}

export interface DistanceMatrixSource {
  lat: string | number
  lon: string | number
}

export interface DistanceMatrixTarget {
  lat: string | number
  lon: string | number
}

export interface DistanceMatrixParams {
  /** Source coordinates */
  sources: DistanceMatrixSource[]
  /** Target coordinates */
  targets: DistanceMatrixTarget[]
  /** Optional request identifier */
  id?: string
  /** If true, returns flat list with indices (default true) */
  verbose?: boolean
  /** Shape format for path geometry */
  shape_format?: 'polyline6' | 'polyline5' | 'geojson' | 'no_shape'
}

export interface DistanceMatrixEntry {
  distance: number
  time: number
  from_index: number
  to_index: number
  date_time: string | null
}

export interface DistanceMatrixResponse {
  sources_to_targets: DistanceMatrixEntry[][]
  locations: Array<{ lat: string; lon: string }>
  units: 'km' | 'mi'
  warnings: string[]
}

export interface OptimizedRouteLocation {
  lat: number | string
  lon: number | string
}

export interface OptimizedRouteParams {
  locations: OptimizedRouteLocation[]
  costing?: string
  directions_options?: { units?: 'km' | 'mi' }
  admin_v2?: boolean
}

export interface OptimizedRouteResponse {
  trip: {
    locations: Array<{
      type: string
      lat: number
      lon: number
      side_of_street?: string
      original_index: number
    }>
    legs: Array<{
      maneuvers: any[]
      summary: any
      shape: string
    }>
    summary: {
      time: number
      length: number
      cost: number
      min_lat: number
      min_lon: number
      max_lat: number
      max_lon: number
      status_message: string
      status: number
      units: string
      language: string
      [key: string]: any
    }
  }
}

// ── Static Map ────────────────────────────────

export interface StaticMapCenterParams {
  mode: 'center'
  /** Center coordinate */
  center: LatLng
  /** Zoom level */
  zoom: number
  /** Bearing in degrees */
  bearing?: number
  /** Pitch in degrees */
  pitch?: number
}

export interface StaticMapAreaParams {
  mode: 'area'
  /** Bounding box [minLon, minLat, maxLon, maxLat] */
  bbox: [number, number, number, number]
}

export interface StaticMapAutoParams {
  mode: 'auto'
}

export type StaticMapMode = StaticMapCenterParams | StaticMapAreaParams | StaticMapAutoParams

export interface StaticMapParams {
  /** Map mode configuration */
  mode: StaticMapMode
  /** Image width in pixels */
  width: number
  /** Image height in pixels */
  height: number
  /** Map style (default 'ndamap') */
  styleId?: StyleId
  /** Image format (default 'png') */
  format?: ImageFormat
  /** Retina (@2x) */
  retina?: boolean
  /** Marker as "lng,lat|iconUrl" */
  marker?: string
  /** Path as comma-separated lng,lat pairs or encoded polyline */
  path?: string
  /** Padding fraction (e.g. 0.1 = 10%) */
  padding?: number
}

// ── NDAView ───────────────────────────────────

export interface NdaViewStaticParams {
  /** NDAView item UUID */
  id?: string
  /** Coordinates as LatLng (SDK converts to "lon,lat" for API) */
  placePosition?: LatLng
  /** Rotation angle in degrees (0-360) */
  yaw?: number
  /** Tilt angle in degrees */
  pitch?: number
}

export interface NdaViewSearchParams {
  /** Center coordinates as LatLng */
  placePosition?: LatLng
  /** Distance range in meters (e.g. "3-15") */
  placeDistance?: string
  /** Field of view tolerance in degrees (2-180, default 30) */
  placeFovTolerance?: number
  /** Bounding box as "minLon,minLat,maxLon,maxLat" */
  bbox?: string
  /** RFC 3339 datetime or interval */
  datetime?: string
  /** Maximum number of results (1-10000, default 10) */
  limit?: number
  /** Comma-separated item UUIDs */
  ids?: string
  /** Comma-separated collection UUIDs */
  collections?: string
}

export interface NdaViewAsset {
  href: string
  title: string
  type: string
  description: string
  roles: string[]
}

export interface NdaViewAssets {
  hd: NdaViewAsset
  sd: NdaViewAsset
  thumb: NdaViewAsset
}

export interface NdaViewFeatureProperties {
  datetime: string
  created: string
  width: number
  height: number
  'view:azimuth': number
  'ndaview_vn:status': string
  'ndaview_vn:thumbnail': string
  'ndaview_vn:image': string
  'pers:interior_orientation'?: {
    field_of_view: number
    camera_manufacturer: string
    camera_model: string
  }
}

export interface NdaViewFeature {
  id: string
  type: 'Feature'
  geometry: GeoJsonPoint
  bbox: number[]
  assets: NdaViewAssets
  asset_templates: Record<string, unknown>
  links: unknown[]
  properties: NdaViewFeatureProperties
}

export interface NdaViewFeatureCollection {
  type: 'FeatureCollection'
  features: NdaViewFeature[]
  links: unknown[]
}

// ── Forcodes ──────────────────────────────────

export interface ForcodeEncodeParams {
  /** Latitude in decimal degrees */
  lat: number
  /** Longitude in decimal degrees */
  lng: number
  /**
   * Hexagon resolution level (0-15).
   * - 15 ≈ 0.5m (most precise)
   * - 13 ≈ 3.5m (default — house/room level)
   * - 11 ≈ 25m (single building)
   * - 8  ≈ 461m (city block)
   * - 5  ≈ 8.5km (district)
   */
  resolution?: number
}

export interface ForcodeDecodeParams {
  /** Forcode string to decode */
  forcodes: string
}

export interface ForcodeEncodeResponse {
  forcodes: string
  lat: number
  lng: number
  resolution: number
  admin_code: string
  status: 'OK'
}

export interface ForcodeDecodeResponse {
  forcodes: string
  lat: number | null
  lng: number | null
  resolution: number | null
  status: 'OK' | 'INVALID_FORCODES'
}

// ── SDK Config ────────────────────────────────

export interface NDAMapsClientOptions {
  /** Your NDAMaps API key */
  apiKey: string
  /** Override Maps API base URL */
  mapsApiBase?: string
  /** Override Tiles base URL */
  tilesBase?: string
  /** Override NDAView API base URL */
  ndaviewApiBase?: string
  /** Override Map Tiles base URL */
  maptilesBase?: string
  /** Max retry attempts (default 3) */
  maxRetries?: number
  /** Base delay in ms for exponential backoff (default 500) */
  baseDelayMs?: number
}
