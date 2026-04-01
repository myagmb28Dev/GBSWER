<<<<<<< HEAD
import React, { useState } from 'react';
import { Upload, File, Plus } from 'lucide-react';
<<<<<<< HEAD
import AssignmentStatusModal from '../AssignmentStatusModal/AssignmentStatusModal';
=======
import { useAppContext } from '../../App';
import AssignmentStatusModal from '../AssignmentStatusModal/AssignmentStatusModal';
import ParticipantListModal from '../ParticipantListModal/ParticipantListModal';
>>>>>>> 81ca26b (커뮤니티 페이지 및 사이드바 수정: 페이지당 8개 게시물, 테이블 크기 조정, 수정 모드 개선)
=======
import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { File, Plus, Download } from 'lucide-react';
import AssignmentStatusModal from '../AssignmentStatusModal/AssignmentStatusModal';
import { useAppContext } from '../../App';
>>>>>>> 7e3d6f31fa82cad99a32fad380cecbf8e089487f
import './ClassDetailSidebar.css';

const ClassDetailSidebar = ({
  selectedPost = null,
  onClose,
<<<<<<< HEAD
  classId = null,
  participants = []
}) => {
  const { userRole } = useAppContext();
  const [attachments, setAttachments] = useState([]);
=======
  onSubmitAssignment,
  onUpdateSubmission,
  classId
}) => {
  // 기본 디버그: 컴포넌트가 렌더링되는지 확인
  // eslint-disable-next-line no-console
  console.log('🎯 ClassDetailSidebar rendered, selectedPost:', selectedPost);
  const { userRole } = useAppContext();
  // 게시물 본문을 여러 가능한 키에서 찾아 반환하는 헬퍼
  const resolveContent = (post) => {
    if (!post || typeof post !== 'object') return '';

    // 새로운 API 명세서에 따라 content를 우선적으로 확인
    if (post.content && String(post.content).trim() !== '') {
      // eslint-disable-next-line no-console
      console.log('✅ Found content:', post.content);
      return post.content;
    }

    // description도 확인 (호환성을 위해)
    if (post.description && String(post.description).trim() !== '') {
      // eslint-disable-next-line no-console
      console.log('✅ Found description:', post.description);
      return post.description;
    }

    // 가능한 다른 키 목록 (description 다음 우선순위)
    const keys = [
      'content', 'body', 'detail', 'text', 'desc', 'message', 'note',
      'contents', 'data', 'value', 'html', 'markdown', 'summary', 'info', 'details'
    ];

    // 직접 키 확인
    for (const k of keys) {
      if (post[k] && String(post[k]).trim() !== '') return post[k];
    }

    // 중첩된 data 객체에 들어있는 경우도 검사
    if (post.data && typeof post.data === 'object') {
      // description 우선 확인
      if (post.data.description && String(post.data.description).trim() !== '') {
        return post.data.description;
      }
      for (const k of keys) {
        if (post.data[k] && String(post.data[k]).trim() !== '') return post.data[k];
      }
    }

    // 중첩된 객체에서 재귀적으로 찾기
    const findContent = (obj) => {
      if (!obj || typeof obj !== 'object') return null;
      // description 우선 확인
      if (obj.description && String(obj.description).trim() !== '') return obj.description;
      for (const k of keys) {
        if (obj[k] && String(obj[k]).trim() !== '') return obj[k];
      }
      return null;
    };

    // 모든 중첩 객체 탐색
    for (const key in post) {
      if (post[key] && typeof post[key] === 'object') {
        const found = findContent(post[key]);
        if (found) return found;
      }
    }

    return '';
  };
  // 선택된 게시물이 바뀔 때 디버그 정보를 남김
  if (typeof window !== 'undefined' && selectedPost) {
    // 상세한 디버그: 개발시 콘솔에서 확인
    // eslint-disable-next-line no-console
    console.log('🔍 ClassDetailSidebar selectedPost:', selectedPost);
    // eslint-disable-next-line no-console
    console.log('🔍 selectedPost keys:', Object.keys(selectedPost));
    // eslint-disable-next-line no-console
    console.log('🔍 selectedPost content:', selectedPost.content);
    // eslint-disable-next-line no-console
    console.log('🔍 selectedPost description:', selectedPost.description);
    // eslint-disable-next-line no-console
    console.log('🔍 selectedPost type:', selectedPost.type);
    // eslint-disable-next-line no-console
    console.log('🔍 resolveContent result:', resolveContent(selectedPost));
  }
>>>>>>> 7e3d6f31fa82cad99a32fad380cecbf8e089487f
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSubmitNotification, setShowSubmitNotification] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAssignmentStatusOpen, setIsAssignmentStatusOpen] = useState(false);
<<<<<<< HEAD
<<<<<<< HEAD
=======
  const [isParticipantListOpen, setIsParticipantListOpen] = useState(false);

  // 학생 여부 확인
  const isStudent = userRole === 'student';
>>>>>>> 81ca26b (커뮤니티 페이지 및 사이드바 수정: 페이지당 8개 게시물, 테이블 크기 조정, 수정 모드 개선)
=======
  const [reviewData, setReviewData] = useState(null); // 평가 정보 (피드백, 상태 등)
  const [showReview, setShowReview] = useState(false); // 피드백 표시 여부
  const [existingSubmissionFiles, setExistingSubmissionFiles] = useState([]); // 기존 제출 파일
  const [newSubmissionFiles, setNewSubmissionFiles] = useState([]); // 새로 추가할 파일

  // 학생의 제출 상태 확인 함수
  const checkSubmissionStatus = useCallback(async (preserveState = false) => {
    if (!selectedPost || selectedPost.type !== '과제' || !classId) {
      if (!preserveState) {
        setIsSubmitted(false);
        setUploadedFiles([]);
      }
      return;
    }

    try {
      // 학생의 제출 상태 확인 API 호출
      const response = await axiosInstance.get(`/api/classes/${classId}/posts/${selectedPost.id}/my-submission`);

      const submission = response.data?.data || response.data;
      console.log('📋 제출 상태 확인 응답:', submission);
      
      // 제출 상태 확인: id, submissionId, 또는 submitted 필드 확인
      if (submission && (submission.id || submission.submissionId || submission.submitted === true)) {
        setIsSubmitted(true);
        console.log('✅ 제출 상태: 제출됨');
        
        // 제출된 파일이 있으면 표시
        if (submission.files && submission.files.length > 0) {
          const submissionFiles = submission.files.map((file, index) => ({
            id: file.id || file.fileId || `submission-${index}`,
            name: file.name || file.fileName || '파일',
            file: file,
            url: file.url || file.fileUrl || file.downloadUrl
          }));
          setUploadedFiles(submissionFiles);
          setExistingSubmissionFiles(submissionFiles); // 기존 파일도 저장
        } else {
          setUploadedFiles([]);
          setExistingSubmissionFiles([]);
        }
        
        // 평가 정보 확인 (여러 가능한 필드명 확인)
        const reviewStatus = submission.status || 
                            submission.reviewStatus || 
                            submission.review?.status ||
                            null;
        const feedback = submission.feedback || 
                        submission.review?.feedback ||
                        submission.reviewFeedback ||
                        null;
        const isReviewed = reviewStatus === 'APPROVED' || 
                         reviewStatus === 'REVIEWED' || 
                         reviewStatus === 'PENDING' ||
                         submission.reviewed === true ||
                         submission.review !== null ||
                         feedback !== null;
        
        if (isReviewed) {
          setReviewData({
            status: reviewStatus,
            feedback: feedback,
            reviewedAt: submission.reviewedAt || 
                       submission.review?.reviewedAt ||
                       submission.reviewDate ||
                       null
          });
        } else {
          setReviewData(null);
        }
      } else {
        console.log('❌ 제출 상태: 미제출 (응답 데이터 없음)');
        setIsSubmitted(false);
        setUploadedFiles([]);
        setReviewData(null);
      }
    } catch (error) {
      // API가 없거나 404인 경우
      if (error.response?.status === 404 || error.response?.status === 501) {
        console.warn('제출 상태 확인 API가 아직 구현되지 않았습니다. selectedPost 필드를 확인합니다.');
        // 폴백: selectedPost의 필드 확인
        const hasSubmission = selectedPost.submission || selectedPost.submitted || selectedPost.submissionId;
        if (hasSubmission) {
          setIsSubmitted(true);
          if (selectedPost.submissionFiles) {
            const submissionFiles = selectedPost.submissionFiles.map((file, index) => ({
              id: file.id || file.fileId || `submission-${index}`,
              name: file.name || file.fileName || '파일',
              file: file,
              url: file.url || file.fileUrl || file.downloadUrl
            }));
            setUploadedFiles(submissionFiles);
          }
        } else if (preserveState) {
          // preserveState가 true면 현재 상태 유지 (제출 후 바로 확인하는 경우)
          // setIsSubmitted는 변경하지 않음
        } else {
          setIsSubmitted(false);
          setUploadedFiles([]);
        }
      } else {
        console.error('제출 상태 확인 실패:', error);
        console.error('에러 상태:', error.response?.status);
        console.error('에러 메시지:', error.response?.data);
        // 폴백: selectedPost의 필드 확인
        const hasSubmission = selectedPost.submission || selectedPost.submitted || selectedPost.submissionId;
        if (hasSubmission) {
          setIsSubmitted(true);
          if (selectedPost.submissionFiles) {
            const submissionFiles = selectedPost.submissionFiles.map((file, index) => ({
              id: file.id || file.fileId || `submission-${index}`,
              name: file.name || file.fileName || '파일',
              file: file,
              url: file.url || file.fileUrl || file.downloadUrl
            }));
            setUploadedFiles(submissionFiles);
          }
        }
        // 에러가 발생해도 현재 상태를 유지 (제출 후 바로 확인하는 경우 대비)
      }
    }
  }, [selectedPost, classId]);

  // selectedPost가 변경될 때 제출 상태 확인
  useEffect(() => {
    checkSubmissionStatus();
  }, [checkSubmissionStatus]);

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', { 
        year: 'numeric',
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      return dateString;
    }
  };

  // 과제 만료일 포맷팅 함수
  const formatDueDate = (dateString) => {
    if (!dateString) return '미설정';
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${year}년 ${month}월 ${day}일`;
    } catch (error) {
      return dateString;
    }
  };

  // 파일 타입 확인 헬퍼 함수
  const getFileType = (fileName) => {
    if (!fileName) return 'unknown';
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) {
      return 'image';
    }
    if (ext === 'pdf') {
      return 'pdf';
    }
    return 'other';
  };

  // 파일 URL 가져오기
  const getFileUrl = (file) => {
    if (file.url) return file.url;
    if (file.fileUrl) return file.fileUrl;
    if (file.downloadUrl) return file.downloadUrl;
    return null;
  };

  // 상대 경로를 절대 경로로 변환
  const normalizeFileUrl = (url) => {
    if (!url) return null;
    // 이미 절대 URL인 경우 (http:// 또는 https://로 시작)
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // 상대 경로인 경우 절대 경로로 변환
    if (url.startsWith('/')) {
      // 백엔드 API를 통해 다운로드하도록 변환
      return url;
    }
    // 상대 경로가 /로 시작하지 않는 경우
    return `/${url}`;
  };

  // 파일 MIME 타입 가져오기
  const getMimeType = (fileName) => {
    if (!fileName) return 'application/octet-stream';
    const ext = fileName.split('.').pop()?.toLowerCase();
    const mimeTypes = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'bmp': 'image/bmp',
      'pdf': 'application/pdf',
      'zip': 'application/zip',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'txt': 'text/plain',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  };

  // 파일 다운로드 함수
  const handleDownload = async (file) => {
    try {
      const fileName = file.name || file.fileName || '파일';
      let fileUrl = getFileUrl(file);
      
      if (!fileUrl) {
        alert('다운로드할 수 있는 파일 URL이 없습니다.');
        return;
      }

      // URL 정규화
      fileUrl = normalizeFileUrl(fileUrl);
      
      // 토큰이 필요한 경우를 대비해 axios로 다운로드
      const token = localStorage.getItem('accessToken');
      const config = token ? { 
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      } : { responseType: 'blob' };

      try {
        // 절대 URL이 아닌 경우 현재 origin 추가
        const downloadUrl = fileUrl.startsWith('http') ? fileUrl : `${window.location.origin}${fileUrl}`;
        console.log('📥 다운로드 시도:', downloadUrl);
        
        const response = await axiosInstance.get(downloadUrl, config);
        
        // MIME 타입 가져오기
        const mimeType = getMimeType(fileName);
        const blob = new Blob([response.data], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none'; // 링크를 숨김
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (axiosError) {
        console.error('Axios 다운로드 실패:', axiosError);
        // axios로 다운로드 실패 시 직접 링크로 시도하지 않고 에러 표시
        alert('파일 다운로드에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('파일 다운로드 실패:', error);
      alert('파일 다운로드에 실패했습니다.');
    }
  };
>>>>>>> 7e3d6f31fa82cad99a32fad380cecbf8e089487f

  if (!selectedPost) {
    return (
      <div className="class-detail-sidebar">
        <div className="sidebar-empty">
          <img src="/friends.png" alt="친구들 캐릭터" className="empty-character" />
          <p>과제와 공지를 확인해 보세요!</p>
        </div>
      </div>
    );
  }

  // 수정 모드 시작
  const handleEditStart = () => {
    // 기존 제출 파일을 수정 모드용으로 복사
    setExistingSubmissionFiles([...uploadedFiles]);
    setNewSubmissionFiles([]);
    setIsEditMode(true);
  };

  // 수정 모드 취소
  const handleEditCancel = () => {
    // 새로 추가한 파일들의 URL 정리
    newSubmissionFiles.forEach(file => {
      if (file.url && file.url.startsWith('blob:')) {
        URL.revokeObjectURL(file.url);
      }
    });
    setNewSubmissionFiles([]);
    setIsEditMode(false);
  };

  // 새 파일 추가 (수정 모드)
  const handleNewFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      url: URL.createObjectURL(file)
    }));
    setNewSubmissionFiles([...newSubmissionFiles, ...newFiles]);
    e.target.value = '';
  };

  // 새 파일 제거 (수정 모드)
  const handleRemoveNewFile = (id) => {
    const fileToRemove = newSubmissionFiles.find(file => file.id === id);
    if (fileToRemove && fileToRemove.url) {
      URL.revokeObjectURL(fileToRemove.url);
    }
    setNewSubmissionFiles(newSubmissionFiles.filter(file => file.id !== id));
  };

  // 기존 파일 제거 (수정 모드)
  const handleRemoveExistingFile = (id) => {
    setExistingSubmissionFiles(existingSubmissionFiles.filter(file => file.id !== id));
  };

  // 파일 추가 (제출 모드 - 미제출 상태)
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      url: URL.createObjectURL(file)
    }));
    setUploadedFiles([...uploadedFiles, ...newFiles]);
    e.target.value = '';
  };

  // 파일 제거 (제출 모드)
  const removeUploadedFile = (id) => {
    const fileToRemove = uploadedFiles.find(file => file.id === id);
    if (fileToRemove && fileToRemove.url) {
      URL.revokeObjectURL(fileToRemove.url);
    }
    setUploadedFiles(uploadedFiles.filter(file => file.id !== id));
  };

  // 수정 모드 저장
  const handleEditSave = async () => {
    if (!onUpdateSubmission) {
      alert('수정 기능을 사용할 수 없습니다.');
      return;
    }

    // 유지할 기존 파일 + 새로 추가한 파일
    const finalFiles = [...existingSubmissionFiles, ...newSubmissionFiles];
    
    if (finalFiles.length === 0) {
      alert('최소 하나의 파일은 필요합니다.');
      return;
    }

    try {
      const submissionData = {
        files: finalFiles.map(file => file.file || file) // file 객체 추출
      };
      
      await onUpdateSubmission(selectedPost.id, submissionData);
      
      // 수정 성공 시 상태 업데이트
      setIsSubmitted(true);
      setUploadedFiles(finalFiles);
      setIsEditMode(false);
      
      // 새 파일 URL 정리
      newSubmissionFiles.forEach(file => {
        if (file.url && file.url.startsWith('blob:')) {
          URL.revokeObjectURL(file.url);
        }
      });
      setNewSubmissionFiles([]);
      
      // 수정 후 상태 다시 확인
      setTimeout(async () => {
        await checkSubmissionStatus(true);
      }, 1000);
      
      alert('제출물이 수정되었습니다.');
    } catch (error) {
      console.error('제출물 수정 실패:', error);
      alert('제출물 수정에 실패했습니다.');
    }
  };

  const handleSubmit = async () => {
    // 이미 제출된 경우 - 수정 모드
    if (isSubmitted) {
      if (onUpdateSubmission) {
        // 수정 모드에서도 파일이 없으면 경고
        if (uploadedFiles.length === 0) {
          alert('수정할 파일을 첨부해주세요.');
          return;
        }
        
        try {
          const submissionData = {
            files: uploadedFiles.map(file => file.file || file) // file 객체 추출
          };
          await onUpdateSubmission(selectedPost.id, submissionData);
          // 수정 성공 시 상태 유지
          setIsSubmitted(true);
          // 수정 후 상태 다시 확인 (서버에서 최신 정보 가져오기, 상태 유지)
          setTimeout(async () => {
            await checkSubmissionStatus(true);
          }, 1000); // 서버 반영 시간 고려
          alert('제출물이 수정되었습니다.');
        } catch (error) {
          console.error('제출물 수정 실패:', error);
          alert('제출물 수정에 실패했습니다.');
        }
      } else {
        setShowSubmitNotification(true);
        setTimeout(() => setShowSubmitNotification(false), 2000);
      }
      return;
    }

    // 새로 제출하는 경우
    if (uploadedFiles.length === 0) {
      alert('파일을 첨부해주세요.');
      return;
    }

    try {
      const submissionData = {
        files: uploadedFiles.map(file => file.file || file) // file 객체 추출
      };

      if (onSubmitAssignment) {
        await onSubmitAssignment(selectedPost.id, submissionData);
        // 제출 성공 시 즉시 상태 업데이트 (파일 목록 유지)
        setIsSubmitted(true);
        // 제출된 파일 목록은 그대로 유지
        // 제출 후 상태 다시 확인 (서버에서 최신 정보 가져오기, 상태 유지)
        setTimeout(async () => {
          await checkSubmissionStatus(true);
        }, 1000); // 서버 반영 시간 고려
        alert('과제가 제출되었습니다.');
      }
    } catch (error) {
      console.error('제출 실패:', error);
      alert('과제 제출에 실패했습니다.');
    }
  };


  return (
    <div className="class-detail-sidebar">
      <div className="sidebar-header">
<<<<<<< HEAD
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        {/* <button 
          className="participant-info-btn"
          onClick={() => setIsParticipantListOpen(true)}
          title="참여자 정보"
        >
          👥
        </button> */}
=======
        {/* X 버튼 제거 */}
>>>>>>> 7e3d6f31fa82cad99a32fad380cecbf8e089487f
      </div>
      
      <div className={`sidebar-content ${isEditMode ? 'edit-mode-active' : ''}`}>
        {selectedPost.type === '과제' ? (
          // 과제용 레이아웃
          <>
            {/* 과제 제목과 내용 */}
            <div className="post-header">
              <div className="post-title-wrapper">
                <h3 className="post-title">{selectedPost.title}</h3>
                <img src="/meister-game.png" alt="마이스터 캐릭터" className="title-character" />
              </div>
              
              {/* 과제 만료일 */}
              <div className="assignment-period">
                <p className="period-text">과제 만료일: {formatDueDate(selectedPost.dueDate || selectedPost.deadline)}</p>
              </div>
              
              
              <p className="post-content">
                {selectedPost.content || "과제 내용이 아직 준비되지 않았습니다."}
              </p>

              {/* 첨부파일 표시 */}
              {(selectedPost.attachments || selectedPost.files) && 
               (selectedPost.attachments?.length > 0 || selectedPost.files?.length > 0) && (
                <div className="attachments-display">
                  <label className="attachments-label">첨부파일</label>
                  <div className="attachments-list">
                    {(selectedPost.attachments || selectedPost.files || []).map((file, index) => {
                      const fileName = file.name || file.fileName || '파일';
                      const fileType = getFileType(fileName);
                      const fileUrl = getFileUrl(file);
                      
                      return (
                        <div key={file.id || file.fileId || index} className="attachment-item-display">
                          {fileType === 'image' && fileUrl ? (
                            <div className="attachment-preview image-preview">
                              <img 
                                src={fileUrl} 
                                alt={fileName}
                                className="preview-image"
                                onClick={() => fileUrl && window.open(fileUrl, '_blank')}
                              />
                              <div className="file-name-with-download">
                                <span className="file-name">{fileName}</span>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownload(file);
                                  }}
                                  className="download-button"
                                  title="다운로드"
                                >
                                  <Download size={16} />
                                </button>
                              </div>
                            </div>
                          ) : fileType === 'pdf' && fileUrl ? (
                            <div className="attachment-preview pdf-preview">
                              <iframe 
                                src={fileUrl}
                                className="preview-pdf"
                                title={fileName}
                              />
                              <div className="file-name-with-download">
                                <span className="file-name">{fileName}</span>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownload(file);
                                  }}
                                  className="download-button"
                                  title="다운로드"
                                >
                                  <Download size={16} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="attachment-preview other-preview">
                              <File size={14} className="file-icon" />
                              <div className="file-name-with-download">
                                <span className="file-name">{fileName}</span>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownload(file);
                                  }}
                                  className="download-button"
                                  title="다운로드"
                                >
                                  <Download size={16} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 수정 모드 */}
            {isEditMode && isSubmitted ? (
              <>
                {/* 기존 제출 파일 목록 */}
                {existingSubmissionFiles.length > 0 && (
                  <div className="submission-edit-section">
                    <label className="submission-edit-label">기존 제출 파일</label>
                    <div className="submission-files-list">
                      {existingSubmissionFiles.map((file) => (
                        <div key={file.id} className="submission-file-item">
                          <File size={14} className="file-icon" />
                          <span className="file-name">{file.name}</span>
                          <button 
                            onClick={() => handleRemoveExistingFile(file.id)} 
                            className="remove-file-button"
                            title="제거"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

<<<<<<< HEAD
            {/* 캐릭터와 버튼들 */}
            <div className="character-section">
              <img src="/meister-game.png" alt="마이스터 캐릭터" className="sidebar-character" />
              <div className="button-section">
<<<<<<< HEAD
                <button 
                  onClick={handleSubmit} 
                  className={`submit-button ${isSubmitted ? 'submitted' : ''}`}
                >
                  {isSubmitted ? '수정하기' : '제출하기'}
                </button>
                <div className="add-file-section">
=======
                {/* 새로 추가할 파일 목록 */}
                {newSubmissionFiles.length > 0 && (
                  <div className="submission-edit-section">
                    <label className="submission-edit-label">새로 추가할 파일</label>
                    <div className="submission-files-list">
                      {newSubmissionFiles.map((file) => (
                        <div key={file.id} className="submission-file-item">
                          <File size={14} className="file-icon" />
                          <span className="file-name">{file.name}</span>
                          <button 
                            onClick={() => handleRemoveNewFile(file.id)} 
                            className="remove-file-button"
                            title="제거"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 파일 추가 버튼 */}
                <div className="submission-edit-actions">
>>>>>>> 7e3d6f31fa82cad99a32fad380cecbf8e089487f
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleNewFileChange} 
                    className="file-input-hidden" 
                    id="edit-file-upload" 
                    accept="image/*,.pdf,.doc,.docx,.txt" 
                  />
                  <label htmlFor="edit-file-upload" className="add-file-button-edit">
                    <Plus size={18} />
                    파일 추가
                  </label>
                </div>
<<<<<<< HEAD
=======
                {/* 학생: 제출하기 버튼만 표시 */}
                {isStudent ? (
                  <>
                    <button 
                      onClick={handleSubmit} 
                      className={`submit-button ${isSubmitted ? 'submitted' : ''}`}
                    >
                      {isSubmitted ? '수정하기' : '제출하기'}
                    </button>
                    <div className="add-file-section">
                      <input 
                        type="file" 
                        multiple 
                        onChange={handleFileChange} 
                        className="hidden" 
                        id="assignment-file-upload" 
                        accept="image/*,.pdf,.doc,.docx,.txt" 
                      />
                      <label htmlFor="assignment-file-upload" className="circle-add-button">
                        <Plus size={16} />
                      </label>
                    </div>
                  </>
                ) : (
                  // 관리자: 수정하기와 과제 현황 버튼 표시
                  <>
                    <button 
                      onClick={() => setIsEditMode(!isEditMode)} 
                      className="edit-button"
                    >
                      수정하기
                    </button>
                    <button 
                      onClick={() => setIsAssignmentStatusOpen(true)} 
                      className="assignment-status-button"
                    >
                      과제 현황
                    </button>
                  </>
                )}
>>>>>>> 81ca26b (커뮤니티 페이지 및 사이드바 수정: 페이지당 8개 게시물, 테이블 크기 조정, 수정 모드 개선)
              </div>
            </div>
=======

                {/* 수정 모드 버튼 */}
                <div className="edit-mode-buttons">
                  <button 
                    onClick={handleEditCancel} 
                    className="btn-cancel"
                  >
                    취소
                  </button>
                  <button 
                    onClick={handleEditSave} 
                    className="btn-save"
                  >
                    확인
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* 선택된 파일 목록 (제출 모드 - 미제출 상태에서만 표시) */}
                {!isSubmitted && uploadedFiles.length > 0 && (
                  <div className="uploaded-files-list">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="uploaded-file-item">
                        <File size={14} className="file-icon" />
                        <span className="file-name">{file.name}</span>
                        <button 
                          onClick={() => removeUploadedFile(file.id)} 
                          className="remove-file-button"
                          title="제거"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* 제출/수정 버튼 */}
                <div className="character-section">
                  <div className="submit-actions">
                    {!isSubmitted && (
                      <>
                        <input 
                          type="file" 
                          multiple 
                          onChange={handleFileChange} 
                          className="file-input-hidden" 
                          id="assignment-file-upload" 
                          accept="image/*,.pdf,.doc,.docx,.txt" 
                        />
                        <label htmlFor="assignment-file-upload" className="add-file-button">
                          <Plus size={18} />
                        </label>
                      </>
                    )}
                    <button 
                      onClick={isSubmitted ? handleEditStart : handleSubmit} 
                      className={isSubmitted ? 'edit-button-main' : 'submit-button'}
                    >
                      {isSubmitted ? '수정하기' : '제출하기'}
                    </button>
                  </div>
                </div>
              </>
            )}
>>>>>>> 7e3d6f31fa82cad99a32fad380cecbf8e089487f

            {/* 제출 알림 */}
            {showSubmitNotification && (
              <div className="submit-notification">
                이미 올린 파일입니다
              </div>
            )}

<<<<<<< HEAD
            {/* 선택된 파일 미리보기 */}
            {isStudent && attachments.length > 0 && (
              <>
                <div className="temp-attachment-list">
                  {attachments.map((att) => (
                    <div key={att.id} className="temp-attachment-item">
                      <File size={12} className="file-icon" />
                      <span className="file-name">{att.name}</span>
                      <button 
                        onClick={() => removeAttachment(att.id)} 
                        className="remove-temp-file"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={handleAddFile} className="upload-confirm-button">
                  추가
=======
            {/* 평가 완료된 경우 피드백 섹션 */}
            {reviewData && reviewData.feedback && !isEditMode && (
              <div className="review-feedback-section">
                <button 
                  onClick={() => setShowReview(!showReview)}
                  className="review-toggle-button"
                >
                  {showReview ? '피드백 숨기기' : '선생님 피드백 보기'}
>>>>>>> 7e3d6f31fa82cad99a32fad380cecbf8e089487f
                </button>
                {showReview && (
                  <div className="review-content">
                    <div className="review-status-badge">
                      {reviewData.status === 'APPROVED' && <span className="status-approved">✓ 통과</span>}
                      {reviewData.status === 'REVIEWED' && <span className="status-reviewed">↻ 재제출 요청</span>}
                      {reviewData.status === 'PENDING' && <span className="status-pending">⏸ 보류</span>}
                      {!reviewData.status && <span className="status-default">평가 완료</span>}
                    </div>
                    <div className="review-feedback-text">
                      {reviewData.feedback}
                    </div>
                    {reviewData.reviewedAt && (
                      <div className="review-date">
                        평가일: {new Date(reviewData.reviewedAt).toLocaleDateString('ko-KR')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          // 공지용 레이아웃
          <>
            {/* 공지 제목과 내용 */}
            <div className="post-header">
              <h3 className="post-title">{selectedPost.title}</h3>
              {/* 공지 생성 날짜 */}
              {selectedPost.createdAt && (
                <div className="post-date">
                  <span className="date-text">작성일: {formatDate(selectedPost.createdAt)}</span>
                </div>
              )}
              <p className="post-content">
                {selectedPost.content || "공지 내용이 아직 준비되지 않았습니다."}
              </p>

              {/* 첨부파일 표시 */}
              {(selectedPost.attachments || selectedPost.files) && 
               (selectedPost.attachments?.length > 0 || selectedPost.files?.length > 0) && (
                <div className="attachments-display">
                  <label className="attachments-label">첨부파일</label>
                  <div className="attachments-list">
                    {(selectedPost.attachments || selectedPost.files || []).map((file, index) => {
                      const fileName = file.name || file.fileName || '파일';
                      const fileType = getFileType(fileName);
                      const fileUrl = getFileUrl(file);
                      
                      return (
                        <div key={file.id || file.fileId || index} className="attachment-item-display">
                          {fileType === 'image' && fileUrl ? (
                            <div className="attachment-preview image-preview">
                              <img 
                                src={fileUrl} 
                                alt={fileName}
                                className="preview-image"
                                onClick={() => fileUrl && window.open(fileUrl, '_blank')}
                              />
                              <div className="file-name-with-download">
                                <span className="file-name">{fileName}</span>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownload(file);
                                  }}
                                  className="download-button"
                                  title="다운로드"
                                >
                                  <Download size={16} />
                                </button>
                              </div>
                            </div>
                          ) : fileType === 'pdf' && fileUrl ? (
                            <div className="attachment-preview pdf-preview">
                              <iframe 
                                src={fileUrl}
                                className="preview-pdf"
                                title={fileName}
                              />
                              <div className="file-name-with-download">
                                <span className="file-name">{fileName}</span>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownload(file);
                                  }}
                                  className="download-button"
                                  title="다운로드"
                                >
                                  <Download size={16} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="attachment-preview other-preview">
                              <File size={14} className="file-icon" />
                              <div className="file-name-with-download">
                                <span className="file-name">{fileName}</span>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownload(file);
                                  }}
                                  className="download-button"
                                  title="다운로드"
                                >
                                  <Download size={16} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 캐릭터 */}
            <div className="character-section">
              <img src="/meister-game.png" alt="마이스터 캐릭터" className="sidebar-character" />
              <div className="button-section">
<<<<<<< HEAD
<<<<<<< HEAD
                <button 
                  onClick={() => setIsEditMode(!isEditMode)} 
                  className="edit-button"
                >
                  수정하기
                </button>
=======
                {/* 관리자만 수정하기 버튼 표시 */}
                {!isStudent && (
=======
                {userRole !== 'student' && (
>>>>>>> 7e3d6f31fa82cad99a32fad380cecbf8e089487f
                  <button 
                    onClick={() => setIsEditMode(!isEditMode)} 
                    className="edit-button"
                  >
                    수정하기
                  </button>
                )}
<<<<<<< HEAD
>>>>>>> 81ca26b (커뮤니티 페이지 및 사이드바 수정: 페이지당 8개 게시물, 테이블 크기 조정, 수정 모드 개선)
=======
>>>>>>> 7e3d6f31fa82cad99a32fad380cecbf8e089487f
              </div>
            </div>
          </>
        )}

        {/* 과제 현황 모달 */}
        {selectedPost?.type === '과제' && (
          <AssignmentStatusModal
            isOpen={isAssignmentStatusOpen}
            onClose={() => setIsAssignmentStatusOpen(false)}
            assignmentTitle={selectedPost.title}
            participants={[
              { id: 1, name: "김민수", studentId: "2024001", profileImage: "/profile.png", submitted: true },
              { id: 2, name: "이지은", studentId: "2024002", profileImage: "/profile.png", submitted: false },
              { id: 3, name: "박준호", studentId: "2024003", profileImage: "/profile.png", submitted: true },
              { id: 4, name: "최서연", studentId: "2024004", profileImage: "/profile.png", submitted: false },
              { id: 5, name: "정우진", studentId: "2024005", profileImage: "/profile.png", submitted: true },
              { id: 6, name: "한소영", studentId: "2024006", profileImage: "/profile.png", submitted: true },
              { id: 7, name: "윤태현", studentId: "2024007", profileImage: "/profile.png", submitted: false },
              { id: 8, name: "강민지", studentId: "2024008", profileImage: "/profile.png", submitted: true },
              { id: 9, name: "조현우", studentId: "2024009", profileImage: "/profile.png", submitted: false },
              { id: 10, name: "신예린", studentId: "2024010", profileImage: "/profile.png", submitted: true },
            ]}
          />
        )}
<<<<<<< HEAD
=======

        {/* 참여자 정보 모달 */}
        <ParticipantListModal
          isOpen={isParticipantListOpen}
          onClose={() => setIsParticipantListOpen(false)}
          classId={classId}
          participants={participants.length > 0 ? participants : [
            { id: 1, name: "김민수", userId: "2024001", profileImage: "/profile.png" },
            { id: 2, name: "이지은", userId: "2024002", profileImage: "/profile.png" },
            { id: 3, name: "박준호", userId: "2024003", profileImage: "/profile.png" },
            { id: 4, name: "최서연", userId: "2024004", profileImage: "/profile.png" },
            { id: 5, name: "정우진", userId: "2024005", profileImage: "/profile.png" },
            { id: 6, name: "한소영", userId: "2024006", profileImage: "/profile.png" },
            { id: 7, name: "윤태현", userId: "2024007", profileImage: "/profile.png" },
            { id: 8, name: "강민지", userId: "2024008", profileImage: "/profile.png" },
            { id: 9, name: "조현우", userId: "2024009", profileImage: "/profile.png" },
            { id: 10, name: "신예린", userId: "2024010", profileImage: "/profile.png" },
          ]}
        />
>>>>>>> 81ca26b (커뮤니티 페이지 및 사이드바 수정: 페이지당 8개 게시물, 테이블 크기 조정, 수정 모드 개선)
      </div>
    </div>
  );
};

export default ClassDetailSidebar;