import { TIME_PERIODS, type TimePeriod } from "@/data/time-periods";

interface Props {
  selected: TimePeriod;
  onChange: (period: TimePeriod) => void;
}

const TimePeriodSelector = ({ selected, onChange }: Props) => {
  return (
    <div className="rounded-none border-2 border-foreground bg-card p-4">
      <p className="text-xs text-muted-foreground mb-3 uppercase tracking-widest">Market Scenario</p>
      <div className="grid grid-cols-3 gap-2">
        {TIME_PERIODS.map(period => (
          <button
            key={period.key}
            onClick={() => onChange(period)}
            className={`rounded-none border px-3 py-2.5 text-left transition-all ${
              selected.key === period.key
                ? 'border-primary bg-primary/10'
                : 'border-border bg-secondary/50 hover:border-muted-foreground/40'
            }`}
          >
            <p className={`text-xs font-medium mb-0.5 ${selected.key === period.key ? 'text-foreground' : 'text-muted-foreground'}`}>
              {period.label}
            </p>
            <p className="text-[10px] text-muted-foreground font-mono">{period.subtitle}</p>
          </button>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground mt-2.5 leading-relaxed">
        {selected.description}
      </p>
    </div>
  );
};

export default TimePeriodSelector;
