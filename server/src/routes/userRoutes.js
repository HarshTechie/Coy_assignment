const { Router } = require('express');
const { validateUserBody } = require('../middleware/validate');
const { getMe, updateMe } = require('../controllers/userController');

const router = Router();

// GET /me – the fixed demo user;  PUT /me – optional profile setup
router.get('/', getMe);
router.put('/', validateUserBody, updateMe);

module.exports = router;
