import { NextResponse } from 'next/server';
import { generateProfessionalPrompt } from '@/components/chatPrompts';
import knowledgeData from '@/data/anirudh-knowledge.json';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error('GROQ_API_KEY is not configured in environment variables.');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Convert the imported JSON object back to a string for the prompt generator
    const knowledgeContext = JSON.stringify(knowledgeData, null, 2);

    // Use the professional system prompt
    const systemPrompt = generateProfessionalPrompt(knowledgeContext);

    // Prepend the system prompt to the user's message history
    const payloadMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: payloadMessages,
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Groq API Error:', errorData);
      return NextResponse.json({ error: 'Failed to communicate with Groq API' }, { status: response.status });
    }

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      return NextResponse.json({ message: data.choices[0].message.content });
    } else {
      return NextResponse.json({ error: 'No response from Groq API' }, { status: 500 });
    }

  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

