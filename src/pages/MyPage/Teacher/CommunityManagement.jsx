import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './CommunityManagement.css';

const CommunityManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMajor, setSelectedMajor] = useState('컴퓨터공학'); // 선생님 기본 학과
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const postsPerPage = 20;

  // 선생님이 담당하는 학과만 표시 (실제로는 프로필에서 가져와야 함)
  const teacherMajors = ['소프트웨어개발과', '게임개발과', '인공지능소프트웨어과'];

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      let url = `/api/community/?page=${currentPage}&size=${postsPerPage}`;
      if (selectedMajor !== 'ALL') {
        url = `/api/community/major/${encodeURIComponent(selectedMajor)}?page=${currentPage}&size=${postsPerPage}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPosts(response.data?.data?.content || []);
      setTotalPages(response.data?.data?.totalPages || 0);
    } catch (error) {
      console.error('게시물 조회 실패:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedMajor, postsPerPage]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDeletePost = async (postId, title) => {
    if (!window.confirm(`"${title}" 게시물을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`/api/community/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('게시물이 삭제되었습니다.');
      fetchPosts(); // 목록 새로고침
    } catch (error) {
      console.error('게시물 삭제 실패:', error);
      alert('게시물 삭제에 실패했습니다.');
    }
  };

  const handleBulkDelete = async () => {
    const selectedPosts = posts.filter(post => post.selected);
    if (selectedPosts.length === 0) {
      alert('삭제할 게시물을 선택해주세요.');
      return;
    }

    if (!window.confirm(`${selectedPosts.length}개의 게시물을 일괄 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');

      // 선택된 게시물들을 순차적으로 삭제
      for (const post of selectedPosts) {
        await axios.delete(`/api/community/${post.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      alert(`${selectedPosts.length}개의 게시물이 삭제되었습니다.`);
      fetchPosts(); // 목록 새로고침
    } catch (error) {
      console.error('일괄 삭제 실패:', error);
      alert('일괄 삭제에 실패했습니다.');
    }
  };

  const togglePostSelection = (postId) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, selected: !post.selected } : post
      )
    );
  };

  const selectAllPosts = () => {
    const allSelected = posts.every(post => post.selected);
    setPosts(prevPosts =>
      prevPosts.map(post => ({ ...post, selected: !allSelected }))
    );
  };

  return (
    <div className="community-management">
      <div className="header">
        <h2>커뮤니티 관리</h2>
        <div className="controls">
          <select
            value={selectedMajor}
            onChange={(e) => {
              setSelectedMajor(e.target.value);
              setCurrentPage(0);
            }}
            className="major-select"
          >
            {teacherMajors.map(major => (
              <option key={major} value={major}>{major}</option>
            ))}
          </select>

          <button
            onClick={handleBulkDelete}
            className="bulk-delete-btn"
            disabled={!posts.some(post => post.selected)}
          >
            선택 삭제 ({posts.filter(post => post.selected).length})
          </button>
        </div>
      </div>

      <div className="content">
        {loading ? (
          <div className="loading">게시물을 불러오는 중...</div>
        ) : (
          <>
            <div className="posts-header">
              <input
                type="checkbox"
                checked={posts.length > 0 && posts.every(post => post.selected)}
                onChange={selectAllPosts}
                className="select-all-checkbox"
              />
              <span className="header-title">제목</span>
              <span className="header-author">작성자</span>
              <span className="header-major">학과</span>
              <span className="header-date">작성일</span>
              <span className="header-views">조회수</span>
              <span className="header-actions">관리</span>
            </div>

            <div className="posts-list">
              {posts.map(post => (
                <div key={post.id} className="post-item">
                  <input
                    type="checkbox"
                    checked={post.selected || false}
                    onChange={() => togglePostSelection(post.id)}
                    className="post-checkbox"
                  />
                  <div className="post-title">
                    {post.title}
                    {post.anonymous && <span className="anonymous-badge">익명</span>}
                  </div>
                  <div className="post-author">{post.writer}</div>
                  <div className="post-major">{post.major}</div>
                  <div className="post-date">{new Date(post.createdAt).toLocaleDateString()}</div>
                  <div className="post-views">{post.viewCount}</div>
                  <div className="post-actions">
                    <button
                      onClick={() => handleDeletePost(post.id, post.title)}
                      className="delete-btn"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className="page-btn"
                >
                  이전
                </button>
                <span className="page-info">
                  {currentPage + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="page-btn"
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CommunityManagement;
