import { Link, useOutletContext } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import EmptyState from '../components/EmptyState';

/** Intentionally minimal placeholder: the assignment only requires the tab to exist. */
export default function Home() {
  const { user } = useOutletContext();

  return (
    <div className="home">
      <div className="home__card">
        {user && <p className="home__greeting">Hey {user.name}!</p>}
        <EmptyState
          art="home"
          title="Your home feed is on its way"
          description="This tab is a placeholder for Coy's home experience. For now, the fun is over on Discover."
        >
          <Link to="/discover" className="btn btn--primary">
            <Sparkles size={16} aria-hidden="true" /> Start discovering
          </Link>
        </EmptyState>
      </div>
    </div>
  );
}
