/**
 * ports — export/domain.
 * Contracts the export use cases depend on. Image types are generic so the
 * domain never references canvas/DOM; infrastructure binds them to
 * HTMLCanvasElement / HTMLImageElement.
 */

import type { GeoBounds } from "../../area/domain/GeoBounds";
import type { Point } from "../../points/domain/Point";

/** Output formats offered in the "Descargar" selector. */
export type ExportFormat = "a3" | "a4x4" | "a4" | "png";

/** Narrows a raw <select> value to a supported format. */
export const isExportFormat = (value: string): value is ExportFormat =>
  value === "a3" || value === "a4x4" || value === "a4" || value === "png";

/** What to draw on an exported map image. */
export interface RenderRequest {
  bounds: GeoBounds;
  zoom: number;
  points: readonly Point[];
}

/** Supplies map tiles by slippy-map coordinates; resolves null when a tile cannot be loaded. */
export interface TileProvider<TTile> {
  load(zoom: number, x: number, y: number): Promise<TTile | null>;
}

/** Draws the area (tiles, points, legend, attribution) into an image. */
export interface MapImageRenderer<TImage> {
  render(request: RenderRequest): Promise<TImage>;
}

/** Turns a rendered image into a downloadable file in the given format. */
export interface ExportWriter<TImage> {
  write(image: TImage, format: ExportFormat): Promise<void>;
}
