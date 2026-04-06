import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, TrendingDown, Shield, Zap, Info } from "lucide-react";
import type { ScenarioEvent } from "@/data/scenario-presets";

interface Props {
  currentDate: string;
  events: ScenarioEvent[];
  positions: { ticker: string; weight: number }[];
}

const hintMessages: Record<string, { icon: typeof AlertTriangle; message: string; action: string }> = {
  crash: { icon: AlertTriangle, message: 'Market Panic', action: 'Consider reducing concentrated tech exposure or increasing cash' },
  fed: { icon: Shield, message: 'Policy Shift', action: 'Observe how rate changes affect different sectors in your portfolio' },
  recovery: { icon: TrendingDown, message: 'Signs of Recovery', action: 'Review whether your current allocation captures upside potential' },
  earnings: { icon: Zap, message: 'Earnings Season', action: 'Watch how valuation multiples shift with new earnings data' },
  policy: { icon: Info, message: 'Policy Change', action: 'Consider how fiscal policy impacts your sector exposure' },
};

const MarketHintBanner = ({ currentDate, events, positions }: Props) => {
  const activeHint = useMemo(() => {
    if (!currentDate) return null;
    const current = new Date(currentDate);

    // Find event within 14 days
    for (const event of events) {
      const eventDate = new Date(event.date);
      const diffDays = (current.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays >= 0 && diffDays <= 14) {
        return { event, config: hintMessages[event.type] || hintMessages.policy };
      }
    }
    return null;
  }, [currentDate, events]);

  if (!activeHint) return null;

  const { event, config } = activeHint;
  const Icon = config.icon;

  const typeColors: Record<string, string> = {
    crash: 'border-destructive/40 bg-destructive/8',
    fed: 'border-primary/40 bg-primary/8',
    recovery: 'border-teal/40 bg-teal/8',
    earnings: 'border-warm/40 bg-warm/8',
    policy: 'border-primary/40 bg-primary/8',
  };

  const iconColors: Record<string, string> = {
    crash: 'text-destructive',
    fed: 'text-primary',
    recovery: 'text-teal',
    earnings: 'text-warm',
    policy: 'text-primary',
  };

  return (
    <AnimatePresence>
      <motion.div
        key={event.date}
        initial={{ opacity: 0, y: -12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className={`rounded-xl border p-4 ${typeColors[event.type] || typeColors.policy}`}
      >
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 ${iconColors[event.type] || iconColors.policy}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                {config.message}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <p className="text-sm font-medium text-foreground mb-1">{event.label}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{event.description}</p>

            {/* Interactive guidance */}
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-background/50 px-3 py-2">
              <Zap className="h-3 w-3 text-primary shrink-0" />
              <p className="text-[11px] text-muted-foreground italic">{config.action}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MarketHintBanner;
