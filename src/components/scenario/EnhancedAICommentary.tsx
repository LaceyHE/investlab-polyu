import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, RefreshCw, TrendingDown, Activity, BarChart3, PieChart, Shield, AlertTriangle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import type { PortfolioMetrics, Position } from "@/hooks/useScenarioSimulation";
import type { ScenarioPreset, ScenarioEvent } from "@/data/scenario-presets";

interface Props {
  scenario: ScenarioPreset;
  currentDate: string;
  positions: Position[];
  metrics: PortfolioMetrics;
  recentEvents: ScenarioEvent[];
}

const EnhancedAICommentary = ({ scenario, currentDate, positions, metrics, recentEvents }: Props) => {
  const [commentary, setCommentary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const prevPositionsRef = useRef<string>('');

  // Auto-refresh when positions change significantly
  useEffect(() => {
    const posKey = positions.map(p => `${p.ticker}:${p.weight}`).join(',');
    if (posKey !== prevPositionsRef.current && positions.length > 0 && commentary) {
      prevPositionsRef.current = posKey;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fetchCommentary(), 2000);
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positions]);

  const fetchCommentary = async () => {
    setIsLoading(true);
    setError(null);

    const positionsDesc = positions.length > 0
      ? positions.map(p => `${p.ticker}: ${p.weight}%`).join(', ')
      : 'No positions (100% cash)';

    const eventsDesc = recentEvents.length > 0
      ? recentEvents.map(e => `${e.date}: ${e.label}`).join('; ')
      : 'No recent events';

    try {
      const response = await supabase.functions.invoke('scenario-commentary', {
        body: {
          scenario: scenario.name,
          currentDate,
          positions: positionsDesc,
          metrics: {
            totalReturn: metrics.totalReturn.toFixed(1),
            maxDrawdown: metrics.maxDrawdown.toFixed(1),
            sharpe: metrics.sharpeRatio.toFixed(2),
            volatility: metrics.volatility.toFixed(1),
            netExposure: metrics.netExposure.toFixed(0),
          },
          recentEvents: eventsDesc,
          structured: true,
        },
      });

      if (response.error) throw new Error(response.error.message);
      setCommentary(response.data?.commentary || 'No commentary available.');
    } catch (err: any) {
      if (err.message?.includes('429')) {
        setError('Rate limit reached. Try again in a moment.');
      } else if (err.message?.includes('402')) {
        setError('AI credits exhausted.');
      } else {
        setError('Unable to generate commentary.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const metricCards = [
    { label: 'Drawdown', value: `${metrics.maxDrawdown.toFixed(1)}%`, icon: TrendingDown, color: 'text-destructive' },
    { label: 'Sharpe', value: metrics.sharpeRatio.toFixed(2), icon: Activity, color: metrics.sharpeRatio > 0.5 ? 'text-teal' : 'text-muted-foreground' },
    { label: 'Volatility', value: `${metrics.volatility.toFixed(1)}%`, icon: BarChart3, color: metrics.volatility > 25 ? 'text-warm' : 'text-muted-foreground' },
    { label: 'Exposure', value: `${metrics.netExposure.toFixed(0)}%`, icon: PieChart, color: 'text-foreground' },
  ];

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-serif text-base text-foreground">AI Commentary</h3>
        </div>
        <button
          onClick={fetchCommentary}
          disabled={isLoading}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Metric icon bar */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {metricCards.map(m => (
          <div key={m.label} className="rounded-lg bg-background/60 p-2 text-center">
            <m.icon className={`h-3 w-3 mx-auto mb-0.5 ${m.color}`} />
            <p className={`text-[11px] font-mono font-bold ${m.color}`}>{m.value}</p>
            <p className="text-[9px] text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Recent events */}
      {recentEvents.length > 0 && (
        <div className="flex gap-1.5 mb-4 flex-wrap">
          {recentEvents.slice(-2).map((e, i) => (
            <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-md bg-background/60 text-[10px]">
              <AlertTriangle className="h-2.5 w-2.5 text-warm" />
              <span className="text-muted-foreground">{e.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Commentary content */}
      {!commentary && !isLoading && !error && (
        <button
          onClick={fetchCommentary}
          className="w-full rounded-lg bg-foreground text-background px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          What's happening here?
        </button>
      )}

      {isLoading && !commentary && (
        <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
          Analyzing scenario...
        </div>
      )}

      {error && !commentary && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
          <button onClick={fetchCommentary} className="ml-2 underline hover:no-underline">Retry</button>
        </div>
      )}

      {commentary && (
        <div className={`prose prose-sm max-w-none ${isLoading ? 'opacity-50' : ''}`}>
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="text-sm text-muted-foreground leading-relaxed mb-2">{children}</p>,
              strong: ({ children }) => <strong className="text-foreground">{children}</strong>,
              ul: ({ children }) => <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4 mb-2">{children}</ul>,
              h3: ({ children }) => (
                <h4 className="text-xs font-semibold text-foreground mt-3 mb-1 flex items-center gap-1.5 uppercase tracking-wide">
                  <Shield className="h-3 w-3 text-primary" />
                  {children}
                </h4>
              ),
            }}
          >
            {commentary}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default EnhancedAICommentary;
