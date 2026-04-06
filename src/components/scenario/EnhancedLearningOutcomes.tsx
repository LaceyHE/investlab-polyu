import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Loader2, RefreshCw, Target, ShieldAlert, Lightbulb, TrendingUp, AlertTriangle, Layers } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import type { PortfolioMetrics, Position } from "@/hooks/useScenarioSimulation";
import type { ScenarioPreset } from "@/data/scenario-presets";

interface Props {
  scenario: ScenarioPreset;
  positions: Position[];
  metrics: PortfolioMetrics;
  currentDate: string;
}

const badgeConfig: Record<string, { icon: typeof Target; color: string }> = {
  'High Concentration': { icon: ShieldAlert, color: 'text-destructive bg-destructive/10 border-destructive/20' },
  'Well Diversified': { icon: Layers, color: 'text-teal bg-teal/10 border-teal/20' },
  'Strong Returns': { icon: TrendingUp, color: 'text-teal bg-teal/10 border-teal/20' },
  'High Risk': { icon: AlertTriangle, color: 'text-warm bg-warm/10 border-warm/20' },
  'Capital Preserved': { icon: Target, color: 'text-primary bg-primary/10 border-primary/20' },
};

const EnhancedLearningOutcomes = ({ scenario, positions, metrics, currentDate }: Props) => {
  const [insights, setInsights] = useState('');
  const [badges, setBadges] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Compute badges from metrics
  useEffect(() => {
    const newBadges: string[] = [];
    const uniqueSectors = new Set(positions.map(p => p.ticker));
    if (positions.length > 0 && positions.length <= 2) newBadges.push('High Concentration');
    if (positions.length >= 5) newBadges.push('Well Diversified');
    if (metrics.totalReturn > 10) newBadges.push('Strong Returns');
    if (metrics.volatility > 30 || metrics.maxDrawdown < -25) newBadges.push('High Risk');
    if (metrics.maxDrawdown > -10 && positions.length > 0) newBadges.push('Capital Preserved');
    setBadges(newBadges);
  }, [positions, metrics]);

  const fetchInsights = async () => {
    if (positions.length === 0) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await supabase.functions.invoke('scenario-commentary', {
        body: {
          scenario: scenario.name,
          currentDate,
          positions: positions.map(p => `${p.ticker}: ${p.weight}%`).join(', '),
          metrics: {
            totalReturn: metrics.totalReturn.toFixed(1),
            maxDrawdown: metrics.maxDrawdown.toFixed(1),
            sharpe: metrics.sharpeRatio.toFixed(2),
            volatility: metrics.volatility.toFixed(1),
            netExposure: metrics.netExposure.toFixed(0),
          },
          recentEvents: '',
          learningMode: true,
        },
      });

      if (response.error) throw new Error(response.error.message);
      setInsights(response.data?.commentary || '');
      setHasGenerated(true);
    } catch (err: any) {
      if (err.message?.includes('429')) {
        setError('Rate limit reached.');
      } else if (err.message?.includes('402')) {
        setError('AI credits exhausted.');
      } else {
        setError('Unable to generate insights.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg text-foreground flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          Learning Outcomes
        </h3>
        {hasGenerated && (
          <button
            onClick={fetchInsights}
            disabled={isLoading}
            className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {badges.map(badge => {
            const config = badgeConfig[badge] || { icon: Target, color: 'text-muted-foreground bg-secondary border-border' };
            const Icon = config.icon;
            return (
              <motion.span
                key={badge}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium ${config.color}`}
              >
                <Icon className="h-3 w-3" />
                {badge}
              </motion.span>
            );
          })}
        </div>
      )}

      {/* Static scenario context */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card p-4"
      >
        <h4 className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
          <AlertTriangle className="h-3 w-3 text-warm" />
          What Happened
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{scenario.learningOutcomes.whatHappened}</p>
      </motion.div>

      {/* AI-generated insights or generate button */}
      {positions.length > 0 ? (
        <>
          {!hasGenerated && !isLoading && !error && (
            <button
              onClick={fetchInsights}
              className="w-full rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-medium text-foreground hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
            >
              <Lightbulb className="h-4 w-4 text-primary" />
              Generate personalized learning insights
            </button>
          )}

          {isLoading && (
            <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing your portfolio choices...
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
              <button onClick={fetchInsights} className="ml-2 underline">Retry</button>
            </div>
          )}

          {insights && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-teal/20 bg-teal/5 p-4"
            >
              <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                <Lightbulb className="h-3 w-3 text-teal" />
                Your Portfolio Insights
              </h4>
              <div className={`prose prose-sm max-w-none ${isLoading ? 'opacity-50' : ''}`}>
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="text-sm text-muted-foreground leading-relaxed mb-2">{children}</p>,
                    strong: ({ children }) => <strong className="text-foreground">{children}</strong>,
                    ul: ({ children }) => <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4 mb-2">{children}</ul>,
                  }}
                >
                  {insights}
                </ReactMarkdown>
              </div>
            </motion.div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-border bg-secondary/30 p-4 text-center text-xs text-muted-foreground">
          Add stocks to your portfolio to get personalized insights
        </div>
      )}

      {/* Reflection question */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-primary/20 bg-primary/5 p-4"
      >
        <h4 className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
          <BookOpen className="h-3 w-3 text-primary" />
          Reflection
        </h4>
        <p className="text-sm text-muted-foreground italic leading-relaxed">
          "{scenario.learningOutcomes.reflectionQuestion}"
        </p>
      </motion.div>
    </div>
  );
};

export default EnhancedLearningOutcomes;
