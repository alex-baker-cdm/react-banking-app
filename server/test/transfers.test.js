const test = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer } = require('./helpers');
const { createTransferService, parseAmount } = require('../services/transfers');
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

// Regression: prod incident a5b5c408-59e5-4be5-946d-b8f1687210e8 (POST /api/transfers 500,
// "Cannot read properties of undefined (reading 'direction')") when paying a credit card.
test('POST /api/transfers pays a credit card (incident a5b5c408-59e5-4be5-946d-b8f1687210e8)', async () => {
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
  } finally {
    await server.close();
  }
});

test('POST /api/transfers rejects transfers out of a credit card with a field error', async () => {
  const server = await startTestServer();
  try {
    const { status, body } = await server.request('POST', '/api/transfers', {
      fromAccountId: 'cc-3309',
      toAccountId: 'chk-4471',
      amount: 10,
    });
    assert.equal(status, 400);
    assert.equal(body.error.code, 'ValidationError');
    assert.equal(body.error.field, 'fromAccountId');

    const accounts = await server.request('GET', '/api/accounts');
    const checking = accounts.body.accounts.find((account) => account.id === 'chk-4471');
    assert.equal(checking.availableBalance, 4826.12);
  } finally {
    await server.close();
  }
});

test('transfer does not debit the From account when the To account cannot be credited', () => {
  const accounts = [
    ...seedAccounts(),
    { id: 'unk-0001', type: 'brokerage', name: 'Brokerage', lastFour: '0001', currentBalance: 0 },
  ];
  const transactions = [];
  const service = createTransferService({ accounts, transactions });

  assert.throws(
    () => service.transfer({ fromAccountId: 'chk-4471', toAccountId: 'unk-0001', amount: '35.00' }),
    (err) => err.name === 'ValidationError' && err.field === 'toAccountId'
  );
  const checking = accounts.find((account) => account.id === 'chk-4471');
  assert.equal(checking.availableBalance, 4826.12);
  assert.equal(checking.currentBalance, 4826.12);
  assert.equal(transactions.length, 0);
});
