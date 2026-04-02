import { useState } from 'react';

// components
import Layout from '../components/Layout/Layout';
import Divider from '../components/Divider/Divider';

// interfaces
interface INotification {
  id: number;
  icon: string;
  color: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

interface INotificationGroup {
  label: string;
  items: INotification[];
}

const initialNotifications: INotificationGroup[] = [
  {
    label: 'Today',
    items: [
      {
        id: 1,
        icon: 'credit_card',
        color: 'blue',
        title: 'Card Payment',
        description: '\u20AC23.50 at Coffee House',
        time: '2:34 PM',
        read: false,
      },
      {
        id: 2,
        icon: 'arrow_downward',
        color: 'green',
        title: 'Money Received',
        description: '\u20AC500.00 from Sarah Johnson',
        time: '11:20 AM',
        read: false,
      },
      {
        id: 3,
        icon: 'warning',
        color: 'orange',
        title: 'Security Alert',
        description: 'New device login detected',
        time: '9:15 AM',
        read: false,
      },
    ],
  },
  {
    label: 'Yesterday',
    items: [
      {
        id: 4,
        icon: 'sync',
        color: 'purple',
        title: 'Subscription',
        description: 'Netflix monthly payment - \u20AC12.99',
        time: '6:00 PM',
        read: true,
      },
      {
        id: 5,
        icon: 'credit_card',
        color: 'blue',
        title: 'Card Payment',
        description: '\u20AC87.30 at Supermarket',
        time: '3:45 PM',
        read: true,
      },
    ],
  },
  {
    label: 'Earlier this week',
    items: [
      {
        id: 6,
        icon: 'announcement',
        color: 'red',
        title: 'Account Update',
        description: 'Your monthly statement is ready',
        time: 'Mon',
        read: true,
      },
      {
        id: 7,
        icon: 'arrow_downward',
        color: 'green',
        title: 'Money Received',
        description: '\u20AC1,200.00 salary deposit',
        time: 'Mon',
        read: true,
      },
      {
        id: 8,
        icon: 'local_offer',
        color: 'yellow',
        title: 'Promotion',
        description: 'Earn 2% cashback on dining this month',
        time: 'Sun',
        read: true,
      },
    ],
  },
];

const Notifications: React.FC = () => {
  const [groups, setGroups] = useState<INotificationGroup[]>(initialNotifications);

  const markAsRead = (id: number) => {
    setGroups((prev) =>
      prev.map((group) => ({
        ...group,
        items: group.items.map((item) => (item.id === id ? { ...item, read: true } : item)),
      }))
    );
  };

  const markAllAsRead = () => {
    setGroups((prev) =>
      prev.map((group) => ({
        ...group,
        items: group.items.map((item) => ({ ...item, read: true })),
      }))
    );
  };

  return (
    <Layout>
      <Divider />

      <div className='flex flex-v-center flex-space-between' style={{ padding: '0 10px 10px' }}>
        <h1 className='title' style={{ marginBottom: 0 }}>
          Notifications
        </h1>
        <button
          type='button'
          onClick={markAllAsRead}
          style={{
            color: '#ffffff',
            fontSize: '0.85em',
            background: 'none',
            opacity: 0.7,
          }}
        >
          Mark all as read
        </button>
      </div>

      {groups.map((group) => (
        <div key={group.label}>
          <div className='history-header'>
            <span className='text-shadow no-select date'>{group.label}</span>
          </div>

          <div className='history'>
            {group.items.map((item) => (
              <div
                key={item.id}
                role='button'
                tabIndex={0}
                className='history-line flex flex-v-center'
                onClick={() => markAsRead(item.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') markAsRead(item.id);
                }}
                style={{ cursor: 'pointer', position: 'relative' }}
              >
                {!item.read && (
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: '#0a56ea',
                      position: 'absolute',
                      left: 2,
                    }}
                  />
                )}
                <div className='flex flex-v-center flex-h-center' style={{ marginLeft: 10 }}>
                  <div
                    className={`circle-icon ${item.color} flex flex-v-center flex-h-center`}
                    style={{ minWidth: 50 }}
                  >
                    <span className='material-symbols-outlined' style={{ color: '#ffffff' }}>
                      {item.icon}
                    </span>
                  </div>
                </div>
                <div className='history-line-details flex flex-col'>
                  <span className='name' style={{ fontWeight: 500 }}>
                    {item.title}
                  </span>
                  <span className='time'>{item.description}</span>
                </div>
                <div className='history-line-amount flex flex-1 flex-end'>
                  <span style={{ fontSize: '0.8em', color: '#999999', whiteSpace: 'nowrap' }}>
                    {item.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Divider />
        </div>
      ))}
    </Layout>
  );
};

export default Notifications;
