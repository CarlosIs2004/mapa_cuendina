/**
 * CategoryFilters — points/presentation.
 * One row of toggle chips per category group; toggling hides/shows that
 * category everywhere (map, list, export) through the store.
 */

import { Chip } from "../../../shared/ui/Chip";
import { Component } from "../../../shared/ui/Component";
import { escapeHtml } from "../../../shared/utils/escapeHtml";
import type { PointsStore } from "../application/PointsStore";
import type { CategoryCatalog } from "../domain/Category";

/** Grouped category toggles. */
export class CategoryFilters extends Component {
  constructor(
    root: HTMLElement,
    private readonly store: PointsStore,
    private readonly catalog: CategoryCatalog,
  ) {
    super(root);
  }

  /** Rebuilds the chips to reflect the current hidden categories. */
  override render(): void {
    const { filter } = this.store.state;
    this.root.replaceChildren();
    for (const [group, groupLabel] of this.catalog.groupEntries()) {
      const wrap = document.createElement("div");
      wrap.innerHTML = `<p class="text-[11px] font-semibold uppercase text-slate-400 mb-1">${escapeHtml(groupLabel)}</p>`;
      const row = document.createElement("div");
      row.className = "flex flex-wrap gap-1.5";
      for (const c of this.catalog.inGroup(group)) {
        const chip = new Chip({
          label: c.label,
          color: c.color,
          active: !filter.isHidden(c.id),
          onToggle: () => this.store.toggleCategory(c.id),
        }).mount();
        row.appendChild(chip.element);
      }
      wrap.appendChild(row);
      this.root.appendChild(wrap);
    }
  }

  protected override bind(): void {
    this.store.subscribe(() => this.render());
  }
}
