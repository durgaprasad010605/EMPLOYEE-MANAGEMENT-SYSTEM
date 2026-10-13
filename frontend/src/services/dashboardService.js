import api from './api';

export const dashboardService = {
  getHrDashboard: async () => {
    const res = await api.get('/dashboard/hr');
    return res.data;
  },

  getEmployeeDashboard: async () => {
    const res = await api.get('/dashboard/employee');
    return res.data;
  },

  getSummary: async () => {
    const res = await api.get('/dashboard');
    return res.data;
  },
};

export default dashboardService;
