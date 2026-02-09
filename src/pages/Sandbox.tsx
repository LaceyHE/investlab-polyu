import AppLayout from "@/components/AppLayout";
import { FlaskConical, Lock } from "lucide-react";
import { motion } from "framer-motion";

const Sandbox = () => (
  <AppLayout>
    <div className="container py-20 md:py-32 text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal/10">
          <FlaskConical className="h-8 w-8 text-teal" />
        </div>
        <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-3">Free Sandbox Portfolio</h1>
        <p className="text-muted-foreground max-w-lg mx-auto mb-6">
          An open experimentation space using real stock universes with all strategy constraints active. Test, iterate, and reinforce what you've learned.
        </p>
        <div className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" />
          Complete core learning modules to unlock
        </div>
      </motion.div>
    </div>
  </AppLayout>
);

export default Sandbox;
