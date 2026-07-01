// src/lib/ai.ts
// Unified AI wrapper for X.AI (Grok)

const API_KEY = import.meta.env.VITE_OPENAI_KEY;
const API_URL = 'https://api.deepseek.com/v1/chat/completions';
const MODEL = 'deepseek-chat';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function chatAI(messages: AIMessage[]): Promise<string> {
  if (!API_KEY) {
    throw new Error('AI features disabled — API key not configured.');
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 600,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI request failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? 'No response.';
}