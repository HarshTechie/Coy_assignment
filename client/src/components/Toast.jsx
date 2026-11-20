import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

/** notice: { type: 'error' | 'success', text } | null */
export default function Toast({ notice, onDismiss, duration = 4000 }) {
  useEffect(() => {
    if (!notice) return undefined;
    const id = setTimeout(onDismiss, duration);
    return () => clearTimeout(id);
  }, [notice, onDismiss, duration]);

  const Icon = notice?.type === 'success' ? CheckCircle2 : AlertCircle;

  return (
    <div className="toast-region" aria-live="polite">
      <AnimatePresence>
        {notice && (
          <motion.div
            key={notice.text}
            className={`toast ${notice.type === 'success' ? 'toast--success' : ''}`}
            role={notice.type === 'error' ? 'alert' : 'status'}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
          >
            <Icon size={18} aria-hidden="true" />
            <span className="toast__text">{notice.text}</span>
            <button type="button" className="toast__close" onClick={onDismiss} aria-label="Dismiss">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
