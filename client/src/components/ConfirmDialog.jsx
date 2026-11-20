import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

/**
 * Accessible confirmation dialog (role="alertdialog").
 * Focus starts on Cancel (the safe choice); Escape or a backdrop click cancels,
 * except while the action is in progress.
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  media,
  confirmLabel = 'Confirm',
  busyLabel = 'Working…',
  cancelLabel = 'Cancel',
  busy = false,
  error = null,
  tone = 'danger',
  onConfirm,
  onCancel,
}) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    cancelRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape' && !busy) {
        e.stopPropagation();
        onCancel();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [open, busy, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="confirm-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !busy && onCancel()}
        >
          <motion.div
            className="confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-desc"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {media && <div className="confirm-dialog__media">{media}</div>}
            <h2 id="confirm-title" className="confirm-dialog__title">
              {title}
            </h2>
            <p id="confirm-desc" className="confirm-dialog__text">
              {description}
            </p>

            {error && (
              <p className="confirm-dialog__error" role="alert">
                <AlertCircle size={16} aria-hidden="true" /> {error}
              </p>
            )}

            <div className="confirm-dialog__actions">
              <button ref={cancelRef} type="button" className="btn btn--white" onClick={onCancel} disabled={busy}>
                {cancelLabel}
              </button>
              <button
                type="button"
                className={`btn ${tone === 'danger' ? 'btn--danger' : 'btn--primary'}`}
                onClick={onConfirm}
                disabled={busy}
              >
                {busy ? busyLabel : error ? 'Try again' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
