const swipeService = require('../services/swipe.service');

async function createSwipe(req, res) {
  const result = await swipeService.recordSwipe(req.swipeInput);
  res.status(201).json(result); // { swipe, matched, match }
}

module.exports = { createSwipe };
