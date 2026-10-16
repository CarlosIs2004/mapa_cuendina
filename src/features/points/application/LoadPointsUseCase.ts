/**
 * LoadPointsUseCase — points/application.
 * Loads persisted user points into the store at startup.
 */

import type { PointRepository } from "../domain/PointRepository";
import type { PointsStore } from "./PointsStore";

/** Fills the store with the points saved in the repository. */
export class LoadPointsUseCase {
  constructor(
    private readonly repository: PointRepository,
    private readonly store: PointsStore,
  ) {}

  /** Reads all user points and publishes them to the store. */
  async execute(): Promise<void> {
    this.store.setUserPoints(await this.repository.list());
  }
}
