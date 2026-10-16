/**
 * LocalStoragePointRepository — points/infrastructure (adapter).
 * Implements the PointRepository port with the browser's localStorage, so
 * points live only in this browser. Key and JSON shape are unchanged from the
 * original single-file app, so existing saved points keep loading.
 */

import { Point } from "../domain/Point";
import type { PointRepository } from "../domain/PointRepository";

export const STORE_KEY = "mapa-cuendina:points:v1";

/** localStorage-backed repository. Storage failures degrade to an empty list / no-op. */
export class LocalStoragePointRepository implements PointRepository {
  /** @param storage Usually `window.localStorage`; injectable for tests. */
  constructor(private readonly storage: Storage) {}

  /** Returns valid stored points, silently skipping malformed entries. */
  async list(): Promise<Point[]> {
    return this.read();
  }

  /** Appends a point and saves the whole list. */
  async add(point: Point): Promise<void> {
    this.write([...this.read(), point]);
  }

  /** Removes a point by id and saves the remaining list. */
  async remove(id: string): Promise<void> {
    this.write(this.read().filter((p) => p.id !== id));
  }

  private read(): Point[] {
    try {
      const parsed: unknown = JSON.parse(this.storage.getItem(STORE_KEY) ?? "[]");
      if (!Array.isArray(parsed)) return [];
      return parsed.map((item) => Point.parse(item)).filter((p): p is Point => p !== null);
    } catch {
      return [];
    }
  }

  private write(points: Point[]): void {
    try {
      this.storage.setItem(STORE_KEY, JSON.stringify(points.map((p) => p.toSnapshot())));
    } catch {
      // Storage full or blocked (e.g. private mode): the app keeps working in memory.
    }
  }
}
