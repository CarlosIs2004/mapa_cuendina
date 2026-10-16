import { describe, expect, it } from "vitest";
import { CATEGORY_CATALOG } from "../../points/domain/Category";
import { Point } from "../../points/domain/Point";
import { popupHtml } from "./popupTemplate";

describe("popupHtml", () => {
  it("escapes user text and offers delete only for user points", () => {
    const user = Point.fromSnapshot({ id: "u-1", name: "<img onerror=x>", category: "robos", lat: 1, lng: 2, description: "a&b" });
    const html = popupHtml(user, CATEGORY_CATALOG);
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img onerror=x&gt;");
    expect(html).toContain("a&amp;b");
    expect(html).toContain('data-del="u-1"');
    expect(html).toContain("destination=1,2");
  });

  it("omits the delete button for reference points", () => {
    const ref = Point.fromSnapshot({ id: "ref-1", name: "Iglesia", category: "referencia", lat: 1, lng: 2 });
    expect(popupHtml(ref, CATEGORY_CATALOG)).not.toContain("data-del");
  });
});
