import Button from '../Form/Button';

// interfaces
interface IProps {
  amount: number;
  currencySymbol?: string;
  recipientName: string;
  onDone: () => void;
}

const TransferSuccess: React.FC<IProps> = ({
  amount,
  currencySymbol = '\u20ac',
  recipientName,
  onDone,
}) => (
  <div className='flex flex-col flex-v-center flex-h-center' style={{ padding: '40px 0' }}>
    <span
      className='material-symbols-outlined'
      style={{ fontSize: '4em', color: '#4ed34e', marginBottom: '20px' }}
    >
      check_circle
    </span>
    <h1 className='title no-select'>Transfer Successful!</h1>
    <p className='text-shadow' style={{ fontSize: '2em', fontWeight: 500, margin: '10px 0' }}>
      {currencySymbol}
      {amount.toFixed(2)}
    </p>
    <p className='information text-shadow' style={{ marginBottom: '30px' }}>
      sent to {recipientName}
    </p>
    <div className='add-buttons flex flex-space-between'>
      <Button type='button' text='Done' tabIndex={0} onClick={onDone} />
    </div>
  </div>
);

export default TransferSuccess;
