import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '', // Use empty base URL to work with Vite proxy
  timeout: 10000,
  withCredentials: true
});

// Flag to prevent infinite redirects
let isRedirecting = false;

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401 && !isRedirecting) {
      // Token expired or invalid
      isRedirecting = true;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect if we're not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      
      // Reset flag after a delay
      setTimeout(() => {
        isRedirecting = false;
      }, 1000);
    }
    return Promise.reject(error);
  }
);

export default api; 