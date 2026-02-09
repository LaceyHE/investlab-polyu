import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, TrendingUp, BarChart3, Zap, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import ProgressBar from "@/components/ProgressBar";

const approaches = [
  {
    icon: <TrendingUp className="h-6 w-6" />,
    name: "Fundamental Thinking",
    tagline: "Value over time",
    description:
      "Focuses on a company's intrinsic worth—earnings, cash flow, competitive advantages. Believes the market eventually reflects true value.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    name: "Technical Thinking",
    tagline: "Timing and trends",
    description:
      "Reads price charts, patterns, and volume to identify entry and exit points. Believes price action contains all necessary information.",
    color: "text-teal",
    bg: "bg-teal/10",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    name: "Momentum Thinking",
    tagline: "Relative strength",
    description:
      "Bets that recent winners continue winning and losers keep losing. Focuses on the speed and direction of price movement across assets.",
    color: "text-foreground",
    bg: "bg-secondary",
  },
];

const ModuleOne = () => {
  return (
    <AppLayout>
      <div className="container max-w-4xl py-12 md:py-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/learning-path" className="hover:text-foreground transition-colors">
            Learning Path
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Module 1</span>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary mb-3">
            Module 1 of 6
          </p>
          <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
            Why Price Movement Alone Is Misleading
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-2xl">
            Before you look at a single stock, you need to understand the three fundamentally different lenses people use to interpret markets. Each sees the same data—and draws completely different conclusions.
          </p>
          <div className="mt-6 max-w-sm">
            <ProgressBar current={0} total={3} label="Sections completed" />
          </div>
        </motion.div>

        {/* Key Insight */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12 rounded-xl border border-primary/20 bg-primary/5 p-6"
        >
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-primary mb-2">
            Key Insight
          </p>
          <p className="text-foreground leading-relaxed">
            A stock drops 15% in one week. A fundamental investor sees a buying opportunity. A technical investor sees a breakdown signal. A momentum investor sees confirmation to exit. <strong>Same event—three opposite conclusions.</strong> Understanding this is your foundation.
          </p>
        </motion.div>

        {/* Three Approaches */}
        <div className="mb-12">
          <h2 className="font-serif text-2xl text-foreground mb-6">
            Three Ways to See the Market
          </h2>
          <div className="space-y-4">
            {approaches.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
                className="group rounded-xl border border-border bg-gradient-card p-6 hover:border-muted-foreground/30 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${a.bg} ${a.color}`}>
                    {a.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-serif text-lg text-foreground">{a.name}</h3>
                      <span className="text-xs font-medium text-muted-foreground px-2 py-0.5 rounded-full bg-secondary">
                        {a.tagline}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {a.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Reminder */}
        <div className="mb-12 rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Remember:</strong> At this stage, there is no stock picking and no real trading. 
            The goal is to understand that the lens you choose fundamentally shapes every decision you'll make. 
            None of these approaches is inherently right or wrong—that understanding comes in Module 2.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between border-t border-border pt-8">
          <Link
            to="/learning-path"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Path
          </Link>
          <button
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-warm px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20"
          >
            Continue to Section 1
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default ModuleOne;
