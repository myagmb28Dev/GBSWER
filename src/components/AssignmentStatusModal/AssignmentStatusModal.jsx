import React, { useState } from 'react';
import { X, Check, Clock } from 'lucide-react';
import './AssignmentStatusModal.css';

const AssignmentStatusModal = ({ isOpen, onClose, assignmentTitle, participants = [] }) => {
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL', 'SUBMITTED', 'PENDING'

  // 제출 상태 필터링
  const filteredParticipants = filterStatus === 'ALL'
    ? participants
    : filterStatus === 'SUBMITTED'
    ? participants.filter(p => p.submitted)
    : participants.filter(p => !p.submitted);

  const submittedCount = participants.filter(p => p.submitted).length;
  const pendingCount = participants.filter(p => !p.submitted).length;

  if (!isOpen) return null;

  return (
    <div className="assignment-status-overlay" onClick={onClose}>
      <div className="assignment-status-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        <h2 className="modal-title">{assignmentTitle}</h2>
        <p className="modal-subtitle">과제 현황</p>

        {/* 통계 */}
        <div className="stats-section">
          <div className="stat-item">
            <div className="stat-label">제출 완료</div>
            <div className="stat-count submitted">{submittedCount}</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-label">미제출</div>
            <div className="stat-count pending">{pendingCount}</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-label">전체</div>
            <div className="stat-count total">{participants.length}</div>
          </div>
        </div>

        {/* 필터 버튼 */}
        <div className="filter-buttons">
          {[
            { value: 'ALL', label: '전체' },
            { value: 'SUBMITTED', label: '제출 완료' },
            { value: 'PENDING', label: '미제출' }
          ].map(filter => (
            <button
              key={filter.value}
              className={`filter-btn ${filterStatus === filter.value ? 'active' : ''}`}
              onClick={() => setFilterStatus(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* 학생 목록 */}
        <div className="participants-list">
          {filteredParticipants.length > 0 ? (
            filteredParticipants.map(participant => (
              <div key={participant.id} className="participant-item">
                <div className="participant-info">
                  <img 
                    src={participant.profileImage} 
                    alt={participant.name}
                    className="participant-avatar"
                  />
                  <div className="participant-details">
                    <div className="participant-name">{participant.name}</div>
                    <div className="participant-id">{participant.studentId}</div>
                  </div>
                </div>
                <div className={`status-badge ${participant.submitted ? 'submitted' : 'pending'}`}>
                  {participant.submitted ? (
                    <>
                      <Check size={16} />
                      <span>제출 완료</span>
                    </>
                  ) : (
                    <>
                      <Clock size={16} />
                      <span>미제출</span>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>해당하는 학생이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentStatusModal;
