import React from 'react';
import { Users } from 'lucide-react';
import './ClassParticipantsModal.css';

const ClassParticipantsModal = ({ 
  isOpen, 
  onClose, 
  className = "수학 1반",
  participants = []
}) => {
  if (!isOpen) return null;

  // 5명씩 그룹으로 나누기
  const groupedParticipants = [];
  for (let i = 0; i < participants.length; i += 5) {
    groupedParticipants.push(participants.slice(i, i + 5));
  }

  return (
    <div className="participants-modal-overlay" onClick={onClose}>
      <div className="participants-modal" onClick={(e) => e.stopPropagation()}>
        <div className="participants-header">
          <div className="header-info">
            <Users size={24} className="header-icon" />
            <div>
              <h3 className="modal-title">{className}</h3>
              <p className="participant-count">참가자 {participants.length}명</p>
            </div>
          </div>
        </div>

        <div className="participants-content">
          {groupedParticipants.map((group, groupIndex) => (
            <div key={groupIndex} className="participant-row">
              {group.map((participant) => (
                <div key={participant.id} className="participant-card">
                  <div className="participant-avatar">
                    <img 
                      src={participant.profileImage || "/profile.png"} 
                      alt={participant.name}
                      className="avatar-image"
                    />
                  </div>
                  <div className="participant-info">
                    <p className="participant-name">{participant.name}</p>
                    <p className="participant-id">{participant.studentId}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClassParticipantsModal;