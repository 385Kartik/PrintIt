export type Language = "hindi" | "hinglish" | "english";

export function detectLanguage(text: string): Language {
  const lower = text.toLowerCase();

  const hindiWords = ["hai", "ka", "kyu", "kya", "kaisa", "mujhe", "samjha", "bata", "tu", "mat", "ek", "chiz", "koi", "tujhe"];
  const englishWords = ["what", "how", "why", "explain", "define", "rule", "tell", "ask", "say", "is", "proper"];

  let hindiCount = hindiWords.filter(w => lower.includes(w)).length;
  let englishCount = englishWords.filter(w => lower.includes(w)).length;

  if (hindiCount > 0 && englishCount > 0) return "hinglish";
  if (hindiCount > 0) return "hindi";
  return "english";
}
