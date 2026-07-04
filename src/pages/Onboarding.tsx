import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { AVATARS, useGamification } from "@/contexts/GamificationContext";
import { Button } from "@/components/ui/button";

const Onboarding = () => {
  const { setAvatar, setExperienceLevel, state } = useGamification();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string>(state.avatarId ?? "owl");
  const [displayName, setDisplayName] = useState(state.displayName ?? "");
  const [experienceLevel, setExperienceLevelInput] = useState<"novice" | "experienced" | null>(state.experienceLevel ?? null);

  const handleStart = () => {
    setAvatar(selectedId, displayName.trim() || "Investor");
    setExperienceLevel(experienceLevel ?? "novice");
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
    </div>
  );
};

export default Onboarding;