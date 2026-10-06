const express = require('express');
const { NotFoundError } = require('../errors');

function accountsRouter({ accounts, transactions }) {
  const router = express.Router();

  router.get('/accounts', (req, res) => {
    res.json({ accounts });
  });

  router.get('/accounts/:id', (req, res, next) => {
    const account = accounts.find((candidate) => candidate.id === req.params.id);
    if (!account) return next(new NotFoundError(`Account ${req.params.id} was not found.`));
    res.json({ account });
  });

  router.get('/accounts/:id/transactions', (req, res, next) => {
    const account = accounts.find((candidate) => candidate.id === req.params.id);
    if (!account) return next(new NotFoundError(`Account ${req.params.id} was not found.`));
    res.json({ transactions: transactions.filter((txn) => txn.accountId === account.id) });
  });

  return router;
}

module.exports = { accountsRouter };
