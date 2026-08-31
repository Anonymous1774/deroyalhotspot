import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;
    if (port === '8080') {
      return `${protocol}//${hostname}:5001/api/v1`;
    }
    if (hostname !== 'localhost' && hostname !== '127.0.0.1' && port !== '5173') {
      return '/api/v1';
    }
  }
  return 'http://localhost:5000/api/v1';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
});


// Request interceptor: automatically add Bearer token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dhos_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: automatically clear token on 401 Unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('dhos_token');
      localStorage.removeItem('dhos_admin');
      
      // Only redirect if they are currently inside the admin panel
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
