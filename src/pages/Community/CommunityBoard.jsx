<<<<<<< HEAD
import { useState, useEffect } from "react";
import axiosInstance from '../../api/axiosInstance';
import { Plus } from "lucide-react";
import WritePostModal from "./WritePostModal";
import ReadPostModal from "./ReadPostModal";
import PostTable from "../components/CommunityPostTable/CommunityPostTable";
import Pagination from "./Pagination";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";


const CommunityBoard = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axiosInstance.get('/api/community/');
        const payload = res.data?.data ?? res.data;
        // API 명세서 기준: CommunityDto { id, title, content, writer, createdAt, viewCount, major, files, anonymous }
        const mapCommunity = (item) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          writer: item.writer ?? '',
          createdAt: item.createdAt ?? '',
          viewCount: item.viewCount ?? 0,
          major: item.major,
          files: Array.isArray(item.files) ? item.files : [],
          anonymous: item.anonymous ?? false
        });
        if (Array.isArray(payload)) setPosts(payload.map(mapCommunity));
        else if (payload?.content && Array.isArray(payload.content)) setPosts(payload.content.map(mapCommunity));
        else setPosts([]);
      } catch (err) {
        console.error('게시글 목록 불러오기 실패:', err);
      }
    };
    fetchPosts();
  }, []);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [showReadModal, setShowReadModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [anonymousCount, setAnonymousCount] = useState(0);


  const postsPerPage = 10;

  const handleWritePost = async (newPost) => {
    // 새 글 작성 후 목록 새로고침
    try {
      const res = await axiosInstance.get('/api/community/');
      setPosts(res.data.data);
      setShowWriteModal(false);
      setCurrentPage(1);
    } catch (err) {
      alert('게시글 목록 갱신 실패');
    }
  };
  
  const handleReadPost = async (post) => {
    // 조회수 증가는 ReadPostModal에서 처리하므로 여기서는 모달만 열기
    setSelectedPost(post);
    setShowReadModal(true);
  };

  const safePosts = Array.isArray(posts) ? posts : [];
  const totalPages = Math.ceil(safePosts.length / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = safePosts.slice(indexOfFirstPost, indexOfLastPost);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getCurrentDate = () => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate()
    };
  };

  const { year, month, day } = getCurrentDate();

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="bg-gray-50 flex-1 flex flex-col overflow-auto community-board">
        <main className="max-w-7xl mx-auto w-full h-full flex flex-col px-4 md:px-8 pt-6 pb-4">
          {/* Date Display */}
          <div className="mb-4">
            <p className="text-gray-400 text-sm mb-1">{year}년</p>
            <h2 className="text-2xl md:text-3xl font-bold">{month}월 {day}일</h2>
          </div>
          
          {/* Post Table */}
          <div className="overflow-hidden flex-1">
            <PostTable posts={currentPosts} onPostClick={handleReadPost} />
          </div>
          
          {/* Pagination */}
          <div className="mt-6 mb-3 flex-shrink-0">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </main>
        <div className="flex-shrink-0">
          <Footer />
        </div>
      </div>
      
      {/* Floating Write Button */}
      <button 
        onClick={() => setShowWriteModal(true)}
        className="fixed bottom-8 right-8 bg-teal-500 text-white p-4 rounded-full shadow-lg hover:bg-teal-600 transition-all hover:scale-110 z-40"
        aria-label="게시물 작성"
      >
        <Plus size={24} />
      </button>

      {/* Modals */}
      <WritePostModal 
        isOpen={showWriteModal} 
        onClose={() => setShowWriteModal(false)} 
        onSubmit={handleWritePost}
      />
      <ReadPostModal 
        isOpen={showReadModal} 
        onClose={() => setShowReadModal(false)} 
        post={selectedPost} 
      />

=======
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './CommunityBoard.css';

const CommunityBoard = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([
    {
      id: 1,
      date: '2025.01.17',
      title: '첫 번째 게시물입니다. 안녕하세요.',
      author: '김민수',
      views: 125
    },
    {
      id: 2,
      date: '2025.01.17',
      title: '두 번째 게시물입니다. 반갑습니다.',
      author: '이지은',
      views: 98
    },
    {
      id: 3,
      date: '2025.01.17',
      title: '세 번째 게시물입니다. 환영합니다.',
      author: '박준호',
      views: 87
    },
    {
      id: 4,
      date: '2025.01.17',
      title: '네 번째 게시물입니다. 좋은 하루.',
      author: '최서연',
      views: 76
    },
    {
      id: 5,
      date: '2025.01.17',
      title: '다섯 번째 게시물입니다. 화이팅.',
      author: '정우진',
      views: 65
    },
    {
      id: 6,
      date: '2025.01.17',
      title: '여섯 번째 게시물입니다. 파이팅.',
      author: '한소영',
      views: 54
    },
    {
      id: 7,
      date: '2025.01.17',
      title: '일곱 번째 게시물입니다. 화이팅.',
      author: '윤태현',
      views: 43
    },
    {
      id: 8,
      date: '2025.01.17',
      title: '여덟 번째 게시물입니다. 파이팅.',
      author: '강민지',
      views: 32
    },
    {
      id: 9,
      date: '2025.01.17',
      title: '아홉 번째 게시물입니다. 화이팅.',
      author: '조현우',
      views: 21
    },
    {
      id: 10,
      date: '2025.01.17',
      title: '열 번째 게시물입니다. 파이팅.',
      author: '신예린',
      views: 10
    }
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 8;

  const totalPages = Math.ceil(posts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const displayedPosts = posts.slice(startIndex, startIndex + postsPerPage);

  const handlePostClick = (postId) => {
    navigate(`/community/read/${postId}`);
  };

  const handleWriteClick = () => {
    navigate('/community/write');
  };

  return (
    <div className="community-board">
      <Header />

      <div className="community-content">
        <div className="community-date-display">
          <p className="community-year-text">2025년</p>
          <h2 className="community-date-text">12월 25일</h2>
        </div>

        <div className="community-posts-table-wrapper">
          <table className="community-posts-table">
            <thead>
              <tr>
                <th className="community-col-date">작성일</th>
                <th className="community-col-title">제목</th>
                <th className="community-col-author">작성자</th>
                <th className="community-col-views">조회수</th>
              </tr>
            </thead>
            <tbody>
              {displayedPosts.map((post) => (
                <tr key={post.id} onClick={() => handlePostClick(post.id)} className="post-row">
                  <td className="community-col-date">{post.date}</td>
                  <td className="community-col-title">{post.title}</td>
                  <td className="community-col-author">{post.author}</td>
                  <td className="community-col-views">{post.views}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="community-pagination">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="community-pagination-btn"
          >
            이전
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`community-pagination-btn ${currentPage === page ? 'active' : ''}`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="community-pagination-btn"
          >
            다음
          </button>
        </div>

        <div className="community-write-button-wrapper">
          <button className="community-write-button" onClick={handleWriteClick}>
            +
          </button>
        </div>
      </div>

      <Footer />
>>>>>>> 81ca26b (커뮤니티 페이지 및 사이드바 수정: 페이지당 8개 게시물, 테이블 크기 조정, 수정 모드 개선)
    </div>
  );
};

<<<<<<< HEAD
export default CommunityBoard;
=======
export default CommunityBoard;
>>>>>>> 81ca26b (커뮤니티 페이지 및 사이드바 수정: 페이지당 8개 게시물, 테이블 크기 조정, 수정 모드 개선)
