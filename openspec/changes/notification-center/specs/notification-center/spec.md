## ADDED Requirements

### Requirement: Notification center page
The system SHALL provide a dedicated Notifications page at the `/notifications` route that displays a list of notifications grouped by category.

#### Scenario: User navigates to notifications page
- **WHEN** user navigates to `/notifications`
- **THEN** system displays a page titled "Notifications" with a list of all notifications sorted by most recent first

### Requirement: Notification item display
Each notification item SHALL display an icon, title, description, timestamp, and visual read/unread indicator.

#### Scenario: Unread notification display
- **WHEN** page renders a notification with `read: false`
- **THEN** the notification item displays with a highlighted background and a blue unread dot indicator

#### Scenario: Read notification display
- **WHEN** page renders a notification with `read: true`
- **THEN** the notification item displays with a standard background and no unread dot

### Requirement: Notification categories
The system SHALL support filtering notifications by category: All, Payments, Security, and Promotions.

#### Scenario: Filter by category
- **WHEN** user taps a category filter button (e.g., "Payments")
- **THEN** only notifications matching that category are displayed

#### Scenario: Default filter state
- **WHEN** user first loads the notifications page
- **THEN** the "All" filter is active and all notifications are shown

### Requirement: Mark notification as read
The system SHALL allow users to mark individual notifications as read by tapping on them.

#### Scenario: Tap unread notification
- **WHEN** user taps an unread notification
- **THEN** the notification's state changes to read, and the unread dot indicator disappears

### Requirement: Mark all as read
The system SHALL provide a "Mark all as read" action that marks every notification as read.

#### Scenario: Mark all as read
- **WHEN** user taps the "Mark all as read" button
- **THEN** all notifications transition to read state and all unread dot indicators disappear

### Requirement: Empty state
The system SHALL display an appropriate empty state when no notifications exist for the selected filter.

#### Scenario: No notifications in category
- **WHEN** user selects a category filter that has no matching notifications
- **THEN** system displays an empty state message: "No notifications"
