/**
 * ListPointsUseCase — points/application.
 * Single place that defines "all points": fixed references followed by user points.
 */

import type { Point } from "../domain/Point";
import type { PointsStore } from "./PointsStore";

/** Lists every point regardless of filters. */
export class ListPointsUseCase {
  constructor(
    private readonly store: PointsStore,
    private readonly references: readonly Point[],
  ) {}

  /** References (with their visited state) first, then user points in creation order. */
  execute(): Point[] {
    const { visitedIds, userPoints } = this.store.state;
    return [...this.references.map((p) => p.withVisited(visitedIds.has(p.id))), ...userPoints];
  }
}
