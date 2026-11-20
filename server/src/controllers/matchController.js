const matchService = require('../services/match.service');

async function getMatches(_req, res) {
  const matches = await matchService.listMatches();
  res.json({ matches, count: matches.length });
}

async function unmatch(req, res) {
  const removed = await matchService.removeMatch(req.params.profileId);
  res.json({ ok: true, unmatched: removed });
}

module.exports = { getMatches, unmatch };
