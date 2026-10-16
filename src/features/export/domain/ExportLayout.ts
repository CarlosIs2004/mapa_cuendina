/**
 * ExportLayout — export/domain.
 * Pure layout math for export: which pixel window and tiles cover
 * the area, how the A4 mosaic is cut, and how an image fits on a page.
 * Kept free of canvas/DOM so it is unit-tested.
 */

import { TILE_SIZE, project } from "../../../shared/utils/webMercator";
import type { GeoBounds } from "../../area/domain/GeoBounds";

/** Pixel window, at a given zoom, that the export canvas covers. */
export interface Frame {
  x0: number;
  y0: number;
  width: number;
  height: number;
}

/** Source rectangle inside an image. */
export interface Rect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

/** Integer pixel window covering the bounds at the given zoom (crops exactly to the area). */
export function canvasFrame(b: GeoBounds, zoom: number): Frame {
  const nw = project(b.northWest, zoom);
  const se = project(b.southEast, zoom);
  const x0 = Math.floor(nw.x);
  const y0 = Math.floor(nw.y);
  return { x0, y0, width: Math.ceil(se.x) - x0, height: Math.ceil(se.y) - y0 };
}

/** Tile coordinates [tx, ty] intersecting the frame, column by column. */
export function tilesFor(f: Frame): [number, number][] {
  const tiles: [number, number][] = [];
  const lastX = Math.floor((f.x0 + f.width - 1) / TILE_SIZE);
  const lastY = Math.floor((f.y0 + f.height - 1) / TILE_SIZE);
  for (let tx = Math.floor(f.x0 / TILE_SIZE); tx <= lastX; tx++)
    for (let ty = Math.floor(f.y0 / TILE_SIZE); ty <= lastY; ty++) tiles.push([tx, ty]);
  return tiles;
}

/** 2x2 crop rectangles (row-major) for the "4 A4 sheets to join" mosaic. */
export function mosaicPieces(width: number, height: number): Rect[] {
  const hw = Math.ceil(width / 2);
  const hh = Math.ceil(height / 2);
  const pieces: Rect[] = [];
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 2; c++)
      pieces.push({ sx: c * hw, sy: r * hh, sw: Math.min(hw, width - c * hw), sh: Math.min(hh, height - r * hh) });
  return pieces;
}

/** Scales content into a page with uniform margins, preserving aspect ratio, centered. */
export function fitInto(cw: number, ch: number, pw: number, ph: number, margin: number) {
  const s = Math.min((pw - 2 * margin) / cw, (ph - 2 * margin) / ch);
  const w = cw * s;
  const h = ch * s;
  return { x: (pw - w) / 2, y: (ph - h) / 2, w, h };
}
