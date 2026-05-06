import { useState } from 'react';

import Layout from '../components/Layout/Layout';
import Divider from '../components/Divider/Divider';
import NotificationItem from '../components/Notification/NotificationItem';
import NotificationFilters from '../components/Notification/NotificationFilters';
import { useNotifications } from '../context/NotificationContext';
import { NotificationCategory } from '../types/notification';

type FilterOption = NotificationCategory | 'all';

const Notifications: React.FC = () => {
  const { markAsRead, markAllAsRead, filterByCategory, unreadCount } = useNotifications();
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');

  const filtered = filterByCategory(activeFilter);

  return (
    <Layout>
      <Divider />

      <div className='flex flex-v-center flex-space-between'>
        <h1 className='title no-select' style={{ marginBottom: 0 }}>Notifications</h1>
        {unreadCount > 0 && (
          <button
            type='button'
            className='mark-all-read'
            onClick={markAllAsRead}
          >
            Mark all as read
          </button>
        )}
      </div>

      <Divider />

      <NotificationFilters active={activeFilter} onFilter={setActiveFilter} />

      <Divider />

      {filtered.length > 0 ? (
        <div className='notification-list'>
          {filtered.map((n) => (
            <NotificationItem key={n.id} notification={n} onTap={markAsRead} />
          ))}
        </div>
      ) : (
        <div className='notification-empty flex flex-col flex-v-center flex-h-center'>
          <span className='material-symbols-outlined'>notifications_off</span>
          <p>No notifications</p>
        </div>
      )}

      <Divider />
    </Layout>
  );
};

export default Notifications;
