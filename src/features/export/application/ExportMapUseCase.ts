/**
 * ExportMapUseCase — export/application.
 * Produces a downloadable map (PDF A3, 4xA4 mosaic, A4 or PNG) cropped to the
 * community area, containing only the visible points inside it.
 */

import { Result } from "../../../shared/domain/Result";
import type { GeoBounds } from "../../area/domain/GeoBounds";
import type { Point } from "../../points/domain/Point";
import type { ExportFormat, ExportWriter, MapImageRenderer } from "../domain/ports";

/** Renders the area and writes it in the requested format. */
export class ExportMapUseCase<TImage> {
  /**
   * @param zoom Tile zoom for the export. OSM labels have a fixed pixel size, so
   *   z17 printed at ~110-160 dpi keeps street names legible on paper.
   */
  constructor(
    private readonly renderer: MapImageRenderer<TImage>,
    private readonly writer: ExportWriter<TImage>,
    private readonly bounds: GeoBounds,
    private readonly zoom: number,
  ) {}

  /** Returns a failure result instead of throwing so the UI can show "Error". */
  async execute(format: ExportFormat, visiblePoints: readonly Point[]): Promise<Result<void>> {
    try {
      const points = visiblePoints.filter((p) => this.bounds.contains(p));
      const image = await this.renderer.render({ bounds: this.bounds, zoom: this.zoom, points });
      await this.writer.write(image, format);
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
