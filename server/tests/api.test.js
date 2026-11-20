/**
 * Integration tests for the Coy Discover API (JSON-file storage).
 *
 * Runs against a throwaway copy of data/ in the OS temp dir, so the real
 * JSON files are never touched. Every test starts from the pristine
 * profiles.json / user.json with empty swipes and matches.
 */
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const SOURCE_DIR = path.join(__dirname, '..', 'data');
const TEST_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'coy-discover-test-'));
process.env.NODE_ENV = 'test';
process.env.DATA_DIR = TEST_DATA_DIR;

const { test, beforeEach, after, describe } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../src/app');

const file = (name) => path.join(TEST_DATA_DIR, name);
const readFile = (name) => JSON.parse(fs.readFileSync(file(name), 'utf8'));
const writeFile = (name, data) => fs.writeFileSync(file(name), typeof data === 'string' ? data : JSON.stringify(data));

const PROFILES = JSON.parse(fs.readFileSync(path.join(SOURCE_DIR, 'profiles.json'), 'utf8'));
const LIKED_USER = PROFILES.filter((p) => p.likedUser).map((p) => p.id);
const NOT_LIKED = PROFILES.filter((p) => !p.likedUser).map((p) => p.id);
const PUBLIC_FIELDS = ['id', 'name', 'age', 'photo', 'bio', 'location', 'interests'].sort();

let api;
const swipe = (profileId, action) => api.post('/swipe').send({ profileId, action });

beforeEach(() => {
  fs.copyFileSync(path.join(SOURCE_DIR, 'profiles.json'), file('profiles.json'));
  fs.copyFileSync(path.join(SOURCE_DIR, 'user.json'), file('user.json'));
  writeFile('swipes.json', []);
  writeFile('matches.json', []);
  api = request(createApp());
});

after(() => {
  fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
});

describe('profile data', () => {
  test('1. profiles.json has at least 30 complete profiles with unique photos', async () => {
    assert.ok(PROFILES.length >= 30, `expected >= 30 profiles, got ${PROFILES.length}`);
    for (const p of PROFILES) {
      for (const key of ['id', 'name', 'age', 'photo', 'bio', 'location', 'interests', 'likedUser']) {
        assert.ok(p[key] !== undefined, `${p.id} missing ${key}`);
      }
      assert.equal(typeof p.likedUser, 'boolean');
      assert.ok(p.interests.length > 0);
    }
    assert.equal(new Set(PROFILES.map((p) => p.photo)).size, PROFILES.length, 'photos must be unique');
    assert.equal(new Set(PROFILES.map((p) => p.id)).size, PROFILES.length, 'ids must be unique');
    assert.ok(LIKED_USER.length > 0 && NOT_LIKED.length > 0);

    const res = await api.get('/feed?limit=100').expect(200);
    assert.equal(res.body.total, PROFILES.length);
    assert.equal(res.body.profiles.length, PROFILES.length);
  });
});

describe('GET /feed', () => {
  test('2. does not contain already-swiped profiles', async () => {
    await swipe(NOT_LIKED[0], 'LIKE').expect(201);
    await swipe(NOT_LIKED[1], 'PASS').expect(201);
    const res = await api.get('/feed?limit=100').expect(200);
    const ids = res.body.profiles.map((p) => p.id);
    assert.ok(!ids.includes(NOT_LIKED[0]) && !ids.includes(NOT_LIKED[1]));
    assert.equal(res.body.remaining, PROFILES.length - 2);
    assert.equal(new Set(ids).size, ids.length, 'no duplicates');
  });

  test('is also served under /api (used by the Vite dev proxy)', async () => {
    const a = await api.get('/feed?limit=5').expect(200);
    const b = await api.get('/api/feed?limit=5').expect(200);
    assert.deepEqual(a.body, b.body);
  });

  test('honours limit and reports remaining/total', async () => {
    await api.get('/feed?limit=abc').expect(400);
    await api.get('/feed?limit=0').expect(400);
    const res = await api.get('/feed?limit=5').expect(200);
    assert.equal(res.body.profiles.length, 5);
    assert.equal(res.body.remaining, PROFILES.length);
  });

  test('11. is empty once every profile has been swiped', async () => {
    for (const p of PROFILES) await swipe(p.id, 'PASS').expect(201);
    const res = await api.get('/feed').expect(200);
    assert.deepEqual(res.body, { profiles: [], remaining: 0, total: PROFILES.length });
  });
});

describe('POST /swipe', () => {
  test('3. swiping right records a LIKE with profileId, action and timestamp', async () => {
    const res = await swipe(NOT_LIKED[0], 'LIKE').expect(201);
    assert.equal(res.body.swipe.action, 'LIKE');
    const [stored] = readFile('swipes.json');
    assert.equal(stored.profileId, NOT_LIKED[0]);
    assert.equal(stored.action, 'LIKE');
    assert.ok(!Number.isNaN(Date.parse(stored.timestamp)));
    assert.ok(stored.id);
  });

  test('4. swiping left records a PASS', async () => {
    await swipe(LIKED_USER[0], 'PASS').expect(201);
    const [stored] = readFile('swipes.json');
    assert.deepEqual([stored.profileId, stored.action], [LIKED_USER[0], 'PASS']);
  });

  test('5. a profile cannot be swiped on twice (same or different action)', async () => {
    await swipe(NOT_LIKED[0], 'PASS').expect(201);
    const dup = await swipe(NOT_LIKED[0], 'PASS').expect(409);
    assert.equal(dup.body.error.code, 'ALREADY_SWIPED');
    await swipe(NOT_LIKED[0], 'LIKE').expect(409);
    assert.equal(readFile('swipes.json').length, 1);
  });

  test('5b. concurrent duplicate submissions store exactly one swipe', async () => {
    const results = await Promise.all(Array.from({ length: 5 }, () => swipe(NOT_LIKED[0], 'LIKE')));
    assert.deepEqual(results.map((r) => r.status).sort(), [201, 409, 409, 409, 409]);
    assert.equal(readFile('swipes.json').length, 1);
  });

  test('6. a mutual like creates exactly one match', async () => {
    const res = await swipe(LIKED_USER[0], 'LIKE').expect(201);
    assert.equal(res.body.matched, true);
    assert.equal(res.body.match.profile.id, LIKED_USER[0]);
    assert.ok(res.body.match.id && res.body.match.timestamp);

    await swipe(LIKED_USER[0], 'LIKE').expect(409);
    const matches = readFile('matches.json');
    assert.equal(matches.length, 1);
    assert.deepEqual(Object.keys(matches[0]).sort(), ['id', 'profileId', 'timestamp']);
    assert.equal(matches[0].profileId, LIKED_USER[0]);
  });

  test('6b. concurrent mutual likes still create exactly one match', async () => {
    await Promise.all(Array.from({ length: 5 }, () => swipe(LIKED_USER[0], 'LIKE')));
    assert.equal(readFile('matches.json').length, 1);
  });

  test('liking a profile that has not liked the user records the like but creates no match', async () => {
    const res = await swipe(NOT_LIKED[0], 'LIKE').expect(201);
    assert.equal(res.body.matched, false);
    assert.equal(res.body.match, null);
    assert.equal(readFile('swipes.json').length, 1);
    assert.deepEqual(readFile('matches.json'), []);
  });

  test('passing on a profile that liked the user creates no match', async () => {
    const res = await swipe(LIKED_USER[0], 'PASS').expect(201);
    assert.equal(res.body.matched, false);
    assert.deepEqual(readFile('matches.json'), []);
  });

  describe('validation', () => {
    test('rejects invalid actions', async () => {
      const res = await swipe(NOT_LIKED[0], 'SUPERLIKE').expect(400);
      assert.equal(res.body.error.code, 'VALIDATION_ERROR');
      assert.ok(res.body.error.details.action);
      await api.post('/swipe').send({ profileId: NOT_LIKED[0] }).expect(400);
    });

    test('rejects missing / malformed profileId', async () => {
      await api.post('/swipe').send({ action: 'LIKE' }).expect(400);
      await swipe(12345, 'LIKE').expect(400);
      await swipe('../../etc/passwd', 'LIKE').expect(400);
    });

    test('returns 404 for unknown profiles and malformed JSON is a 400', async () => {
      await swipe('profile_missing', 'LIKE').expect(404);
      await api.post('/swipe').set('Content-Type', 'application/json').send('{"profileId":').expect(400);
    });

    test('accepts lowercase actions', async () => {
      const res = await swipe(NOT_LIKED[0], 'like').expect(201);
      assert.equal(res.body.swipe.action, 'LIKE');
    });

    test('invalid requests never write to disk', async () => {
      await swipe('profile_missing', 'LIKE');
      await swipe(NOT_LIKED[0], 'MAYBE');
      assert.deepEqual(readFile('swipes.json'), []);
    });
  });
});

describe('privacy', () => {
  test('7a. the feed never reveals likedUser, in fields or in ordering', async () => {
    const res = await api.get('/feed?limit=100').expect(200);
    for (const p of res.body.profiles) assert.deepEqual(Object.keys(p).sort(), PUBLIC_FIELDS);
    assert.ok(!JSON.stringify(res.body).includes('likedUser'));
    const ids = res.body.profiles.map((p) => p.id);
    assert.deepEqual(ids, [...ids].sort(), 'ordering is by id, independent of incoming likes');
  });

  test('7b. a LIKE response is identical for profiles that did and did not like the user, unless mutual', async () => {
    const norm = (b) => ({ ...b, swipe: { ...b.swipe, profileId: 'x', timestamp: 't' } });
    const passOnLiker = await swipe(LIKED_USER[0], 'PASS').expect(201);
    const passOnOther = await swipe(NOT_LIKED[0], 'PASS').expect(201);
    assert.deepEqual(norm(passOnLiker.body), norm(passOnOther.body));
  });

  test('7c. no endpoint exposes incoming likes, raw swipes or data files', async () => {
    for (const p of ['/likes', '/api/likes', '/swipes', '/likes/incoming', '/profiles', '/data/profiles.json', '/api/data/swipes.json']) {
      assert.equal((await api.get(p)).status, 404, `${p} should not exist`);
    }
    await api.get('/swipe').expect(404);
  });

  test('7d. match and user payloads expose only public fields', async () => {
    const m = await swipe(LIKED_USER[0], 'LIKE').expect(201);
    assert.deepEqual(Object.keys(m.body.match.profile).sort(), PUBLIC_FIELDS);
    const me = await api.get('/me').expect(200);
    assert.deepEqual(Object.keys(me.body.user).sort(), PUBLIC_FIELDS);
  });
});

describe('GET /matches', () => {
  test('8. returns only mutual matches', async () => {
    await swipe(LIKED_USER[0], 'LIKE').expect(201); // mutual
    await swipe(LIKED_USER[1], 'LIKE').expect(201); // mutual
    await swipe(LIKED_USER[2], 'PASS').expect(201); // they liked, user passed
    await swipe(NOT_LIKED[0], 'LIKE').expect(201);  // one-sided

    const res = await api.get('/matches').expect(200);
    assert.deepEqual(res.body.matches.map((m) => m.profile.id).sort(), [LIKED_USER[0], LIKED_USER[1]].sort());
    assert.equal(res.body.count, 2);
  });

  test('8b. is empty before the user likes anyone, even though some profiles liked them', async () => {
    const res = await api.get('/matches').expect(200);
    assert.deepEqual(res.body, { matches: [], count: 0 });
  });
});

describe('DELETE /matches/:profileId (unmatch)', () => {
  test('removes the match from matches.json and from GET /matches', async () => {
    await swipe(LIKED_USER[0], 'LIKE').expect(201);
    await swipe(LIKED_USER[1], 'LIKE').expect(201);

    const res = await api.delete(`/matches/${LIKED_USER[0]}`).expect(200);
    assert.equal(res.body.ok, true);
    assert.equal(res.body.unmatched.profileId, LIKED_USER[0]);

    assert.deepEqual(readFile('matches.json').map((m) => m.profileId), [LIKED_USER[1]]);
    const list = await api.get('/matches').expect(200);
    assert.deepEqual(list.body.matches.map((m) => m.profile.id), [LIKED_USER[1]]);
    assert.equal(list.body.count, 1);
  });

  test('keeps the original swipe history in swipes.json', async () => {
    await swipe(LIKED_USER[0], 'LIKE').expect(201);
    await swipe(NOT_LIKED[0], 'PASS').expect(201);
    const before = fs.readFileSync(file('swipes.json'), 'utf8');

    await api.delete(`/matches/${LIKED_USER[0]}`).expect(200);
    assert.equal(fs.readFileSync(file('swipes.json'), 'utf8'), before);
  });

  test('an unmatched profile does not reappear in Discover and cannot be re-swiped', async () => {
    await swipe(LIKED_USER[0], 'LIKE').expect(201);
    await api.delete(`/matches/${LIKED_USER[0]}`).expect(200);

    const feed = await api.get('/feed?limit=100').expect(200);
    assert.ok(!feed.body.profiles.some((p) => p.id === LIKED_USER[0]));
    await swipe(LIKED_USER[0], 'LIKE').expect(409);
    assert.deepEqual(readFile('matches.json'), []);
  });

  test('only existing matches can be removed (404 otherwise, idempotent second call)', async () => {
    await swipe(LIKED_USER[0], 'LIKE').expect(201);
    await api.delete(`/matches/${LIKED_USER[0]}`).expect(200);
    const again = await api.delete(`/matches/${LIKED_USER[0]}`).expect(404);
    assert.equal(again.body.error.code, 'NOT_FOUND');

    await swipe(NOT_LIKED[0], 'LIKE').expect(201); // one-sided like, no match
    await api.delete(`/matches/${NOT_LIKED[0]}`).expect(404);
    await api.delete('/matches/profile_missing').expect(404);
  });

  test('cannot be used to probe who liked the user', async () => {
    // A profile that liked the user (but isn't matched) vs one that didn't: identical 404s.
    const liker = await api.delete(`/matches/${LIKED_USER[0]}`).expect(404);
    const other = await api.delete(`/matches/${NOT_LIKED[0]}`).expect(404);
    const unknown = await api.delete('/matches/profile_missing').expect(404);
    assert.deepEqual(liker.body, other.body);
    assert.deepEqual(liker.body, unknown.body);
  });

  test('rejects malformed ids and works under /api too', async () => {
    const bad = await api.delete('/matches/bad%20id!').expect(400);
    assert.equal(bad.body.error.code, 'VALIDATION_ERROR');
    await api.delete('/matches').expect(404); // no "delete all" route

    await swipe(LIKED_USER[0], 'LIKE').expect(201);
    await api.delete(`/api/matches/${LIKED_USER[0]}`).expect(200);
    assert.deepEqual(readFile('matches.json'), []);
  });

  test('concurrent unmatch + swipes never lose writes', async () => {
    await swipe(LIKED_USER[0], 'LIKE').expect(201);
    await swipe(LIKED_USER[1], 'LIKE').expect(201);
    const results = await Promise.all([
      api.delete(`/matches/${LIKED_USER[0]}`),
      swipe(LIKED_USER[2], 'LIKE'),
      api.delete(`/matches/${LIKED_USER[0]}`),
      swipe(NOT_LIKED[0], 'PASS'),
    ]);
    assert.deepEqual(results.map((r) => r.status).sort(), [200, 201, 201, 404]);
    assert.deepEqual(readFile('matches.json').map((m) => m.profileId).sort(), [LIKED_USER[1], LIKED_USER[2]].sort());
    assert.equal(readFile('swipes.json').length, 4);
  });
});

describe('persistence', () => {
  test('9. swipes and matches survive a browser refresh (repeated reads)', async () => {
    await swipe(LIKED_USER[0], 'LIKE').expect(201);
    await swipe(NOT_LIKED[0], 'PASS').expect(201);
    for (let i = 0; i < 2; i += 1) {
      const feed = await api.get('/feed?limit=100').expect(200);
      assert.equal(feed.body.remaining, PROFILES.length - 2);
      const matches = await api.get('/matches').expect(200);
      assert.equal(matches.body.count, 1);
    }
  });

  test('10. data survives a backend restart (new app instance reading the same files)', async () => {
    await swipe(LIKED_USER[0], 'LIKE').expect(201);
    await swipe(NOT_LIKED[0], 'PASS').expect(201);

    const restarted = request(createApp());
    const feed = await restarted.get('/feed?limit=100').expect(200);
    const ids = feed.body.profiles.map((p) => p.id);
    assert.ok(!ids.includes(LIKED_USER[0]) && !ids.includes(NOT_LIKED[0]));
    const matches = await restarted.get('/matches').expect(200);
    assert.deepEqual(matches.body.matches.map((m) => m.profile.id), [LIKED_USER[0]]);
    await restarted.post('/swipe').send({ profileId: LIKED_USER[0], action: 'LIKE' }).expect(409);
  });
});

describe('JSON storage safety', () => {
  test('many concurrent swipes are all persisted (no lost writes)', async () => {
    const targets = PROFILES.slice(0, 15).map((p) => p.id);
    const results = await Promise.all(targets.map((id, i) => swipe(id, i % 2 ? 'LIKE' : 'PASS')));
    assert.ok(results.every((r) => r.status === 201));
    assert.deepEqual(readFile('swipes.json').map((s) => s.profileId).sort(), [...targets].sort());
  });

  test('writes are atomic: no temp files are left behind', async () => {
    await Promise.all(LIKED_USER.slice(0, 5).map((id) => swipe(id, 'LIKE')));
    assert.deepEqual(fs.readdirSync(TEST_DATA_DIR).filter((f) => f.endsWith('.tmp')), []);
    assert.equal(readFile('matches.json').length, 5);
  });

  test('profiles.json is never modified by the API', async () => {
    const before = fs.readFileSync(file('profiles.json'), 'utf8');
    await swipe(LIKED_USER[0], 'LIKE').expect(201);
    await api.put('/me').send({ name: 'Sam', age: 25, location: 'Pune', interests: ['Music'] }).expect(200);
    await api.post('/demo/reset').expect(200);
    assert.equal(fs.readFileSync(file('profiles.json'), 'utf8'), before);
  });

  test('missing swipes.json / matches.json are recreated as empty arrays', async () => {
    fs.rmSync(file('swipes.json'));
    fs.rmSync(file('matches.json'));
    await api.get('/feed').expect(200);
    await api.get('/matches').expect(200);
    assert.deepEqual(readFile('swipes.json'), []);
    assert.deepEqual(readFile('matches.json'), []);
  });

  test('a corrupted file returns a clear 500 and is left untouched', async () => {
    writeFile('swipes.json', '{ this is not json');
    const res = await swipe(NOT_LIKED[0], 'LIKE').expect(500);
    assert.equal(res.body.error.code, 'STORAGE_ERROR');
    assert.match(res.body.error.message, /swipes\.json/);
    assert.equal(fs.readFileSync(file('swipes.json'), 'utf8'), '{ this is not json');
  });

  test('health reports storage status', async () => {
    await api.get('/health').expect(200);
    writeFile('profiles.json', [{ id: 'x' }]);
    await api.get('/health').expect(503);
  });
});

describe('demo user & reset', () => {
  test('GET /me returns the fixed demo user', async () => {
    const res = await api.get('/me').expect(200);
    assert.equal(res.body.user.id, 'demo-user');
  });

  test('PUT /me validates and persists profile setup details', async () => {
    const bad = await api.put('/me').send({ name: '', age: 12, location: '', interests: [] }).expect(400);
    assert.deepEqual(Object.keys(bad.body.error.details).sort(), ['age', 'interests', 'location', 'name']);

    const res = await api
      .put('/me')
      .send({ name: '  Sam  ', age: '26', location: 'Pune', interests: ['Music', 'music', 'Hiking'], id: 'hacker' })
      .expect(200);
    assert.equal(res.body.user.name, 'Sam');
    assert.equal(res.body.user.age, 26);
    assert.deepEqual(res.body.user.interests, ['Music', 'Hiking']);
    const stored = readFile('user.json');
    assert.equal(stored.id, 'demo-user', 'id cannot be changed');
    assert.equal(stored.name, 'Sam');
  });

  test('POST /demo/reset is explicit and clears swipes and matches only', async () => {
    await swipe(LIKED_USER[0], 'LIKE').expect(201);
    await swipe(NOT_LIKED[0], 'PASS').expect(201);
    const res = await api.post('/demo/reset').expect(200);
    assert.equal(res.body.swipesDeleted, 2);
    assert.equal(res.body.matchesDeleted, 1);
    assert.deepEqual(readFile('swipes.json'), []);
    assert.deepEqual(readFile('matches.json'), []);
    await api.get('/demo/reset').expect(404); // never triggered by a simple GET
  });

  test('unknown routes return a JSON 404', async () => {
    const res = await api.get('/nope').expect(404);
    assert.equal(res.body.error.code, 'NOT_FOUND');
  });
});
