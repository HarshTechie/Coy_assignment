const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const SERVER_ROOT = path.resolve(__dirname, '../..');
const nodeEnv = process.env.NODE_ENV || 'development';

const config = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  isTest: nodeEnv === 'test',
  port: Number(process.env.PORT) || 4000,
  // Folder holding profiles.json, user.json, swipes.json and matches.json.
  // Relative paths resolve from the server/ folder, so the cwd doesn't matter.
  dataDir: path.resolve(SERVER_ROOT, process.env.DATA_DIR || 'data'),
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  enableDemoReset: nodeEnv !== 'production' && process.env.ENABLE_DEMO_RESET !== 'false',
};

module.exports = config;
