import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, MessageCircleHeart, Sparkles } from 'lucide-react';
import ProfilePhoto from './ProfilePhoto';

const FLOATING_HEARTS = [8, 22, 38, 56, 72, 88];

/** Animated "It's a match!" dialog showing both people's photos. */
export default function MatchModal({ match, currentUser, onContinue, onViewMatches }) {
  const primaryRef = useRef(null);

  useEffect(() => {
    if (!match) return undefined;
    primaryRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onContinue();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [match, onContinue]);

  return (
    <AnimatePresence>
      {match && (
        <motion.div
          className="match-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onContinue}
        >
          <motion.div
            className="match-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="match-title"
            aria-describedby="match-text"
            initial={{ opacity: 0, y: 48, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="match-dialog__hero">
              {FLOATING_HEARTS.map((left, i) => (
                <span
                  key={left}
                  className="match-dialog__float"
                  style={{ left: `${left}%`, animationDelay: `${i * 0.35}s` }}
                  aria-hidden="true"
                >
                  <Heart size={14 + (i % 3) * 5} fill="currentColor" strokeWidth={0} />
                </span>
              ))}

              <div className="match-dialog__photos">
                <motion.div
                  className="match-dialog__photo match-dialog__photo--left"
                  initial={{ x: -60, rotate: -18, opacity: 0 }}
                  animate={{ x: 0, rotate: -8, opacity: 1 }}
                  transition={{ delay: 0.12, type: 'spring', stiffness: 240, damping: 18 }}
                >
                  <ProfilePhoto src={currentUser?.photo} name={currentUser?.name || 'You'} eager />
                </motion.div>
                <motion.div
                  className="match-dialog__photo match-dialog__photo--right"
                  initial={{ x: 60, rotate: 18, opacity: 0 }}
                  animate={{ x: 0, rotate: 8, opacity: 1 }}
                  transition={{ delay: 0.12, type: 'spring', stiffness: 240, damping: 18 }}
                >
                  <ProfilePhoto src={match.profile.photo} name={match.profile.name} eager />
                </motion.div>
                <motion.span
                  className="match-dialog__heart"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  aria-hidden="true"
                >
                  <Heart size={24} fill="currentColor" strokeWidth={0} />
                </motion.span>
              </div>
            </div>

            <div className="match-dialog__body">
              <span className="eyebrow">
                <Sparkles size={14} aria-hidden="true" /> New match
              </span>
              <h2 id="match-title" className="match-dialog__title text-gradient">
                It&apos;s a match!
              </h2>
              <p id="match-text" className="match-dialog__text">
                You and <strong>{match.profile.name}</strong> like each other. Say hi before the spark fades.
              </p>
              <div className="match-dialog__actions">
                <button ref={primaryRef} type="button" className="btn btn--primary btn--lg btn--block" onClick={onContinue}>
                  Keep discovering
                </button>
                <button type="button" className="btn btn--ghost btn--block" onClick={onViewMatches}>
                  <MessageCircleHeart size={18} aria-hidden="true" /> View matches
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
