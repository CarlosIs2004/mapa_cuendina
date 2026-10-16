import { describe, expect, it, vi } from "vitest";
import { Point } from "../domain/Point";
import type { PointRepository } from "../domain/PointRepository";
import { AddPointUseCase } from "./AddPointUseCase";
import { FilterPointsUseCase } from "./FilterPointsUseCase";
import { ListPointsUseCase } from "./ListPointsUseCase";
import { LoadPointsUseCase } from "./LoadPointsUseCase";
import { PointsStore } from "./PointsStore";
import { RemovePointUseCase } from "./RemovePointUseCase";

class InMemoryRepo implements PointRepository {
  constructor(public points: Point[] = []) {}
  async list() { return [...this.points]; }
  async add(p: Point) { this.points.push(p); }
  async remove(id: string) { this.points = this.points.filter((p) => p.id !== id); }
}

const refs = [Point.fromSnapshot({ id: "ref-1", name: "Iglesia", category: "referencia", lat: 0, lng: 0 })];
const ids = (list: Point[]) => list.map((p) => p.id);

function setup(stored: Point[] = []) {
  const repo = new InMemoryRepo(stored);
  const store = new PointsStore();
  const list = new ListPointsUseCase(store, refs);
  return {
    repo,
    store,
    list,
    load: new LoadPointsUseCase(repo, store),
    add: new AddPointUseCase(repo, store, () => 7),
    remove: new RemovePointUseCase(repo, store),
    filter: new FilterPointsUseCase(list, store),
  };
}

describe("points use cases", () => {
  it("lists references plus loaded user points", async () => {
    const s = setup([Point.fromSnapshot({ id: "u-1", name: "A", category: "robos", lat: 0, lng: 0 })]);
    await s.load.execute();
    expect(ids(s.list.execute())).toEqual(["ref-1", "u-1"]);
  });

  it("adds and removes user points through the repository and notifies subscribers", async () => {
    const s = setup();
    const listener = vi.fn();
    s.store.subscribe(listener);
    await s.add.execute({ category: "bailes", name: "Fiesta", description: "", lat: 1, lng: 1 });
    expect(ids(s.repo.points)).toEqual(["u-7"]);
    expect(await s.remove.execute("u-7")).toBe(true);
    expect(s.repo.points).toEqual([]);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("never removes reference points", async () => {
    const s = setup();
    expect(await s.remove.execute("ref-1")).toBe(false);
    expect(ids(s.list.execute())).toEqual(["ref-1"]);
  });

  it("filters by the store's query and hidden categories", () => {
    const s = setup();
    s.store.toggleCategory("referencia");
    expect(s.filter.execute()).toEqual([]);
    s.store.toggleCategory("referencia");
    s.store.setQuery("nada");
    expect(s.filter.execute()).toEqual([]);
    s.store.setQuery("igle");
    expect(ids(s.filter.execute())).toEqual(["ref-1"]);
  });
});
