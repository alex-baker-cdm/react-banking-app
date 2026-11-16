const test = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer } = require('./helpers');

test('POST /api/watchlists/:id/companies adds a company to the end of the watchlist', async () => {
  const server = await startTestServer();
  try {
    const { status, body } = await server.request('POST', '/api/watchlists/wl-core/companies', {
      companyId: 'tsla',
    });
    assert.equal(status, 201);
    assert.deepEqual(
      body.watchlist.companies.map((company) => company.ticker),
      ['MSFT', 'AAPL', 'JPM', 'XOM', 'TSLA']
    );
    const list = await server.request('GET', '/api/watchlists');
    assert.equal(list.body.watchlists[0].companies.length, 5);
    assert.equal(list.body.watchlists[1].companies.length, 3);
  } finally {
    await server.close();
  }
});

test('POST /api/watchlists/:id/companies rejects duplicates, missing and unknown companies', async () => {
  const server = await startTestServer();
  try {
    const duplicate = await server.request('POST', '/api/watchlists/wl-core/companies', {
      companyId: 'msft',
    });
    assert.equal(duplicate.status, 400);
    assert.equal(duplicate.body.error.field, 'companyId');
    assert.equal(
      duplicate.body.error.message,
      'Microsoft Corporation is already in Core coverage.'
    );

    const missing = await server.request('POST', '/api/watchlists/wl-core/companies', {});
    assert.equal(missing.status, 400);

    const unknown = await server.request('POST', '/api/watchlists/wl-core/companies', {
      companyId: 'zzz',
    });
    assert.equal(unknown.status, 404);

    const noList = await server.request('POST', '/api/watchlists/nope/companies', {
      companyId: 'tsla',
    });
    assert.equal(noList.status, 404);
  } finally {
    await server.close();
  }
});

test('DELETE /api/watchlists/:id/companies/:companyId removes the company', async () => {
  const server = await startTestServer();
  try {
    const { status, body } = await server.request(
      'DELETE',
      '/api/watchlists/wl-credit/companies/f'
    );
    assert.equal(status, 200);
    assert.deepEqual(
      body.watchlist.companies.map((company) => company.ticker),
      ['BA', 'CCL']
    );
    const again = await server.request('DELETE', '/api/watchlists/wl-credit/companies/f');
    assert.equal(again.status, 404);
  } finally {
    await server.close();
  }
});
