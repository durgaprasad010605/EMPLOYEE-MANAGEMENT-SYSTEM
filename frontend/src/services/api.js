import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('employee_tracker_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle HTTP errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Determine friendly error message
    let friendlyMessage = 'An unexpected error occurred. Please try again.';

    if (!error.response) {
      // Backend is unavailable, CORS failure, or timeout
      if (error.code === 'ECONNABORTED') {
        friendlyMessage = 'Server request timed out. Please try again.';
      } else {
        friendlyMessage = 'Unable to connect to the backend server. Please verify the backend is running at port 8080.';
      }
    } else {
      const status = error.response.status;
      const serverMessage = error.response.data?.message;

      switch (status) {
        case 400:
          friendlyMessage = serverMessage || 'Invalid request. Please check your input.';
          break;
        case 401: {
          friendlyMessage = serverMessage || 'Session expired or unauthorized. Please log in again.';
          // Only clear credentials and redirect if NOT already on login page or attempting login
          const isAuthCall = error.config?.url?.includes('/auth/login');
          if (!isAuthCall) {
            localStorage.removeItem('employee_tracker_token');
            localStorage.removeItem('employee_tracker_user');
            if (window.location.pathname !== '/login') {
              window.location.replace('/login');
            }
          }
          break;
        }
        case 403:
          friendlyMessage = serverMessage || 'Access denied: You do not have permission to perform this action.';
          break;
        case 404:
          friendlyMessage = serverMessage || 'The requested resource was not found.';
          break;
        case 500:
          friendlyMessage = serverMessage || 'Internal server error. Please try again later.';
          break;
        default:
          friendlyMessage = serverMessage || `Request failed with status code ${status}.`;
          break;
      }
    }

    // Attach human-readable message for consumers
    error.errorMessage = friendlyMessage;
    return Promise.reject(error);
  }
);

export default api;
