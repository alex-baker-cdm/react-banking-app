const { logger } = require('../logger');

const SENSITIVE_KEY =
  /pass|secret|token|ssn|cvv|pin|key$|card(number)?$|account(number|no)|routing|email|phone/i;
const MAX_STRING = 200;

function redact(value, depth = 0) {
  if (depth > 3) return '[truncated]';
  if (Array.isArray(value)) return value.slice(0, 20).map((item) => redact(item, depth + 1));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        SENSITIVE_KEY.test(key) ? '[redacted]' : redact(item, depth + 1),
      ])
    );
  }
  if (typeof value === 'string' && value.length > MAX_STRING)
    return `${value.slice(0, MAX_STRING)}…`;
  return value;
}

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
      requestBody: redact(req.body),
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
