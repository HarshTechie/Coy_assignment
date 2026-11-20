import { useCallback, useEffect, useState } from 'react';
import { api, getErrorMessage, getErrorStatus } from '../services/api';

export function useMatches() {
  const [matches, setMatches] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const data = await api.getMatches();
      setMatches(data.matches);
      setStatus('ready');
    } catch (err) {
      setError(getErrorMessage(err));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /**
   * Unmatches a profile. The card is removed from the UI only after the server
   * confirms, so the list never shows something that isn't true on disk.
   *  - resolves 'removed' on success,
   *  - resolves 'already-gone' on 404 (e.g. removed in another tab), and the card is dropped too,
   *  - rejects with a user-facing message on any other failure (the card stays).
   */
  const unmatch = useCallback(async (profileId) => {
    const drop = () => setMatches((prev) => prev.filter((m) => m.profile.id !== profileId));
    try {
      await api.unmatch(profileId);
      drop();
      return 'removed';
    } catch (err) {
      if (getErrorStatus(err) === 404) {
        drop();
        return 'already-gone';
      }
      throw new Error(getErrorMessage(err, "Couldn't unmatch right now. Please try again."));
    }
  }, []);

  return { matches, status, error, reload: load, unmatch };
}
