import { X, File } from 'lucide-react';

const CommunityReadModal = ({ isOpen, onClose, post }) => {
    const handleDownload = (attachment) => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

if (!isOpen || !post) return null;
const imageAttachments = post.attachments?.filter(att => att.type.startsWith('image/')) || [];
const fileAttachments = post.attachments?.filter(att => !att.type.startsWith('image/')) || [];

return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-xl md:max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 md:p-6 border-b">
                <h3 className="text-xl md:text-2xl font-bold">{post.title}</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                    <X size={24} />
                </button>
            </div>
            <div className="p-4 md:p-6">
                <div className="flex justify-between items-center mb-4 pb-4 border-b">
                    <div className="flex gap-4 text-sm text-gray-600">
                        <span>작성자: {post.author}</span>
                        <span>작성일: {post.date}</span>
                        <span>조회수: {post.views}</span>
                    </div>
                </div>
                
                <div className="prose max-w-none mb-6">
                    <p className="whitespace-pre-wrap">{post.content || '내용이 없습니다.'}</p>
                </div>
                
                {/* 이미지 미리보기 */}
                {imageAttachments.length > 0 && ( <div className="border-t pt-4 mb-4">
                    <h4 className="text-sm font-medium mb-3">이미지 ({imageAttachments.length})</h4>
                    <div className="grid grid-cols-2 gap-3">
                        {imageAttachments.map((att) => (
                            <div key={att.id} className="border rounded-lg overflow-hidden">
                                <img src={att.url} alt={att.name} className="w-full h-48 object-cover cursor-pointer hover:opacity-90"
                                onClick={() => window.open(att.url, '_blank')} />
                                <div className="p-2 bg-gray-50">
                                    <p className="text-xs text-gray-600 truncate">{att.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* 파일 다운로드 */}
            {fileAttachments.length > 0 && (
            <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3">첨부파일 ({fileAttachments.length})</h4>
                <div className="space-y-2"> {fileAttachments.map((att) => (
                    <div key={att.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer" onClick={() => handleDownload(att)} >
                        <div className="flex items-center gap-3">
                            <File size={20} className="text-gray-500" />
                            <span className="text-sm">{att.name}</span>
                        </div>
                        <span className="text-xs text-teal-600 font-medium">다운로드</span>
                    </div>
                ))}
            </div>
        </div>
    )}
        </div>
        <div className="flex justify-end p-4 md:p-6 border-t">
            <button onClick={onClose} className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300" > 닫기 </button>
        </div>
    </div>
</div>
);
};

export default CommunityReadModal;