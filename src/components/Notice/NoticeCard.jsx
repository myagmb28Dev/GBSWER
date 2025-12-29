import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, Plus } from 'lucide-react';
import PostWriteModal from '../PostWriteModal/PostWriteModal';
import { useAppContext } from '../../App';
import './NoticeCard.css';

const NoticeCard = () => {
  const { profile } = useAppContext();
  const [noticeList, setNoticeList] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 권한 확인: TEACHER 또는 ADMIN만 공지사항 작성 가능
  const canCreateNotice = profile?.userRole === 'TEACHER' || profile?.userRole === 'ADMIN';

    const fetchNotices = async () => {
      try {
      setIsRefreshing(true);
        const token = localStorage.getItem('accessToken');

      const response = await axios.get('/api/classes/notices/today', {
        headers: { Authorization: `Bearer ${token}` }
      });

      let notices = response.data?.data || [];
      
      // API 응답 구조 확인을 위한 로깅
      if (notices.length > 0) {
        console.log('공지사항 API 응답 샘플:', notices[0]);
      }
      
      // 프론트엔드에서도 오늘 날짜인 공지사항만 필터링 (이중 확인)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      notices = notices.filter(notice => {
        // noticeDate 또는 createdAt 필드를 확인
        const dateStr = notice.noticeDate || notice.createdAt;
        if (!dateStr) {
          console.warn('공지사항에 날짜 정보가 없음:', notice);
          return false;
        }
        
        try {
          const noticeDate = new Date(dateStr);
          noticeDate.setHours(0, 0, 0, 0);
          const isToday = noticeDate.getTime() === today.getTime();
          
          if (!isToday) {
            console.log('공지사항 날짜 불일치:', {
              title: notice.title,
              noticeDate: dateStr,
              parsed: noticeDate.toISOString(),
              today: today.toISOString()
            });
          }
          
          return isToday;
        } catch (error) {
          console.error('공지사항 날짜 파싱 실패:', dateStr, error);
          return false;
        }
      }).map(notice => {
        // 작성자 필드 정규화 (teacherName 우선 확인)
        // teacherName이 있으면 항상 사용, 없으면 다른 필드 확인
        if (notice.teacherName) {
          notice.author = notice.teacherName;
        } else if (!notice.author || notice.author === '관리자') {
          notice.author = notice.writer || notice.authorName || notice.userName || notice.name || notice.author || '관리자';
        }
        return notice;
      });
      
      setNoticeList(notices);
      console.log('공지사항 로딩 완료, 총', notices.length, '개 (오늘 날짜 필터링 적용)', notices);

      } catch (err) {
        console.error('공지사항 불러오기 실패:', err?.response?.data || err.message);
      // API 실패 시 빈 배열로 설정
        setNoticeList([]);
    } finally {
      setIsRefreshing(false);
      }
    };

  useEffect(() => {
    fetchNotices();

    // 공지사항 생성 이벤트 리스너
    const handleNoticeCreated = () => {
      console.log('공지사항 생성 이벤트 수신, 목록 새로고침');
      fetchNotices();
    };

    window.addEventListener('noticeCreated', handleNoticeCreated);

    return () => {
      window.removeEventListener('noticeCreated', handleNoticeCreated);
    };
  }, []);

  const handleNoticeClick = (notice) => {
    setSelectedNotice(notice);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedNotice(null);
  };

  return (
    <div className="notice-wrapper">
      {/* 공지사항 박스 */}
      <div className="notice-box">
        <div className="notice-box-header">
          <span className="notice-box-title">오늘의 공지사항</span>
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
              onClick={fetchNotices}
              disabled={isRefreshing}
              title="새로고침"
            >
              <RefreshCw size={16} className={isRefreshing ? 'rotating' : ''} />
            </button>
          </div>
        </div>
        <div className="notice-box-content">
          {noticeList.length > 0 ? (
            noticeList.map(notice => {
              const author = notice.teacherName || notice.author || notice.writer || notice.authorName || notice.userName || notice.name || '관리자';
              return (
                <div key={notice.id} className="notice-item" onClick={() => handleNoticeClick(notice)}>
                  <div className="notice-item-title">{notice.title}</div>
                  <div className="notice-item-author">{author}</div>
                </div>
              );
            })
          ) : (
            <div className="empty-notice-text">
              공지사항이 없습니다.
            </div>
          )}
        </div>
      </div>
      {/* 공지사항 상세 모달 */}
      {showModal && selectedNotice && (
        <div className="notice-modal-overlay" onClick={handleCloseModal}>
          <div className="notice-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="notice-modal-header">
              <h3 className="notice-modal-title">{selectedNotice.title}</h3>
              <button className="notice-modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <div className="notice-modal-info">
              <div className="notice-info-box">
                <span className="info-label">작성자</span>
                <span className="info-value author-name">
                  {selectedNotice.teacherName || selectedNotice.author || selectedNotice.writer || selectedNotice.authorName || selectedNotice.userName || selectedNotice.name || '관리자'}
                </span>
              </div>
            </div>
            <div className="notice-modal-body">
              <div className="notice-content-box">
                <div className="notice-modal-text">
                  {selectedNotice.content}
                </div>
              </div>
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
            fetchNotices();
          }, 500);
        }}
        initialType="공지"
        isClassroomContext={false}
      />
    </div>
  );
};

export default NoticeCard;