import { type TariffBand } from '@/data/appliances';
import CostToggle from './CostToggle';

interface TotalCardProps {
  total: number;
  totalDaily: number;
  band: TariffBand;
  applianceCount: number;
  costMode: 'daily' | 'monthly';
  onCostModeChange: (mode: 'daily' | 'monthly') => void;
}

const TotalCard = ({ total, totalDaily, band, applianceCount, costMode, onCostModeChange }: TotalCardProps) => {
  const displayTotal = costMode === 'daily' ? totalDaily : total;
  const label = costMode === 'daily' ? 'Estimated Daily Bill' : 'Estimated Monthly Bill';
  const subTotal = costMode === 'daily' ? total : totalDaily;
  const subLabel = costMode === 'daily' ? '/month' : '/day';

  return (
    <div className="gradient-vault rounded-3xl p-6 sm:p-8 text-primary-foreground shadow-elevated mb-6">
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs sm:text-sm opacity-80 font-medium uppercase tracking-wider">
          {label}
        </p>
        <CostToggle mode={costMode} onChange={onCostModeChange} />
      </div>
      <h1 className="text-4xl sm:text-5xl font-extrabold tabular-nums font-mono mt-2">
        ₦{displayTotal.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
      </h1>
      <p className="text-sm opacity-70 font-mono mt-1">
        ₦{subTotal.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}{subLabel}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-white/10 w-fit px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          <span className="text-xs font-mono">
            {band.name} • ₦{band.rate}/kWh
          </span>
        </div>
        <div className="flex items-center gap-2 bg-white/10 w-fit px-3 py-1.5 rounded-full">
          <span className="text-xs font-mono">
            {applianceCount} appliance{applianceCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Yearly projection */}
      <div className="mt-4 pt-4 border-t border-white/15">
        <div className="flex items-center justify-between">
          <p className="text-xs opacity-70 font-medium uppercase tracking-wider">Yearly Estimated Cost</p>
          <p className="text-xl font-extrabold tabular-nums font-mono">
            ₦{(total * 12).toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TotalCard;
