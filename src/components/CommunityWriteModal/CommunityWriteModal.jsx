import { useState } from 'react';
import { X, Upload, File, Image } from 'lucide-react';

const CommunityWriteModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({ title: '', content: '', isAnonymous: false });
    const [attachments, setAttachments] = useState([]);
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
        const handleSubmit = () => { 
            if (!formData.title || !formData.content) { alert('제목과 내용을 입력해주세요.');
                return; }
                onSubmit({ ...formData, attachments });
                setFormData({ title: '', content: '', isAnonymous: false });
                setAttachments([]);
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

export default CommunityWriteModal;