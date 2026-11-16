const test = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer } = require('./helpers');

test('POST /api/alerts creates a rating alert', async () => {
  const server = await startTestServer();
  try {
    const { status, body } = await server.request('POST', '/api/alerts', {
      companyId: 'aapl',
      type: 'rating',
      note: 'Watch buybacks',
    });
    assert.equal(status, 201);
    assert.equal(body.alert.company.ticker, 'AAPL');
    assert.equal(body.alert.threshold, null);
    const list = await server.request('GET', '/api/alerts');
    assert.equal(list.body.alerts[0].id, body.alert.id);
  } finally {
    await server.close();
  }
});

test('POST /api/alerts creates a price alert with a threshold', async () => {
  const server = await startTestServer();
  try {
    const { status, body } = await server.request('POST', '/api/alerts', {
      companyId: 'tsla',
      type: 'price',
      direction: 'below',
      threshold: '400.50',
    });
    assert.equal(status, 201);
    assert.equal(body.alert.threshold, 400.5);
    assert.equal(body.alert.direction, 'below');
  } finally {
    await server.close();
  }
});

test('POST /api/alerts validates the request', async () => {
  const server = await startTestServer();
  try {
    const missing = await server.request('POST', '/api/alerts', { type: 'rating' });
    assert.equal(missing.status, 400);
    assert.equal(missing.body.error.field, 'companyId');

    const noPrice = await server.request('POST', '/api/alerts', {
      companyId: 'tsla',
      type: 'price',
      direction: 'above',
      threshold: '',
    });
    assert.equal(noPrice.status, 400);
    assert.equal(noPrice.body.error.field, 'threshold');

    const duplicate = await server.request('POST', '/api/alerts', {
      companyId: 'ba',
      type: 'rating',
    });
    assert.equal(duplicate.status, 400);

    const unknown = await server.request('POST', '/api/alerts', {
      companyId: 'zzz',
      type: 'rating',
    });
    assert.equal(unknown.status, 404);
  } finally {
    await server.close();
  }
});

test('DELETE /api/alerts/:id removes the alert', async () => {
  const server = await startTestServer();
  try {
    const removed = await server.request('DELETE', '/api/alerts/al-2001');
    assert.equal(removed.status, 204);
    const list = await server.request('GET', '/api/alerts');
    assert.equal(list.body.alerts.length, 0);
    const again = await server.request('DELETE', '/api/alerts/al-2001');
    assert.equal(again.status, 404);
  } finally {
    await server.close();
  }
});
