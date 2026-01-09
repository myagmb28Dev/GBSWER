import axios from 'axios';

// Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'http://52.79.249.43:8080' 
    : '', // 개발 환경에서는 proxy 사용
  timeout: 10000,
});

// 토큰 갱신 중 Promise 캐싱 (동시 요청 처리)
let refreshTokenPromise = null;

// 토큰 갱신 함수
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    // refresh 요청은 인터셉터를 거치지 않도록 axios를 직접 사용
    // baseURL이 설정되어 있지 않으면 빈 문자열로 처리 (proxy 사용)
    const baseURL = axiosInstance.defaults.baseURL || '';
    const refreshUrl = baseURL ? `${baseURL}/api/auth/refresh` : '/api/auth/refresh';
    
    const response = await axios.post(refreshUrl, { refreshToken });

    const { accessToken, refreshToken: newRefreshToken } = response.data.data;

    // 새 토큰 저장
    localStorage.setItem('accessToken', accessToken);
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    }

    return accessToken;
  } catch (error) {
    // Refresh Token도 만료됨 → 로그인 페이지로
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('selectedUserRole');
    
    // 로그인 페이지로 리다이렉트
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
    
    throw error;
  }
};

// 공개 엔드포인트 목록 (토큰이 필요 없는 엔드포인트)
const publicEndpoints = [
  '/api/auth/login',
  '/api/auth/refresh',
  '/api/auth/email-reset',
  '/api/user/password/reset/send-code',
  '/api/user/password/reset/verify',
];

// 요청 인터셉터: 인가가 필요한 요청에만 accessToken 자동 추가
axiosInstance.interceptors.request.use(
  (config) => {
    // 공개 엔드포인트는 토큰 추가하지 않음
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url?.includes(endpoint)
    );
    
    if (!isPublicEndpoint) {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 401 에러 시 자동 토큰 갱신
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고, 아직 재시도하지 않은 요청인 경우
    // 단, 공개 엔드포인트는 토큰 갱신 시도하지 않음
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      originalRequest.url?.includes(endpoint)
    );

    if (error.response?.status === 401 && !originalRequest._retry && !isPublicEndpoint) {
      originalRequest._retry = true; // 무한 루프 방지

      try {
        // 이미 갱신 중이면 기다림 (동시 요청 처리)
        if (!refreshTokenPromise) {
          refreshTokenPromise = refreshAccessToken();
        }

        const newAccessToken = await refreshTokenPromise;
        refreshTokenPromise = null; // 갱신 완료 후 초기화

        // 원래 요청에 새 토큰 적용
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        // 원래 요청 재시도
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        refreshTokenPromise = null; // 에러 발생 시 초기화
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

