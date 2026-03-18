import { TARIFF_BANDS, type TariffBand } from '@/data/appliances';

interface BandSelectorProps {
  selected: TariffBand;
  onChange: (band: TariffBand) => void;
}

const BandSelector = ({ selected, onChange }: BandSelectorProps) => (
  <div className="mb-6">
    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
      Select Your Tariff Band
    </label>
    <div className="flex gap-1.5 p-1.5 bg-secondary rounded-2xl overflow-x-auto">
      {TARIFF_BANDS.map(band => (
        <button
          key={band.id}
          onClick={() => onChange(band)}
          className={`flex-1 min-w-[64px] px-3 py-2.5 rounded-xl text-center transition-all duration-200 ${
            selected.id === band.id
              ? 'bg-primary text-primary-foreground shadow-card font-semibold'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          }`}
        >
          <div className="text-xs font-bold">{band.id}</div>
          <div className="text-[10px] opacity-75 mt-0.5">{band.label}</div>
        </button>
      ))}
    </div>
  </div>
);

export default BandSelector;
