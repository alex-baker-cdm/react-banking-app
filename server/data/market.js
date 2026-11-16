// Illustrative seed data for the demo. Watchlists and alerts are mutated in memory and reset on restart.
function seedIndices() {
  return [
    { id: 'spx', name: 'S&P 500', value: 6812.44, change: 28.61, changePct: 0.42 },
    {
      id: 'djia',
      name: 'Dow Jones Industrial Average',
      value: 47120.9,
      change: -84.15,
      changePct: -0.18,
    },
    { id: 'sp400', name: 'S&P MidCap 400', value: 3284.17, change: 11.02, changePct: 0.34 },
    { id: 'gsci', name: 'S&P GSCI', value: 562.38, change: -3.94, changePct: -0.7 },
  ];
}

function company(id, name, sector, rating, outlook, price, change, changePct, marketCapBn) {
  return {
    id,
    ticker: id.toUpperCase(),
    name,
    sector,
    rating,
    outlook,
    price,
    change,
    changePct,
    marketCapBn,
  };
}

function seedCompanies() {
  return [
    company(
      'msft',
      'Microsoft Corporation',
      'Information Technology',
      'AAA',
      'Stable',
      512.3,
      3.84,
      0.76,
      3808
    ),
    company(
      'aapl',
      'Apple Inc.',
      'Information Technology',
      'AA+',
      'Stable',
      268.15,
      -1.22,
      -0.45,
      3982
    ),
    company('jnj', 'Johnson & Johnson', 'Health Care', 'AAA', 'Stable', 187.42, 0.64, 0.34, 451),
    company(
      'amzn',
      'Amazon.com, Inc.',
      'Consumer Discretionary',
      'AA',
      'Stable',
      244.8,
      2.95,
      1.22,
      2610
    ),
    company('xom', 'Exxon Mobil Corporation', 'Energy', 'AA-', 'Stable', 116.07, -0.88, -0.75, 494),
    company('wmt', 'Walmart Inc.', 'Consumer Staples', 'AA', 'Stable', 102.56, 0.31, 0.3, 818),
    company('jpm', 'JPMorgan Chase & Co.', 'Financials', 'A', 'Positive', 309.9, 4.12, 1.35, 852),
    company(
      'nflx',
      'Netflix, Inc.',
      'Communication Services',
      'A',
      'Stable',
      1104.25,
      -12.4,
      -1.11,
      468
    ),
    company(
      'tsla',
      'Tesla, Inc.',
      'Consumer Discretionary',
      'BBB',
      'Stable',
      438.6,
      9.75,
      2.27,
      1458
    ),
    company(
      'ba',
      'The Boeing Company',
      'Industrials',
      'BBB-',
      'Negative',
      196.34,
      -2.61,
      -1.31,
      149
    ),
    company(
      'f',
      'Ford Motor Company',
      'Consumer Discretionary',
      'BBB-',
      'Negative',
      13.12,
      0.09,
      0.69,
      52
    ),
    company(
      'ccl',
      'Carnival Corporation',
      'Consumer Discretionary',
      'BB+',
      'Positive',
      27.48,
      0.52,
      1.93,
      36
    ),
  ];
}

function seedWatchlists() {
  return [
    { id: 'wl-core', name: 'Core coverage', companyIds: ['msft', 'aapl', 'jpm', 'xom'] },
    { id: 'wl-credit', name: 'Credit watch', companyIds: ['ba', 'f', 'ccl'] },
  ];
}

function action(id, companyId, date, type, fromRating, toRating, outlook, summary) {
  return { id, companyId, date, action: type, fromRating, toRating, outlook, summary };
}

function seedRatingActions() {
  return [
    action(
      'ra-1001',
      'msft',
      '2026-08-14',
      'Affirmed',
      'AAA',
      'AAA',
      'Stable',
      'Rating affirmed on durable cloud cash flows and net cash position.'
    ),
    action(
      'ra-1002',
      'aapl',
      '2026-09-02',
      'Affirmed',
      'AA+',
      'AA+',
      'Stable',
      'Rating affirmed; shareholder returns remain within policy.'
    ),
    action(
      'ra-1003',
      'jpm',
      '2026-10-09',
      'Outlook revised',
      'A',
      'A',
      'Positive',
      'Outlook revised to positive from stable on capital strength.'
    ),
    action(
      'ra-1004',
      'jpm',
      '2025-11-20',
      'Upgrade',
      'A-',
      'A',
      'Stable',
      'Upgraded on sustained earnings diversification.'
    ),
    action(
      'ra-1005',
      'xom',
      '2026-06-18',
      'Affirmed',
      'AA-',
      'AA-',
      'Stable',
      'Rating affirmed following upstream integration.'
    ),
    action(
      'ra-1006',
      'ba',
      '2026-09-25',
      'Outlook revised',
      'BBB-',
      'BBB-',
      'Negative',
      'Outlook revised to negative on slower delivery ramp.'
    ),
    action(
      'ra-1007',
      'ba',
      '2025-04-11',
      'Downgrade',
      'BBB',
      'BBB-',
      'Stable',
      'Downgraded on weaker free cash flow.'
    ),
    action(
      'ra-1008',
      'f',
      '2026-07-30',
      'Outlook revised',
      'BBB-',
      'BBB-',
      'Negative',
      'Outlook revised to negative on warranty costs and tariffs.'
    ),
    action(
      'ra-1009',
      'ccl',
      '2026-10-01',
      'Upgrade',
      'BB',
      'BB+',
      'Positive',
      'Upgraded on continued debt reduction.'
    ),
    action(
      'ra-1010',
      'tsla',
      '2026-05-06',
      'Affirmed',
      'BBB',
      'BBB',
      'Stable',
      'Rating affirmed; liquidity remains strong.'
    ),
    action(
      'ra-1011',
      'nflx',
      '2026-03-12',
      'Affirmed',
      'A',
      'A',
      'Stable',
      'Rating affirmed on margin expansion.'
    ),
    action(
      'ra-1012',
      'amzn',
      '2026-02-27',
      'Affirmed',
      'AA',
      'AA',
      'Stable',
      'Rating affirmed on scale and cash generation.'
    ),
    action(
      'ra-1013',
      'wmt',
      '2026-04-22',
      'Affirmed',
      'AA',
      'AA',
      'Stable',
      'Rating affirmed on stable market share.'
    ),
    action(
      'ra-1014',
      'jnj',
      '2026-01-15',
      'Affirmed',
      'AAA',
      'AAA',
      'Stable',
      'Rating affirmed following litigation settlement progress.'
    ),
  ];
}

function seedAlerts() {
  return [
    {
      id: 'al-2001',
      companyId: 'ba',
      type: 'rating',
      direction: null,
      threshold: null,
      note: 'Fallen-angel risk',
      createdAt: '2026-10-02',
    },
  ];
}

module.exports = { seedIndices, seedCompanies, seedWatchlists, seedRatingActions, seedAlerts };
