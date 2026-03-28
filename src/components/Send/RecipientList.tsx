// interfaces
export interface Recipient {
  id: number;
  name: string;
  initials: string;
  color: string;
  accountInfo: string;
}

interface IProps {
  onSelect: (recipient: Recipient) => void;
  selectedId?: number;
}

const recipients: Recipient[] = [
  { id: 1, name: 'Sarah Johnson', initials: 'SJ', color: 'blue', accountInfo: 'IBAN ...4521' },
  { id: 2, name: 'Mike Peters', initials: 'MP', color: 'purple', accountInfo: 'IBAN ...8834' },
  { id: 3, name: 'Emma Wilson', initials: 'EW', color: 'red', accountInfo: 'IBAN ...2290' },
  { id: 4, name: 'James Brown', initials: 'JB', color: 'green', accountInfo: 'IBAN ...6617' },
  { id: 5, name: 'Lisa Chen', initials: 'LC', color: 'orange', accountInfo: 'IBAN ...3345' },
];

const RecipientList: React.FC<IProps> = ({ onSelect, selectedId = undefined }) => (
  <div className='history'>
    {recipients.map((recipient) => (
      <div
        key={recipient.id}
        role='button'
        tabIndex={0}
        className='history-line flex flex-v-center'
        style={selectedId === recipient.id ? { backgroundColor: 'rgba(255, 255, 255, 0.1)' } : {}}
        onClick={() => onSelect(recipient)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onSelect(recipient);
          }
        }}
      >
        <div
          className={`flex flex-v-center flex-h-center no-select circle-icon ${recipient.color}`}
        >
          <span style={{ color: '#ffffff', fontWeight: 500, fontSize: '0.9em' }}>
            {recipient.initials}
          </span>
        </div>
        <div className='history-line-details'>
          <p className='name'>{recipient.name}</p>
          <p className='time'>{recipient.accountInfo}</p>
        </div>
      </div>
    ))}
  </div>
);

export default RecipientList;
