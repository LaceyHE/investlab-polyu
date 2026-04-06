import { motion } from "framer-motion";
import { BookOpen, AlertTriangle, Lightbulb, HelpCircle } from "lucide-react";
import type { ScenarioPreset } from "@/data/scenario-presets";

interface LearningOutcomesProps {
  scenario: ScenarioPreset;
}

const LearningOutcomes = ({ scenario }: LearningOutcomesProps) => {
  const { learningOutcomes } = scenario;

  return (
    <div className="space-y-4">
      <h3 className="font-serif text-lg text-foreground flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-primary" />
        Learning Outcomes
      </h3>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card p-5"
      >
        <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-warm" />
          What Happened
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {learningOutcomes.whatHappened}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-border bg-card p-5"
      >
        <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
          <Lightbulb className="h-3.5 w-3.5 text-teal" />
          Key Takeaways
        </h4>
        <ul className="space-y-2">
          {learningOutcomes.keyTakeaways.map((takeaway, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-primary mt-0.5">•</span>
              {takeaway}
            </li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-primary/20 bg-primary/5 p-5"
      >
        <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
          <HelpCircle className="h-3.5 w-3.5 text-primary" />
          Reflection
        </h4>
        <p className="text-sm text-muted-foreground italic leading-relaxed">
          "{learningOutcomes.reflectionQuestion}"
        </p>
      </motion.div>
    </div>
  );
};

export default LearningOutcomes;
