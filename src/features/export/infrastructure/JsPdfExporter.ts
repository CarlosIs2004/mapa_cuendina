/**
 * JsPdfExporter — export/infrastructure (adapter).
 * Implements ExportWriter: lays the rendered canvas out on A3/A4 pages with
 * jsPDF (including the 2x2 A4 mosaic) and triggers the download. The PNG
 * format bypasses jsPDF and downloads the canvas as-is. jsPDF is loaded on
 * demand (dynamic import) so it does not weigh on the initial page load.
 */

import type { jsPDF } from "jspdf";
import { BrowserFileDownloader } from "../../../shared/infrastructure/BrowserFileDownloader";
import { fitInto, mosaicPieces, type Rect } from "../domain/ExportLayout";
import type { ExportFormat, ExportWriter } from "../domain/ports";

const PAGE_MARGIN_MM = 8;
const FILE_BASE = "mapa-cuendina";

/** Writes map canvases as PDF or PNG downloads. */
export class JsPdfExporter implements ExportWriter<HTMLCanvasElement> {
  constructor(private readonly downloader = new BrowserFileDownloader()) {}

  /** Downloads the canvas in the requested format. */
  async write(canvas: HTMLCanvasElement, format: ExportFormat): Promise<void> {
    if (format === "png") {
      this.downloader.downloadDataUrl(`${FILE_BASE}.png`, canvas.toDataURL("image/png"));
      return;
    }
    (await this.buildPdf(canvas, format)).save(`${FILE_BASE}-${format}.pdf`);
  }

  /** One fitted page per piece: the whole canvas, or four quarters for the mosaic. */
  private async buildPdf(canvas: HTMLCanvasElement, format: Exclude<ExportFormat, "png">): Promise<jsPDF> {
    const { jsPDF } = await import("jspdf");
    const paper = format === "a3" ? "a3" : "a4";
    const pieces =
      format === "a4x4"
        ? mosaicPieces(canvas.width, canvas.height).map((r) => this.crop(canvas, r))
        : [canvas];
    const orientation = (c: HTMLCanvasElement) => (c.width >= c.height ? "landscape" : "portrait");
    const pdf = new jsPDF({ orientation: orientation(pieces[0]!), unit: "mm", format: paper });
    pieces.forEach((piece, i) => {
      if (i > 0) pdf.addPage(paper, orientation(piece));
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const r = fitInto(piece.width, piece.height, pw, ph, PAGE_MARGIN_MM);
      pdf.addImage(piece.toDataURL("image/png"), "PNG", r.x, r.y, r.w, r.h);
    });
    return pdf;
  }

  private crop(src: HTMLCanvasElement, r: Rect): HTMLCanvasElement {
    const c = document.createElement("canvas");
    c.width = r.sw;
    c.height = r.sh;
    c.getContext("2d")?.drawImage(src, r.sx, r.sy, r.sw, r.sh, 0, 0, r.sw, r.sh);
    return c;
  }
}
