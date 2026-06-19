import * as Sentry from '@sentry/react';

export interface TransferRequest {
  amount: number;
  currency: string;
  recipientName: string;
  recipientAccount: string;
  accountTier?: string;
}

export interface TransferResult {
  success: boolean;
  transactionId: string;
  fee: number;
  totalAmount: number;
}

interface FeeConfig {
  rate: number;
  minFee: number;
  maxFee: number;
}

const ACCOUNT_FEES: Record<string, FeeConfig> = {
  basic: { rate: 0.02, minFee: 0.5, maxFee: 25 },
  standard: { rate: 0.01, minFee: 0.25, maxFee: 15 },
  premium: { rate: 0.005, minFee: 0, maxFee: 10 },
};

const DEFAULT_FEE_CONFIG: FeeConfig = { rate: 0.015, minFee: 0.25, maxFee: 20 };

function calculateFee(amount: number, accountTier: string): number {
  const config = ACCOUNT_FEES[accountTier] ?? DEFAULT_FEE_CONFIG;
  const fee = amount * config.rate;
  return Math.min(Math.max(fee, config.minFee), config.maxFee);
}

function generateTransactionId(): string {
  return `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

export function processTransfer(request: TransferRequest): TransferResult {
  const { amount, currency, recipientName, recipientAccount, accountTier = 'standard' } = request;

  Sentry.addBreadcrumb({
    category: 'banking',
    message: `Processing transfer of ${currency} ${amount} to ${recipientName}`,
    level: 'info',
    data: { amount, currency, recipientAccount, accountTier },
  });

  if (amount <= 0) {
    throw new Error('Transfer amount must be greater than zero');
  }

  if (!recipientAccount) {
    throw new Error('Recipient account is required');
  }

  const fee = calculateFee(amount, accountTier);
  const totalAmount = amount + fee;
  const transactionId = generateTransactionId();

  Sentry.addBreadcrumb({
    category: 'banking',
    message: `Transfer completed: ${transactionId}`,
    level: 'info',
    data: { transactionId, fee, totalAmount },
  });

  return {
    success: true,
    transactionId,
    fee,
    totalAmount,
  };
}
