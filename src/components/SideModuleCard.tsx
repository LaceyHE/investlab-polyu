import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface SideModuleCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  variant: "sandbox" | "stress";
  locked?: boolean;
  to?: string;
}

const SideModuleCard = ({ title, description, icon, variant, locked = false }: SideModuleCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-xl border p-6 transition-all duration-300 ${
        locked
          ? "border-border opacity-60 cursor-not-allowed"
          : variant === "sandbox"
          ? "border-teal/20 hover:border-teal/40 glow-teal cursor-pointer"
          : "border-primary/20 hover:border-primary/40 glow-warm cursor-pointer"
      }`}
    >
      <div className={`absolute top-0 right-0 h-32 w-32 rounded-full blur-3xl opacity-10 ${
        variant === "sandbox" ? "bg-teal" : "bg-primary"
      }`} />
      <div className="relative">
        <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${
          variant === "sandbox" ? "bg-teal/15 text-teal" : "bg-primary/15 text-primary"
        }`}>
          {icon}
        </div>
        <h3 className="font-serif text-lg text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        {locked && (
          <p className="mt-3 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
            Complete core lessons to unlock
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default SideModuleCard;
