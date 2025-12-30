import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { RefreshCw, Plus } from 'lucide-react';
import PostWriteModal from '../PostWriteModal/PostWriteModal';
import { useAppContext } from '../../App';
import './NoticeCard.css';

const NoticeCard = () => {
  const { profile, userRole } = useAppContext();
  const [itemsList, setItemsList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 권한 확인: TEACHER 또는 ADMIN만 공지사항 작성 가능
  const canCreateNotice = profile?.userRole === 'TEACHER' || profile?.userRole === 'ADMIN';

  const fetchNoticesAndAssignments = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const token = localStorage.getItem('accessToken');
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 공지사항 가져오기 (학생만 클래스룸에서, 선생님/관리자는 전역 공지사항)
      let notices = [];
      // userRole은 'student', 'admin', 'teacher' 형식 (소문자)
      const isStudent = userRole === 'student' || profile?.userRole === 'STUDENT' || profile?.userRole === 'student';
      
      if (isStudent) {
        // 학생은 클래스룸의 공지사항을 가져옴
        try {
          const classesResponse = await axios.get('/api/classes', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const classes = classesResponse.data?.data || [];
          
          // 각 클래스의 게시물 중 공지만 추출
          for (const classItem of classes) {
            try {
              let posts = [];
              if (classItem.posts && Array.isArray(classItem.posts) && classItem.posts.length > 0) {
                posts = classItem.posts;
              } else {
                const postsResponse = await axios.get(`/api/classes/${classItem.id}/posts`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                posts = postsResponse.data?.data || [];
              }
              
              // 공지만 필터링하고 오늘 날짜인 것만
              posts.forEach(post => {
                if (post.type === '공지') {
                  const dateStr = post.createdAt || post.noticeDate;
                  let shouldInclude = false;
                  
                  if (dateStr) {
                    try {
                      const noticeDate = new Date(dateStr);
                      noticeDate.setHours(0, 0, 0, 0);
                      // 오늘 날짜인 것만 포함
                      if (noticeDate.getTime() === today.getTime()) {
                        shouldInclude = true;
                      }
                    } catch (error) {
                      // 날짜 파싱 실패 시 무시
                    }
                  } else {
                    // 날짜가 없으면 오늘 생성된 것으로 간주하고 포함
                    shouldInclude = true;
                  }
                  
                  if (shouldInclude) {
                    notices.push({
                      ...post,
                      type: '공지',
                      className: classItem.className,
                      classId: classItem.id,
                      author: post.teacherName || classItem.teacherName || post.author || post.writer || post.authorName || post.userName || post.name || '관리자',
                      createdAt: post.createdAt || post.noticeDate || post.date,
                      noticeDate: post.noticeDate || post.createdAt || post.date
                    });
                  }
                }
              });
            } catch (postErr) {
              console.error(`클래스 ${classItem.className}의 공지사항 불러오기 실패:`, postErr?.response?.data || postErr.message);
            }
          }
        } catch (err) {
          console.error('공지사항 불러오기 실패:', err?.response?.data || err.message);
        }
      } else {
        // 선생님/관리자는 전역 공지사항
        try {
          const noticeResponse = await axios.get('/api/classes/notices/today', {
            headers: { Authorization: `Bearer ${token}` }
          });
          notices = noticeResponse.data?.data || [];
          
          // 공지사항 필터링: 오늘 날짜인 것만
          notices = notices.filter(notice => {
            const dateStr = notice.noticeDate || notice.createdAt;
            if (!dateStr) {
              return false;
            }
            try {
              const noticeDate = new Date(dateStr);
              noticeDate.setHours(0, 0, 0, 0);
              return noticeDate.getTime() === today.getTime();
            } catch (error) {
              return false;
            }
          }).map(notice => ({
            ...notice,
            type: '공지',
            author: notice.teacherName || notice.author || notice.writer || notice.authorName || notice.userName || notice.name || '관리자'
          }));
        } catch (err) {
          console.error('공지사항 불러오기 실패:', err?.response?.data || err.message);
        }
      }

      // 과제물 가져오기 (학생만)
      let assignments = [];
      console.log('🎓 사용자 역할 확인:', { userRole, profileUserRole: profile?.userRole, isStudent });
      
      if (isStudent) {
        console.log('🎓 학생 계정 확인됨, 과제물 가져오기 시작');
        try {
          const classesResponse = await axios.get('/api/classes', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const classes = classesResponse.data?.data || [];
          
          console.log('📚 클래스 목록:', classes.length, '개');
          if (classes.length === 0) {
            console.warn('⚠️ 참여한 클래스가 없습니다.');
          } else {
            console.log('📚 첫 번째 클래스:', {
              id: classes[0].id,
              className: classes[0].className,
              hasPosts: !!classes[0].posts,
              postsLength: classes[0].posts?.length || 0
            });
          }
          
          // 각 클래스의 게시물을 가져오기
          for (const classItem of classes) {
            try {
              console.log(`\n🔍 클래스 "${classItem.className}" (ID: ${classItem.id}) 처리 중...`);
              
              // 클래스에 posts가 포함되어 있으면 사용, 없으면 별도 API 호출
              let posts = [];
              if (classItem.posts && Array.isArray(classItem.posts) && classItem.posts.length > 0) {
                posts = classItem.posts;
                console.log(`  ✅ posts 배열에서 ${posts.length}개 게시물 발견`);
              } else {
                // posts가 없으면 별도 API 호출
                console.log(`  📡 /api/classes/${classItem.id}/posts API 호출 중...`);
                const postsResponse = await axios.get(`/api/classes/${classItem.id}/posts`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                posts = postsResponse.data?.data || [];
                console.log(`  ✅ API 호출로 ${posts.length}개 게시물 가져옴`);
              }
              
              if (posts.length === 0) {
                console.log(`  ⚠️ 게시물이 없습니다.`);
                continue;
              }
              
              console.log(`  📋 게시물 타입 분포:`, posts.map(p => p.type));
              
              // 과제만 필터링
              posts.forEach(post => {
                const postType = post.type;
                const isAssignment = postType === '과제';
                console.log(`  🔍 게시물: "${post.title}"`, {
                  type: postType,
                  isAssignment: isAssignment,
                  dueDate: post.dueDate || post.deadline || '없음'
                });
                
                if (isAssignment) {
                  assignments.push({
                    ...post,
                    className: classItem.className,
                    classId: classItem.id,
                    author: post.teacherName || classItem.teacherName || post.author || post.writer || post.authorName || post.userName || post.name || '관리자'
                  });
                  console.log(`    ✅ 과제로 추가됨!`);
                }
              });
            } catch (postErr) {
              console.error(`  ❌ 클래스 ${classItem.className}의 게시물 불러오기 실패:`, postErr?.response?.data || postErr.message);
            }
          }
          
          console.log(`\n📋 필터링 전 과제물: ${assignments.length}개`);
          if (assignments.length > 0) {
            console.log('📋 필터링 전 첫 번째 과제:', assignments[0]);
          } else {
            console.warn('⚠️ 과제물이 추출되지 않았습니다. 클래스룸에 과제가 있는지 확인하세요.');
          }
        } catch (err) {
          console.error('❌ 과제물 불러오기 실패:', err?.response?.data || err.message);
        }
      } else {
        console.log('🎓 학생 계정이 아니므로 과제물을 가져오지 않습니다. userRole:', userRole, 'profile?.userRole:', profile?.userRole);
      }

      // 과제물 필터링: 만료일이 지나지 않은 것만
      console.log('🔍 과제물 필터링 시작, 오늘 날짜:', today.toISOString().split('T')[0]);
      const beforeFilterCount = assignments.length;
      assignments = assignments.filter(assignment => {
        const dueDateStr = assignment.dueDate || assignment.deadline;
        console.log(`🔍 과제 필터링 체크:`, {
          title: assignment.title,
          dueDate: dueDateStr,
          hasDueDate: !!dueDateStr
        });
        
        // 만료일이 없으면 표시 (과제는 만료일이 필수이지만, 혹시 모를 경우를 대비)
        if (!dueDateStr) {
          console.log(`⚠️ ${assignment.title}: 만료일 정보 없음 - 표시함`);
          return true;
        }
        try {
          const dueDate = new Date(dueDateStr);
          dueDate.setHours(23, 59, 59, 999); // 만료일의 끝까지 포함
          const isValid = dueDate >= today;
          console.log(`🔍 ${assignment.title}: 만료일 ${dueDate.toISOString().split('T')[0]}, 유효: ${isValid}`);
          return isValid;
        } catch (error) {
          console.error(`❌ ${assignment.title}: 날짜 파싱 실패`, error);
          // 파싱 실패해도 표시 (데이터 문제일 수 있음)
          return true;
        }
      }).map(assignment => ({
        ...assignment,
        type: '과제',
        author: assignment.teacherName || assignment.author || assignment.writer || assignment.authorName || assignment.userName || assignment.name || '관리자'
      }));
      
      console.log(`📋 필터링 결과: ${beforeFilterCount}개 → ${assignments.length}개`);
      if (assignments.length > 0) {
        console.log('📋 필터링 후 첫 번째 과제:', assignments[0]);
      } else if (beforeFilterCount > 0) {
        console.warn('⚠️ 과제물이 있지만 모두 만료일이 지났습니다.');
      } else {
        console.warn('⚠️ 과제물이 전혀 없습니다. 클래스룸에 과제가 있는지 확인하세요.');
      }

      // 공지사항과 과제물 합치기
      const allItems = [...notices, ...assignments];
      
      // 정렬: 공지사항 먼저, 그 다음 과제물 (만료일 빠른 순)
      allItems.sort((a, b) => {
        if (a.type === '공지' && b.type === '과제') return -1;
        if (a.type === '과제' && b.type === '공지') return 1;
        if (a.type === '과제' && b.type === '과제') {
          const aDue = new Date(a.dueDate || a.deadline || 0);
          const bDue = new Date(b.dueDate || b.deadline || 0);
          return aDue - bDue;
        }
        return 0;
      });

      setItemsList(allItems);
      console.log('공지사항 및 과제물 로딩 완료:', {
        공지사항: notices.length,
        과제물: assignments.length,
        전체: allItems.length
      });

    } catch (err) {
      console.error('데이터 불러오기 실패:', err?.response?.data || err.message);
      setItemsList([]);
    } finally {
      setIsRefreshing(false);
    }
  }, [profile?.userRole, userRole]);

  useEffect(() => {
    fetchNoticesAndAssignments();

    // 공지사항 생성 이벤트 리스너
    const handleNoticeCreated = () => {
      console.log('공지사항 생성 이벤트 수신, 목록 새로고침');
      fetchNoticesAndAssignments();
    };

    window.addEventListener('noticeCreated', handleNoticeCreated);

    return () => {
      window.removeEventListener('noticeCreated', handleNoticeCreated);
    };
  }, [fetchNoticesAndAssignments]);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      return dateStr;
    }
  };

  return (
    <div className="notice-wrapper">
      {/* 공지사항 및 과제물 박스 */}
      <div className="notice-box">
        <div className="notice-box-header">
          <span className="notice-box-title">공지 · 과제</span>
          <div className="notice-header-buttons">
            {canCreateNotice && (
              <button
                className="notice-write-btn"
                onClick={() => setShowWriteModal(true)}
                title="공지사항 작성"
              >
                <Plus size={16} />
              </button>
            )}
            <button
              className="notice-refresh-btn"
              onClick={fetchNoticesAndAssignments}
              disabled={isRefreshing}
              title="새로고침"
            >
              <RefreshCw size={16} className={isRefreshing ? 'rotating' : ''} />
            </button>
          </div>
        </div>
        <div className="notice-box-content">
          {itemsList.length > 0 ? (
            itemsList.map(item => {
              const author = item.author || '관리자';
              const isAssignment = item.type === '과제';
              const dueDate = isAssignment ? (item.dueDate || item.deadline) : null;
              
              return (
                <div key={`${item.type}-${item.id}`} className="notice-item" onClick={() => handleItemClick(item)}>
                  <div className="notice-item-header">
                    <span className={`notice-item-type ${isAssignment ? 'type-assignment' : 'type-notice'}`}>
                      {item.type}
                    </span>
                    {isAssignment && dueDate && (
                      <span className="notice-item-duedate">
                        마감: {formatDate(dueDate)}
                      </span>
                    )}
                  </div>
                  <div className="notice-item-title">{item.title}</div>
                  <div className="notice-item-author">
                    {item.className && `${item.className} · `}
                    {author}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-notice-text">
              공지사항 및 과제물이 없습니다.
            </div>
          )}
        </div>
      </div>
      {/* 공지사항 및 과제물 상세 모달 */}
      {showModal && selectedItem && (
        <div className="notice-modal-overlay" onClick={handleCloseModal}>
          <div className="notice-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="notice-modal-header">
              <div className="notice-modal-title-section">
                <span className={`notice-modal-type ${selectedItem.type === '과제' ? 'type-assignment' : 'type-notice'}`}>
                  {selectedItem.type}
                </span>
                <h3 className="notice-modal-title">{selectedItem.title}</h3>
              </div>
              <button className="notice-modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <div className="notice-modal-info">
              {selectedItem.className && (
                <div className="notice-info-box">
                  <span className="info-label">클래스</span>
                  <span className="info-value">{selectedItem.className}</span>
                </div>
              )}
              <div className="notice-info-box">
                <span className="info-label">작성자</span>
                <span className="info-value author-name">
                  {selectedItem.author || selectedItem.teacherName || '관리자'}
                </span>
              </div>
              {selectedItem.type === '공지' && (selectedItem.createdAt || selectedItem.noticeDate || selectedItem.date || selectedItem.createdDate) && (
                <div className="notice-info-box">
                  <span className="info-label">작성일</span>
                  <span className="info-value">
                    {(() => {
                      // 여러 가능한 날짜 필드 확인
                      const dateStr = selectedItem.createdAt || 
                                     selectedItem.noticeDate || 
                                     selectedItem.date || 
                                     selectedItem.createdDate ||
                                     selectedItem.writeDate;
                      
                      if (dateStr) {
                        try {
                          return formatDate(dateStr);
                        } catch (error) {
                          console.error('날짜 포맷팅 실패:', error, dateStr);
                          return dateStr;
                        }
                      }
                      return '';
                    })()}
                  </span>
                </div>
              )}
              {selectedItem.type === '과제' && (selectedItem.dueDate || selectedItem.deadline) && (
                <div className="notice-info-box">
                  <span className="info-label">마감일</span>
                  <span className="info-value">{formatDate(selectedItem.dueDate || selectedItem.deadline)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 공지사항 작성 모달 */}
      <PostWriteModal
        isOpen={showWriteModal}
        onClose={() => setShowWriteModal(false)}
        onSubmit={async () => {
          // 공지사항 생성 후 목록 새로고침
          console.log('공지사항 생성 완료, 목록 새로고침 시작');
          // 약간의 지연을 두어 서버에서 데이터가 반영될 시간을 확보
          setTimeout(() => {
          fetchNoticesAndAssignments();
          }, 500);
        }}
        initialType="공지"
        isClassroomContext={false}
      />
    </div>
  );
};

export default NoticeCard;