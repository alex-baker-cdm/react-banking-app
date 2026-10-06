const { randomUUID } = require('node:crypto');
const { ValidationError, NotFoundError } = require('../errors');

// How a transfer posts to each account type. Deposit accounts move availableBalance/currentBalance;
// loans and credit cards track the amount owed, so a payment reduces currentBalance. `offset` fields move the
// opposite way (a card payment frees up the same amount of availableCredit).
const POSTING_RULES = {
  checking: { debit: 'availableBalance', credit: 'availableBalance', mirror: 'currentBalance' },
  savings: { debit: 'availableBalance', credit: 'availableBalance', mirror: 'currentBalance' },
  credit: { credit: 'currentBalance', direction: -1, offset: 'availableCredit' },
  loan: { credit: 'currentBalance', direction: -1 },
};

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

function parseAmount(raw) {
  const amount = typeof raw === 'string' ? Number(raw.replace(/[$,\s]/g, '')) : Number(raw);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ValidationError('Enter an amount greater than $0.00.', 'amount');
  }
  if (roundMoney(amount) !== amount) {
    throw new ValidationError('Amounts can have at most two decimal places.', 'amount');
  }
  return amount;
}

function postingRulesFor(account) {
  const rules = POSTING_RULES[account.type];
  if (!rules) {
    throw new Error(`No posting rules for account type "${account.type}" (account ${account.id}).`);
  }
  return rules;
}

function assertCanDebit(account, amount) {
  const rules = postingRulesFor(account);
  if (!rules.debit) {
    throw new ValidationError(`You can't transfer money out of a ${account.type} account.`, 'fromAccountId');
  }
  if (account[rules.debit] < amount) {
    throw new ValidationError('The amount exceeds the available balance of the From account.', 'amount');
  }
}

function assertCanCredit(account) {
  if (!postingRulesFor(account).credit) {
    throw new ValidationError(`You can't transfer money into a ${account.type} account.`, 'toAccountId');
  }
}

function postCredit(account, amount) {
  const rules = postingRulesFor(account);
  const direction = rules.direction ?? 1;
  account[rules.credit] = roundMoney(account[rules.credit] + direction * amount);
  if (rules.mirror) {
    account[rules.mirror] = roundMoney(account[rules.mirror] + direction * amount);
  }
  if (rules.offset) {
    account[rules.offset] = roundMoney(account[rules.offset] - direction * amount);
  }
}

function postDebit(account, amount) {
  const rules = postingRulesFor(account);
  account[rules.debit] = roundMoney(account[rules.debit] - amount);
  if (rules.mirror) {
    account[rules.mirror] = roundMoney(account[rules.mirror] - amount);
  }
}

function createTransferService({ accounts, transactions }) {
  function findAccount(id, field) {
    const account = accounts.find((candidate) => candidate.id === id);
    if (!account) {
      throw new NotFoundError(`Account ${id} was not found.`, field);
    }
    return account;
  }

  function transfer({ fromAccountId, toAccountId, amount: rawAmount, memo = '' }) {
    if (!fromAccountId) throw new ValidationError('Choose a From account.', 'fromAccountId');
    if (!toAccountId) throw new ValidationError('Choose a To account.', 'toAccountId');
    if (fromAccountId === toAccountId) {
      throw new ValidationError('The From and To accounts must be different.', 'toAccountId');
    }
    const amount = parseAmount(rawAmount);
    const from = findAccount(fromAccountId, 'fromAccountId');
    const to = findAccount(toAccountId, 'toAccountId');

    // Validate both legs before posting either, so a rejected credit never leaves the From account debited.
    assertCanDebit(from, amount);
    assertCanCredit(to);
    postDebit(from, amount);
    postCredit(to, amount);

    const postedAt = new Date().toISOString().slice(0, 10);
    const confirmationNumber = randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase();
    const label = memo ? ` - ${memo}` : '';
    transactions.unshift({
      id: `txn-${randomUUID().slice(0, 8)}`,
      accountId: from.id,
      postedAt,
      description: `Online Transfer to ${to.name} ...${to.lastFour}${label}`,
      amount: -amount,
    });
    transactions.unshift({
      id: `txn-${randomUUID().slice(0, 8)}`,
      accountId: to.id,
      postedAt,
      description: `Online Transfer from ${from.name} ...${from.lastFour}${label}`,
      amount,
    });

    return { confirmationNumber, postedAt, amount, from, to, memo };
  }

  return { transfer };
}

module.exports = { createTransferService, parseAmount, POSTING_RULES };
