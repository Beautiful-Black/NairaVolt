interface HourNumberLineProps {
  maxHours: number;
  value: number;
  onChange: (hours: number) => void;
}

const HourNumberLine = ({ maxHours, value, onChange }: HourNumberLineProps) => {
  const hours = Array.from({ length: maxHours }, (_, i) => i + 1);

  return (
    <div>
      <div className="flex justify-between items-center mb-2 px-1">
        <span className="text-xs font-medium text-muted-foreground">Hours/Day</span>
        <span className="text-xs font-bold font-mono text-foreground">{value} hr{value !== 1 ? 's' : ''}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {hours.map(h => (
          <button
            key={h}
            onClick={() => onChange(h)}
            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all duration-150 ${
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
