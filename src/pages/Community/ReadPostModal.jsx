import { useEffect, useState } from 'react';
import { X, File, Edit, Trash } from 'lucide-react';
import axios from 'axios';
import WritePostModal from './WritePostModal';

const ReadPostModal = ({ isOpen, onClose, post }) => {
    const [postData, setPostData] = useState(post);
    const [showEditModal, setShowEditModal] = useState(false);

    // post prop이 변경되면 postData도 업데이트
    useEffect(() => {
        if (post) {
            setPostData(post);
        }
    }, [post]);

    useEffect(() => {
        const fetchPost = async () => {
            if (!isOpen || !post?.id) return;
            try {
                const token = localStorage.getItem('accessToken');
                // 먼저 조회수 증가 API 호출
                try {
                    await axios.put(`/api/community/${post.id}/view`, {}, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                } catch (viewErr) {
                    // 404 등 무시하고 계속 진행
                    console.log('조회수 증가 API 호출 실패 (무시):', viewErr);
                }
                // 상세 조회
                const res = await axios.get(`/api/community/${post.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const payload = res.data?.data ?? res.data;
                console.log('상세 게시글 API 응답 원본:', res.data);
                console.log('상세 게시글 payload:', payload);
                // API 명세서 기준: CommunityDto { id, title, content, writer, createdAt, viewCount, major, files, anonymous }
                // FileInfoDto: { url, name }
                const mapped = {
                    id: payload.id,
                    title: payload.title,
                    content: payload.content,
                    writer: payload.writer ?? '',
                    createdAt: payload.createdAt ?? '',
                    viewCount: payload.viewCount ?? 0,
                    major: payload.major,
                    files: Array.isArray(payload.files) ? payload.files : [],
                    anonymous: payload.anonymous ?? false
                };
                console.log('매핑된 postData:', mapped);
                setPostData(mapped);
            } catch (err) {
                console.error('게시글 조회 실패:', err);
                console.error('에러 응답:', err.response?.data);
                // API 호출 실패 시에도 초기 post 데이터 사용
                if (post) {
                    console.log('초기 post 데이터 사용:', post);
                    setPostData(post);
                }
            }
        };
        fetchPost();
    }, [isOpen, post]);

    const handleDownload = async (attachment) => {
        try {
            const fileName = attachment.name || '파일';
            let fileUrl = attachment.url || attachment.fileUrl || attachment.downloadUrl;
            
            if (!fileUrl) {
                alert('다운로드할 수 있는 파일 URL이 없습니다.');
                return;
            }

            // URL 정규화 (상대 경로를 절대 경로로 변환)
            if (!fileUrl.startsWith('http://') && !fileUrl.startsWith('https://')) {
                fileUrl = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
                fileUrl = `${window.location.origin}${fileUrl}`;
            }

            // 토큰이 필요한 경우를 대비해 axios로 다운로드
            const token = localStorage.getItem('accessToken');
            const config = token ? { 
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            } : { responseType: 'blob' };

            try {
                console.log('📥 다운로드 시도:', fileUrl);
                const response = await axios.get(fileUrl, config);
                const blob = new Blob([response.data]);
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } catch (axiosError) {
                console.error('Axios 다운로드 실패:', axiosError);
                // axios로 다운로드 실패 시 직접 링크로 시도
                const link = document.createElement('a');
                link.href = fileUrl;
                link.download = fileName;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error('파일 다운로드 실패:', error);
            alert('파일 다운로드에 실패했습니다.');
        }
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
            
            // 새로운 API 형식: dto 파트에 JSON 문자열로 전송 (Blob으로 변환하여 Content-Type 명시)
            const dto = {
                title: updatedPost.title,
                content: updatedPost.content,
                major: postData.major || 'ALL',
                anonymous: Boolean(updatedPost.anonymous ?? false)
            };
            console.log('📤 Community Edit DTO:', dto);
            const dtoBlob = new Blob([JSON.stringify(dto)], { type: 'application/json' });
            form.append('dto', dtoBlob);
            
            // 파일은 files 파트로 전송
            updatedPost.attachments?.forEach((att) => {
                form.append('files', att.file);
            });
            
            await axios.put(`/api/community/${postData.id}`, form, {
                headers: {
                    Authorization: `Bearer ${token}`
                    // Content-Type은 axios가 자동으로 설정 (boundary 포함)
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
    
    console.log('ReadPostModal 렌더링 - postData:', postData);
    
    // API 명세서 기준: FileInfoDto { url, name } - 확장자로 이미지 판별
    const files = Array.isArray(postData.files) ? postData.files : [];
    console.log('files 배열:', files);
    
    const imageAttachments = files.filter(file => {
        if (!file || !file.name) return false;
        const nameLower = file.name.toLowerCase();
        return nameLower.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/);
    });
    const fileAttachments = files.filter(file => {
        if (!file || !file.name) return false;
        const nameLower = file.name.toLowerCase();
        return !nameLower.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/);
    });
    
    console.log('imageAttachments:', imageAttachments);
    console.log('fileAttachments:', fileAttachments);
    
    // 작성자, 작성일, 조회수 - API 명세서 기준 필드 사용
    const writer = postData.writer || '';
    const createdAt = postData.createdAt || '';
    const viewCount = postData.viewCount ?? 0;
    
    console.log('작성자:', writer, '작성일:', createdAt, '조회수:', viewCount);

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-xl md:max-w-2xl max-h-[85vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-4 md:p-6 border-b">
                        <h3 className="text-xl md:text-2xl font-bold">{postData.title || '제목 없음'}</h3>
                        <div className="flex gap-2">
                            <button onClick={handleEdit} className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all flex items-center gap-2" title="수정">
                                <Edit size={18} />
                                <span>수정</span>
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
                                <span>작성자: {writer || '알 수 없음'}</span>
                                <span>작성일: {createdAt ? (createdAt.includes('T') ? createdAt.split('T')[0] : createdAt) : '알 수 없음'}</span>
                                <span>조회수: {viewCount}</span>
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
                                    {imageAttachments.map((file, idx) => (
                                        <div key={idx} className="border rounded-lg overflow-hidden">
                                            <img src={file.url} alt={file.name} className="w-full h-48 object-cover cursor-pointer hover:opacity-90"
                                                onClick={() => file.url && window.open(file.url, '_blank')} />
                                            <div className="p-2 bg-gray-50">
                                                <p className="text-xs text-gray-600 truncate">{file.name}</p>
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
                                    {fileAttachments.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer" onClick={() => file.url && handleDownload(file)} >
                                            <div className="flex items-center gap-3">
                                                <File size={20} className="text-gray-500" />
                                                <span className="text-sm">{file.name}</span>
                                            </div>
                                            <span className="text-xs text-teal-600 font-medium">다운로드</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end p-4 md:p-6 border-t gap-2">
                        <button onClick={handleDelete} className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2">
                            <Trash size={18} />
                            <span>삭제</span>
                        </button>
                        <button onClick={handleEdit} className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600">수정</button>
                        <button onClick={onClose} className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">닫기</button>
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