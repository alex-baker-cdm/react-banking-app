const { randomUUID } = require('node:crypto');
const { logger } = require('../logger');

function requestContext(req, res, next) {
  req.correlationId = req.get('x-correlation-id') || randomUUID();
  res.set('x-correlation-id', req.correlationId);
  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    if (req.path.startsWith('/api/')) {
      logger.info('request completed', {
        correlationId: req.correlationId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Number(process.hrtime.bigint() - startedAt) / 1e6,
      });
    }
  });

  next();
}

module.exports = { requestContext };
