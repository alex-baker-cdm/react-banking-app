const test = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer } = require('./helpers');

test('GET /api/accounts lists the customer accounts', async () => {
  const server = await startTestServer();
  try {
    const { status, body, headers } = await server.request('GET', '/api/accounts');
    assert.equal(status, 200);
    assert.ok(headers.get('x-correlation-id'));
    assert.deepEqual(
      body.accounts.map((account) => account.type),
      ['checking', 'savings', 'credit', 'loan']
    );
  } finally {
    await server.close();
  }
});

test('GET /api/accounts/:id/transactions returns only that account', async () => {
  const server = await startTestServer();
  try {
    const { status, body } = await server.request('GET', '/api/accounts/sav-8820/transactions');
    assert.equal(status, 200);
    assert.ok(body.transactions.length > 0);
    assert.ok(body.transactions.every((txn) => txn.accountId === 'sav-8820'));
  } finally {
    await server.close();
  }
});

test('GET /api/accounts/:id returns 404 for unknown accounts', async () => {
  const server = await startTestServer();
  try {
    const { status, body } = await server.request('GET', '/api/accounts/nope');
    assert.equal(status, 404);
    assert.equal(body.error.code, 'NotFoundError');
  } finally {
    await server.close();
  }
});
