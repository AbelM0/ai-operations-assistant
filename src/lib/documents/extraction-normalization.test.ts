import { describe, expect, it } from "vitest";
import { normalizeExtractionDate } from "./extraction-normalization";

describe("normalizeExtractionDate", () => {
  it.each([
    ["2026-08-04", "2026-08-04"],
    ["2026/8/4", "2026-08-04"],
    ["4 Aug 2026", "2026-08-04"],
    ["04-August-2026", "2026-08-04"],
    ["Aug 4, 2026", "2026-08-04"],
    ["August.04.2026", "2026-08-04"],
    [" 2026-08-04 ", "2026-08-04"],
  ])("normalizes %s", (input, expected) => {
    expect(normalizeExtractionDate(input)).toBe(expected);
  });

  it.each([
    null,
    undefined,
    "",
    "2026-02-29",
    "31 April 2026",
    "04 NotAMonth 2026",
    "04/08/2026",
    "tomorrow",
  ])("rejects unsupported or invalid value %s", (input) => {
    expect(normalizeExtractionDate(input)).toBeNull();
  });
});
