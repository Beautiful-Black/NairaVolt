import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { type UserAppliance, type TariffBand } from '@/data/appliances';

interface ApplianceCardProps {
  ua: UserAppliance;
  band: TariffBand;
  isHeavy: boolean;
  onUpdateHours: (id: string, hours: number) => void;
  onRemove: (id: string) => void;
}

const ApplianceCard = ({ ua, band, isHeavy, onUpdateHours, onRemove }: ApplianceCardProps) => {
  const hourlyCost = (ua.appliance.average_watts / 1000) * band.rate;
  const fillPercent = (ua.hoursPerDay / band.supplyHours) * 100;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: -10 }}
      transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
      className="bg-card p-4 sm:p-5 rounded-[20px] shadow-card mb-3"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3 items-center">
          <div className="p-2.5 bg-secondary rounded-xl text-2xl flex-shrink-0">
            {ua.appliance.icon}
          </div>
          <div>
            <h3 className="font-bold text-card-foreground text-sm sm:text-base">{ua.appliance.name}</h3>
            <p className="text-xs text-muted-foreground font-mono">{ua.appliance.average_watts}W • ₦{hourlyCost.toFixed(2)}/hr</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isHeavy && (
            <span className="bg-destructive/10 text-destructive text-[10px] px-2 py-1 rounded-md font-bold uppercase whitespace-nowrap">
              Heavy Hitter
            </span>
          )}
          <button
            onClick={() => onRemove(ua.appliance.id)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Slider */}
      <div className="relative">
        <div className="absolute top-[7px] left-0 right-0 h-1.5 bg-secondary rounded-full overflow-hidden pointer-events-none">
          <div
            className="h-full bg-primary rounded-full transition-all duration-150"
            style={{ width: `${fillPercent}%` }}
          />
        </div>
        <input
          type="range"
          min={0}
          max={band.supplyHours}
          step={0.5}
          value={ua.hoursPerDay}
          onChange={e => onUpdateHours(ua.appliance.id, parseFloat(e.target.value))}
          className="relative z-10 bg-transparent"
        />
      </div>
      <div className="flex justify-between mt-1 text-[11px] font-mono text-muted-foreground">
        <span>0 hrs</span>
        <span className="font-semibold text-foreground">{ua.hoursPerDay} hrs/day</span>
        <span>{band.supplyHours} hrs</span>
      </div>

      {/* Daily & Monthly cost */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="flex justify-between items-center px-3 py-2 bg-secondary rounded-xl">
          <span className="text-xs text-muted-foreground">Daily</span>
          <span className="font-bold font-mono text-sm text-card-foreground tabular-nums">
            ₦{ua.dailyCost.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
        </div>
        <div className="flex justify-between items-center px-3 py-2 bg-secondary rounded-xl">
          <span className="text-xs text-muted-foreground">Monthly</span>
          <span className="font-bold font-mono text-sm text-card-foreground tabular-nums">
            ₦{ua.monthlyCost.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      {/* Wise tip */}
      <div className="mt-3 p-3 bg-primary-muted rounded-xl flex gap-2 items-start">
        <span className="text-accent text-sm flex-shrink-0">💡</span>
        <p className="text-[12px] text-foreground/80 leading-tight">{ua.appliance.wise_usage}</p>
      </div>
    </motion.div>
  );
};

export default ApplianceCard;
