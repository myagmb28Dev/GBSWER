import React, { useState } from 'react';
import { X } from 'lucide-react';
import './PostWriteModal.css';

const PostWriteModal = ({ isOpen, onClose, onSubmit, classId }) => {
  const [postType, setPostType] = useState('공지'); // '공지' or '과제'
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [deadline, setDeadline] = useState('');
  const [submissionScope, setSubmissionScope] = useState('마감 자율'); // '기한 이후 제출 마감' or '마감 자율'

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    if (postType === '과제' && !deadline) {
      alert('과제의 기한을 설정해주세요.');
      return;
    }

    const newPost = {
      id: Date.now(),
      title: title.trim(),
      content: content.trim(),
      type: postType,
      date: new Date().toISOString().split('T')[0],
      ...(postType === '과제' && {
        deadline,
        submissionScope,
        submitted: false
      })
    };

    onSubmit(newPost);
    handleReset();
  };

  const handleReset = () => {
    setTitle('');
    setContent('');
    setDeadline('');
    setSubmissionScope('마감 자율');
    setPostType('공지');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="post-write-overlay" onClick={handleClose}>
      <div className="post-write-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={handleClose}>
          <X size={24} />
        </button>

        <h2 className="modal-title">글 작성</h2>

        <form onSubmit={handleSubmit} className="write-form">
          {/* 타입 스위치 */}
          <div className="type-switch">
            <label className="switch-label">
              <input
                type="radio"
                name="postType"
                value="공지"
                checked={postType === '공지'}
                onChange={(e) => setPostType(e.target.value)}
              />
              <span className={`switch-text ${postType === '공지' ? 'active' : ''}`}>공지</span>
            </label>
            <label className="switch-label">
              <input
                type="radio"
                name="postType"
                value="과제"
                checked={postType === '과제'}
                onChange={(e) => setPostType(e.target.value)}
              />
              <span className={`switch-text ${postType === '과제' ? 'active' : ''}`}>과제</span>
            </label>
          </div>

          {/* 제목 */}
          <div className="form-group">
            <label htmlFor="title">제목</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              className="input-field"
            />
          </div>

          {/* 내용 */}
          <div className="form-group">
            <label htmlFor="content">내용</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력하세요"
              className="textarea-field"
              rows="6"
            />
          </div>

          {/* 과제 전용 필드 */}
          {postType === '과제' && (
            <>
              <div className="form-group">
                <label htmlFor="deadline">기한</label>
                <input
                  type="date"
                  id="deadline"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label>수용범위</label>
                <div className="scope-options">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="submissionScope"
                      value="기한 이후 제출 마감"
                      checked={submissionScope === '기한 이후 제출 마감'}
                      onChange={(e) => setSubmissionScope(e.target.value)}
                    />
                    <span>기한 이후 제출 마감</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="submissionScope"
                      value="마감 자율"
                      checked={submissionScope === '마감 자율'}
                      onChange={(e) => setSubmissionScope(e.target.value)}
                    />
                    <span>마감 자율</span>
                  </label>
                </div>
              </div>
            </>
          )}

          {/* 버튼 */}
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={handleClose}>
              취소
            </button>
            <button type="submit" className="btn-submit">
              작성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostWriteModal;
