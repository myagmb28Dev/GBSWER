const CommunityEmptyState = () => {
  return (
    <div className="text-center py-8">
      <div className="text-gray-400 mb-2">
        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p className="text-gray-500 text-sm">아직 작성된 게시물이 없습니다.</p>
      <p className="text-gray-400 text-xs mt-1">첫 번째 게시물을 작성해보세요!</p>
    </div>
  );
};

export default CommunityEmptyState;