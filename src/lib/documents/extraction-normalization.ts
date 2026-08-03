const monthNumbers: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

function isoDate(year: number, month: number, day: number) {
  const candidate = new Date(Date.UTC(year, month - 1, day));
  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== month - 1 ||
    candidate.getUTCDate() !== day
  ) {
    return null;
  }

  return `${year.toString().padStart(4, "0")}-${month
    .toString()
    .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

export function normalizeExtractionDate(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  const trimmed = value.trim();

  const yearFirst = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (yearFirst) {
    return isoDate(
      Number(yearFirst[1]),
      Number(yearFirst[2]),
      Number(yearFirst[3]),
    );
  }

  const dayFirstNamed = trimmed.match(
    /^(\d{1,2})[-/.\s]([A-Za-z]{3,9})[-/.,\s]+(\d{4})$/,
  );
  if (dayFirstNamed) {
    const month = monthNumbers[dayFirstNamed[2].toLowerCase()];
    return month
      ? isoDate(Number(dayFirstNamed[3]), month, Number(dayFirstNamed[1]))
      : null;
  }

  const monthFirstNamed = trimmed.match(
    /^([A-Za-z]{3,9})[-/.\s]+(\d{1,2})(?:,)?[-/.\s]+(\d{4})$/,
  );
  if (monthFirstNamed) {
    const month = monthNumbers[monthFirstNamed[1].toLowerCase()];
    return month
      ? isoDate(Number(monthFirstNamed[3]), month, Number(monthFirstNamed[2]))
      : null;
  }

  return null;
}
