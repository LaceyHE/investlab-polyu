// src/lib/ai.ts
// Unified AI wrapper — routes through Supabase Edge Function (ai-chat)
// This keeps DEEPSEEK_API_KEY on the server side (never exposed to browser).

import { supabase } from '@/integrations/supabase/client';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function chatAI(messages: AIMessage[]): Promise<string> {
  const { data, error } = await supabase.functions.invoke('ai-chat', {
    body: { messages },
  });

  if (error) {
    throw new Error(`AI request failed: ${error.message}`);
  }

  // Try common response shapes returned by the edge function.
  const content =
    data?.content ??
    data?.choices?.[0]?.message?.content ??
    data?.message?.content ??
    data?.result ??
    null;

  if (!content) {
    throw new Error('AI returned an empty response.');
  }

  return content;
}
