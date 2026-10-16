/**
 * OsmTileProvider — export/infrastructure (adapter).
 * Loads OpenStreetMap tiles as images for the export canvas.
 *
 * - `crossOrigin = "anonymous"` is required: without CORS the tiles "taint"
 *   the canvas and `toDataURL()` throws, so PNG/PDF export would fail.
 * - The page must be served over http(s). Opened from file://, browsers send
 *   no Referer and OSM's tile policy answers 403.
 */

import type { TileProvider } from "../domain/ports";

/** Fetches tiles from tile.openstreetmap.org. */
export class OsmTileProvider implements TileProvider<HTMLImageElement> {
  constructor(private readonly urlTemplate = "https://tile.openstreetmap.org/{z}/{x}/{y}.png") {}

  /** Resolves the loaded image, or null on error so one missing tile does not abort the export. */
  load(zoom: number, x: number, y: number): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = this.urlTemplate.replace("{z}", String(zoom)).replace("{x}", String(x)).replace("{y}", String(y));
    });
  }
}
