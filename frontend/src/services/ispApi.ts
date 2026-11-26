/**
 * ISP App API client
 * Uses /api/v1/isp/* endpoints with ISP JWT token
 */
import axios from 'axios';

const ispApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

ispApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('dhos_isp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

ispApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('dhos_isp_token');
      localStorage.removeItem('dhos_isp_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  },
);

export default ispApi;
