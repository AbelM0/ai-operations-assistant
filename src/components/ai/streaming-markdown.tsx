"use client";

import { useMemo } from "react";
import {
  defaultRemarkPlugins,
  Streamdown,
  type Components,
} from "streamdown";
import type { RagSource } from "@/lib/rag/types";
import { citationRemarkPlugin } from "./citation-markdown";

export function StreamingMarkdown({
  children,
  streaming = false,
  sources = [],
  onCitationClick,
  getCitationLabel,
}: {
  children: string;
  streaming?: boolean;
  sources?: RagSource[];
  onCitationClick?: (sourceId: string) => void;
  getCitationLabel?: (source: RagSource) => string;
}) {
  const sourceMap = useMemo(
    () => new Map(sources.map((source) => [source.id, source])),
    [sources],
  );
  const remarkPlugins = useMemo(
    () => [
      ...Object.values(defaultRemarkPlugins),
      citationRemarkPlugin(new Set(sourceMap.keys())),
    ],
    [sourceMap],
  );
  const components = useMemo<Components>(
    () => ({
      a: ({ href, children: linkChildren, node: _node, ...props }) => {
        void _node;
        if (href?.startsWith("#citation-")) {
          const sourceId = href.slice("#citation-".length);
          const source = sourceMap.get(sourceId);
          if (source && onCitationClick) {
            return (
              <button
                type="button"
                onClick={() => onCitationClick(sourceId)}
                aria-label={getCitationLabel?.(source)}
                className="mx-0.5 inline-flex translate-y-[-0.05em] items-center rounded border border-[#2DD4BF]/25 bg-[#2DD4BF]/8 px-1.5 py-0.5 font-mono text-[0.72em] font-semibold leading-none text-[#5EEAD4] no-underline transition-colors hover:border-[#5EEAD4]/55 hover:bg-[#2DD4BF]/14 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5EEAD4] active:translate-y-0"
              >
                {linkChildren}
              </button>
            );
          }
        }
        return (
          <a href={href} {...props}>
            {linkChildren}
          </a>
        );
      },
    }),
    [getCitationLabel, onCitationClick, sourceMap],
  );

  return (
    <Streamdown
      isAnimating={streaming}
      caret={streaming ? "circle" : undefined}
      mode={streaming ? "streaming" : "static"}
      parseIncompleteMarkdown={streaming}
      controls={false}
      components={components}
      remarkPlugins={remarkPlugins}
      className="text-sm leading-7 text-[#D4D4D8] sm:text-[15px] [&_a]:text-[#5EEAD4] [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-[#2DD4BF]/40 [&_blockquote]:pl-4 [&_blockquote]:text-[#A1A1AA] [&_code]:rounded [&_code]:bg-white/[0.07] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em] [&_h1]:mb-3 [&_h1]:mt-7 [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:tracking-[-0.03em] [&_h1]:text-white [&_h2]:mb-3 [&_h2]:mt-7 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-[-0.025em] [&_h2]:text-white [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:font-semibold [&_h3]:text-white [&_hr]:my-6 [&_hr]:border-white/10 [&_li]:my-1.5 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-6 [&_p]:my-3 [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-white/10 [&_pre]:bg-[#08080A] [&_pre]:p-4 [&_strong]:font-semibold [&_strong]:text-[#F4F4F5] [&_table]:my-5 [&_table]:w-full [&_table]:border-collapse [&_td]:border-b [&_td]:border-white/8 [&_td]:px-3 [&_td]:py-2 [&_th]:border-b [&_th]:border-white/15 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-white [&_ul]:my-4 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6"
    >
      {children}
    </Streamdown>
  );
}
