/**
 * BrowserFileDownloader — shared/infrastructure.
 * Triggers file downloads in the browser via a temporary <a download>. Shared
 * by the map export (PNG) and the points JSON export.
 */

/** Saves generated content as a file on the user's device. */
export class BrowserFileDownloader {
  /** Downloads text content (e.g. JSON) with the given MIME type. */
  downloadText(fileName: string, content: string, mimeType = "application/json"): void {
    const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
    this.click(url, fileName);
    // Revoke on the next tick so the browser has started the download.
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  /** Downloads a data: URL (e.g. canvas.toDataURL()). */
  downloadDataUrl(fileName: string, dataUrl: string): void {
    this.click(dataUrl, fileName);
  }

  private click(href: string, fileName: string): void {
    const a = document.createElement("a");
    a.href = href;
    a.download = fileName;
    a.click();
  }
}
