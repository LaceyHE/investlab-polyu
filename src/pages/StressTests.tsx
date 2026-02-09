import AppLayout from "@/components/AppLayout";
import { History, Lock } from "lucide-react";
import { motion } from "framer-motion";

const stressTests = [
  { year: "2000", name: "Dot-com Bubble", desc: "Tech euphoria meets reality" },
  { year: "2008", name: "Global Financial Crisis", desc: "Systemic collapse and contagion" },
  { year: "2020", name: "COVID Crash", desc: "Fastest bear market in history" },
  { year: "2022", name: "Rate-Hike Cycle", desc: "Inflation shock and multiple compression" },
];

const StressTests = () => (
  <AppLayout>
    <div className="container py-12 md:py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <History className="h-6 w-6 text-primary" />
        </div>
        <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-3">Historical Stress Tests</h1>
        <p className="text-muted-foreground max-w-lg mb-10">
          Enter real market crises with your strategy knowledge. No hints. No new tools. Just your understanding against history.
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2">
        {stressTests.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative rounded-xl border border-border bg-gradient-card p-6 opacity-60"
          >
            <p className="text-3xl font-serif text-primary/40 mb-2">{s.year}</p>
            <h3 className="font-serif text-lg text-foreground mb-1">{s.name}</h3>
            <p className="text-sm text-muted-foreground">{s.desc}</p>
            <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground/60">
              <Lock className="h-3 w-3" />
              Locked
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </AppLayout>
);

export default StressTests;
