

# Create DeepSeek Proxy Edge Function + Update FinSignal

## Overview
Move the DeepSeek API call from the client to a backend edge function, keeping the API key secure server-side.

## Changes

### 1. Add secret `DEEPSEEK_KEY`
Set value: `sk-19d14f855f75479e9b8c9e6c61258641`

### 2. Create edge function `supabase/functions/deepseek-proxy/index.ts`
- Accept POST with `{ title, summary, sentiment, sentimentScore }`
- Read `DEEPSEEK_KEY` from `Deno.env`
- Call DeepSeek API with the specified system/user prompts, max_tokens 250, temperature 0.3
- Return `{ analysis: string }`
- Include CORS headers on all responses including errors

### 3. Update `src/pages/FinSignal.jsx` (lines 477-507)
- Import supabase client
- Replace direct `fetch('https://api.deepseek.com/...')` with `supabase.functions.invoke('deepseek-proxy', { body: { title, summary, sentiment, sentimentScore } })`
- Remove the `VITE_DEEPSEEK_KEY` check
- Parse `data.analysis` from the response

| Action | File |
|--------|------|
| Create | `supabase/functions/deepseek-proxy/index.ts` |
| Modify | `src/pages/FinSignal.jsx` — replace direct API call with edge function invoke |
| Secret | Add `DEEPSEEK_KEY` |

