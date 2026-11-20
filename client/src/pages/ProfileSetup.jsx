import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Plus } from 'lucide-react';
import Logo from '../components/Logo';
import ProfilePhoto from '../components/ProfilePhoto';
import EmptyState from '../components/EmptyState';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { api, getErrorDetails, getErrorMessage } from '../services/api';
import '../styles/welcome.css';

const SUGGESTED_INTERESTS = [
  'Coffee', 'Travel', 'Music', 'Hiking', 'Books', 'Cooking', 'Photography', 'Fitness',
  'Gaming', 'Art', 'Movies', 'Dancing', 'Yoga', 'Startups', 'Street Food', 'Pets',
];
const MAX_INTERESTS = 8;
const BIO_MAX = 160;

/**
 * Optional, lightweight "make it yours" step. This is NOT authentication: it
 * just edits the single demo user's details (saved by the backend to user.json).
 */
export default function ProfileSetup() {
  const navigate = useNavigate();
  const { user, status, error, reload } = useCurrentUser();
  const [form, setForm] = useState(null);
  const [custom, setCustom] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && !form) {
      setForm({ name: user.name, age: String(user.age), location: user.location, bio: user.bio, interests: user.interests });
    }
  }, [user, form]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const toggleInterest = (interest) =>
    setForm((f) => {
      const has = f.interests.some((i) => i.toLowerCase() === interest.toLowerCase());
      if (has) return { ...f, interests: f.interests.filter((i) => i.toLowerCase() !== interest.toLowerCase()) };
      if (f.interests.length >= MAX_INTERESTS) return f;
      return { ...f, interests: [...f.interests, interest] };
    });

  const addCustom = () => {
    const value = custom.trim().replace(/\s+/g, ' ').slice(0, 24);
    if (value) toggleInterest(value);
    setCustom('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setFormError(null);
    try {
      await api.updateMe({ ...form, age: Number(form.age) });
      navigate('/discover');
    } catch (err) {
      setErrors(getErrorDetails(err) || {});
      setFormError(getErrorMessage(err));
      setSaving(false);
    }
  };

  const allInterests = form
    ? [...form.interests, ...SUGGESTED_INTERESTS.filter((s) => !form.interests.some((i) => i.toLowerCase() === s.toLowerCase()))]
    : SUGGESTED_INTERESTS;

  return (
    <div className="setup">
      <header className="onboard-top">
        <Logo to="/" />
        <Link to="/discover" className="btn btn--ghost">
          Skip for now
        </Link>
      </header>

      <main className="setup__main">
        {status === 'error' ? (
          <EmptyState art="error" tone="error" title="Couldn't load your profile" description={error}>
            <button type="button" className="btn btn--primary" onClick={reload}>
              Try again
            </button>
          </EmptyState>
        ) : !form ? (
          <div className="setup__card setup__card--loading skeleton" aria-busy="true" aria-label="Loading profile" />
        ) : (
          <form className="setup__card" onSubmit={handleSubmit} noValidate>
            <div className="setup__head">
              <span className="setup__avatar">
                <ProfilePhoto src={user.photo} name={form.name || user.name} eager />
              </span>
              <div>
                <span className="eyebrow">Optional · takes 20 seconds</span>
                <h1 className="setup__title">Make it yours</h1>
                <p className="setup__lead">This is a demo profile. There's no account, password or OTP.</p>
              </div>
            </div>

            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" value={form.name} onChange={update('name')} maxLength={40} autoComplete="given-name" aria-invalid={Boolean(errors.name)} />
              {errors.name && <span className="field__error">{errors.name}</span>}
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="age">Age</label>
                <input id="age" type="number" inputMode="numeric" min={18} max={99} value={form.age} onChange={update('age')} aria-invalid={Boolean(errors.age)} />
                {errors.age && <span className="field__error">{errors.age}</span>}
              </div>
              <div className="field">
                <label htmlFor="location">City or college</label>
                <input id="location" value={form.location} onChange={update('location')} maxLength={60} aria-invalid={Boolean(errors.location)} />
                {errors.location && <span className="field__error">{errors.location}</span>}
              </div>
            </div>

            <div className="field">
              <label htmlFor="bio">
                Short bio <span className="field__hint">{form.bio.length}/{BIO_MAX}</span>
              </label>
              <textarea id="bio" rows={3} value={form.bio} onChange={update('bio')} maxLength={BIO_MAX} aria-invalid={Boolean(errors.bio)} />
              {errors.bio && <span className="field__error">{errors.bio}</span>}
            </div>

            <fieldset className="field">
              <legend>
                Interests{' '}
                <span className="field__hint">
                  {form.interests.length}/{MAX_INTERESTS} selected
                </span>
              </legend>
              <div className="interest-picker">
                {allInterests.map((interest) => {
                  const selected = form.interests.some((i) => i.toLowerCase() === interest.toLowerCase());
                  return (
                    <button
                      type="button"
                      key={interest}
                      className={`interest-toggle${selected ? ' interest-toggle--on' : ''}`}
                      aria-pressed={selected}
                      onClick={() => toggleInterest(interest)}
                      disabled={!selected && form.interests.length >= MAX_INTERESTS}
                    >
                      {selected && <Check size={14} strokeWidth={3} aria-hidden="true" />}
                      {interest}
                    </button>
                  );
                })}
              </div>
              <div className="interest-add">
                <input
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustom();
                    }
                  }}
                  placeholder="Add your own…"
                  maxLength={24}
                  aria-label="Add a custom interest"
                />
                <button type="button" className="btn btn--soft" onClick={addCustom} disabled={!custom.trim() || form.interests.length >= MAX_INTERESTS}>
                  <Plus size={16} aria-hidden="true" /> Add
                </button>
              </div>
              {errors.interests && <span className="field__error">{errors.interests}</span>}
            </fieldset>

            {formError && (
              <p className="setup__error" role="alert">
                {formError}
              </p>
            )}

            <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={saving}>
              {saving ? 'Saving…' : 'Save & start discovering'} {!saving && <ArrowRight size={18} aria-hidden="true" />}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
