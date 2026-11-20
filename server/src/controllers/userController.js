const userService = require('../services/user.service');

async function getMe(_req, res) {
  res.json({ user: await userService.getUser() });
}

async function updateMe(req, res) {
  res.json({ user: await userService.updateUser(req.userInput) });
}

async function resetDemo(_req, res) {
  const result = await userService.resetActivity();
  res.json({ ok: true, ...result });
}

module.exports = { getMe, updateMe, resetDemo };
