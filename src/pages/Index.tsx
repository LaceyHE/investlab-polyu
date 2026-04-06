import { motion } from "framer-motion";
import { ArrowRight, Route, FlaskConical, Compass, User } from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";

const hubCards = [
  {
    to: "/learning-path",
    icon: <Route className="h-6 w-6" />,
    title: "Learning Path",
    desc: "Master 6 modules of strategy-driven investing—from price illusions to full portfolio thinking.",
    cta: "Start Learning",
  },
  {
    to: "/sandbox",
    icon: <FlaskConical className="h-6 w-6" />,
    title: "Sandbox",
    desc: "Back-test strategies with real historical data and see how they perform across market regimes.",
    cta: "Open Sandbox",
  },
  {
    to: "/scenarios",
    icon: <Compass className="h-6 w-6" />,
    title: "Scenarios",
    desc: "Simulate market crises—dot-com busts, flash crashes—and stress-test your portfolio decisions.",
    cta: "Run Scenarios",
  },
  {
    to: "/account",
    icon: <User className="h-6 w-6" />,
    title: "Investor Hub",
    desc: "Track your progress, badges earned, and investment ability analysis all in one place.",
    cta: "View Profile",
  },
];

const Index = () => {
  return (
    <AppLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-dark" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />

        <div className="container relative z-10 flex flex-col items-center py-16 md:py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Education-First Investing
            </p>
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl leading-tight text-foreground max-w-3xl">
              Learn <em className="text-gradient-warm not-italic">why</em> strategies work
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground leading-relaxed">
              A structured path that teaches you to think in strategies and environments—so you understand the real reason investments succeed or fail.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Hub Cards */}
      <section className="border-t border-border">
        <div className="container py-16 md:py-20">
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            {hubCards.map((card, i) => (
              <motion.div
                key={card.to}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 * i, duration: 0.5 }}
              >
                <Link
                  to={card.to}
                  className="group flex flex-col justify-between rounded-xl border border-border bg-gradient-card p-6 h-full transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div>
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                      {card.icon}
                    </div>
                    <h2 className="font-serif text-xl text-foreground mb-2">{card.title}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
                  </div>
                  <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    {card.cta}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container text-center text-sm text-muted-foreground">
          InvestLab — Education-first investment learning. No advice. No predictions. Just understanding.
        </div>
      </footer>
    </AppLayout>
  );
};

export default Index;
