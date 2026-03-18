import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ChevronDown, Trash2, Home, Store, Building2 } from 'lucide-react';
import { type Profile } from '@/hooks/useProfiles';

interface ProfileSwitcherProps {
  profiles: Profile[];
  activeProfileId: string | null;
  onSwitch: (id: string) => void;
  onCreate: (name: string) => void;
  onDelete: (id: string) => void;
}

const PROFILE_ICONS: Record<string, React.ReactNode> = {
  home: <Home size={14} />,
  shop: <Store size={14} />,
  office: <Building2 size={14} />,
};

const getIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('home') || lower.includes('house')) return PROFILE_ICONS.home;
  if (lower.includes('shop') || lower.includes('store') || lower.includes('business')) return PROFILE_ICONS.shop;
  if (lower.includes('office') || lower.includes('work')) return PROFILE_ICONS.office;
  return <Home size={14} />;
};

const ProfileSwitcher = ({ profiles, activeProfileId, onSwitch, onCreate, onDelete }: ProfileSwitcherProps) => {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const active = profiles.find(p => p.id === activeProfileId);

  const handleCreate = () => {
    if (!newName.trim()) return;
    onCreate(newName.trim());
    setNewName('');
    setCreating(false);
    setOpen(false);
  };

  return (
    <div className="mb-4 relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-card rounded-2xl shadow-card transition-all"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
            {active ? getIcon(active.name) : <Home size={14} />}
          </div>
          <span className="font-semibold text-sm text-card-foreground">
            {active ? active.name : 'Select Profile'}
          </span>
        </div>
        <ChevronDown size={16} className={`text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card rounded-2xl shadow-elevated z-30 overflow-hidden border border-border"
          >
            {profiles.map(p => (
              <div
                key={p.id}
                className={`flex items-center justify-between px-4 py-3 hover:bg-secondary/50 transition-colors cursor-pointer ${
                  p.id === activeProfileId ? 'bg-primary-muted' : ''
                }`}
                onClick={() => { onSwitch(p.id); setOpen(false); }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                    {getIcon(p.name)}
                  </div>
                  <span className="text-sm font-medium text-card-foreground">{p.name}</span>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); onDelete(p.id); }}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            {creating ? (
              <div className="p-3 border-t border-border flex gap-2">
                <input
                  autoFocus
                  type="text"
                  placeholder="e.g. My Shop"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  className="flex-1 bg-secondary rounded-xl px-3 py-2 text-sm outline-none text-foreground placeholder:text-muted-foreground"
                />
                <button onClick={handleCreate} className="px-3 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold">
                  Add
                </button>
                <button onClick={() => setCreating(false)} className="p-2 rounded-xl hover:bg-secondary">
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="w-full flex items-center gap-2 px-4 py-3 border-t border-border text-primary text-sm font-medium hover:bg-primary-muted transition-colors"
              >
                <Plus size={16} />
                New Profile
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileSwitcher;
