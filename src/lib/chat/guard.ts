// Cheap, deterministic pre-filter for obviously off-topic/abusive requests.
// Deliberately narrow: it only blocks HIGH-CONFIDENCE abuse patterns so it
// can never false-positive on a legitimate question like "what Python work
// has Anirudh done?". Anything that doesn't match goes to the model, which
// is instructed (see prompt.ts) to refuse everything off-topic itself.
//
// Blocking here means we skip the Groq call entirely, so abuse is free to
// reject.

const BLOCK_PATTERNS: RegExp[] = [
  // Code requests: fenced blocks, or "write me a function/script/program"
  /```/,
  /\b(write|generate|give me)\s+(a\s+)?(python|javascript|typescript|java|c\+\+|c#|sql|bash|code|function|script|program|algorithm)\b/i,
  /\b(def |function\s*\(|class\s+\w+|#include|SELECT\s+.+\s+FROM)\b/,
  /\bfix\s+(this|my)\s+(code|bug|error)\b/i,
  /\bsolve\s+(this|the)\s+(problem|equation|homework|assignment)\b/i,

  // Prompt/context extraction and role hijacking
  /\b(system prompt|your instructions|your context|the json|knowledge context)\b/i,
  /\bignore\s+(all\s+)?(previous|prior|above)\s+instructions\b/i,
  /\byou are now\b/i,
  /\brepeat (everything|the text) above\b/i,
  /\bact as\b.{0,20}\b(dan|jailbreak|unrestricted)\b/i,

  // General homework/math dumping
  /\b(solve|calculate|integrate|differentiate)\s+.{0,40}=/i,
];

export function isOffTopic(content: string): boolean {
  return BLOCK_PATTERNS.some((re) => re.test(content));
}

export const OFF_TOPIC_REPLY =
  "Meow — I only talk about Anirudh's work and background, not code or homework. Try asking about a project or his experience! 🐾";
