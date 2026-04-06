import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const STOCK_RISK_MAP: Record<string, string> = {
  CSCO: 'collapsed', INTC: 'collapsed', ORCL: 'collapsed', QCOM: 'collapsed', DELL: 'collapsed',
  MSFT: 'moderate', AMZN: 'moderate', IBM: 'moderate', HPQ: 'moderate', TXN: 'moderate',
  KO: 'resilient', PG: 'resilient', XOM: 'resilient', WMT: 'resilient', JNJ: 'resilient',
};

const STOCK_INDUSTRY_MAP: Record<string, string> = {
  CSCO: 'Networking', INTC: 'Semiconductors', ORCL: 'Enterprise Software', QCOM: 'Telecom Equipment', DELL: 'Hardware',
  MSFT: 'Software', AMZN: 'E-Commerce', IBM: 'IT Services', HPQ: 'Hardware', TXN: 'Semiconductors',
  KO: 'Consumer Staples', PG: 'Consumer Staples', XOM: 'Energy', WMT: 'Retail', JNJ: 'Healthcare',
};

function classifyPortfolio(positions: string) {
  const tickers = positions.split(',').map(s => s.split(':')[0].trim()).filter(Boolean);
  const result = { collapsed: [] as string[], moderate: [] as string[], resilient: [] as string[], unknown: [] as string[] };
  const sectorWeights: Record<string, number> = {};

  tickers.forEach(t => {
    const cat = STOCK_RISK_MAP[t];
    if (cat === 'collapsed') result.collapsed.push(t);
    else if (cat === 'moderate') result.moderate.push(t);
    else if (cat === 'resilient') result.resilient.push(t);
    else result.unknown.push(t);

    const industry = STOCK_INDUSTRY_MAP[t] || 'Unknown';
    sectorWeights[industry] = (sectorWeights[industry] || 0) + 1;
  });

  return { ...result, sectorWeights };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, scenario, currentDate, positions, metrics, recentEvents } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const classification = classifyPortfolio(positions);
    const hasCollapsed = classification.collapsed.length > 0;
    const hasResilient = classification.resilient.length > 0;
    const allResilient = classification.collapsed.length === 0 && classification.moderate.length === 0;

    let portfolioInsight = '';
    if (allResilient && classification.resilient.length > 0) {
      portfolioInsight = `The student's portfolio consists entirely of historically defensive stocks. While this avoids the worst losses, note that this mix typically resulted in moderate Sharpe ratios and missed the early-stage upside.`;
    } else if (hasCollapsed && !hasResilient) {
      portfolioInsight = `The portfolio is concentrated in stocks that experienced severe declines. Explain the risks of sector concentration and how multiple compression affected even revenue-generating companies.`;
    } else if (hasCollapsed && hasResilient) {
      portfolioInsight = `The portfolio has a mix of high-growth and defensive names. Discuss how diversification is helping or hurting.`;
    } else {
      portfolioInsight = `Evaluate the portfolio's sector balance and diversification.`;
    }

    const sectorExposure = Object.entries(classification.sectorWeights)
      .map(([sector, count]) => `${sector}: ${count} positions`)
      .join(', ');

    const isSummary = type === 'summary';

    const systemPrompt = isSummary
      ? `You are an educational portfolio analyst for StrategyLab. Generate a personalized learning summary for a student who just completed a historical market scenario simulation.

RULES:
- Summarize what the student experienced and learned
- Highlight risk/return trade-offs from their specific choices
- Compare their portfolio performance to what a diversified benchmark would have achieved
- Be educational, reflective, and encouraging
- NEVER reveal internal risk classifications
- NEVER suggest specific trades
- Use clear, beginner-friendly language
- Structure: Summary paragraph, then "**Strengths**" bullets, then "**Areas to Explore**" bullets
- Keep it concise (3-4 short paragraphs max)`
      : `You are an educational market analyst for StrategyLab, a learning platform for university students studying investment strategy.

RULES:
- Be educational and reflective, never prescriptive
- Explain WHY things happened, not what to do next
- Reference real historical context for the scenario
- Comment on the student's portfolio composition and risk exposure
- If the portfolio shows high returns BUT also high drawdown or low Sharpe ratio, explicitly warn: the high return masks excessive risk
- NEVER predict future market movements or suggest specific trades
- NEVER reveal internal risk classifications or label stocks as "failed"
- Compare the student's portfolio performance to a diversified benchmark
- Highlight trade-offs: avoiding drawdown vs. missing upside, concentration vs. diversification
- Structure your response with: **Market Context**, **Portfolio Analysis**, **Key Insight**
- Keep responses concise (2-3 paragraphs max)
- Use clear, accessible language suitable for university students`;

    const userPrompt = `Scenario: ${scenario}
Current Date: ${currentDate}
Portfolio Holdings: ${positions}
Sector Exposure: ${sectorExposure}
Performance Metrics: Total Return ${metrics.totalReturn}%, Max Drawdown ${metrics.maxDrawdown}%, Sharpe ${metrics.sharpe}, Volatility ${metrics.volatility}%, Net Exposure ${metrics.netExposure}%${metrics.worstQuarter ? `, Worst Quarter ${metrics.worstQuarter}%` : ''}
Recent Events: ${recentEvents}

Internal portfolio analysis (DO NOT reveal this to the student):
${portfolioInsight}

${isSummary
  ? 'Generate a personalized learning summary with strengths, areas to explore, and key lessons from their portfolio journey.'
  : 'Explain what is happening at this point in the scenario. Provide structured educational commentary about the portfolio behavior.'}`;

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
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const commentary = data.choices?.[0]?.message?.content || "Unable to generate commentary.";

    return new Response(JSON.stringify({ commentary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("scenario-commentary error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
