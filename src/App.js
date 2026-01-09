import React, { useState, createContext, useContext, useCallback } from 'react';
import MainBoardStudent from "./pages/Main/Student/MainBoard";
import MyPageBoardStudent from "./pages/MyPage/Student/MyPageBoard";
import CommunityBoardStudent from "./pages/Community/Student/CommunityBoard";
import ClassroomBoardStudent from "./pages/Classroom/Student/ClassroomBoard";
import MainBoardAdmin from "./pages/Main/Admin/MainBoard";
import MyPageBoardAdmin from "./pages/MyPage/Admin/MyPageBoard";
import MyPageBoardTeacher from "./pages/MyPage/Teacher/MyPageBoard";
import CommunityBoardAdmin from "./pages/Community/Admin/CommunityBoard";
import ClassroomBoardAdmin from "./pages/Classroom/Admin/ClassroomBoard";
import Login from "./pages/Login/Login";
import EditProfileModal from "./components/UserProfileModal/EditProfileModal";
import axiosInstance from "./api/axiosInstance";
import './App.css';

const AppContext = createContext();
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

function App() {
  const [currentPage, setCurrentPage] = useState('main');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem('accessToken');
  });
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('userRole') || 'student';
  });
  const [profile, setProfile] = useState(null);
  const [globalEvents, setGlobalEvents] = useState([]);
  // 캐시: year-month 또는 date 키로 서버에서 가져온 데이터 저장
  const [cachedSchedules, setCachedSchedules] = useState({});
  const [schedulesRefreshing, setSchedulesRefreshing] = useState({});
  const [cachedMeals, setCachedMeals] = useState({});
  const [mealsRefreshing, setMealsRefreshing] = useState({});
  const [cachedTimetable, setCachedTimetable] = useState({});
  const [timetableRefreshing, setTimetableRefreshing] = useState({});

  // globalEvents를 localStorage에 저장하는 함수
  const saveGlobalEventsToStorage = (events, userId) => {
    if (userId) {
      localStorage.setItem(`globalEvents_${userId}`, JSON.stringify(events));
    }
  };

  // globalEvents를 localStorage에서 로드하는 함수
  const loadGlobalEventsFromStorage = (userId) => {
    if (userId) {
      const stored = localStorage.getItem(`globalEvents_${userId}`);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  };

  // 프로필 정보 불러오기
  const fetchProfile = useCallback(async () => {
    const normalize = (raw) => {
      if (!raw || typeof raw !== 'object') return raw;
      const major = raw.major || raw.department || raw.majorName || raw.dept || raw.majorTitle || '';
      const grade = raw.grade || raw.schoolGrade || raw.year || raw.classGrade || '';
      const classNumber = raw.classNumber || raw.classNo || raw.class || raw.classroom || raw.room || raw.classNum || '';
      return { ...raw, major, grade, classNumber };
    };

    try {
      const res = await axiosInstance.get('/api/user/profile');
      let data = res.data.data;
      // 프로필 이미지가 없으면 기본 이미지로 설정
      if (!data.profileImage) {
        try {
          await axiosInstance.delete('/api/user/profile-image');
        } catch (err) {}
        data.profileImage = '/profile.png';
      }
      setProfile(normalize(data));

      // 프로필 설정 후 globalEvents 로드
      const loadedEvents = loadGlobalEventsFromStorage(data.id);
      setGlobalEvents(loadedEvents);

      // 프로필에서 role 정보 추출하여 userRole 설정
      if (data.role) {
        // 백엔드 role을 프론트 role로 변환 (대문자)
        let actualRole;
        if (data.role === 'ADMIN') actualRole = 'admin';
        else if (data.role === 'TEACHER') actualRole = 'teacher';
        else actualRole = 'student';

        const selectedRole = localStorage.getItem('selectedUserRole');

        // 프론트에서 선택한 role과 백엔드 실제 role 비교
        const getRoleDisplayName = (role) => {
          // 백엔드 role 값 그대로 표시 (대문자)
          return role.toUpperCase();
        };

        if (selectedRole && selectedRole.toUpperCase() !== actualRole.toUpperCase()) {
          // 역할 불일치 시 로그인 거부 및 로그아웃
          alert(`선택하신 계정 타입(${getRoleDisplayName(selectedRole)})과 실제 계정 권한이 일치하지 않습니다.\n해당 계정으로는 ${getRoleDisplayName(selectedRole)} 섹션에 로그인할 수 없습니다.`);

          // 로그인 상태 초기화
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userRole');
          localStorage.removeItem('selectedUserRole');
          setIsLoggedIn(false);
          setUserRole('student');
          setProfile(null);
          setCurrentPage('login');
          return;
        }

        localStorage.setItem('userRole', actualRole);
        setUserRole(actualRole);

        // 검증 완료 후 임시 role 정보 삭제
        localStorage.removeItem('selectedUserRole');
      }
    } catch (err) {
      // 프로필을 불러오지 못하면 null로 설정 (더 이상 localStorage fallback 사용하지 않음)
      setProfile(null);
      // 프로필 조회 실패 시 임시 role 정보 정리
      localStorage.removeItem('selectedUserRole');
    }
  }, []);

  React.useEffect(() => {
    // 앱 시작 시 오래된 로컬 프로필 항목 제거 (더 이상 폴백으로 사용하지 않음)
    try {
      localStorage.removeItem('profile');
    } catch (e) {}

    if (isLoggedIn) fetchProfile();
  }, [isLoggedIn, fetchProfile]);

  // globalEvents가 변경될 때 localStorage에 저장
  React.useEffect(() => {
    if (profile && profile.id) {
      saveGlobalEventsToStorage(globalEvents, profile.id);
    }
  }, [globalEvents, profile]);

  const renderCurrentPage = () => {
    const isAdminOrTeacher = userRole === 'admin' || userRole === 'teacher';
    
    switch(currentPage) {
      case 'main':
        return isAdminOrTeacher ? <MainBoardAdmin /> : <MainBoardStudent />;
      case 'mypage':
        if (userRole === 'admin') return <MyPageBoardAdmin userRole={userRole} />;
        if (userRole === 'teacher') return <MyPageBoardTeacher />;
        return <MyPageBoardStudent />;
      case 'community':
        return isAdminOrTeacher ? <CommunityBoardAdmin /> : <CommunityBoardStudent />;
      case 'classroom':
        return isAdminOrTeacher ? <ClassroomBoardAdmin userRole={userRole} /> : <ClassroomBoardStudent />;
      default:
        return isAdminOrTeacher ? <MainBoardAdmin /> : <MainBoardStudent />;
    }
  };

  const handleLogout = async () => {
    try {
      // 서버에서 Refresh Token 삭제
      await axiosInstance.post('/api/user/logout');
    } catch (err) {
      // 로그아웃 API 실패해도 클라이언트에서는 로그아웃 처리
    }
    // 클라이언트 토큰 삭제
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('selectedUserRole'); // 임시 role 정보도 삭제
    setIsLoggedIn(false);
    setShowProfileModal(false);
    setCurrentPage('main');
    setProfile(null);
    setUserRole('student');
    setGlobalEvents([]); // 로그아웃 시 globalEvents 초기화
  };

  const handleLogin = (role = 'student') => {
    // 프론트에서 선택한 role을 임시 저장
    localStorage.setItem('selectedUserRole', role);
    setIsLoggedIn(true);
    setUserRole(role); // 임시로 설정, 프로필 조회 후 실제 role로 변경됨
  };

  const contextValue = {
    currentPage,
    setCurrentPage,
    showProfileModal,
    setShowProfileModal,
    profile,
    setProfile,
    fetchProfile,
    handleLogout,
    globalEvents,
    setGlobalEvents,
    cachedSchedules,
    setCachedSchedules,
    schedulesRefreshing,
    setSchedulesRefreshing,
    cachedMeals,
    setCachedMeals,
    mealsRefreshing,
    setMealsRefreshing,
    cachedTimetable,
    setCachedTimetable,
    timetableRefreshing,
    setTimetableRefreshing,
    userRole,
    setUserRole
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className="App">
        <div className="page-transition">
          {renderCurrentPage()}
        </div>
        {showProfileModal && profile && (
          <EditProfileModal 
            profile={profile}
            onClose={() => setShowProfileModal(false)} 
            onSave={(updatedProfile) => {
              // 저장 후에도 profile을 정규화하여 유지
              const normalize = (raw) => {
                if (!raw || typeof raw !== 'object') return raw;
                const major = raw.major || raw.department || raw.majorName || raw.dept || raw.majorTitle || '';
                const grade = raw.grade || raw.schoolGrade || raw.year || raw.classGrade || '';
                const classNumber = raw.classNumber || raw.classNo || raw.class || raw.classroom || raw.room || raw.classNum || '';
                return { ...raw, major, grade, classNumber };
              };
              setProfile(normalize(updatedProfile));
              setShowProfileModal(false);
            }}
          />
        )}
      </div>
    </AppContext.Provider>
  );
}

export default App;