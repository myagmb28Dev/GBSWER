import { useEffect, useState } from 'react';
import { X, File, Edit, Trash } from 'lucide-react';
import axios from 'axios';
import WritePostModal from './WritePostModal';

const ReadPostModal = ({ isOpen, onClose, post }) => {
    const [postData, setPostData] = useState(post);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            if (!isOpen || !post?.id) return;
            try {
                const token = localStorage.getItem('accessToken');
                const res = await axios.get(`/api/community/${post.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPostData(res.data.data);
            } catch (err) {
                console.error('게시글 조회 실패:', err);
            }
        };
        fetchPost();
    }, [isOpen, post]);

    const handleDownload = (attachment) => {
        const link = document.createElement('a');
        link.href = attachment.url;
        link.download = attachment.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDelete = async () => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return;
        try {
            const token = localStorage.getItem('accessToken');
            await axios.delete(`/api/community/${postData.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('삭제되었습니다.');
            onClose();
        } catch (err) {
            alert('삭제 실패');
        }
    };

    const handleEdit = () => {
        setShowEditModal(true);
    };

    const handleEditSubmit = async (updatedPost) => {
        try {
            const token = localStorage.getItem('accessToken');
            const form = new FormData();
            form.append('title', updatedPost.title);
            form.append('content', updatedPost.content);
            form.append('major', postData.major || 'ALL');
            updatedPost.attachments?.forEach((att) => {
                form.append('files', att.file);
            });
            await axios.put(`/api/community/${postData.id}`, form, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('수정되었습니다.');
            setShowEditModal(false);
            onClose();
        } catch (err) {
            alert('수정 실패');
        }
    };

    if (!isOpen || !postData) return null;
    const imageAttachments = postData.attachments?.filter(att => att.type.startsWith('image/')) || [];
    const fileAttachments = postData.attachments?.filter(att => !att.type.startsWith('image/')) || [];

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-xl md:max-w-2xl max-h-[85vh] overflow-y-auto">
                    <div className="flex justify-between items-center p-4 md:p-6 border-b">
                        <h3 className="text-xl md:text-2xl font-bold">{postData.title}</h3>
                        <div className="flex gap-2">
                            <button onClick={handleEdit} className="text-gray-500 hover:text-teal-600 p-1 rounded transition-all" title="수정">
                                <Edit size={22} />
                            </button>
                            <button onClick={handleDelete} className="text-gray-500 hover:text-red-500 p-1 rounded transition-all" title="삭제">
                                <Trash size={22} />
                            </button>
                            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1 rounded transition-all" title="닫기">
                                <X size={24} />
                            </button>
                        </div>
                    </div>
                    <div className="p-4 md:p-6">
                        <div className="flex justify-between items-center mb-4 pb-4 border-b">
                            <div className="flex gap-4 text-sm text-gray-600">
                                <span>작성자: {postData.author}</span>
                                <span>작성일: {postData.date}</span>
                                <span>조회수: {postData.views}</span>
                            </div>
                        </div>
                        <div className="prose max-w-none mb-6">
                            <p className="whitespace-pre-wrap">{postData.content || '내용이 없습니다.'}</p>
                        </div>
                        {/* 이미지 미리보기 */}
                        {imageAttachments.length > 0 && (
                            <div className="border-t pt-4 mb-4">
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
                                <div className="space-y-2">
                                    {fileAttachments.map((att) => (
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
            {showEditModal && (
                <WritePostModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onSubmit={handleEditSubmit}
                    initialData={postData}
                />
            )}
        </>
    );
};

export default ReadPostModal;