import { Switch } from '@/components/ui/switch';
import { CalendarClock } from 'lucide-react';

interface AutomationToggleProps {
  profileId: string | null;
  isAutomated: boolean;
  onToggle: (profileId: string) => void;
}

const AutomationToggle = ({ profileId, isAutomated, onToggle }: AutomationToggleProps) => {
  if (!profileId) return null;

  return (
    <div className="flex items-center justify-between p-3 mb-4 bg-card border border-border rounded-xl">
      <div className="flex items-center gap-2.5">
        <CalendarClock size={16} className="text-primary" />
        <div>
          <p className="text-sm font-semibold text-foreground leading-none">Automate Daily Tracking</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Auto-log usage snapshots daily</p>
        </div>
      </div>
      <Switch
        checked={isAutomated}
        onCheckedChange={() => onToggle(profileId)}
      />
    </div>
  );
};

export default AutomationToggle;
