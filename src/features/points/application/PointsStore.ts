/**
 * PointsStore — points/application.
 * Observable in-memory state shared by use cases and UI: the loaded user
 * points and the current filter. Presentation subscribes to redraw on change.
 */

import { Observable } from "../../../shared/domain/Observable";
import type { CategoryId } from "../domain/Category";
import type { Point } from "../domain/Point";
import { PointFilter } from "../domain/PointFilter";

export interface PointsState {
  userPoints: readonly Point[];
  filter: PointFilter;
  /** Ids of reference points marked as visited. */
  visitedIds: ReadonlySet<string>;
}

/** Holds application state and notifies subscribers after every change. */
export class PointsStore extends Observable<PointsState> {
  private current: PointsState = { userPoints: [], filter: new PointFilter(), visitedIds: new Set() };

  /** Current state snapshot (treat as read-only). */
  get state(): PointsState {
    return this.current;
  }

  /** Replaces the user points (after loading from the repository). */
  setUserPoints(points: readonly Point[]): void {
    this.update({ userPoints: [...points] });
  }

  /** Adds one user point to the state. */
  addUserPoint(point: Point): void {
    this.update({ userPoints: [...this.current.userPoints, point] });
  }

  /** Removes one user point from the state by id. */
  removeUserPoint(id: string): void {
    this.update({ userPoints: this.current.userPoints.filter((p) => p.id !== id) });
  }

  /** Replaces the visited reference ids (initial load). */
  setVisitedIds(ids: Iterable<string>): void {
    this.update({ visitedIds: new Set(ids) });
  }

  /** Marks or unmarks one reference point as visited. */
  setVisited(id: string, visited: boolean): void {
    const ids = new Set(this.current.visitedIds);
    if (visited) ids.add(id);
    else ids.delete(id);
    this.update({ visitedIds: ids });
  }

  /** Updates the search query. */
  setQuery(query: string): void {
    this.update({ filter: this.current.filter.withQuery(query) });
  }

  /** Shows/hides a category. */
  toggleCategory(category: CategoryId): void {
    this.update({ filter: this.current.filter.toggle(category) });
  }

  private update(patch: Partial<PointsState>): void {
    this.current = { ...this.current, ...patch };
    this.emit(this.current);
  }
}
