import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Save, Moon, Sun, LogOut } from 'lucide-react';
import nairavoltLogo from '@/assets/nairavolt-logo.jpeg';
import { useCalculator } from '@/hooks/useCalculator';
import { useProfiles } from '@/hooks/useProfiles';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomAppliances } from '@/hooks/useCustomAppliances';
import { useAutomation } from '@/hooks/useAutomation';
import TotalCard from '@/components/TotalCard';
import BandSelector from '@/components/BandSelector';
import DiSCoSelector from '@/components/DiSCoSelector';
import ApplianceCard from '@/components/ApplianceCard';
import AddApplianceModal from '@/components/AddApplianceModal';
import ProfileSwitcher from '@/components/ProfileSwitcher';
import HistoryChart from '@/components/HistoryChart';
import PdfExport from '@/components/PdfExport';
import MissedDayBanner from '@/components/MissedDayBanner';
import AutomationToggle from '@/components/AutomationToggle';
import OnboardingOverlay, { useOnboarding } from '@/components/OnboardingOverlay';

const Index = () => {
  const { signOut } = useAuth();
  const { customAppliances, addCustomAppliance, deleteCustomAppliance } = useCustomAppliances();
  const { isAutomated, toggleAutomation, showMissedBanner, dismissMissedDay } = useAutomation();
  const { showOnboarding, currentStep, next, prev, completeOnboarding, steps } = useOnboarding();
  const {
    profiles,
    activeProfile,
    activeProfileId,
    history,
    createProfile,
    deleteProfile,
    switchProfile,
    saveProfileState,
    snapshotHistory,
  } = useProfiles();

  const {
    selectedBand,
    userAppliances,
    totalMonthly,
    totalDaily,
    addAppliance,
    updateHours,
    updateQuantity,
    removeAppliance,
    changeBand,
    isHeavyHitter,
  } = useCalculator(activeProfile);

  const [costMode, setCostMode] = useState<'daily' | 'monthly'>('monthly');
  const [selectedDiSCo, setSelectedDiSCo] = useState(() => {
    return localStorage.getItem('nairavolt-disco') || 'ikedc';
  });
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('nairavolt-theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('nairavolt-theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    localStorage.setItem('nairavolt-disco', selectedDiSCo);
  }, [selectedDiSCo]);

  // Auto-save profile state when appliances or band change
  useEffect(() => {
    if (activeProfileId && userAppliances.length >= 0) {
      saveProfileState(selectedBand.id, userAppliances);
    }
  }, [userAppliances, selectedBand, activeProfileId, saveProfileState]);

  // Auto-snapshot for automated profiles (once per session per profile)
  useEffect(() => {
    if (activeProfile && isAutomated(activeProfileId) && totalMonthly > 0) {
      snapshotHistory(activeProfile.id, activeProfile.name, totalMonthly);
    }
  }, [activeProfileId, isAutomated, totalMonthly]);

  const handleSnapshot = () => {
    if (activeProfile && totalMonthly > 0) {
      snapshotHistory(activeProfile.id, activeProfile.name, totalMonthly);
    }
  };

  // Auto-create a default profile if none exist (wait for DB load)
  const { loaded } = useProfiles === undefined ? { loaded: true } : { loaded: true };
  useEffect(() => {
    if (profiles.length === 0 && profilesLoaded) {
      createProfile('My Home');
    }
  }, [profilesLoaded]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-2">
          <img src={nairavoltLogo} alt="NairaVolt Logo" className="h-10 w-10 rounded-lg object-contain" />
          <div className="flex-1">
            <h1 className="font-extrabold text-foreground text-lg leading-none">NairaVolt</h1>
            <p className="text-[10px] text-muted-foreground tracking-wide">Smart Energy Auditing for Nigeria</p>
          </div>
          {activeProfile && userAppliances.length > 0 && (
            <button
              onClick={handleSnapshot}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-semibold hover:bg-primary/20 transition-colors"
              title="Save current bill to history"
            >
              <Save size={14} />
              Log
            </button>
          )}
          <button
            onClick={() => setDark(d => !d)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={signOut}
            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
            title="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-lg mx-auto px-4 py-6">
        <div id="onboard-profiles">
          <ProfileSwitcher
            profiles={profiles}
            activeProfileId={activeProfileId}
            onSwitch={switchProfile}
            onCreate={createProfile}
            onDelete={deleteProfile}
          />
        </div>

        <DiSCoSelector selected={selectedDiSCo} onChange={setSelectedDiSCo} />

        <div id="onboard-band">
          <BandSelector selected={selectedBand} onChange={changeBand} />
        </div>

        <MissedDayBanner show={showMissedBanner} onDismiss={dismissMissedDay} />

        <div id="onboard-automation">
          <AutomationToggle
            profileId={activeProfileId}
            isAutomated={isAutomated(activeProfileId)}
            onToggle={toggleAutomation}
          />
        </div>

        {/* VAT notice */}
        <div className="flex items-center justify-end mb-2">
          <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">
            incl. 7.5% VAT
          </span>
        </div>

        <TotalCard
          total={totalMonthly}
          totalDaily={totalDaily}
          band={selectedBand}
          applianceCount={userAppliances.length}
          costMode={costMode}
          onCostModeChange={setCostMode}
        />

        <HistoryChart history={history} activeProfileId={activeProfileId} />

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
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeAppliance}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        <div id="onboard-add-appliance">
          <AddApplianceModal
            addedIds={userAppliances.map(ua => ua.appliance.id)}
            onAdd={addAppliance}
            customAppliances={customAppliances}
            onAddCustom={addCustomAppliance}
            onDeleteCustom={deleteCustomAppliance}
          />
        </div>

        <div className="mt-4">
          <PdfExport
            appliances={userAppliances}
            band={selectedBand}
            totalDaily={totalDaily}
            totalMonthly={totalMonthly}
            profileName={activeProfile?.name}
            discoId={selectedDiSCo}
          />
        </div>

        {/* Disclaimer */}
        <div className="mt-4 mb-4 p-4 bg-secondary rounded-2xl">
          <p className="text-[11px] text-muted-foreground leading-relaxed text-center">
            <span className="font-semibold text-foreground">Disclaimer:</span> Estimates based on average wattages. Actual consumption may vary by brand and device age. NairaVolt is a management guide, not an official bill.
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-muted-foreground mb-4">
          Built for Nigeria 🇳🇬
        </p>
      </main>

      <OnboardingOverlay
        show={showOnboarding}
        currentStep={currentStep}
        steps={steps}
        onNext={next}
        onPrev={prev}
        onSkip={completeOnboarding}
      />
    </div>
  );
};

export default Index;
