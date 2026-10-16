/**
 * LatLng — shared/domain.
 * Geographic coordinate value object shared by the points, area, map and
 * export features. Kept framework-free (no Leaflet types) on purpose.
 */

/** Immutable WGS84 coordinate in decimal degrees. */
export class LatLng {
  /** Creates a coordinate; throws if either component is not a finite number. */
  constructor(
    readonly lat: number,
    readonly lng: number,
  ) {
    if (!LatLng.isValid(lat, lng)) throw new RangeError(`Invalid coordinate: ${lat}, ${lng}`);
  }

  /** True when both values are finite numbers (used to validate untrusted data). */
  static isValid(lat: unknown, lng: unknown): boolean {
    return typeof lat === "number" && Number.isFinite(lat) && typeof lng === "number" && Number.isFinite(lng);
  }
}
