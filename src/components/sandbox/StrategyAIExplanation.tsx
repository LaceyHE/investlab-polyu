import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import type { BacktestResult, StrategyType } from "@/hooks/useStrategyBacktest";

interface Props {
  strategy: StrategyType;
  strategyName: string;
  param: number;
  paramLabel: string;
  result: BacktestResult;
}

const StrategyAIExplanation = ({ strategy, strategyName, param, paramLabel, result }: Props) => {
  const [commentary, setCommentary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExplanation = async () => {
    setIsLoading(true);
    setError(null);
    setCommentary('');

    try {
      const response = await supabase.functions.invoke('sandbox-explain', {
        body: {
          strategy,
          strategyName,
          param: paramLabel,
          metrics: {
            totalReturn: result.totalReturn.toFixed(1),
            cagr: result.cagr.toFixed(1),
            volatility: result.volatility.toFixed(1),
            maxDrawdown: result.maxDrawdown.toFixed(1),
            sharpe: result.sharpeRatio.toFixed(2),
            worstQuarter: result.worstQuarter.toFixed(1),
          },
          signalCount: result.signals?.length || 0,
        },
      });

      if (response.error) throw new Error(response.error.message);
      setCommentary(response.data?.explanation || 'No explanation available.');
    } catch (err: any) {
      if (err.message?.includes('429')) {
        setError('Rate limit reached. Try again in a moment.');
      } else if (err.message?.includes('402')) {
        setError('AI credits exhausted.');
      } else {
        setError('Unable to generate explanation. Try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">AI Explanation</h3>
        </div>
        {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-3"
          >
            {!commentary && !isLoading && !error && (
              <button
                onClick={fetchExplanation}
                className="w-full rounded-lg bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Explain this strategy
              </button>
            )}

            {isLoading && (
              <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing strategy...
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
                <button onClick={fetchExplanation} className="ml-2 underline hover:no-underline">Retry</button>
              </div>
            )}

            {commentary && (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="text-sm text-muted-foreground leading-relaxed mb-2">{children}</p>,
                    strong: ({ children }) => <strong className="text-foreground">{children}</strong>,
                    ul: ({ children }) => <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">{children}</ul>,
                  }}
                >
                  {commentary}
                </ReactMarkdown>
                <button onClick={fetchExplanation} className="mt-2 text-xs text-primary hover:underline">Refresh</button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StrategyAIExplanation;
