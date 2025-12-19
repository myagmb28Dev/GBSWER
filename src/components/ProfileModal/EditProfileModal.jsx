import React, { useState } from 'react';
import PasswordConfirmModal from './PasswordConfirmModal';
import ChangePasswordModal from './ChangePasswordModal';
import { useAppContext } from '../../App';
import './EditProfileModal.css';

const EditProfileModal = ({ profile, onClose, onSave }) => {
  const { handleLogout } = useAppContext();
  const [formData, setFormData] = useState({
    profileImage: profile.profileImage,
    name: profile.name,
    email: profile.email,
    major: profile.major,
    grade: profile.grade,
    classNumber: profile.classNumber
  });
  const [previewImage, setPreviewImage] = useState(profile.profileImage);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [pendingData, setPendingData] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormData(prev => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDefaultProfile = () => {
    setPreviewImage('/profile.png');
    setFormData(prev => ({ ...prev, profileImage: '/profile.png' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 변경사항이 없는 경우
    if (formData.profileImage === profile.profileImage &&
        formData.name === profile.name &&
        formData.email === profile.email &&
        formData.major === profile.major &&
        formData.grade === profile.grade &&
        formData.classNumber === profile.classNumber) {
      alert('변경된 내용이 없습니다.');
      return;
    }
    
    // 프로필 사진만 변경된 경우
    if (formData.profileImage !== profile.profileImage &&
        formData.name === profile.name &&
        formData.email === profile.email &&
        formData.major === profile.major &&
        formData.grade === profile.grade &&
        formData.classNumber === profile.classNumber) {
      onSave(formData);
      onClose();
      return;
    }
    
    // 다른 정보가 변경된 경우 비밀번호 확인 필요
    setPendingData(formData);
    setShowPasswordConfirm(true);
  };

  const handlePasswordConfirmed = () => {
    if (pendingData) {
      onSave(pendingData);
      onClose();
    }
  };

  const handlePasswordChange = (newPassword) => {
    onSave({ password: newPassword });
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h2>정보 수정하기</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="profile-image-upload">
                <img src={previewImage} alt="프로필 미리보기" className="preview-image" />
                <div className="upload-buttons">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    id="profile-image-input"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="profile-image-input" className="upload-btn">
                    프로필 변경
                  </label>
                  <button
                    type="button"
                    className="default-profile-btn"
                    onClick={handleDefaultProfile}
                  >
                    기본 프로필
                  </button>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>아이디</label>
              <input
                type="text"
                value={profile.userId}
                disabled
                className="disabled-input"
              />
            </div>

            <div className="form-group">
              <label>이름</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="이름을 입력하세요"
              />
            </div>

            <div className="form-group">
              <label>이메일</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="이메일을 입력하세요"
              />
            </div>

            <div className="form-group">
              <label>학과</label>
              <input
                type="text"
                name="major"
                value={formData.major}
                onChange={handleChange}
                placeholder="학과를 입력하세요"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>학년</label>
                <input
                  type="number"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  min="1"
                  max="3"
                />
              </div>

              <div className="form-group">
                <label>반</label>
                <input
                  type="number"
                  name="classNumber"
                  value={formData.classNumber}
                  onChange={handleChange}
                  min="1"
                  max="4"
                />
              </div>
            </div>

            <div className="logout-section">
              <button
                type="button"
                className="logout-btn"
                onClick={() => {
                  if (window.confirm('로그아웃 하시겠습니까?')) {
                    handleLogout();
                  }
                }}
              >
                로그아웃
              </button>
            </div>

            <div className="modal-buttons-bottom">
              <button
                type="button"
                className="change-password-btn-bottom"
                onClick={() => setShowChangePassword(true)}
              >
                비밀번호 수정
              </button>
              <button type="submit" className="save-btn">
                확인
              </button>
            </div>
          </form>
        </div>
      </div>

      {showPasswordConfirm && (
        <PasswordConfirmModal
          onClose={() => setShowPasswordConfirm(false)}
          onConfirm={handlePasswordConfirmed}
          currentPassword={profile.password}
          userEmail={profile.email}
        />
      )}

      {showChangePassword && (
        <ChangePasswordModal
          onClose={() => setShowChangePassword(false)}
          onSave={handlePasswordChange}
          currentPassword={profile.password}
          userEmail={profile.email}
        />
      )}
    </>
  );
};

export default EditProfileModal;