/**
 * FilterPointsUseCase — points/application.
 * Returns the points currently visible (map, list, legend, export) by applying
 * the store's filter to the full list.
 */

import type { Point } from "../domain/Point";
import type { ListPointsUseCase } from "./ListPointsUseCase";
import type { PointsStore } from "./PointsStore";

/** Computes the visible points for the current filter. */
export class FilterPointsUseCase {
  constructor(
    private readonly listPoints: ListPointsUseCase,
    private readonly store: PointsStore,
  ) {}

  /** Points matching the current search query and not in a hidden category. */
  execute(): Point[] {
    return this.store.state.filter.apply(this.listPoints.execute());
  }
}
