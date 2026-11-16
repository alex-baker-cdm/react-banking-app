const test = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer } = require('./helpers');

test('GET /api/watchlists returns watchlists with their companies', async () => {
  const server = await startTestServer();
  try {
    const { status, body, headers } = await server.request('GET', '/api/watchlists');
    assert.equal(status, 200);
    assert.ok(headers.get('x-correlation-id'));
    assert.deepEqual(
      body.watchlists.map((watchlist) => watchlist.id),
      ['wl-core', 'wl-credit']
    );
    assert.deepEqual(
      body.watchlists[0].companies.map((company) => company.ticker),
      ['MSFT', 'AAPL', 'JPM', 'XOM']
    );
  } finally {
    await server.close();
  }
});

test('GET /api/companies/:id/rating-actions returns only that company', async () => {
  const server = await startTestServer();
  try {
    const { status, body } = await server.request('GET', '/api/companies/jpm/rating-actions');
    assert.equal(status, 200);
    assert.equal(body.ratingActions.length, 2);
    assert.ok(body.ratingActions.every((item) => item.companyId === 'jpm'));
  } finally {
    await server.close();
  }
});

test('GET /api/companies/:id returns 404 for unknown companies', async () => {
  const server = await startTestServer();
  try {
    const { status, body } = await server.request('GET', '/api/companies/nope');
    assert.equal(status, 404);
    assert.equal(body.error.code, 'NotFoundError');
  } finally {
    await server.close();
  }
});

test('GET /api/indices lists the index strip', async () => {
  const server = await startTestServer();
  try {
    const { body } = await server.request('GET', '/api/indices');
    assert.equal(body.indices[0].name, 'S&P 500');
  } finally {
    await server.close();
  }
});
