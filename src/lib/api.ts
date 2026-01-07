import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS if using cookies/sessions
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // We'll implement token storage (localStorage or cookies) later
    // For now, this is a placeholder for where we'd add the Authorization header
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors (e.g. 401 Unauthorized)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Here we would implement token refresh logic
        // const refreshToken = localStorage.getItem('refreshToken');
        // const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
        // const { access_token } = response.data;
        // localStorage.setItem('token', access_token);
        // api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        // return api(originalRequest);
        
        // For now, just reject
      } catch (refreshError) {
        // If refresh fails, redirect to login
        // window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
