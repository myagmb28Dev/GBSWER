# Requirements Document: Main Page Admin Improvements

## Introduction

This feature addresses three key improvements needed for the admin main page:
1. Calendar maximum width should be 580px
2. Today's notices should only display content posted by admins
3. Navigation arrows (<>) should be moved outside the calendar box with vertical scrollbar for multiple events (no horizontal scrollbar)

## Glossary

- **Admin Main Page**: Dashboard for administrators with calendar and notices
- **Calendar**: Monthly event display grid with navigation
- **Navigation Arrows**: Previous/Next month buttons (< and >)
- **Today's Notices**: Section showing notices posted on the current date
- **Vertical Scrollbar**: Scrolling mechanism for multiple events within a fixed height
- **Horizontal Scrollbar**: Scrolling mechanism that should be removed from event display

## Requirements

### Requirement 1: Calendar Maximum Width

**User Story:** As an administrator, I want the calendar to have a maximum width of 580px, so that the layout is properly proportioned on the main page.

#### Acceptance Criteria

1. WHEN the admin main page loads, THE calendar SHALL have a maximum width of 580px
2. WHEN the page is viewed on different screen sizes, THE calendar SHALL not exceed 580px width
3. WHEN the calendar is displayed, THE layout SHALL remain centered and properly aligned
4. THE calendar SHALL maintain its aspect ratio and readability at 580px width

### Requirement 2: Admin-Only Notices

**User Story:** As an administrator, I want today's notices to show only content posted by admins, so that important administrative announcements are highlighted.

#### Acceptance Criteria

1. WHEN the admin views the main page, THE "오늘의 공지사항" section SHALL display only notices with author "관리자"
2. WHEN multiple admin notices exist for today, THE section SHALL display all of them
3. WHEN no admin notices exist for today, THE section SHALL display "공지사항이 없습니다."
4. WHEN a notice is clicked, THE modal SHALL display the full notice details
5. THE notice filtering SHALL be applied only on the admin main page

### Requirement 3: Navigation Arrows Outside Calendar Box

**User Story:** As an administrator, I want the navigation arrows to be positioned outside the calendar box, so that the calendar layout is cleaner.

#### Acceptance Criteria

1. WHEN the calendar is displayed, THE navigation arrows (<>) SHALL be positioned outside the calendar box
2. WHEN the arrows are clicked, THE calendar month SHALL change correctly
3. THE arrows SHALL remain visible and accessible at all times
4. THE calendar box SHALL not have horizontal scrollbar
5. WHEN multiple events exist on a date, THE events SHALL display with vertical scrollbar only

### Requirement 4: Vertical Scrollbar for Multiple Events

**User Story:** As an administrator, I want to see multiple events on a single date with vertical scrolling, so that all events are visible without horizontal scrolling.

#### Acceptance Criteria

1. WHEN a calendar date has multiple events, THE events container SHALL display a vertical scrollbar
2. WHEN scrolling vertically, THE events SHALL be visible one at a time or stacked
3. WHEN the calendar is displayed, THE horizontal scrollbar SHALL NOT appear
4. WHEN events are scrolled, THE calendar layout SHALL remain stable
5. THE vertical scrollbar SHALL only appear when events exceed the container height

### Requirement 5: Admin-Only Application

**User Story:** As a system administrator, I want these changes to apply only to the admin main page, so that the student main page remains unchanged.

#### Acceptance Criteria

1. WHEN an admin views the main page, THE calendar SHALL have 580px max width
2. WHEN an admin views the main page, THE notices SHALL show only admin-posted content
3. WHEN an admin views the main page, THE navigation arrows SHALL be outside the box
4. WHEN a student views the main page, THE calendar layout SHALL remain unchanged
5. THE admin and student main pages SHALL have different styling and behavior

## Requirements Mapping

- **Calendar Width**: Requirement 1
- **Admin-Only Notices**: Requirement 2
- **Navigation Arrows**: Requirement 3
- **Vertical Scrollbar**: Requirement 4
- **Admin-Only Application**: Requirement 5
