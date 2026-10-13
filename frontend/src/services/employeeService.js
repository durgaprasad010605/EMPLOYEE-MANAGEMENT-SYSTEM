import api from './api';

export const employeeService = {
  getEmployees: async (params = {}) => {
    const res = await api.get('/employees', { params });
    return res.data;
  },

  getAllEmployeesList: async () => {
    const res = await api.get('/employees/all');
    return res.data;
  },

  getEmployeeById: async (id) => {
    const res = await api.get(`/employees/${id}`);
    return res.data;
  },

  getMyProfile: async () => {
    const res = await api.get('/employees/me');
    return res.data;
  },

  getEmployeeProfile: async (id) => {
    const res = await api.get(`/employees/${id}/profile`);
    return res.data;
  },

  createEmployee: async (data) => {
    const res = await api.post('/employees', data);
    return res.data;
  },

  updateEmployee: async (id, data) => {
    const res = await api.put(`/employees/${id}`, data);
    return res.data;
  },

  updateStatus: async (id, status) => {
    const res = await api.patch(`/employees/${id}/status`, { status });
    return res.data;
  },
};

export default employeeService;
