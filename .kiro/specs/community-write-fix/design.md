# Design Document: Community Data Processing Fix

## Overview

This design addresses critical data processing inconsistencies in the community system:
1. Admin and student pages use different data handling approaches (API vs local state)
2. Multiple WritePostModal files cause code duplication
3. Admin posts are not persisted to the server
4. CommunityReadModal lacks delete functionality
5. File attachment handling is inconsistent

The solution involves:
1. Unifying data handling to use API-based approach for both pages
2. Consolidating WritePostModal into a single component
3. Adding delete functionality to CommunityReadModal
4. Ensuring consistent file attachment handling
5. Implementing server-side view count tracking

## Architecture

```
Community System (Unified)
├── CommunityBoard (Base Component)
│   ├── Student Version
│   │   ├── API-based data fetching
│   │   ├── Read-only access
│   │   └── View count tracking
│   └── Admin Version
│       ├── API-based data fetching (same as student)
│       ├── Write/Delete access
│       └── View count tracking
│
├── CommunityWriteModal (Unified Component)
│   ├── Props: isOpen, onClose, onSubmit, isAdmin
│   ├── State: formData, attachments
│   ├── File handling: FormData + API upload
│   └── Validation: Title and content required
│
├── CommunityReadModal (Enhanced)
│   ├── Props: isOpen, onClose, post, onDelete, isAdmin
│   ├── Display: Title, content, attachments
│   ├── Delete button: Visible only for admin
│   └── Download: File attachment download
│
└── Data Flow
    ├── Fetch: GET /api/community/
    ├── Create: POST /api/community/write
    ├── Delete: DELETE /api/community/{id}
    ├── View: PUT /api/community/{id}/view
    └── Sync: All operations update server first
```

## Components and Interfaces

### Unified CommunityWriteModal Component

**Props**:
- `isOpen: boolean` - Controls modal visibility
- `onClose: function` - Callback when modal closes
- `onSubmit: function` - Callback when post is submitted
- `isAdmin?: boolean` - Optional flag for admin-specific behavior

**State**:
- `formData: {title: string, content: string, isAnonymous: boolean}`
- `attachments: Array<{id, name, size, type, file, url}>`

**Key Methods**:
- `handleFileChange(e)`: Processes file uploads
- `removeAttachment(id)`: Removes attachment and revokes URL
- `handleSubmit()`: Validates form and calls onSubmit with FormData
- `handleClose()`: Cleans up resources and closes modal
- `formatFileSize(bytes)`: Converts bytes to readable format

### Enhanced CommunityReadModal Component

**Props**:
- `isOpen: boolean` - Controls modal visibility
- `onClose: function` - Callback when modal closes
- `post: object` - Post data to display
- `onDelete?: function` - Callback for delete action
- `isAdmin?: boolean` - Flag to show admin controls

**Key Methods**:
- `handleDownload(attachment)`: Downloads file attachment
- `handleDelete()`: Calls onDelete callback with post ID
- `renderDeleteButton()`: Shows delete button only for admin

### Unified CommunityBoard Component

**Props**: None (page component)

**State**:
- `posts: Array` - List of posts from server
- `showWriteModal: boolean` - Write modal visibility
- `showReadModal: boolean` - Read modal visibility
- `selectedPost: object` - Currently selected post
- `currentPage: number` - Current pagination page

**Key Methods**:
- `fetchPosts()`: GET /api/community/ - Fetch all posts
- `handleWritePost(postData)`: POST /api/community/write - Create post
- `handleReadPost(post)`: PUT /api/community/{id}/view - Increment view count
- `handleDeletePost(postId)`: DELETE /api/community/{id} - Delete post
- `handlePageChange(pageNumber)`: Update current page

## Data Models

### Post Object (from server)
```javascript
{
  id: number,              // Unique post ID
  date: string,            // Creation date (YYYY.MM.DD)
  title: string,           // Post title
  content: string,         // Post content
  author: string,          // Author name or "익명N"
  isAnonymous: boolean,    // Anonymous flag
  attachments: Array,      // Attached files
  views: number,           // View count (server-tracked)
  createdAt: string,       // Server timestamp
  updatedAt: string        // Last update timestamp
}
```

### FormData Structure (for API submission)
```javascript
FormData {
  title: string,
  content: string,
  major: string,           // "ALL" for community
  isAnonymous: boolean,
  files: File[]            // Multiple files
}
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: API-Based Data Persistence

**For any** post created on the admin page, the post should be persisted to the server and remain visible after page refresh.

**Validates: Requirements 1.1, 1.2, 1.3, 1.4**

### Property 2: Unified Component Behavior

**For any** WritePostModal instance, the component should work identically for both student and admin pages, with behavior adapting based on the isAdmin prop.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

### Property 3: Admin Delete Functionality

**For any** post viewed by an admin, the delete button should be visible and functional, removing the post from both the server and the UI.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

### Property 4: Consistent File Handling

**For any** file attached to a post, the file should be uploaded to the server and remain accessible after page refresh.

**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**

### Property 5: Server-Side View Tracking

**For any** post opened by a user, the view count should be incremented on the server and persist across sessions.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

### Property 6: Cross-Page Data Consistency

**For any** post created or deleted on the admin page, the change should be immediately visible on the student page without requiring a manual refresh.

**Validates: Requirements 6.1, 6.2, 6.3, 6.4**

## Error Handling

- **Empty Form**: Display alert "제목과 내용을 입력해주세요." when submit is clicked without title or content
- **API Errors**: Display user-friendly error messages for network failures
- **File Upload Errors**: Handle file size limits and unsupported file types
- **Delete Confirmation**: Show confirmation dialog before deleting posts
- **Data Sync Errors**: Retry failed API calls or show error notification

## Testing Strategy

### Unit Tests

- Test that CommunityWriteModal validates form inputs correctly
- Test that CommunityReadModal displays delete button only for admin
- Test that file attachments are properly formatted for API submission
- Test that post data is correctly displayed in the read modal
- Test that pagination works correctly with server data
- Test that view count increments on post open

### Property-Based Tests

- **Property 1**: For any post created, it should persist on server and survive page refresh
- **Property 2**: For any WritePostModal usage, behavior should be consistent across pages
- **Property 3**: For any admin user, delete action should remove post from server and UI
- **Property 4**: For any file attachment, it should be uploaded and remain accessible
- **Property 5**: For any post view, view count should increment on server
- **Property 6**: For any admin action, student page should reflect changes without refresh

### Test Configuration

- Minimum 100 iterations per property test
- Each test should reference its corresponding design property
- Tag format: **Feature: community-data-fix, Property {number}: {property_text}**
