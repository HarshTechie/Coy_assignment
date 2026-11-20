import { Link } from 'react-router-dom';

/** Original "spark heart" mark + wordmark. */
export function LogoMark({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="logo__mark">
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff7a5c" />
          <stop offset="1" stopColor="#e0245e" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="url(#logo-grad)" />
      <path
        d="M32 48s-14-8.4-14-18.6C18 24.2 21.8 21 26 21c2.7 0 4.7 1.4 6 3.4 1.3-2 3.3-3.4 6-3.4 4.2 0 8 3.2 8 8.4C46 39.6 32 48 32 48z"
        fill="#fff"
      />
      <circle cx="46" cy="18" r="4" fill="#eee9ff" />
    </svg>
  );
}

export default function Logo({ to = '/home', showTag = true }) {
  return (
    <Link to={to} className="logo" aria-label="Coy Discover">
      <LogoMark />
      <span className="logo__word">coy</span>
      {showTag && <span className="logo__tag">discover</span>}
    </Link>
  );
}
