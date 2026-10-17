/**
 * SetVisitedUseCase — points/application.
 * Marks a reference point as visited or not. Updates the UI first and rolls
 * back if the shared backend rejects the change.
 */

import type { PointsStore } from "./PointsStore";

/** Persists a visited flag; injected so the use case does not know Supabase. */
export type VisitedSaver = (pointId: string, visited: boolean) => Promise<void>;

/** Toggles the visited state of reference points. */
export class SetVisitedUseCase {
  constructor(
    private readonly save: VisitedSaver,
    private readonly store: PointsStore,
  ) {}

  /** Returns false (state unchanged) for user points or when saving fails. */
  async execute(id: string, visited: boolean): Promise<boolean> {
    if (!id.startsWith("ref-")) return false;
    const previous = this.store.state.visitedIds.has(id);
    this.store.setVisited(id, visited);
    try {
      await this.save(id, visited);
      return true;
    } catch {
      this.store.setVisited(id, previous);
      return false;
    }
  }
}
