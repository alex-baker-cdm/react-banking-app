const { createApp } = require('./app');
const { logger } = require('./logger');

const port = Number(process.env.PORT || 8080);
const app = createApp();

app.listen(port, () => {
  logger.info('server started', { port, nodeVersion: process.version });
});
