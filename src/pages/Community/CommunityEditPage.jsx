import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './CommunityEditPage.css';

const CommunityEditPage = () => {
  const navigate = useNavigate();
  const { postId } = useParams();

  // 임시 데이터 (실제로는 API에서 가져옴)
  const [title, setTitle] = useState('첫 번째 게시물');
  const [content, setContent] = useState('안녕하세요. 첫 번째 게시물입니다.\n\n이것은 게시물의 상세 내용입니다.\n여러 줄의 텍스트를 포함할 수 있습니다.');
  const [author, setAuthor] = useState('김민수');

  const handleSubmit = () => {
    if (title.trim() && content.trim() && author.trim()) {
      // 게시물 수정 로직 (실제로는 API 호출)
      console.log('게시물 수정:', { title, content, author });
      navigate(`/community/read/${postId}`);
    } else {
      alert('모든 필드를 입력해주세요.');
    }
  };

  const handleCancel = () => {
    navigate(`/community/read/${postId}`);
  };

  return (
    <div className="community-edit-page">
      <Header />

      <div className="edit-content">
        <div className="edit-header">
          <h1 className="edit-title">글 수정</h1>
        </div>

        <div className="edit-form-container">
          <div className="form-group">
            <label htmlFor="author">작성자</label>
            <input
              id="author"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="이름을 입력하세요"
              className="form-input"
              disabled
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
              수정
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CommunityEditPage;
