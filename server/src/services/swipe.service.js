const { randomUUID } = require('node:crypto');
const store = require('../storage/dataStore');
const { withWriteLock } = require('../utils/jsonStorage');
const AppError = require('../utils/AppError');
const { toPublicProfile } = require('../utils/serializers');

/**
 * Records the demo user's swipe on `profileId`.
 *
 *  1. The profile must exist                      → otherwise 404
 *  2. It must not have been swiped on already     → otherwise 409
 *  3. The swipe is saved to swipes.json
 *  4. If the action is LIKE and that profile has `likedUser: true`,
 *     exactly one match is saved to matches.json
 *
 * The whole read-check-write sequence runs under the write lock, so concurrent
 * requests can't both pass the duplicate check or overwrite each other's writes.
 *
 * Write order: matches.json first, then swipes.json. If the process died
 * between the two writes, the swipe isn't recorded, so the user can swipe
 * again, and the existing-match check below then prevents a second match.
 *
 * Privacy: the response is identical for every non-mutual outcome. A LIKE on
 * someone who hasn't liked you looks exactly like any other one-sided like,
 * and a PASS never reveals anything.
 */
function recordSwipe({ profileId, action }) {
  return withWriteLock(async () => {
    const profiles = await store.getProfiles();
    const profile = profiles.find((p) => p.id === profileId);
    if (!profile) throw AppError.notFound('Profile not found.');

    const swipes = await store.getSwipes();
    if (swipes.some((s) => s.profileId === profileId)) {
      throw AppError.conflict('You have already swiped on this profile.', 'ALREADY_SWIPED');
    }

    const timestamp = new Date().toISOString();
    let match = null;

    if (action === 'LIKE' && profile.likedUser === true) {
      const matches = await store.getMatches();
      match = matches.find((m) => m.profileId === profileId) || null;
      if (!match) {
        match = { id: randomUUID(), profileId, timestamp };
        await store.saveMatches([...matches, match]);
      }
    }

    const swipe = { id: randomUUID(), profileId, action, timestamp };
    await store.saveSwipes([...swipes, swipe]);

    return {
      swipe: { profileId, action, timestamp },
      matched: Boolean(match),
      match: match ? { id: match.id, timestamp: match.timestamp, profile: toPublicProfile(profile) } : null,
    };
  });
}

module.exports = { recordSwipe };
