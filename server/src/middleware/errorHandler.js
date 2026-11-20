const AppError = require('../utils/AppError');
const config = require('../config/env');

function notFound(req, _res, next) {
  next(AppError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  // Malformed JSON body from express.json()
  if (err.type === 'entity.parse.failed') {
    err = AppError.badRequest('Request body must be valid JSON.');
  }
  if (err.type === 'entity.too.large') {
    err = new AppError(413, 'PAYLOAD_TOO_LARGE', 'Request body is too large.');
  }

  if (!(err instanceof AppError)) {
    console.error(`[error] ${req.method} ${req.originalUrl}`, err);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Something went wrong on our side.',
        ...(config.isProduction ? {} : { debug: err.message }),
      },
    });
  }

  // StorageError and other 5xx: log the underlying cause, return a safe message.
  if (err.status >= 500) console.error(`[error] ${req.method} ${req.originalUrl}`, err.message, err.cause || '');

  return res.status(err.status).json({
    error: {
      code: err.code,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    },
  });
}

module.exports = { notFound, errorHandler };
