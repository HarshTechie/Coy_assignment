import { useCallback, useEffect, useRef, useState } from 'react';
import { api, getErrorMessage, getErrorStatus } from '../services/api';

const PAGE_SIZE = 20;
const REFILL_THRESHOLD = 3;

/**
 * Owns the Discover deck:
 *  - loads unswiped profiles from the API (the server is the source of truth),
 *  - removes a card optimistically when swiped, then persists the swipe,
 *  - restores the card if the request fails,
 *  - surfaces a match when the backend reports mutual interest,
 *  - tops up the deck when it runs low.
 */
export function useDiscover({ onMatch } = {}) {
  const [profiles, setProfiles] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState(null);
  const [remaining, setRemaining] = useState(0);
  const [total, setTotal] = useState(0);
  const [match, setMatch] = useState(null);
  const [notice, setNotice] = useState(null);

  const hasMoreRef = useRef(false);
  const fetchingRef = useRef(false);
  // IDs swiped in this session: guards against a refill racing an in-flight swipe.
  const swipedRef = useRef(new Set());
  const onMatchRef = useRef(onMatch);
  onMatchRef.current = onMatch;

  const fetchPage = useCallback(async ({ initial = false } = {}) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    if (initial) {
      setStatus('loading');
      setError(null);
    }
    try {
      const data = await api.getFeed({ limit: PAGE_SIZE });
      hasMoreRef.current = data.profiles.length === PAGE_SIZE && data.remaining > PAGE_SIZE;
      setTotal(data.total);
      if (initial) setRemaining(data.remaining);
      setProfiles((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        const fresh = data.profiles.filter((p) => !seen.has(p.id) && !swipedRef.current.has(p.id));
        return initial ? fresh : [...prev, ...fresh];
      });
      setStatus('ready');
    } catch (err) {
      if (initial) {
        setError(getErrorMessage(err));
        setStatus('error');
      }
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchPage({ initial: true });
  }, [fetchPage]);

  useEffect(() => {
    if (status === 'ready' && hasMoreRef.current && profiles.length <= REFILL_THRESHOLD) fetchPage();
  }, [profiles.length, status, fetchPage]);

  const recordSwipe = useCallback(async (profile, action) => {
    if (swipedRef.current.has(profile.id)) return; // never submit the same card twice
    swipedRef.current.add(profile.id);
    setProfiles((prev) => prev.filter((p) => p.id !== profile.id));
    setRemaining((r) => Math.max(0, r - 1));

    try {
      const result = await api.swipe(profile.id, action);
      if (result.matched && result.match) {
        setMatch(result.match);
        onMatchRef.current?.(result.match);
      }
    } catch (err) {
      const code = getErrorStatus(err);
      // 409: already recorded (e.g. another tab), so nothing to undo.
      // 404: profile no longer exists, so dropping the card is correct.
      if (code === 409 || code === 404) return;

      swipedRef.current.delete(profile.id);
      setProfiles((prev) => [profile, ...prev.filter((p) => p.id !== profile.id)]);
      setRemaining((r) => r + 1);
      setNotice({ type: 'error', text: `Couldn't save that swipe. ${getErrorMessage(err)}` });
    }
  }, []);

  /** Explicit demo action, triggered only by the user from the empty state. */
  const resetDemo = useCallback(async () => {
    try {
      await api.resetDemo();
      swipedRef.current = new Set();
      await fetchPage({ initial: true });
      setNotice({ type: 'success', text: 'Demo reset. Everyone is back in your deck.' });
    } catch (err) {
      setNotice({ type: 'error', text: getErrorMessage(err, 'Could not reset the demo.') });
    }
  }, [fetchPage]);

  const reload = useCallback(() => fetchPage({ initial: true }), [fetchPage]);
  const dismissMatch = useCallback(() => setMatch(null), []);
  const dismissNotice = useCallback(() => setNotice(null), []);

  return {
    profiles,
    status,
    error,
    remaining,
    total,
    match,
    notice,
    recordSwipe,
    reload,
    resetDemo,
    dismissMatch,
    dismissNotice,
  };
}
