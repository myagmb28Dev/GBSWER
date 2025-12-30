import { useState } from 'react';
import axios from 'axios';
import { X, Upload, File, Image } from 'lucide-react';
import { useAppContext } from '../../App';

const WritePostModal = ({ isOpen, onClose, onSubmit }) => {
    const { userRole, profile, fetchProfile } = useAppContext();
    const [formData, setFormData] = useState({ title: '', content: '', isAnonymous: false });
    const [attachments, setAttachments] = useState([]);

    // 프로필이 없으면 자동으로 로드
    useEffect(() => {
        if (!profile && isOpen) {
            console.log('🔄 프로필이 없어서 자동으로 로드합니다...');
            fetchProfile();
        }
    }, [profile, isOpen, fetchProfile]);

    // 학생 유저의 학과 정보 추출 (프로필 모달의 major 필드 사용)
    const getUserMajor = async () => {
        // 관리자나 선생님인 경우 ALL 반환
        if (userRole === 'admin' || userRole === 'teacher') {
            return 'ALL';
        }

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
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const newAttachments = files.map(file => ({
            id: Date.now() + Math.random(), name: file.name,
            size: file.size, type: file.type, file: file,
            url: URL.createObjectURL(file)}));
            setAttachments([...attachments, ...newAttachments]);
        };
        const removeAttachment = (id) => {
            const attachment = attachments.find(att => att.id === id);
            if (attachment && attachment.url) {
                URL.revokeObjectURL(attachment.url);
            }
            setAttachments(attachments.filter(att => att.id !== id));
        };
        const handleSubmit = async () => { 
            if (!formData.title || !formData.content) { alert('제목과 내용을 입력해주세요.');
                return; }
            try {
                const token = localStorage.getItem('accessToken');
                
                // 사용자 학과 정보 추출 (프로필 모달의 major 필드에서)
                const userMajor = await getUserMajor();
                
                if (!userMajor || userMajor === 'ALL') {
                    alert('학과 정보를 찾을 수 없습니다. 프로필을 확인해주세요.');
                    return;
                }
                
                
                const form = new FormData();
                
                // 새로운 API 형식: dto 파트에 JSON 문자열로 전송 (Blob으로 변환하여 Content-Type 명시)
                const dto = {
                    title: formData.title,
                    content: formData.content,
                    major: userMajor,
                    anonymous: Boolean(formData.isAnonymous ?? false)
                };
                console.log('📤 Community Write DTO:', dto);
                console.log('📤 전송되는 학과:', userMajor);
                const dtoBlob = new Blob([JSON.stringify(dto)], { type: 'application/json' });
                form.append('dto', dtoBlob);
                
                // 파일은 files 파트로 전송
                attachments.forEach((att, idx) => {
                    form.append('files', att.file);
                });
                
                const res = await axios.post('/api/community/write', form, {
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
                alert(`✅ 게시글이 작성되었습니다!\n\n전송된 학과: ${userMajor}\n\n확인 후 모달이 닫힙니다.`);

                onSubmit(res.data.data); // 작성된 게시글 반환
                setFormData({ title: '', content: '', isAnonymous: false });
                setAttachments([]);
            } catch (err) {
                alert('게시글 작성 실패');
            }
        };
            const handleClose = () => {
                attachments.forEach(att => {
                    if (att.url) URL.revokeObjectURL(att.url);
                });
                setFormData({ title: '', content: '', isAnonymous: false });
                setAttachments([]);
                onClose();
            };
            
            const formatFileSize = (bytes) => {
                if (bytes < 1024) return bytes + ' B';
                if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
                return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
            };
            
            if (!isOpen) return null;
            
            return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-xl md:max-w-2xl max-h-[85vh] overflow-y-auto">
                    <div className="flex justify-between items-center p-4 md:p-6 border-b">
                        <h3 className="text-xl md:text-2xl font-bold">새 글 작성</h3>
                        <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
                            <X size={24} />
                        </button>
                    </div>
                    
                    <div className="p-4 md:p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">제목</label>
                            <input 
                                type="text" 
                                value={formData.title} 
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" 
                                placeholder="제목을 입력하세요" 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">내용</label>
                            <textarea 
                                value={formData.content} 
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })} 
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 h-64 resize-none"
                                placeholder="내용을 입력하세요" 
                            />
                        </div>
                    
                        <div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={formData.isAnonymous}
                                    onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                                    className="w-4 h-4 text-teal-500 border-gray-300 rounded focus:ring-teal-500" 
                                />
                                <span className="text-sm font-medium">익명으로 작성</span>
                            </label>
                        </div>
                    
                        <div>
                            <label className="block text-sm font-medium mb-2">파일 첨부</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-teal-500 transition-colors">
                                <input 
                                    type="file" 
                                    multiple 
                                    onChange={handleFileChange} 
                                    className="hidden" 
                                    id="file-upload" 
                                    accept="image/*,.pdf,.doc,.docx,.txt" 
                                />
                                <label htmlFor="file-upload" className="cursor-pointer"> 
                                    <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                                    <p className="text-sm text-gray-600">클릭하여 파일을 선택하거나 드래그하세요</p>
                                    <p className="text-xs text-gray-400 mt-1">이미지, PDF, 문서 파일</p>
                                </label>
                            </div>
                        
                            {attachments.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {attachments.map((att) => (
                                        <div key={att.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                {att.type.startsWith('image/') ? (
                                                    <Image size={20} className="text-teal-500" />
                                                ) : (
                                                    <File size={20} className="text-gray-500" />
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium">{att.name}</p>
                                                    <p className="text-xs text-gray-500">{formatFileSize(att.size)}</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => removeAttachment(att.id)} 
                                                className="text-gray-400 hover:text-red-500"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
        
                    <div className="flex justify-end gap-3 p-4 md:p-6 border-t">
                        <button 
                            onClick={handleClose} 
                            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                        >
                            취소
                        </button>
                        <button 
                            onClick={handleSubmit} 
                            className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                        >
                            작성하기
                        </button>
                    </div>
                </div>
            </div>
        );
    };

export default WritePostModal;