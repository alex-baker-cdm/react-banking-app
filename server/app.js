const path = require('node:path');
const express = require('express');
const {
  seedIndices,
  seedCompanies,
  seedWatchlists,
  seedRatingActions,
  seedAlerts,
} = require('./data/market');
const { createAlertService } = require('./services/alerts');
const { marketRouter } = require('./routes/market');
const { alertsRouter } = require('./routes/alerts');
const { requestContext } = require('./middleware/requestContext');
const { errorHandler } = require('./middleware/errorHandler');

const webBuild = path.resolve(__dirname, '../build');

function createApp({
  indices = seedIndices(),
  companies = seedCompanies(),
  watchlists = seedWatchlists(),
  ratingActions = seedRatingActions(),
  alerts = seedAlerts(),
} = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());
  app.use(requestContext);

  const alertService = createAlertService({ companies, alerts });

  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'market-intelligence',
      uptimeSeconds: Math.round(process.uptime()),
    });
  });

  app.use('/api', marketRouter({ indices, companies, watchlists, ratingActions }));
  app.use('/api', alertsRouter({ alertService, alerts, companies }));

  app.use(express.static(webBuild));
  app.get(/^(?!\/api\/).*/, (req, res) => {
    res.sendFile(path.join(webBuild, 'index.html'));
  });

  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
