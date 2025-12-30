import { useEffect, useState } from 'react';
import { X, File, Edit, Trash } from 'lucide-react';
import axios from 'axios';
import CommunityWriteModal from '../../../components/CommunityWriteModal/CommunityWriteModal';
import { useAppContext } from '../../../App';

const ReadPostModal = ({ isOpen, onClose, post }) => {
    const { profile, fetchProfile } = useAppContext();
    const [postData, setPostData] = useState(post);
    const [showEditModal, setShowEditModal] = useState(false);

    // 프로필이 없으면 자동으로 로드
    useEffect(() => {
        if (!profile && isOpen) {
            console.log('🔄 프로필이 없어서 자동으로 로드합니다...');
            fetchProfile();
        }
    }, [profile, isOpen, fetchProfile]);

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
                // 조회 실패 시 무시
            }
        };

        fetchPost();
    }, [isOpen, post]);

    const handleDownload = async (file) => {
        try {
            const fileName = file.name || '파일';
            let fileUrl = file.url || file.fileUrl || file.downloadUrl;
            
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
            onClose();
            window.location.reload();
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
            
            // 학생은 자신의 학과 정보를 추출 (프로필 모달의 major 필드에서)
            const userMajor = await getUserMajor();
            
            if (!userMajor || userMajor === 'ALL') {
                alert('학과 정보를 찾을 수 없습니다. 프로필을 확인해주세요.');
                return;
            }
            
            
            const form = new FormData();
            
            // 새로운 API 형식: dto 파트에 JSON 문자열로 전송 (Blob으로 변환하여 Content-Type 명시)
            const dto = {
                title: updatedPost.title || '',
                content: updatedPost.content || '',
                major: userMajor,
                anonymous: Boolean(updatedPost.anonymous ?? false)
            };
            console.log('📤 Community Edit DTO:', dto);
            console.log('📤 전송되는 학과:', userMajor);
            const dtoBlob = new Blob([JSON.stringify(dto)], { type: 'application/json' });
            form.append('dto', dtoBlob);
            
            // 파일은 files 파트로 전송
            updatedPost.attachments?.forEach((att) => {
                if (att.file) {
                    form.append('files', att.file);
                }
            });
            
            await axios.put(`/api/community/${postData.id}`, form, {
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
            alert(`✅ 게시글이 수정되었습니다!\n\n전송된 학과: ${userMajor}\n\n확인 후 페이지가 새로고침됩니다.`);

            setShowEditModal(false);
            onClose();
            window.location.reload();
        } catch (err) {
            alert('수정 실패: ' + (err.response?.data?.message || err.message));
        }
    };

    if (!isOpen || !postData) return null;
    const imageAttachments = postData.files?.filter(file => file.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) || [];
    const fileAttachments = postData.files?.filter(file => !file.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) || [];

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
                                <span>학과: {postData.major || '전체'}</span>
                                <span>작성자: {postData.anonymous ? '익명' : postData.writer}</span>
                                <span>작성일: {new Date(postData.createdAt).toLocaleString()}</span>
                                <span>조회수: {postData.viewCount}</span>
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
                                    {imageAttachments.map((file, index) => (
                                        <div key={index} className="border rounded-lg overflow-hidden">
                                            <img src={file.url} alt={file.name} className="w-full h-48 object-cover cursor-pointer hover:opacity-90"
                                                onClick={() => window.open(file.url, '_blank')} />
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
                                    {fileAttachments.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer" onClick={() => handleDownload(file)} >
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
                    <div className="flex justify-end p-4 md:p-6 border-t">
                        <button onClick={onClose} className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300" > 닫기 </button>
                    </div>
                </div>
            </div>
            {showEditModal && (
                <CommunityWriteModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onSubmit={handleEditSubmit}
                    initialData={{
                        ...postData,
                        anonymous: postData.anonymous === true || postData.anonymous === 'true' ||
                                  postData.anonymous === 1 || postData.anonymous === '1' ||
                                  (typeof postData.anonymous === 'object' && postData.anonymous?.[0] === 1)
                    }}
                    isEdit={true}
                />
            )}
        </>
    );
};

export default ReadPostModal;