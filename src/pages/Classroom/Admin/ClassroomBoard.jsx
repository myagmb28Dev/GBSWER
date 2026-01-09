import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import ClassCreateButton from '../../../components/ClassCreateButton/ClassCreateButton';
import ClassCard from '../../../components/ClassCard/ClassCard';
import AdminClassDetailCard from '../../../components/ClassDetailCard/AdminClassDetailCard';
import AdminClassDetailSidebar from '../../../components/ClassDetailSidebar/AdminClassDetailSidebar';
import AssignmentStatusModal from '../../../components/AssignmentStatusModal/AssignmentStatusModal';
import './ClassroomBoard.css';

const ClassroomBoard = ({ userRole }) => {
  // 디버그: 현재 userRole 확인
  // eslint-disable-next-line no-console
  console.log('🏫 ClassroomBoardAdmin userRole:', userRole);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [assignmentStatusModal, setAssignmentStatusModal] = useState({ isOpen: false, postId: null });
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
    setSelectedPost(null);
  };

  // load classes from API
  useEffect(() => {
    const loadClasses = async () => {
      // userRole 확인 및 엔드포인트 결정 (스코프 문제 해결을 위해 try 블록 밖에서 선언)
      const endpoint = userRole === 'admin' ? '/api/classes/admin' : '/api/classes/teacher';
      
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.error('토큰이 없습니다.');
          setClasses([]);
          return;
        }

        console.log('🔍 클래스 로딩 시도 - userRole:', userRole, 'endpoint:', endpoint);

        const response = await axiosInstance.get(endpoint);

        let data = response.data?.data || [];
        console.log('✅ 로딩된 클래스 수:', data.length);
        console.log('✅ 클래스 데이터:', data);

        // 실제 데이터만 사용 (임시 데이터 제거)
        setClasses(data);

        if (!selectedClass && data.length > 0) {
          setSelectedClass(data[0]);
        }
      } catch (err) {
        console.error('❌ 클래스 로딩 실패:', err);
        console.error('❌ 에러 응답 전체:', JSON.stringify(err.response?.data, null, 2));
        console.error('❌ 에러 상태:', err.response?.status);
        console.error('❌ 현재 userRole:', userRole);
        console.error('❌ 사용한 endpoint:', endpoint);
        console.error('❌ 에러 메시지:', err.response?.data?.message || err.response?.data?.error || err.message);
        console.error('❌ 스택 트레이스:', err.stack);
        
        // 에러가 발생해도 기존 클래스 목록은 유지 (빈 배열로 초기화하지 않음)
        // 단, 첫 로딩 시에만 빈 배열로 설정
        if (classes.length === 0) {
          setClasses([]);
        }
        
        // 401 (Unauthorized) 또는 403 (Forbidden) 에러인 경우
        if (err.response?.status === 401 || err.response?.status === 403) {
          alert('권한이 없습니다. 다시 로그인해주세요.');
        } else if (err.response?.status === 404) {
          // 404는 클래스가 없는 경우일 수 있으므로 빈 배열로 설정
        setClasses([]);
        } else if (err.response?.status === 500) {
          // 500 에러는 서버 문제이므로 사용자에게 알림
          const errorMessage = err.response?.data?.message || err.response?.data?.error || '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
          console.error('서버 오류 상세:', errorMessage);
          console.error('서버 오류 응답 데이터:', err.response?.data);
          // 첫 로딩 시에만 알림 표시 (반복 알림 방지)
          if (classes.length === 0) {
            alert(`클래스 목록을 불러올 수 없습니다.\n${errorMessage}\n\n백엔드 서버 로그를 확인해주세요.`);
          }
        } else {
          // 기타 에러는 사용자에게 알림만 표시
          console.warn('클래스 목록을 불러오는데 실패했습니다. 기존 목록을 유지합니다.');
        }
      }
    };

    loadClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole]);

  const handlePostClick = (post) => {
    // eslint-disable-next-line no-console
    console.log('🏫 Admin handlePostClick:', post);
    // eslint-disable-next-line no-console
    console.log('🏫 Admin selectedPost content:', post?.content);
    setSelectedPost(post);
  };

  const handleCloseSidebar = () => {
    setSelectedPost(null);
  };

  const handleClassCreate = async (classData) => {
    try {
      const token = localStorage.getItem('accessToken');

      await axiosInstance.post('/api/classes/create', {
        className: classData.className,
        classCode: classData.classCode
      });

      // 클래스 목록 새로고침
      const listEndpoint = userRole === 'admin' ? '/api/classes/admin' : '/api/classes/teacher';
      const res = await axiosInstance.get(listEndpoint);
      const data = res.data?.data || [];
      setClasses(data);

      alert('클래스가 생성되었습니다.');
    } catch (error) {
      console.error('클래스 생성 실패:', error);
        console.error('에러 응답:', error.response?.data);
        console.error('에러 상태:', error.response?.status);
        
      if (error.response?.status === 409) {
        alert('이미 존재하는 클래스 코드입니다.');
        } else if (error.response?.status === 500) {
          const errorMessage = error.response?.data?.message || '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
          alert(`클래스 생성에 실패했습니다.\n${errorMessage}`);
      } else {
          const errorMessage = error.response?.data?.message || '알 수 없는 오류가 발생했습니다.';
          alert(`클래스 생성에 실패했습니다.\n${errorMessage}`);
      }
    }
  };

  const handleOpenAssignmentStatus = (postId) => {
    setAssignmentStatusModal({ isOpen: true, postId });
  };

  const handleCloseAssignmentStatus = () => {
    setAssignmentStatusModal({ isOpen: false, postId: null });
  };

  const handleReviewSubmission = async (submissionId, reviewData) => {
    try {
      console.log('Mock 제출물 평가 - 제출 ID:', submissionId, '평가 데이터:', reviewData);

      alert('제출물 평가가 완료되었습니다!');

    } catch (err) {
      console.error('제출물 평가 실패:', err);
      alert('제출물 평가에 실패했습니다.');
    }
  };

  const handleCreatePost = async (classId, postData) => {
    try {
      const token = localStorage.getItem('accessToken');

      // postData가 FormData인지 객체인지 확인
      let formData;
      if (postData instanceof FormData) {
        // 이미 FormData인 경우 그대로 사용 (PostWriteModal에서 올바른 형식으로 전송됨)
        formData = postData;
      } else {
        // 객체인 경우 새로운 API 형식으로 FormData 변환
        formData = new FormData();
        const dto = {
          title: postData.title,
          content: postData.content || postData.description || '',
          type: postData.type
        };
      if (postData.dueDate) {
          dto.dueDate = postData.dueDate;
        }
        const dtoBlob = new Blob([JSON.stringify(dto)], { type: 'application/json' });
        formData.append('dto', dtoBlob);
        
        // 파일이 있는 경우 files 파트로 추가
        if (postData.files && Array.isArray(postData.files)) {
          postData.files.forEach(file => {
            formData.append('files', file);
          });
        }
      }

      await axiosInstance.post(`/api/classes/${classId}/posts`, formData);

      // 게시물 목록 새로고침
      if (selectedClass && selectedClass.id === classId) {
        const postsResponse = await axiosInstance.get(`/api/classes/${classId}/posts`);
        const updatedPosts = postsResponse.data?.data || [];

        setSelectedClass(prev => ({
          ...prev,
          posts: updatedPosts
        }));

        // 전체 클래스 목록에서도 업데이트
        setClasses(prevClasses =>
          prevClasses.map(cls =>
            cls.id === classId
              ? { ...cls, posts: updatedPosts }
              : cls
          )
        );
      }

      alert('게시물이 생성되었습니다.');
    } catch (error) {
      console.error('게시물 생성 실패:', error);
      alert('게시물 생성에 실패했습니다.');
    }
  };

  const handleUpdatePost = async (classId, postId, postData) => {
    try {
      const token = localStorage.getItem('accessToken');

      // postData가 FormData인지 객체인지 확인
      let formData;
      if (postData instanceof FormData) {
        // 이미 FormData인 경우 그대로 사용
        formData = postData;
      } else {
        // 객체인 경우 새로운 API 형식으로 FormData 변환
        formData = new FormData();
        const dto = {
          title: postData.title,
          content: postData.content || postData.description || '',
          type: postData.type
        };
      if (postData.dueDate) {
          dto.dueDate = postData.dueDate;
        }
        const dtoBlob = new Blob([JSON.stringify(dto)], { type: 'application/json' });
        formData.append('dto', dtoBlob);
        
        // 파일이 있는 경우 files 파트로 추가
        if (postData.files && Array.isArray(postData.files)) {
          postData.files.forEach(file => {
            formData.append('files', file);
          });
        }
      }

      await axiosInstance.put(`/api/classes/${classId}/posts/${postId}`, formData);

      // 게시물 목록 새로고침
      if (selectedClass && selectedClass.id === classId) {
        const postsResponse = await axiosInstance.get(`/api/classes/${classId}/posts`);
        const updatedPosts = postsResponse.data?.data || [];

        setSelectedClass(prev => ({
          ...prev,
          posts: updatedPosts
        }));

        // 전체 클래스 목록에서도 업데이트
        setClasses(prevClasses =>
          prevClasses.map(cls =>
            cls.id === classId
              ? { ...cls, posts: updatedPosts }
              : cls
          )
        );

        // 선택된 게시물도 업데이트
        if (selectedPost && selectedPost.id === postId) {
          const updatedPost = updatedPosts.find(p => p.id === postId);
          if (updatedPost) {
            setSelectedPost(updatedPost);
          }
        }
      }

      alert('게시물이 수정되었습니다.');
    } catch (error) {
      console.error('게시물 수정 실패:', error);
      alert('게시물 수정에 실패했습니다.');
    }
  };

  const handleDeletePost = async (classId, postId) => {
    if (!window.confirm('게시물을 삭제하시겠습니까?')) return;

    try {
      const token = localStorage.getItem('accessToken');

      await axiosInstance.delete(`/api/classes/${classId}/posts/${postId}`);

      // 게시물 목록 새로고침
      if (selectedClass && selectedClass.id === classId) {
        const postsResponse = await axiosInstance.get(`/api/classes/${classId}/posts`);
        const updatedPosts = postsResponse.data?.data || [];

        setSelectedClass(prev => ({
          ...prev,
          posts: updatedPosts
        }));

        // 전체 클래스 목록에서도 업데이트
        setClasses(prevClasses =>
          prevClasses.map(cls =>
            cls.id === classId
              ? { ...cls, posts: updatedPosts }
              : cls
          )
        );
      }

      // 선택된 게시물이 삭제된 경우 사이드바 닫기
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost(null);
      }

      alert('게시물이 삭제되었습니다.');
    } catch (error) {
      console.error('게시물 삭제 실패:', error);
      console.error('에러 상태:', error.response?.status);
      console.error('에러 메시지:', error.response?.data);
      const errorMessage = error.response?.data?.message || '게시물 삭제에 실패했습니다.';
      alert(errorMessage);
      throw error; // 상위 컴포넌트에서 처리할 수 있도록 에러 전달
    }
  };

  const handleClassDelete = async (classId) => {
    if (!window.confirm('클래스를 삭제하시겠습니까? 삭제된 클래스는 복구할 수 없습니다.')) return;

    try {
      const token = localStorage.getItem('accessToken');

      await axiosInstance.delete(`/api/classes/${classId}`);

      // 클래스 목록 새로고침
      const endpoint = userRole === 'admin' ? '/api/classes/admin' : '/api/classes/teacher';
      const response = await axiosInstance.get(endpoint);
      const data = response.data?.data || [];
      setClasses(data);

      // 선택된 클래스가 삭제된 클래스라면 선택 해제
      if (selectedClass && selectedClass.id === classId) {
        setSelectedClass(data.length > 0 ? data[0] : null);
      }

      alert('클래스가 삭제되었습니다.');
    } catch (error) {
      console.error('클래스 삭제 실패:', error);
      alert('클래스 삭제에 실패했습니다.');
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

          {/* 생성한 클래스 목록 */}
          {classes.length > 0 ? (
            <div className="class-grid">
              {classes.map((classData) => (
                <ClassCard
                  key={classData.id}
                  classData={classData}
                  onClick={() => handleClassClick(classData)}
                  isSelected={selectedClass?.id === classData.id}
                />
              ))}
            </div>
          ) : (
            <div className="empty-class-list">
              <p>아직 생성한 클래스가 없습니다.</p>
              <p>아래 버튼을 클릭하여 새로운 클래스를 생성해보세요!</p>
            </div>
          )}

          {/* 클래스 생성 버튼 */}
          <div className="class-button-container">
            <ClassCreateButton userRole="admin" onCreateClass={handleClassCreate} />
          </div>
        </div>

        {/* 클래스 상세 카드 */}
        <div className="class-detail-wrapper">
          {selectedClass ? (
            <AdminClassDetailCard
              classData={selectedClass}
              onPostClick={handlePostClick}
              onCreatePost={(postData) => handleCreatePost(selectedClass.id, postData)}
              onUpdatePost={(postId, postData) => handleUpdatePost(selectedClass.id, postId, postData)}
              onDeletePost={(postId) => handleDeletePost(selectedClass.id, postId)}
              onOpenAssignmentStatus={(postId) => handleOpenAssignmentStatus(postId)}
              onDeleteClass={() => handleClassDelete(selectedClass.id)}
              onPostDelete={(postId) => handleDeletePost(selectedClass.id, postId)}
            />
          ) : (
            <div className="no-class-selected">
              <p>클래스를 선택해주세요</p>
            </div>
          )}
        </div>

        {/* 상세 사이드바 */}
        <div className="sidebar-wrapper">
          <AdminClassDetailSidebar
            selectedPost={selectedPost}
            onClose={handleCloseSidebar}
            classId={selectedClass?.id}
            onPostCreate={selectedClass ? (postData) => handleCreatePost(selectedClass.id, postData) : null}
            onPostUpdate={selectedClass ? (postId, postData) => handleUpdatePost(selectedClass.id, postId, postData) : null}
            onPostDelete={selectedClass ? (postId) => handleDeletePost(selectedClass.id, postId) : null}
          />
        </div>
      </div>

      <Footer />

      {/* Assignment Status Modal */}
      <AssignmentStatusModal
        isOpen={assignmentStatusModal.isOpen}
        onClose={handleCloseAssignmentStatus}
        postId={assignmentStatusModal.postId}
        classId={selectedClass?.id}
        onReviewSubmission={handleReviewSubmission}
      />
    </div>
  );
};

export default ClassroomBoard;