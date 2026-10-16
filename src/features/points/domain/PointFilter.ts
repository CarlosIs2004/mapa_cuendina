/**
 * PointFilter — points/domain.
 * Value object describing what the user wants to see (search text + hidden
 * categories). Immutable so state changes are explicit and easy to test.
 */

import type { CategoryId } from "./Category";
import type { Point } from "./Point";

/** Search query plus the set of hidden categories. */
export class PointFilter {
  constructor(
    readonly query = "",
    private readonly hidden: ReadonlySet<CategoryId> = new Set(),
  ) {}

  /** Returns a copy with a new search query. */
  withQuery(query: string): PointFilter {
    return new PointFilter(query, this.hidden);
  }

  /** Returns a copy with the category's visibility flipped. */
  toggle(category: CategoryId): PointFilter {
    const hidden = new Set(this.hidden);
    if (hidden.has(category)) hidden.delete(category);
    else hidden.add(category);
    return new PointFilter(this.query, hidden);
  }

  /** Whether points of this category are currently hidden. */
  isHidden(category: CategoryId): boolean {
    return this.hidden.has(category);
  }

  /** Keeps the points that pass both the category and the search filter. */
  apply(points: readonly Point[]): Point[] {
    return points.filter((p) => !this.hidden.has(p.category) && p.matches(this.query));
  }
}
