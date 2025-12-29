import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './CommunityReadPage.css';

const CommunityReadPage = () => {
  const navigate = useNavigate();
  const { postId } = useParams();

  // 임시 데이터 (실제로는 API에서 가져옴)
  const [post] = useState({
    id: postId,
    title: '첫 번째 게시물',
    author: '김민수',
    date: '2024-12-25',
    views: 125,
    likes: 8,
    comments: 3,
    content: '안녕하세요. 첫 번째 게시물입니다.\n\n이것은 게시물의 상세 내용입니다.\n여러 줄의 텍스트를 포함할 수 있습니다.'
  });

  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([
    { id: 1, author: '이지은', date: '2024-12-25', text: '좋은 글 감사합니다!' },
    { id: 2, author: '박준호', date: '2024-12-25', text: '공감합니다.' }
  ]);

  const handleAddComment = () => {
    if (commentText.trim()) {
      setComments([
        ...comments,
        {
          id: comments.length + 1,
          author: '현재사용자',
          date: new Date().toISOString().split('T')[0],
          text: commentText
        }
      ]);
      setCommentText('');
    }
  };

  const handleEdit = () => {
    navigate(`/community/edit/${postId}`);
  };

  const handleDelete = () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      navigate('/community');
    }
  };

  const handleBack = () => {
    navigate('/community');
  };

  return (
    <div className="community-read-page">
      <Header />

      <div className="community-read-content">
        <button className="community-back-button" onClick={handleBack}>
          ← 목록으로
        </button>

        <div className="community-post-header">
          <div className="community-post-header-top">
            <div>
              <h1 className="community-post-title">{post.title}</h1>
              <div className="community-post-meta">
                <span className="community-meta-item">작성자: {post.author}</span>
                <span className="community-meta-item">작성일: {post.date}</span>
                <span className="community-meta-item">조회: {post.views}</span>
              </div>
            </div>
            <div className="community-post-actions">
              <button className="community-action-btn community-edit-btn" onClick={handleEdit}>
                수정
              </button>
              <button className="community-action-btn community-delete-btn" onClick={handleDelete}>
                삭제
              </button>
            </div>
          </div>
        </div>

        <div className="community-post-content">
          {post.content}
        </div>

        <div className="community-post-stats">
          <span className="community-stat-item">👍 좋아요 {post.likes}</span>
          <span className="community-stat-item">💬 댓글 {comments.length}</span>
        </div>

        <div className="community-comments-section">
          <h2 className="community-comments-title">댓글 ({comments.length})</h2>

          <div className="community-comment-write">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="댓글을 입력하세요"
              className="community-comment-input"
              rows="3"
            />
            <button className="community-comment-submit-btn" onClick={handleAddComment}>
              댓글 작성
            </button>
          </div>

          <div className="community-comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="community-comment-item">
                <div className="community-comment-header">
                  <span className="community-comment-author">{comment.author}</span>
                  <span className="community-comment-date">{comment.date}</span>
                </div>
                <div className="community-comment-text">
                  {comment.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CommunityReadPage;
