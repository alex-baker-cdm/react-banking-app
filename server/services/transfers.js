const { randomUUID } = require('node:crypto');
const { ValidationError, NotFoundError } = require('../errors');

// How a transfer posts to each account type. Deposit accounts move availableBalance/currentBalance;
// loans and credit cards track the amount owed, so a payment reduces currentBalance (and frees up
// availableCredit on a card).
const POSTING_RULES = {
  checking: { debit: 'availableBalance', credit: 'availableBalance', mirror: 'currentBalance' },
  savings: { debit: 'availableBalance', credit: 'availableBalance', mirror: 'currentBalance' },
  credit: { credit: 'currentBalance', direction: -1, offset: 'availableCredit' },
  loan: { credit: 'currentBalance', direction: -1 },
};

function postingRulesFor(account, field) {
  const rules = Object.hasOwn(POSTING_RULES, account.type) ? POSTING_RULES[account.type] : undefined;
  if (!rules) {
    throw new ValidationError(`Transfers aren't supported for ${account.type} accounts.`, field);
  }
  return rules;
}

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

function assertCreditable(account) {
  const rules = postingRulesFor(account, 'toAccountId');
  if (!rules.credit) {
    throw new ValidationError(`You can't transfer money into a ${account.type} account.`, 'toAccountId');
  }
}

function postCredit(account, amount) {
  const rules = postingRulesFor(account, 'toAccountId');
  const direction = rules.direction ?? 1;
  account[rules.credit] = roundMoney(account[rules.credit] + direction * amount);
  if (rules.mirror) {
    account[rules.mirror] = roundMoney(account[rules.mirror] + direction * amount);
  }
  if (rules.offset && typeof account[rules.offset] === 'number') {
    account[rules.offset] = roundMoney(account[rules.offset] - direction * amount);
  }
}

function postDebit(account, amount) {
  const rules = postingRulesFor(account, 'fromAccountId');
  if (!rules.debit) {
    throw new ValidationError(`You can't transfer money out of a ${account.type} account.`, 'fromAccountId');
  }
  if (account[rules.debit] < amount) {
    throw new ValidationError('The amount exceeds the available balance of the From account.', 'amount');
  }
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

    // Validate the credit side before debiting so a failed transfer never leaves a one-sided posting.
    assertCreditable(to);
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
