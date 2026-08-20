import { NextResponse } from 'next/server';
import { SYSTEM_PROMPT } from '@/lib/chat/prompt';
import { sanitizeMessages } from '@/lib/chat/sanitize';
import {
  isOffTopic, isSuspicious, isHostile,
  OFF_TOPIC_REPLY, suspiciousReply, hostileReply, busyReply,
} from '@/lib/chat/guard';
import { isUnsafeOutput, FALLBACK_REPLY } from '@/lib/chat/filter';
import { checkRateLimit, getClientIp } from '@/lib/chat/rateLimit';

export const runtime = 'nodejs';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
const REQUEST_TIMEOUT_MS = 10_000;

export async function POST(req: Request) {
  try {
    if (req.headers.get('content-type')?.includes('application/json') !== true) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }

    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Meow, too many pets at once. Give me a second 🐾' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds ?? 60) } }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const sanitized = sanitizeMessages(body.messages);
    if (!sanitized.ok) {
      return NextResponse.json({ error: sanitized.error }, { status: 400 });
    }

    // Three tiers, meanest first. All of them skip the Groq call entirely,
    // so rudeness and jailbreak attempts cost nothing to answer.
    const lastUserMessage = sanitized.messages[sanitized.messages.length - 1];
    if (isHostile(lastUserMessage.content)) {
      return NextResponse.json({ message: hostileReply() });
    }
    if (isSuspicious(lastUserMessage.content)) {
      return NextResponse.json({ message: suspiciousReply() });
    }
    if (isOffTopic(lastUserMessage.content)) {
      return NextResponse.json({ message: OFF_TOPIC_REPLY });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error('GROQ_API_KEY is not configured in environment variables.');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const payloadMessages = [{ role: 'system', content: SYSTEM_PROMPT }, ...sanitized.messages];

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: payloadMessages,
          reasoning_effort: 'low',
          max_tokens: 150,
          temperature: 0.4,
        }),
        signal: controller.signal,
      });
    } catch (err) {
      console.error('Groq request failed:', err);
      return NextResponse.json({ error: 'Failed to reach the chat service' }, { status: 502 });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const errorData = await response.text().catch(() => '');
      console.error('Groq API Error:', response.status, errorData);

      // Being rate limited is expected on the free tier, not a fault. Answer
      // in voice with a 200 so the UI shows the cat rather than an error.
      if (response.status === 429) {
        return NextResponse.json({ message: busyReply() });
      }

      return NextResponse.json({ error: 'Failed to communicate with the chat service' }, { status: 502 });
    }

    const data = await response.json();
    const message: unknown = data?.choices?.[0]?.message?.content;

    if (typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'No response from the chat service' }, { status: 502 });
    }

    if (isUnsafeOutput(message)) {
      console.warn('Filtered unsafe chat output for IP', ip);
      return NextResponse.json({ message: FALLBACK_REPLY });
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
