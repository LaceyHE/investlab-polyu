import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Route, TrendingUp, Network, FlaskConical, Compass } from "lucide-react";
import { AVATARS, useGamification } from "@/contexts/GamificationContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const GUIDE_SECTIONS = [
  {
    group: "1. Learn the basics",
    subtitle: "Start here to build your knowledge.",
    items: [
      {
        icon: <Route className="h-5 w-5" />,
        title: "Learning Path",
        desc: "6 short modules that teach investing step by step. New here? Start with this.",
      },
      {
        icon: <TrendingUp className="h-5 w-5" />,
        title: "Market Literacy",
        desc: "Read real financial news and see what it means, with easy AI explanations.",
      },
      {
        icon: <Network className="h-5 w-5" />,
        title: "CausalLab",
        desc: "See how one event (like a rate hike) causes another. Learn how markets react.",
      },
    ],
  },
  {
    group: "2. Practice like a real investor",
    subtitle: "Try what you learned — no real money needed.",
    items: [
      {
        icon: <FlaskConical className="h-5 w-5" />,
        title: "Sandbox",
        desc: "Build your own portfolio and test your strategy against real past market data.",
      },
      {
        icon: <Compass className="h-5 w-5" />,
        title: "Scenarios",
        desc: "Face market crises (like a crash) and see how your choices would hold up.",
      },
    ],
  },
];

const Onboarding = () => {
  const { setAvatar, setExperienceLevel, state } = useGamification();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string>(state.avatarId ?? "owl");
  const [displayName, setDisplayName] = useState(state.displayName ?? "");
  const [experienceLevel, setExperienceLevelInput] = useState<"novice" | "experienced" | null>(state.experienceLevel ?? null);
  const [showGuide, setShowGuide] = useState(false);

  const handleStart = () => {
    setAvatar(selectedId, displayName.trim() || "Investor");
    setExperienceLevel(experienceLevel ?? "novice");
    setShowGuide(true);
  };

  const handleEnter = () => {
    navigate("/", { replace: true });
  };

  const handleSkip = () => {
    setAvatar("owl", "Investor");
    setExperienceLevel("novice");
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-5">
            <span className="text-3xl">📈</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-3">
            Welcome to <span className="text-gradient-warm">InvestLab</span>
          </h1>
          <p className="text-muted-foreground text-base max-w-sm mx-auto">
            Choose an avatar that represents your investing style, then start learning.
          </p>
        </div>

        {/* Avatar grid */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {AVATARS.map((avatar) => {
            const isSelected = selectedId === avatar.id;
            return (
              <motion.button
                key={avatar.id}
                onClick={() => setSelectedId(avatar.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                    : "border-border bg-card hover:border-primary/30 hover:bg-secondary/30"
                }`}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-sm"
                  style={{ background: avatar.bg }}
                >
                  {avatar.emoji}
                </div>
                <span className="text-[10px] font-medium text-muted-foreground leading-tight text-center">
                  {avatar.name.replace("The ", "")}
                </span>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                  >
                    <span className="text-[10px] text-white font-bold">✓</span>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Selected avatar description */}
        {selectedId && (() => {
          const av = AVATARS.find(a => a.id === selectedId);
          return av ? (
            <motion.div
              key={av.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40 border border-border mb-6"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: av.bg }}
              >
                {av.emoji}
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{av.name}</div>
                <div className="text-xs text-muted-foreground">{av.desc}</div>
              </div>
            </motion.div>
          ) : null;
        })()}

        {/* Experience level */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-foreground mb-2">
            Are you new to investing?
          </label>
          <div className="grid grid-cols-2 gap-3">
            {([
              { id: "novice" as const, label: "I'm a beginner", desc: "Walk me through it step by step" },
              { id: "experienced" as const, label: "I have some experience", desc: "Let me jump around freely" },
            ]).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setExperienceLevelInput(opt.id)}
                className={`text-left p-3 rounded-xl border-2 transition-all ${
                  experienceLevel === opt.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/30"
                }`}
              >
                <div className="text-sm font-semibold text-foreground">{opt.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Display name input */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-foreground mb-2">
            Your name <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Alex the Investor"
            maxLength={30}
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleStart}
            className="w-full h-11 text-base font-semibold"
            disabled={!selectedId || !experienceLevel}
          >
            Start Learning
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <button
            onClick={handleSkip}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
          >
            Skip for now →
          </button>
        </div>
      </motion.div>

      {/* Quick guide modal — shown after picking avatar, before entering the site */}
      <Dialog open={showGuide} onOpenChange={setShowGuide}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              How <span className="text-gradient-warm">InvestLab</span> works
            </DialogTitle>
            <DialogDescription className="text-sm">
              InvestLab has two simple parts: first you <strong>learn</strong>, then
              you <strong>practice</strong>. Here is a quick tour so you know where to go.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 mt-2">
            {GUIDE_SECTIONS.map((section) => (
              <div key={section.group}>
                <div className="mb-2">
                  <h3 className="text-sm font-semibold text-foreground">{section.group}</h3>
                  <p className="text-xs text-muted-foreground">{section.subtitle}</p>
                </div>
                <div className="space-y-2">
                  {section.items.map((item) => (
                    <div
                      key={item.title}
                      className="flex items-start gap-3 p-3 rounded-xl bg-secondary/40 border border-border"
                    >
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">{item.title}</div>
                        <div className="text-xs text-muted-foreground leading-relaxed">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <p className="text-xs text-muted-foreground">
              Tip: as you learn and practice, you earn <strong>XP</strong> and{" "}
              <strong>badges</strong>. You can check your progress anytime in the{" "}
              <strong>Investor Hub</strong>.
            </p>
          </div>

          <Button onClick={handleEnter} className="w-full h-11 text-base font-semibold mt-2">
            Got it — let's start
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Onboarding;