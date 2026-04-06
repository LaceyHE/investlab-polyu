import { useState } from "react";
import { motion } from "framer-motion";
import { Award, Sparkles, Loader2, Shield, Target, AlertTriangle, PieChart } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import type { PortfolioMetrics, Position } from "@/hooks/useScenarioSimulation";
import type { ScenarioPreset } from "@/data/scenario-presets";
import { dotcomStocks } from "@/data/dotcom-stocks";

interface PersonalizedOutcomesProps {
  scenario: ScenarioPreset;
  positions: Position[];
  metrics: PortfolioMetrics;
  currentDate: string;
}

interface Badge {
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
}

const PersonalizedOutcomes = ({ scenario, positions, metrics, currentDate }: PersonalizedOutcomesProps) => {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute badges client-side
  const badges: Badge[] = [];

  const uniqueIndustries = new Set(
    positions.map(p => dotcomStocks.find(s => s.ticker === p.ticker)?.industry).filter(Boolean)
  );

  if (uniqueIndustries.size >= 3) {
    badges.push({ label: 'Well-Diversified', icon: PieChart, color: 'text-teal bg-teal/10 border-teal/20', description: 'Positions across 3+ industries' });
  }
  if (metrics.sharpeRatio > 0.8) {
    badges.push({ label: 'Risk-Aware', icon: Shield, color: 'text-primary bg-primary/10 border-primary/20', description: 'Strong risk-adjusted returns (Sharpe > 0.8)' });
  }
  if (metrics.maxDrawdown > -15 && positions.length > 0) {
    badges.push({ label: 'Capital Preserved', icon: Target, color: 'text-teal bg-teal/10 border-teal/20', description: 'Max drawdown under 15%' });
  }
  if (metrics.maxDrawdown < -30) {
    badges.push({ label: 'High Risk Exposure', icon: AlertTriangle, color: 'text-destructive bg-destructive/10 border-destructive/20', description: 'Drawdown exceeded 30%' });
  }
  if (uniqueIndustries.size <= 1 && positions.length > 1) {
    badges.push({ label: 'Concentration Risk', icon: AlertTriangle, color: 'text-warm bg-warm/10 border-warm/20', description: 'All positions in one sector' });
  }

  const fetchSummary = async () => {
    setIsLoading(true);
    setError(null);

    const positionsDesc = positions.map(p => `${p.ticker}: ${p.weight}%`).join(', ');

    try {
      const response = await supabase.functions.invoke('scenario-commentary', {
        body: {
          type: 'summary',
          scenario: scenario.name,
          currentDate,
          positions: positionsDesc,
          metrics: {
            totalReturn: metrics.totalReturn.toFixed(1),
            maxDrawdown: metrics.maxDrawdown.toFixed(1),
            sharpe: metrics.sharpeRatio.toFixed(2),
            volatility: metrics.volatility.toFixed(1),
            netExposure: metrics.netExposure.toFixed(0),
            worstQuarter: metrics.worstQuarter.toFixed(1),
          },
          recentEvents: '',
        },
      });

      if (response.error) throw new Error(response.error.message);
      setSummary(response.data?.commentary || 'No summary available.');
    } catch (err: any) {
      if (err.message?.includes('429')) setError('Rate limit reached. Try again shortly.');
      else if (err.message?.includes('402')) setError('AI credits exhausted.');
      else setError('Unable to generate summary. Try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Award className="h-5 w-5 text-primary" />
        <h3 className="font-serif text-lg text-foreground">Your Learning Outcomes</h3>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {badges.map(badge => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${badge.color}`}
              title={badge.description}
            >
              <badge.icon className="h-3 w-3" />
              {badge.label}
            </motion.div>
          ))}
        </div>
      )}

      {/* Metrics comparison */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Your Return', value: `${metrics.totalReturn >= 0 ? '+' : ''}${metrics.totalReturn.toFixed(1)}%`, color: metrics.totalReturn >= 0 ? 'text-teal' : 'text-destructive' },
          { label: 'Max Drawdown', value: `${metrics.maxDrawdown.toFixed(1)}%`, color: 'text-destructive' },
          { label: 'Sharpe Ratio', value: metrics.sharpeRatio.toFixed(2), color: metrics.sharpeRatio > 0.5 ? 'text-teal' : 'text-muted-foreground' },
        ].map(item => (
          <div key={item.label} className="rounded-lg bg-card border border-border p-3 text-center">
            <p className="text-[10px] text-muted-foreground">{item.label}</p>
            <p className={`text-sm font-mono font-medium mt-0.5 ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* AI Summary */}
      {!summary && !isLoading && !error && (
        <button
          onClick={fetchSummary}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary/80 px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Sparkles className="h-4 w-4" />
          View My Results
        </button>
      )}

      {isLoading && (
        <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Analyzing your portfolio journey...
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
          <button onClick={fetchSummary} className="ml-2 underline hover:no-underline">Retry</button>
        </div>
      )}

      {summary && (
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="text-sm text-muted-foreground leading-relaxed mb-2">{children}</p>,
              strong: ({ children }) => <strong className="text-foreground">{children}</strong>,
              ul: ({ children }) => <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">{children}</ul>,
            }}
          >
            {summary}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default PersonalizedOutcomes;
