import React, { useState } from 'react';
import './ViewEventModal.css';

const ViewEventModal = ({ event, onClose, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: event.title,
    startDate: event.startDate,
    endDate: event.endDate,
    memo: event.memo,
    color: event.color,
    showInSchedule: event.showInSchedule !== undefined ? event.showInSchedule : true
  });

  const pastelColors = [
    '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF', '#E0BBE4'
  ];

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    onEdit(event.id, editData);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('이 일정을 삭제하시겠습니까?')) {
      onDelete(event.id);
      onClose();
    }
  };

  const handleChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
        {!isEditing ? (
          <>
            <h2 className="event-title-large">{event.title}</h2>
            <div className="modal-header-actions">
              <button onClick={handleEdit} className="btn-edit">
                수정
              </button>
              <button onClick={handleDelete} className="btn-delete">
                삭제
              </button>
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
            <div className="modal-actions">
              <button onClick={onClose} className="btn-cancel">
                닫기
              </button>
            </div>
          </>
        ) : (
          <>
            <h3>일정 수정</h3>
            <form onSubmit={handleSave}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', cursor: 'pointer' }} onClick={(e) => {
                  if (e.target.type !== 'checkbox') {
                    setEditData({ ...editData, showInSchedule: !editData.showInSchedule });
                  }
                }}>
                  <input
                    type="checkbox"
                    checked={editData.showInSchedule}
                    onChange={(e) => setEditData({ ...editData, showInSchedule: e.target.checked })}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '14px', color: '#555', fontWeight: '600' }}>일정표에 표시</span>
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
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ViewEventModal;
