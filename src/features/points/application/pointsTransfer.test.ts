import { describe, expect, it } from "vitest";
import { Point } from "../domain/Point";
import type { PointRepository } from "../domain/PointRepository";
import { ExportPointsUseCase } from "./ExportPointsUseCase";
import { ImportPointsUseCase } from "./ImportPointsUseCase";
import { PointsStore } from "./PointsStore";

class InMemoryRepo implements PointRepository {
  constructor(public points: Point[] = []) {}
  async list() { return [...this.points]; }
  async add(p: Point) { this.points.push(p); }
  async remove(id: string) { this.points = this.points.filter((p) => p.id !== id); }
}

const existing = Point.fromSnapshot({ id: "u-1", name: "Esquina", category: "robos", lat: -0.37, lng: -78.48, description: "" });
const snap = (id: string, extra: Record<string, unknown> = {}) => ({ id, name: `P ${id}`, category: "licor", lat: -0.37, lng: -78.48, description: "", ...extra });

function setup() {
  const repo = new InMemoryRepo([existing]);
  const store = new PointsStore();
  store.setUserPoints([existing]);
  return { repo, store, importer: new ImportPointsUseCase(repo, store) };
}

describe("ExportPointsUseCase", () => {
  it("exports user points as a versioned document with a dated file name", () => {
    const store = new PointsStore();
    store.setUserPoints([existing]);
    const now = new Date(2026, 9, 5, 14, 30);
    const { fileName, document } = new ExportPointsUseCase(store, () => now).execute();
    expect(fileName).toBe("puntos-cuendina-2026-10-05.json");
    expect(document).toEqual({ version: 1, exportedAt: now.toISOString(), points: [existing.toSnapshot()] });
  });
});

describe("ImportPointsUseCase", () => {
  it("accepts the versioned export format and merges new points", async () => {
    const s = setup();
    const result = await s.importer.execute(JSON.stringify({ version: 1, exportedAt: "x", points: [snap("u-2")] }));
    expect(result).toEqual({ ok: true, value: { imported: 1, skipped: 0 } });
    expect(s.repo.points.map((p) => p.id)).toEqual(["u-1", "u-2"]);
    expect(s.store.state.userPoints.map((p) => p.id)).toEqual(["u-1", "u-2"]);
  });

  it("accepts a bare array (the old localStorage shape)", async () => {
    const s = setup();
    const result = await s.importer.execute(JSON.stringify([snap("u-3"), snap("u-4")]));
    expect(result).toEqual({ ok: true, value: { imported: 2, skipped: 0 } });
  });

  it("skips invalid points: unknown category, non-finite coordinates, blank name", async () => {
    const s = setup();
    const payload = [snap("a", { category: "nope" }), snap("b", { lat: "1" }), snap("c", { lng: null }), snap("d", { name: "   " }), snap("ok")];
    const result = await s.importer.execute(JSON.stringify(payload));
    expect(result).toEqual({ ok: true, value: { imported: 1, skipped: 4 } });
    expect(s.repo.points.map((p) => p.id)).toEqual(["u-1", "ok"]);
  });

  it("dedupes by id against existing points and within the file, and skips reference ids", async () => {
    const s = setup();
    const result = await s.importer.execute(JSON.stringify([snap("u-1"), snap("u-9"), snap("u-9"), snap("ref-1")]));
    expect(result).toEqual({ ok: true, value: { imported: 1, skipped: 3 } });
    expect(s.repo.points.map((p) => p.id)).toEqual(["u-1", "u-9"]);
  });

  it("fails for malformed JSON or an unrecognized shape without touching data", async () => {
    const s = setup();
    expect((await s.importer.execute("{oops")).ok).toBe(false);
    expect((await s.importer.execute(JSON.stringify({ hello: 1 }))).ok).toBe(false);
    expect(s.repo.points).toEqual([existing]);
  });
});
