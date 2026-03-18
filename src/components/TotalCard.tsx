import { type TariffBand } from '@/data/appliances';

interface TotalCardProps {
  total: number;
  band: TariffBand;
  applianceCount: number;
}

const TotalCard = ({ total, band, applianceCount }: TotalCardProps) => (
  <div className="gradient-vault rounded-3xl p-6 sm:p-8 text-primary-foreground shadow-elevated mb-6">
    <p className="text-xs sm:text-sm opacity-80 font-medium uppercase tracking-wider">
      Estimated Monthly Bill
    </p>
    <h1 className="text-4xl sm:text-5xl font-extrabold tabular-nums font-mono mt-2">
      ₦{total.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
    </h1>
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
  </div>
);

export default TotalCard;
