const path = require('node:path');
const express = require('express');
const { seedAccounts, seedTransactions } = require('./data/accounts');
const { createTransferService } = require('./services/transfers');
const { accountsRouter } = require('./routes/accounts');
const { transfersRouter } = require('./routes/transfers');
const { statementsRouter } = require('./routes/statements');
const { requestContext } = require('./middleware/requestContext');
const { errorHandler } = require('./middleware/errorHandler');

const webBuild = path.resolve(__dirname, '../build');

function createApp({ accounts = seedAccounts(), transactions = seedTransactions() } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());
  app.use(requestContext);

  const transferService = createTransferService({ accounts, transactions });

  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'wf-online-banking',
      uptimeSeconds: Math.round(process.uptime()),
    });
  });

  app.use('/api', accountsRouter({ accounts, transactions }));
  app.use('/api', transfersRouter({ transferService }));
  app.use('/api', statementsRouter({ accounts, transactions }));

  app.use(express.static(webBuild));
  app.get(/^(?!\/api\/).*/, (req, res) => {
    res.sendFile(path.join(webBuild, 'index.html'));
  });

  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
