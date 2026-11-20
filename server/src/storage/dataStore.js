/**
 * Validated access to the JSON data files. Services never touch the
 * filesystem directly; everything goes through these functions.
 *
 *   profiles.json – 30+ mock profiles (read-only at runtime). `likedUser`
 *                   records whether that person has already liked the demo user.
 *   user.json     – the single demo user (editable via the profile setup screen)
 *   swipes.json   – every LIKE / PASS made by the demo user
 *   matches.json  – mutual matches only
 *
 * Every call reads from disk (no in-memory cache), so the files are always the
 * single source of truth and survive browser refreshes and server restarts.
 */
const path = require('node:path');
const config = require('../config/env');
const { readJson, writeJsonAtomic, StorageError } = require('../utils/jsonStorage');

const FILES = {
  profiles: 'profiles.json',
  user: 'user.json',
  swipes: 'swipes.json',
  matches: 'matches.json',
};

const filePath = (name) => path.join(config.dataDir, FILES[name]);
const isNonEmptyString = (v) => typeof v === 'string' && v.trim() !== '';

function isValidPerson(p) {
  return (
    p &&
    typeof p === 'object' &&
    isNonEmptyString(p.id) &&
    isNonEmptyString(p.name) &&
    Number.isInteger(p.age) &&
    isNonEmptyString(p.photo) &&
    typeof p.bio === 'string' &&
    isNonEmptyString(p.location) &&
    Array.isArray(p.interests)
  );
}

function validateProfiles(profiles) {
  if (!Array.isArray(profiles)) throw new StorageError('profiles.json must contain a JSON array.');
  const ids = new Set();
  profiles.forEach((p, i) => {
    if (!isValidPerson(p) || typeof p.likedUser !== 'boolean') {
      throw new StorageError(`profiles.json entry #${i} is missing required fields.`);
    }
    if (ids.has(p.id)) throw new StorageError(`profiles.json has a duplicate id "${p.id}".`);
    ids.add(p.id);
  });
  return profiles;
}

function validateRecords(records, name, required) {
  if (!Array.isArray(records)) throw new StorageError(`${FILES[name]} must contain a JSON array.`);
  records.forEach((r, i) => {
    if (!r || !required.every((key) => isNonEmptyString(r[key]))) {
      throw new StorageError(`${FILES[name]} entry #${i} is malformed.`);
    }
  });
  return records;
}

async function getProfiles() {
  return validateProfiles(await readJson(filePath('profiles')));
}

async function getUser() {
  const user = await readJson(filePath('user'));
  if (!isValidPerson(user)) throw new StorageError('user.json is missing required fields.');
  return user;
}

async function getSwipes() {
  const swipes = await readJson(filePath('swipes'), { fallback: [] });
  return validateRecords(swipes, 'swipes', ['id', 'profileId', 'action', 'timestamp']);
}

async function getMatches() {
  const matches = await readJson(filePath('matches'), { fallback: [] });
  return validateRecords(matches, 'matches', ['id', 'profileId', 'timestamp']);
}

const saveUser = (user) => writeJsonAtomic(filePath('user'), user);
const saveSwipes = (swipes) => writeJsonAtomic(filePath('swipes'), swipes);
const saveMatches = (matches) => writeJsonAtomic(filePath('matches'), matches);

/** Fail-fast check used at startup and by /health. Creates swipes/matches files if missing. */
async function verifyDataFiles() {
  const [profiles, , swipes, matches] = await Promise.all([getProfiles(), getUser(), getSwipes(), getMatches()]);
  return { profiles: profiles.length, swipes: swipes.length, matches: matches.length };
}

module.exports = {
  getProfiles,
  getUser,
  getSwipes,
  getMatches,
  saveUser,
  saveSwipes,
  saveMatches,
  verifyDataFiles,
  FILES,
};
