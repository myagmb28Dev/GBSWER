# Routing Guide

## URL Structure

### Student Routes
| Page | URL | Component |
|------|-----|-----------|
| Main | `/student/main` | MainBoardStudent |
| Community | `/student/community` | CommunityBoardStudent |
| Classroom | `/student/classroom` | ClassroomBoardStudent |
| MyPage | `/student/mypage` | MyPageBoardStudent |

### Admin Routes
| Page | URL | Component |
|------|-----|-----------|
| Main | `/admin/main` | MainBoardAdmin |
| Community | `/admin/community` | CommunityBoardAdmin |
| Classroom | `/admin/classroom` | ClassroomBoardAdmin |
| MyPage | `/admin/mypage` | MyPageBoardAdmin |

## Navigation Flow

```
Login Page
    ↓
    ├─→ Student Login → /student/main
    │
    └─→ Admin Login → /admin/main

Header Navigation (Same for both):
메인 → 커뮤니티 → 클래스룸 → 마이페이지
```

## How to Navigate Programmatically

### Using useNavigate Hook
```javascript
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../App';

function MyComponent() {
  const navigate = useNavigate();
  const { userRole } = useAppContext();

  const goToMain = () => {
    navigate(`/${userRole}/main`);
  };

  return <button onClick={goToMain}>메인으로</button>;
}
```

### Using Link Component
```javascript
import { Link } from 'react-router-dom';

function MyComponent() {
  return (
    <Link to="/student/main">메인</Link>
  );
}
```

## Context API Usage

The `useAppContext()` hook provides:
- `userRole` - 'student' or 'admin'
- `setUserRole` - Change user role
- `profile` - User profile data
- `setProfile` - Update profile
- `showProfileModal` - Profile modal state
- `setShowProfileModal` - Toggle profile modal
- `globalEvents` - Global calendar events
- `setGlobalEvents` - Update events
- `handleLogout` - Logout function

## Default Redirect

- `/` redirects to `/{userRole}/main`
- Unknown routes redirect to `/{userRole}/main`

## Example: Adding a New Page

1. Create page component:
   ```
   src/pages/NewPage/Student/NewPageStudent.jsx
   src/pages/NewPage/Admin/NewPageAdmin.jsx
   ```

2. Add routes in App.js:
   ```javascript
   <Route path="/student/newpage" element={<NewPageStudent />} />
   <Route path="/admin/newpage" element={<NewPageAdmin />} />
   ```

3. Add navigation in Header.js:
   ```javascript
   const goToNewPage = () => {
     navigate(`/${userRole}/newpage`);
   };
   ```

## Debugging

To check current route:
```javascript
import { useLocation } from 'react-router-dom';

function MyComponent() {
  const location = useLocation();
  console.log('Current path:', location.pathname);
  return <div>{location.pathname}</div>;
}
```
