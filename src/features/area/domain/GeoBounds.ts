/**
 * GeoBounds — area/domain.
 * Rectangular geographic area as plain numbers, independent of Leaflet, so
 * the map adapter and export can all share the same area definition.
 */

import { LatLng } from "../../../shared/domain/LatLng";

/** Axis-aligned latitude/longitude rectangle. Immutable. */
export class GeoBounds {
  constructor(
    readonly south: number,
    readonly west: number,
    readonly north: number,
    readonly east: number,
  ) {
    if (south > north || west > east) throw new RangeError("Invalid bounds");
  }

  /** Smallest bounds containing every given point. */
  static fromPoints(points: readonly LatLng[]): GeoBounds {
    if (!points.length) throw new RangeError("Bounds need at least one point");
    const lats = points.map((p) => p.lat);
    const lngs = points.map((p) => p.lng);
    return new GeoBounds(Math.min(...lats), Math.min(...lngs), Math.max(...lats), Math.max(...lngs));
  }

  /** Grows each side by `ratio` times the span (same semantics as Leaflet's `pad`). */
  pad(ratio: number): GeoBounds {
    const dLat = (this.north - this.south) * ratio;
    const dLng = (this.east - this.west) * ratio;
    return new GeoBounds(this.south - dLat, this.west - dLng, this.north + dLat, this.east + dLng);
  }

  /** Inclusive containment check. */
  contains(p: { lat: number; lng: number }): boolean {
    return p.lat >= this.south && p.lat <= this.north && p.lng >= this.west && p.lng <= this.east;
  }

  /** Top-left corner. */
  get northWest(): LatLng {
    return new LatLng(this.north, this.west);
  }

  /** Bottom-right corner. */
  get southEast(): LatLng {
    return new LatLng(this.south, this.east);
  }
}
