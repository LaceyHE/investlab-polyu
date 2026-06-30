import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Route, Network, FlaskConical, Compass, User } from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { useGamification } from "@/contexts/GamificationContext";
import { GamificationSidebar } from "@/components/gamification/XPSidebar";

const hubCards = [
  {
    to: "/finsignal",
    icon: <TrendingUp className="h-6 w-6" />,
    title: "Market Literacy",
    desc: "AI-powered financial news intelligence — real-time sentiment analysis, market signals, and financial statement insights.",
    cta: "Explore Signals",
  },
  {
    to: "/learning-path",
    icon: <Route className="h-6 w-6" />,
    title: "Learning Path",
    desc: "Master 6 modules of strategy-driven investing — from price illusions to full portfolio thinking.",
    cta: "Start Learning",
  },
  {
    to: "/causal-lab",
    icon: <Network className="h-6 w-6" />,
    title: "CausalLab",
    desc: "Explore cause-and-effect chains in markets — trace how rate hikes, oil shocks, and earnings surprises propagate.",
    cta: "Open Lab",
  },
  {
    to: "/sandbox",
    icon: <FlaskConical className="h-6 w-6" />,
    title: "Sandbox",
    desc: "Build a real portfolio hands-on. Back-test your strategies with historical data across market regimes.",
    cta: "Open Sandbox",
  },
  {
    to: "/scenarios",
    icon: <Compass className="h-6 w-6" />,
    title: "Scenarios",
    desc: "Predict and stress-test the market. Simulate crises — dot-com busts, flash crashes — and see how your decisions hold up.",
    cta: "Run Scenarios",
  },
  {
    to: "/account",
    icon: <User className="h-6 w-6" />,
    title: "Investor Hub",
    desc: "Track your XP, badges, streak, and investment ability analysis all in one place.",
    cta: "View Profile",
  },
];

const Index = () => {
  const { state } = useGamification();

  if (!state.avatarId) return <Navigate to="/onboarding" replace />;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex gap-8 items-start">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary mb-2">
                Education-First Investing
              </p>
              <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-3">
                Learn <em className="text-gradient-warm not-italic">why</em> strategies work
              </h1>
              <p className="text-muted-foreground max-w-xl">
                A structured path that teaches you to think in strategies and environments.
              </p>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {hubCards.map((card, i) => (
                <motion.div
                  key={card.to}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * i, duration: 0.4 }}
                >
                  <Link
                    to={card.to}
                    className="group flex flex-col justify-between rounded-xl border border-border bg-gradient-card p-5 h-full transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                  >
                    <div>
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                        {card.icon}
                      </div>
                      <h2 className="font-serif text-lg text-foreground mb-1">{card.title}</h2>
                      <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
                    </div>
                    <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                      {card.cta}
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="hidden lg:block flex-shrink-0">
            <GamificationSidebar />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;