import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import BottomNavigation from './BottomNavigation';
import { useCurrentUser } from '../hooks/useCurrentUser';

/**
 * Shell for the tabbed part of the app (Home, Discover, Matches).
 * Shares the demo user and a "new matches" badge with pages via Outlet context.
 */
export default function AppLayout() {
  const { user } = useCurrentUser();
  const [newMatches, setNewMatches] = useState(0);
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname.startsWith('/matches')) setNewMatches(0);
  }, [pathname]);

  const notifyMatch = useCallback(() => setNewMatches((n) => n + 1), []);
  const badges = { matches: newMatches };

  return (
    <div className="app-shell">
      <Navbar user={user} badges={badges} />
      <main className="app-main">
        <Outlet context={{ user, notifyMatch }} />
      </main>
      <BottomNavigation badges={badges} />
    </div>
  );
}
