import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './ParticipantListModal.css';

const ParticipantListModal = ({ isOpen, onClose, classId, participants = [] }) => {
  const [participantList, setParticipantList] = useState([]);

  useEffect(() => {
    if (isOpen && participants.length > 0) {
      setParticipantList(participants);
    }
  }, [isOpen, participants]);

  if (!isOpen) return null;

  return (
    <div className="participant-modal-overlay" onClick={onClose}>
      <div className="participant-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="participant-modal-header">
          <h2>참여자 목록</h2>
          <button className="participant-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="participant-list">
          {participantList.length > 0 ? (
            participantList.map((participant) => (
              <div key={participant.id} className="participant-card">
                <img 
                  src={participant.profileImage || '/profile.png'} 
                  alt={participant.name}
                  className="participant-profile-image"
                />
                <div className="participant-info">
                  <div className="participant-name">{participant.name}</div>
                  <div className="participant-id">{participant.userId || participant.studentId}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-participants">
              참여자가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantListModal;
