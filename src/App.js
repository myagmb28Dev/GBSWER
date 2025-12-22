import React, { useState, createContext, useContext } from 'react';
import MainBoard from "./pages/Main/MainBoard";
import MyPageBoard from "./pages/MyPage/MyPageBoard";
import CommunityBoard from "./pages/Community/CommunityBoard";
import Login from "./pages/Login/Login";
import EditProfileModal from "./components/ProfileModal/EditProfileModal";
import { mockProfile } from "./mocks/mockProfile";

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
  const [isLoggedIn, setIsLoggedIn] = useState(true); // 기본값을 true로 설정 (로그인된 상태)
  const [globalEvents, setGlobalEvents] = useState([]); // 전역 일정 상태

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

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowProfileModal(false);
    setCurrentPage('main');
  };

  const contextValue = {
    currentPage,
    setCurrentPage,
    showProfileModal,
    setShowProfileModal,
    profile: mockProfile,
    handleLogout,
    globalEvents,
    setGlobalEvents
  };

  // 로그인되지 않은 경우 로그인 페이지 표시
  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className="App">
        {renderCurrentPage()}
        {showProfileModal && (
          <EditProfileModal 
            profile={mockProfile}
            onClose={() => setShowProfileModal(false)} 
            onSave={(updatedProfile) => {
              console.log('프로필 업데이트:', updatedProfile);
              setShowProfileModal(false);
            }}
          />
        )}
      </div>
    </AppContext.Provider>
  );
}

export default App;