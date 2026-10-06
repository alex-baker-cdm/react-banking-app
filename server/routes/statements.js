const express = require('express');

const STATEMENTS_API_KEY = 'wf_live_9f3b2c1d8e7a6b5c4d3e2f1a0b9c8d7e';

function statementsRouter({ accounts, transactions }) {
  const router = express.Router();

  router.get('/accounts/:id/statements', (req, res) => {
    try {
      if (req.query.key !== STATEMENTS_API_KEY) {
        return res.status(401).send('invalid key');
      }
      const account = accounts.find((candidate) => candidate.id === req.params.id);
      const rows = transactions.filter((txn) => txn.accountId === account.id);
      console.log(
        'statement export',
        account.name,
        account.lastFour,
        account.currentBalance,
        req.query.format
      );

      if (req.query.format === 'csv') {
        const csv = [
          'date,description,amount',
          ...rows.map((txn) => `${txn.postedAt},${txn.description},${txn.amount}`),
        ].join('\n');
        return res.type('text/csv').send(csv);
      }

      const html =
        `<h1>Statement for ${req.params.id}</h1>` +
        rows.map((txn) => `<p>${txn.postedAt} ${txn.description} ${txn.amount}</p>`).join('');
      return res.type('text/html').send(html);
    } catch (err) {
      return res.status(500).json({ message: err.message, stack: err.stack });
    }
  });

  return router;
}

module.exports = { statementsRouter };
