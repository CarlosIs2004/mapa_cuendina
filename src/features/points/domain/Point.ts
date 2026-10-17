/**
 * Point — points/domain.
 * Entity for a place on the community map: either a fixed reference point
 * (id prefixed with "ref-") or a point added by a user.
 */

import { LatLng } from "../../../shared/domain/LatLng";
import { CATEGORY_CATALOG, type CategoryId } from "./Category";

/** Plain, JSON-serializable shape of a point (storage / backend format). */
export interface PointSnapshot {
  id: string;
  name: string;
  category: CategoryId;
  lat: number;
  lng: number;
  description?: string;
  visited?: boolean;
}

/** Data a user provides when creating a point. */
export interface NewPointData {
  category: CategoryId;
  name: string;
  description: string;
  lat: number;
  lng: number;
}

const REFERENCE_PREFIX = "ref-";

/** A categorized, named location. Immutable. */
export class Point {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly category: CategoryId,
    readonly position: LatLng,
    readonly description: string,
    readonly visited: boolean = false,
  ) {}

  /** Creates a new user point; `now` makes the generated id deterministic in tests. */
  static create(data: NewPointData, now: number): Point {
    const name = data.name.trim();
    if (!name) throw new RangeError("A point needs a name");
    return new Point(`u-${now}`, name, data.category, new LatLng(data.lat, data.lng), data.description.trim());
  }

  /** Rebuilds a point from trusted data (catalog constants, already validated input). */
  static fromSnapshot(s: PointSnapshot): Point {
    return new Point(s.id, s.name, s.category, new LatLng(s.lat, s.lng), s.description ?? "", s.visited ?? false);
  }

  /**
   * Validates untrusted data (localStorage, JSON import, a future backend):
   * known category, finite lat/lng, non-empty id and name. Returns null when invalid.
   */
  static parse(value: unknown): Point | null {
    if (typeof value !== "object" || value === null) return null;
    const v = value as Record<string, unknown>;
    const valid =
      typeof v.id === "string" && v.id.trim() !== "" &&
      typeof v.name === "string" && v.name.trim() !== "" &&
      CATEGORY_CATALOG.has(v.category) &&
      LatLng.isValid(v.lat, v.lng) &&
      (v.description === undefined || typeof v.description === "string") &&
      (v.visited === undefined || typeof v.visited === "boolean");
    return valid ? Point.fromSnapshot(v as unknown as PointSnapshot) : null;
  }

  /** Latitude shortcut. */
  get lat(): number {
    return this.position.lat;
  }

  /** Longitude shortcut. */
  get lng(): number {
    return this.position.lng;
  }

  /** True for points added by users (deletable); false for fixed references. */
  get isUserPoint(): boolean {
    return !this.id.startsWith(REFERENCE_PREFIX);
  }

  /** Copy of this point with the given visited state. */
  withVisited(visited: boolean): Point {
    return new Point(this.id, this.name, this.category, this.position, this.description, visited);
  }

  /** Case-insensitive search over name and description. */
  matches(query: string): boolean {
    return `${this.name} ${this.description}`.toLowerCase().includes(query.toLowerCase());
  }

  /** Serializable form for persistence. */
  toSnapshot(): PointSnapshot {
    return { id: this.id, name: this.name, category: this.category, lat: this.lat, lng: this.lng, description: this.description, ...(this.visited && { visited: true }) };
  }
}
