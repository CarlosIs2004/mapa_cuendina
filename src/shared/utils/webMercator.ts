/**
 * webMercator — shared/utils.
 * Pure Web Mercator (EPSG:3857) projection to global pixel coordinates.
 * Matches Leaflet's `map.project`, but without needing a live map instance,
 * so export math stays unit-testable.
 */

/** Pixel size of a slippy-map tile (OSM standard). */
export const TILE_SIZE = 256;

/** Latitude limit of the Web Mercator square world. */
const MAX_LAT = 85.0511287798;

export interface PixelPoint {
  x: number;
  y: number;
}

/** Projects a coordinate to global pixel coordinates at the given zoom (y grows southwards). */
export function project(p: { lat: number; lng: number }, zoom: number): PixelPoint {
  const scale = TILE_SIZE * 2 ** zoom;
  const lat = Math.max(-MAX_LAT, Math.min(MAX_LAT, p.lat));
  const sin = Math.sin((lat * Math.PI) / 180);
  return {
    x: scale * ((p.lng + 180) / 360),
    y: scale * (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)),
  };
}
