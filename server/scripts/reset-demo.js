/**
 * Clears all swipes and matches (swipes.json / matches.json) so the
 * demo can be replayed. Takes the data-directory lock first, so it refuses to
 * run while the API server is using the same files. Use the UI's
 * "Reset demo" button (POST /api/demo/reset) while the server is running.
 */
const config = require('../src/config/env');
const { acquireDataDirLock } = require('../src/storage/instanceLock');
const { resetActivity } = require('../src/services/user.service');

try {
  acquireDataDirLock(config.dataDir);
} catch (err) {
  console.error(`${err.message}\nTip: while the server is running, use "Reset demo" in the app instead.`);
  process.exit(1);
}

resetActivity()
  .then((r) => console.log(`Demo reset: ${r.swipesDeleted} swipes and ${r.matchesDeleted} matches removed.`))
  .catch((err) => {
    console.error('Reset failed:', err.message);
    process.exitCode = 1;
  });
