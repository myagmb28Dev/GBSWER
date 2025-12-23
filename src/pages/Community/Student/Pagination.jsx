const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages === 0) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 10;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 4);
      const end = Math.min(totalPages, start + maxVisible - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-0 pd-10">
      <button 
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded border transition-colors ${
          currentPage === 1 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'hover:bg-gray-100 text-gray-700'
        }`}
      >
        {'<'}
      </button>
      
      {getPageNumbers().map((page) => (
        <button 
          key={page} 
          onClick={() => onPageChange(page)} 
          className={`px-3 py-1 rounded transition-colors ${
            currentPage === page
              ? 'bg-teal-500 text-white' 
              : 'border hover:bg-gray-100 text-gray-700'
          }`}
        >
          {page}
        </button>
      ))}
      
      <button 
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded border transition-colors ${
          currentPage === totalPages 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'hover:bg-gray-100 text-gray-700'
        }`}
      >
        {'>'}
      </button>
    </div>
  );
};

export default Pagination;