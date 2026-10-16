import { describe, expect, it } from "vitest";
import { googleMapsDirectionsUrl } from "./directions";

describe("googleMapsDirectionsUrl", () => {
  it("builds a directions link to the point coordinates", () => {
    expect(googleMapsDirectionsUrl({ lat: -0.3750804, lng: -78.4820379 })).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=-0.3750804,-78.4820379",
    );
  });
});
