const { randomUUID } = require('node:crypto');

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const { logger } = require('../logger');

function requestContext(req, res, next) {
  const supplied = req.get('x-correlation-id');
  req.correlationId = supplied && uuidPattern.test(supplied) ? supplied : randomUUID();
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
