// src/pages/CausalLab.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Search, Filter } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { cases, type CaseCategory, type CaseDifficulty } from "@/data/cases";

const categoryLabels: Record<CaseCategory, string> = {
  crash: "Market Crash",
  bubble: "Bubble",
  behavioral: "Behavioral",
  fraud: "Fraud",
  macro: "Macro Event",
  company: "Company Event",
};

const difficultyLabels: Record<CaseDifficulty, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const difficultyColors: Record<CaseDifficulty, string> = {
  beginner: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  intermediate: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  advanced: "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

const CausalLab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CaseCategory | "all">("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<CaseDifficulty | "all">("all");

  const filtered = cases.filter((c) => {
    const matchesSearch =
      searchQuery === "" ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || c.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "all" || c.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <AppLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-dark" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />

        <div className="container relative z-10 flex flex-col items-center py-16 md:py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Case Library
            </p>
            <h1 className="font-serif text-3xl md:text-5xl leading-tight text-foreground max-w-3xl">
              Learn from history's <em className="text-gradient-warm not-italic">defining moments</em>
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground leading-relaxed mx-auto">
              30 curated case studies on market crashes, bubbles, frauds, and behavioral pitfalls. Build pattern recognition by studying causal chains.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-t border-border">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Search */}
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search cases, tags, keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
              />
            </div>

            {/* Category filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as CaseCategory | "all")}
              className="px-4 py-2 rounded-lg border border-border bg-background/50 text-sm focus:outline-none focus:border-primary/50"
            >
              <option value="all">All Categories</option>
              {Object.entries(categoryLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>

            {/* Difficulty filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as CaseDifficulty | "all")}
              className="px-4 py-2 rounded-lg border border-border bg-background/50 text-sm focus:outline-none focus:border-primary/50"
            >
              <option value="all">All Levels</option>
              {Object.entries(difficultyLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* Result count */}
          <p className="mt-4 text-sm text-muted-foreground">
            Showing <span className="text-foreground font-medium">{filtered.length}</span> of {cases.length} cases
          </p>
        </div>
      </section>

      {/* Case Grid */}
      <section className="border-t border-border">
        <div className="container py-12">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <Filter className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No cases match your filters.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedDifficulty("all");
                }}
                className="mt-4 text-sm text-primary hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.4 }}
                >
                  <Link
                    to={`/causal-lab/case/${c.id}`}
                    className="group flex flex-col rounded-xl border border-border bg-gradient-card p-6 h-full transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                  >
                    {/* Top row: category + difficulty */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-medium uppercase tracking-wider text-primary">
                        {categoryLabels[c.category]}
                      </span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full border ${difficultyColors[c.difficulty]}`}>
                        {difficultyLabels[c.difficulty]}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-serif text-lg text-foreground mb-1 leading-snug">
                      {c.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      {c.region} · {c.year}
                    </p>

                    {/* Summary */}
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                      {c.summary}
                    </p>

                    {/* Tags */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {c.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary/50 text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="mt-5 pt-4 border-t border-border/50 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                      Study Case
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </AppLayout>
  );
};

export default CausalLab;
