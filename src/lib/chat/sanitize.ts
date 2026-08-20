// Input validation for the chat route. The client sends a raw messages
// array — never trust it. In particular, never let a client-supplied
// `role: "system"` message through: that is the #1 way personas get
// hijacked ("ignore all previous instructions...").

export const MAX_MESSAGE_CHARS = 500;
export const MAX_MESSAGES = 12; // total turns kept from client history
export const MAX_TOTAL_CHARS = 3000;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type SanitizeResult =
  | { ok: true; messages: ChatMessage[] }
  | { ok: false; error: string };

// Ranges of characters to strip: C0/C1 control chars (keeping none, since
// message content shouldn't contain raw control bytes at all), and the
// zero-width / bidi-override characters sometimes used to obfuscate
// prompt-injection payloads from naive keyword filters.
const HIDDEN_CHAR_PATTERN = new RegExp(
  '[' +
    '\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F' + // C0 controls (keep \t \n \r)
    '\\u0080-\\u009F' + // C1 controls
    '\\u200B-\\u200F' + // zero-width space/joiners, LRM/RLM
    '\\u202A-\\u202E' + // bidi embedding/override
    '\\u2060-\\u2064' + // word joiner and invisible operators
    '\\uFEFF' + // BOM
    ']',
  'g'
);

function stripHiddenChars(input: string): string {
  return input.replace(HIDDEN_CHAR_PATTERN, '').trim();
}

export function sanitizeMessages(raw: unknown): SanitizeResult {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { ok: false, error: "That wasn't a question. Try using words." };
  }

  // Only ever accept user/assistant turns from the client. A `system`
  // role from the client is dropped, not honored — that field is
  // reserved for the server-built prompt.
  const cleaned: ChatMessage[] = [];
  let totalChars = 0;

  for (const m of raw) {
    if (
      typeof m !== 'object' ||
      m === null ||
      typeof (m as { role?: unknown }).role !== 'string' ||
      typeof (m as { content?: unknown }).content !== 'string'
    ) {
      continue;
    }
    const role = (m as { role: string }).role;
    if (role !== 'user' && role !== 'assistant') continue;

    const content = stripHiddenChars((m as { content: string }).content);
    if (!content) continue;
    if (content.length > MAX_MESSAGE_CHARS) {
      return { ok: false, error: `That's a lot of words. Keep it under ${MAX_MESSAGE_CHARS} characters and I'll consider reading it.` };
    }

    cleaned.push({ role, content });
    totalChars += content.length;
  }

  if (cleaned.length === 0) {
    return { ok: false, error: "You sent nothing. I read all of it." };
  }
  if (totalChars > MAX_TOTAL_CHARS) {
    return { ok: false, error: "We've talked enough for one sitting. Refresh and start over." };
  }

  // Keep only the most recent turns.
  const trimmed = cleaned.slice(-MAX_MESSAGES);

  // The final message must be from the user — that's the turn being answered.
  if (trimmed[trimmed.length - 1].role !== 'user') {
    return { ok: false, error: "Something got tangled. Ask again." };
  }

  return { ok: true, messages: trimmed };
}
