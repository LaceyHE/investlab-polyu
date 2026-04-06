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
    const { strategyName, param, metrics, radarScores } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an educational portfolio evaluator for a university-level investment learning platform.

You receive portfolio metrics and radar scores (0-10 scale) across 6 dimensions: Return, Risk, Stability, Diversification, Consistency, Efficiency.

Generate a structured evaluation with exactly these 4 sections:

### Summary
2-3 beginner-friendly sentences about overall performance.

### Strengths
- 2-3 bullet points about what this portfolio does well (reference actual scores and metrics)

### Weaknesses
- 2-3 bullet points about areas of concern (reference actual scores and metrics)

### Suggestions
- 2-3 actionable suggestions to improve the portfolio (e.g. "Reduce stock exposure to lower drawdown")

RULES:
- Use simple, beginner-friendly language
- Reference the REAL metrics and radar scores provided
- NEVER predict future performance
- NEVER give trading advice
- Focus on LEARNING and understanding trade-offs
- Keep it concise (max 200 words total)
- Be encouraging but honest`;

    const userPrompt = `Strategy: ${strategyName}
Settings: ${param}

Performance Metrics (2021-2022):
- Total Return: ${metrics.totalReturn}%
- CAGR: ${metrics.cagr}%
- Volatility: ${metrics.volatility}%
- Max Drawdown: ${metrics.maxDrawdown}%
- Worst Quarter: ${metrics.worstQuarter}%
- Sharpe Ratio: ${metrics.sharpe}

Radar Scores (0-10):
- Return: ${radarScores.Return}
- Risk: ${radarScores.Risk}
- Stability: ${radarScores.Stability}
- Diversification: ${radarScores.Diversification}
- Consistency: ${radarScores.Consistency}
- Efficiency: ${radarScores.Efficiency}

Evaluate this portfolio and provide structured feedback.`;

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
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const evaluation = data.choices?.[0]?.message?.content || "Unable to generate evaluation.";

    return new Response(JSON.stringify({ evaluation }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("sandbox-evaluate error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
