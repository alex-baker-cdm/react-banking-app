const { randomUUID } = require('node:crypto');
const { ValidationError, NotFoundError } = require('../errors');

const ALERT_TYPES = ['rating', 'price'];
const DIRECTIONS = ['above', 'below'];

function parseThreshold(raw) {
  const threshold = typeof raw === 'string' ? Number(raw.replace(/[$,\s]/g, '')) : Number(raw);
  if (
    raw === '' ||
    raw === null ||
    raw === undefined ||
    !Number.isFinite(threshold) ||
    threshold <= 0
  ) {
    throw new ValidationError('Enter a price greater than $0.00.', 'threshold');
  }
  if (Math.round(threshold * 100) / 100 !== threshold) {
    throw new ValidationError('Prices can have at most two decimal places.', 'threshold');
  }
  return threshold;
}

function createAlertService({ companies, alerts }) {
  function create({ companyId, type, direction, threshold: rawThreshold, note = '' }) {
    if (!companyId) throw new ValidationError('Choose a company.', 'companyId');
    if (!ALERT_TYPES.includes(type)) throw new ValidationError('Choose an alert type.', 'type');
    const company = companies.find((candidate) => candidate.id === companyId);
    if (!company) throw new NotFoundError(`Company ${companyId} was not found.`);

    let threshold = null;
    if (type === 'price') {
      if (!DIRECTIONS.includes(direction)) {
        throw new ValidationError(
          'Choose whether the price rises above or falls below.',
          'direction'
        );
      }
      threshold = parseThreshold(rawThreshold);
    }
    const duplicate = alerts.some(
      (alert) =>
        alert.companyId === companyId &&
        alert.type === type &&
        alert.direction === (type === 'price' ? direction : null) &&
        alert.threshold === threshold
    );
    if (duplicate) throw new ValidationError('You already have this alert.', 'companyId');

    const alert = {
      id: `al-${randomUUID().slice(0, 8)}`,
      companyId,
      type,
      direction: type === 'price' ? direction : null,
      threshold,
      note: String(note).trim().slice(0, 80),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    alerts.unshift(alert);
    return { alert, company };
  }

  function remove(id) {
    const index = alerts.findIndex((alert) => alert.id === id);
    if (index === -1) throw new NotFoundError(`Alert ${id} was not found.`);
    alerts.splice(index, 1);
  }

  return { create, remove };
}

module.exports = { createAlertService };
