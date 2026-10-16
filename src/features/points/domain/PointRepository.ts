/**
 * PointRepository — points/domain (port).
 * Persistence contract for user points. Async on purpose so the current
 * localStorage adapter can later be replaced by a shared HTTP backend
 * without touching use cases or UI.
 */

import type { Point } from "./Point";

/** Stores and retrieves user-created points. */
export interface PointRepository {
  /** Returns all stored user points. */
  list(): Promise<Point[]>;
  /** Persists a new point. */
  add(point: Point): Promise<void>;
  /** Deletes the point with the given id (no-op if missing). */
  remove(id: string): Promise<void>;
}
