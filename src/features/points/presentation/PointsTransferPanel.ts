/**
 * PointsTransferPanel — points/presentation.
 * "Exportar puntos (JSON)" / "Importar puntos (JSON)" buttons. Handles the
 * browser side (file picker, File.text(), download) and delegates format,
 * validation and merging to the use cases. Shows a non-blocking status line
 * instead of alert().
 */

import type { BrowserFileDownloader } from "../../../shared/infrastructure/BrowserFileDownloader";
import { Component } from "../../../shared/ui/Component";
import type { ExportPointsUseCase } from "../application/ExportPointsUseCase";
import type { ImportPointsUseCase } from "../application/ImportPointsUseCase";

const MESSAGE_MS = 4000;

/** JSON export/import controls with a transient status message. */
export class PointsTransferPanel extends Component {
  private readonly exportButton: HTMLButtonElement;
  private readonly importButton: HTMLButtonElement;
  private readonly fileInput: HTMLInputElement;
  private readonly message: HTMLElement;
  private messageTimer = 0;

  /** @param root Container holding #exportPointsBtn, #importPointsBtn, #importFile and #transferMsg. */
  constructor(
    root: HTMLElement,
    private readonly exportPoints: ExportPointsUseCase,
    private readonly importPoints: ImportPointsUseCase,
    private readonly downloader: BrowserFileDownloader,
  ) {
    super(root);
    this.exportButton = Component.within<HTMLButtonElement>(root, "#exportPointsBtn");
    this.importButton = Component.within<HTMLButtonElement>(root, "#importPointsBtn");
    this.fileInput = Component.within<HTMLInputElement>(root, "#importFile");
    this.message = Component.within(root, "#transferMsg");
  }

  protected override bind(): void {
    this.exportButton.addEventListener("click", () => this.download());
    this.importButton.addEventListener("click", () => this.fileInput.click());
    this.fileInput.addEventListener("change", () => void this.importSelected());
  }

  private download(): void {
    const { fileName, document } = this.exportPoints.execute();
    this.downloader.downloadText(fileName, JSON.stringify(document, null, 2));
    this.show(`Exportados: ${document.points.length}`);
  }

  private async importSelected(): Promise<void> {
    const file = this.fileInput.files?.[0];
    this.fileInput.value = ""; // allow re-importing the same file
    if (!file) return;
    const result = await this.importPoints.execute(await file.text());
    if (result.ok) this.show(`Importados: ${result.value.imported} · Omitidos: ${result.value.skipped}`);
    else this.show("Archivo no válido", true);
  }

  /** Shows a short status message that hides itself after a few seconds. */
  private show(text: string, isError = false): void {
    this.message.textContent = text;
    this.message.classList.toggle("text-red-600", isError);
    this.message.classList.toggle("text-slate-600", !isError);
    this.message.classList.remove("hidden");
    window.clearTimeout(this.messageTimer);
    this.messageTimer = window.setTimeout(() => this.message.classList.add("hidden"), MESSAGE_MS);
  }
}
