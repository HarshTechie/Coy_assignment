import { useCallback, useEffect, useState } from 'react';
import { api, getErrorMessage } from '../services/api';

/** The fixed demo user (no real authentication in this app). */
export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      setUser(await api.getMe());
      setStatus('ready');
    } catch (err) {
      setError(getErrorMessage(err));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { user, setUser, status, error, reload: load };
}
