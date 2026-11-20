import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { Heart, MapPin, X } from 'lucide-react';
import ProfilePhoto from './ProfilePhoto';
import InterestTags from './InterestTags';

const SWIPE_DISTANCE = 110; // px dragged before release counts as a swipe
const SWIPE_VELOCITY = 550; // px/s flick that counts as a swipe

/**
 * A draggable profile card.
 *
 *  - Drag right/left past the threshold (or flick) to LIKE/PASS. Otherwise it springs back.
 *  - The parent can trigger a swipe via ref: `cardRef.current.swipe('LIKE')`.
 *  - `onDecision(action)` fires the moment a swipe is committed (for instant feedback).
 *  - `onSwiped(profile, action)` fires once the card has left the screen.
 *  - A `leaving` guard makes every card submit at most once (no double swipes).
 */
const ProfileCard = forwardRef(function ProfileCard({ profile, depth = 0, onDecision, onSwiped }, ref) {
  const isTop = depth === 0;
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-320, 0, 320], [-14, 0, 14]);
  const likeOpacity = useTransform(x, [24, SWIPE_DISTANCE], [0, 1]);
  const passOpacity = useTransform(x, [-SWIPE_DISTANCE, -24], [1, 0]);
  const leaving = useRef(false);

  const flyOut = useCallback(
    async (action) => {
      if (leaving.current) return;
      leaving.current = true;
      onDecision?.(action);
      const direction = action === 'LIKE' ? 1 : -1;
      const distance = Math.max(window.innerWidth, 640) + 200;
      await animate(x, direction * distance, { duration: 0.42, ease: [0.32, 0.72, 0, 1] });
      onSwiped(profile, action);
    },
    [onDecision, onSwiped, profile, x],
  );

  useImperativeHandle(ref, () => ({ swipe: flyOut }), [flyOut]);

  const handleDragEnd = (_event, { offset, velocity }) => {
    if (offset.x > SWIPE_DISTANCE || velocity.x > SWIPE_VELOCITY) flyOut('LIKE');
    else if (offset.x < -SWIPE_DISTANCE || velocity.x < -SWIPE_VELOCITY) flyOut('PASS');
    else animate(x, 0, { type: 'spring', stiffness: 520, damping: 32 });
  };

  return (
    <motion.article
      className={`profile-card${isTop ? ' profile-card--top' : ''}`}
      style={{ x, rotate, zIndex: 10 - depth }}
      initial={{ scale: 0.94, y: 22, opacity: 0 }}
      animate={{ scale: 1 - depth * 0.05, y: depth * 16, opacity: depth > 2 ? 0 : 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      drag={isTop ? 'x' : false}
      dragMomentum={false}
      dragElastic={0.85}
      onDragEnd={handleDragEnd}
      aria-hidden={!isTop}
      aria-label={isTop ? `${profile.name}, ${profile.age}, ${profile.location}` : undefined}
    >
      <ProfilePhoto src={profile.photo} name={profile.name} className="profile-card__photo" eager={depth < 2} />
      <div className="profile-card__scrim" aria-hidden="true" />

      {isTop && (
        <>
          <motion.div className="stamp stamp--like" style={{ opacity: likeOpacity }} aria-hidden="true">
            <Heart size={20} fill="currentColor" strokeWidth={0} /> Like
          </motion.div>
          <motion.div className="stamp stamp--pass" style={{ opacity: passOpacity }} aria-hidden="true">
            <X size={20} strokeWidth={3} /> Pass
          </motion.div>
        </>
      )}

      <div className="profile-card__info">
        <h2 className="profile-card__name">
          {profile.name}
          <span className="profile-card__age">{profile.age}</span>
        </h2>
        <p className="profile-card__location">
          <MapPin size={15} strokeWidth={2.4} aria-hidden="true" />
          {profile.location}
        </p>
        <p className="profile-card__bio">{profile.bio}</p>
        <InterestTags interests={profile.interests} glass max={4} />
      </div>
    </motion.article>
  );
});

export default ProfileCard;
