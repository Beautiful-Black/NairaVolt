import { AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useCalculator } from '@/hooks/useCalculator';
import TotalCard from '@/components/TotalCard';
import BandSelector from '@/components/BandSelector';
import ApplianceCard from '@/components/ApplianceCard';
import AddApplianceModal from '@/components/AddApplianceModal';

const Index = () => {
  const {
    selectedBand,
    userAppliances,
    totalMonthly,
    totalDaily,
    addAppliance,
    updateHours,
    removeAppliance,
    changeBand,
    isHeavyHitter,
  } = useCalculator();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-2">
          <div className="p-1.5 gradient-vault rounded-lg">
            <Zap size={18} className="text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-extrabold text-foreground text-lg leading-none">WattWise</h1>
            <p className="text-[10px] text-muted-foreground tracking-wide">Smart Energy. More Savings.</p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-lg mx-auto px-4 py-6">
        <BandSelector selected={selectedBand} onChange={changeBand} />

        <TotalCard total={totalMonthly} totalDaily={totalDaily} band={selectedBand} applianceCount={userAppliances.length} />

        {/* Appliance list */}
        {userAppliances.length === 0 ? (
          <div className="text-center py-12 px-6">
            <div className="text-5xl mb-4">⚡</div>
            <h2 className="font-bold text-foreground text-lg mb-2">No appliances yet</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Start by adding your electronics to see how much you can save!
            </p>
          </div>
        ) : (
          <div className="mb-4">
            <AnimatePresence mode="popLayout">
              {userAppliances.map(ua => (
                <ApplianceCard
                  key={ua.appliance.id}
                  ua={ua}
                  band={selectedBand}
                  isHeavy={isHeavyHitter(ua.monthlyCost)}
                  onUpdateHours={updateHours}
                  onRemove={removeAppliance}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        <AddApplianceModal
          addedIds={userAppliances.map(ua => ua.appliance.id)}
          onAdd={addAppliance}
        />

        {/* Disclaimer */}
        <div className="mt-8 mb-4 p-4 bg-secondary rounded-2xl">
          <p className="text-[11px] text-muted-foreground leading-relaxed text-center">
            <span className="font-semibold text-foreground">Disclaimer:</span> Estimates based on average wattages. Actual consumption may vary by brand and device age. WattWise is a management guide, not an official bill.
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-muted-foreground mb-4">
          Built for Nigerian homes & businesses 🇳🇬
        </p>
      </main>
    </div>
  );
};

export default Index;
