const { logger } = require('../logger');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode ?? 500;

  if (statusCode >= 500) {
    logger.error('unhandled request error', {
      correlationId: req.correlationId,
      method: req.method,
      path: req.originalUrl,
      statusCode,
      errorName: err.name,
      errorMessage: err.message,
      stack: err.stack,
      requestBody: req.body,
    });
    res.status(statusCode).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: "We're sorry - we couldn't complete your request. Please try again later.",
        correlationId: req.correlationId,
      },
    });
    return;
  }

  logger.warn('request rejected', {
    correlationId: req.correlationId,
    method: req.method,
    path: req.originalUrl,
    statusCode,
    errorName: err.name,
    errorMessage: err.message,
  });
  res.status(statusCode).json({
    error: {
      code: err.name,
      message: err.message,
      field: err.field,
      correlationId: req.correlationId,
    },
  });
}

module.exports = { errorHandler };
