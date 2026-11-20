import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, MapPin } from 'lucide-react';
import ProfilePhoto from '../components/ProfilePhoto';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import MatchCardMenu from '../components/MatchCardMenu';
import Toast from '../components/Toast';
import { useMatches } from '../hooks/useMatches';
import { formatRelativeTime } from '../services/format';
import '../styles/matches.css';

export default function Matches() {
  const navigate = useNavigate();
  const { matches, status, error, reload, unmatch } = useMatches();

  // Unmatch flow state
  const [pending, setPending] = useState(null); // the match awaiting confirmation
  const [busy, setBusy] = useState(false);
  const [dialogError, setDialogError] = useState(null);
  const [notice, setNotice] = useState(null);

  const askUnmatch = (match) => {
    setDialogError(null);
    setPending(match);
  };

  const cancelUnmatch = useCallback(() => {
    if (busy) return;
    setPending(null);
    setDialogError(null);
  }, [busy]);

  const confirmUnmatch = async () => {
    if (!pending) return;
    const { name, id } = pending.profile;
    setBusy(true);
    setDialogError(null);
    try {
      const outcome = await unmatch(id);
      setPending(null);
      setNotice({
        type: 'success',
        text: outcome === 'already-gone' ? `${name} was already removed from your matches.` : `You unmatched ${name}. They won't show up in Discover again.`,
      });
    } catch (err) {
      setDialogError(err.message); // keep the dialog open so the user can retry
    } finally {
      setBusy(false);
    }
  };

  const dismissNotice = useCallback(() => setNotice(null), []);

  let content;
  if (status === 'loading') {
    content = (
      <ul className="matches-grid" aria-busy="true" aria-label="Loading matches">
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i} className="match-card match-card--skeleton skeleton" />
        ))}
      </ul>
    );
  } else if (status === 'error') {
    content = (
      <EmptyState art="error" tone="error" title="Couldn't load matches" description={error}>
        <button type="button" className="btn btn--primary" onClick={reload}>
          Try again
        </button>
      </EmptyState>
    );
  } else if (matches.length === 0) {
    content = (
      <EmptyState
        art="no-matches"
        title="No matches yet"
        description="When someone you like likes you back, they'll show up here. Interest stays private until it's mutual."
      >
        <button type="button" className="btn btn--primary" onClick={() => navigate('/discover')}>
          Start discovering
        </button>
      </EmptyState>
    );
  } else {
    content = (
      <ul className="matches-grid">
        <AnimatePresence initial={false}>
          {matches.map((m, i) => (
            <motion.li
              key={m.id}
              layout
              className="match-card"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i * 0.05, 0.4), duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.25 } }}
            >
              <ProfilePhoto src={m.profile.photo} name={m.profile.name} className="match-card__photo" />
              <div className="match-card__scrim" aria-hidden="true" />
              <span className="match-card__when">
                <Heart size={12} fill="currentColor" strokeWidth={0} aria-hidden="true" />
                {formatRelativeTime(m.timestamp)}
              </span>
              <MatchCardMenu name={m.profile.name} onUnmatch={() => askUnmatch(m)} />
              <div className="match-card__info">
                <h2 className="match-card__name">
                  {m.profile.name}, <span>{m.profile.age}</span>
                </h2>
                <p className="match-card__location">
                  <MapPin size={13} strokeWidth={2.4} aria-hidden="true" /> {m.profile.location}
                </p>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    );
  }

  return (
    <div className="matches">
      <header className="matches__header">
        <div>
          <h1 className="matches__title">
            Your <span className="text-gradient">matches</span>
          </h1>
          <p className="matches__subtitle">People you both liked. Only mutual likes ever show up here.</p>
        </div>
        {status === 'ready' && matches.length > 0 && (
          <span className="matches__count">
            <Heart size={14} fill="currentColor" strokeWidth={0} aria-hidden="true" />
            {matches.length} {matches.length === 1 ? 'match' : 'matches'}
          </span>
        )}
      </header>

      {content}

      <ConfirmDialog
        open={Boolean(pending)}
        title={pending ? `Unmatch ${pending.profile.name}?` : ''}
        description={
          pending
            ? `${pending.profile.name} will be removed from your matches and won't appear in Discover again. This can't be undone.`
            : ''
        }
        media={
          pending && (
            <span className="confirm-dialog__avatar">
              <ProfilePhoto src={pending.profile.photo} name={pending.profile.name} eager />
            </span>
          )
        }
        confirmLabel="Unmatch"
        busyLabel="Unmatching…"
        cancelLabel="Keep match"
        busy={busy}
        error={dialogError}
        onConfirm={confirmUnmatch}
        onCancel={cancelUnmatch}
      />
      <Toast notice={notice} onDismiss={dismissNotice} />
    </div>
  );
}
