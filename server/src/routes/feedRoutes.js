const { Router } = require('express');
const { validateFeedQuery } = require('../middleware/validate');
const { getFeed } = require('../controllers/feedController');

const router = Router();

// GET /feed – profiles the demo user hasn't swiped on yet
router.get('/', validateFeedQuery, getFeed);

module.exports = router;
