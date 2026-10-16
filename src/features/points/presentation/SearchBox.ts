/**
 * SearchBox — points/presentation.
 * The "Buscar…" input; pushes the typed text into the store's filter.
 */

import { Component } from "../../../shared/ui/Component";
import type { PointsStore } from "../application/PointsStore";

/** Free-text search over point names and descriptions. */
export class SearchBox extends Component<HTMLInputElement> {
  constructor(
    root: HTMLInputElement,
    private readonly store: PointsStore,
  ) {
    super(root);
  }

  protected override bind(): void {
    this.root.addEventListener("input", () => this.store.setQuery(this.root.value));
  }
}
