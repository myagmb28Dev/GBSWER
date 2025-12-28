# Design Document: Admin Timetable Edit Button

## Overview

The admin timetable edit feature provides administrators with an intuitive interface to modify class schedules. The edit button is positioned in the top-left corner of the timetable box on the admin MyPage, allowing administrators to enter an edit mode where they can freely modify subject names in the timetable grid.

## Architecture

The feature is implemented within the existing `AdminClassTimetable` component with the following architecture:

```
AdminClassTimetable Component
├── State Management
│   ├── timetable: Current timetable data
│   ├── isEditMode: Boolean flag for edit state
│   └── editedSchedule: Temporary schedule during editing
├── UI Layers
│   ├── Header (with Edit button)
│   ├── Timetable Grid (view or edit mode)
│   └── Action Buttons (Cancel/Save in edit mode)
└── Event Handlers
    ├── handleEditStart: Enter edit mode
    ├── handleEditCancel: Exit without saving
    ├── handleEditSave: Save changes and exit
    └── handleCellChange: Update cell value
```

## Components and Interfaces

### AdminClassTimetable Component

**Props**: None (uses mock data)

**State**:
- `timetable`: Object containing major, grade, classNumber, days, and schedule array
- `isEditMode`: Boolean indicating if currently in edit mode
- `editedSchedule`: 2D array of subject names being edited

**Key Methods**:
- `handleEditStart()`: Sets edit mode to true and copies current schedule
- `handleEditCancel()`: Sets edit mode to false without updating timetable
- `handleEditSave()`: Updates timetable with edited schedule and exits edit mode
- `handleCellChange(rowIndex, colIndex, value)`: Updates a specific cell in editedSchedule

### UI Structure

**Header Section**:
- Title: "{major} {grade}학년 {classNumber}반 시간표"
- Edit Button (top-left, only visible when not in edit mode)

**Timetable Grid**:
- Weekday headers (월, 화, 수, 목, 금)
- Schedule rows with subject cells
- In edit mode: cells become input fields
- In view mode: cells display text

**Action Buttons** (visible only in edit mode):
- Cancel button: Discards changes
- Save button: Persists changes

## Data Models

### Timetable Object
```javascript
{
  major: string,           // e.g., "소프트웨어"
  grade: number,           // e.g., 1
  classNumber: number,     // e.g., 1
  days: string[],          // ["월", "화", "수", "목", "금"]
  schedule: string[][]     // 2D array of subjects
}
```

### Schedule Array Structure
```javascript
[
  ["과목1", "과목2", "과목3", "과목4", "과목5"],  // 1교시
  ["과목1", "과목2", "과목3", "과목4", "과목5"],  // 2교시
  // ... more rows
]
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Edit Mode Toggle

**For any** timetable state, clicking the edit button should transition the component from view mode to edit mode, making all cells editable.

**Validates: Requirements 2.1, 2.2**

### Property 2: Edit Mode Cancellation Restores State

**For any** timetable with modifications made in edit mode, clicking cancel should restore the timetable to its previous state without persisting changes.

**Validates: Requirements 4.2, 4.3**

### Property 3: Edit Mode Saving Persists Changes

**For any** timetable with modifications made in edit mode, clicking save should persist all changes and exit edit mode.

**Validates: Requirements 5.2, 5.3**

### Property 4: Cell Value Updates in Edit Mode

**For any** cell in edit mode, typing a new value should update that cell's content in real-time without affecting other cells.

**Validates: Requirements 3.1, 3.2**

### Property 5: Button Visibility Based on Mode

**For any** timetable state, the edit button should be visible only when not in edit mode, and cancel/save buttons should be visible only when in edit mode.

**Validates: Requirements 2.3, 3.1**

### Property 6: Admin-Only Visibility

**For any** user viewing the MyPage, the edit button should only be visible when the user is an administrator accessing the AdminClassTimetable component.

**Validates: Requirements 6.1, 6.2, 6.3**

## Error Handling

- **Invalid Input**: Empty cells are allowed; no validation is performed on subject names
- **State Consistency**: The component maintains separate state for view and edit modes to prevent accidental data loss
- **UI State**: Button visibility is controlled by the `isEditMode` flag to ensure proper UI state

## Testing Strategy

### Unit Tests

- Test that edit button click triggers edit mode
- Test that cancel button reverts changes
- Test that save button persists changes
- Test that cell input updates the edited schedule
- Test that button visibility changes based on edit mode state
- Test that edit button is only rendered in AdminClassTimetable (not in regular ClassTimetable)

### Property-Based Tests

- **Property 1**: For any timetable, entering and exiting edit mode should not lose data
- **Property 2**: For any sequence of cell edits, cancelling should restore original state
- **Property 3**: For any sequence of cell edits, saving should persist all changes
- **Property 4**: For any cell modification, only that cell should be affected
- **Property 5**: Button visibility should always match the current edit mode state
- **Property 6**: Edit functionality should only be available in admin context

### Test Configuration

- Minimum 100 iterations per property test
- Each test should reference its corresponding design property
- Tag format: **Feature: admin-timetable-edit, Property {number}: {property_text}**
