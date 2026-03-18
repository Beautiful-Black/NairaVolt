interface CostToggleProps {
  mode: 'daily' | 'monthly';
  onChange: (mode: 'daily' | 'monthly') => void;
}

const CostToggle = ({ mode, onChange }: CostToggleProps) => (
  <div className="flex p-1 bg-secondary rounded-xl w-fit">
    <button
      onClick={() => onChange('daily')}
      className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
        mode === 'daily'
          ? 'bg-card shadow-card text-card-foreground'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      Daily
    </button>
    <button
      onClick={() => onChange('monthly')}
      className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
        mode === 'monthly'
          ? 'bg-card shadow-card text-card-foreground'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      Monthly
    </button>
  </div>
);

export default CostToggle;
