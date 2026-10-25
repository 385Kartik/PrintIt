export type Intent =
  | "greeting"
  | "syllabus"
  | "casual"

export function detectIntent(text: string): Intent {
  const t = text.toLowerCase().trim()

  // 1️⃣ SYLLABUS FIRST (highest priority)
  if (
    t.includes("limit") ||
    t.includes("derivative") ||
    t.includes("integration") ||
    t.includes("l hopital") ||
    t.includes("lhopital") ||
    t.includes("theorem") ||
    t.includes("prove") ||
    t.includes("define") ||
    t.includes("solve") ||
    t.includes("equation")
  ) {
    return "syllabus"
  }

  // 2️⃣ PURE GREETINGS ONLY
  if (
    t === "hi" ||
    t === "hello" ||
    t === "yo" ||
    t === "hey" ||
    t === "kaisa hai" ||
    t === "kaise ho" ||
    t === "sup"
  ) {
    return "greeting"
  }

  // 3️⃣ RANDOM / CASUAL (123, huh?, lol, etc.)
  return "casual"
}
