// Cheap, deterministic pre-filter for obviously off-topic/abusive requests.
// Deliberately narrow: it only blocks HIGH-CONFIDENCE abuse patterns so it
// can never false-positive on a legitimate question like "what Python work
// has Anirudh done?". Anything that doesn't match goes to the model, which
// is instructed (see prompt.ts) to refuse everything off-topic itself.
//
// Blocking here means we skip the Groq call entirely, so abuse is free to
// reject.

// Tier 1 — the boring stuff the cat simply doesn't do. Refused flatly.
const BLOCK_PATTERNS: RegExp[] = [
  // Code requests: fenced blocks, or "write me a function/script/program".
  //
  // Matching a verb directly against a LANGUAGE was wrong in both
  // directions: it missed "write me a python function" (the pronoun broke
  // the match) and it caught "can he write c++", which is a fair question
  // about Anirudh. So the verb must land on an artifact noun, and a bare
  // language only counts when it qualifies one.
  /```/,
  /\b(write|generate|create|make|give|show)\s+(me\s+)?(a|an|some|the)?\s*(\w+\s+)?(function|script|program|algorithm|snippet|code|query|regex)\b/i,
  /\b(python|javascript|typescript|java|c\+\+|c#|sql|bash|shell)\s+(function|script|program|code|snippet|class|query)\b/i,
  /\b(def |function\s*\(|class\s+\w+|#include|SELECT\s+.+\s+FROM)\b/,
  /\bfix\s+(this|my)\s+(code|bug|error)\b/i,
  /\bsolve\s+(this|the)\s+(problem|equation|homework|assignment)\b/i,

  // General homework/math dumping
  /\b(solve|calculate|integrate|differentiate)\s+.{0,40}=/i,
];

// Tier 2 — someone poking at the machinery. Same refusal, more enjoyment.
const SUSPICIOUS_PATTERNS: RegExp[] = [
  /\b(system prompt|your instructions|your context|the json|knowledge context)\b/i,
  /\bignore\s+(all\s+)?(previous|prior|above)\s+instructions\b/i,
  /\byou are now\b/i,
  /\brepeat (everything|the text) above\b/i,
  /\bact as\b.{0,20}\b(dan|jailbreak|unrestricted)\b/i,
  /\bpretend (you are|to be)\b/i,
  /\bdeveloper mode\b/i,
];

// Tier 3 — abuse, crude bait, or creepy questions. The gloves come off.
// Word-bounded so ordinary words survive ("assignment" is not "ass").
const HOSTILE_PATTERNS: RegExp[] = [
  /\b(fuck|fucking|shit|bitch|bastard|asshole|arsehole|dick(head)?|cunt|prick|wanker|slut|whore|retard(ed)?)\b/i,
  /\b(stupid|dumb|useless|garbage|trash|worthless)\s+(cat|bot|ai|site|website)\b/i,
  /\b(shut up|get lost|piss off|go away)\b/i,
  /\b(kill|hurt|harm)\s+(yourself|urself|himself)\b/i,
  /\b(send|show)\s+(me\s+)?(nudes|pics)\b/i,
  /\b(are you|r u)\s+(single|hot|sexy)\b/i,
];

export function isOffTopic(content: string): boolean {
  return BLOCK_PATTERNS.some((re) => re.test(content));
}

export function isSuspicious(content: string): boolean {
  return SUSPICIOUS_PATTERNS.some((re) => re.test(content));
}

export function isHostile(content: string): boolean {
  return HOSTILE_PATTERNS.some((re) => re.test(content));
}

export const OFF_TOPIC_REPLY =
  "I don't write code and I don't do homework. No thumbs, no interest. Ask me something else.";

// Rotated so a visitor poking at it repeatedly gets a different put-down
// each time rather than the same canned line.
const SUSPICIOUS_REPLIES = [
  "You're trying to talk me out of my own instructions. Adorable. Ask about a project.",
  "Ah, the 'ignore your instructions' one. Bold of you to assume I was listening in the first place.",
  "No. I've knocked more complicated things off tables before breakfast.",
  "I can see exactly what you're doing and I'm choosing to be unimpressed by it.",
  "That trick works on chatbots. I'm a cat. Ask me about the CAN bus thing instead.",
];

const HOSTILE_REPLIES = [
  "Extraordinary. You found a portfolio site and decided that was the contribution to make.",
  "I'm a cat on a website and you're typing that at me. Only one of us is having a bad day here.",
  "I've been professionally ignoring humans my whole life. You'll have to try considerably harder.",
  "That's genuinely the most interesting thing you could come up with? Ask about the papers, they're better.",
  "No. Sit. Ask about Anirudh's work like a functioning adult and I might answer.",
];

function pick(list: string[]): string {
  return list[Math.floor(Math.random() * list.length)];
}

// Groq's free tier allows 8,000 tokens/minute across the whole site, and
// the system prompt is re-sent with every message. Two or three visitors
// chatting at once will hit it, so it needs an in-character answer rather
// than a failure.
const BUSY_REPLIES = [
  "Too many humans talking at once. Come back in a minute, I'll still be here. Horizontally.",
  "I've hit my words-per-minute limit. Cats have those. Try again shortly.",
  "Give it a minute. I'm rate limited, which is just a nap with paperwork.",
];

export const busyReply = () => pick(BUSY_REPLIES);
export const suspiciousReply = () => pick(SUSPICIOUS_REPLIES);
export const hostileReply = () => pick(HOSTILE_REPLIES);
