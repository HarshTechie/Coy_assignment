const { Router } = require('express');
const { validateSwipeBody } = require('../middleware/validate');
const { createSwipe } = require('../controllers/swipeController');

const router = Router();

// POST /swipe – { profileId, action: "LIKE" | "PASS" }
router.post('/', validateSwipeBody, createSwipe);

module.exports = router;
