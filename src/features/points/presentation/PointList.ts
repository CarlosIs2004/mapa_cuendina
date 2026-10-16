/**
 * PointList — points/presentation.
 * Sidebar list of visible points. Selecting one is reported through
 * `onSelect` so the composition root decides what happens (fly to it).
 */

import { Component } from "../../../shared/ui/Component";
import { escapeHtml } from "../../../shared/utils/escapeHtml";
import type { FilterPointsUseCase } from "../application/FilterPointsUseCase";
import type { PointsStore } from "../application/PointsStore";
import type { CategoryCatalog } from "../domain/Category";
import type { Point } from "../domain/Point";

/** List of visible points with color swatch and category label. */
export class PointList extends Component<HTMLUListElement> {
  constructor(
    root: HTMLUListElement,
    private readonly store: PointsStore,
    private readonly visiblePoints: FilterPointsUseCase,
    private readonly catalog: CategoryCatalog,
    private readonly onSelect: (point: Point) => void,
  ) {
    super(root);
  }

  /** Redraws the list, or "Sin resultados." when nothing matches. */
  override render(): void {
    const items = this.visiblePoints.execute();
    this.root.replaceChildren();
    if (!items.length) {
      this.root.innerHTML = '<li class="p-4 text-sm text-slate-500">Sin resultados.</li>';
      return;
    }
    for (const p of items) {
      const c = this.catalog.get(p.category);
      const li = document.createElement("li");
      li.className = "flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer";
      li.innerHTML = `<span class="w-3.5 h-3.5 rounded-full shrink-0" style="background:${c.color}"></span>
        <div class="min-w-0"><p class="text-sm font-medium truncate">${escapeHtml(p.name)}</p>
        <p class="text-xs text-slate-500">${escapeHtml(c.label)}</p></div>`;
      li.addEventListener("click", () => this.onSelect(p));
      this.root.appendChild(li);
    }
  }

  protected override bind(): void {
    this.store.subscribe(() => this.render());
  }
}
