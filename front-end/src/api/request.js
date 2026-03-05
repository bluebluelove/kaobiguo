import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

const request = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

request.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (import.meta.env.DEV) {
      console.warn('[API]', err.config?.method?.toUpperCase(), err.config?.url, '→', err.code || err.message, err.response?.status);
    }
    const token = localStorage.getItem('token');
    if (err.response?.status === 401 && token !== 'dev-preview') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default request;
