import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X } from 'lucide-react';

interface MissedDayBannerProps {
  show: boolean;
  onDismiss: () => void;
}

const MissedDayBanner = ({ show, onDismiss }: MissedDayBannerProps) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          className="mb-4 p-3 bg-accent/50 border border-accent rounded-xl flex items-start gap-3"
        >
          <Clock size={18} className="text-primary mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Routine logged for yesterday!</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tap here to adjust if your usage changed.
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MissedDayBanner;
