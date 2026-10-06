import { formatMoney, formatDate } from '../../api/format';
import { Account } from '../../api/types';

// interfaces
interface IProps {
  account: Account;
  onSelect?: (account: Account) => void;
}

const typeLabel: Record<Account['type'], string> = {
  checking: 'Checking',
  savings: 'Savings',
  credit: 'Credit card',
  loan: 'Mortgage',
};

const AccountCard: React.FC<IProps> = ({ account, onSelect }) => {
  const isDeposit = account.type === 'checking' || account.type === 'savings';
  const headline = isDeposit
    ? (account.availableBalance ?? account.currentBalance)
    : account.currentBalance;
  const headlineLabel = isDeposit
    ? 'Available balance'
    : account.type === 'credit'
      ? 'Current balance'
      : 'Principal balance';

  return (
    <button
      type='button'
      className='wf-account-card flex flex-space-between'
      onClick={() => onSelect?.(account)}
      aria-label={`${account.name} ending in ${account.lastFour}`}
    >
      <div className='flex flex-col'>
        <span className='wf-account-type'>{typeLabel[account.type]}</span>
        <span className='wf-account-name'>
          {account.name} <span className='wf-account-number'>...{account.lastFour}</span>
        </span>
        {account.type === 'credit' && account.paymentDueDate && (
          <span className='wf-account-meta'>
            Minimum payment {formatMoney(account.minimumPaymentDue ?? 0)} due{' '}
            {formatDate(account.paymentDueDate)}
          </span>
        )}
        {account.type === 'loan' && account.paymentDueDate && (
          <span className='wf-account-meta'>
            Next payment {formatMoney(account.nextPaymentAmount ?? 0)} due{' '}
            {formatDate(account.paymentDueDate)}
          </span>
        )}
      </div>
      <div className='flex flex-col flex-end right'>
        <span className='wf-account-balance'>{formatMoney(headline)}</span>
        <span className='wf-account-meta'>{headlineLabel}</span>
        {account.type === 'credit' && account.availableCredit !== undefined && (
          <span className='wf-account-meta'>
            {formatMoney(account.availableCredit)} available credit
          </span>
        )}
      </div>
    </button>
  );
};

export default AccountCard;
