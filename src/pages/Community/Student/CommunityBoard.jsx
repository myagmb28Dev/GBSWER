import { useState, useEffect, useCallback } from "react";
import axios from 'axios';
import { Plus } from "lucide-react";
import CommunityWriteModal from "../../../components/CommunityWriteModal/CommunityWriteModal";
import ReadPostModal from "./ReadPostModal";
import CommunityPostTable from "../../../components/CommunityPostTable/CommunityPostTable";
import CommunityPagination from "../../../components/CommunityPagination/CommunityPagination";
import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import { useAppContext } from "../../../App";


const CommunityBoard = () => {
  const { profile, fetchProfile } = useAppContext();
  const [posts, setPosts] = useState([]);

  const [showWriteModal, setShowWriteModal] = useState(false);
  const [showReadModal, setShowReadModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // 프로필이 없으면 자동으로 로드
  useEffect(() => {
    if (!profile) {
      console.log('🔄 프로필이 없어서 자동으로 로드합니다...');
      fetchProfile();
    }
  }, [profile, fetchProfile]);

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

  // 학생 유저의 학과 정보 추출 (프로필 모달의 major 필드 사용)
  const getUserMajor = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.warn('⚠️ 토큰이 없습니다.');
        return 'ALL';
      }

      // 항상 API에서 최신 프로필 데이터 가져오기
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('/api/user/profile', config);
      const profileData = res.data.data;
      
      console.log('🔍 프로필 원본 데이터:', profileData);
      
      // 다양한 필드명에서 학과 정보 추출
      const major = profileData.major || profileData.department || profileData.majorName || profileData.dept || profileData.majorTitle || '';
      const trimmedMajor = major ? String(major).trim() : '';
      
      console.log('🔍 추출된 학과 (trim 전):', major);
      console.log('🔍 추출된 학과 (trim 후):', trimmedMajor);
      
      if (trimmedMajor && trimmedMajor !== '' && trimmedMajor !== 'ALL' && trimmedMajor !== 'null' && trimmedMajor !== 'undefined') {
        console.log('✅ 최종 학과:', trimmedMajor);
        return trimmedMajor;
      } else {
        console.warn('⚠️ 학과 정보를 찾을 수 없습니다.');
        console.warn('⚠️ 프로필 전체 데이터:', JSON.stringify(profileData, null, 2));
        return 'ALL';
      }
    } catch (err) {
      console.error('❌ 프로필 조회 실패:', err);
      console.error('❌ 에러 상세:', err.response?.data || err.message);
      return 'ALL';
    }
  };

  const handleWritePost = async (postData) => {
    // 새 글 작성 후 목록 새로고침
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      // 사용자 학과 정보 추출 (프로필 모달의 major 필드에서)
      const userMajor = await getUserMajor();
      
      if (!userMajor || userMajor === 'ALL') {
        alert('학과 정보를 찾을 수 없습니다. 프로필을 확인해주세요.');
        return;
      }


      const form = new FormData();
      
      // 새로운 API 형식: dto 파트에 JSON 문자열로 전송 (Blob으로 변환하여 Content-Type 명시)
      const dto = {
        title: postData.title || '',
        content: postData.content || '',
        major: userMajor,
        anonymous: Boolean(postData.anonymous ?? false)
      };
      console.log('📤 Community Write DTO:', dto);
      console.log('📤 전송되는 학과:', userMajor);
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

      // localStorage에 저장 (새로고침 후에도 확인 가능)
      localStorage.setItem('lastCommunityMajor', userMajor);
      localStorage.setItem('lastCommunitySubmitTime', new Date().toISOString());
      localStorage.setItem('lastCommunityDTO', JSON.stringify(dto));

      // 제출 성공 후 학과 정보 표시 (새로고침 전에 확인 가능)
      alert(`✅ 게시글이 작성되었습니다!\n\n전송된 학과: ${userMajor}\n\n확인 후 페이지가 새로고침됩니다.`);
      
      // 작성 완료 후 페이지 새로고침으로 최신 데이터 반영
      setShowWriteModal(false);
      window.location.reload();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      alert('게시글 작성 실패: ' + errorMsg);
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
      <ReadPostModal
        isOpen={showReadModal}
        onClose={() => setShowReadModal(false)}
        post={selectedPost}
      />

    </div>
  );
};

export default CommunityBoard;