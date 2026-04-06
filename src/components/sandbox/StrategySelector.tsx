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
  {
    id: 'custom',
    name: 'Build Your Own',
    subtitle: 'Custom Portfolio',
    color: 'hsl(var(--primary))',
    icon: '🧩',
    takeaway: 'Building a diversified portfolio across different sectors and asset classes helps reduce risk.',
  },
];

interface Props {
  selected: StrategyType | null;
  onSelect: (id: StrategyType) => void;
}

const StrategySelector = ({ selected, onSelect }: Props) => {
  const presetStrategies = strategies.filter(s => s.id !== 'custom');
  const customStrategy = strategies.find(s => s.id === 'custom');

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {presetStrategies.map((s, i) => {
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
              <div
                className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full transition-opacity"
                style={{ backgroundColor: s.color, opacity: isActive ? 1 : 0.3 }}
              />
            </motion.button>
          );
        })}
      </div>

      {/* Build Your Own — full-width, visually distinct */}
      {customStrategy && (() => {
        const isActive = selected === customStrategy.id;
        return (
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: presetStrategies.length * 0.08 }}
            onClick={() => onSelect(customStrategy.id)}
            className={`group relative w-full rounded-xl border p-6 text-left transition-all ${
              isActive
                ? 'border-foreground bg-secondary shadow-sm'
                : 'border-dashed border-primary/40 bg-primary/5 hover:border-primary/60 hover:bg-primary/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{customStrategy.icon}</span>
                <div>
                  <h3 className="font-serif text-xl text-foreground">{customStrategy.name}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{customStrategy.subtitle} — pick your own assets &amp; weights</p>
                </div>
              </div>
              <ChevronRight
                className={`h-5 w-5 transition-opacity ${
                  isActive ? 'text-foreground opacity-100' : 'text-primary opacity-60 group-hover:opacity-100'
                }`}
              />
            </div>
          </motion.button>
        );
      })()}
    </div>
  );
};

export default StrategySelector;
