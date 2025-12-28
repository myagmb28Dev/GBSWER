# Design Document: Main Page Admin Improvements

## Overview

This design addresses three key improvements for the admin main page:
1. Calendar maximum width set to 580px
2. Today's notices filtered to show only admin-posted content
3. Navigation arrows moved outside the calendar box with vertical scrolling for events

The solution involves creating an admin-specific main page layout with custom calendar styling and notice filtering logic.

## Architecture

```
Admin Main Page
├── Layout Structure
│   ├── Header
│   ├── Content Container
│   │   ├── Left Section
│   │   │   ├── Weekly Schedule
│   │   │   └── Notice Card (Admin-filtered)
│   │   └── Right Section
│   │       └── Calendar (Admin-specific)
│   ├── Class Button Container
│   └── Footer
│
├── Calendar Component (Admin)
│   ├── Header with Title
│   ├── Navigation (Outside box)
│   │   ├── Previous Month Button (<)
│   │   └── Next Month Button (>)
│   └── Calendar Grid
│       ├── Weekday Headers
│       └── Calendar Days
│           └── Events Container (Vertical scroll only)
│
└── Notice Card (Admin-filtered)
    ├── Header
    ├── Notice List (Admin-only)
    └── Detail Modal
```

## Components and Interfaces

### Admin Main Page Layout

**Structure**:
- Inherits from MainBoard but with admin-specific styling
- Calendar max-width: 580px
- Notice filtering applied

### Calendar Component (Admin Variant)

**Props**:
- `isAdmin?: boolean` - Flag for admin-specific styling

**Key Changes**:
- Max-width: 580px (instead of 870px)
- Navigation arrows positioned outside the calendar box
- Events container with vertical scrollbar only
- No horizontal scrollbar

### Notice Card (Admin Variant)

**Props**:
- `isAdmin?: boolean` - Flag for admin-only filtering

**Key Changes**:
- Filter notices to show only author === "관리자"
- Apply only on admin main page
- Student page shows all notices

## Data Models

### Notice Object
```javascript
{
  id: number,              // Unique identifier
  author: string,          // "관리자" or other department
  title: string,           // Notice title
  targetClass: string,     // Target audience
  date: string,            // Date (YYYY-MM-DD)
  content: string          // Notice content
}
```

### Filtered Notices (Admin)
```javascript
// Only notices where author === "관리자"
const adminNotices = mockNoticeData.filter(notice => notice.author === "관리자");
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Calendar Maximum Width

**For any** admin main page, the calendar should have a maximum width of 580px and should not exceed this width on any screen size.

**Validates: Requirements 1.1, 1.2, 1.3, 1.4**

### Property 2: Admin-Only Notice Filtering

**For any** notice list on the admin main page, only notices with author "관리자" should be displayed.

**Validates: Requirements 2.1, 2.2, 2.3**

### Property 3: Navigation Arrows Outside Box

**For any** calendar display, the navigation arrows should be positioned outside the calendar grid box and remain visible.

**Validates: Requirements 3.1, 3.2, 3.3**

### Property 4: Vertical Scrollbar Only

**For any** calendar date with multiple events, the events container should display a vertical scrollbar and should not display a horizontal scrollbar.

**Validates: Requirements 3.4, 4.1, 4.2, 4.3, 4.5**

### Property 5: Event Container Stability

**For any** calendar state with scrolling events, the calendar layout should remain stable and not shift when scrolling.

**Validates: Requirements 4.4**

### Property 6: Admin-Only Application

**For any** main page view, admin pages should have the specified styling while student pages should remain unchanged.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

## Error Handling

- **No Admin Notices**: Display "공지사항이 없습니다." when no admin notices exist
- **Calendar Overflow**: Ensure calendar never exceeds 580px width
- **Event Overflow**: Vertical scrollbar appears automatically when events exceed container height
- **Layout Stability**: Calendar layout remains stable during scrolling

## Testing Strategy

### Unit Tests

- Test that calendar max-width is 580px
- Test that notice filtering shows only admin-posted content
- Test that navigation arrows are positioned outside the box
- Test that vertical scrollbar appears for multiple events
- Test that horizontal scrollbar does not appear
- Test that calendar layout remains stable during scrolling
- Test that admin and student pages have different styling

### Property-Based Tests

- **Property 1**: For any screen size, calendar width should not exceed 580px
- **Property 2**: For any notice list, only admin-authored notices should be displayed
- **Property 3**: For any calendar state, navigation arrows should be outside the box
- **Property 4**: For any event list, vertical scrollbar should appear but not horizontal
- **Property 5**: For any scrolling action, calendar layout should remain stable
- **Property 6**: For admin vs student pages, styling should differ appropriately

### Test Configuration

- Minimum 100 iterations per property test
- Each test should reference its corresponding design property
- Tag format: **Feature: main-page-admin-improvements, Property {number}: {property_text}**
