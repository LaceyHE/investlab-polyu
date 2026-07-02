import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";

interface SideModuleCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  variant: "sandbox" | "stress";
  locked?: boolean;
  to?: string;
}

const SideModuleCard = ({ title, description, icon, variant, locked = false, to }: SideModuleCardProps) => {
  const card = (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-none border-2 border-foreground p-6 shadow-[3px_3px_0_hsl(var(--foreground))] transition-all duration-100 ${
        locked
          ? "opacity-60 cursor-not-allowed shadow-none"
          : variant === "sandbox"
          ? "bg-teal/5 cursor-pointer hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_hsl(var(--foreground))]"
          : "bg-primary/5 cursor-pointer hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_hsl(var(--foreground))]"
      }`}
    >
      <div className="relative">
        <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-none border-2 border-foreground ${
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

  if (!locked && to) return <Link to={to}>{card}</Link>;
  return card;
};

export default SideModuleCard;
