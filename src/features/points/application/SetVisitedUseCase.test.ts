import { describe, expect, it } from "vitest";
import { PointsStore } from "./PointsStore";
import { SetVisitedUseCase } from "./SetVisitedUseCase";

describe("SetVisitedUseCase", () => {
  it("marks a reference point and saves it", async () => {
    const saved: [string, boolean][] = [];
    const store = new PointsStore();
    const ok = await new SetVisitedUseCase(async (id, v) => void saved.push([id, v]), store).execute("ref-1", true);
    expect(ok).toBe(true);
    expect(store.state.visitedIds.has("ref-1")).toBe(true);
    expect(saved).toEqual([["ref-1", true]]);
  });

  it("rolls back when saving fails", async () => {
    const store = new PointsStore();
    const ok = await new SetVisitedUseCase(() => Promise.reject(new Error("down")), store).execute("ref-1", true);
    expect(ok).toBe(false);
    expect(store.state.visitedIds.has("ref-1")).toBe(false);
  });

  it("ignores user points", async () => {
    const store = new PointsStore();
    expect(await new SetVisitedUseCase(async () => {}, store).execute("u-1", true)).toBe(false);
    expect(store.state.visitedIds.size).toBe(0);
  });
});
