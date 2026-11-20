import { AnimatePresence, motion } from 'framer-motion';
import { Heart } from 'lucide-react';

const MINI_HEARTS = [
  { x: -90, y: -70, s: 0.55, r: -20 },
  { x: 95, y: -60, s: 0.5, r: 18 },
  { x: -70, y: 70, s: 0.4, r: -10 },
  { x: 80, y: 80, s: 0.45, r: 14 },
  { x: 0, y: -110, s: 0.38, r: 0 },
  { x: -120, y: 10, s: 0.32, r: -24 },
];

/** A short heart pop shown over the deck whenever the user likes someone. */
export default function HeartBurst({ burstKey }) {
  return (
    <div className="heart-burst" aria-hidden="true">
      <AnimatePresence>
        {burstKey > 0 && (
          <motion.div
            key={burstKey}
            className="heart-burst__layer"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <motion.span
              className="heart-burst__main"
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: [0.3, 1.15, 1], opacity: [0, 1, 0] }}
              transition={{ duration: 0.75, times: [0, 0.35, 1], ease: 'easeOut' }}
            >
              <Heart size={96} fill="currentColor" strokeWidth={0} />
            </motion.span>
            {MINI_HEARTS.map((h, i) => (
              <motion.span
                key={i}
                className="heart-burst__mini"
                initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                animate={{ x: h.x, y: h.y, scale: h.s, rotate: h.r, opacity: [0, 1, 0] }}
                transition={{ duration: 0.8, delay: 0.05 + i * 0.02, ease: 'easeOut' }}
              >
                <Heart size={48} fill="currentColor" strokeWidth={0} />
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
