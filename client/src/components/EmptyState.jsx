import { motion } from 'framer-motion';
import Illustration from './Illustration';

/** Friendly illustrated message with optional actions (empty, error and placeholder states). */
export default function EmptyState({ art = 'caught-up', title, description, note, tone = 'default', children }) {
  return (
    <motion.section
      className="empty-state"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <Illustration variant={art} className="empty-state__art" />
      <h2 className="empty-state__title">{title}</h2>
      {description && <p className="empty-state__text">{description}</p>}
      {children && <div className="empty-state__actions">{children}</div>}
      {note && <p className="empty-state__note">{note}</p>}
    </motion.section>
  );
}
