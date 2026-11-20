const store = require('../storage/dataStore');
const { withWriteLock } = require('../utils/jsonStorage');
const { toPublicProfile } = require('../utils/serializers');

/** The single demo user (there is no real authentication in this app). */
async function getUser() {
  return toPublicProfile(await store.getUser());
}

/** Updates the demo user's basic details from the optional profile setup screen. */
function updateUser(changes) {
  return withWriteLock(async () => {
    const current = await store.getUser();
    const updated = { ...current, ...changes, id: current.id, photo: current.photo };
    await store.saveUser(updated);
    return toPublicProfile(updated);
  });
}

/**
 * Explicit demo action: clears all swipes and matches so the demo can be
 * replayed. profiles.json and user.json are left untouched. Never runs automatically.
 */
function resetActivity() {
  return withWriteLock(async () => {
    const [swipes, matches] = await Promise.all([store.getSwipes(), store.getMatches()]);
    await store.saveMatches([]);
    await store.saveSwipes([]);
    return { swipesDeleted: swipes.length, matchesDeleted: matches.length };
  });
}

module.exports = { getUser, updateUser, resetActivity };
