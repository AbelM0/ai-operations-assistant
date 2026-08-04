import { describe, expect, it } from "vitest";
import { buildEvidenceExcerpt } from "./evidence";

describe("buildEvidenceExcerpt", () => {
  it("returns null when no evidence contains text", () => {
    expect(buildEvidenceExcerpt(["", "  \n\t "])).toBeNull();
  });

  it("normalizes whitespace while keeping paragraph boundaries", () => {
    expect(buildEvidenceExcerpt(["  Alpha   beta\r\n\r\n\r\n Gamma  "])).toBe(
      "Alpha beta\n\nGamma",
    );
  });

  it("removes repeated overlap between adjacent chunks", () => {
    const overlap = "one two three four five six seven eight";
    const result = buildEvidenceExcerpt([
      `Introduction ${overlap}`,
      `${overlap} conclusion`,
    ]);

    expect(result).toBe(`Introduction ${overlap}\n\nconclusion`);
  });

  it("truncates at a word boundary and adds an ellipsis", () => {
    const result = buildEvidenceExcerpt(
      ["alpha beta gamma delta epsilon zeta eta theta"],
      32,
    );

    expect(result).toBe("alpha beta gamma delta epsilon…");
    expect(result!.length).toBeLessThanOrEqual(32);
  });
});
