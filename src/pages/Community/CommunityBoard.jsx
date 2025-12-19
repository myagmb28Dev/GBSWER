import { useState } from "react";
import { Plus } from "lucide-react";
import WritePostModal from "./WritePostModal";
import ReadPostModal from "./ReadPostModal";
import PostTable from "./PostTable";
import Pagination from "./Pagination";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";


const CommunityBoard = () => {
  const [posts, setPosts] = useState([]);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [showReadModal, setShowReadModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [anonymousCount, setAnonymousCount] = useState(0);


  const postsPerPage = 10;

  const handleWritePost = (postData) => {
    const now = new Date();
    let author;
    
    if (postData.isAnonymous) {
      const newCount = anonymousCount + 1;
      author = `익명${newCount}`;
      setAnonymousCount(newCount);
    } else {
      author = "작성자";
    }
    
    const newPost = {
      id: Date.now(),
      date: `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`,
      title: postData.title,
      content: postData.content,
      author: author,
      isAnonymous: postData.isAnonymous,
      attachments: postData.attachments,
      views: 0
    };

    setPosts([newPost, ...posts]);
    setShowWriteModal(false);
    setCurrentPage(1);
  };
  
  const handleReadPost = (post) => {
    const updatedPosts = posts.map(p => 
      p.id === post.id ? { ...p, views: p.views + 1 } : p
    );
    setPosts(updatedPosts);
    setSelectedPost({ ...post, views: post.views + 1 });
    setShowReadModal(true);
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

    </div>
  );
};

export default CommunityBoard;