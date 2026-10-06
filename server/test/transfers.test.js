const test = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer } = require('./helpers');
const { parseAmount, POSTING_RULES } = require('../services/transfers');
const { seedAccounts } = require('../data/accounts');

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

test('every seeded account type has posting rules', () => {
  for (const account of seedAccounts()) {
    assert.ok(POSTING_RULES[account.type], `missing posting rules for ${account.type}`);
  }
});

test('POST /api/transfers pays a credit card from checking', async () => {
  const server = await startTestServer();
  try {
    const { status, body } = await server.request('POST', '/api/transfers', {
      fromAccountId: 'chk-4471',
      toAccountId: 'cc-3309',
      amount: '150.00',
      memo: 'October card payment',
    });
    assert.equal(status, 201);
    assert.equal(body.transfer.from.availableBalance, 4676.12);
    assert.equal(body.transfer.from.currentBalance, 4676.12);
    assert.equal(body.transfer.to.currentBalance, 1134.57);
    assert.equal(body.transfer.to.availableCredit, 8865.43);

    const history = await server.request('GET', '/api/accounts/cc-3309/transactions');
    assert.match(history.body.transactions[0].description, /from Everyday Checking .*October card/);
  } finally {
    await server.close();
  }
});

test('POST /api/transfers rejects an unsupported To account without debiting the From account', async () => {
  const accounts = seedAccounts();
  accounts.push({ id: 'brk-0001', type: 'brokerage', name: 'Brokerage', lastFour: '0001' });
  const server = await startTestServer({ accounts });
  try {
    const { status, body } = await server.request('POST', '/api/transfers', {
      fromAccountId: 'chk-4471',
      toAccountId: 'brk-0001',
      amount: '150.00',
    });
    assert.equal(status, 400);
    assert.equal(body.error.code, 'ValidationError');
    assert.equal(body.error.field, 'toAccountId');

    const checking = await server.request('GET', '/api/accounts/chk-4471');
    assert.equal(checking.body.account.availableBalance, 4826.12);
    assert.equal(checking.body.account.currentBalance, 4826.12);
  } finally {
    await server.close();
  }
});
