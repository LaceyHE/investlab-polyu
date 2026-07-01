import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useGamification, AVATARS } from '@/contexts/GamificationContext';

const SIZES = {
  xs: 'w-7 h-7 text-sm',
  sm: 'w-8 h-8 text-base',
  md: 'w-10 h-10 text-xl',
  lg: 'w-14 h-14 text-3xl',
  xl: 'w-20 h-20 text-4xl',
};

interface AvatarDisplayProps {
  size?: keyof typeof SIZES;
  showRing?: boolean;
  className?: string;
  fallbackInitials?: string;
}

export function AvatarDisplay({ size = 'md', showRing = true, className = '', fallbackInitials }: AvatarDisplayProps) {
  const { currentAvatar } = useGamification();
  if (!currentAvatar) {
    return (
      <div className={`${SIZES[size]} rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-500 text-xs flex-shrink-0 ${className}`}>
        {fallbackInitials ?? '?'}
      </div>
    );
  }
  return (
    <div
      className={`${SIZES[size]} rounded-full flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ background: currentAvatar.bg, boxShadow: showRing ? `0 0 0 2px ${currentAvatar.color}` : undefined }}
    >
      {currentAvatar.emoji}
    </div>
  );
}

interface AvatarPickerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AvatarPicker({ isOpen, onClose }: AvatarPickerProps) {
  const { state, setAvatar } = useGamification();
  const [selectedId, setSelectedId] = useState(state.avatarId ?? '');
  const [name, setName] = useState(state.displayName);

  const handleSave = () => {
    if (selectedId) setAvatar(selectedId, name.trim() || state.displayName || 'Investor');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}>
            <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-5" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold">Choose your persona</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {AVATARS.map(av => (
                  <button key={av.id} onClick={() => setSelectedId(av.id)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${selectedId === av.id ? 'border-violet-500 bg-violet-50 dark:bg-violet-950' : 'border-gray-100 dark:border-gray-800 hover:border-violet-300'}`}
                  >
                    <span className="text-2xl">{av.emoji}</span>
                    <span className="text-[10px] text-gray-500 leading-tight text-center">{av.name.replace('The ', '')}</span>
                    {selectedId === av.id && <Check className="w-3 h-3 text-violet-600" />}
                  </button>
                ))}
              </div>
              {selectedId && <p className="text-xs text-center text-gray-400 mb-3">{AVATARS.find(a => a.id === selectedId)?.desc}</p>}
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Your display name" maxLength={24}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-violet-400/40"
              />
              <button onClick={handleSave} disabled={!selectedId}
                className="w-full rounded-xl py-2.5 bg-violet-600 text-white font-medium text-sm hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Save
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}