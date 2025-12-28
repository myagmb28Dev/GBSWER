# Project Restructuring Plan

## Overview
Reorganize the project to:
1. Use URL-based routing instead of context-based
2. Organize components by page with student/admin separation
3. Clear naming conventions for student/admin components
4. Maintain shared components in Shared folders

## New Structure

### Pages Structure
```
src/pages/
├── Login/
│   └── Login.jsx
├── Main/
│   ├── Student/
│   │   └── MainBoardStudent.jsx
│   └── Admin/
│       └── MainBoardAdmin.jsx
├── Community/
│   ├── Student/
│   │   └── CommunityBoardStudent.jsx
│   └── Admin/
│       └── CommunityBoardAdmin.jsx
├── Classroom/
│   ├── Student/
│   │   └── ClassroomBoardStudent.jsx
│   └── Admin/
│       └── ClassroomBoardAdmin.jsx
└── MyPage/
    ├── Student/
    │   └── MyPageBoardStudent.jsx
    └── Admin/
        └── MyPageBoardAdmin.jsx
```

### Components Structure
```
src/components/
├── Shared/
│   ├── Header/
│   ├── Footer/
│   └── UserProfileModal/
├── Main/
│   └── Shared/
│       ├── Calendar/
│       ├── WeeklySchedule/
│       └── NoticeCard/
├── Community/
│   └── Shared/
│       ├── CommunityPostTable/
│       ├── CommunityPagination/
│       ├── CommunityReadModal/
│       ├── CommunityWriteModal/
│       └── CommunityEmptyState/
├── Classroom/
│   ├── Shared/
│   │   ├── ClassCard/
│   │   ├── ClassDetailCard/
│   │   ├── ClassParticipantsModal/
│   │   └── ClassCreateButton/
│   ├── Student/
│   │   ├── ClassDetailSidebar/
│   │   └── StudentClassModal/
│   └── Admin/
│       ├── AdminClassDetailSidebar/
│       └── AdminClassModal/
└── MyPage/
    └── Shared/
        ├── UserProfileCard/
        ├── PersonalScheduleBox/
        ├── SchoolMealCard/
        └── ClassTimetable/
```

## Routing Strategy
- Use React Router with URL paths: `/student/main`, `/admin/main`, etc.
- Maintain userRole in context for permission checks
- URL determines which page/component to render

## Naming Conventions
- Student components: `ComponentNameStudent.jsx` or just `ComponentName.jsx` in Student folder
- Admin components: `ComponentNameAdmin.jsx` or just `ComponentName.jsx` in Admin folder
- Shared components: `ComponentName.jsx` in Shared folder
- Pages: `PageNameStudent.jsx` / `PageNameAdmin.jsx`

## Implementation Steps
1. Create new folder structure
2. Copy and rename existing components
3. Update import paths
4. Implement React Router
5. Update App.js with new routing
6. Test all pages and navigation
