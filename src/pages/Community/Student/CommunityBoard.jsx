import { useState, useEffect } from "react";
import axios from 'axios';
import { Plus } from "lucide-react";
import CommunityWriteModal from "../../../components/CommunityWriteModal/CommunityWriteModal";
import CommunityReadModal from "../../../components/CommunityReadModal/CommunityReadModal";
import CommunityPostTable from "../../../components/CommunityPostTable/CommunityPostTable";
import CommunityPagination from "../../../components/CommunityPagination/CommunityPagination";
import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";


const CommunityBoard = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await axios.get('/api/community/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPosts(res.data.data);
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

  const handleWritePost = async (postData) => {
    // 새 글 작성 후 목록 새로고침
    try {
      const token = localStorage.getItem('accessToken');
      const form = new FormData();
      form.append('title', postData.title);
      form.append('content', postData.content);
      form.append('major', 'ALL');
      form.append('isAnonymous', postData.isAnonymous);
      
      // 파일 첨부
      if (postData.attachments && postData.attachments.length > 0) {
        postData.attachments.forEach((att) => {
          form.append('files', att.file);
        });
      }
      
      // 게시글 작성 API 호출
      await axios.post('/api/community/write', form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // 목록 새로고침
      const res = await axios.get('/api/community/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(res.data.data);
      setShowWriteModal(false);
      setCurrentPage(1);
    } catch (err) {
      alert('게시글 작성 실패');
    }
  };
  
  const handleReadPost = async (post) => {
    try {
      const token = localStorage.getItem('accessToken');
      // 조회수 증가 API 호출
      await axios.put(`/api/community/${post.id}/view`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedPost(post);
      setShowReadModal(true);
    } catch (err) {
      console.error('조회수 업데이트 실패:', err);
      setSelectedPost(post);
      setShowReadModal(true);
    }
  };

  const totalPages = Math.ceil(posts.length / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

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
        onClose={() => setShowWriteModal(false)} 
        onSubmit={handleWritePost}
      />
      <CommunityReadModal 
        isOpen={showReadModal} 
        onClose={() => setShowReadModal(false)} 
        post={selectedPost} 
      />

    </div>
  );
};

export default CommunityBoard;