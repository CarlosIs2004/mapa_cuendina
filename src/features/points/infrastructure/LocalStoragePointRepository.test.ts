import { beforeEach, describe, expect, it } from "vitest";
import { Point } from "../domain/Point";
import { LocalStoragePointRepository, STORE_KEY } from "./LocalStoragePointRepository";

const snapshot = { id: "u-1", name: "Esquina", category: "robos" as const, lat: -0.37, lng: -78.48, description: "" };
const point = Point.fromSnapshot(snapshot);
const ids = (list: Point[]) => list.map((p) => p.id);

describe("LocalStoragePointRepository", () => {
  beforeEach(() => localStorage.clear());

  it("returns an empty list when nothing is stored", async () => {
    expect(await new LocalStoragePointRepository(localStorage).list()).toEqual([]);
  });

  it("persists added points as plain JSON under the v1 key", async () => {
    const repo = new LocalStoragePointRepository(localStorage);
    await repo.add(point);
    expect(STORE_KEY).toBe("mapa-cuendina:points:v1");
    expect(JSON.parse(localStorage.getItem(STORE_KEY)!)).toEqual([snapshot]);
    const reloaded = await new LocalStoragePointRepository(localStorage).list();
    expect(reloaded.map((p) => p.toSnapshot())).toEqual([snapshot]);
  });

  it("removes a point by id", async () => {
    const repo = new LocalStoragePointRepository(localStorage);
    await repo.add(point);
    await repo.add(Point.fromSnapshot({ ...snapshot, id: "u-2" }));
    await repo.remove("u-1");
    expect(ids(await repo.list())).toEqual(["u-2"]);
  });

  it("reads the bare array written by the old single-file app under the same key", async () => {
    const legacy = [{ id: "u-1700000000000", category: "camaras", name: "Cámara tienda", description: "", lat: -0.375, lng: -78.482 }];
    localStorage.setItem("mapa-cuendina:points:v1", JSON.stringify(legacy));
    const loaded = await new LocalStoragePointRepository(localStorage).list();
    expect(loaded.map((p) => p.toSnapshot())).toEqual(legacy);
  });

  it("ignores corrupted or invalid stored data", async () => {
    localStorage.setItem(STORE_KEY, "{not json");
    expect(await new LocalStoragePointRepository(localStorage).list()).toEqual([]);
    localStorage.setItem(STORE_KEY, JSON.stringify([snapshot, { id: "x", category: "unknown" }]));
    expect(ids(await new LocalStoragePointRepository(localStorage).list())).toEqual(["u-1"]);
  });

  it("does not throw when storage is unavailable", async () => {
    const broken = {
      getItem: () => { throw new Error("blocked"); },
      setItem: () => { throw new Error("blocked"); },
    } as unknown as Storage;
    const repo = new LocalStoragePointRepository(broken);
    await expect(repo.list()).resolves.toEqual([]);
    await expect(repo.add(point)).resolves.toBeUndefined();
  });
});
