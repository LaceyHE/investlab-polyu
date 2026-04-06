import { useState, useEffect } from "react";
import { Play, Pause, SkipForward } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import type { ScenarioEvent } from "@/data/scenario-presets";

interface TimelineScrubberProps {
  currentIndex: number;
  totalDates: number;
  currentDate: string;
  startDate: string;
  endDate: string;
  isPlaying: boolean;
  playSpeed: number;
  onScrub: (index: number) => void;
  onTogglePlay: () => void;
  onSetSpeed: (speed: number) => void;
  currentEvent?: ScenarioEvent | null;
}

const TimelineScrubber = ({
  currentIndex,
  totalDates,
  currentDate,
  startDate,
  endDate,
  isPlaying,
  playSpeed,
  onScrub,
  onTogglePlay,
  onSetSpeed,
  currentEvent,
}: TimelineScrubberProps) => {
  const [flashEvent, setFlashEvent] = useState<ScenarioEvent | null>(null);

  // Flash event description when timeline crosses an event
  useEffect(() => {
    if (currentEvent && isPlaying) {
      setFlashEvent(currentEvent);
      const timer = setTimeout(() => setFlashEvent(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [currentEvent?.date, isPlaying]);

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-2">
      {/* Event flash */}
      <AnimatePresence>
        {flashEvent && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-lg bg-primary/10 border border-primary/20 p-2 text-xs text-foreground"
          >
            <span className="font-medium">{flashEvent.label}</span>
            <span className="text-muted-foreground ml-1">— {flashEvent.description}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary hover:bg-accent transition-colors text-foreground"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            onClick={() => onScrub(Math.min(currentIndex + 5, totalDates - 1))}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary hover:bg-accent transition-colors text-foreground"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1">
          <Slider
            value={[currentIndex]}
            min={0}
            max={Math.max(totalDates - 1, 1)}
            step={1}
            onValueChange={([v]) => onScrub(v)}
          />
        </div>

        <div className="flex items-center gap-1">
          {[1, 2, 5].map(speed => (
            <button
              key={speed}
              onClick={() => onSetSpeed(speed)}
              className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                playSpeed === speed ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatDate(startDate)}</span>
        <span className="font-medium text-foreground">{formatDate(currentDate)}</span>
        <span>{formatDate(endDate)}</span>
      </div>
    </div>
  );
};

export default TimelineScrubber;
