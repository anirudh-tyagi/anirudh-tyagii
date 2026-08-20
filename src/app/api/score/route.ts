import { NextResponse } from 'next/server';
import { getGlobalBest, submitScore, scoreStoreReady } from '@/lib/score';
import { checkScoreRateLimit, getClientIp } from '@/lib/chat/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Global high score for the background game.
 *
 * Be clear about what this can and cannot be: the score arrives from the
 * browser, so it is a claim, not a measurement. Nothing here makes it
 * unforgeable — that would need the game simulated server-side, which is
 * not worth doing for a decorative background. What these checks do is
 * bound the damage: a forged score has to be within human range, one
 * client cannot spam submissions, and no request can cost more than a
 * single Redis command.
 */

// Comfortably above anything reachable by hand, low enough that a forged
// score still reads as a score rather than garbage on the page.
const MAX_PLAUSIBLE_SCORE = 999;
const MAX_BODY_BYTES = 512;

function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.get('host');
  } catch {
    return false;
  }
}

export async function GET() {
  const best = await getGlobalBest();
  return NextResponse.json(
    { best: best ?? 0, available: scoreStoreReady && best !== null },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ error: 'Not for you.' }, { status: 403 });
  }

  const ip = getClientIp(req);
  const limit = checkScoreRateLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Slow down.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds ?? 60) } }
    );
  }

  const raw = await req.text().catch(() => null);
  if (raw === null || raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 });
  }

  let score: unknown;
  try {
    score = (JSON.parse(raw) as { score?: unknown }).score;
  } catch {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 });
  }

  // Integer, positive, and within reach of a person actually playing.
  if (
    typeof score !== 'number' ||
    !Number.isInteger(score) ||
    score <= 0 ||
    score > MAX_PLAUSIBLE_SCORE
  ) {
    return NextResponse.json({ error: 'Bad score.' }, { status: 400 });
  }

  const best = await submitScore(score);
  return NextResponse.json(
    { best: best ?? score, available: best !== null },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
