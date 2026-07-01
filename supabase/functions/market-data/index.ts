import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ALPHAVANTAGE_API_KEY = Deno.env.get("ALPHAVANTAGE_API_KEY");
    if (!ALPHAVANTAGE_API_KEY) {
      throw new Error("ALPHAVANTAGE_API_KEY is not configured");
    }

    // Resolve params from either JSON body (POST) or query string (GET)
    let type = "timeseries";
    let symbol: string | null = null;
    let topics: string | null = null;

    const url = new URL(req.url);
    symbol = url.searchParams.get("symbol");
    topics = url.searchParams.get("topics");
    if (url.searchParams.get("type")) type = url.searchParams.get("type")!;

    if (req.method === "POST") {
      try {
        const body = await req.json();
        if (body?.type) type = body.type;
        if (body?.symbol) symbol = body.symbol;
        if (body?.topics) topics = body.topics;
      } catch {
        // ignore empty body
      }
    }

    let apiUrl: string;
    if (type === "news") {
      const topicParam = topics ? `&topics=${encodeURIComponent(topics)}` : "";
      apiUrl = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT${topicParam}&apikey=${ALPHAVANTAGE_API_KEY}&limit=20`;
    } else {
      if (!symbol) {
        return new Response(
          JSON.stringify({ error: "Missing required param: symbol" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${encodeURIComponent(symbol)}&apikey=${ALPHAVANTAGE_API_KEY}`;
    }

    const response = await fetch(apiUrl);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("AlphaVantage error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: `AlphaVantage error (${response.status})` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("market-data error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
