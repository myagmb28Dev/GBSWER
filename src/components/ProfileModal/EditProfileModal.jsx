import React, { useState } from 'react';
import axios from 'axios';
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
  const getValidProfileImage = (img) => {
    if (!img || img === '' || img === 'null' || img === 'undefined' || img === '/profile.png' || img === '/profile') {
      return '/profile-icon.svg';
    }
    return img;
  };
  const [previewImage, setPreviewImage] = useState(getValidProfileImage(profile.profileImage));
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
      setPreviewImage(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, profileImage: file }));
    } else {
      setPreviewImage('/profile-icon.svg');
      setFormData(prev => ({ ...prev, profileImage: null }));
    }
  };

  const handleDefaultProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete('/api/user/profile-image', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPreviewImage('/profile-icon.svg');
      setFormData(prev => ({ ...prev, profileImage: null }));
    } catch (err) {
      alert('기본 프로필로 변경 실패');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    // 변경사항이 없는 경우
    const isImageChanged = formData.profileImage && formData.profileImage !== profile.profileImage;
    const isOtherChanged = formData.name !== profile.name || formData.email !== profile.email || formData.major !== profile.major || formData.grade !== profile.grade || formData.classNumber !== profile.classNumber;
    if (!isImageChanged && !isOtherChanged) {
      alert('변경된 내용이 없습니다.');
      return;
    }
    // 프로필 사진만 변경된 경우
    if (isImageChanged && !isOtherChanged) {
      try {
        const form = new FormData();
        form.append('profileImage', formData.profileImage);
        await axios.put('/api/user/profile-image', form, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        onSave({ ...profile, profileImage: previewImage });
        onClose();
      } catch (err) {
        alert('프로필 이미지 변경 실패');
      }
      return;
    }
    // 다른 정보가 변경된 경우 비밀번호 확인 필요
    setPendingData(formData);
    setShowPasswordConfirm(true);
  };

  const handlePasswordConfirmed = async () => {
    if (pendingData) {
      try {
        const token = localStorage.getItem('accessToken');
        await axios.put('/api/user/profile', pendingData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        onSave(pendingData);
        onClose();
      } catch (err) {
        alert('프로필 정보 수정 실패');
      }
    }
  };

  const handlePasswordChange = async (newPassword) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.put('/api/user/profile', { password: newPassword }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onSave({ password: newPassword });
    } catch (err) {
      alert('비밀번호 변경 실패');
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" style={{position:'relative'}} onClick={(e) => e.stopPropagation()}>
          <button className="close-btn" style={{position:'absolute',top:20,right:20,zIndex:2,fontSize:'2rem',background:'none',border:'none',cursor:'pointer'}} onClick={onClose}>×</button>
          <h2>정보 수정하기</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="profile-image-upload">
                <img
                  src={getValidProfileImage(previewImage)}
                  alt="프로필 미리보기"
                  className="preview-image"
                  onError={e => { e.target.onerror=null; e.target.src='/profile-icon.svg'; }}
                />
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

            {/* 로그아웃 버튼은 헤더 드롭다운으로 통합됨 - 모달 내 로그아웃 버튼 제거 */}

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