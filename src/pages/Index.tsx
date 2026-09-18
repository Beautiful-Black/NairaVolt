import { useEffect, useState } from 'react';
import { LogOut, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import nairavoltLogo from '@/assets/nairavolt-logo.jpeg';
import { useAuth } from '@/contexts/AuthContext';
import OnboardingOverlay, { useOnboarding } from '@/components/OnboardingOverlay';
import ManualAuditDashboard from '@/components/ManualAuditDashboard';

const Index = () => {
  const { user, signOut } = useAuth();
  const { showOnboarding, currentStep, next, prev, completeOnboarding, steps } = useOnboarding();
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

  const handleDeleteAccount = () => {
    if (!window.confirm('Delete your NairaVolt account data from this device and sign out? This cannot be undone.')) return;
    localStorage.clear();
    void signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <img src={nairavoltLogo} alt="NairaVolt Logo" className="h-10 w-10 rounded-lg object-contain" />
          <div className="flex-1">
            <h1 className="font-extrabold text-foreground text-lg leading-none">NairaVolt</h1>
            <p className="text-[10px] text-muted-foreground tracking-wide">Smart Energy Auditing for Nigeria</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => { localStorage.removeItem('nairavolt-onboarded'); window.location.reload(); }} className="hidden sm:inline-flex">Replay tutorial</Button>
          <Button variant="ghost" size="icon" onClick={() => setDark(current => !current)} title={dark ? 'Switch to light mode' : 'Switch to dark mode'} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => void signOut()} title="Sign out" aria-label="Sign out"><LogOut size={18} /></Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <ManualAuditDashboard
          onReplayTutorial={() => { localStorage.removeItem('nairavolt-onboarded'); window.location.reload(); }}
          userEmail={user?.email ?? ''}
          onSignOut={() => void signOut()}
          onDeleteAccount={handleDeleteAccount}
        />
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
