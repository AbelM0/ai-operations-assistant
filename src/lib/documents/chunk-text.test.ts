import { describe, expect, it } from "vitest";
import { chunkPages } from "./chunk-text";

function words(count: number, prefix = "word") {
  return Array.from({ length: count }, (_, index) => `${prefix}-${index}`);
}

describe("chunkPages", () => {
  it("ignores pages without text", () => {
    expect(
      chunkPages([
        { pageNumber: 1, text: "" },
        { pageNumber: 2, text: "  \n\t " },
      ]),
    ).toEqual([]);
  });

  it("keeps a short page in a single chunk", () => {
    const chunks = chunkPages([{ pageNumber: 7, text: "one two three" }]);

    expect(chunks).toEqual([
      {
        chunkIndex: 0,
        pageNumber: 7,
        tokenCount: 4,
        textContent: "one two three",
      },
    ]);
  });

  it("creates 420-word chunks with a 70-word overlap", () => {
    const input = words(500);
    const chunks = chunkPages([{ pageNumber: 1, text: input.join(" ") }]);

    expect(chunks).toHaveLength(2);
    expect(chunks[0].textContent.split(" ")).toEqual(input.slice(0, 420));
    expect(chunks[1].textContent.split(" ")).toEqual(input.slice(350, 500));
    expect(chunks[0].textContent.split(" ").slice(-70)).toEqual(
      chunks[1].textContent.split(" ").slice(0, 70),
    );
  });

  it("continues chunk indexes while preserving page numbers", () => {
    const chunks = chunkPages([
      { pageNumber: 3, text: "first page" },
      { pageNumber: 9, text: "second page" },
    ]);

    expect(chunks.map(({ chunkIndex, pageNumber }) => ({ chunkIndex, pageNumber }))).toEqual([
      { chunkIndex: 0, pageNumber: 3 },
      { chunkIndex: 1, pageNumber: 9 },
    ]);
  });
});
