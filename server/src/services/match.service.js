const store = require('../storage/dataStore');
const { withWriteLock } = require('../utils/jsonStorage');
const AppError = require('../utils/AppError');
const { toPublicProfile } = require('../utils/serializers');

/**
 * Mutual matches, newest first. Data comes only from matches.json, and entries
 * are written there only when both sides have liked each other, so a
 * one-sided incoming like (`likedUser: true` without a LIKE back) never
 * appears here.
 */
async function listMatches() {
  const [matches, profiles] = await Promise.all([store.getMatches(), store.getProfiles()]);
  const byId = new Map(profiles.map((p) => [p.id, p]));

  return matches
    .filter((m) => byId.has(m.profileId))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .map((m) => ({ id: m.id, timestamp: m.timestamp, profile: toPublicProfile(byId.get(m.profileId)) }));
}

/**
 * Removes the demo user's match with `profileId`.
 *
 * - Only an existing match can be removed. matches.json holds only the demo
 *   user's own matches, so nobody else's data can be affected.
 * - swipes.json is deliberately left untouched: the original LIKE stays on
 *   record, which keeps the profile out of the Discover feed and makes a
 *   re-swipe return 409, so an unmatched person never silently reappears.
 * - Privacy: "no match with this profile" returns the same 404 whether the
 *   profile doesn't exist, was never liked, or liked the user without a
 *   match, so this endpoint can't be used to probe for incoming likes.
 */
function removeMatch(profileId) {
  return withWriteLock(async () => {
    const matches = await store.getMatches();
    const target = matches.find((m) => m.profileId === profileId);
    if (!target) throw AppError.notFound('No match found with this profile.');

    await store.saveMatches(matches.filter((m) => m.profileId !== profileId));
    return { profileId, matchId: target.id };
  });
}

module.exports = { listMatches, removeMatch };
