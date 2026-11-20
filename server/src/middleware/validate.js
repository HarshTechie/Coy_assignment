const AppError = require('../utils/AppError');

const SWIPE_ACTIONS = ['LIKE', 'PASS'];
const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

/** Validates and normalises the POST /swipe body → req.swipeInput. */
function validateSwipeBody(req, _res, next) {
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const errors = {};

  const { profileId } = body;
  if (typeof profileId !== 'string' || profileId.trim() === '') {
    errors.profileId = 'profileId is required and must be a string.';
  } else if (!ID_PATTERN.test(profileId.trim())) {
    errors.profileId = 'profileId has an invalid format.';
  }

  const action = typeof body.action === 'string' ? body.action.trim().toUpperCase() : body.action;
  if (!SWIPE_ACTIONS.includes(action)) {
    errors.action = `action must be one of: ${SWIPE_ACTIONS.join(', ')}.`;
  }

  if (Object.keys(errors).length > 0) {
    return next(AppError.badRequest('Invalid swipe request.', errors));
  }

  req.swipeInput = { profileId: profileId.trim(), action };
  return next();
}

/** Validates a :profileId route param (same format rules as the swipe body). */
function validateProfileIdParam(req, _res, next) {
  if (!ID_PATTERN.test(req.params.profileId || '')) {
    return next(AppError.badRequest('Invalid profile id.', { profileId: 'profileId has an invalid format.' }));
  }
  return next();
}

/** Validates an optional ?limit= query param (1–100) → req.feedLimit. */
function validateFeedQuery(req, _res, next) {
  const raw = req.query.limit;
  if (raw === undefined) {
    req.feedLimit = 50;
    return next();
  }
  const limit = Number(raw);
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return next(AppError.badRequest('limit must be an integer between 1 and 100.'));
  }
  req.feedLimit = limit;
  return next();
}

const cleanText = (v) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : v);

/** Validates the PUT /me body (profile setup) → req.userInput. */
function validateUserBody(req, _res, next) {
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const errors = {};
  const out = {};

  const name = cleanText(body.name);
  if (typeof name !== 'string' || name.length < 1 || name.length > 40) {
    errors.name = 'Name must be 1–40 characters.';
  } else out.name = name;

  const age = Number(body.age);
  if (!Number.isInteger(age) || age < 18 || age > 99) {
    errors.age = 'Age must be a whole number between 18 and 99.';
  } else out.age = age;

  const location = cleanText(body.location);
  if (typeof location !== 'string' || location.length < 1 || location.length > 60) {
    errors.location = 'City or college must be 1–60 characters.';
  } else out.location = location;

  if (body.bio !== undefined) {
    const bio = cleanText(body.bio);
    if (typeof bio !== 'string' || bio.length > 160) errors.bio = 'Bio must be at most 160 characters.';
    else out.bio = bio;
  }

  const interests = Array.isArray(body.interests) ? body.interests.map(cleanText) : null;
  if (
    !interests ||
    interests.length < 1 ||
    interests.length > 8 ||
    interests.some((i) => typeof i !== 'string' || i.length < 1 || i.length > 24)
  ) {
    errors.interests = 'Pick 1–8 interests (each up to 24 characters).';
  } else {
    // Case-insensitive de-duplication that keeps the first spelling entered.
    const seen = new Set();
    out.interests = interests.filter((i) => !seen.has(i.toLowerCase()) && seen.add(i.toLowerCase()));
  }

  if (Object.keys(errors).length > 0) {
    return next(AppError.badRequest('Please check your profile details.', errors));
  }
  req.userInput = out;
  return next();
}

module.exports = { validateSwipeBody, validateFeedQuery, validateUserBody, validateProfileIdParam, SWIPE_ACTIONS };
