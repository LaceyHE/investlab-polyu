import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useGamification } from '@/contexts/GamificationContext';

export function XPToastContainer() {
  const { state, dismissToast } = useGamification();
  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {state.pendingToasts.map(toast => (
          <XPToast key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function XPToast({ toast, onDismiss }: {
  toast: { id: number; amount: number; reason: string; leveledUp?: boolean; newLevel?: number; isBadge?: boolean; badge?: { icon: string; name: string } };
  onDismiss: () => void;
}) {
  useEffect(() => { const t = setTimeout(onDismiss, 2800); return () => clearTimeout(t); }, [onDismiss]);
  return (
    <motion.div
      initial={{ opacity: 0, x: 60, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 60, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="pointer-events-auto flex items-center gap-2.5 rounded-xl px-4 py-2.5 shadow-lg text-sm font-medium"
      style={{ background: toast.leveledUp ? 'linear-gradient(135deg, #6C47FF, #0EA5E9)' : 'rgba(108,71,255,0.95)', color: '#fff', backdropFilter: 'blur(8px)' }}
    >
      {toast.isBadge && toast.badge
        ? <><span className="text-lg">{toast.badge.icon}</span><span>{toast.badge.name} unlocked!</span></>
        : toast.leveledUp
          ? <><span className="text-lg">🎉</span><span>Level {toast.newLevel} reached!</span></>
          : <><Zap className="w-4 h-4 text-yellow-300 flex-shrink-0" /><span>+{toast.amount} XP</span><span className="text-white/70 text-xs font-normal truncate max-w-[140px]">{toast.reason}</span></>
      }
    </motion.div>
  );
}