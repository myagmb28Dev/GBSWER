import React, { useState } from 'react';
import './AddEventModal.css';

const AddEventModal = ({ selectedDate, onClose, onAddEvent }) => {
  const pastelColors = [
    '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF', '#E0BBE4'
  ];

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    title: '',
    startDate: formatDate(selectedDate),
    endDate: formatDate(selectedDate),
    memo: '',
    color: pastelColors[0],
    showInSchedule: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onAddEvent(formData);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>일정 추가</h3>
                  <div className="form-group">
            <div className="color-picker">
              {pastelColors.map((color) => (
                <button
                  type="button"
                  key={color}
                  className={`color-option ${formData.color === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>
          </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>제목</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="일정 제목을 입력하세요"
              required
            />
          </div>

          <div className="form-group">
            <label>시작 날짜</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>종료 날짜</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>메모</label>
            <textarea
              name="memo"
              value={formData.memo}
              onChange={handleChange}
              placeholder="메모를 입력하세요"
              rows="3"
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', cursor: 'pointer' }} onClick={(e) => {
              if (e.target.type !== 'checkbox') {
                setFormData({ ...formData, showInSchedule: !formData.showInSchedule });
              }
            }}>
              <input
                type="checkbox"
                checked={formData.showInSchedule}
                onChange={(e) => setFormData({ ...formData, showInSchedule: e.target.checked })}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '14px', color: '#555', fontWeight: '600' }}>일정표에 표시</span>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              취소
            </button>
            <button type="submit" className="btn-submit">
              추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventModal;
