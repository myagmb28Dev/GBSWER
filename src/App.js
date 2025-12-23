import React, { useState, createContext, useContext } from 'react';
import MainBoardStudent from "./pages/Main/Student/MainBoard";
import MyPageBoardStudent from "./pages/MyPage/Student/MyPageBoard";
import CommunityBoardStudent from "./pages/Community/Student/CommunityBoard";
import ClassroomBoardStudent from "./pages/Classroom/Student/ClassroomBoard";
import MainBoardAdmin from "./pages/Main/Admin/MainBoard";
import MyPageBoardAdmin from "./pages/MyPage/Admin/MyPageBoard";
import CommunityBoardAdmin from "./pages/Community/Admin/CommunityBoard";
import ClassroomBoardAdmin from "./pages/Classroom/Admin/ClassroomBoard";
import Login from "./pages/Login/Login";
<<<<<<< HEAD
import EditProfileModal from "./components/ProfileModal/EditProfileModal";
import axios from "axios";
=======
import EditProfileModal from "./components/UserProfileModal/EditProfileModal";
import { mockProfile } from "./mocks/mockProfile";
>>>>>>> 3abdeff (feat: enhance assignment page features)

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
<<<<<<< HEAD
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [profile, setProfile] = useState(null);
  const [globalEvents, setGlobalEvents] = useState([]);

  // 프로필 정보 불러오기
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const res = await axios.get('/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      let data = res.data.data;
      // 프로필 이미지가 없으면 기본 이미지로 설정
      if (!data.profileImage) {
        try {
          await axios.delete('/api/user/profile-image', {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (err) {}
        data.profileImage = '/profile.png';
      }
      setProfile(data);
    } catch (err) {
      setProfile(null);
    }
  };

  React.useEffect(() => {
    if (isLoggedIn) fetchProfile();
  }, [isLoggedIn]);
=======
  const [isLoggedIn, setIsLoggedIn] = useState(true); // 기본값을 true로 설정 (로그인된 상태)
  const [userRole, setUserRole] = useState('student'); // 'student' 또는 'admin'
  const [globalEvents, setGlobalEvents] = useState([]); // 전역 일정 상태
>>>>>>> 3abdeff (feat: enhance assignment page features)

  const renderCurrentPage = () => {
    const isAdmin = userRole === 'admin';
    
    switch(currentPage) {
      case 'main':
        return isAdmin ? <MainBoardAdmin /> : <MainBoardStudent />;
      case 'mypage':
        return isAdmin ? <MyPageBoardAdmin /> : <MyPageBoardStudent />;
      case 'community':
        return isAdmin ? <CommunityBoardAdmin /> : <CommunityBoardStudent />;
      case 'classroom':
        return isAdmin ? <ClassroomBoardAdmin /> : <ClassroomBoardStudent />;
      default:
        return isAdmin ? <MainBoardAdmin /> : <MainBoardStudent />;
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        await fetch('/api/user/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (err) {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsLoggedIn(false);
    setShowProfileModal(false);
    setCurrentPage('main');
<<<<<<< HEAD
    setProfile(null);
=======
    setUserRole('student'); // 로그아웃 시 기본값으로 리셋
  };

  const handleLogin = (role = 'student') => {
    setIsLoggedIn(true);
    setUserRole(role);
>>>>>>> 3abdeff (feat: enhance assignment page features)
  };

  const contextValue = {
    currentPage,
    setCurrentPage,
    showProfileModal,
    setShowProfileModal,
    profile,
    setProfile,
    handleLogout,
    globalEvents,
    setGlobalEvents,
    userRole,
    setUserRole
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className="App">
        {renderCurrentPage()}
        {showProfileModal && profile && (
          <EditProfileModal 
            profile={profile}
            onClose={() => setShowProfileModal(false)} 
            onSave={(updatedProfile) => {
              setProfile(updatedProfile);
              setShowProfileModal(false);
            }}
          />
        )}
      </div>
    </AppContext.Provider>
  );
}

export default App;