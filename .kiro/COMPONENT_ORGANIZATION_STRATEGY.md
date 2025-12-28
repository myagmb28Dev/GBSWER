# Component Organization Strategy

## Current State

Components are currently organized in a flat structure under `src/components/`:

```
src/components/
├── AdminClassModal/
├── Calendar/
├── ClassCard/
├── ClassCreateButton/
├── ClassDetailCard/
├── ClassDetailSidebar/
├── ClassParticipantsModal/
├── ClassTimetable/
├── CommunityEmptyState/
├── CommunityPagination/
├── CommunityPostTable/
├── CommunityReadModal/
├── CommunityWriteModal/
├── Footer/
├── Header/
├── Notice/
├── PersonalScheduleBox/
├── Schedule/
├── SchoolMealCard/
├── StudentClassModal/
├── UserProfileCard/
└── UserProfileModal/
```

## Recommended Organization (Optional Future Refactor)

### Structure by Page + Role

```
src/components/
├── Shared/
│   ├── Header/
│   │   ├── Header.js
│   │   └── Header.css
│   ├── Footer/
│   │   ├── Footer.jsx
│   │   └── Footer.css
│   └── UserProfileModal/
│       ├── EditProfileModal.jsx
│       ├── ChangePasswordModal.jsx
│       ├── PasswordConfirmModal.jsx
│       └── UserProfileModal.css
│
├── Main/
│   └── Shared/
│       ├── Calendar/
│       │   ├── Calendar.jsx
│       │   ├── Calendar.css
│       │   ├── DayDetailModal.jsx
│       │   ├── DayDetailModal.css
│       │   ├── AddEventModal.jsx
│       │   └── ViewEventModal.jsx
│       ├── WeeklySchedule/
│       │   ├── WeeklySchedule.jsx
│       │   └── WeeklySchedule.css
│       └── NoticeCard/
│           ├── NoticeCard.jsx
│           └── NoticeCard.css
│
├── Community/
│   └── Shared/
│       ├── CommunityPostTable/
│       │   ├── CommunityPostTable.jsx
│       │   └── CommunityPostTable.css
│       ├── CommunityPagination/
│       │   ├── CommunityPagination.jsx
│       │   └── CommunityPagination.css
│       ├── CommunityReadModal/
│       │   ├── CommunityReadModal.jsx
│       │   └── CommunityReadModal.css
│       ├── CommunityWriteModal/
│       │   ├── CommunityWriteModal.jsx
│       │   └── CommunityWriteModal.css
│       └── CommunityEmptyState/
│           ├── CommunityEmptyState.jsx
│           └── CommunityEmptyState.css
│
├── Classroom/
│   ├── Shared/
│   │   ├── ClassCard/
│   │   │   ├── ClassCard.jsx
│   │   │   └── ClassCard.css
│   │   ├── ClassDetailCard/
│   │   │   ├── ClassDetailCard.jsx
│   │   │   └── ClassDetailCard.css
│   │   ├── ClassParticipantsModal/
│   │   │   ├── ClassParticipantsModal.jsx
│   │   │   └── ClassParticipantsModal.css
│   │   └── ClassCreateButton/
│   │       ├── ClassCreateButton.jsx
│   │       └── ClassCreateButton.css
│   │
│   ├── Student/
│   │   ├── ClassDetailSidebar/
│   │   │   ├── ClassDetailSidebar.jsx
│   │   │   └── ClassDetailSidebar.css
│   │   └── StudentClassModal/
│   │       ├── StudentClassModal.jsx
│   │       └── StudentClassModal.css
│   │
│   └── Admin/
│       ├── AdminClassDetailSidebar/
│       │   ├── AdminClassDetailSidebar.jsx
│       │   └── AdminClassDetailSidebar.css
│       └── AdminClassModal/
│           ├── AdminClassModal.jsx
│           └── AdminClassModal.css
│
└── MyPage/
    └── Shared/
        ├── UserProfileCard/
        │   ├── UserProfileCard.jsx
        │   └── UserProfileCard.css
        ├── PersonalScheduleBox/
        │   ├── PersonalScheduleBox.jsx
        │   └── PersonalScheduleBox.css
        ├── SchoolMealCard/
        │   ├── SchoolMealCard.jsx
        │   └── SchoolMealCard.css
        └── ClassTimetable/
            ├── ClassTimetable.jsx
            └── ClassTimetable.css
```

## Naming Conventions

### Shared Components
- File: `ComponentName.jsx`
- Location: `Shared/` folder
- Example: `src/components/Main/Shared/Calendar/Calendar.jsx`

### Student-Specific Components
- File: `ComponentName.jsx` (or `ComponentNameStudent.jsx` for clarity)
- Location: `Student/` folder
- Example: `src/components/Classroom/Student/ClassDetailSidebar/ClassDetailSidebar.jsx`

### Admin-Specific Components
- File: `ComponentNameAdmin.jsx`
- Location: `Admin/` folder
- Example: `src/components/Classroom/Admin/AdminClassDetailSidebar/AdminClassDetailSidebar.jsx`

## Component Classification

### Shared Components (Used by Both Student & Admin)
- Header
- Footer
- Calendar (with modals)
- ClassCard
- ClassDetailCard
- ClassParticipantsModal
- ClassCreateButton
- ClassTimetable
- PersonalScheduleBox
- SchoolMealCard
- UserProfileCard
- UserProfileModal
- CommunityPostTable
- CommunityPagination
- CommunityReadModal
- CommunityWriteModal
- CommunityEmptyState
- WeeklySchedule
- NoticeCard

### Student-Specific Components
- ClassDetailSidebar (assignment submission)
- StudentClassModal (join class)

### Admin-Specific Components
- AdminClassDetailSidebar (manage assignments)
- AdminClassModal (create class)

## Migration Path (If Needed)

### Phase 1: Create New Structure
1. Create new folder hierarchy
2. Copy components to new locations
3. Update import paths in pages

### Phase 2: Update Imports
1. Update all import statements in pages
2. Update all import statements in components
3. Test all functionality

### Phase 3: Cleanup
1. Remove old component folders
2. Verify no broken imports
3. Run full test suite

## Benefits of This Organization

✅ **Clear Separation of Concerns**
- Components grouped by page/feature
- Easy to find related components

✅ **Scalability**
- Easy to add new pages
- Easy to add page-specific components

✅ **Maintainability**
- Student/Admin differences are clear
- Shared components are obvious

✅ **Reusability**
- Shared components in dedicated folders
- Easy to identify what can be reused

## When to Reorganize

Consider reorganizing when:
- Project grows significantly (50+ components)
- Multiple developers working on different features
- Need to add more pages/features
- Component dependencies become complex

## Current Recommendation

**Keep current flat structure** because:
- Project is still relatively small (~20 components)
- All components are easily discoverable
- Minimal import path changes needed
- Works well with current team size

**Reorganize when:**
- Adding 10+ more components
- Multiple teams working on different pages
- Need clearer component ownership
- Import paths become hard to manage
