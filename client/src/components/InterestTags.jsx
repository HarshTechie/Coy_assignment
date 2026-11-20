export default function InterestTags({ interests = [], glass = false, max }) {
  const shown = max ? interests.slice(0, max) : interests;
  const hidden = interests.length - shown.length;
  const cls = `chip${glass ? ' chip--glass' : ''}`;

  return (
    <ul className="chips" aria-label="Interests">
      {shown.map((interest) => (
        <li key={interest} className={cls}>
          {interest}
        </li>
      ))}
      {hidden > 0 && <li className={cls}>+{hidden}</li>}
    </ul>
  );
}
