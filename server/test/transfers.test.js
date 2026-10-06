const test = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer } = require('./helpers');
const { parseAmount } = require('../services/transfers');

test('parseAmount accepts formatted currency strings', () => {
  assert.equal(parseAmount('$1,250.00'), 1250);
  assert.equal(parseAmount(42.5), 42.5);
});

test('parseAmount rejects non-positive and sub-cent amounts', () => {
  assert.throws(() => parseAmount('0'), /greater than \$0\.00/);
  assert.throws(() => parseAmount('-5'), /greater than \$0\.00/);
  assert.throws(() => parseAmount('1.005'), /two decimal places/);
});

test('POST /api/transfers moves money between deposit accounts', async () => {
  const server = await startTestServer();
  try {
    const { status, body } = await server.request('POST', '/api/transfers', {
      fromAccountId: 'chk-4471',
      toAccountId: 'sav-8820',
      amount: '300.00',
      memo: 'Rainy day',
    });
    assert.equal(status, 201);
    assert.equal(body.transfer.amount, 300);
    assert.equal(body.transfer.from.availableBalance, 4526.12);
    assert.equal(body.transfer.to.availableBalance, 12750);
    assert.match(body.transfer.confirmationNumber, /^[A-Z0-9]{10}$/);

    const history = await server.request('GET', '/api/accounts/sav-8820/transactions');
    assert.match(history.body.transactions[0].description, /from Everyday Checking .*Rainy day/);
  } finally {
    await server.close();
  }
});

test('POST /api/transfers pays down a loan', async () => {
  const server = await startTestServer();
  try {
    const { status, body } = await server.request('POST', '/api/transfers', {
      fromAccountId: 'chk-4471',
      toAccountId: 'mtg-1150',
      amount: 2184.3,
    });
    assert.equal(status, 201);
    assert.equal(body.transfer.to.currentBalance, 310215.7);
  } finally {
    await server.close();
  }
});

test('POST /api/transfers rejects overdrafts with a field error', async () => {
  const server = await startTestServer();
  try {
    const { status, body } = await server.request('POST', '/api/transfers', {
      fromAccountId: 'chk-4471',
      toAccountId: 'sav-8820',
      amount: 1000000,
    });
    assert.equal(status, 400);
    assert.equal(body.error.code, 'ValidationError');
    assert.equal(body.error.field, 'amount');
  } finally {
    await server.close();
  }
});

test('POST /api/transfers rejects same-account transfers', async () => {
  const server = await startTestServer();
  try {
    const { status, body } = await server.request('POST', '/api/transfers', {
      fromAccountId: 'chk-4471',
      toAccountId: 'chk-4471',
      amount: 10,
    });
    assert.equal(status, 400);
    assert.equal(body.error.field, 'toAccountId');
  } finally {
    await server.close();
  }
});

// Regression for prod incident 953beb21-c7b8-4f6f-8c5e-df6749e0d0fd: paying a credit card returned a 500
// after the From account had already been debited.
test('POST /api/transfers pays a credit card (incident 953beb21-c7b8-4f6f-8c5e-df6749e0d0fd)', async () => {
  const server = await startTestServer();
  try {
    const { status, body } = await server.request('POST', '/api/transfers', {
      fromAccountId: 'chk-4471',
      toAccountId: 'cc-3309',
      amount: '1',
      memo: '',
    });
    assert.equal(status, 201);
    assert.equal(body.transfer.from.availableBalance, 4825.12);
    assert.equal(body.transfer.from.currentBalance, 4825.12);
    assert.equal(body.transfer.to.currentBalance, 1283.57);
    assert.equal(body.transfer.to.availableCredit, 8716.43);

    const history = await server.request('GET', '/api/accounts/cc-3309/transactions');
    assert.equal(history.body.transactions[0].amount, 1);
    assert.match(history.body.transactions[0].description, /from Everyday Checking/);
  } finally {
    await server.close();
  }
});

test('POST /api/transfers rejects an unsupported To account without debiting the From account', async () => {
  const accounts = [
    {
      id: 'chk-1',
      type: 'checking',
      name: 'Checking',
      lastFour: '0001',
      availableBalance: 100,
      currentBalance: 100,
    },
    { id: 'brk-1', type: 'brokerage', name: 'Brokerage', lastFour: '0002', currentBalance: 0 },
  ];
  const server = await startTestServer({ accounts, transactions: [] });
  try {
    const { status, body } = await server.request('POST', '/api/transfers', {
      fromAccountId: 'chk-1',
      toAccountId: 'brk-1',
      amount: 10,
    });
    assert.equal(status, 400);
    assert.equal(body.error.code, 'ValidationError');
    assert.equal(body.error.field, 'toAccountId');
    assert.equal(accounts[0].availableBalance, 100);
    assert.equal(accounts[0].currentBalance, 100);
  } finally {
    await server.close();
  }
});
