import React, { useState, useEffect } from 'react';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import ClassCreateButton from '../../../components/ClassCreateButton/ClassCreateButton';
import ClassCard from '../../../components/ClassCard/ClassCard';
import ClassDetailCard from '../../../components/ClassDetailCard/ClassDetailCard';
import ClassDetailSidebar from '../../../components/ClassDetailSidebar/ClassDetailSidebar';
import axios from 'axios';
import './ClassroomBoard.css';

const ClassroomBoard = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  const getCurrentDate = () => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate()
    };
  };

  const { year, month, day } = getCurrentDate();

  const handleClassClick = (classData) => {
    setSelectedClass(classData);
    setSelectedPost(null); // 클래스 변경 시 선택된 게시물 초기화
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await axios.get('/api/classes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        let data = res.data?.data || [];

        // eslint-disable-next-line no-console
        console.log('📥 API 응답 데이터:', data);
        if (data && data.length > 0) {
          // eslint-disable-next-line no-console
          console.log('📥 첫 번째 게시물:', data[0]);
          // eslint-disable-next-line no-console
          console.log('📥 첫 번째 게시물 content:', data[0]?.content);
          // eslint-disable-next-line no-console
          console.log('📥 첫 번째 게시물 keys:', Object.keys(data[0] || {}));
        }
        // eslint-disable-next-line no-console
        console.log('📥 첫 번째 게시물 전체 JSON:', JSON.stringify(data[0], null, 2));

        // 실제 데이터만 사용 (임시 데이터 제거)

        // eslint-disable-next-line no-console
        console.log('📝 수정된 데이터:', data);

        setClasses(data);
        if (!selectedClass && data.length > 0) setSelectedClass(data[0]);
      } catch (err) {
        console.error('참여 클래스 목록 불러오기 실패:', err?.response?.data || err.message);
        setClasses([]);
      }
    };
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePostClick = (post) => {
    // 학생용에서는 게시물 상세 조회 API가 없으므로 목록에서 가져온 데이터만 사용
    // eslint-disable-next-line no-console
    console.log('🖱️ 게시물 클릭됨 (학생용):', post);
    // eslint-disable-next-line no-console
    console.log('🖱️ 학생용 selectedPost content:', post?.content);
    setSelectedPost(post);
  };

  const handleCloseSidebar = () => {
    setSelectedPost(null);
  };

  const handleClassJoin = async (classCode) => {
    try {
      const token = localStorage.getItem('accessToken');

      await axios.post('/api/classes/join', {
        classCode: classCode
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 클래스 목록 새로고침
      const res = await axios.get('/api/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data?.data || [];
      setClasses(data);
      if (!selectedClass && data.length > 0) setSelectedClass(data[0]);

      alert('클래스에 참여했습니다.');
    } catch (error) {
      console.error('클래스 참여 실패:', error);
      if (error.response?.status === 400) {
        alert('존재하지 않는 클래스 코드입니다.');
      } else if (error.response?.status === 409) {
        alert('이미 참여한 클래스입니다.');
      } else {
        alert('클래스 참여에 실패했습니다.');
      }
    }
  };

  const handleSubmitAssignment = async (classId, postId, submissionData) => {
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();

      // 파일들 추가
      if (submissionData.files && submissionData.files.length > 0) {
        submissionData.files.forEach(file => {
          formData.append('files[]', file);
        });
      }

      // 일정표 추가 여부
      if (submissionData.addToSchedule !== undefined) {
        formData.append('addToSchedule', submissionData.addToSchedule.toString());
      }

      await axios.post(`/api/classes/${classId}/posts/${postId}/submit`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
          // Content-Type은 axios가 자동으로 설정 (boundary 포함)
        }
      });

      alert('과제가 제출되었습니다.');
    } catch (error) {
      console.error('과제 제출 실패:', error);
      alert('과제 제출에 실패했습니다.');
    }
  };

  const handleUpdateSubmission = async (classId, postId, submissionData) => {
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();

      // 파일들 추가
      if (submissionData.files && submissionData.files.length > 0) {
        submissionData.files.forEach(file => {
          formData.append('files[]', file);
        });
      }

      await axios.put(`/api/classes/${classId}/posts/${postId}/submit`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
          // Content-Type은 axios가 자동으로 설정 (boundary 포함)
        }
      });

      alert('제출물이 수정되었습니다.');
    } catch (error) {
      console.error('제출물 수정 실패:', error);
      alert('제출물 수정에 실패했습니다.');
    }
  };

  const handleLeaveClass = async () => {
    if (!selectedClass) return;

    if (!window.confirm(`"${selectedClass.className}" 클래스에서 정말 나가시겠습니까?\n클래스를 나가면 다시 참여하려면 클래스 코드를 입력해야 합니다.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');

      // 클래스 나가기 API 호출 (DELETE /api/classes/{classId}/participants/{studentId})
      // 현재 로그인한 사용자의 ID를 가져와야 함
      const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      const studentId = userProfile.id;

      if (!studentId) {
        alert('사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
        return;
      }

      await axios.delete(`/api/classes/${selectedClass.id}/participants/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 클래스 목록 새로고침
      const res = await axios.get('/api/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data?.data || [];
      setClasses(data);

      // 선택된 클래스가 목록에 없으면 선택 해제
      const currentClassExists = data.some(cls => cls.id === selectedClass?.id);
      if (selectedClass && !currentClassExists) {
        setSelectedClass(data.length > 0 ? data[0] : null);
        setSelectedPost(null);
      }

      alert('클래스에서 나갔습니다.');
    } catch (error) {
      console.error('클래스 나가기 실패:', error);
      alert('클래스 나가기에 실패했습니다.');
    }
  };

  return (
    <div className="classroom-board">
      <Header />
      
      <div className="classroom-main-content">
        {/* 왼쪽 섹션 (날짜 + 클래스 목록 + 버튼) */}
        <div className="classroom-left-section">
          {/* 날짜 표시 */}
          <div className="date-display">
            <p className="year-text">{year}년</p>
            <h2 className="date-text">{month}월 {day}일</h2>
          </div>

          {/* 참여한 클래스 목록 */}
          {classes.length > 0 ? (
            <div className="class-grid">
              {classes.map((classData) => (
                <ClassCard
                  key={classData.id}
                  classData={classData}
                  onClick={() => handleClassClick(classData)}
                />
              ))}
            </div>
          ) : (
            <div className="empty-class-list">
              <p>아직 참여한 클래스가 없습니다.</p>
              <p>아래 버튼을 클릭하여 클래스에 참여해보세요!</p>
            </div>
          )}

          {/* 클래스 참여 버튼 */}
          <div className="class-button-container">
            <ClassCreateButton userRole="student" onJoinClass={handleClassJoin} />
          </div>
        </div>

        {/* 클래스 상세 카드 */}
        <div className="class-detail-wrapper">
          {selectedClass ? (
            <ClassDetailCard
              classData={selectedClass}
              onPostClick={handlePostClick}
              onLeaveClass={handleLeaveClass}
            />
          ) : (
            <div className="no-class-selected">
              <p>클래스를 선택해주세요</p>
            </div>
          )}
        </div>

        {/* 새로운 상세 사이드바 */}
        <div className="sidebar-wrapper">
          <ClassDetailSidebar
            selectedPost={selectedPost}
            onClose={handleCloseSidebar}
            onSubmitAssignment={selectedClass ? (postId, submissionData) =>
              handleSubmitAssignment(selectedClass.id, postId, submissionData) : null}
            onUpdateSubmission={selectedClass ? (postId, submissionData) =>
              handleUpdateSubmission(selectedClass.id, postId, submissionData) : null}
          />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ClassroomBoard;