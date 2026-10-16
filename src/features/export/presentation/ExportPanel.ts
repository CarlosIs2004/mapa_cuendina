/**
 * ExportPanel — export/presentation.
 * Sidebar controls for the map download: format selector + "Descargar".
 * Talks only to the export use case and the visible-points use case.
 */

import { Button } from "../../../shared/ui/Button";
import { Component } from "../../../shared/ui/Component";
import type { FilterPointsUseCase } from "../../points/application/FilterPointsUseCase";
import type { ExportMapUseCase } from "../application/ExportMapUseCase";
import { isExportFormat } from "../domain/ports";

/** Export format select and download button. */
export class ExportPanel extends Component {
  private readonly exportButton: Button;
  private readonly formatSelect: HTMLSelectElement;

  /** @param root Container holding #exportFmt and #exportBtn. */
  constructor(
    root: HTMLElement,
    private readonly exportMap: ExportMapUseCase<unknown>,
    private readonly visiblePoints: FilterPointsUseCase,
  ) {
    super(root);
    this.exportButton = new Button(Component.within<HTMLButtonElement>(root, "#exportBtn"));
    this.formatSelect = Component.within<HTMLSelectElement>(root, "#exportFmt");
  }

  protected override bind(): void {
    this.exportButton.onClick(() => void this.download());
  }

  /** Renders the map in the chosen format; shows "Generando…" meanwhile and "Error" on failure. */
  private async download(): Promise<void> {
    const format = this.formatSelect.value;
    if (!isExportFormat(format)) return;
    this.exportButton.setBusy(true, "Generando…");
    const result = await this.exportMap.execute(format, this.visiblePoints.execute());
    this.exportButton.setBusy(false);
    if (!result.ok) {
      console.error(result.error);
      this.exportButton.flash("Error");
    }
  }
}
