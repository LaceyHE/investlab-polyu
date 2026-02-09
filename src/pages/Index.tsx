import { motion } from "framer-motion";
import { ArrowRight, Target, Layers, Brain, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";

const pillars = [
  {
    icon: <Target className="h-5 w-5" />,
    title: "Strategy First",
    desc: "Every action requires a declared strategy. No blind stock picking.",
  },
  {
    icon: <Layers className="h-5 w-5" />,
    title: "Environment Aware",
    desc: "Learn how markets shift and which strategies thrive—or fail—in each.",
  },
  {
    icon: <Brain className="h-5 w-5" />,
    title: "Reflection Driven",
    desc: "Automatic summaries surface your behavioral patterns and biases.",
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: "Risk Over Returns",
    desc: "Portfolio thinking emphasizes allocation and drawdown, not profit.",
  },
];

const Index = () => {
  return (
    <AppLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-dark" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />

        <div className="container relative z-10 flex flex-col items-center py-24 md:py-36 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Education-First Investing
            </p>
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl leading-tight text-foreground max-w-4xl">
              Learn <em className="text-gradient-warm not-italic">why</em> strategies work,
              <br className="hidden md:block" /> not just <em className="text-gradient-teal not-italic">which</em> stocks to pick
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              A structured learning path that teaches you to think in strategies and environments—so you understand the real reason investments succeed or fail.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <Link
              to="/learning-path"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-warm px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20"
            >
              Begin Learning Path
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/learning-path"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-7 py-3.5 text-sm font-medium text-foreground transition-all hover:bg-secondary"
            >
              Explore Modules
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Core Insight */}
      <section className="border-t border-border">
        <div className="container py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mx-auto max-w-3xl text-center"
          >
            <blockquote className="font-serif text-2xl md:text-3xl text-foreground leading-relaxed italic">
              "I didn't fail because I picked the wrong stock.
              <br />
              I failed because I used the wrong strategy in the wrong environment."
            </blockquote>
            <p className="mt-6 text-muted-foreground">
              This is the realization every learner reaches by the end of the path.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pillars */}
      <section className="border-t border-border">
        <div className="container py-20 md:py-28">
          <div className="mb-12 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary mb-3">How It Works</p>
            <h2 className="font-serif text-3xl md:text-4xl text-foreground">Four Pillars of Learning</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {pillars.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="rounded-xl border border-border bg-gradient-card p-6"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {p.icon}
                </div>
                <h3 className="font-serif text-lg text-foreground mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="container py-20 text-center">
          <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-4">
            Ready to think like a strategist?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Start Module 1 and discover why price movement alone can be deeply misleading.
          </p>
          <Link
            to="/learning-path"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-warm px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20"
          >
            Start Module 1
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container text-center text-sm text-muted-foreground">
          StrategyLab — Education-first investment learning. No advice. No predictions. Just understanding.
        </div>
      </footer>
    </AppLayout>
  );
};

export default Index;
