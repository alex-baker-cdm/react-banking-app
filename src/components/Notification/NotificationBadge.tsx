import { Link } from 'react-router-dom';

import { useNotifications } from '../../context/NotificationContext';

const NotificationBadge: React.FC = () => {
  const { unreadCount } = useNotifications();

  return (
    <Link
      to='/notifications'
      className='header-button notification-badge-btn flex flex-v-center flex-h-center'
    >
      <span className='material-symbols-outlined'>notifications</span>
      {unreadCount > 0 && (
        <span className='notification-badge flex flex-v-center flex-h-center'>{unreadCount}</span>
      )}
    </Link>
  );
};

export default NotificationBadge;
