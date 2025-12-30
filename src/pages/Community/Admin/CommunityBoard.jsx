import { useState, useEffect, useCallback } from "react";
import axios from 'axios';
import { Plus } from "lucide-react";
import CommunityWriteModal from "../../../components/CommunityWriteModal/CommunityWriteModal";
import ReadPostModal from "./ReadPostModal";
import CommunityPostTable from "../../../components/CommunityPostTable/CommunityPostTable";
import CommunityPagination from "../../../components/CommunityPagination/CommunityPagination";
import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";


const CommunityBoard = () => {
  const [posts, setPosts] = useState([]);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [showReadModal, setShowReadModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editPost, setEditPost] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch posts from server
  const fetchPosts = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get(`/api/community/?page=${currentPage - 1}&size=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const postsData = Array.isArray(res.data) ? res.data : (res.data?.data?.content || []);
      
      // 익명 게시물 처리 (bit(1) 타입 고려)
      const processedPosts = postsData.map(post => {
        // MySQL bit(1) 타입: 1(true), 0(false) 또는 Buffer 값도 가능
        const isAnonymous = post.anonymous === true ||
                           post.anonymous === 'true' ||
                           post.anonymous === 1 ||
                           post.anonymous === '1' ||
                           post.anonymous === '0x01' || // Buffer 형태
                           (typeof post.anonymous === 'object' && post.anonymous?.[0] === 1); // Buffer [1]

        const displayWriter = isAnonymous ? '익명' : (post.writer || '알 수 없음');

        return {
          ...post,
          displayWriter
        };
      });
      setPosts(processedPosts);
    } catch (err) {
      // 백엔드 연결 실패 시 빈 목록 표시
      setPosts([]);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);


  const postsPerPage = 10;

  const handleWritePost = async (postData) => {
    // 새 글 작성 후 목록 새로고침
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      const form = new FormData();
      
      // 관리자는 선택한 targetMajor를 사용 (all이면 ALL로 변환)
      const major = (postData.targetMajor === 'all' || !postData.targetMajor) ? 'ALL' : postData.targetMajor;
      
      // 새로운 API 형식: dto 파트에 JSON 문자열로 전송 (Blob으로 변환하여 Content-Type 명시)
      const dto = {
        title: postData.title || '',
        content: postData.content || '',
        major: major,
        anonymous: Boolean(postData.anonymous ?? false)
      };
      console.log('📤 Community Write DTO:', dto);
      const dtoBlob = new Blob([JSON.stringify(dto)], { type: 'application/json' });
      form.append('dto', dtoBlob);
      
      // 파일 첨부 - files 파트로 전송
      if (postData.attachments && postData.attachments.length > 0) {
        postData.attachments.forEach((att) => {
          form.append('files', att.file);
        });
      }

      // 게시글 작성 API 호출
      await axios.post('/api/community/write', form, {
        headers: {
          Authorization: `Bearer ${token}`
          // Content-Type은 axios가 자동으로 설정 (boundary 포함)
        }
      });

      // 작성 완료 후 페이지 새로고침으로 최신 데이터 반영
      setShowWriteModal(false);
      window.location.reload();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      alert('게시글 작성 실패: ' + errorMsg);
    }
  };
  
  const handleReadPost = async (post) => {
    setSelectedPost(post);
    setShowReadModal(true);
  };

  const handleDeletePost = async (postId) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`/api/community/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // 삭제 완료 후 페이지 새로고침으로 최신 데이터 반영
      setShowReadModal(false);
      window.location.reload();
    } catch (err) {
      alert('게시글 삭제 실패: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEditPost = (post) => {
    // 수정용 데이터 준비 (익명 값 변환)
    const editData = {
      ...post,
      anonymous: post.anonymous === true || post.anonymous === 'true' ||
                post.anonymous === 1 || post.anonymous === '1' ||
                (typeof post.anonymous === 'object' && post.anonymous?.[0] === 1)
    };

    setEditPost(editData);
    setIsEditMode(true);
    setShowWriteModal(true);
  };

  const handleEditSubmit = async (postData) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      const form = new FormData();
      
      // 관리자는 선택한 targetMajor를 사용 (all이면 ALL로 변환)
      const major = (postData.targetMajor === 'all' || !postData.targetMajor) ? 'ALL' : postData.targetMajor;
      
      // 새로운 API 형식: dto 파트에 JSON 문자열로 전송 (Blob으로 변환하여 Content-Type 명시)
      const dto = {
        title: postData.title || '',
        content: postData.content || '',
        major: major,
        anonymous: Boolean(postData.anonymous ?? false)
      };
      console.log('📤 Community Edit DTO:', dto);
      const dtoBlob = new Blob([JSON.stringify(dto)], { type: 'application/json' });
      form.append('dto', dtoBlob);

      // 파일 첨부 - files 파트로 전송
      if (postData.attachments && postData.attachments.length > 0) {
        postData.attachments.forEach((att) => {
          form.append('files', att.file);
        });
      }

      // 게시글 수정 API 호출
      await axios.put(`/api/community/${editPost.id}`, form, {
        headers: {
          Authorization: `Bearer ${token}`
          // Content-Type은 axios가 자동으로 설정 (boundary 포함)
        }
      });

      // 수정 완료 후 페이지 새로고침으로 최신 데이터 반영
      setShowWriteModal(false);
      setShowReadModal(false);
      setIsEditMode(false);
      setEditPost(null);
      window.location.reload();
    } catch (err) {
      alert('게시글 수정 실패: ' + (err.response?.data?.message || err.message));
    }
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
          
          {/* Admin Controls */}
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-medium text-blue-800 mb-2">관리자 기능</h3>
            <p className="text-xs text-blue-600">게시물 관리 및 삭제 권한이 있습니다.</p>
          </div>
          
          {/* Post Table */}
          <div className="overflow-hidden flex-1">
            <CommunityPostTable posts={currentPosts} onPostClick={handleReadPost} />
          </div>
          
          {/* Pagination */}
          <div className="mt-6 mb-3 flex-shrink-0">
            <CommunityPagination 
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
      <CommunityWriteModal
        isOpen={showWriteModal}
        onClose={() => {
          setShowWriteModal(false);
          setIsEditMode(false);
          setEditPost(null);
        }}
        onSubmit={isEditMode ? handleEditSubmit : handleWritePost}
        isAdmin={true}
        initialData={isEditMode ? editPost : null}
        isEdit={isEditMode}
      />
      <ReadPostModal
        isOpen={showReadModal}
        onClose={() => setShowReadModal(false)}
        post={selectedPost}
        onDelete={handleDeletePost}
        isAdmin={true}
        onEdit={(post) => handleEditPost(selectedPost)}
      />

    </div>
  );
};

export default CommunityBoard;