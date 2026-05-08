// Currency exchange rates relative to EUR.
// `getExchangeRate` always returns a valid `ExchangeRate`, even for unknown,
// missing, or malformed currency codes, so callers can safely access `.rate`
// without a `Cannot read properties of undefined (reading 'rate')` TypeError.

export interface ExchangeRate {
  code: string;
  rate: number;
}

const RATES: Readonly<Record<string, ExchangeRate>> = {
  EUR: { code: 'EUR', rate: 1.0 },
  USD: { code: 'USD', rate: 1.08 },
  GBP: { code: 'GBP', rate: 0.85 },
  PLN: { code: 'PLN', rate: 4.32 },
};

const FALLBACK_RATE: ExchangeRate = { code: 'EUR', rate: 1.0 };

export const getExchangeRate = (currency: string | null | undefined): ExchangeRate => {
  if (typeof currency !== 'string' || currency.length === 0) {
    return FALLBACK_RATE;
  }

  const upper = currency.toUpperCase();
  return RATES[upper] ?? FALLBACK_RATE;
};

export const convertAmount = (
  amount: number,
  fromCurrency: string | null | undefined,
  toCurrency: string | null | undefined
): number => {
  if (!Number.isFinite(amount)) {
    return 0;
  }
  const fromRate = getExchangeRate(fromCurrency).rate;
  const toRate = getExchangeRate(toCurrency).rate;
  if (fromRate === 0) {
    return 0;
  }
  return (amount / fromRate) * toRate;
};
