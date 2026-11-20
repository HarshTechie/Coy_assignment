/**
 * Single-instance guard for the data directory.
 *
 * The write lock in jsonFile.js serialises writes *within* one Node process.
 * Two server processes pointed at the same data/ folder would each have their
 * own lock and could overwrite each other's changes. This guard creates a
 * lock file (atomically, with the 'wx' flag) holding the owner's PID and
 * refuses to start if another live process owns it. A lock left behind by a
 * crashed process (dead PID) is reclaimed automatically.
 */
const fs = require('node:fs');
const path = require('node:path');

const LOCK_NAME = '.coy-discover.lock';

function isProcessAlive(pid) {
  try {
    process.kill(pid, 0); // signal 0 = existence check only
    return true;
  } catch (err) {
    return err.code === 'EPERM'; // exists but owned by another user
  }
}

function acquireDataDirLock(dataDir) {
  const lockPath = path.join(dataDir, LOCK_NAME);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      fs.writeFileSync(lockPath, String(process.pid), { flag: 'wx' });
      const release = () => {
        try {
          if (fs.readFileSync(lockPath, 'utf8') === String(process.pid)) fs.rmSync(lockPath, { force: true });
        } catch {
          /* already gone */
        }
      };
      process.on('exit', release);
      return release;
    } catch (err) {
      if (err.code !== 'EEXIST') throw err;
      const ownerPid = Number(fs.readFileSync(lockPath, 'utf8'));
      if (ownerPid && ownerPid !== process.pid && isProcessAlive(ownerPid)) {
        throw new Error(
          `Another Coy Discover server (PID ${ownerPid}) is already using ${dataDir}. Stop it first, ` +
            `because two servers writing the same JSON files would overwrite each other. ` +
            `(If no server is running, delete ${lockPath}.)`,
        );
      }
      fs.rmSync(lockPath, { force: true }); // stale lock from a crashed process
    }
  }
  throw new Error(`Could not acquire the data directory lock at ${lockPath}.`);
}

module.exports = { acquireDataDirLock };
