import { describe, expect, it } from "vitest";
import { LatLng } from "../../../shared/domain/LatLng";
import { GeoBounds } from "./GeoBounds";

describe("GeoBounds", () => {
  const b = GeoBounds.fromPoints([new LatLng(-1, -2), new LatLng(1, 2), new LatLng(0, 0)]);

  it("computes the extent of a set of points", () => {
    expect([b.south, b.west, b.north, b.east]).toEqual([-1, -2, 1, 2]);
  });

  it("pads each side by ratio times the span, like Leaflet", () => {
    const p = b.pad(0.5);
    expect([p.south, p.west, p.north, p.east]).toEqual([-2, -4, 2, 4]);
  });

  it("checks containment inclusively", () => {
    expect(b.contains({ lat: 1, lng: 2 })).toBe(true);
    expect(b.contains({ lat: 1.01, lng: 0 })).toBe(false);
  });
});
