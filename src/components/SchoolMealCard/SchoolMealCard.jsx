import React, { useState } from 'react';
import './SchoolMealCard.css';
import axiosInstance from '../../api/axiosInstance';
import { useEffect } from 'react';
import { useAppContext } from '../../App';

const SchoolMealCard = () => {
  const [selectedMealType, setSelectedMealType] = useState('석식'); // 한글로만 사용
  const [showMealSelector, setShowMealSelector] = useState(false);
  const [mealData, setMealData] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(true);
  const { cachedMeals, setCachedMeals, mealsRefreshing, setMealsRefreshing } = useAppContext();


  const mapSingleDay = (raw) => {
    const mapped = {};
    const mealKeys = [['breakfast','조식'], ['lunch','중식'], ['dinner','석식']];
    mealKeys.forEach(([en, kr]) => {
      const meal = raw[en] || raw[kr] || raw[en.toLowerCase()];
      if (meal) {
        const dishesArr = Array.isArray(meal.dishes) ? meal.dishes : (Array.isArray(meal.menu) ? meal.menu : []);
        const calorieStr = meal.calorie ?? meal.calories ?? meal.kcal ?? '';
        const caloriesNum = parseInt(String(calorieStr).replace(/[^0-9]/g, '')) || 0;
        const obj = { menu: dishesArr, dishes: dishesArr, calorie: calorieStr, calories: caloriesNum };
        mapped[en] = obj;
        mapped[kr] = obj;
      }
    });
    return mapped;
  };

  useEffect(() => {
    const fetchMeal = async () => {
      // 이미 로딩 중이거나 데이터가 있으면 중복 실행 방지
      if (isLoading && Object.keys(mealData).length > 0) return;

      setIsLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const now = new Date();
        // 현재 로컬 날짜를 정확히 파악
        const year = now.getFullYear();
        const month = now.getMonth() + 1; // 1-12
        const day = now.getDate();
        const dayOfWeek = now.getDay(); // 0=일요일, 1=월요일, ..., 6=토요일

        // 다양한 날짜 포맷 생성
        const dateFormats = {
          iso: `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`,
          isoNoDash: `${year}${String(month).padStart(2,'0')}${String(day).padStart(2,'0')}`,
          dayOnly: String(day),
          monthDay: `${String(month).padStart(2,'0')}${String(day).padStart(2,'0')}`,
          koreanFormat: `${year}년 ${month}월 ${day}일`,
        };

        const key = `${year}-${month}`;
        if (cachedMeals && cachedMeals[key]) {
          setMealData(cachedMeals[key]);
          setIsLoading(false);
          return;
        }
        const res = await axiosInstance.get(`/api/meals?year=${year}&month=${month}`);
        console.log('SchoolMealCard: GET /api/meals raw response:', res.data);

        console.log('SchoolMealCard: Current local date info:');
        console.log('  - Year:', year);
        console.log('  - Month:', month);
        console.log('  - Day:', day);
        console.log('  - Day of week:', dayOfWeek, ['일', '월', '화', '수', '목', '금', '토'][dayOfWeek] + '요일');
        console.log('  - Full date:', now.toString());
        console.log('  - Local date string:', now.toLocaleDateString());

        const respData = res.data?.data ?? res.data;

        // API에서 29일 데이터를 우선적으로 찾도록 수정
        console.log('SchoolMealCard: Processing API response for 29th data');
        let raw = {};
        // 날짜별 급식 데이터를 찾는 헬퍼 함수
        const findMealDataByDate = (data, targetDate) => {
          const searchFormats = [
            targetDate.iso,
            targetDate.isoNoDash,
            targetDate.dayOnly,
            targetDate.monthDay,
            `${targetDate.year}-${String(targetDate.month).padStart(2,'0')}-${String(targetDate.day).padStart(2,'0')}`,
            `${targetDate.year}${String(targetDate.month).padStart(2,'0')}${String(targetDate.day).padStart(2,'0')}`,
            String(targetDate.day),
            String(targetDate.month * 100 + targetDate.day),
          ];

          console.log('SchoolMealCard: Searching for date with formats:', searchFormats);

          if (Array.isArray(data)) {
            for (let i = 0; i < data.length; i++) {
              const item = data[i];
              if (!item || typeof item !== 'object') continue;

              const itemDate = item.date || item.day || item.dateString || item.dt;
              console.log(`SchoolMealCard: Checking array item ${i}, date:`, itemDate);

              if (searchFormats.includes(String(itemDate))) {
                console.log('SchoolMealCard: Found matching item in array:', item);
                return item.meals || item.data || item;
              }
            }

            // 날짜로 찾지 못했으면 인덱스로 시도
            const possibleIndex = targetDate.day - 1;
            if (possibleIndex >= 0 && possibleIndex < data.length) {
              console.log('SchoolMealCard: Trying index fallback:', possibleIndex);
              const fallbackItem = data[possibleIndex];
              if (fallbackItem && typeof fallbackItem === 'object') {
                return fallbackItem.meals || fallbackItem.data || fallbackItem;
              }
            }

            return null;
          } else if (data && typeof data === 'object') {
            for (const format of searchFormats) {
              if (data[format]) {
                console.log('SchoolMealCard: Found matching data in object:', format, data[format]);
                return data[format];
              }
            }
            return null;
          }

          return null;
        };

        console.log('SchoolMealCard: respData type:', Array.isArray(respData) ? 'array' : typeof respData);
        console.log('SchoolMealCard: respData sample:', Array.isArray(respData) ? respData.slice(0, 3) : Object.keys(respData || {}).slice(0, 5));

        if (Array.isArray(respData)) {
          console.log('SchoolMealCard: Array data, length:', respData.length);

          // 현재 날짜 정보를 담은 객체 생성
          const currentDate = { year, month, day, dayOfWeek, ...dateFormats };

          // 헬퍼 함수로 데이터 찾기
          const foundData = findMealDataByDate(respData, currentDate);
          raw = foundData || {};

          console.log('SchoolMealCard: Found data for current date:', raw);

        } else if (respData && typeof respData === 'object') {
          console.log('SchoolMealCard: Object data, keys:', Object.keys(respData));

          // 현재 날짜 정보를 담은 객체 생성
          const currentDate = { year, month, day, dayOfWeek, ...dateFormats };

          // 헬퍼 함수로 데이터 찾기
          const foundData = findMealDataByDate(respData, currentDate);
          raw = foundData || respData; // 찾지 못했으면 전체 객체 사용

          console.log('SchoolMealCard: Found data for current date in object:', raw);
        }
        console.log('SchoolMealCard: extracted raw object:', raw);
        const mapped = {};
        // 한글 키만 사용
        const mealKeys = ['조식', '중식', '석식'];
        const englishKeys = ['breakfast', 'lunch', 'dinner'];

        mealKeys.forEach((kr, index) => {
          const en = englishKeys[index];
          const meal = raw[kr] || raw[en] || raw[en.toLowerCase()];
          if (meal) {
            const dishesArr = Array.isArray(meal.dishes) ? meal.dishes : (Array.isArray(meal.menu) ? meal.menu : []);
            const calorieStr = meal.calorie ?? meal.calories ?? meal.kcal ?? '';
            const caloriesNum = parseInt(String(calorieStr).replace(/[^0-9]/g, '')) || 0;
            const obj = { menu: dishesArr, dishes: dishesArr, calorie: calorieStr, calories: caloriesNum };
            // 한글 키만 설정
            mapped[kr] = obj;
          }
        });
        console.log('SchoolMealCard: mapped object after processing:', mapped);
        // if mapped empty, trigger refresh similar to previous behavior
        if (!mapped || Object.keys(mapped).length === 0) {
          console.log('SchoolMealCard: GET returned empty mapping, will attempt refresh');
          if (mealsRefreshing && mealsRefreshing[key]) {
            const waitForCache = () => new Promise(resolve => {
              const start = Date.now();
              const iv = setInterval(() => {
                if (cachedMeals && cachedMeals[key]) { clearInterval(iv); resolve(cachedMeals[key]); }
                if (Date.now() - start > 5000) { clearInterval(iv); resolve(null); }
              }, 200);
            });
            const data = await waitForCache();
            setMealData(data || {});
            setIsLoading(false);
            return;
          }
            setMealsRefreshing(prev => ({ ...prev, [key]: true }));
            try {
            console.log('SchoolMealCard: POST /api/meals/refresh called');
            const refreshRes = await axiosInstance.post(`/api/meals/refresh?year=${year}&month=${month}`, {});
            console.log('SchoolMealCard: refresh raw response:', refreshRes.data);
            const resp = refreshRes.data?.data || refreshRes.data || {};
            const todayKey = now.toISOString().slice(0,10);
            const isoNoDash = `${year}${String(month).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
            const dayNum = String(now.getDate());
            let mapped2 = {};
            if (resp && typeof resp === 'object' && !Array.isArray(resp)) {
              const keys = Object.keys(resp);
              const looksLikeMap = keys.some(k => /\d{4}-\d{2}-\d{2}/.test(k) || /^\d{8}$/.test(k) || /^\d{1,2}$/.test(k));
              if (looksLikeMap) {
                const monthMap = {};
                keys.forEach(k => {
                  try { monthMap[k] = mapSingleDay(resp[k] || {}); } catch (e) { monthMap[k] = {}; }
                });
                mapped2 = monthMap;
                setCachedMeals(prev => ({ ...prev, [key]: monthMap }));
              } else {
                const raw2 = resp[todayKey] || resp[isoNoDash] || resp[dayNum] || {};
                mapped2 = mapSingleDay(raw2);
                setCachedMeals(prev => ({ ...prev, [key]: mapped2 }));
              }
            } else if (Array.isArray(resp)) {
              const raw2 = resp[now.getDate() - 1] || {};
              mapped2 = mapSingleDay(raw2);
              setCachedMeals(prev => ({ ...prev, [key]: mapped2 }));
            }
            console.log('SchoolMealCard: mappedFromRefresh:', mapped2);
            if (mapped2 && Object.keys(mapped2).length > 0) {
              console.log('SchoolMealCard: using refresh response (non-empty), skipping GET-after-refresh');
              // 헬퍼 함수 생성 및 현재 날짜의 데이터 찾기
            const findMealDataByDate = (data, targetDate) => {
              const searchFormats = [
                targetDate.iso,
                targetDate.isoNoDash,
                targetDate.dayOnly,
                targetDate.monthDay,
                `${targetDate.year}-${String(targetDate.month).padStart(2,'0')}-${String(targetDate.day).padStart(2,'0')}`,
                `${targetDate.year}${String(targetDate.month).padStart(2,'0')}${String(targetDate.day).padStart(2,'0')}`,
                String(targetDate.day),
                String(targetDate.month * 100 + targetDate.day),
              ];

              if (Array.isArray(data)) {
                for (let i = 0; i < data.length; i++) {
                  const item = data[i];
                  if (!item || typeof item !== 'object') continue;

                  const itemDate = item.date || item.day || item.dateString || item.dt;
                  if (searchFormats.includes(String(itemDate))) {
                    return item.meals || item.data || item;
                  }
                }

                const possibleIndex = targetDate.day - 1;
                if (possibleIndex >= 0 && possibleIndex < data.length) {
                  const fallbackItem = data[possibleIndex];
                  if (fallbackItem && typeof fallbackItem === 'object') {
                    return fallbackItem.meals || fallbackItem.data || fallbackItem;
                  }
                }
                return null;
              } else if (data && typeof data === 'object') {
                for (const format of searchFormats) {
                  if (data[format]) return data[format];
                }
                return null;
              }
              return null;
            };
            const currentDate = { year, month, day, dayOfWeek, ...dateFormats };
            const todayMapped = findMealDataByDate(mapped2, currentDate) || (Object.values(mapped2)[0] || {});

            console.log('SchoolMealCard: Using current date data from refresh:', todayMapped);
            setMealData(todayMapped);
            setMealsRefreshing(prev => ({ ...prev, [key]: false }));
            return;
            }
            try {
              const getRes = await axiosInstance.get(`/api/meals?year=${year}&month=${month}`);
              console.log('급식 GET(리프레시 후) 응답 원본:', getRes.data);
              console.log('SchoolMealCard: GET-after-refresh raw response:', getRes.data);
              const getResp = getRes.data?.data ?? getRes.data ?? {};
              let finalRaw = {};
              // 헬퍼 함수 생성
              const findMealDataByDate = (data, targetDate) => {
                const searchFormats = [
                  targetDate.iso,
                  targetDate.isoNoDash,
                  targetDate.dayOnly,
                  targetDate.monthDay,
                  `${targetDate.year}-${String(targetDate.month).padStart(2,'0')}-${String(targetDate.day).padStart(2,'0')}`,
                  `${targetDate.year}${String(targetDate.month).padStart(2,'0')}${String(targetDate.day).padStart(2,'0')}`,
                  String(targetDate.day),
                  String(targetDate.month * 100 + targetDate.day),
                ];

                if (Array.isArray(data)) {
                  for (let i = 0; i < data.length; i++) {
                    const item = data[i];
                    if (!item || typeof item !== 'object') continue;

                    const itemDate = item.date || item.day || item.dateString || item.dt;
                    if (searchFormats.includes(String(itemDate))) {
                      return item.meals || item.data || item;
                    }
                  }

                  const possibleIndex = targetDate.day - 1;
                  if (possibleIndex >= 0 && possibleIndex < data.length) {
                    const fallbackItem = data[possibleIndex];
                    if (fallbackItem && typeof fallbackItem === 'object') {
                      return fallbackItem.meals || fallbackItem.data || fallbackItem;
                    }
                  }
                  return null;
                } else if (data && typeof data === 'object') {
                  for (const format of searchFormats) {
                    if (data[format]) return data[format];
                  }
                  return null;
                }
                return null;
              };

              if (Array.isArray(getResp)) {
                console.log('SchoolMealCard: GET-after-refresh array, looking for current date');
                const currentDate = { year, month, day, dayOfWeek, ...dateFormats };
                const foundData = findMealDataByDate(getResp, currentDate);
                finalRaw = foundData || getResp[day - 1] || getResp[getResp.length - 1] || {};
                console.log('SchoolMealCard: Found current date in GET-after-refresh:', finalRaw);
              } else {
                const currentDate = { year, month, day, dayOfWeek, ...dateFormats };
                finalRaw = findMealDataByDate(getResp, currentDate) || getResp || {};
              }
              const finalMapped = {};
              // 한글 키만 사용
              ['조식','중식','석식'].forEach((mealType) => {
                const meal = finalRaw[mealType] || finalRaw[mealType.toLowerCase()];
                if (meal) {
                  const dishesArrF = Array.isArray(meal.dishes) ? meal.dishes : (Array.isArray(meal.menu) ? meal.menu : []);
                  const calorieStrF = meal.calorie ?? meal.calories ?? meal.kcal ?? '';
                  const caloriesNumF = parseInt(String(calorieStrF).replace(/[^0-9]/g, '')) || 0;
                  finalMapped[mealType] = { menu: dishesArrF, dishes: dishesArrF, calorie: calorieStrF, calories: caloriesNumF };
                }
              });
              setMealData(finalMapped);
              setCachedMeals(prev => ({ ...prev, [key]: finalMapped }));
            } catch (getAfterErr) {
              setMealData(mapped2);
            }
          } finally {
            setMealsRefreshing(prev => ({ ...prev, [key]: false }));
            setIsLoading(false);
          }
          return;
        }
        console.log('SchoolMealCard: setting mealData with mapped:', mapped);
        setMealData(mapped);
        setCachedMeals(prev => ({ ...prev, [key]: mapped }));
        setIsLoading(false);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          // 404면 강제 리프레시 API 호출하고, 리프레시 응답으로 캐시 세팅 후 GET으로 재조회
          const token = localStorage.getItem('accessToken');
          const now = new Date();
          const year = now.getFullYear();
          const month = now.getMonth() + 1;
          const day = now.getDate();
          const dayOfWeek = now.getDay();
          const dateFormats = {
            iso: `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`,
            isoNoDash: `${year}${String(month).padStart(2,'0')}${String(day).padStart(2,'0')}`,
            dayOnly: String(day),
            monthDay: `${String(month).padStart(2,'0')}${String(day).padStart(2,'0')}`,
          };
          const todayKey = now.toISOString().slice(0,10);
          const key = `${year}-${month}`;
          try {
            if (mealsRefreshing && mealsRefreshing[key]) {
              const waitForCache = () => new Promise(resolve => {
                const start = Date.now();
                const iv = setInterval(() => {
                  if (cachedMeals && cachedMeals[key]) { clearInterval(iv); resolve(cachedMeals[key]); }
                  if (Date.now() - start > 5000) { clearInterval(iv); resolve(null); }
                }, 200);
              });
              const data = await waitForCache();
              setMealData(data || {});
              setIsLoading(false);
              return;
            }
            setMealsRefreshing(prev => ({ ...prev, [key]: true }));
            const refreshRes = await axiosInstance.post(`/api/meals/refresh?year=${year}&month=${month}`, {});
            const resp = refreshRes.data?.data || refreshRes.data || {};
            const isoNoDash = `${year}${String(month).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
            const dayNum = String(now.getDate());
            let mapped2 = {};
            if (resp && typeof resp === 'object' && !Array.isArray(resp)) {
              const keys = Object.keys(resp);
              const looksLikeMap = keys.some(k => /\d{4}-\d{2}-\d{2}/.test(k) || /^\d{8}$/.test(k) || /^\d{1,2}$/.test(k));
              if (looksLikeMap) {
                const monthMap = {};
                keys.forEach(k => { try { monthMap[k] = mapSingleDay(resp[k] || {}); } catch (e) { monthMap[k] = {}; } });
                mapped2 = monthMap;
                setCachedMeals(prev => ({ ...prev, [key]: monthMap }));
              } else {
                const raw2 = resp[todayKey] || resp[isoNoDash] || resp[dayNum] || {};
                mapped2 = mapSingleDay(raw2);
                setCachedMeals(prev => ({ ...prev, [key]: mapped2 }));
              }
            } else if (Array.isArray(resp)) {
              const raw2 = resp[now.getDate() - 1] || {};
              mapped2 = mapSingleDay(raw2);
              setCachedMeals(prev => ({ ...prev, [key]: mapped2 }));
            }
            // If refresh returned data, use it and do NOT call GET
            if (mapped2 && Object.keys(mapped2).length > 0) {
              const todayMapped = mapped2[todayKey] || mapped2[isoNoDash] || mapped2[dayNum] || (Object.values(mapped2)[0] || {});
              setMealData(todayMapped);
              setMealsRefreshing(prev => ({ ...prev, [key]: false }));
              setIsLoading(false);
              return;
            }
            // Otherwise, GET after refresh to try reading DB-populated data
            try {
              const getRes = await axiosInstance.get(`/api/meals?year=${year}&month=${month}`);
              console.log('급식 GET(리프레시 후) 응답 원본:', getRes.data);
              const getResp = getRes.data?.data ?? getRes.data ?? {};
              let finalRaw = {};
              // 헬퍼 함수 생성
              const findMealDataByDate = (data, targetDate) => {
                const searchFormats = [
                  targetDate.iso,
                  targetDate.isoNoDash,
                  targetDate.dayOnly,
                  targetDate.monthDay,
                  `${targetDate.year}-${String(targetDate.month).padStart(2,'0')}-${String(targetDate.day).padStart(2,'0')}`,
                  `${targetDate.year}${String(targetDate.month).padStart(2,'0')}${String(targetDate.day).padStart(2,'0')}`,
                  String(targetDate.day),
                  String(targetDate.month * 100 + targetDate.day),
                ];

                if (Array.isArray(data)) {
                  for (let i = 0; i < data.length; i++) {
                    const item = data[i];
                    if (!item || typeof item !== 'object') continue;

                    const itemDate = item.date || item.day || item.dateString || item.dt;
                    if (searchFormats.includes(String(itemDate))) {
                      return item.meals || item.data || item;
                    }
                  }

                  const possibleIndex = targetDate.day - 1;
                  if (possibleIndex >= 0 && possibleIndex < data.length) {
                    const fallbackItem = data[possibleIndex];
                    if (fallbackItem && typeof fallbackItem === 'object') {
                      return fallbackItem.meals || fallbackItem.data || fallbackItem;
                    }
                  }
                  return null;
                } else if (data && typeof data === 'object') {
                  for (const format of searchFormats) {
                    if (data[format]) return data[format];
                  }
                  return null;
                }
                return null;
              };

              if (Array.isArray(getResp)) {
                console.log('SchoolMealCard: GET-after-refresh array, looking for current date');
                const currentDate = { year, month, day, dayOfWeek, ...dateFormats };
                const foundData = findMealDataByDate(getResp, currentDate);
                finalRaw = foundData || getResp[day - 1] || getResp[getResp.length - 1] || {};
                console.log('SchoolMealCard: Found current date in GET-after-refresh:', finalRaw);
              } else {
                const currentDate = { year, month, day, dayOfWeek, ...dateFormats };
                finalRaw = findMealDataByDate(getResp, currentDate) || getResp || {};
              }
              const finalMapped = {};
              // 한글 키만 사용
              ['조식','중식','석식'].forEach((mealType) => {
                const meal = finalRaw[mealType] || finalRaw[mealType.toLowerCase()];
                if (meal) {
                  const dishesArrF = Array.isArray(meal.dishes) ? meal.dishes : (Array.isArray(meal.menu) ? meal.menu : []);
                  const calorieStrF = meal.calorie ?? meal.calories ?? meal.kcal ?? '';
                  const caloriesNumF = parseInt(String(calorieStrF).replace(/[^0-9]/g, '')) || 0;
                  finalMapped[mealType] = { menu: dishesArrF, dishes: dishesArrF, calorie: calorieStrF, calories: caloriesNumF };
                }
              });
              setMealData(finalMapped);
              setCachedMeals(prev => ({ ...prev, [key]: finalMapped }));
            } catch (getAfterErr) {
              // GET 실패 시 리프레시 응답 사용
              setMealData(mapped2);
            }
            setMealsRefreshing(prev => ({ ...prev, [key]: false }));
            setIsLoading(false);
          } catch (refreshErr) {
            setMealsRefreshing(prev => ({ ...prev, [key]: false }));
            setMealData({});
            setIsLoading(false);
          }
        } else {
          setMealData({});
          setIsLoading(false);
        }
      }
    };
    fetchMeal();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMealTypeClick = () => {
    setShowMealSelector(!showMealSelector);
  };

  const handleMealSelect = (mealType) => {
    setSelectedMealType(mealType);
    setShowMealSelector(false);
  };

  const currentMeal = mealData[selectedMealType];
  console.log('SchoolMealCard render - isLoading:', isLoading, 'mealData:', Object.keys(mealData || {}), 'selectedMealType:', selectedMealType, 'currentMeal exists:', !!currentMeal);

  // 로딩 중이거나 데이터가 아직 준비되지 않은 경우
  // 현재 날짜 정보 계산 (render용)
  const now = new Date();
  const renderDate = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    dayOfWeek: now.getDay()
  };
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const currentDateString = `${renderDate.year}년 ${renderDate.month}월 ${renderDate.day}일 (${dayNames[renderDate.dayOfWeek]}요일)`;

  if (isLoading || (!mealData || Object.keys(mealData).length === 0)) {
    return (
      <div className="meal-card">
        <div className="meal-card-header">
          <h3 className="meal-card-title">오늘의 급식</h3>
          <div className="current-date-info" style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            {currentDateString}
          </div>
        </div>
        <div className="meal-card-content-empty">
          <div className="empty-meal-message">
            <p className="empty-meal-text">
              {isLoading ? `${renderDate.month}월 ${renderDate.day}일 급식 정보를 불러오는 중...` : '오늘은 급식이 제공되지 않습니다'}
            </p>
            {!isLoading && (
              <p className="empty-meal-subtext">
                {renderDate.dayOfWeek === 0 || renderDate.dayOfWeek === 6
                  ? '주말에는 급식이 제공되지 않습니다'
                  : '급식 데이터가 없습니다. 잠시 후 다시 시도해주세요.'}
              </p>
            )}
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
  }

  // 데이터는 있지만 선택된 식사 타입의 데이터가 없는 경우
  if (!currentMeal) {
    return (
      <div className="meal-card">
        <div className="meal-card-header">
          <h3 className="meal-card-title">오늘의 급식</h3>
          <div className="current-date-info" style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            {currentDateString}
          </div>
        </div>
        <div className="meal-card-content-empty">
          <div className="empty-meal-message">
            <p className="empty-meal-text">{selectedMealType} 정보가 없습니다</p>
            <p className="empty-meal-subtext">다른 식사 시간을 선택해보세요</p>
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
  }

  return (
    <div className="meal-card">
      <div className="meal-card-header">
        <h3 className="meal-card-title">오늘의 급식</h3>
        <div className="current-date-info" style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
          {currentDateString}
        </div>
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
                {['조식', '중식', '석식'].map((mealType) => (
                  mealData[mealType] && (
                    <button
                      key={mealType}
                      className={`meal-option ${selectedMealType === mealType ? 'active' : ''}`}
                      onClick={() => handleMealSelect(mealType)}
                    >
                      {mealType}
                    </button>
                  )
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
