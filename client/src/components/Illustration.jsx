/**
 * Small original illustrations for empty / placeholder states.
 * Pure SVG in the brand palette, so there are no external assets to break.
 */

const C = {
  coral: '#ff6f61',
  coralSoft: '#ffe4de',
  cherry: '#e0245e',
  lav: '#a996ff',
  lavSoft: '#eee9ff',
  cream: '#fff3ec',
  ink: '#241e1c',
  white: '#ffffff',
};

const Heart = ({ x, y, s = 1, fill = C.cherry }) => (
  <path
    transform={`translate(${x} ${y}) scale(${s})`}
    d="M0 6C0 2.7 2.4 0 5.4 0 7.3 0 9 1 10 2.6 11 1 12.7 0 14.6 0 17.6 0 20 2.7 20 6c0 6.4-10 12.4-10 12.4S0 12.4 0 6z"
    fill={fill}
  />
);

const Sparkle = ({ x, y, s = 1, fill = C.lav }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M6 0l1.6 4.4L12 6 7.6 7.6 6 12 4.4 7.6 0 6l4.4-1.6z" fill={fill} />
);

const Person = ({ x, y, bg, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx="20" cy="20" r="20" fill={bg} />
    <circle cx="20" cy="16" r="7" fill={C.white} opacity="0.95" />
    <path d="M7 34c2.5-6.5 7.5-9.5 13-9.5S30.5 27.5 33 34a20 20 0 0 1-26 0z" fill={C.white} opacity="0.95" />
  </g>
);

function CaughtUp() {
  return (
    <>
      <ellipse cx="100" cy="146" rx="62" ry="8" fill={C.coralSoft} />
      <rect x="44" y="30" width="78" height="104" rx="16" fill={C.lavSoft} transform="rotate(-12 83 82)" />
      <rect x="78" y="26" width="78" height="104" rx="16" fill={C.coralSoft} transform="rotate(10 117 78)" />
      <rect x="61" y="22" width="78" height="108" rx="16" fill={C.white} stroke={C.coralSoft} strokeWidth="2" />
      <rect x="69" y="30" width="62" height="58" rx="10" fill={C.cream} />
      <Person x={80} y={40} bg={C.lav} />
      <rect x="71" y="98" width="40" height="7" rx="3.5" fill={C.coralSoft} />
      <rect x="71" y="110" width="28" height="6" rx="3" fill={C.lavSoft} />
      <circle cx="139" cy="26" r="16" fill={C.cherry} />
      <path d="M132 26l5 5 9-10" stroke={C.white} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Sparkle x={30} y={30} />
      <Sparkle x={164} y={70} s={0.8} fill={C.coral} />
      <Sparkle x={40} y={110} s={0.6} />
    </>
  );
}

function NoMatches() {
  return (
    <>
      <ellipse cx="100" cy="146" rx="64" ry="8" fill={C.lavSoft} />
      <path d="M40 92c10-40 110-40 120 0" stroke={C.coralSoft} strokeWidth="3" strokeDasharray="6 7" fill="none" strokeLinecap="round" />
      <Person x={22} y={76} bg={C.coral} s={1.5} />
      <Person x={118} y={76} bg={C.lav} s={1.5} />
      <circle cx="100" cy="52" r="20" fill={C.white} stroke={C.coralSoft} strokeWidth="2" />
      <Heart x={90} y={44} fill={C.cherry} />
      <Sparkle x={150} y={30} fill={C.coral} />
      <Sparkle x={36} y={36} s={0.7} />
    </>
  );
}

function HomeArt() {
  return (
    <>
      <ellipse cx="100" cy="148" rx="60" ry="7" fill={C.coralSoft} />
      <rect x="62" y="14" width="76" height="130" rx="18" fill={C.ink} />
      <rect x="67" y="22" width="66" height="114" rx="13" fill={C.cream} />
      <rect x="74" y="32" width="52" height="34" rx="8" fill={C.lavSoft} />
      <rect x="74" y="72" width="52" height="8" rx="4" fill={C.coralSoft} />
      <rect x="74" y="86" width="36" height="8" rx="4" fill={C.lavSoft} />
      <rect x="74" y="100" width="44" height="8" rx="4" fill={C.coralSoft} />
      <circle cx="100" cy="49" r="9" fill={C.white} />
      <rect x="150" y="40" width="40" height="28" rx="12" fill={C.white} stroke={C.coralSoft} strokeWidth="2" />
      <Heart x={160} y={45} s={1} fill={C.coral} />
      <rect x="14" y="90" width="44" height="28" rx="12" fill={C.white} stroke={C.lavSoft} strokeWidth="2" />
      <circle cx="28" cy="104" r="3" fill={C.lav} />
      <circle cx="37" cy="104" r="3" fill={C.lav} />
      <circle cx="46" cy="104" r="3" fill={C.lav} />
      <Sparkle x={30} y={36} />
      <Sparkle x={168} y={112} s={0.7} fill={C.cherry} />
    </>
  );
}

function ErrorArt() {
  return (
    <>
      <ellipse cx="100" cy="146" rx="58" ry="7" fill={C.lavSoft} />
      <path
        d="M58 106a24 24 0 0 1 4-47.6A32 32 0 0 1 124 52a26 26 0 0 1 18 54z"
        fill={C.white}
        stroke={C.lavSoft}
        strokeWidth="3"
      />
      <path d="M86 78l28 20M114 78l-28 20" stroke={C.coral} strokeWidth="6" strokeLinecap="round" />
      <path d="M100 112v18" stroke={C.lav} strokeWidth="4" strokeLinecap="round" strokeDasharray="4 6" />
      <Sparkle x={150} y={30} fill={C.coral} s={0.8} />
    </>
  );
}

const VARIANTS = {
  'caught-up': CaughtUp,
  'no-matches': NoMatches,
  home: HomeArt,
  error: ErrorArt,
};

export default function Illustration({ variant = 'caught-up', className = '' }) {
  const Art = VARIANTS[variant] || CaughtUp;
  return (
    <svg viewBox="0 0 200 160" className={className} role="presentation" aria-hidden="true">
      <Art />
    </svg>
  );
}
