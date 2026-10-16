/**
 * CanvasMapRenderer — export/infrastructure (adapter).
 * Builds the export image on a <canvas> straight from tiles (not a screenshot
 * of the live map), cropped exactly to the area, then draws points, frame,
 * legend and the mandatory "© OpenStreetMap contributors" attribution.
 */

import { TILE_SIZE, project } from "../../../shared/utils/webMercator";
import type { CategoryCatalog } from "../../points/domain/Category";
import { canvasFrame, tilesFor } from "../domain/ExportLayout";
import type { MapImageRenderer, RenderRequest, TileProvider } from "../domain/ports";

const TITLE = "Cuendina · Amaguaña";
const BACKGROUND = "#f2efe9";
const INK = "#0f172a";

/** Renders map images with the Canvas 2D API. */
export class CanvasMapRenderer implements MapImageRenderer<HTMLCanvasElement> {
  /** @param batchSize Tiles requested at once; small batches are gentler with OSM servers. */
  constructor(
    private readonly tiles: TileProvider<CanvasImageSource>,
    private readonly catalog: CategoryCatalog,
    private readonly batchSize = 6,
  ) {}

  /** Draws tiles, points and legend for the request into a new canvas. */
  async render({ bounds, zoom, points }: RenderRequest): Promise<HTMLCanvasElement> {
    const frame = canvasFrame(bounds, zoom);
    const { width: W, height: H } = frame;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(0, 0, W, H);

    const jobs = tilesFor(frame);
    for (let i = 0; i < jobs.length; i += this.batchSize) {
      const batch = jobs.slice(i, i + this.batchSize);
      const imgs = await Promise.all(batch.map(([tx, ty]) => this.tiles.load(zoom, tx, ty)));
      imgs.forEach((img, k) => {
        const [tx, ty] = batch[k]!;
        if (img) ctx.drawImage(img, tx * TILE_SIZE - frame.x0, ty * TILE_SIZE - frame.y0);
      });
    }

    for (const p of points) {
      const pt = project(p, zoom);
      const x = pt.x - frame.x0;
      const y = pt.y - frame.y0;
      ctx.beginPath();
      ctx.arc(x, y, 9, 0, Math.PI * 2);
      ctx.fillStyle = this.catalog.get(p.category).color;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#fff";
      ctx.stroke();
      this.drawLabel(ctx, p.name, x + 13, y + 5, "bold 13px sans-serif");
    }

    ctx.lineWidth = 3;
    ctx.strokeStyle = INK;
    ctx.strokeRect(1.5, 1.5, W - 3, H - 3);
    this.drawLegend(ctx, H, new Set(points.map((p) => p.category)));

    ctx.textAlign = "right";
    this.drawLabel(ctx, "© OpenStreetMap contributors", W - 10, H - 10, "11px sans-serif", "#334155");
    ctx.textAlign = "left";
    return canvas;
  }

  private drawLegend(ctx: CanvasRenderingContext2D, H: number, used: Set<string>): void {
    const categories = this.catalog.categories.filter((c) => used.has(c.id));
    const boxH = 34 + categories.length * 20;
    ctx.fillStyle = "rgba(255,255,255,.92)";
    ctx.fillRect(12, H - boxH - 12, 250, boxH);
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1;
    ctx.strokeRect(12, H - boxH - 12, 250, boxH);
    ctx.fillStyle = INK;
    ctx.font = "bold 15px sans-serif";
    ctx.fillText(TITLE, 22, H - boxH + 10);
    categories.forEach((c, i) => {
      const yy = H - boxH + 32 + i * 20;
      ctx.beginPath();
      ctx.arc(28, yy - 4, 6, 0, Math.PI * 2);
      ctx.fillStyle = c.color;
      ctx.fill();
      ctx.fillStyle = INK;
      ctx.font = "13px sans-serif";
      ctx.fillText(c.label, 42, yy);
    });
  }

  /** Text with a white halo so it stays readable over any tile. */
  private drawLabel(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, font: string, color = INK): void {
    ctx.font = font;
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 4;
    ctx.strokeText(text, x, y);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }
}
