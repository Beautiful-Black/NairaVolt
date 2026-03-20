import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, X, Trash2 } from 'lucide-react';
import { APPLIANCES, type Appliance } from '@/data/appliances';

interface AddApplianceModalProps {
  addedIds: string[];
  onAdd: (appliance: Appliance) => void;
  customAppliances?: Appliance[];
  onAddCustom?: (name: string, watts: number) => Promise<Appliance | null>;
  onDeleteCustom?: (id: string) => Promise<void>;
}

const AddApplianceModal = ({ addedIds, onAdd, customAppliances = [], onAddCustom, onDeleteCustom }: AddApplianceModalProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [customMode, setCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customWatts, setCustomWatts] = useState('');
  const [saving, setSaving] = useState(false);

  const allAppliances = [...APPLIANCES, ...customAppliances];
  const filtered = allAppliances.filter(
    a => !addedIds.includes(a.id) && a.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddCustom = async () => {
    const watts = parseInt(customWatts);
    if (!customName.trim() || isNaN(watts) || watts <= 0) return;

    if (onAddCustom) {
      setSaving(true);
      const appliance = await onAddCustom(customName.trim(), watts);
      setSaving(false);
      if (appliance) {
        onAdd(appliance);
        setCustomName('');
        setCustomWatts('');
        setCustomMode(false);
        setOpen(false);
      }
    } else {
      const custom: Appliance = {
        id: `custom-${Date.now()}`,
        name: customName.trim(),
        average_watts: watts,
        wise_usage: 'Monitor usage closely and turn off when not needed.',
        icon: '🔌',
      };
      onAdd(custom);
      setCustomName('');
      setCustomWatts('');
      setCustomMode(false);
      setOpen(false);
    }
  };

  const isCustom = (id: string) => id.startsWith('custom-');

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full py-4 rounded-2xl border-2 border-dashed border-primary/30 text-primary font-semibold flex items-center justify-center gap-2 hover:bg-primary-muted hover:border-primary/50 transition-all duration-200"
      >
        <Plus size={20} />
        Add Appliance
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => { setOpen(false); setCustomMode(false); }}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
              onClick={e => e.stopPropagation()}
              className="bg-card rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col shadow-elevated"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h2 className="font-bold text-lg text-card-foreground">
                  {customMode ? 'Add Custom Device' : 'Add Appliance'}
                </h2>
                <button onClick={() => { setOpen(false); setCustomMode(false); }} className="p-2 rounded-xl hover:bg-secondary transition-colors">
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>

              {customMode ? (
                <div className="p-5 space-y-4">
                  <p className="text-xs text-muted-foreground">Custom devices are saved to your account and available across all profiles.</p>
                  <div>
                    <label className="text-sm font-medium text-card-foreground mb-1 block">Device Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Hair Dryer"
                      value={customName}
                      onChange={e => setCustomName(e.target.value)}
                      className="w-full bg-secondary rounded-xl px-3 py-2.5 text-sm outline-none text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-card-foreground mb-1 block">Wattage (W)</label>
                    <input
                      type="number"
                      placeholder="e.g. 1500"
                      value={customWatts}
                      onChange={e => setCustomWatts(e.target.value)}
                      className="w-full bg-secondary rounded-xl px-3 py-2.5 text-sm outline-none text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setCustomMode(false)}
                      className="flex-1 py-3 rounded-xl border border-border text-card-foreground font-medium text-sm hover:bg-secondary transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleAddCustom}
                      disabled={saving}
                      className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Add Device'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Search */}
                  <div className="px-5 py-3">
                    <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2.5">
                      <Search size={16} className="text-muted-foreground flex-shrink-0" />
                      <input
                        type="text"
                        placeholder="Search appliances..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="bg-transparent text-sm w-full outline-none text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>

                  {/* Add Custom Device button */}
                  <div className="px-5 pb-2">
                    <button
                      onClick={() => setCustomMode(true)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-primary/30 text-primary text-sm font-medium hover:bg-primary-muted transition-colors"
                    >
                      <Plus size={16} />
                      Add Custom Device
                    </button>
                  </div>

                  {/* List */}
                  <div className="overflow-y-auto flex-1 px-5 pb-5">
                    {filtered.length === 0 ? (
                      <p className="text-center text-muted-foreground text-sm py-8">No appliances found</p>
                    ) : (
                      <div className="space-y-2">
                        {filtered.map(a => (
                          <div key={a.id} className="flex items-center gap-1">
                            <button
                              onClick={() => { onAdd(a); setOpen(false); setSearch(''); }}
                              className="flex-1 flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors text-left"
                            >
                              <span className="text-2xl">{a.icon}</span>
                              <div className="flex-1">
                                <p className="font-medium text-sm text-card-foreground">{a.name}</p>
                                <p className="text-xs text-muted-foreground font-mono">{a.average_watts}W</p>
                              </div>
                              <Plus size={18} className="text-primary" />
                            </button>
                            {isCustom(a.id) && onDeleteCustom && (
                              <button
                                onClick={(e) => { e.stopPropagation(); onDeleteCustom(a.id); }}
                                className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                title="Delete custom device"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AddApplianceModal;
