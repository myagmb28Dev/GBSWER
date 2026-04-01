import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../../App';
import './ViewEventModal.css';

const ViewEventModal = ({ event, onClose, onDelete, onEdit }) => {
  const { userRole } = useAppContext();
  // React Hooks는 조건부 호출 불가 - 최상위에서 호출해야 함
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: event?.title || '',
    startDate: event?.startDate || '',
    endDate: event?.endDate || '',
    memo: event?.memo || '',
    color: event?.color || '#FFB3BA',
    showInSchedule: Boolean(event?.showInSchedule === true || event?.showInSchedule === 'true' ||
                           event?.showInSchedule === 1 || event?.showInSchedule === '1')
  });

  console.log('🎯 ViewEventModal 열림 (페이지:', window.location.pathname, '), 이벤트 데이터:', {
    id: event?.id,
    title: event?.title,
    showInSchedule: event?.showInSchedule,
    showInScheduleType: typeof event?.showInSchedule,
    hasEvent: !!event
  });

  // 이벤트 데이터 검증
  if (!event || !event.id) {
    console.error('❌ ViewEventModal에 유효하지 않은 이벤트 데이터:', event);
    onClose();
    return null;
  }

  console.log('📝 ViewEventModal 초기 editData:', editData);

  const pastelColors = [
    '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF', '#E0BBE4'
  ];

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    console.log('💾 ViewEventModal 저장 버튼 클릭 (페이지:', window.location.pathname, ')');
    console.log('📊 이벤트 ID:', event.id);
    console.log('📝 수정할 데이터 (editData):', editData);
    console.log('🎯 showInSchedule 값:', editData.showInSchedule, '(타입:', typeof editData.showInSchedule, ')');

    if (!event || !event.id) {
      console.error('❌ 이벤트 객체 또는 ID가 없음:', event);
      return;
    }

    if (typeof onEdit !== 'function') {
      console.error('❌ onEdit가 함수가 아님:', onEdit);
      alert('수정 기능을 사용할 수 없습니다.');
      return;
    }

    console.log('🔄 onEdit 함수 호출 시도...');
    try {
      // onEdit가 Promise를 반환하는 경우를 대비해 await 사용
      const editPromise = onEdit(event.id, editData);
      if (editPromise && typeof editPromise.then === 'function') {
        await editPromise;
      }
      console.log('✅ onEdit 함수 호출 완료');
      // onEdit에서 새로고침이 실행되므로 onClose는 호출하지 않음
      // 새로고침이 실행되지 않는 경우를 대비해 모달 닫기
      setTimeout(() => {
        onClose();
      }, 100);
    } catch (error) {
      console.error('❌ onEdit 함수 호출 중 에러:', error);
      alert('수정 중 오류가 발생했습니다.');
      onClose();
    }
  };

  const handleDelete = () => {
    if (window.confirm('이 일정을 삭제하시겠습니까?')) {
      onDelete(event.id);
      onClose();
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData({
      ...editData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const modalContent = (
    <div className="modal-overlay view-event-modal-overlay" onClick={onClose}>
      <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
        {/* 닫기 버튼을 상단으로 이동 */}
        <button className="modal-close-top" onClick={onClose} title="닫기">
          ×
        </button>
        {!isEditing ? (
          <>
            <h2 className="event-title-large">{event.title}</h2>
            <div className="modal-header-actions">
              <div className="category-button">{event.category || '개인'}</div>
              {/* 학생은 학사일정을 수정/삭제할 수 없음 (카테고리: 학교, 학사, 학과) */}
              {(userRole !== 'student' || (event.category !== '학교' && event.category !== '학사' && event.category !== '학과')) && (
              <div className="action-buttons">
                <button onClick={handleEdit} className="btn-edit">
                  수정
                </button>
                <button onClick={handleDelete} className="btn-delete">
                  삭제
                </button>
              </div>
              )}
            </div>
            <div className="event-detail">
              <div className="detail-section">
                <span className="detail-label">기간</span>
                <div className="detail-box">{event.startDate} ~ {event.endDate}</div>
              </div>
              {event.memo && (
                <div className="detail-section">
                  <span className="detail-label">메모</span>
                  <div className="detail-box memo">{event.memo}</div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <h3>일정 수정</h3>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <div className="color-picker">
                  {pastelColors.map((color) => (
                    <button
                      type="button"
                      key={color}
                      className={`color-option ${editData.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setEditData({ ...editData, color })}
                    />
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>제목</label>
                <input
                  type="text"
                  name="title"
                  value={editData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>시작 날짜</label>
                <input
                  type="date"
                  name="startDate"
                  value={editData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>종료 날짜</label>
                <input
                  type="date"
                  name="endDate"
                  value={editData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>메모</label>
                <textarea
                  name="memo"
                  value={editData.memo}
                  onChange={handleChange}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0', cursor: 'pointer', justifyContent: 'flex-start', width: 'fit-content' }} onClick={(e) => {
                  if (e.target.type !== 'checkbox') {
                    setEditData({ ...editData, showInSchedule: !editData.showInSchedule });
                  }
                }}>
                  <input
                    type="checkbox"
                    checked={editData.showInSchedule}
                    onChange={(e) => setEditData({ ...editData, showInSchedule: e.target.checked })}
                    style={{ cursor: 'pointer', margin: '0', marginRight: '0' }}
                  />
                  <span style={{ fontSize: '14px', color: '#555', fontWeight: '600', marginLeft: '0' }}>일정표에 표시</span>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setIsEditing(false)} className="btn-cancel">
                  취소
                </button>
                <button type="submit" className="btn-submit">
                  저장
                </button>
              </div>
              {/* 수정 모드에서도 닫기 버튼은 상단에 유지 */}
            </form>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ViewEventModal;
