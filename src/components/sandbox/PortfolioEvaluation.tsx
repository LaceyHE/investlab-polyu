import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Loader2, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import PortfolioRadarChart from "./PortfolioRadarChart";
import { computeRadarScores } from "./RadarScoring";
import type { BacktestResult, StrategyType } from "@/hooks/useStrategyBacktest";

interface Props {
  result: BacktestResult;
  strategy: StrategyType;
  strategyName: string;
  param: number;
  paramLabel: string;
}

const PortfolioEvaluation = ({ result, strategy, strategyName, param, paramLabel }: Props) => {
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Auto-trigger AI evaluation when metrics change (debounced)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchEvaluation();
    }, 1200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strategy, param, result.totalReturn, result.sharpeRatio]);

  const fetchEvaluation = async () => {
    setIsLoading(true);
    setError(null);

    const radarScores = computeRadarScores(result, strategy, param);

    try {
      const response = await supabase.functions.invoke('sandbox-evaluate', {
        body: {
          strategyName,
          param: paramLabel,
          metrics: {
            totalReturn: result.totalReturn.toFixed(1),
            cagr: result.cagr.toFixed(1),
            volatility: result.volatility.toFixed(1),
            maxDrawdown: result.maxDrawdown.toFixed(1),
            worstQuarter: result.worstQuarter.toFixed(1),
            sharpe: result.sharpeRatio.toFixed(2),
          },
          radarScores: radarScores.reduce((acc, s) => {
            acc[s.dimension] = s.score;
            return acc;
          }, {} as Record<string, number>),
        },
      });

      if (response.error) throw new Error(response.error.message);
      setFeedback(response.data?.evaluation || 'No evaluation available.');
    } catch (err: any) {
      if (err.message?.includes('429')) {
        setError('Rate limit reached. Try again in a moment.');
      } else if (err.message?.includes('402')) {
        setError('AI credits exhausted.');
      } else {
        setError('Unable to generate evaluation.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 mb-1">
        <Brain className="h-4 w-4 text-primary" />
        <h3 className="font-serif text-lg text-foreground">Portfolio Evaluation</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Radar Chart */}
        <PortfolioRadarChart result={result} strategy={strategy} param={param} />

        {/* AI Feedback */}
        <div className="rounded-xl border border-border bg-card p-5 min-h-[320px] flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">AI Insights</span>
            <button
              onClick={fetchEvaluation}
              disabled={isLoading}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {isLoading && !feedback && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 py-8 text-sm text-muted-foreground justify-center"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Evaluating portfolio...
                </motion.div>
              )}

              {error && !feedback && (
                <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
                >
                  {error}
                  <button onClick={fetchEvaluation} className="ml-2 underline hover:no-underline">Retry</button>
                </motion.div>
              )}

              {feedback && (
                <motion.div key="feedback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className={`prose prose-sm max-w-none ${isLoading ? 'opacity-50' : ''}`}
                >
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="text-sm text-muted-foreground leading-relaxed mb-2">{children}</p>,
                      strong: ({ children }) => <strong className="text-foreground">{children}</strong>,
                      ul: ({ children }) => <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4 mb-2">{children}</ul>,
                      h3: ({ children }) => <h4 className="text-xs font-semibold text-foreground mt-3 mb-1 uppercase tracking-wide">{children}</h4>,
                    }}
                  >
                    {feedback}
                  </ReactMarkdown>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PortfolioEvaluation;
