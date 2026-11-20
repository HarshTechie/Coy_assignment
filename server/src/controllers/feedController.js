const feedService = require('../services/feed.service');

// Controllers only translate HTTP <-> service calls; business rules live in services.
// Express 5 forwards rejected promises to the error handler automatically.

async function getFeed(req, res) {
  const feed = await feedService.getFeed({ limit: req.feedLimit });
  res.json(feed); // { profiles, remaining, total }
}

module.exports = { getFeed };
