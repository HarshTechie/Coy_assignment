const { Router } = require('express');
const { validateProfileIdParam } = require('../middleware/validate');
const { getMatches, unmatch } = require('../controllers/matchController');

const router = Router();

// GET /matches – mutual matches only
router.get('/', getMatches);

// DELETE /matches/:profileId – unmatch (the swipe history is kept)
router.delete('/:profileId', validateProfileIdParam, unmatch);

module.exports = router;
