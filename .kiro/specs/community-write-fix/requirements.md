# Requirements Document: Community Data Processing Fix

## Introduction

This feature addresses critical data processing issues in the community system. The main problems are:
1. Student and admin pages use completely different data handling approaches (API vs local state)
2. Multiple WritePostModal files causing code duplication and inconsistency
3. Admin posts are not persisted to the server and are lost on page refresh
4. CommunityReadModal lacks delete functionality for admin users
5. File attachment handling is inconsistent between student and admin pages

## Glossary

- **Admin Community Page**: Community board accessible only to administrators
- **Student Community Page**: Community board accessible to students
- **CommunityWriteModal**: Modal component for creating new community posts
- **Post**: User-generated content with title, content, and optional attachments
- **Modal**: Dialog box overlay for user interaction
- **Attachment**: Files (images, PDFs, documents) attached to posts
- **API Persistence**: Saving data to the server via API calls
- **Local State**: Data stored only in browser memory

## Requirements

### Requirement 1: Unified Data Handling for Admin and Student Pages

**User Story:** As a system administrator, I want the admin community page to use the same API-based data handling as the student page, so that all posts are persisted to the server and data remains consistent.

#### Acceptance Criteria

1. WHEN the admin page loads, THE page SHALL fetch posts from the API endpoint `/api/community/`
2. WHEN an admin creates a new post, THE post SHALL be sent to the server via API
3. WHEN a post is created, THE admin page SHALL refresh the post list from the server
4. WHEN the page is refreshed, THE admin posts SHALL remain visible (persisted on server)
5. WHEN an admin deletes a post, THE deletion SHALL be sent to the server via API

### Requirement 2: Consolidate WritePostModal Components

**User Story:** As a developer, I want to have a single WritePostModal component used by both student and admin pages, so that code duplication is eliminated and maintenance is simplified.

#### Acceptance Criteria

1. WHEN the student page imports WritePostModal, THE component SHALL work correctly
2. WHEN the admin page imports WritePostModal, THE component SHALL work correctly
3. WHEN the component is used, THE same code SHALL handle both student and admin scenarios
4. WHEN the component receives an isAdmin prop, THE behavior SHALL adapt accordingly
5. WHEN the component is removed from unused locations, THE application SHALL still function

### Requirement 3: Implement Delete Functionality in CommunityReadModal

**User Story:** As an administrator, I want to delete community posts from the read modal, so that I can remove inappropriate or outdated content.

#### Acceptance Criteria

1. WHEN an admin opens a post in read mode, THE delete button SHALL be visible
2. WHEN a student opens a post in read mode, THE delete button SHALL NOT be visible
3. WHEN an admin clicks the delete button, THE post SHALL be deleted from the server
4. WHEN a post is deleted, THE read modal SHALL close and the post list SHALL be updated
5. WHEN a post is deleted, THE user SHALL see a confirmation message

### Requirement 4: Consistent File Attachment Handling

**User Story:** As a system administrator, I want file attachments to be handled consistently across student and admin pages, so that all files are properly persisted and accessible.

#### Acceptance Criteria

1. WHEN a file is attached in the write modal, THE file SHALL be included in the API request
2. WHEN a post with attachments is created, THE files SHALL be uploaded to the server
3. WHEN a post is read, THE attachments SHALL be displayed correctly
4. WHEN an attachment is downloaded, THE file SHALL be retrieved from the server
5. WHEN the page is refreshed, THE attachments SHALL still be accessible

### Requirement 5: Implement Post View Count Tracking

**User Story:** As a system administrator, I want view counts to be tracked on the server, so that view data persists across sessions and is accurate.

#### Acceptance Criteria

1. WHEN a post is opened, THE view count SHALL be incremented on the server
2. WHEN the page is refreshed, THE view count SHALL remain accurate
3. WHEN multiple users view the same post, THE view count SHALL reflect all views
4. WHEN a post is displayed in the list, THE current view count SHALL be shown

### Requirement 6: Ensure Data Consistency Between Pages

**User Story:** As a user, I want to see the same posts on both student and admin pages, so that the community data is consistent across the application.

#### Acceptance Criteria

1. WHEN a post is created on the admin page, THE post SHALL appear on the student page
2. WHEN a post is deleted on the admin page, THE post SHALL be removed from the student page
3. WHEN a post is viewed on the student page, THE view count SHALL be updated on the admin page
4. WHEN the page is refreshed, THE data SHALL be synchronized with the server
