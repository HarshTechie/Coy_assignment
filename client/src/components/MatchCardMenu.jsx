import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MoreHorizontal, UserX } from 'lucide-react';

/** Three-dot menu on a match card. Closes on outside click / Escape and restores focus. */
export default function MatchCardMenu({ name, onUnmatch }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const firstItemRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    firstItemRef.current?.focus();
    const onPointer = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="card-menu" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="card-menu__trigger"
        aria-label={`More options for ${name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <MoreHorizontal size={20} strokeWidth={2.4} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="card-menu__list"
            role="menu"
            aria-label={`Options for ${name}`}
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16 }}
          >
            <button
              ref={firstItemRef}
              type="button"
              role="menuitem"
              className="card-menu__item card-menu__item--danger"
              onClick={() => {
                setOpen(false);
                buttonRef.current?.focus(); // so the dialog returns focus here if cancelled
                onUnmatch();
              }}
            >
              <UserX size={17} aria-hidden="true" /> Unmatch
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
