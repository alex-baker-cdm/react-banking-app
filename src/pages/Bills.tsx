import { useState } from 'react';

// components
import Button from '../components/Form/Button';
import Layout from '../components/Layout/Layout';
import Divider from '../components/Divider/Divider';

// interfaces
interface IBill {
  id: number;
  icon: string;
  color: string;
  payee: string;
  date: string;
  amount: number;
  status: 'due-soon' | 'scheduled' | 'paid' | 'overdue';
  statusLabel: string;
}

const upcomingBills: IBill[] = [
  {
    id: 1,
    icon: 'water_drop',
    color: 'gray',
    payee: 'Water Company',
    date: 'Due Apr 8',
    amount: 54.21,
    status: 'due-soon',
    statusLabel: 'Due Soon',
  },
  {
    id: 2,
    icon: 'bolt',
    color: 'green',
    payee: 'Electric Company',
    date: 'Due Apr 12',
    amount: 43.55,
    status: 'scheduled',
    statusLabel: 'Scheduled',
  },
  {
    id: 3,
    icon: 'wifi',
    color: 'blue',
    payee: 'Internet Provider',
    date: 'Due Apr 15',
    amount: 39.99,
    status: 'scheduled',
    statusLabel: 'Scheduled',
  },
  {
    id: 4,
    icon: 'phone_android',
    color: 'purple',
    payee: 'Mobile Plan',
    date: 'Due Apr 18',
    amount: 29.99,
    status: 'scheduled',
    statusLabel: 'Scheduled',
  },
  {
    id: 5,
    icon: 'home',
    color: 'orange',
    payee: 'Rent',
    date: 'Due Apr 1',
    amount: 650.0,
    status: 'overdue',
    statusLabel: 'Overdue',
  },
  {
    id: 6,
    icon: 'sync',
    color: 'red',
    payee: 'Netflix',
    date: 'Due Apr 22',
    amount: 12.99,
    status: 'scheduled',
    statusLabel: 'Scheduled',
  },
];

const paidBills: IBill[] = [
  {
    id: 7,
    icon: 'water_drop',
    color: 'gray',
    payee: 'Water Company',
    date: 'Paid Mar 8',
    amount: 52.1,
    status: 'paid',
    statusLabel: 'Paid',
  },
  {
    id: 8,
    icon: 'bolt',
    color: 'green',
    payee: 'Electric Company',
    date: 'Paid Mar 12',
    amount: 41.3,
    status: 'paid',
    statusLabel: 'Paid',
  },
  {
    id: 9,
    icon: 'home',
    color: 'orange',
    payee: 'Rent',
    date: 'Paid Mar 1',
    amount: 650.0,
    status: 'paid',
    statusLabel: 'Paid',
  },
];

type Tab = 'upcoming' | 'paid' | 'all';

const Bills: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');

  const getBills = (): IBill[] => {
    switch (activeTab) {
      case 'upcoming':
        return upcomingBills;
      case 'paid':
        return paidBills;
      case 'all':
        return [...upcomingBills, ...paidBills];
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'paid', label: 'Paid' },
    { key: 'all', label: 'All' },
  ];

  return (
    <Layout>
      <Divider />

      <div className='center'>
        <h1 className='title no-select' style={{ marginBottom: '5px' }}>
          April Bills
        </h1>
        <p className='information text-shadow' style={{ fontSize: '1.1em', color: '#999999' }}>
          €847.55 due this month
        </p>
      </div>

      <Divider />

      <div className='flex flex-h-center' style={{ gap: '10px', marginBottom: '20px' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className='no-select'
            style={{
              padding: '8px 20px',
              borderRadius: '50em',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9em',
              fontWeight: 500,
              color: '#ffffff',
              backgroundColor: activeTab === tab.key ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              transition: 'all 0.3s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className='history'>
        {getBills().map((bill) => (
          <div key={bill.id} className='history-line flex flex-v-center'>
            <div className={`circle-icon ${bill.color} flex flex-h-center flex-v-center no-select`}>
              <span className='material-symbols-outlined' style={{ color: '#ffffff' }}>
                {bill.icon}
              </span>
            </div>
            <div className='history-line-details'>
              <div className='name'>{bill.payee}</div>
              <div className='time'>{bill.date}</div>
            </div>
            <div className='flex flex-col flex-v-center' style={{ alignItems: 'flex-end' }}>
              <div className='history-line-amount' style={{ marginBottom: '4px' }}>
                €{bill.amount.toFixed(2)}
              </div>
              <span className={`status-badge ${bill.status}`}>{bill.statusLabel}</span>
            </div>
          </div>
        ))}
      </div>

      <Divider />

      <div className='flex flex-space-between'>
        <Button type='button' text='Add New Bill' tabIndex={0} />
      </div>

      <Divider />
    </Layout>
  );
};

export default Bills;
