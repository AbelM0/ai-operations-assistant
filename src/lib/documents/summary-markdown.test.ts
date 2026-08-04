import { describe, expect, it } from "vitest";
import {
  parseSummaryInline,
  parseSummaryMarkdown,
  summaryMarkdownToPlainText,
} from "./summary-markdown";

describe("summary markdown", () => {
  it("parses nested inline emphasis and links", () => {
    expect(
      parseSummaryInline("Read **the _important_ [terms](https://example.com)**."),
    ).toEqual([
      { text: "Read " },
      { text: "the ", bold: true },
      { text: "important", bold: true, italic: true },
      { text: " terms", bold: true },
      { text: "." },
    ]);
  });

  it("parses headings, lists, quotes, code, rules, and tables", () => {
    const blocks = parseSummaryMarkdown(`# Overview

- First
- Second

> Verified statement

| Vendor | Amount |
| --- | ---: |
| Acme | 120 |

---

~~~
total = 120
~~~`);

    expect(blocks.map((block) => block.type)).toEqual([
      "heading",
      "list",
      "blockquote",
      "table",
      "rule",
      "code",
    ]);
  });

  it("converts structured markdown to readable plain text", () => {
    expect(
      summaryMarkdownToPlainText(`# Summary

1. **Approve** invoice
2. Archive receipt

| Vendor | Amount |
| --- | --- |
| Acme | ETB 120 |`),
    ).toBe(
      "Summary\n\n1. Approve invoice\n2. Archive receipt\n\nVendor\tAmount\nAcme\tETB 120",
    );
  });
});
