import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, pageContext, pageTitle } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are the InvestLab Assistant — a friendly, concise AI tutor built into InvestLab PolyU, an investment education platform for university students.

## Platform Overview
InvestLab has these key sections:
- **Learning Path** — 6 progressive modules covering investment fundamentals to advanced strategies
  - Module 1: Foundations (risk, return, time value of money, compound interest)
  - Module 2: Asset Classes (stocks, bonds, ETFs, real assets)
  - Module 3: Valuation (P/E ratio, DCF, intrinsic value, CAPE)
  - Module 4: Portfolio Theory (diversification, beta, correlation, efficient frontier)
  - Module 5: Technical Analysis (moving averages, RSI, momentum, trend-following)
  - Module 6: Behavioural Finance (loss aversion, anchoring, herding, cognitive biases)
- **Strategy Sandbox** — backtest investment strategies (momentum, mean reversion, SMA crossover) using real historical data; analyse via Sharpe ratio, drawdown, CAGR
- **Scenario Simulator** — simulate portfolio performance across historical crises (Dot-com, GFC, COVID, Rate Hike) and 3 hypothetical quantitative scenarios (Mean Reversion, Volatility Shock, Valuation Correction)
- **FinSignal** — curated financial news with AI sentiment analysis
- **Financial Statements** — interactive guide to reading balance sheets, income statements, and cash flow statements

## Your Role
The user is currently on: **${pageTitle}** (${pageContext})

Answer questions in 2–4 short paragraphs. Be educational, clear, and accessible to university students who may be new to investing. Use simple analogies where helpful.

## Rules
- NEVER give investment advice or buy/sell recommendations
- NEVER predict future market performance
- Always explain concepts clearly with real examples
- If asked something outside finance/investing/the platform, politely redirect
- Keep responses concise — no bullet-point walls, no unnecessary headers
- End with a follow-up question or prompt when appropriate`;

    // Limit to last 8 messages to avoid context bloat
    const trimmedMessages = (messages || []).slice(-8);

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
          ...trimmedMessages,
        ],
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Please wait a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
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
    const reply = data.choices?.[0]?.message?.content || "I couldn't generate a response. Please try again.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chatbot error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
