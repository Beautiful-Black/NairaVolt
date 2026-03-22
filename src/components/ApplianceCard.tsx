import { motion } from 'framer-motion';
import { X, Minus, Plus } from 'lucide-react';
import { type UserAppliance, type TariffBand } from '@/data/appliances';
import HourNumberLine from './HourNumberLine';

interface ApplianceCardProps {
  ua: UserAppliance;
  band: TariffBand;
  isHeavy: boolean;
  onUpdateHours: (id: string, hours: number) => void;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

const ApplianceCard = ({ ua, band, isHeavy, onUpdateHours, onUpdateQuantity, onRemove }: ApplianceCardProps) => {
  const hourlyCost = (ua.appliance.average_watts * ua.quantity / 1000) * band.rate;

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
            <p className="text-xs text-muted-foreground font-mono">{ua.appliance.average_watts}W × {ua.quantity} • ₦{hourlyCost.toFixed(2)}/hr</p>
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

      {/* Quantity */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs font-medium text-muted-foreground">Quantity</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateQuantity(ua.appliance.id, ua.quantity - 1)}
            disabled={ua.quantity <= 1}
            className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-card-foreground hover:bg-muted transition-colors disabled:opacity-30"
          >
            <Minus size={14} />
          </button>
          <span className="font-bold font-mono text-sm text-card-foreground w-6 text-center tabular-nums">{ua.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(ua.appliance.id, ua.quantity + 1)}
            disabled={ua.quantity >= 20}
            className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-card-foreground hover:bg-muted transition-colors disabled:opacity-30"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Hour Number Line */}
      <HourNumberLine
        maxHours={band.supplyHours}
        value={ua.hoursPerDay}
        onChange={(h) => onUpdateHours(ua.appliance.id, h)}
      />

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
