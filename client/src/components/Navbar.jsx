import { NavLink, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from './Logo';
import ProfilePhoto from './ProfilePhoto';
import { NAV_ITEMS } from './navItems';

/**
 * Top bar. On desktop it holds the logo, the tab switcher and the user chip.
 * On mobile only the logo and avatar are shown (tabs live in BottomNavigation).
 */
export default function Navbar({ user, badges = {} }) {
  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Logo />

        <nav className="navbar__tabs" aria-label="Main">
          {NAV_ITEMS.map(({ to, label, icon: Icon, badgeKey }) => (
            <NavLink key={to} to={to} className="navbar__tab">
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="navbar-pill"
                      className="navbar__pill"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <Icon size={18} strokeWidth={2.2} aria-hidden="true" />
                  <span>{label}</span>
                  {badgeKey && badges[badgeKey] > 0 && (
                    <span className="nav-badge" aria-label={`${badges[badgeKey]} new`}>
                      {badges[badgeKey]}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <Link to="/setup" className="user-chip" title="Edit your demo profile">
          <span className="user-chip__avatar">
            <ProfilePhoto src={user?.photo} name={user?.name || 'You'} eager />
          </span>
          <span className="user-chip__name">{user ? `Hi, ${user.name}` : 'Demo user'}</span>
        </Link>
      </div>
    </header>
  );
}
