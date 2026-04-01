import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { useAppContext } from '../../../App';
import './MealCard.css';

const MealCard = () => {
  const [selectedMealType, setSelectedMealType] = useState('석식');
  const [showMealSelector, setShowMealSelector] = useState(false);
  const [mealData, setMealData] = useState({});
  const { cachedMeals, setCachedMeals, mealsRefreshing, setMealsRefreshing } = useAppContext();
  const initialRun = useRef(true);

  const mapDayToUi = (dayObj) => {
    const mapped = {};
    const mealKeys = ['breakfast', 'lunch', 'dinner'];
    mealKeys.forEach((en) => {
      const kr = en === 'breakfast' ? '조식' : en === 'lunch' ? '중식' : '석식';
      const meal = (dayObj && (dayObj[en] || dayObj[kr])) || null;
      if (meal) {
        const dishes = Array.isArray(meal.dishes) ? meal.dishes : (Array.isArray(meal.menu) ? meal.menu : []);
        const calorieStr = meal.calorie ?? meal.calories ?? meal.kcal ?? '';
        const caloriesNum = parseInt(String(calorieStr).replace(/[^0-9]/g, '')) || 0;
        const obj = { menu: dishes, dishes, calorie: calorieStr, calories: caloriesNum };
        mapped[en] = obj;
        mapped[kr] = obj;
      }
    });
    return mapped;
  };

  useEffect(() => {
    let mounted = true;

    const waitForCache = (key) => new Promise((resolve) => {
      const start = Date.now();
      const iv = setInterval(() => {
        if (cachedMeals && cachedMeals[key]) { clearInterval(iv); resolve(cachedMeals[key]); }
        if (Date.now() - start > 5000) { clearInterval(iv); resolve(null); }
      }, 200);
    });

    const fetchMeals = async (isInitial = false) => {
      try {
        const token = localStorage.getItem('accessToken');
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const key = `${year}-${month}`;

        // use cache if available
        if (cachedMeals && cachedMeals[key]) {
          if (!mounted) return;
          setMealData(cachedMeals[key]);
          initialRun.current = false;
          return;
        }

        // try GET first
        try {
          const res = await axiosInstance.get(`/api/meals?year=${year}&month=${month}`);
          console.log('MealCard: GET /api/meals raw response:', res.data);
          const respData = res.data?.data ?? res.data ?? {};
          // backend returns map YYYY-MM-DD -> DayMealsDto
          const todayKey = today.toISOString().slice(0,10);
          let dayObj = {};
          if (respData && typeof respData === 'object' && !Array.isArray(respData)) {
            dayObj = respData[todayKey] || respData[`${year}${String(month).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`] || respData[String(today.getDate())] || {};
          } else if (Array.isArray(respData)) {
            dayObj = respData[today.getDate() - 1] || {};
          }
          const mapped = mapDayToUi(dayObj);
          console.log('MealCard: mapped from GET for today:', mapped);
          // if GET returned empty mapping, treat as "not found" and attempt refresh
          if (!mapped || Object.keys(mapped).length === 0) {
            console.log('MealCard: GET returned empty mapping, will attempt refresh');
            // avoid duplicate refresh if another in progress
            if (mealsRefreshing && mealsRefreshing[key]) {
              const data = await waitForCache(key);
              if (!mounted) return;
              setMealData(data || {});
              initialRun.current = false;
              return;
            }

            setMealsRefreshing && setMealsRefreshing(prev => ({ ...prev, [key]: true }));
            try {
              console.log('MealCard: POST /api/meals/refresh called');
              const refreshRes = await axiosInstance.post(`/api/meals/refresh?year=${year}&month=${month}`, {});
              console.log('MealCard: refresh raw response:', refreshRes.data);
              const resp = refreshRes.data?.data ?? refreshRes.data ?? {};
              // Normalize refresh response: if it's a month-map, map entire month and cache it.
              let mappedFromRefresh = {};
              const isoNoDash = `${year}${String(month).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`;
              const dayNum = String(today.getDate());
              if (resp && typeof resp === 'object' && !Array.isArray(resp)) {
                const keys = Object.keys(resp);
                const looksLikeMap = keys.some(k => /\d{4}-\d{2}-\d{2}/.test(k) || /^\d{8}$/.test(k) || /^\d{1,2}$/.test(k));
                if (looksLikeMap) {
                  const monthMap = {};
                  keys.forEach(k => {
                    try {
                      monthMap[k] = mapDayToUi(resp[k] || {});
                    } catch (e) { monthMap[k] = {}; }
                  });
                  mappedFromRefresh = monthMap;
                  setCachedMeals && setCachedMeals(prev => ({ ...prev, [key]: monthMap }));
                } else {
                  const dayObjR = resp[todayKey] || resp[isoNoDash] || resp[dayNum] || {};
                  mappedFromRefresh = mapDayToUi(dayObjR);
                  setCachedMeals && setCachedMeals(prev => ({ ...prev, [key]: mappedFromRefresh }));
                }
              } else if (Array.isArray(resp)) {
                const dayObjR = resp[today.getDate() - 1] || {};
                mappedFromRefresh = mapDayToUi(dayObjR);
                setCachedMeals && setCachedMeals(prev => ({ ...prev, [key]: mappedFromRefresh }));
              }
              console.log('MealCard: mappedFromRefresh:', mappedFromRefresh);
              // for initial run use refresh immediately
              if (initialRun.current) {
                if (!mounted) return;
                setMealData(mappedFromRefresh);
                initialRun.current = false;
                return;
              }
              if (mappedFromRefresh && Object.keys(mappedFromRefresh).length > 0) {
                console.log('MealCard: using refresh response (non-empty), skipping GET-after-refresh');
                if (!mounted) return;
                setMealData(mappedFromRefresh);
                setCachedMeals && setCachedMeals(prev => ({ ...prev, [key]: mappedFromRefresh }));
                return;
              }
              // else try GET-after-refresh
              try {
                const getAfter = await axiosInstance.get(`/api/meals?year=${year}&month=${month}`);
                console.log('MealCard: GET-after-refresh raw response:', getAfter.data);
                const getResp = getAfter.data?.data ?? getAfter.data ?? {};
                let finalDay = {};
                if (getResp && typeof getResp === 'object' && !Array.isArray(getResp)) {
                  finalDay = getResp[todayKey] || getResp[`${year}${String(month).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`] || getResp[String(today.getDate())] || {};
                } else if (Array.isArray(getResp)) {
                  finalDay = getResp[today.getDate() - 1] || {};
                }
                const finalMapped = mapDayToUi(finalDay);
                if (!mounted) return;
                setMealData(finalMapped);
                setCachedMeals && setCachedMeals(prev => ({ ...prev, [key]: finalMapped }));
              } catch (getAfterErr) {
                if (!mounted) return;
                setMealData(mappedFromRefresh);
              }
            } finally {
              setMealsRefreshing && setMealsRefreshing(prev => ({ ...prev, [key]: false }));
              initialRun.current = false;
            }
          }
          if (!mounted) return;
          setMealData(mapped);
          setCachedMeals && setCachedMeals(prev => ({ ...prev, [key]: mapped }));
          initialRun.current = false;
          return;
        } catch (err) {
          if (!(err.response && err.response.status === 404)) throw err;
          // 404 -> refresh
          if (mealsRefreshing && mealsRefreshing[key]) {
            const data = await waitForCache(key);
            if (!mounted) return;
            setMealData(data || {});
            initialRun.current = false;
            return;
          }

          setMealsRefreshing && setMealsRefreshing(prev => ({ ...prev, [key]: true }));
          try {
            const refreshRes = await axiosInstance.post(`/api/meals/refresh?year=${year}&month=${month}`, {});
            const resp = refreshRes.data?.data ?? refreshRes.data ?? {};
            // Normalize and cache refresh response as month-map when applicable
            let mappedFromRefresh = {};
            const todayKey = today.toISOString().slice(0,10);
            const isoNoDash = `${year}${String(month).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`;
            const dayNum = String(today.getDate());
            if (resp && typeof resp === 'object' && !Array.isArray(resp)) {
              const keys = Object.keys(resp);
              const looksLikeMap = keys.some(k => /\d{4}-\d{2}-\d{2}/.test(k) || /^\d{8}$/.test(k) || /^\d{1,2}$/.test(k));
              if (looksLikeMap) {
                const monthMap = {};
                keys.forEach(k => {
                  try { monthMap[k] = mapDayToUi(resp[k] || {}); } catch (e) { monthMap[k] = {}; }
                });
                mappedFromRefresh = monthMap;
                setCachedMeals && setCachedMeals(prev => ({ ...prev, [key]: monthMap }));
              } else {
                const dayObj = resp[todayKey] || resp[isoNoDash] || resp[dayNum] || {};
                mappedFromRefresh = mapDayToUi(dayObj);
                setCachedMeals && setCachedMeals(prev => ({ ...prev, [key]: mappedFromRefresh }));
              }
            } else if (Array.isArray(resp)) {
              const dayObj = resp[today.getDate() - 1] || {};
              mappedFromRefresh = mapDayToUi(dayObj);
              setCachedMeals && setCachedMeals(prev => ({ ...prev, [key]: mappedFromRefresh }));
            }

            // initial load: use refresh response immediately (pick today's entry if month-map)
            if (isInitial) {
              if (!mounted) return;
              if (mappedFromRefresh && Object.keys(mappedFromRefresh).length > 0) {
                const todayMapped = mappedFromRefresh[todayKey] || mappedFromRefresh[isoNoDash] || mappedFromRefresh[dayNum] || (Object.values(mappedFromRefresh)[0] || {});
                setMealData(todayMapped);
              } else {
                setMealData({});
              }
              initialRun.current = false;
              return;
            }

            // If refresh returned data, use it and DO NOT call GET (choose today's entry if month-map)
            if (mappedFromRefresh && Object.keys(mappedFromRefresh).length > 0) {
              const todayMapped = mappedFromRefresh[todayKey] || mappedFromRefresh[isoNoDash] || mappedFromRefresh[dayNum] || (Object.values(mappedFromRefresh)[0] || {});
              if (!mounted) return;
              setMealData(todayMapped);
              setCachedMeals && setCachedMeals(prev => ({ ...prev, [key]: mappedFromRefresh }));
              return;
            }

            // Otherwise, try GET after refresh as a fallback to read DB-populated data
            try {
              const getAfter = await axiosInstance.get(`/api/meals?year=${year}&month=${month}`);
              const getResp = getAfter.data?.data ?? getAfter.data ?? {};
              let finalDay = {};
              if (getResp && typeof getResp === 'object' && !Array.isArray(getResp)) {
                const todayKey = today.toISOString().slice(0,10);
                finalDay = getResp[todayKey] || getResp[`${year}${String(month).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`] || getResp[String(today.getDate())] || {};
              } else if (Array.isArray(getResp)) {
                finalDay = getResp[today.getDate() - 1] || {};
              }
              const finalMapped = mapDayToUi(finalDay);
              if (!mounted) return;
              setMealData(finalMapped);
              setCachedMeals && setCachedMeals(prev => ({ ...prev, [key]: finalMapped }));
            } catch (getAfterErr) {
              // fallback to refresh response
              if (!mounted) return;
              setMealData(mappedFromRefresh);
            }
          } finally {
            setMealsRefreshing && setMealsRefreshing(prev => ({ ...prev, [key]: false }));
            initialRun.current = false;
          }
        }
      } catch (e) {
        if (!mounted) return;
        setMealData({});
      }
    };

    // initial call: pass isInitial = true
    fetchMeals(initialRun.current);

    return () => { mounted = false; };
  }, [cachedMeals, mealsRefreshing, setCachedMeals, setMealsRefreshing]);

  const handleMealTypeClick = () => setShowMealSelector(!showMealSelector);
  const handleMealSelect = (mealType) => { setSelectedMealType(mealType); setShowMealSelector(false); };

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
            <button className="meal-type-btn" onClick={handleMealTypeClick}>{selectedMealType}</button>
            {showMealSelector && (
              <div className="meal-selector">
                {Object.keys(mealData).map((mealType) => (
                  <button key={mealType} className={`meal-option ${selectedMealType === mealType ? 'active' : ''}`} onClick={() => handleMealSelect(mealType)}>{mealType}</button>
                ))}
              </div>
            )}
          </div>
          <div className="calories-badge">{currentMeal?.calories || 0} Kcal</div>
        </div>
      </div>

      <div className="meal-card-content">
        <div className="menu-items">
          {currentMeal?.menu?.map((item, index) => (
            <div key={index} className="menu-item-small">{item}</div>
          ))}
        </div>
        <div className="meal-character-small">
          <img src="/meister-sw.png" alt="급식 캐릭터" className="character-img" />
        </div>
      </div>
    </div>
  );
};

export default MealCard;