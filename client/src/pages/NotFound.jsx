import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';

export default function NotFound() {
  return (
    <EmptyState art="error" title="This page wandered off" description="We couldn't find what you were looking for.">
      <Link to="/discover" className="btn btn--primary">
        Back to Discover
      </Link>
    </EmptyState>
  );
}
