import type { Metadata } from "next";
import { AskNexusShell } from "./_components/ask-nexus-shell";
import { getAskNexusData } from "./actions";

export const metadata: Metadata = {
  title: "Ask Nexus | NexusOps",
  description: "Ask questions across selected documents in your NexusOps workspace.",
};

export default async function AskNexusPage() {
  const data = await getAskNexusData();

  return <AskNexusShell {...data} />;
}
