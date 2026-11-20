/**
 * Public representation of a profile (or the demo user).
 *
 * This is an explicit allow-list: only these fields ever leave the API.
 * In particular `likedUser`, whether a person has liked the demo user,
 * is stored in profiles.json but is NEVER sent to the client.
 */
function toPublicProfile(profile) {
  return {
    id: profile.id,
    name: profile.name,
    age: profile.age,
    photo: profile.photo,
    bio: profile.bio,
    location: profile.location,
    interests: profile.interests,
  };
}

module.exports = { toPublicProfile };
