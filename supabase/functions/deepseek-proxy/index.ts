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
    const { title, summary, sentiment, sentimentScore } = await req.json();

    if (!title || !summary) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: title, summary" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const DEEPSEEK_KEY = Deno.env.get("DEEPSEEK_KEY");
    if (!DEEPSEEK_KEY) {
      throw new Error("DEEPSEEK_KEY is not configured");
    }

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              "You are a concise financial analyst. Write exactly 3-5 sentences in plain text. Explain: what happened, why it matters financially, and one key risk or factor to watch. No markdown, no bold, no bullet points, no asterisks, no investment advice, no buy/sell/hold recommendations. Just plain factual sentences.",
          },
          {
            role: "user",
            content: `Summarize this financial news briefly:\nTitle: ${title}\nSummary: ${summary}\nSentiment: ${sentiment || "Neutral"} (Score: ${sentimentScore ?? 0})`,
          },
        ],
        max_tokens: 250,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: `DeepSeek API error (${response.status})` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const analysis =
      data.choices?.[0]?.message?.content || "Unable to generate analysis.";

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("deepseek-proxy error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
