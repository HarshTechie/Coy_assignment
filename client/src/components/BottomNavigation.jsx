import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NAV_ITEMS } from './navItems';

/** Floating tab bar for mobile. Hidden on desktop via CSS. */
export default function BottomNavigation({ badges = {} }) {
  return (
    <nav className="bottom-nav" aria-label="Main">
      {NAV_ITEMS.map(({ to, label, icon: Icon, badgeKey }) => (
        <NavLink key={to} to={to} className="bottom-nav__item">
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId="bottom-nav-pill"
                  className="bottom-nav__pill"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span className="bottom-nav__icon">
                <Icon size={22} strokeWidth={2.2} aria-hidden="true" />
                {badgeKey && badges[badgeKey] > 0 && <span className="nav-badge nav-badge--dot" aria-label="New match" />}
              </span>
              <span className="bottom-nav__label">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
