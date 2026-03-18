import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, X } from 'lucide-react';
import { APPLIANCES, type Appliance } from '@/data/appliances';

interface AddApplianceModalProps {
  addedIds: string[];
  onAdd: (appliance: Appliance) => void;
}

const AddApplianceModal = ({ addedIds, onAdd }: AddApplianceModalProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = APPLIANCES.filter(
    a => !addedIds.includes(a.id) && a.name.toLowerCase().includes(search.toLowerCase())
  );

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
            onClick={() => setOpen(false)}
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
                <h2 className="font-bold text-lg text-card-foreground">Add Appliance</h2>
                <button onClick={() => setOpen(false)} className="p-2 rounded-xl hover:bg-secondary transition-colors">
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>

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

              {/* List */}
              <div className="overflow-y-auto flex-1 px-5 pb-5">
                {filtered.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-8">No appliances found</p>
                ) : (
                  <div className="space-y-2">
                    {filtered.map(a => (
                      <button
                        key={a.id}
                        onClick={() => { onAdd(a); setOpen(false); setSearch(''); }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors text-left"
                      >
                        <span className="text-2xl">{a.icon}</span>
                        <div className="flex-1">
                          <p className="font-medium text-sm text-card-foreground">{a.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{a.average_watts}W</p>
                        </div>
                        <Plus size={18} className="text-primary" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AddApplianceModal;
