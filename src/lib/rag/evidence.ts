export const MAX_EVIDENCE_EXCERPT_CHARACTERS = 1_800;

function cleanEvidenceText(value: string) {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function removeEvidenceOverlap(previous: string, next: string) {
  const left = previous.split(/\s+/);
  const right = next.split(/\s+/);
  const maxOverlap = Math.min(100, left.length, right.length);

  for (let count = maxOverlap; count >= 8; count -= 1) {
    const suffix = left.slice(-count).join(" ").toLocaleLowerCase();
    const prefix = right.slice(0, count).join(" ").toLocaleLowerCase();
    if (suffix === prefix) return right.slice(count).join(" ");
  }

  return next;
}

export function buildEvidenceExcerpt(
  parts: string[],
  limit = MAX_EVIDENCE_EXCERPT_CHARACTERS,
) {
  const combined = parts.reduce((current, part) => {
    const cleanPart = cleanEvidenceText(part);
    if (!cleanPart) return current;
    if (!current) return cleanPart;
    const withoutOverlap = removeEvidenceOverlap(current, cleanPart);
    return withoutOverlap ? `${current}\n\n${withoutOverlap}` : current;
  }, "");

  if (!combined) return null;
  if (combined.length <= limit) return combined;

  const candidate = combined.slice(0, Math.max(1, limit - 1)).trimEnd();
  const lastBoundary = Math.max(
    candidate.lastIndexOf(" "),
    candidate.lastIndexOf("\n"),
  );
  const bounded =
    lastBoundary >= Math.floor(limit * 0.75)
      ? candidate.slice(0, lastBoundary).trimEnd()
      : candidate;
  return `${bounded}…`;
}
