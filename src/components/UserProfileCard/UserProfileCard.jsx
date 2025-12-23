<<<<<<< HEAD:src/pages/MyPage/ProfileCard/ProfileCard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { mockProfile } from '../../../mocks/mockProfile';
import EditProfileModal from '../Modals/EditProfileModal';
import './ProfileCard.css';

const ProfileCard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        const res = await axios.get('/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data.data);
      } catch (err) {
        setProfile(null);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);
=======
import React, { useState } from 'react';
import { mockProfile } from '../../mocks/mockProfile';
import EditProfileModal from '../UserProfileModal/EditProfileModal';
import './UserProfileCard.css';

const UserProfileCard = () => {
  const [profile, setProfile] = useState(mockProfile);
>>>>>>> 3abdeff (feat: enhance assignment page features):src/components/UserProfileCard/UserProfileCard.jsx
  const [showModal, setShowModal] = useState(false);

  const handleEditClick = () => {
    setShowModal(true);
  };

  const handleSave = (updatedData) => {
    setProfile(prev => ({ ...prev, ...updatedData }));
  };

  const displayProfile = loading || !profile
    ? { profileImage: '/profile-icon.svg', name: null, major: null }
    : profile;

  return (
    <>
      <div className="profile-card">
        <div className="profile-header">
          <img src={displayProfile.profileImage ? displayProfile.profileImage : '/profile-icon.svg'} alt="프로필" className="profile-image" />
          <div className="profile-info">
            <h2 className="profile-name">
              {loading || !profile ? (
                <span className="loading-animated">
                  <span className="dot">.</span>
                  <span className="dot">.</span>
                  <span className="dot">.</span>
                </span>
              ) : displayProfile.name}
            </h2>
            <p className="profile-major">{displayProfile.major}</p>
          </div>
          <button className="edit-button-small" onClick={handleEditClick}>
            정보 수정
          </button>
        </div>
      </div>

      {showModal && (
        <EditProfileModal
          profile={displayProfile}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default UserProfileCard;