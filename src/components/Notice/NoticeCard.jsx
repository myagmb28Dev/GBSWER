import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NoticeCard.css';

const NoticeCard = () => {
  const [noticeData, setNoticeData] = useState(null);

  useEffect(() => {
    const fetchTodayNotice = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await axios.get('/api/notices/today', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNoticeData(res.data.data);
      } catch (err) {
        setNoticeData(null);
      }
    };
    fetchTodayNotice();
  }, []);

  if (!noticeData) {
    return <div className="notice-card">로딩 중...</div>;
  }

  return (
    <div className="notice-card">
      <div className="notice-card-header">
        <h3 className="notice-card-title">공지사항</h3>
      </div>

      <div className="notice-card-content">
        <div className="notice-info">
          <div className="notice-author">
            <span className="author-label">작성자:</span>
            <span className="author-name">{noticeData.author}</span>
          </div>
          <div className="notice-title-section">
            <span className="title-label">제목:</span>
            <span className="notice-title">{noticeData.title}</span>
          </div>
        </div>
        <div className="notice-content">
          <div className="content-text">
            {noticeData.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeCard;