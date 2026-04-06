import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { StrategyType } from "@/hooks/useStrategyBacktest";

export interface StrategyDef {
  id: StrategyType;
  name: string;
  subtitle: string;
  color: string; // HSL token
  icon: string;  // Emoji
  takeaway: string;
}

export const strategies: StrategyDef[] = [
  {
    id: 'allocation',
    name: 'The 60/40 Classic',
    subtitle: 'Asset Allocation',
    color: 'hsl(220 70% 55%)',
    icon: '🔵',
    takeaway: 'Diversification reduces risk but limits upside.',
  },
  {
    id: 'trend',
    name: 'Trend Follower',
    subtitle: 'Trend Strategy',
    color: 'hsl(270 60% 55%)',
    icon: '🟣',
    takeaway: 'Faster reactions catch trends but create more false signals.',
  },
  {
    id: 'income',
    name: 'Income Machine',
    subtitle: 'Dividend vs Growth',
    color: 'hsl(152 55% 42%)',
    icon: '🟢',
    takeaway: 'You usually trade income for growth.',
  },
  {
    id: 'momentum',
    name: 'Speed Racer',
    subtitle: 'Momentum / Short vs Long',
    color: 'hsl(0 65% 55%)',
    icon: '🔴',
    takeaway: 'Short-term strategies are exciting but unstable.',
  },
];

interface Props {
  selected: StrategyType | null;
  onSelect: (id: StrategyType) => void;
}

const StrategySelector = ({ selected, onSelect }: Props) => {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {strategies.map((s, i) => {
        const isActive = selected === s.id;
        return (
          <motion.button
            key={s.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => onSelect(s.id)}
            className={`group relative rounded-xl border p-5 text-left transition-all ${
              isActive
                ? 'border-foreground bg-secondary shadow-sm'
                : 'border-border bg-card hover:border-muted-foreground/40'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xl mr-2">{s.icon}</span>
                <h3 className="inline font-serif text-lg text-foreground">{s.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{s.subtitle}</p>
              </div>
              <ChevronRight
                className={`h-4 w-4 transition-opacity ${
                  isActive ? 'text-foreground opacity-100' : 'text-muted-foreground opacity-0 group-hover:opacity-100'
                }`}
              />
            </div>
            {/* Color accent bar */}
            <div
              className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full transition-opacity"
              style={{ backgroundColor: s.color, opacity: isActive ? 1 : 0.3 }}
            />
          </motion.button>
        );
      })}
    </div>
  );
};

export default StrategySelector;
