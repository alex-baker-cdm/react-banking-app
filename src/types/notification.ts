export type NotificationCategory = 'payment' | 'security' | 'promotion';

export interface Notification {
  id: number;
  title: string;
  description: string;
  time: string;
  category: NotificationCategory;
  icon: string;
  read: boolean;
}
