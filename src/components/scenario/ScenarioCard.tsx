import { motion } from "framer-motion";
import { Clock, TrendingDown, ChevronRight, FlaskConical } from "lucide-react";
import type { ScenarioPreset } from "@/data/scenario-presets";

interface ScenarioCardProps {
  scenario: ScenarioPreset;
  index: number;
  onSelect: () => void;
}

const ScenarioCard = ({ scenario, index, onSelect }: ScenarioCardProps) => {
  const isFuture = scenario.isFuture ?? false;
  return (
    <motion.button
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onSelect}
      className={`group rounded-none border p-6 text-left transition-all ${
        isFuture
          ? 'border-warm/25 bg-warm/5 hover:border-warm/45'
          : 'border-border bg-card hover:border-muted-foreground/30'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <p className={`text-3xl font-serif ${isFuture ? 'text-warm/60' : 'text-primary/60'}`}>
          {scenario.startDate.slice(0, 4)}–{scenario.endDate.slice(0, 4)}
        </p>
        <div className="flex items-center gap-2">
          {isFuture && (
            <span className="inline-flex items-center gap-1 rounded-full bg-warm/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warm border border-warm/30">
              <FlaskConical className="h-2.5 w-2.5" />
              Hypothetical
            </span>
          )}
          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
      <h3 className="font-serif text-lg text-foreground mb-1">{scenario.name}</h3>
      <p className="text-sm text-muted-foreground mb-4">{scenario.subtitle}</p>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {scenario.startDate.slice(0, 7)} → {scenario.endDate.slice(0, 7)}
        </span>
        <span className="flex items-center gap-1">
          <TrendingDown className="h-3 w-3" />
          {scenario.peakDrawdown}
        </span>
      </div>
    </motion.button>
  );
};

export default ScenarioCard;
