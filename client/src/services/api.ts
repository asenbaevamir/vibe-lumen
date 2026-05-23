import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Crucial to send httpOnly cookies automatically
});

// Request Interceptor: Attach JWT token from localStorage if available (as a secure fallback)
API.interceptors.request.use(
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

export default API;
export { API_BASE_URL };
