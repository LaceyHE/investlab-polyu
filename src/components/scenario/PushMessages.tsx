import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info, Lightbulb, X, TrendingDown, TrendingUp, Activity, Flame } from "lucide-react";
import type { PushMessage, PushMessageType } from "@/hooks/usePushMessages";

interface PushMessagesProps {
  messages: PushMessage[];
  onDismiss: (id: string) => void;
}

const iconMap: Record<PushMessageType, React.ElementType> = {
  warning: AlertTriangle,
  info: Info,
  suggestion: Lightbulb,
  crash: TrendingDown,
  rally: TrendingUp,
  volatility: Activity,
  bubble: Flame,
};

const styleMap: Record<PushMessageType, string> = {
  warning: 'border-warm/30 bg-warm/5 text-warm',
  info: 'border-primary/30 bg-primary/5 text-primary',
  suggestion: 'border-teal/30 bg-teal/5 text-teal',
  crash: 'border-destructive/30 bg-destructive/5 text-destructive',
  rally: 'border-teal/30 bg-teal/5 text-teal',
  volatility: 'border-warm/30 bg-warm/5 text-warm',
  bubble: 'border-destructive/30 bg-destructive/5 text-destructive',
};

const progressColorMap: Record<PushMessageType, string> = {
  warning: 'bg-warm',
  info: 'bg-primary',
  suggestion: 'bg-teal',
  crash: 'bg-destructive',
  rally: 'bg-teal',
  volatility: 'bg-warm',
  bubble: 'bg-destructive',
};

const ProgressBar = ({ message }: { message: PushMessage }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = message.timestamp;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, ((message.ttl - elapsed) / message.ttl) * 100);
      setProgress(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [message.timestamp, message.ttl]);

  return (
    <div className="h-0.5 w-full rounded-full bg-secondary/50 mt-2 overflow-hidden">
      <div
        className={`h-full rounded-full transition-none ${progressColorMap[message.type]}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

const PushMessages = ({ messages, onDismiss }: PushMessagesProps) => {
  if (messages.length === 0) return null;

  return (
    <div className="fixed inset-x-0 top-20 z-50 flex flex-col items-center pointer-events-none">
      <AnimatePresence mode="popLayout">
        {messages.slice(0, 3).map(msg => {
          const Icon = iconMap[msg.type];
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`rounded-xl border p-3 px-4 mb-2 flex flex-col max-w-md w-full shadow-lg backdrop-blur-sm pointer-events-auto ${styleMap[msg.type]}`}
            >
              <div className="flex items-start gap-2.5">
                <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-foreground flex-1 leading-relaxed">{msg.text}</p>
                <button
                  onClick={() => onDismiss(msg.id)}
                  className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <ProgressBar message={msg} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default PushMessages;
