import React, { useState } from 'react';
import './SchoolMealCard.css';
import { getTodayMealData } from '../../mocks/mockMeal';

const SchoolMealCard = () => {
  const [selectedMealType, setSelectedMealType] = useState('석식');
  const [showMealSelector, setShowMealSelector] = useState(false);
  const mealData = getTodayMealData();

  const handleMealTypeClick = () => {
    setShowMealSelector(!showMealSelector);
  };

  const handleMealSelect = (mealType) => {
    setSelectedMealType(mealType);
    setShowMealSelector(false);
  };

  const currentMeal = mealData[selectedMealType];

  if (!mealData || Object.keys(mealData).length === 0 || !currentMeal) {
    return <div className="meal-card">로딩 중...</div>;
  }

  return (
    <div className="meal-card">
      <div className="meal-card-header">
        <h3 className="meal-card-title">오늘의 급식</h3>
        <div className="meal-card-info">
          <div className="meal-type-container">
            <button 
              className="meal-type-btn"
              onClick={handleMealTypeClick}
            >
              {selectedMealType}
            </button>
            {showMealSelector && (
              <div className="meal-selector">
                {Object.keys(mealData).map((mealType) => (
                  <button
                    key={mealType}
                    className={`meal-option ${selectedMealType === mealType ? 'active' : ''}`}
                    onClick={() => handleMealSelect(mealType)}
                  >
                    {mealType}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="calories-badge">
            {currentMeal?.calories || 0} Kcal
          </div>
        </div>
      </div>

      <div className="meal-card-content">
        <div className="menu-items">
          {currentMeal?.menu?.map((item, index) => (
            <div key={index} className="menu-item-small">
              {item}
            </div>
          ))}
        </div>
        <div className="meal-character-small">
          <img 
            src="/meister-sw.png" 
            alt="급식 캐릭터" 
            className="character-img"
          />
        </div>
      </div>
    </div>
  );
};

export default SchoolMealCard;
