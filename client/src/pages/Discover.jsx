import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Hand, Heart, Keyboard, Lock, RotateCcw } from 'lucide-react';
import ProfileCard from '../components/ProfileCard';
import SwipeButtons from '../components/SwipeButtons';
import HeartBurst from '../components/HeartBurst';
import MatchModal from '../components/MatchModal';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import { useDiscover } from '../hooks/useDiscover';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import '../styles/discover.css';

const VISIBLE_CARDS = 3;

function Progress({ remaining, total }) {
  const seen = Math.max(0, total - remaining);
  const pct = total ? Math.round((seen / total) * 100) : 0;
  return (
    <div className="progress" aria-label={`${seen} of ${total} profiles seen`}>
      <div className="progress__bar" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={seen}>
        <div className="progress__fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="progress__label">
        {remaining} {remaining === 1 ? 'person' : 'people'} left
      </span>
    </div>
  );
}

function ResetDemo({ onReset }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!confirming) {
    return (
      <button type="button" className="btn btn--soft" onClick={() => setConfirming(true)}>
        <RotateCcw size={16} aria-hidden="true" /> Reset demo
      </button>
    );
  }
  return (
    <div className="reset-confirm" role="group" aria-label="Confirm demo reset">
      <span>Clear all swipes and matches?</span>
      <div className="reset-confirm__buttons">
        <button
          type="button"
          className="btn btn--primary"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await onReset();
            setBusy(false);
            setConfirming(false);
          }}
        >
          {busy ? 'Resetting…' : 'Yes, reset'}
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => setConfirming(false)} disabled={busy}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function Discover() {
  const navigate = useNavigate();
  const { user, notifyMatch } = useOutletContext();
  const deck = useDiscover({ onMatch: notifyMatch });
  const { profiles, status, error, remaining, total, match, notice, recordSwipe } = deck;
  const topCardRef = useRef(null);
  const [burstKey, setBurstKey] = useState(0);

  const visible = profiles.slice(0, VISIBLE_CARDS);
  const hasCards = visible.length > 0;

  const handleDecision = useCallback((action) => {
    if (action === 'LIKE') setBurstKey((k) => k + 1);
  }, []);

  const shortcuts = useMemo(
    () => ({
      ArrowLeft: () => topCardRef.current?.swipe('PASS'),
      ArrowRight: () => topCardRef.current?.swipe('LIKE'),
    }),
    [],
  );
  useKeyboardShortcuts(shortcuts, status === 'ready' && hasCards && !match);

  const intro = (
    <section className="discover__intro">
      <span className="eyebrow discover__eyebrow">Discover</span>
      <h1 className="discover__title">
        People you might <span className="text-gradient">vibe</span> with
      </h1>
      <p className="discover__subtitle">
        Swipe right if you&apos;d like to connect, left to pass. Nobody finds out you liked them unless it&apos;s mutual.
      </p>
      {status === 'ready' && total > 0 && <Progress remaining={remaining} total={total} />}
      <ul className="discover__tips">
        <li>
          <Hand size={16} aria-hidden="true" /> Drag the card
        </li>
        <li>
          <Keyboard size={16} aria-hidden="true" /> Use ← → keys
        </li>
        <li>
          <Lock size={16} aria-hidden="true" /> Likes stay private
        </li>
      </ul>
    </section>
  );

  let body;
  if (status === 'error') {
    body = (
      <EmptyState art="error" tone="error" title="Couldn't load profiles" description={error}>
        <button type="button" className="btn btn--primary" onClick={deck.reload}>
          Try again
        </button>
      </EmptyState>
    );
  } else if (status === 'ready' && !hasCards) {
    body = (
      <EmptyState
        art="caught-up"
        title="You've seen everyone for now"
        description="New people join all the time, so check back soon. Meanwhile, see who liked you back."
        note="Reset is a demo-only action. It clears your saved swipes and matches."
      >
        <button type="button" className="btn btn--primary" onClick={() => navigate('/matches')}>
          <Heart size={16} fill="currentColor" strokeWidth={0} aria-hidden="true" /> View matches
        </button>
        <ResetDemo onReset={deck.resetDemo} />
      </EmptyState>
    );
  } else {
    body = (
      <section className="deck" aria-label="Profiles">
        <div className="deck__stage">
          {status === 'loading' ? (
            <div className="deck__skeleton skeleton" aria-busy="true" aria-label="Loading profiles" />
          ) : (
            visible.map((profile, index) => (
              <ProfileCard
                key={profile.id}
                ref={index === 0 ? topCardRef : undefined}
                profile={profile}
                depth={index}
                onDecision={handleDecision}
                onSwiped={recordSwipe}
              />
            ))
          )}
          <HeartBurst burstKey={burstKey} />
        </div>
        <SwipeButtons
          onPass={() => topCardRef.current?.swipe('PASS')}
          onLike={() => topCardRef.current?.swipe('LIKE')}
          disabled={status !== 'ready' || !hasCards}
        />
        <p className="deck__hint">Tip: drag the card or press ← / →</p>
      </section>
    );
  }

  const single = status === 'error' || (status === 'ready' && !hasCards);

  return (
    <div className={`discover${single ? ' discover--single' : ''}`}>
      {!single && intro}
      {body}

      <MatchModal
        match={match}
        currentUser={user}
        onContinue={deck.dismissMatch}
        onViewMatches={() => {
          deck.dismissMatch();
          navigate('/matches');
        }}
      />
      <Toast notice={notice} onDismiss={deck.dismissNotice} />
    </div>
  );
}
