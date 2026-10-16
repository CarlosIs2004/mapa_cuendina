/**
 * AddPointUseCase — points/application.
 * "Agregar punto": creates a user point, persists it, then updates the store.
 */

import { Point, type NewPointData } from "../domain/Point";
import type { PointRepository } from "../domain/PointRepository";
import type { PointsStore } from "./PointsStore";

/** Creates and saves a new user point. */
export class AddPointUseCase {
  /** @param clock Source of the timestamp used for the point id (injectable for tests). */
  constructor(
    private readonly repository: PointRepository,
    private readonly store: PointsStore,
    private readonly clock: () => number = Date.now,
  ) {}

  /** Persists the point first so the UI only shows what was actually saved. */
  async execute(data: NewPointData): Promise<Point> {
    const point = Point.create(data, this.clock());
    await this.repository.add(point);
    this.store.addUserPoint(point);
    return point;
  }
}
