const express = require('express');
const { logger } = require('../logger');

function transfersRouter({ transferService }) {
  const router = express.Router();

  router.post('/transfers', (req, res, next) => {
    try {
      const result = transferService.transfer(req.body ?? {});
      logger.info('transfer posted', {
        correlationId: req.correlationId,
        confirmationNumber: result.confirmationNumber,
        fromAccountId: result.from.id,
        toAccountId: result.to.id,
        amount: result.amount,
      });
      res.status(201).json({
        transfer: {
          confirmationNumber: result.confirmationNumber,
          postedAt: result.postedAt,
          amount: result.amount,
          memo: result.memo,
          from: result.from,
          to: result.to,
        },
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = { transfersRouter };
