import api from './api';

export const authService = {
  login: async (identifier, password, rememberMe = false) => {
    const res = await api.post('/auth/login', { username: identifier, email: identifier, password, rememberMe });
    return res.data;
  },

  getCurrentUser: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('employee_tracker_token');
    localStorage.removeItem('employee_tracker_user');
  },
};

export default authService;
