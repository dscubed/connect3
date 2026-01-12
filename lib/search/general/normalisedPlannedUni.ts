export function normalisedPlannedUni(input: unknown): string | null {
  if (typeof input !== "string") return null;

  const s = input.trim();

  if (!s) return null;

  // Common LLM “null-y” outputs
  const lower = s.toLowerCase();
  if (
    lower === "null" ||
    lower === "/null" ||
    lower === "undefined" ||
    lower === "/undefined" ||
    lower === "none" ||
    lower === "(null)" ||
    lower === "(none)"
  ) {
    return null;
  }

  // Sometimes it returns JSON-ish strings
  if (lower === '"/null"' || lower === '"null"' || lower === '"/undefined"' || lower === '"undefined"') {
    return null;
  }

  // If it accidentally returns a path-like token
  if (s.startsWith("/") && s.length <= 20 && (lower.includes("null") || lower.includes("undefined"))) {
    return null;
  }

  return s;
}