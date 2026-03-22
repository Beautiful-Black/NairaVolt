import { Signal } from 'lucide-react';

export const DISCO_LIST = [
  { id: 'ikedc', name: 'IKEDC', fullName: 'Ikeja Electric Distribution Company' },
  { id: 'ekedc', name: 'EKEDC', fullName: 'Eko Electricity Distribution Company' },
  { id: 'aedc', name: 'AEDC', fullName: 'Abuja Electricity Distribution Company' },
  { id: 'phedc', name: 'PHEDC', fullName: 'Port Harcourt Electricity Distribution Company' },
  { id: 'bedc', name: 'BEDC', fullName: 'Benin Electricity Distribution Company' },
  { id: 'kedco', name: 'KEDCO', fullName: 'Kano Electricity Distribution Company' },
  { id: 'kaedco', name: 'KAEDCO', fullName: 'Kaduna Electric' },
  { id: 'jedc', name: 'JED', fullName: 'Jos Electricity Distribution Company' },
  { id: 'ibedc', name: 'IBEDC', fullName: 'Ibadan Electricity Distribution Company' },
  { id: 'eedc', name: 'EEDC', fullName: 'Enugu Electricity Distribution Company' },
  { id: 'yedc', name: 'YEDC', fullName: 'Yola Electricity Distribution Company' },
] as const;

export type DiSCo = typeof DISCO_LIST[number];

interface DiSCoSelectorProps {
  selected: string;
  onChange: (id: string) => void;
}

const DiSCoSelector = ({ selected, onChange }: DiSCoSelectorProps) => (
  <div className="mb-4">
    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
      Select Your DisCo
    </label>
    <div className="relative">
      <select
        value={selected}
        onChange={e => onChange(e.target.value)}
        className="w-full appearance-none bg-card border border-border rounded-2xl px-4 py-3 pr-10 text-sm font-medium text-card-foreground shadow-card focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
      >
        {DISCO_LIST.map(d => (
          <option key={d.id} value={d.id}>{d.name} — {d.fullName}</option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
    </div>
    <div className="flex items-center gap-1.5 mt-2">
      <Signal size={12} className="text-accent" />
      <span className="text-[10px] font-semibold text-accent uppercase tracking-wider">Live API Synced</span>
    </div>
  </div>
);

export default DiSCoSelector;
