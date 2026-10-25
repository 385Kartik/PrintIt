const KEYWORDS = [
  "solve",
  "derivative",
  "integration",
  "limit",
  "lhopital",
  "matrix",
  "theorem",
  "prove",
  "find"
];

export function isUniversityQuery(text: string): boolean {
  const q = text.toLowerCase();
  return KEYWORDS.some(k => q.includes(k));
}