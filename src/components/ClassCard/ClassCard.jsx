import React from 'react';
import './ClassCard.css';

const ClassCard = ({ 
  classData,
  isSelected,
  onClick 
}) => {
  const className = classData?.className || "클래스명 없음";
  const teacherName = classData?.teacherName || "선생님 정보 없음";
  const posts = classData?.posts || []; // 과제와 공지사항 배열
  // 가장 임박한 과제의 마감일 찾기
  const getUrgentAssignmentDeadline = (posts) => {
    const assignments = posts.filter(post => post.type === '과제' && post.deadline && !post.submitted);
    
    if (assignments.length === 0) return null;
    
    // 마감일 기준으로 정렬하여 가장 임박한 과제 찾기
    const sortedAssignments = assignments.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    return sortedAssignments[0].deadline;
  };

  // 디데이 계산 함수
  const calculateDDay = (deadline) => {
    if (!deadline) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 설정
    
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 설정
    
    const timeDiff = deadlineDate.getTime() - today.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (dayDiff < 0) {
      return null; // 지난 과제는 표시하지 않음
    } else if (dayDiff === 0) {
      return "D-Day";
    } else {
      return `D-${dayDiff}`;
    }
  };

  const urgentDeadline = getUrgentAssignmentDeadline(posts);
  const dDay = calculateDDay(urgentDeadline);

  return (
    <div className={`class-card ${isSelected ? 'selected' : ''}`} onClick={onClick}>
      <div className="class-card-content">
        <div className="class-info">
          <h3 className="class-name">{className}</h3>
          <p className="teacher-name">{teacherName}</p>
        </div>
        
        {dDay && (
          <div className="d-day-display">
            <span className={`d-day-text ${dDay === 'D-Day' ? 'today' : 'has-deadline'}`}>
              {dDay}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassCard;