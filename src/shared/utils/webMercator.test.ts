import { describe, expect, it } from "vitest";
import { project } from "./webMercator";

describe("project (Web Mercator, 256px tiles)", () => {
  it("maps the origin to the center of the world tile", () => {
    expect(project({ lat: 0, lng: 0 }, 0)).toEqual({ x: 128, y: 128 });
  });

  it("doubles pixel coordinates per zoom level", () => {
    const a = project({ lat: -0.37, lng: -78.48 }, 16);
    const b = project({ lat: -0.37, lng: -78.48 }, 17);
    expect(b.x).toBeCloseTo(a.x * 2, 6);
    expect(b.y).toBeCloseTo(a.y * 2, 6);
  });

  it("grows y towards the south", () => {
    expect(project({ lat: -1, lng: 0 }, 1).y).toBeGreaterThan(project({ lat: 1, lng: 0 }, 1).y);
  });
});
