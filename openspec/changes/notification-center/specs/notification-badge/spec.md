## ADDED Requirements

### Requirement: Header notification badge
The system SHALL display a notification bell icon in the app header with a badge showing the count of unread notifications.

#### Scenario: Unread notifications exist
- **WHEN** there are unread notifications
- **THEN** the header displays a bell icon with a numeric badge showing the unread count

#### Scenario: No unread notifications
- **WHEN** all notifications are read
- **THEN** the header displays a bell icon without a badge

#### Scenario: Badge navigation
- **WHEN** user taps the notification bell icon in the header
- **THEN** the app navigates to the `/notifications` page
