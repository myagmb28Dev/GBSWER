import React, { useState, useEffect } from 'react';
import './NoticeCard.css';
import { getTodayNoticeData } from '../../mocks/mockNotice';

const NoticeCard = () => {
  const [noticeList, setNoticeList] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const noticeData = getTodayNoticeData();
    setNoticeList(noticeData);
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
        </div>
        
        <div className="notice-box-content">
          {noticeList.length > 0 ? (
            noticeList.map(notice => (
              <div key={notice.id} className="notice-item" onClick={() => handleNoticeClick(notice)}>
                <div className="notice-item-title">{notice.title}</div>
                <div className="notice-item-author">{notice.author}</div>
              </div>
            ))
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
                <span className="info-value author-name">{selectedNotice.author}</span>
              </div>
              <div className="notice-info-box">
                <span className="info-value">{selectedNotice.targetClass}</span>
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
    </div>
  );
};

export default NoticeCard;