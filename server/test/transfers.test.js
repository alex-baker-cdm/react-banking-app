const test = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer } = require('./helpers');
const { parseAmount } = require('../services/transfers');
const { seedAccounts, seedTransactions } = require('../data/accounts');

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

test('POST /api/transfers pays a credit card from checking', async () => {
  const server = await startTestServer();
  try {
    const { status, body } = await server.request('POST', '/api/transfers', {
      fromAccountId: 'chk-4471',
      toAccountId: 'cc-3309',
      amount: '35.00',
      memo: 'Minimum payment',
    });
    assert.equal(status, 201);
    assert.equal(body.transfer.from.availableBalance, 4791.12);
    assert.equal(body.transfer.from.currentBalance, 4791.12);
    assert.equal(body.transfer.to.currentBalance, 1249.57);
    assert.equal(body.transfer.to.availableCredit, 8750.43);

    const history = await server.request('GET', '/api/accounts/cc-3309/transactions');
    assert.match(
      history.body.transactions[0].description,
      /from Everyday Checking .*Minimum payment/
    );
    assert.equal(history.body.transactions[0].amount, 35);
  } finally {
    await server.close();
  }
});

test('POST /api/transfers does not debit the From account when the credit cannot be posted', async () => {
  const accounts = [
    ...seedAccounts(),
    { id: 'brk-7001', type: 'brokerage', name: 'Brokerage', lastFour: '7001', currentBalance: 0 },
  ];
  const transactions = seedTransactions();
  const server = await startTestServer({ accounts, transactions });
  try {
    const { status, body } = await server.request('POST', '/api/transfers', {
      fromAccountId: 'chk-4471',
      toAccountId: 'brk-7001',
      amount: '35.00',
    });
    assert.equal(status, 500);
    assert.equal(body.error.code, 'INTERNAL_ERROR');

    const checking = accounts.find((account) => account.id === 'chk-4471');
    assert.equal(checking.availableBalance, 4826.12);
    assert.equal(checking.currentBalance, 4826.12);
    assert.equal(transactions.length, seedTransactions().length);
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
