const express = require('express');
const { logger } = require('../logger');

function alertsRouter({ alertService, alerts, companies }) {
  const router = express.Router();

  function present(alert) {
    return { ...alert, company: companies.find((company) => company.id === alert.companyId) };
  }

  router.get('/alerts', (req, res) => {
    res.json({ alerts: alerts.map(present) });
  });

  router.post('/alerts', (req, res) => {
    const { alert } = alertService.create(req.body ?? {});
    logger.info('alert created', {
      correlationId: req.correlationId,
      alertId: alert.id,
      companyId: alert.companyId,
      type: alert.type,
    });
    res.status(201).json({ alert: present(alert) });
  });

  router.delete('/alerts/:id', (req, res) => {
    alertService.remove(req.params.id);
    res.status(204).end();
  });

  return router;
}

module.exports = { alertsRouter };
