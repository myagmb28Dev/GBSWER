import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EditProfileModal from '../UserProfileModal/EditProfileModal';
import './UserProfileCard.css';

const UserProfileCard = () => {
  const [profile, setProfile] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await axios.get('/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data?.data || res.data || null);
      } catch (err) {
        console.error('프로필 불러오기 실패:', err?.response?.data || err.message);
        setProfile(null);
      }
    };
    fetchProfile();
  }, []);

  const handleEditClick = () => {
    setShowModal(true);
  };

  const handleSave = (updatedData) => {
    setProfile(prev => ({ ...prev, ...updatedData }));
  };

  if (!profile) {
    return (
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-info">
            <h2 className="profile-name">정보를 불러오는 중...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="profile-card">
        <div className="profile-header">
          <img src={profile.profileImage ? profile.profileImage : '/profile-icon.svg'} alt="프로필" className="profile-image" />
          <div className="profile-info">
            <h2 className="profile-name">{profile.name}</h2>
            <p className="profile-major">{profile.major}</p>
          </div>
          <button className="edit-button-small" onClick={handleEditClick}>
            정보 수정
          </button>
        </div>
      </div>

      {showModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default UserProfileCard;
