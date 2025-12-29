import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './CommunityWritePage.css';

const CommunityWritePage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');

  const handleSubmit = () => {
    if (title.trim() && content.trim() && author.trim()) {
      // 게시물 저장 로직 (실제로는 API 호출)
      console.log('게시물 작성:', { title, content, author });
      navigate('/community');
    } else {
      alert('모든 필드를 입력해주세요.');
    }
  };

  const handleCancel = () => {
    navigate('/community');
  };

  return (
    <div className="community-write-page">
      <Header />

      <div className="write-content">
        <div className="write-header">
          <h1 className="write-title">새 글 작성</h1>
        </div>

        <div className="write-form-container">
          <div className="form-group">
            <label htmlFor="author">작성자</label>
            <input
              id="author"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="이름을 입력하세요"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="title">제목</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">내용</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력하세요"
              className="form-textarea"
              rows="15"
            />
          </div>

          <div className="form-actions">
            <button className="btn-cancel" onClick={handleCancel}>
              취소
            </button>
            <button className="btn-submit" onClick={handleSubmit}>
              작성
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CommunityWritePage;
