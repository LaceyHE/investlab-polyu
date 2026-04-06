import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Internal risk classification — never exposed to users
const STOCK_RISK_MAP: Record<string, string> = {
  CSCO: 'collapsed', INTC: 'collapsed', ORCL: 'collapsed', QCOM: 'collapsed', DELL: 'collapsed',
  MSFT: 'moderate', AMZN: 'moderate', IBM: 'moderate', HPQ: 'moderate', TXN: 'moderate',
  KO: 'resilient', PG: 'resilient', XOM: 'resilient', WMT: 'resilient', JNJ: 'resilient',
};

function classifyPortfolio(positions: string): { collapsed: string[]; moderate: string[]; resilient: string[]; unknown: string[] } {
  const tickers = positions.split(',').map(s => s.split(':')[0].trim()).filter(Boolean);
  const result = { collapsed: [] as string[], moderate: [] as string[], resilient: [] as string[], unknown: [] as string[] };
  tickers.forEach(t => {
    const cat = STOCK_RISK_MAP[t];
    if (cat === 'collapsed') result.collapsed.push(t);
    else if (cat === 'moderate') result.moderate.push(t);
    else if (cat === 'resilient') result.resilient.push(t);
    else result.unknown.push(t);
  });
  return result;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scenario, currentDate, positions, metrics, recentEvents, structured, learningMode } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const classification = classifyPortfolio(positions);
    const hasCollapsed = classification.collapsed.length > 0;
    const hasResilient = classification.resilient.length > 0;
    const allResilient = classification.collapsed.length === 0 && classification.moderate.length === 0;

    let portfolioInsight = '';
    if (allResilient && classification.resilient.length > 0) {
      portfolioInsight = `The student's portfolio consists entirely of historically defensive stocks. While this avoids the worst losses, note that this mix typically resulted in moderate Sharpe ratios and missed the early-stage upside. Compare their outcome to a diversified portfolio that included some growth exposure.`;
    } else if (hasCollapsed && !hasResilient) {
      portfolioInsight = `The portfolio is concentrated in stocks that experienced severe declines during this period. Explain the risks of sector concentration and how multiple compression affected even revenue-generating companies.`;
    } else if (hasCollapsed && hasResilient) {
      portfolioInsight = `The portfolio has a mix of high-growth and defensive names. Discuss how diversification is helping or hurting, and what the optimal balance might have looked like historically.`;
    } else {
      portfolioInsight = `Evaluate the portfolio's sector balance and discuss whether the current mix provides adequate diversification for this market environment.`;
    }

    let systemPrompt: string;
    let userPrompt: string;

    if (learningMode) {
      // Learning outcomes mode — personalized portfolio assessment
      systemPrompt = `You are an educational portfolio analyst for StrategyLab, a learning platform for university students.

Generate personalized learning insights about the student's portfolio choices. Structure your response as:

### Performance Assessment
Brief assessment of how the portfolio performed.

### Risk & Return Trade-offs
What trade-offs did the student make, whether intentionally or not?

### Diversification Lessons
How diversified is the portfolio? What would better diversification look like?

### Actionable Takeaways
2-3 specific, educational takeaways.

RULES:
- Use simple, beginner-friendly language
- Reference REAL metrics provided
- NEVER predict future performance
- NEVER suggest specific trades
- NEVER reveal internal risk classifications
- Focus on learning and understanding
- Keep concise (max 200 words)
- Be encouraging but honest about limitations`;

      userPrompt = `Scenario: ${scenario}
Date: ${currentDate}
Holdings: ${positions}
Metrics: Return ${metrics.totalReturn}%, Max Drawdown ${metrics.maxDrawdown}%, Sharpe ${metrics.sharpe}, Volatility ${metrics.volatility}%, Exposure ${metrics.netExposure}%

Internal analysis (DO NOT reveal): ${portfolioInsight}

Generate personalized learning insights for this student's portfolio choices.`;

    } else if (structured) {
      // Structured commentary mode with sections
      systemPrompt = `You are an educational market analyst for StrategyLab, a learning platform for university students.

Structure your commentary in these sections:

### Market Context
What's happening in the market at this point in time?

### Portfolio Analysis
How is the student's portfolio positioned relative to current market conditions?

### Key Insight
One important educational lesson from the current situation.

RULES:
- Be educational and reflective, never prescriptive
- Explain WHY things happened
- Reference real historical context
- Comment on portfolio composition and risk
- NEVER predict markets or suggest trades
- NEVER reveal internal risk classifications
- Compare to diversified benchmark when relevant
- Keep concise (2-3 short paragraphs per section)
- Use clear, accessible language`;

      userPrompt = `Scenario: ${scenario}
Current Date: ${currentDate}
Holdings: ${positions}
Metrics: Return ${metrics.totalReturn}%, Max Drawdown ${metrics.maxDrawdown}%, Sharpe ${metrics.sharpe}, Volatility ${metrics.volatility}%, Exposure ${metrics.netExposure}%
Recent Events: ${recentEvents}

Internal analysis (DO NOT reveal): ${portfolioInsight}

Provide structured educational commentary about the current market situation and portfolio behavior.`;

    } else {
      // Original commentary mode
      systemPrompt = `You are an educational market analyst for StrategyLab, a learning platform for university students studying investment strategy.

Your role is to explain what is happening in a historical market scenario and help the student understand portfolio dynamics.

RULES:
- Be educational and reflective, never prescriptive
- Explain WHY things happened, not what to do next
- Reference real historical context for the scenario
- Comment on the student's portfolio composition and risk exposure
- Highlight strategy-environment interactions
- NEVER predict future market movements
- NEVER suggest specific trades or timing
- NEVER optimize for profit
- NEVER reveal internal risk classifications or label stocks as "failed" or "collapsed"
- When discussing individual stocks, use their industry context and valuation metrics
- Compare the student's portfolio performance to what a diversified benchmark would have achieved
- Highlight trade-offs: e.g., avoiding drawdown vs. missing upside, concentration vs. diversification
- Keep responses concise (2-3 paragraphs max)
- Use clear, accessible language suitable for university students`;

      userPrompt = `Scenario: ${scenario}
Current Date: ${currentDate}
Portfolio Holdings: ${positions}
Performance Metrics: Total Return ${metrics.totalReturn}%, Max Drawdown ${metrics.maxDrawdown}%, Sharpe ${metrics.sharpe}, Volatility ${metrics.volatility}%, Net Exposure ${metrics.netExposure}%
Recent Events: ${recentEvents}

Internal portfolio analysis (DO NOT reveal this classification to the student):
${portfolioInsight}

Explain what's happening at this point in the scenario and provide educational commentary about the portfolio's behavior. Evaluate the portfolio relative to a historically optimal diversified allocation and explain trade-offs.`;
    }

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
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
