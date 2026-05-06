## Context

The react-banking-app is a mobile-first React 19 + TypeScript SPA using React Router 7 for navigation. All data is currently hardcoded (no backend/API). The Profile page already renders an "Inbox" link with a notification badge count of 4, but it links back to `/profile` with no actual notification functionality.

The existing component patterns use:
- Functional components with TypeScript interfaces
- CSS classes defined in `public/app.css` with a glassmorphism visual style
- Material Symbols for icons
- `Layout` wrapper for consistent page chrome
- `Divider` components for visual separation

## Goals / Non-Goals

**Goals:**
- Provide a fully functional notification center page at `/notifications`
- Support category-based filtering (All, Payments, Security, Promotions)
- Manage read/unread state with local React state (useState)
- Add a header notification badge visible across pages
- Follow existing code conventions and visual design patterns

**Non-Goals:**
- Backend API integration or persistent storage (mock data only, consistent with rest of app)
- Push notifications or real-time updates
- Notification preferences/settings page
- Delete or archive individual notifications

## Decisions

### State management: Local useState vs Context
**Decision**: Use React Context (`NotificationContext`) to share notification state across the Notifications page and the Header badge.

**Rationale**: The badge in the Header needs the unread count, and the Notifications page manages read/unread state. A shared context avoids prop drilling through the Layout → Header chain. This is lightweight and avoids adding a state management library.

**Alternative considered**: Lifting state to App.tsx and passing via props — rejected because it would require modifying the Layout/Header prop chain significantly.

### Data layer: Typed mock data module
**Decision**: Create `src/data/notifications.ts` exporting typed mock notification objects, and `src/types/notification.ts` for the `Notification` and `NotificationCategory` types.

**Rationale**: Matches the app's existing pattern of hardcoded data in components (see History.tsx), but extracted to a module for reuse. Types ensure consistency across components.

### Component structure
**Decision**: Three new components under `src/components/Notification/`:
1. `NotificationItem.tsx` — Single notification row
2. `NotificationFilters.tsx` — Category filter bar
3. `NotificationBadge.tsx` — Bell icon with count badge for the Header

**Rationale**: Follows existing component folder structure (`src/components/<Name>/<Name>.tsx`).

## Risks / Trade-offs

- [Risk] Adding Context provider wrapping the app increases component tree depth → Mitigation: Single lightweight context with minimal re-renders; only the badge and notification page consume it.
- [Risk] Mock data won't persist across page refreshes → Acceptable: consistent with the rest of the app's hardcoded data approach.
- [Trade-off] No tests for the new feature → Will add basic component tests following existing patterns (see `__tests__/` folders in Balance, Card, Currency).
