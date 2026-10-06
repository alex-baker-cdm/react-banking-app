export type AccountType = 'checking' | 'savings' | 'credit' | 'loan';

export interface Account {
  id: string;
  type: AccountType;
  name: string;
  lastFour: string;
  currentBalance: number;
  availableBalance?: number;
  availableCredit?: number;
  creditLimit?: number;
  minimumPaymentDue?: number;
  nextPaymentAmount?: number;
  paymentDueDate?: string;
  apy?: number;
}

export interface Transaction {
  id: string;
  accountId: string;
  postedAt: string;
  description: string;
  amount: number;
}

export interface TransferRequest {
  fromAccountId: string;
  toAccountId: string;
  amount: string;
  memo: string;
}

export interface TransferReceipt {
  confirmationNumber: string;
  postedAt: string;
  amount: number;
  memo: string;
  from: Account;
  to: Account;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  field?: string;
  correlationId?: string;
}
