const store = require('../storage/dataStore');
const { toPublicProfile } = require('../utils/serializers');

/**
 * Profiles the demo user has not swiped on yet (LIKE or PASS).
 *
 * Privacy: `likedUser` is never read here. Filtering uses only the demo user's
 * own swipes, and ordering is by id, so neither the contents nor the order of
 * the feed can hint at who has liked the user.
 */
async function getFeed({ limit = 50 } = {}) {
  const [profiles, swipes] = await Promise.all([store.getProfiles(), store.getSwipes()]);
  const swiped = new Set(swipes.map((s) => s.profileId));

  const unswiped = profiles
    .filter((p) => !swiped.has(p.id))
    .sort((a, b) => a.id.localeCompare(b.id));

  return {
    profiles: unswiped.slice(0, limit).map(toPublicProfile),
    remaining: unswiped.length,
    total: profiles.length,
  };
}

module.exports = { getFeed };
