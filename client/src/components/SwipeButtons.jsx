import { motion } from 'framer-motion';
import { Heart, X } from 'lucide-react';

export default function SwipeButtons({ onPass, onLike, disabled }) {
  return (
    <div className="swipe-buttons">
      <motion.button
        type="button"
        className="swipe-btn swipe-btn--pass"
        onClick={onPass}
        disabled={disabled}
        whileHover={{ scale: 1.07, rotate: -6 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Pass"
        title="Pass (←)"
      >
        <X size={30} strokeWidth={2.6} aria-hidden="true" />
      </motion.button>
      <motion.button
        type="button"
        className="swipe-btn swipe-btn--like"
        onClick={onLike}
        disabled={disabled}
        whileHover={{ scale: 1.07, rotate: 6 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Like"
        title="Like (→)"
      >
        <Heart size={32} fill="currentColor" strokeWidth={0} aria-hidden="true" />
      </motion.button>
    </div>
  );
}
