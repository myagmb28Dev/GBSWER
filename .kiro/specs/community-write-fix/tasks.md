# Implementation Plan: Community Data Processing Fix

## Overview

This implementation plan addresses critical data processing inconsistencies in the community system. The main tasks involve:
1. Unifying data handling to use API-based approach for both student and admin pages
2. Consolidating WritePostModal into a single component
3. Adding delete functionality to CommunityReadModal
4. Ensuring consistent file attachment handling
5. Implementing server-side view count tracking
6. Removing duplicate files and code

## Tasks

- [x] 1. Update Admin CommunityBoard to use API-based data fetching
  - Add useEffect hook to fetch posts from `/api/community/` on mount
  - Replace local state management with server-based data
  - Update handleWritePost to refresh data from server after creation
  - Implement handleDeletePost to call DELETE API endpoint
  - Ensure view count is tracked on server
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ]* 1.1 Write property test for API-based data persistence
  - **Property 1: API-Based Data Persistence**
  - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**

- [x] 2. Consolidate WritePostModal components
  - Update CommunityWriteModal to handle both student and admin scenarios
  - Add isAdmin prop to CommunityWriteModal
  - Remove Student/WritePostModal.jsx (unused file)
  - Remove Admin/WritePostModal.jsx (replace with unified component)
  - Update both CommunityBoard pages to import from components folder
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ]* 2.1 Write property test for unified component behavior
  - **Property 2: Unified Component Behavior**
  - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**

- [x] 3. Enhance CommunityReadModal with delete functionality
  - Add onDelete and isAdmin props to CommunityReadModal
  - Implement delete button that appears only for admin users
  - Add confirmation dialog before deletion
  - Call onDelete callback with post ID when confirmed
  - Update modal to close after successful deletion
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 3.1 Write property test for admin delete functionality
  - **Property 3: Admin Delete Functionality**
  - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

- [x] 4. Ensure consistent file attachment handling
  - Verify CommunityWriteModal uses FormData for file uploads
  - Ensure files are sent to server via API in handleSubmit
  - Verify CommunityReadModal displays attachments correctly
  - Test file download functionality
  - Ensure attachments persist after page refresh
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]* 4.1 Write property test for consistent file handling
  - **Property 4: Consistent File Handling**
  - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**

- [x] 5. Implement server-side view count tracking
  - Update handleReadPost to call PUT `/api/community/{id}/view` endpoint
  - Ensure view count increments on server when post is opened
  - Verify view count persists after page refresh
  - Display current view count in CommunityReadModal
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ]* 5.1 Write property test for server-side view tracking
  - **Property 5: Server-Side View Tracking**
  - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

- [x] 6. Ensure cross-page data consistency
  - Verify posts created on admin page appear on student page
  - Verify posts deleted on admin page are removed from student page
  - Verify view count updates are reflected on both pages
  - Test data synchronization without manual refresh
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ]* 6.1 Write property test for cross-page consistency
  - **Property 6: Cross-Page Data Consistency**
  - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**

- [x] 7. Clean up duplicate files
  - Delete src/pages/Community/Student/WritePostModal.jsx
  - Delete src/pages/Community/Admin/WritePostModal.jsx
  - Verify no import errors after deletion
  - Confirm both pages use unified CommunityWriteModal
  - _Requirements: 2.5_

- [x] 8. Test data flow across the application
  - Create a post on admin page and verify it appears on student page
  - Delete a post on admin page and verify it's removed from student page
  - Open a post and verify view count increments
  - Refresh page and verify all data persists
  - Test file attachments upload and download
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 6.1, 6.2, 6.3, 6.4_

- [x] 9. Checkpoint - Ensure all tests pass
  - Run all unit and property tests
  - Verify no console errors or warnings
  - Test complete workflow: create, read, update view count, delete
  - Verify data consistency between student and admin pages
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The main issue is inconsistent data handling between student and admin pages
- All operations should use API endpoints for data persistence
- File attachments must be uploaded to the server
- View counts must be tracked on the server
- Data should be synchronized across all pages without manual refresh
- Duplicate files should be removed to reduce code duplication
