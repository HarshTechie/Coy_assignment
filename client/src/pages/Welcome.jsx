import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Coffee, Heart, HeartHandshake, Lock, Music, Sparkles, UserRound, Zap } from 'lucide-react';
import Logo from '../components/Logo';
import '../styles/welcome.css';

/** Abstract portrait used in the hero illustration (no real profile data). */
function Portrait({ tone }) {
  return (
    <svg viewBox="0 0 120 140" className={`portrait portrait--${tone}`} aria-hidden="true">
      <circle cx="60" cy="54" r="24" fill="#fff" opacity="0.95" />
      <path d="M18 140c4-30 22-46 42-46s38 16 42 46z" fill="#fff" opacity="0.95" />
      <path d="M36 50c0-18 12-28 24-28s26 9 26 26c-8-6-18-9-30-8-8 1-14 4-20 10z" fill="currentColor" opacity="0.55" />
    </svg>
  );
}

const float = (delay = 0, distance = 8) => ({
  animate: { y: [0, -distance, 0] },
  transition: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay },
});

function WelcomeArt() {
  return (
    <div className="hero-art" aria-hidden="true">
      <div className="hero-art__glow" />

      <motion.div className="hero-card hero-card--left" initial={{ opacity: 0, rotate: -4 }} animate={{ opacity: 1, rotate: -12 }} transition={{ duration: 0.7, delay: 0.1 }}>
        <div className="hero-card__portrait hero-card__portrait--lav">
          <Portrait tone="lav" />
        </div>
      </motion.div>

      <motion.div className="hero-card hero-card--right" initial={{ opacity: 0, rotate: 4 }} animate={{ opacity: 1, rotate: 11 }} transition={{ duration: 0.7, delay: 0.2 }}>
        <div className="hero-card__portrait hero-card__portrait--coral">
          <Portrait tone="coral" />
        </div>
      </motion.div>

      <motion.div className="hero-card hero-card--front" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}>
        <div className="hero-card__portrait hero-card__portrait--cherry">
          <Portrait tone="cherry" />
          <span className="hero-card__like">
            <Heart size={16} fill="currentColor" strokeWidth={0} /> Like
          </span>
        </div>
        <div className="hero-card__meta">
          <span className="hero-card__line hero-card__line--name" />
          <span className="hero-card__line" />
          <div className="hero-card__tags">
            <span className="chip">Coffee</span>
            <span className="chip">Treks</span>
            <span className="chip">Jazz</span>
          </div>
        </div>
      </motion.div>

      <motion.div className="hero-bubble hero-bubble--match" {...float(0.2, 10)}>
        <span className="hero-bubble__icon">
          <Heart size={14} fill="currentColor" strokeWidth={0} />
        </span>
        It&apos;s a match!
      </motion.div>
      <motion.div className="hero-bubble hero-bubble--music" {...float(1, 8)}>
        <Music size={16} /> Indie music
      </motion.div>
      <motion.div className="hero-bubble hero-bubble--coffee" {...float(1.8, 6)}>
        <Coffee size={16} /> Coffee dates
      </motion.div>
      <motion.div className="hero-sparkle" {...float(0.6, 12)}>
        <Sparkles size={26} />
      </motion.div>
    </div>
  );
}

export default function Welcome() {
  return (
    <div className="welcome">
      <header className="onboard-top">
        <Logo to="/" />
      </header>

      <main className="welcome__main">
        <motion.section
          className="welcome__copy"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="eyebrow">
            <Sparkles size={14} aria-hidden="true" /> Swipe · Match · Vibe
          </span>
          <h1 className="welcome__title">
            Meet people who get your <span className="text-gradient">vibe</span>.
          </h1>
          <p className="welcome__text">
            Coy Discover shows you one person at a time. Like the ones you&apos;re curious about and pass on the rest.
            You both find out only when the feeling is mutual.
          </p>

          <div className="welcome__actions">
            <Link to="/setup" className="btn btn--primary btn--lg">
              Get Started <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link to="/discover" className="btn btn--white btn--lg">
              <UserRound size={18} aria-hidden="true" /> Continue as Demo User
            </Link>
          </div>

          <ul className="welcome__perks">
            <li>
              <Lock size={16} aria-hidden="true" /> Likes stay private
            </li>
            <li>
              <Zap size={16} aria-hidden="true" /> No sign-up needed
            </li>
            <li>
              <HeartHandshake size={16} aria-hidden="true" /> Mutual matches only
            </li>
          </ul>
        </motion.section>

        <WelcomeArt />
      </main>
    </div>
  );
}
