import { Play, Pause, SkipForward } from "lucide-react";
import { Slider } from "@/components/ui/slider";

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
}: TimelineScrubberProps) => {
  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const progress = totalDates > 0 ? (currentIndex / (totalDates - 1)) * 100 : 0;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-4">
        {/* Play controls */}
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

        {/* Timeline slider */}
        <div className="flex-1">
          <Slider
            value={[currentIndex]}
            min={0}
            max={Math.max(totalDates - 1, 1)}
            step={1}
            onValueChange={([v]) => onScrub(v)}
          />
        </div>

        {/* Speed control */}
        <div className="flex items-center gap-1">
          {[1, 2, 5].map(speed => (
            <button
              key={speed}
              onClick={() => onSetSpeed(speed)}
              className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                playSpeed === speed
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      {/* Date labels */}
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>{formatDate(startDate)}</span>
        <span className="font-medium text-foreground">{formatDate(currentDate)}</span>
        <span>{formatDate(endDate)}</span>
      </div>
    </div>
  );
};

export default TimelineScrubber;
