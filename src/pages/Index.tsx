import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Route, Network, FlaskConical, Compass, User } from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { useGamification } from "@/contexts/GamificationContext";
import { GamificationSidebar } from "@/components/gamification/XPSidebar";

const hubCards = [
  {
    to: "/learning-path",
    icon: <Route className="h-6 w-6" />,
    title: "Learning Path",
    desc: "Master 6 modules of strategy-driven investing — from price illusions to full portfolio thinking.",
    cta: "Start Learning",
    accent: "var(--accent-violet)",
  },
  {
    to: "/finsignal",
    icon: <TrendingUp className="h-6 w-6" />,
    title: "Market Literacy",
    desc: "AI-powered financial news intelligence — real-time sentiment analysis, market signals, and financial statement insights.",
    cta: "Explore Signals",
    accent: "var(--accent-blue)",
  },
  {
    to: "/causal-lab",
    icon: <Network className="h-6 w-6" />,
    title: "CausalLab",
    desc: "Explore cause-and-effect chains in markets — trace how rate hikes, oil shocks, and earnings surprises propagate.",
    cta: "Open Lab",
    accent: "var(--accent-orange)",
  },
  {
    to: "/sandbox",
    icon: <FlaskConical className="h-6 w-6" />,
    title: "Sandbox",
    desc: "Build a real portfolio hands-on. Back-test your strategies with historical data across market regimes.",
    cta: "Open Sandbox",
    accent: "var(--accent-yellow)",
  },
  {
    to: "/scenarios",
    icon: <Compass className="h-6 w-6" />,
    title: "Scenarios",
    desc: "Predict and stress-test the market. Simulate crises — dot-com busts, flash crashes — and see how your decisions hold up.",
    cta: "Run Scenarios",
    accent: "var(--accent-pink)",
  },
  {
    to: "/account",
    icon: <User className="h-6 w-6" />,
    title: "Investor Hub",
    desc: "Track your XP, badges, streak, and investment ability analysis all in one place.",
    cta: "View Profile",
    accent: "var(--accent-green)",
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
              className="mb-10"
            >
              <span className="inline-block -rotate-2 rounded-none border-2 border-foreground bg-[var(--accent-green)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-black shadow-[2px_2px_0_hsl(var(--foreground))]">
                Education-First Investing
              </span>
              <h1 className="mt-5 font-serif text-4xl md:text-6xl font-bold uppercase leading-[0.95] tracking-tight text-foreground">
                Learn <span className="bg-[var(--accent-yellow)] px-2 text-black">why</span> strategies work
              </h1>
              <p className="mt-4 text-muted-foreground max-w-xl normal-case">
                A structured path that teaches you to think in strategies and environments.
              </p>
              <div className="mt-6 h-2 w-full max-w-md border-2 border-foreground bg-[var(--accent-blue)]" />
            </motion.div>

            {/* Scrolling tape line — brutalist/pixel signature */}
            <div className="-rotate-1 border-y-2 border-foreground bg-[var(--accent-yellow)] text-black overflow-hidden mb-8">
              <div className="flex w-max animate-[marquee_20s_linear_infinite] gap-6 py-2 whitespace-nowrap text-sm font-bold uppercase tracking-wide">
                {Array.from({ length: 10 }).map((_, i) => (
                  <span key={i} className="inline-flex items-center gap-6">
                    Learn Why Strategies Work <span aria-hidden>★</span> Think In Environments <span aria-hidden>★</span> Invest Smarter <span aria-hidden>★</span>
                  </span>
                ))}
              </div>
            </div>

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
                    className="group flex flex-col justify-between rounded-none border-2 border-foreground bg-card p-5 h-full transition-all duration-100 shadow-[3px_3px_0_hsl(var(--foreground))] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_hsl(var(--foreground))]"
                  >
                    <div>
                      <div
                        className="mb-3 flex h-10 w-10 items-center justify-center rounded-none border-2 border-foreground text-foreground"
                        style={{ backgroundColor: card.accent }}
                      >
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

          {/* Right sidebar — divided from main content with a hard pixel rule */}
          <div className="hidden lg:block flex-shrink-0 border-l-2 border-foreground pl-8">
            <GamificationSidebar />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;