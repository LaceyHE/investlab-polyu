import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle2 } from "lucide-react";

export interface QuizQuestion {
  q: string;
  options: string[];
  /** Index of the correct option. Vary this across questions — don't always use the same slot. */
  correct: number;
}

interface KnowledgeCheckProps {
  questions: QuizQuestion[];
  /** When true, the quiz is hidden behind a hint until the parent unlocks it. */
  locked?: boolean;
  lockedHint?: string;
  /** Fires whenever the answered/all-correct state changes, so the parent can gate "Continue". */
  onResult?: (result: { allAnswered: boolean; allCorrect: boolean }) => void;
}

const KnowledgeCheck = ({ questions, locked = false, lockedHint, onResult }: KnowledgeCheckProps) => {
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const allAnswered = Object.keys(answers).length === questions.length;
  const allCorrect = allAnswered && questions.every((q, i) => answers[i] === q.correct);

  useEffect(() => {
    onResult?.({ allAnswered, allCorrect });
  }, [allAnswered, allCorrect, onResult]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="font-serif text-2xl text-foreground">Quick Knowledge Check</h2>
      </div>

      {locked ? (
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {lockedHint ?? "Finish the section above to unlock the knowledge check."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((item, qi) => {
            const picked = answers[qi];
            const answered = picked !== undefined;
            return (
              <div key={qi} className="rounded-xl border border-border bg-gradient-card p-6">
                <p className="text-foreground font-medium mb-4">{qi + 1}. {item.q}</p>
                <div className="space-y-2">
                  {item.options.map((opt, oi) => {
                    const isPicked = picked === oi;
                    const isCorrect = oi === item.correct;
                    let style = "border-border hover:border-muted-foreground/40";
                    if (answered && isPicked && isCorrect) style = "border-teal/50 bg-teal/10";
                    else if (answered && isPicked && !isCorrect) style = "border-destructive/50 bg-destructive/10";
                    else if (answered && isCorrect) style = "border-teal/40 bg-teal/5";
                    return (
                      <button
                        key={oi}
                        disabled={answered}
                        onClick={() => setAnswers((p) => ({ ...p, [qi]: oi }))}
                        className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all ${style} ${answered ? "cursor-default" : "cursor-pointer"}`}
                      >
                        <span className="font-medium text-muted-foreground">{String.fromCharCode(65 + oi)}</span>
                        <span className="text-foreground">{opt}</span>
                        {answered && isCorrect && <CheckCircle2 className="h-4 w-4 text-teal ml-auto shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {allAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border p-5 ${allCorrect ? "border-teal/30 bg-teal/5" : "border-primary/20 bg-primary/5"}`}
            >
              <p className="text-sm text-foreground leading-relaxed">
                {allCorrect
                  ? "🎉 All correct — you've got it. Ready to move on."
                  : "Close — review the highlighted answers above, then you'll be ready to continue."}
              </p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default KnowledgeCheck;
