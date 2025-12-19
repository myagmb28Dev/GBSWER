import React, { useState } from 'react';
import { mockProfile } from '../../../mocks/mockProfile';
import EditProfileModal from '../Modals/EditProfileModal';
import './ProfileCard.css';

const ProfileCard = () => {
  const [profile, setProfile] = useState(mockProfile);
  const [showModal, setShowModal] = useState(false);

  const handleEditClick = () => {
    setShowModal(true);
  };

  const handleSave = (updatedData) => {
    setProfile(prev => ({ ...prev, ...updatedData }));
    console.log('프로필 업데이트:', updatedData);
  };

  return (
    <>
      <div className="profile-card">
        <div className="profile-header">
          <img src={profile.profileImage} alt="프로필" className="profile-image" />
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

export default ProfileCard;
