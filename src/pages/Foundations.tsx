import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, ChevronRight, ChevronDown,
  Layers, Scale, TrendingUp, Boxes, Receipt, Hourglass,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useGamification } from "@/contexts/GamificationContext";
import ProgressBar from "@/components/ProgressBar";
import KnowledgeCheck, { type QuizQuestion } from "@/components/KnowledgeCheck";

/* ───────────── Foundation Lessons ───────────── */
const lessons = [
  {
    id: "asset-classes",
    icon: <Layers className="h-6 w-6" />,
    name: "What you can actually invest in",
    tagline: "Stocks, bonds, funds & ETFs",
    body: "A stock is a tiny slice of ownership in a company — if it grows, your slice is worth more. A bond is a loan you give to a company or government that pays you interest. A fund (or ETF) is a ready-made basket holding dozens or hundreds of stocks/bonds at once, so you don't have to pick them one by one.",
    why: "If you can't tell these apart, every strategy that comes later will sound like noise. This is the vocabulary of everything else.",
  },
  {
    id: "risk-return",
    icon: <Scale className="h-6 w-6" />,
    name: "Risk and return are joined at the hip",
    tagline: "No free lunch",
    body: "Higher potential returns ALWAYS come with higher risk of loss. A savings account is safe but barely grows; stocks can grow fast but can also drop 30% in a bad year. Anyone promising 'high returns, no risk' is either confused or lying.",
    why: "This single rule protects you from the #1 way beginners lose money: chasing 'guaranteed' high returns.",
  },
  {
    id: "compounding",
    icon: <TrendingUp className="h-6 w-6" />,
    name: "Compounding — your money earns money",
    tagline: "The 8th wonder",
    body: "When your returns themselves start earning returns, growth snowballs. $1,000 growing 8% a year becomes ~$2,160 in 10 years, ~$4,660 in 20, and ~$10,060 in 30 — without you adding a cent. The longer you stay invested, the more violent the curve bends upward.",
    why: "It's the strongest argument for starting early and staying patient — and it's the most counter-intuitive force in all of finance.",
  },
  {
    id: "diversification",
    icon: <Boxes className="h-6 w-6" />,
    name: "Don't put all your eggs in one basket",
    tagline: "The only free lunch",
    body: "Spreading money across many different investments means one bad pick can't wipe you out. If you own 50 companies and one collapses, you barely feel it. Own just one, and you've bet everything on it being right.",
    why: "Diversification is often called the only 'free lunch' in investing — you reduce risk without giving up much expected return.",
  },
  {
    id: "fees-inflation",
    icon: <Receipt className="h-6 w-6" />,
    name: "Fees and inflation quietly eat your returns",
    tagline: "The silent leaks",
    body: "A fund charging 2% a year doesn't sound like much, but over decades it can swallow a third of your gains. Inflation (rising prices) means cash sitting still actually LOSES buying power every year. Both are invisible day-to-day but huge over time.",
    why: "Beginners obsess over picking winners but ignore the leaks. Cutting a 2% fee to 0.1% can matter more than any stock pick.",
  },
  {
    id: "time-not-timing",
    icon: <Hourglass className="h-6 w-6" />,
    name: "Time in the market beats timing the market",
    tagline: "Stop trying to call the top",
    body: "Trying to buy at the exact bottom and sell at the exact top almost never works — even professionals fail at it. Missing just the 10 best days in the market over 20 years can cut your returns in half. Staying invested through the ups and downs usually wins.",
    why: "This corrects the single most dangerous beginner instinct: jumping in and out based on fear and headlines.",
  },
];

/* ───────────── Knowledge Check (answers deliberately spread across slots) ───────────── */
const quiz: QuizQuestion[] = [
  {
    q: "A friend offers an investment promising 'guaranteed 20% per year, zero risk.' What's the right read?",
    options: [
      "Be very skeptical — high return with no risk doesn't exist",
      "Great deal — put in as much as you can",
      "Safe, because they guaranteed it in writing",
    ],
    correct: 0,
  },
  {
    q: "You have $5,000 to invest. Which is generally the lower-risk approach?",
    options: [
      "Put the whole $5,000 into one exciting company",
      "Wait for the perfect day, then buy a single stock",
      "Spread it across a fund holding many companies",
    ],
    correct: 2,
  },
  {
    q: "Why does starting to invest early matter so much?",
    options: [
      "Stocks are cheaper when you're young",
      "Compounding gives your returns more time to snowball",
      "Brokerage fees are lower for younger investors",
    ],
    correct: 1,
  },
];

const Foundations = () => {
  const { markComplete } = useUserProgress();
  const { completeModule } = useGamification();
  const tracked = useRef(false);

  const [openLesson, setOpenLesson] = useState<string | null>(null);
  const [readLessons, setReadLessons] = useState<string[]>([]);
  const [quizPassed, setQuizPassed] = useState(false);

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      markComplete("module_view", "foundations");
    }
  }, [markComplete]);

  const toggleLesson = (id: string) => {
    setOpenLesson((prev) => (prev === id ? null : id));
    if (!readLessons.includes(id)) {
      const next = [...readLessons, id];
      setReadLessons(next);
      markComplete("knowledge_point", id, { module: 0 });
    }
  };

  const allRead = readLessons.length === lessons.length;
  const canContinue = allRead && quizPassed;

  return (
    <AppLayout>
      <div className="container max-w-4xl py-12 md:py-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/learning-path" className="hover:text-foreground transition-colors">
            Learning Path
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Foundations</span>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary mb-3">
            Start Here · Foundations
          </p>
          <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
            Investing From Zero
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-2xl">
            Six plain-language ideas that everything else builds on. No jargon, no stock picking — just the bedrock concepts that turn market noise into something you can actually reason about. Read each card, then prove it with a quick check.
          </p>
          <div className="mt-6 max-w-sm">
            <ProgressBar current={readLessons.length} total={lessons.length} label="Concepts read" />
          </div>
        </motion.div>

        {/* Lessons */}
        <div className="mb-12 space-y-4">
          <h2 className="font-serif text-2xl text-foreground mb-2">
            The Six Bedrock Ideas
          </h2>
          {lessons.map((l, i) => {
            const isOpen = openLesson === l.id;
            const isRead = readLessons.includes(l.id);
            return (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
                className={`rounded-xl border bg-gradient-card transition-all ${
                  isOpen ? "border-primary/40" : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <button
                  onClick={() => toggleLesson(l.id)}
                  className="flex w-full items-start gap-4 p-6 text-left"
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${
                    isRead ? "bg-teal/10 text-teal" : "bg-primary/10 text-primary"
                  }`}>
                    {isRead ? <CheckCircle2 className="h-6 w-6" /> : l.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-serif text-lg text-foreground">{l.name}</h3>
                      <span className="text-xs font-medium text-muted-foreground px-2 py-0.5 rounded-full bg-secondary">
                        {l.tagline}
                      </span>
                    </div>
                    {!isOpen && (
                      <p className="text-sm text-muted-foreground">Tap to read →</p>
                    )}
                  </div>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 md:pl-[5.5rem]">
                        <p className="text-sm text-foreground leading-relaxed mb-4">{l.body}</p>
                        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                          <p className="text-xs font-medium uppercase tracking-[0.15em] text-primary mb-1">
                            Why it matters
                          </p>
                          <p className="text-sm text-muted-foreground leading-relaxed">{l.why}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Knowledge Check */}
        <div className="mb-12">
          <KnowledgeCheck
            questions={quiz}
            locked={!allRead}
            lockedHint={`📖 Read all six concepts above to unlock the knowledge check. ${readLessons.length}/${lessons.length} done.`}
            onResult={({ allCorrect }) => setQuizPassed(allCorrect)}
          />
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
          {canContinue ? (
            <Link
              to="/module/1"
              onClick={() => { markComplete("module_complete", "foundations"); completeModule("foundations", 5, 5); }}
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-warm px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20"
            >
              Continue to Module 1
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-xl bg-secondary px-6 py-3 text-sm font-semibold text-muted-foreground cursor-not-allowed">
              Continue to Module 1
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Foundations;
