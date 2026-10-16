import { describe, expect, it } from "vitest";
import { Point } from "./Point";
import { PointFilter } from "./PointFilter";

const ref = Point.fromSnapshot({ id: "ref-1", name: "Centro de Salud Cuendina", category: "referencia", lat: 0, lng: 0, description: "Centro de salud." });
const robbery = Point.fromSnapshot({ id: "u-1", name: "Esquina oscura", category: "robos", lat: 0, lng: 0, description: "Robos de noche" });
const alarm = Point.fromSnapshot({ id: "u-2", name: "Casa del barrio", category: "alarmas", lat: 0, lng: 0 });
const points = [ref, robbery, alarm];

describe("Point", () => {
  it("treats ref- prefixed ids as fixed references", () => {
    expect(ref.isUserPoint).toBe(false);
    expect(robbery.isUserPoint).toBe(true);
  });

  it("creates a user point with trimmed text and a u- id", () => {
    const p = Point.create({ category: "licor", name: "  Tienda  ", description: " x ", lat: 1, lng: 2 }, 42);
    expect(p.toSnapshot()).toEqual({ id: "u-42", category: "licor", name: "Tienda", description: "x", lat: 1, lng: 2 });
    expect(p.isUserPoint).toBe(true);
  });

  it("rejects an empty name", () => {
    expect(() => Point.create({ category: "licor", name: "   ", description: "", lat: 1, lng: 2 }, 1)).toThrow();
  });

  it("parses valid stored data and rejects unknown categories or bad coordinates", () => {
    const raw = robbery.toSnapshot();
    expect(Point.parse(raw)?.toSnapshot()).toEqual(raw);
    expect(Point.parse({ ...raw, category: "nope" })).toBeNull();
    expect(Point.parse({ ...raw, lat: "1" })).toBeNull();
    expect(Point.parse(null)).toBeNull();
  });
});

describe("PointFilter", () => {
  it("keeps every point with an empty query and no hidden categories", () => {
    expect(new PointFilter().apply(points)).toHaveLength(3);
  });

  it("matches the query against name and description, case-insensitively", () => {
    expect(new PointFilter("SALUD").apply(points).map((p) => p.id)).toEqual(["ref-1"]);
    expect(new PointFilter("de noche").apply(points).map((p) => p.id)).toEqual(["u-1"]);
  });

  it("drops points whose category is hidden, and toggling is immutable", () => {
    const base = new PointFilter();
    const filtered = base.toggle("robos").toggle("referencia");
    expect(filtered.apply(points).map((p) => p.id)).toEqual(["u-2"]);
    expect(base.isHidden("robos")).toBe(false);
    expect(filtered.toggle("robos").isHidden("robos")).toBe(false);
  });
});
