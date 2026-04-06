import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info, Lightbulb, X } from "lucide-react";
import type { PushMessage } from "@/hooks/usePushMessages";

interface PushMessagesProps {
  messages: PushMessage[];
  onDismiss: (id: string) => void;
}

const iconMap = {
  warning: AlertTriangle,
  info: Info,
  suggestion: Lightbulb,
};

const styleMap = {
  warning: 'border-warm/30 bg-warm/5 text-warm',
  info: 'border-primary/30 bg-primary/5 text-primary',
  suggestion: 'border-teal/30 bg-teal/5 text-teal',
};

const PushMessages = ({ messages, onDismiss }: PushMessagesProps) => {
  if (messages.length === 0) return null;

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {messages.slice(0, 3).map(msg => {
          const Icon = iconMap[msg.type];
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`rounded-lg border p-3 flex items-start gap-2.5 ${styleMap[msg.type]}`}
            >
              <Icon className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-foreground flex-1 leading-relaxed">{msg.text}</p>
              <button
                onClick={() => onDismiss(msg.id)}
                className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default PushMessages;
