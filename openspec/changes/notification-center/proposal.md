## Why

The banking app's Profile page displays an "Inbox" link with a notification badge (4), but tapping it leads nowhere — there is no notification center. Users need a dedicated page to view, categorize, and manage their notifications (payment alerts, security warnings, promotions) to stay informed about account activity.

## What Changes

- Add a new `/notifications` route and `Notifications` page component
- Create `NotificationItem` component for rendering individual notifications with read/unread state
- Create `NotificationFilters` component for filtering by category (All, Payments, Security, Promotions)
- Add notification type definitions and mock data
- Wire the Profile page "Inbox" link to navigate to `/notifications`
- Add a notification bell icon to the app header with unread count badge

## Capabilities

### New Capabilities
- `notification-center`: Full notification center page with categorized notifications, read/unread state management, and mark-as-read functionality
- `notification-badge`: Unread notification count badge displayed in the header across all pages

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- **New files**: `src/pages/Notifications.tsx`, `src/components/Notification/NotificationItem.tsx`, `src/components/Notification/NotificationFilters.tsx`, `src/components/Notification/NotificationBadge.tsx`, `src/types/notification.ts`, `src/data/notifications.ts`
- **Modified files**: `src/navigation/Navigation.tsx` (new route), `src/pages/Profile.tsx` (link update), `src/components/Header/Header.tsx` (badge integration)
- **Dependencies**: None — uses only existing React, React Router, and CSS patterns already in the project
- **Styles**: New CSS classes in `public/app.css` following existing glassmorphism design patterns
