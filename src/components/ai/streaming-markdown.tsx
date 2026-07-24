"use client";

import { Streamdown } from "streamdown";

export function StreamingMarkdown({
  children,
  streaming = false,
}: {
  children: string;
  streaming?: boolean;
}) {
  return (
    <Streamdown
      mode={streaming ? "streaming" : "static"}
      parseIncompleteMarkdown={streaming}
      controls={false}
      className="text-sm leading-7 text-[#D4D4D8] sm:text-[15px] [&_a]:text-[#5EEAD4] [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-[#2DD4BF]/40 [&_blockquote]:pl-4 [&_blockquote]:text-[#A1A1AA] [&_code]:rounded [&_code]:bg-white/[0.07] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em] [&_h1]:mb-3 [&_h1]:mt-7 [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:tracking-[-0.03em] [&_h1]:text-white [&_h2]:mb-3 [&_h2]:mt-7 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-[-0.025em] [&_h2]:text-white [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:font-semibold [&_h3]:text-white [&_hr]:my-6 [&_hr]:border-white/10 [&_li]:my-1.5 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-6 [&_p]:my-3 [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-white/10 [&_pre]:bg-[#08080A] [&_pre]:p-4 [&_strong]:font-semibold [&_strong]:text-[#F4F4F5] [&_table]:my-5 [&_table]:w-full [&_table]:border-collapse [&_td]:border-b [&_td]:border-white/8 [&_td]:px-3 [&_td]:py-2 [&_th]:border-b [&_th]:border-white/15 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-white [&_ul]:my-4 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6"
    >
      {children}
    </Streamdown>
  );
}
