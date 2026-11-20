const { Router } = require('express');
const config = require('../config/env');
const store = require('../storage/dataStore');
const feedRoutes = require('./feedRoutes');
const swipeRoutes = require('./swipeRoutes');
const matchRoutes = require('./matchRoutes');
const userRoutes = require('./userRoutes');
const { resetDemo } = require('../controllers/userController');

const router = Router();

router.get('/health', async (_req, res) => {
  try {
    await store.verifyDataFiles();
    res.json({ status: 'ok', storage: 'json-files' });
  } catch {
    res.status(503).json({ status: 'degraded', storage: 'unavailable' });
  }
});

router.use('/feed', feedRoutes);
router.use('/swipe', swipeRoutes);
router.use('/matches', matchRoutes);
router.use('/me', userRoutes);

// Explicit demo-only action (never automatic); disabled in production.
if (config.enableDemoReset) {
  router.post('/demo/reset', resetDemo);
}

module.exports = router;
