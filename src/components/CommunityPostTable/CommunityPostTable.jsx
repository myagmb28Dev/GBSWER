import { File } from "lucide-react";
import CommunityEmptyState from "../CommunityEmptyState/CommunityEmptyState";

const CommunityPostTable = ({ posts, onPostClick }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      {/* Table Header */}
      <div className="bg-teal-500 px-4 md:px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4 md:gap-8 text-white font-medium text-xs md:text-sm flex-1">
          <span className="w-20 md:w-28">작성일</span>
          <span className="flex-1">제목</span>
          <span className="w-16 md:w-24 text-center">학과</span>
          <span className="w-16 md:w-24 text-center">작성자</span>
          <span className="w-12 md:w-20 text-center">조회수</span>
        </div>
      </div>
      
      {/* Table Body */}
      {posts.length === 0 ? (
        <div className="h-64 flex items-center justify-center">
          <CommunityEmptyState />
        </div>
      ) : (
        <div>
          {posts.map((post) => (
            <div 
              key={post.id}
              className="px-4 md:px-6 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center gap-4 md:gap-8 transition-colors" 
              onClick={() => onPostClick(post)}
            >
              <span className="w-20 md:w-28 text-xs md:text-sm text-gray-600">{post.createdAt ? post.createdAt.split('T')[0] : ''}</span>
              <div className="flex-1 flex items-center gap-2">
                <span className="text-xs md:text-sm text-gray-800 hover:text-teal-600 transition-colors truncate">
                  {post.title}
                </span>
                {post.files && post.files.length > 0 && (
                  <File size={14} className="text-gray-400 flex-shrink-0" />
                )}
              </div>
              <span className="w-16 md:w-24 text-xs md:text-sm text-gray-600 text-center">{post.major || '전체'}</span>
              <span className="w-16 md:w-24 text-xs md:text-sm text-gray-600 text-center">{post.displayWriter || post.writer}</span>
              <span className="w-12 md:w-20 text-xs md:text-sm text-gray-600 text-center">{post.viewCount}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityPostTable;