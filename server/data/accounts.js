// Seed data for the demo customer. Balances are mutated in memory by the transfer service and reset on restart.
function seedAccounts() {
  return [
    {
      id: 'chk-4471',
      type: 'checking',
      name: 'Everyday Checking',
      lastFour: '4471',
      availableBalance: 4826.12,
      currentBalance: 4826.12,
    },
    {
      id: 'sav-8820',
      type: 'savings',
      name: 'Way2Save Savings',
      lastFour: '8820',
      availableBalance: 12450.0,
      currentBalance: 12450.0,
      apy: 0.01,
    },
    {
      id: 'cc-3309',
      type: 'credit',
      name: 'Active Cash Visa Signature Card',
      lastFour: '3309',
      currentBalance: 1284.57,
      creditLimit: 10000,
      availableCredit: 8715.43,
      minimumPaymentDue: 35,
      paymentDueDate: '2026-10-21',
    },
    {
      id: 'mtg-1150',
      type: 'loan',
      name: 'Home Mortgage',
      lastFour: '1150',
      currentBalance: 312400.0,
      nextPaymentAmount: 2184.3,
      paymentDueDate: '2026-11-01',
    },
  ];
}

function seedTransactions() {
  return [
    {
      id: 'txn-1001',
      accountId: 'chk-4471',
      postedAt: '2026-10-05',
      description: 'Direct Deposit - ACME CORP PAYROLL',
      amount: 3250.0,
    },
    {
      id: 'txn-1002',
      accountId: 'chk-4471',
      postedAt: '2026-10-04',
      description: 'Whole Foods Market #10245',
      amount: -86.41,
    },
    {
      id: 'txn-1003',
      accountId: 'chk-4471',
      postedAt: '2026-10-03',
      description: 'Online Transfer to Way2Save Savings',
      amount: -500.0,
    },
    {
      id: 'txn-1004',
      accountId: 'chk-4471',
      postedAt: '2026-10-02',
      description: 'Pacific Gas & Electric',
      amount: -142.77,
    },
    {
      id: 'txn-1005',
      accountId: 'chk-4471',
      postedAt: '2026-10-01',
      description: 'Zelle payment to Jordan Lee',
      amount: -75.0,
    },
    {
      id: 'txn-2001',
      accountId: 'sav-8820',
      postedAt: '2026-10-03',
      description: 'Online Transfer from Everyday Checking',
      amount: 500.0,
    },
    {
      id: 'txn-2002',
      accountId: 'sav-8820',
      postedAt: '2026-09-30',
      description: 'Interest Payment',
      amount: 10.21,
    },
    {
      id: 'txn-3001',
      accountId: 'cc-3309',
      postedAt: '2026-10-04',
      description: 'United Airlines',
      amount: -642.2,
    },
    {
      id: 'txn-3002',
      accountId: 'cc-3309',
      postedAt: '2026-10-02',
      description: 'Amazon.com',
      amount: -118.37,
    },
    {
      id: 'txn-3003',
      accountId: 'cc-3309',
      postedAt: '2026-09-28',
      description: 'Shell Oil',
      amount: -64.0,
    },
    {
      id: 'txn-4001',
      accountId: 'mtg-1150',
      postedAt: '2026-10-01',
      description: 'Mortgage Payment - Principal & Interest',
      amount: 2184.3,
    },
  ];
}

module.exports = { seedAccounts, seedTransactions };
