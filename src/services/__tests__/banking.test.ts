import { processTransfer, TransferRequest } from '../banking';

jest.mock('@sentry/react', () => ({
  addBreadcrumb: jest.fn(),
}));

describe('processTransfer', () => {
  const baseRequest: TransferRequest = {
    amount: 100,
    currency: 'EUR',
    recipientName: 'Sarah Johnson',
    recipientAccount: 'IBAN ...4521',
  };

  it('processes a transfer with default (standard) account tier', () => {
    const result = processTransfer(baseRequest);
    expect(result.success).toBe(true);
    expect(result.fee).toBe(1); // 100 * 0.01
    expect(result.totalAmount).toBe(101);
    expect(result.transactionId).toMatch(/^TXN-/);
  });

  it('processes a transfer for premium account tier without TypeError', () => {
    const result = processTransfer({ ...baseRequest, accountTier: 'premium' });
    expect(result.success).toBe(true);
    expect(result.fee).toBe(0.5); // 100 * 0.005
    expect(result.totalAmount).toBe(100.5);
  });

  it('processes a transfer for basic account tier', () => {
    const result = processTransfer({ ...baseRequest, accountTier: 'basic' });
    expect(result.success).toBe(true);
    expect(result.fee).toBe(2); // 100 * 0.02
    expect(result.totalAmount).toBe(102);
  });

  it('processes a transfer for standard account tier', () => {
    const result = processTransfer({ ...baseRequest, accountTier: 'standard' });
    expect(result.success).toBe(true);
    expect(result.fee).toBe(1); // 100 * 0.01
    expect(result.totalAmount).toBe(101);
  });

  it('falls back to default fee config for unknown account tier', () => {
    const result = processTransfer({ ...baseRequest, accountTier: 'enterprise' });
    expect(result.success).toBe(true);
    expect(result.fee).toBe(1.5); // 100 * 0.015 (default rate)
    expect(result.totalAmount).toBe(101.5);
  });

  it('throws an error for zero amount', () => {
    expect(() => processTransfer({ ...baseRequest, amount: 0 })).toThrow(
      'Transfer amount must be greater than zero'
    );
  });

  it('throws an error for negative amount', () => {
    expect(() => processTransfer({ ...baseRequest, amount: -50 })).toThrow(
      'Transfer amount must be greater than zero'
    );
  });

  it('throws an error for missing recipient account', () => {
    expect(() =>
      processTransfer({ ...baseRequest, recipientAccount: '' })
    ).toThrow('Recipient account is required');
  });

  it('respects minimum fee for small transfers', () => {
    const result = processTransfer({
      ...baseRequest,
      amount: 1,
      accountTier: 'standard',
    });
    expect(result.fee).toBe(0.25); // min fee for standard
  });

  it('respects maximum fee for large transfers', () => {
    const result = processTransfer({
      ...baseRequest,
      amount: 50000,
      accountTier: 'standard',
    });
    expect(result.fee).toBe(15); // max fee for standard
  });

  it('applies zero minimum fee for premium tier', () => {
    const result = processTransfer({
      ...baseRequest,
      amount: 0.01,
      accountTier: 'premium',
    });
    expect(result.fee).toBe(0.00005); // 0.01 * 0.005, no min fee
    expect(result.totalAmount).toBeCloseTo(0.01005);
  });
});
