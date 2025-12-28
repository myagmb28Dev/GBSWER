# Implementation Plan: Main Page Admin Improvements

## Overview

This implementation plan addresses three key improvements for the admin main page:
1. Set calendar maximum width to 580px
2. Filter today's notices to show only admin-posted content
3. Move navigation arrows outside the calendar box with vertical scrolling for events

The solution involves creating an admin-specific main page with custom styling and filtering logic.

## Tasks

- [ ] 1. Create admin-specific main page layout
  - Create AdminMainBoard component or update existing admin MainBoard
  - Import Calendar, NoticeCard, and WeeklySchedule components
  - Set up layout structure with proper grid
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 2. Update calendar styling for admin page
  - Set calendar max-width to 580px (instead of 870px)
  - Update Calendar.css or create admin-specific CSS
  - Ensure calendar remains centered and properly aligned
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ]* 2.1 Write property test for calendar max-width
  - **Property 1: Calendar Maximum Width**
  - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**

- [ ] 3. Move navigation arrows outside calendar box
  - Modify calendar header layout
  - Position navigation buttons outside the calendar grid
  - Ensure buttons remain visible and accessible
  - _Requirements: 3.1, 3.2, 3.3_

- [ ]* 3.1 Write property test for navigation arrows positioning
  - **Property 3: Navigation Arrows Outside Box**
  - **Validates: Requirements 3.1, 3.2, 3.3**

- [ ] 4. Implement vertical scrollbar for events
  - Update .events-container CSS to show vertical scrollbar only
  - Remove horizontal scrollbar from event display
  - Ensure scrollbar appears only when needed
  - _Requirements: 3.4, 4.1, 4.2, 4.3, 4.5_

- [ ]* 4.1 Write property test for vertical scrollbar
  - **Property 4: Vertical Scrollbar Only**
  - **Validates: Requirements 3.4, 4.1, 4.2, 4.3, 4.5**

- [ ]* 4.2 Write property test for event container stability
  - **Property 5: Event Container Stability**
  - **Validates: Requirements 4.4**

- [ ] 5. Implement admin-only notice filtering
  - Update NoticeCard component to accept isAdmin prop
  - Filter notices to show only author === "관리자"
  - Apply filtering only on admin main page
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ]* 5.1 Write property test for admin-only filtering
  - **Property 2: Admin-Only Notice Filtering**
  - **Validates: Requirements 2.1, 2.2, 2.3**

- [ ] 6. Verify student main page is unaffected
  - Test that student page uses original calendar width (870px)
  - Verify student page shows all notices (not filtered)
  - Ensure no styling conflicts between admin and student pages
  - _Requirements: 5.4, 5.5_

- [ ]* 6.1 Write property test for admin-only application
  - **Property 6: Admin-Only Application**
  - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

- [ ] 7. Test calendar layout and responsiveness
  - Verify calendar displays correctly at 580px width
  - Test on different screen sizes
  - Ensure layout remains stable and centered
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 8. Test notice filtering and display
  - Verify only admin notices are shown on admin page
  - Test notice modal opens correctly
  - Verify empty state displays when no admin notices exist
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 9. Test event scrolling and display
  - Verify vertical scrollbar appears for multiple events
  - Test that horizontal scrollbar does not appear
  - Verify calendar layout remains stable during scrolling
  - _Requirements: 3.4, 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 10. Checkpoint - Ensure all tests pass
  - Run all unit and property tests
  - Verify no console errors or warnings
  - Test both admin and student main pages
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Calendar max-width should be 580px for admin page only
- Notice filtering should show only author === "관리자"
- Navigation arrows should be positioned outside the calendar box
- Vertical scrollbar should appear for multiple events
- Horizontal scrollbar should be removed
- All changes should apply only to admin main page
- Student main page should remain unchanged
