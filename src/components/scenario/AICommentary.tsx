import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, ChevronDown, ChevronUp, AlertTriangle, Lightbulb, BarChart3, PieChart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { PortfolioMetrics, Position } from "@/hooks/useScenarioSimulation";
import type { ScenarioPreset, ScenarioEvent } from "@/data/scenario-presets";

interface AICommentaryProps {
  scenario: ScenarioPreset;
  currentDate: string;
  positions: Position[];
  metrics: PortfolioMetrics;
  recentEvents: ScenarioEvent[];
  autoTrigger?: boolean;
}

interface CommentarySection {
  title: string;
  icon: React.ElementType;
  colorClass: string;
  content: string;
}

// Highlight inline metrics like "32%" or "Sharpe 0.4"
const highlightMetrics = (text: string): React.ReactNode[] => {
  const parts = text.split(/(\*\*[^*]+\*\*|-?\d+\.?\d*%|Sharpe\s+-?\d+\.?\d*)/g);
  return parts.map((part, i) => {
    if (/^\*\*(.+)\*\*$/.test(part)) {
      const inner = part.replace(/\*\*/g, '');
      return <strong key={i} className="text-foreground">{inner}</strong>;
    }
    if (/-?\d+\.?\d*%/.test(part)) {
      const num = parseFloat(part);
      const color = num < -10 ? 'text-destructive' : num > 10 ? 'text-teal' : 'text-foreground';
      return <span key={i} className={`font-mono font-medium ${color}`}>{part}</span>;
    }
    if (/Sharpe\s+-?\d+\.?\d*/.test(part)) {
      return <span key={i} className="font-mono font-medium text-primary">{part}</span>;
    }
    return part;
  });
};

const parseCommentarySections = (text: string): CommentarySection[] => {
  const sections: CommentarySection[] = [];

  const sectionDefs: { pattern: RegExp; title: string; icon: React.ElementType; colorClass: string }[] = [
    { pattern: /(?:##?\s*\**Market Context\**|^\**Market Context\**)/im, title: 'Market Context', icon: BarChart3, colorClass: 'border-primary/20 bg-primary/5' },
    { pattern: /(?:##?\s*\**Portfolio Analysis\**|^\**Portfolio Analysis\**)/im, title: 'Portfolio Analysis', icon: PieChart, colorClass: 'border-border bg-card' },
    { pattern: /(?:##?\s*\**(?:Key Insight|Risk Warning)\**|^\**(?:Key Insight|Risk Warning)\**)/im, title: 'Key Insight', icon: AlertTriangle, colorClass: 'border-warm/20 bg-warm/5' },
    { pattern: /(?:##?\s*\**Suggestion\**|^\**Suggestion\**)/im, title: 'Suggestion', icon: Lightbulb, colorClass: 'border-teal/20 bg-teal/5' },
  ];

  // Find all section matches with positions
  const matches: { idx: number; def: typeof sectionDefs[0] }[] = [];
  for (const def of sectionDefs) {
    const match = text.match(def.pattern);
    if (match && match.index !== undefined) {
      matches.push({ idx: match.index, def });
    }
  }
  matches.sort((a, b) => a.idx - b.idx);

  if (matches.length === 0) {
    // No structured headers found — render as single section
    sections.push({ title: 'Analysis', icon: BarChart3, colorClass: 'border-primary/20 bg-primary/5', content: text.trim() });
    return sections;
  }

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].idx;
    const end = i + 1 < matches.length ? matches[i + 1].idx : text.length;
    let content = text.slice(start, end);
    // Remove the header line
    content = content.replace(/^##?\s*\**[^*\n]+\**\s*/m, '').replace(/^\**[^*\n]+\**\s*/m, '').trim();
    if (content) {
      sections.push({ title: matches[i].def.title, icon: matches[i].def.icon, colorClass: matches[i].def.colorClass, content });
    }
  }

  return sections;
};

const AICommentary = ({
  scenario,
  currentDate,
  positions,
  metrics,
  recentEvents,
  autoTrigger = false,
}: AICommentaryProps) => {
  const [commentary, setCommentary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastAutoTrigger = useRef(0);
  const prevPositionsCount = useRef(positions.length);

  useEffect(() => {
    if (!autoTrigger || positions.length === 0) return;
    const now = Date.now();
    const positionsChanged = positions.length !== prevPositionsCount.current;
    prevPositionsCount.current = positions.length;

    if (positionsChanged && now - lastAutoTrigger.current > 30000) {
      lastAutoTrigger.current = now;
      fetchCommentary();
    }
  }, [positions.length, autoTrigger]);

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
            worstQuarter: metrics.worstQuarter.toFixed(1),
          },
          recentEvents: eventsDesc,
        },
      });

      if (response.error) throw new Error(response.error.message);
      setCommentary(response.data?.commentary || 'No commentary available.');
    } catch (err: any) {
      if (err.message?.includes('429')) setError('Rate limit reached. Please try again in a moment.');
      else if (err.message?.includes('402')) setError('AI credits exhausted. Add funds in Settings → Workspace → Usage.');
      else setError('Unable to generate commentary. Try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const sections = commentary ? parseCommentarySections(commentary) : [];

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
                className="w-full rounded-lg bg-gradient-to-r from-primary to-primary/80 px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
              >
                What's happening here?
              </button>
            )}

            {isLoading && (
              <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-secondary rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-secondary rounded animate-pulse w-1/2" />
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
                <button onClick={fetchCommentary} className="ml-2 underline hover:no-underline">Retry</button>
              </div>
            )}

            {sections.length > 0 && (
              <div className="space-y-2">
                {sections.map((section, i) => {
                  const SectionIcon = section.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`rounded-lg border p-3 ${section.colorClass}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <SectionIcon className="h-3.5 w-3.5" />
                        <span className="text-xs font-semibold text-foreground">{section.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {highlightMetrics(section.content)}
                      </p>
                    </motion.div>
                  );
                })}
                <button onClick={fetchCommentary} className="mt-1 text-xs text-primary hover:underline">
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
