## 1. Types and Data

- [ ] 1.1 Create `src/types/notification.ts` with `Notification` interface and `NotificationCategory` type
- [ ] 1.2 Create `src/data/notifications.ts` with mock notification data (8-10 items across all categories)

## 2. Notification Context

- [ ] 2.1 Create `src/context/NotificationContext.tsx` with NotificationProvider and useNotifications hook
- [ ] 2.2 Wrap the app with NotificationProvider in `src/App.tsx`

## 3. Notification Components

- [ ] 3.1 Create `src/components/Notification/NotificationItem.tsx` — single notification row with icon, title, description, time, read/unread indicator
- [ ] 3.2 Create `src/components/Notification/NotificationFilters.tsx` — category filter bar (All, Payments, Security, Promotions)
- [ ] 3.3 Create `src/components/Notification/NotificationBadge.tsx` — bell icon with unread count badge for the Header

## 4. Notifications Page

- [ ] 4.1 Create `src/pages/Notifications.tsx` with Layout, filters, notification list, mark-all-as-read button, and empty state

## 5. Integration

- [ ] 5.1 Add `/notifications` route in `src/navigation/Navigation.tsx`
- [ ] 5.2 Update `src/pages/Profile.tsx` Inbox link to navigate to `/notifications`
- [ ] 5.3 Add NotificationBadge to `src/components/Header/Header.tsx`

## 6. Styles

- [ ] 6.1 Add notification-related CSS classes to `public/app.css`

## 7. Verification

- [ ] 7.1 Run lint and typecheck, fix any issues
