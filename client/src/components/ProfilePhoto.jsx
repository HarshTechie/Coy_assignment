import { useState } from 'react';

/** Profile image that falls back to an initial if the remote photo fails to load. */
export default function ProfilePhoto({ src, name = '', className = '', eager = false }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`photo photo--fallback ${className}`} role="img" aria-label={name}>
        {name.charAt(0).toUpperCase() || '?'}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className={`photo ${className}`}
      loading={eager ? 'eager' : 'lazy'}
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}
