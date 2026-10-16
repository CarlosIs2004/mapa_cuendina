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

  /** References first, then user points in creation order. */
  execute(): Point[] {
    return [...this.references, ...this.store.state.userPoints];
  }
}
