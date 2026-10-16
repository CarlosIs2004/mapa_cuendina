/**
 * RemovePointUseCase — points/application.
 * Deletes a user point. Reference points are protected by design.
 */

import type { PointRepository } from "../domain/PointRepository";
import type { PointsStore } from "./PointsStore";

/** Removes a user-created point from storage and state. */
export class RemovePointUseCase {
  constructor(
    private readonly repository: PointRepository,
    private readonly store: PointsStore,
  ) {}

  /** Returns false (and does nothing) when the id is unknown or a reference point. */
  async execute(id: string): Promise<boolean> {
    const target = this.store.state.userPoints.find((p) => p.id === id);
    if (!target?.isUserPoint) return false;
    await this.repository.remove(id);
    this.store.removeUserPoint(id);
    return true;
  }
}
