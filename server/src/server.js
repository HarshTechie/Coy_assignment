const config = require('./config/env');
const store = require('./storage/dataStore');
const { acquireDataDirLock } = require('./storage/instanceLock');
const { createApp } = require('./app');

async function start() {
  // Only one server process may write to the data directory at a time.
  try {
    acquireDataDirLock(config.dataDir);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  // Fail fast if any JSON data file is missing or invalid.
  try {
    const counts = await store.verifyDataFiles();
    console.log(
      `Data loaded from ${config.dataDir}: ${counts.profiles} profiles, ${counts.swipes} swipes, ${counts.matches} matches`,
    );
  } catch (err) {
    console.error(`Could not load data files: ${err.message}`);
    process.exit(1);
  }

  const app = createApp();
  const server = app.listen(config.port, () => {
    console.log(`Coy Discover API listening on http://localhost:${config.port}/api`);
  });
  server.on('error', (err) => {
    console.error(err.code === 'EADDRINUSE' ? `Port ${config.port} is already in use.` : err.message);
    process.exit(1);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down...`);
    // Let in-flight requests (and their file writes) finish before exiting.
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start();
