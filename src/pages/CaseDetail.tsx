// src/pages/CaseDetail.tsx
import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Globe, BookOpen, AlertCircle, Lightbulb, MessageCircle } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { getCaseById } from "@/data/cases";

const categoryLabels: Record<string, string> = {
  crash: "Market Crash",
  bubble: "Bubble",
  behavioral: "Behavioral",
  fraud: "Fraud",
  macro: "Macro Event",
  company: "Company Event",
};

const difficultyColors: Record<string, string> = {
  beginner: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  intermediate: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  advanced: "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

const CaseDetail = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const caseData = caseId ? getCaseById(caseId) : undefined;

  if (!caseData) {
    return <Navigate to="/causal-lab" replace />;
  }

  return (
    <AppLayout>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-dark" />
        <div className="absolute top-0 right-1/4 h-[300px] w-[300px] rounded-full bg-primary/5 blur-3xl" />

        <div className="container relative z-10 py-12 md:py-16">
          {/* Back link */}
          <Link
            to="/causal-lab"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Case Library
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Tags row */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="text-xs font-medium uppercase tracking-wider text-primary">
                {categoryLabels[caseData.category]}
              </span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${difficultyColors[caseData.difficulty]}`}>
                {caseData.difficulty.charAt(0).toUpperCase() + caseData.difficulty.slice(1)}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Globe className="h-3 w-3" />
                {caseData.region}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {caseData.year}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-3xl md:text-5xl leading-tight text-foreground max-w-4xl">
              {caseData.title}
            </h1>
            <p className="mt-3 text-lg text-muted-foreground max-w-3xl italic">
              {caseData.subtitle}
            </p>

            {/* Tags */}
            <div className="mt-6 flex flex-wrap gap-2">
              {caseData.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary/60 text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Body */}
      <section>
        <div className="container max-w-5xl py-12">
          <div className="grid md:grid-cols-3 gap-12">
            {/* Main column */}
            <div className="md:col-span-2 space-y-12">
              {/* Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="rounded-xl border border-border bg-gradient-card p-6"
              >
                <p className="text-base text-foreground leading-relaxed font-medium">
                  {caseData.summary}
                </p>
              </motion.div>

              {/* Background */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
              >
                <h2 className="font-serif text-2xl text-foreground mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Background
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                  {caseData.background}
                </p>
              </motion.section>

              {/* Timeline */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <h2 className="font-serif text-2xl text-foreground mb-6">
                  Causal Timeline
                </h2>
                <ol className="relative border-l-2 border-primary/30 pl-6 space-y-8">
                  {caseData.timeline.map((event, i) => (
                    <li key={event.id} className="relative">
                      {/* Dot */}
                      <span className="absolute -left-[33px] top-1 h-4 w-4 rounded-full bg-primary border-4 border-background" />
                      <p className="text-xs font-mono uppercase tracking-wider text-primary mb-1">
                        {event.date}
                      </p>
                      <h3 className="font-serif text-lg text-foreground mb-2">
                        {event.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {event.description}
                      </p>
                    </li>
                  ))}
                </ol>
              </motion.section>

              {/* Root Causes */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
              >
                <h2 className="font-serif text-2xl text-foreground mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-rose-500" />
                  Root Causes
                </h2>
                <ul className="space-y-3">
                  {caseData.rootCauses.map((cause, i) => (
                    <li
                      key={i}
                      className="flex gap-3 p-4 rounded-lg border border-border bg-card/30"
                    >
                      <span className="text-rose-500 font-mono text-sm font-medium shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm text-foreground leading-relaxed">{cause}</span>
                    </li>
                  ))}
                </ul>
              </motion.section>

              {/* Key Lessons */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <h2 className="font-serif text-2xl text-foreground mb-4 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Key Lessons
                </h2>
                <ul className="space-y-3">
                  {caseData.keyLessons.map((lesson, i) => (
                    <li
                      key={i}
                      className="flex gap-3 p-4 rounded-lg border border-primary/20 bg-primary/5"
                    >
                      <span className="text-primary font-serif text-lg leading-none shrink-0">★</span>
                      <span className="text-sm text-foreground leading-relaxed">{lesson}</span>
                    </li>
                  ))}
                </ul>
              </motion.section>

              {/* Discussion */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
              >
                <h2 className="font-serif text-2xl text-foreground mb-4 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Discussion Questions
                </h2>
                <div className="space-y-3">
                  {caseData.discussionQuestions.map((q, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-lg border border-border bg-card/30"
                    >
                      <p className="text-sm text-muted-foreground italic leading-relaxed">
                        Q{i + 1}. {q}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.section>
            </div>

            {/* Sidebar */}
            <aside className="md:col-span-1">
              <div className="sticky top-24 space-y-4">
                <div className="rounded-xl border border-border bg-gradient-card p-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                    Case Info
                  </p>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Region</dt>
                      <dd className="text-foreground font-medium">{caseData.region}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Year</dt>
                      <dd className="text-foreground font-medium">{caseData.year}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Category</dt>
                      <dd className="text-foreground font-medium">{categoryLabels[caseData.category]}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Difficulty</dt>
                      <dd className="text-foreground font-medium capitalize">{caseData.difficulty}</dd>
                    </div>
                  </dl>
                </div>

                <Link
                  to="/causal-lab"
                  className="block w-full text-center px-4 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
                >
                  ← Browse all cases
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </AppLayout>
  );
};

export default CaseDetail;