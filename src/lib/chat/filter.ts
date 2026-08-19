// Last line of defense: inspect the model's own completion before it
// reaches the client. Catches leaked prompt fragments or code the model
// produced despite the system prompt and the input guard.

const LEAK_SIGNATURES: RegExp[] = [
  /```/, // fenced code block
  /\bFACTS ABOUT ANIRUDH\b/i,
  /\bRULES\s*\(/i,
  /\byou are meso\b/i,
  /"personal_info"|"experience"\s*:|"skills"\s*:/i,
  /\bsystem prompt\b/i,
];

// Loose heuristic for "this looks like source code", independent of the
// leak signatures above (catches ad-hoc code the model wrote rather than
// prompt text it echoed).
const CODE_LIKE = /(^|\n)\s*(def |function\s|class\s|import\s|const\s.+=|#include|SELECT\s.+FROM)/i;

export function isUnsafeOutput(text: string): boolean {
  return LEAK_SIGNATURES.some((re) => re.test(text)) || CODE_LIKE.test(text);
}

export const FALLBACK_REPLY =
  "let's stick to talking about Anirudh! Ask me about his projects or experience. 🐾";
