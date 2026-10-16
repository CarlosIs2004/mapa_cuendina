import { describe, expect, it, vi } from "vitest";
import { GeoBounds } from "../../area/domain/GeoBounds";
import { LatLng } from "../../../shared/domain/LatLng";
import { Point } from "../../points/domain/Point";
import type { MapImageRenderer, ExportWriter } from "../domain/ports";
import { ExportMapUseCase } from "./ExportMapUseCase";

const bounds = GeoBounds.fromPoints([new LatLng(0, 0), new LatLng(1, 1)]);
const inside = Point.fromSnapshot({ id: "u-1", name: "In", category: "robos", lat: 0.5, lng: 0.5 });
const outside = Point.fromSnapshot({ id: "u-2", name: "Out", category: "robos", lat: 5, lng: 5 });

describe("ExportMapUseCase", () => {
  it("renders only points inside the area and writes the image in the chosen format", async () => {
    const image = { width: 10, height: 10 };
    const renderer: MapImageRenderer<typeof image> = { render: vi.fn(async () => image) };
    const writer: ExportWriter<typeof image> = { write: vi.fn(async () => undefined) };
    const result = await new ExportMapUseCase(renderer, writer, bounds, 17).execute("a3", [inside, outside]);

    expect(result.ok).toBe(true);
    expect(renderer.render).toHaveBeenCalledWith({ bounds, zoom: 17, points: [inside] });
    expect(writer.write).toHaveBeenCalledWith(image, "a3");
  });

  it("returns a failure instead of throwing when rendering fails", async () => {
    const renderer: MapImageRenderer<unknown> = { render: async () => { throw new Error("tiles"); } };
    const writer: ExportWriter<unknown> = { write: vi.fn() };
    const result = await new ExportMapUseCase(renderer, writer, bounds, 17).execute("png", []);
    expect(result.ok).toBe(false);
    expect(writer.write).not.toHaveBeenCalled();
  });
});
