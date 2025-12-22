import React, { useState, createContext, useContext } from 'react';
import MainBoard from "./pages/Main/MainBoard";
import MyPageBoard from "./pages/MyPage/MyPageBoard";
import CommunityBoard from "./pages/Community/CommunityBoard";
import Login from "./pages/Login/Login";
import EditProfileModal from "./components/ProfileModal/EditProfileModal";
import axios from "axios";

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

  const renderCurrentPage = () => {
    switch(currentPage) {
      case 'main':
        return <MainBoard />;
      case 'mypage':
        return <MyPageBoard />;
      case 'community':
        return <CommunityBoard />;
      case 'assignments':
        return <div style={{padding: '50px', textAlign: 'center', fontSize: '24px'}}>과제제출 페이지</div>;
      default:
        return <MainBoard />;
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
    setProfile(null);
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
    setGlobalEvents
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
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