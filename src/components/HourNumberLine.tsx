import { useRef, useEffect } from 'react';

interface HourNumberLineProps {
  maxHours: number;
  value: number;
  onChange: (hours: number) => void;
}

const HourNumberLine = ({ maxHours, value, onChange }: HourNumberLineProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const hours = Array.from({ length: maxHours }, (_, i) => i + 1);

  useEffect(() => {
    if (scrollRef.current && value > 0) {
      const btn = scrollRef.current.querySelector(`[data-hour="${value}"]`) as HTMLElement;
      if (btn) {
        btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [value]);

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-2 px-1">
        <span className="text-xs font-medium text-muted-foreground">Hours/Day</span>
        <span className="text-xs font-bold font-mono text-foreground">{value} hr{value !== 1 ? 's' : ''}</span>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {hours.map(h => (
          <button
            key={h}
            data-hour={h}
            onClick={() => onChange(h)}
            className={`flex-shrink-0 snap-center w-9 h-9 rounded-xl text-xs font-bold transition-all duration-150 ${
              h === value
                ? 'bg-primary text-primary-foreground shadow-md scale-110'
                : 'bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {h}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HourNumberLine;
