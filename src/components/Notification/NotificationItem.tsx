import { Notification } from '../../types/notification';

interface IProps {
  notification: Notification;
  onTap: (id: number) => void;
}

const NotificationItem: React.FC<IProps> = ({ notification, onTap }) => (
  <div
    role='button'
    tabIndex={0}
    className={`notification-item flex flex-v-center${!notification.read ? ' unread' : ''}`}
    onClick={() => { onTap(notification.id); }}
    onKeyDown={(e) => { if (e.key === 'Enter') onTap(notification.id); }}
  >
    <div className='notification-item-icon flex flex-v-center flex-h-center'>
      <span className='material-symbols-outlined'>{notification.icon}</span>
    </div>
    <div className='notification-item-details flex flex-col'>
      <span className='notification-item-title'>{notification.title}</span>
      <span className='notification-item-desc'>{notification.description}</span>
      <span className='notification-item-time'>{notification.time}</span>
    </div>
    {!notification.read && <div className='notification-dot' />}
  </div>
);

export default NotificationItem;
