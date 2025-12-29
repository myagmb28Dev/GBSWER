import React, { useState, useEffect, useCallback } from 'react';
import { X, UserX, UserCheck } from 'lucide-react';
import axios from 'axios';
import './AdminParticipantsModal.css';

const AdminParticipantsModal = ({ isOpen, onClose, className, classId, participants }) => {
  const [participantsList, setParticipantsList] = useState(participants || []);
  const [loading, setLoading] = useState(false);

  const fetchParticipants = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`/api/classes/${classId}/participants`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setParticipantsList(response.data?.data || []);
    } catch (error) {
      console.error('참가자 목록 조회 실패:', error);
      // API가 없으면 기존 participants 사용
      setParticipantsList(participants || []);
    } finally {
      setLoading(false);
    }
  }, [classId, participants]);

  useEffect(() => {
    if (isOpen && classId) {
      fetchParticipants();
    }
  }, [isOpen, classId, fetchParticipants]);

  const handleRemoveParticipant = async (studentId, studentName) => {
    if (!window.confirm(`${studentName} 학생을 클래스에서 퇴장시키겠습니까?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`/api/classes/${classId}/participants/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 목록에서 제거
      setParticipantsList(prev => prev.filter(p => p.studentId !== studentId));
      alert(`${studentName} 학생이 퇴장되었습니다.`);
    } catch (error) {
      console.error('참가자 퇴장 실패:', error);
      alert('참가자 퇴장에 실패했습니다.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="admin-participants-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{className} - 참가자 관리</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-content">
          {loading ? (
            <div className="loading">참가자 목록을 불러오는 중...</div>
          ) : (
            <div className="participants-list">
              <div className="participants-summary">
                <span className="summary-text">총 {participantsList.length}명 참여</span>
              </div>

              {participantsList.length > 0 ? (
                participantsList.map((participant) => (
                  <div key={participant.id} className="participant-item">
                    <div className="participant-info">
                      <div className="participant-avatar">
                        <img
                          src={participant.profileImage || '/profile.png'}
                          alt={participant.studentName}
                          className="avatar-image"
                        />
                      </div>
                      <div className="participant-details">
                        <span className="participant-name">{participant.studentName}</span>
                        <span className="participant-id">{participant.studentId}</span>
                        <span className="joined-date">
                          참여일: {new Date(participant.joinedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="participant-actions">
                      <button
                        className="remove-participant-btn"
                        onClick={() => handleRemoveParticipant(participant.studentId, participant.studentName)}
                        title="클래스에서 퇴장"
                      >
                        <UserX size={16} />
                        퇴장
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-participants">
                  <UserCheck size={48} />
                  <p>아직 참가자가 없습니다.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminParticipantsModal;
