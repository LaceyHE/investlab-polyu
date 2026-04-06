import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import type { PortfolioMetrics, Position } from "@/hooks/useScenarioSimulation";
import type { ScenarioPreset, ScenarioEvent } from "@/data/scenario-presets";

interface AICommentaryProps {
  scenario: ScenarioPreset;
  currentDate: string;
  positions: Position[];
  metrics: PortfolioMetrics;
  recentEvents: ScenarioEvent[];
}

const AICommentary = ({
  scenario,
  currentDate,
  positions,
  metrics,
  recentEvents,
}: AICommentaryProps) => {
  const [commentary, setCommentary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommentary = async () => {
    setIsLoading(true);
    setError(null);
    setCommentary('');

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
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setCommentary(response.data?.commentary || 'No commentary available.');
    } catch (err: any) {
      if (err.message?.includes('429')) {
        setError('Rate limit reached. Please try again in a moment.');
      } else if (err.message?.includes('402')) {
        setError('AI credits exhausted. Add funds in Settings → Workspace → Usage.');
      } else {
        setError('Unable to generate commentary. Try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full mb-2"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-serif text-base text-foreground">AI Commentary</h3>
        </div>
        {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {!commentary && !isLoading && !error && (
              <button
                onClick={fetchCommentary}
                className="w-full rounded-lg bg-gradient-warm px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
              >
                What's happening here?
              </button>
            )}

            {isLoading && (
              <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing scenario...
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
                <button
                  onClick={fetchCommentary}
                  className="ml-2 underline hover:no-underline"
                >
                  Retry
                </button>
              </div>
            )}

            {commentary && (
              <div className="prose prose-sm max-w-none text-foreground">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="text-sm text-muted-foreground leading-relaxed mb-2">{children}</p>,
                    strong: ({ children }) => <strong className="text-foreground">{children}</strong>,
                    ul: ({ children }) => <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">{children}</ul>,
                  }}
                >
                  {commentary}
                </ReactMarkdown>
                <button
                  onClick={fetchCommentary}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  Refresh analysis
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AICommentary;
