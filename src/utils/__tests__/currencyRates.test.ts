import { getExchangeRate, convertAmount } from '../currencyRates';

describe('getExchangeRate', () => {
  it('returns the configured rate for a known currency', () => {
    const rate = getExchangeRate('USD');
    expect(rate.code).toBe('USD');
    expect(rate.rate).toBeCloseTo(1.08);
  });

  it('is case-insensitive', () => {
    expect(getExchangeRate('usd').code).toBe('USD');
    expect(getExchangeRate('Eur').code).toBe('EUR');
  });

  it('returns a safe EUR fallback for unknown currency codes (does not throw)', () => {
    expect(() => getExchangeRate('ZZZ')).not.toThrow();
    expect(getExchangeRate('ZZZ').rate).toBe(1.0);
    expect(getExchangeRate('ZZZ').code).toBe('EUR');
  });

  it('returns a safe fallback for undefined input (regression for processTransfer .rate TypeError)', () => {
    expect(() => getExchangeRate(undefined)).not.toThrow();
    const result = getExchangeRate(undefined);
    expect(result).toBeDefined();
    expect(typeof result.rate).toBe('number');
  });

  it('returns a safe fallback for null input', () => {
    expect(() => getExchangeRate(null)).not.toThrow();
    expect(getExchangeRate(null).rate).toBe(1.0);
  });

  it('returns a safe fallback for an empty string', () => {
    expect(getExchangeRate('').rate).toBe(1.0);
  });
});

describe('convertAmount', () => {
  it('converts EUR to USD using configured rates', () => {
    expect(convertAmount(100, 'EUR', 'USD')).toBeCloseTo(108);
  });

  it('returns the same amount when converting to the same currency', () => {
    expect(convertAmount(50, 'GBP', 'GBP')).toBeCloseTo(50);
  });

  it('uses the EUR fallback when either currency is unknown rather than throwing', () => {
    expect(() => convertAmount(100, 'ZZZ', 'USD')).not.toThrow();
    expect(convertAmount(100, 'ZZZ', 'USD')).toBeCloseTo(108);
  });

  it('returns 0 for non-finite input amounts', () => {
    expect(convertAmount(Number.NaN, 'EUR', 'USD')).toBe(0);
    expect(convertAmount(Number.POSITIVE_INFINITY, 'EUR', 'USD')).toBe(0);
  });
});
