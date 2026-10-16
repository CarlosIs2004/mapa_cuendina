import { describe, expect, it } from "vitest";
import { project } from "../../../shared/utils/webMercator";
import { LIMIT_BOUNDS } from "../../area/domain/communityArea";
import { canvasFrame, fitInto, mosaicPieces, tilesFor } from "./ExportLayout";

describe("canvasFrame", () => {
  it("covers the bounds with integer pixel edges", () => {
    const f = canvasFrame(LIMIT_BOUNDS, 17);
    const nw = project(LIMIT_BOUNDS.northWest, 17);
    const se = project(LIMIT_BOUNDS.southEast, 17);
    expect(f.x0).toBe(Math.floor(nw.x));
    expect(f.y0).toBe(Math.floor(nw.y));
    expect(f.width).toBe(Math.ceil(se.x) - f.x0);
    expect(f.height).toBe(Math.ceil(se.y) - f.y0);
    expect(f.width).toBeGreaterThan(0);
    expect(f.height).toBeGreaterThan(0);
  });
});

describe("tilesFor", () => {
  it("lists every tile intersecting the frame", () => {
    expect(tilesFor({ x0: 250, y0: 10, width: 20, height: 300 })).toEqual([
      [0, 0], [0, 1], [1, 0], [1, 1],
    ]);
  });

  it("returns one tile when the frame fits inside it", () => {
    expect(tilesFor({ x0: 512, y0: 512, width: 256, height: 256 })).toEqual([[2, 2]]);
  });
});

describe("mosaicPieces", () => {
  it("splits into a 2x2 grid covering the whole canvas without overlap", () => {
    expect(mosaicPieces(101, 51)).toEqual([
      { sx: 0, sy: 0, sw: 51, sh: 26 },
      { sx: 51, sy: 0, sw: 50, sh: 26 },
      { sx: 0, sy: 26, sw: 51, sh: 25 },
      { sx: 51, sy: 26, sw: 50, sh: 25 },
    ]);
  });
});

describe("fitInto", () => {
  it("scales content into the page minus margins and centers it", () => {
    const r = fitInto(200, 100, 297, 210, 8);
    expect(r.w).toBeCloseTo(281);
    expect(r.h).toBeCloseTo(140.5);
    expect(r.x).toBeCloseTo(8);
    expect(r.y).toBeCloseTo((210 - 140.5) / 2);
  });
});
