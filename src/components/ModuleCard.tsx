import { motion } from "framer-motion";
import { Lock, CheckCircle2, Circle, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";

interface ModuleCardProps {
  index: number;
  title: string;
  description: string;
  icon: ReactNode;
  status: "locked" | "available" | "completed" | "active";
  to?: string;
  delay?: number;
}

const statusStyles = {
  locked: "opacity-50 cursor-not-allowed shadow-none",
  available: "cursor-pointer hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_hsl(var(--foreground))]",
  active: "cursor-pointer bg-accent/10 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_hsl(var(--foreground))]",
  completed: "cursor-pointer bg-teal/5 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_hsl(var(--foreground))]",
};

const ModuleCard = ({ index, title, description, icon, status, to = "#", delay = 0 }: ModuleCardProps) => {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.5 }}
      className={`group relative rounded-none border-2 border-foreground bg-card p-6 shadow-[3px_3px_0_hsl(var(--foreground))] transition-all duration-100 ${statusStyles[status]}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-none border-2 border-foreground ${
            status === "completed" ? "bg-teal/15 text-teal" :
            status === "active" ? "bg-primary/15 text-primary" :
            "bg-secondary text-muted-foreground"
          }`}>
            {icon}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
              Module {index}
            </p>
            <h3 className="font-serif text-lg text-foreground mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </div>
        </div>
        <div className="shrink-0 ml-4">
          {status === "locked" && <Lock className="h-4 w-4 text-muted-foreground/50" />}
          {status === "completed" && <CheckCircle2 className="h-5 w-5 text-teal" />}
          {status === "active" && <ChevronRight className="h-5 w-5 text-primary group-hover:translate-x-0.5 transition-transform" />}
          {status === "available" && <Circle className="h-4 w-4 text-muted-foreground/30" />}
        </div>
      </div>
    </motion.div>
  );

  if (status === "locked") return content;
  return <Link to={to}>{content}</Link>;
};

export default ModuleCard;
