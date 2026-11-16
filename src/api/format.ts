const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export function formatMoney(value: number): string {
  return usd.format(value);
}

export function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatChange(changePct: number): string {
  const arrow = changePct < 0 ? '▼' : '▲';
  const sign = changePct < 0 ? '-' : '+';
  return `${arrow} ${sign}${Math.abs(changePct).toFixed(2)}%`;
}

export function formatMarketCap(marketCapBn: number): string {
  return `$${marketCapBn.toLocaleString('en-US')}B`;
}
