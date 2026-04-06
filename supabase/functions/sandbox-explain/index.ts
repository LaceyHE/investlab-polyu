import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { strategy, strategyName, param, metrics, signalCount } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an educational investment strategy explainer for StrategyLab, a learning platform for university students.

Your job is to explain strategy results in simple, beginner-friendly language.

For every strategy, explain:
1. Why it performed the way it did (1 paragraph)
2. When this strategy works well and when it fails (1 paragraph)
3. The risk characteristics and what the Sharpe ratio tells us (1 sentence)

RULES:
- Keep it simple and educational
- Use analogies if helpful
- NEVER give trading advice
- NEVER predict future performance
- Reference the actual metrics provided
- Maximum 3 short paragraphs
- Be encouraging but honest about limitations`;

    const userPrompt = `Strategy: ${strategyName}
Current Settings: ${param}
Results over 2021-2022 (SPY + AGG data):
- Total Return: ${metrics.totalReturn}%
- CAGR: ${metrics.cagr}%
- Volatility: ${metrics.volatility}%
- Max Drawdown: ${metrics.maxDrawdown}%
- Worst Quarter: ${metrics.worstQuarter}%
- Sharpe Ratio: ${metrics.sharpe}
${signalCount > 0 ? `- Trade Signals Generated: ${signalCount}` : ''}

Explain why this strategy produced these results and what the student should learn from it.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const explanation = data.choices?.[0]?.message?.content || "Unable to generate explanation.";

    return new Response(JSON.stringify({ explanation }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("sandbox-explain error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
