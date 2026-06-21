import { FlaskConical, TrendingDown, Activity, BarChart2 } from "lucide-react";
import type { QuantMethodology } from "@/data/scenario-presets";

interface MethodologyPanelProps {
  methodology: QuantMethodology;
}

const CONCEPT_LABELS: Record<QuantMethodology['concept'], { icon: typeof FlaskConical; color: string }> = {
  'mean-reversion': { icon: TrendingDown, color: 'text-warm' },
  'volatility-shock': { icon: Activity, color: 'text-destructive' },
  'valuation-correction': { icon: BarChart2, color: 'text-primary' },
};

const MethodologyPanel = ({ methodology }: MethodologyPanelProps) => {
  const { icon: ConceptIcon, color } = CONCEPT_LABELS[methodology.concept];

  return (
    <div className="rounded-xl border border-warm/25 bg-warm/5 p-4 space-y-4">
      {/* Disclaimer */}
      <div className="flex items-start gap-2 rounded-lg bg-warm/10 border border-warm/20 px-3 py-2">
        <FlaskConical className="h-4 w-4 text-warm mt-0.5 shrink-0" />
        <p className="text-xs text-warm leading-relaxed">
          <strong>Hypothetical scenario</strong> — generated from quantitative assumptions, not real market data.
          Prices are synthetic and for educational purposes only. Not a prediction or investment advice.
        </p>
      </div>

      {/* Header */}
      <div className="flex items-center gap-2">
        <ConceptIcon className={`h-4 w-4 ${color}`} />
        <h3 className="font-serif text-base text-foreground">Quantitative Methodology</h3>
        <span className={`ml-auto text-xs font-medium ${color}`}>{methodology.driverLabel}</span>
      </div>

      {/* Formula */}
      <div className="rounded-lg border border-border bg-card px-4 py-3">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-medium">Formula</p>
        <pre className="text-xs text-foreground font-mono leading-relaxed whitespace-pre-wrap">
          {methodology.formula}
        </pre>
      </div>

      {/* Key assumption cards */}
      <div className="grid gap-2 sm:grid-cols-3">
        {methodology.keyInputs.map((input, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{input.label}</p>
            <p className="text-sm font-mono font-semibold text-foreground">{input.value}</p>
            <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{input.source}</p>
          </div>
        ))}
      </div>

      {/* API integration note */}
      <p className="text-[10px] text-muted-foreground text-center pt-1">
        API integration point — connect FRED (free) or Alpha Vantage to update these inputs with live data.
      </p>
    </div>
  );
};

export default MethodologyPanel;
