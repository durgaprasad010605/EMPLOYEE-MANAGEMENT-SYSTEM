import api from './api';

export const leaveService = {
  applyLeave: async (data) => {
    const res = await api.post('/leaves', data);
    return res.data;
  },

  getMyLeaves: async () => {
    const res = await api.get('/leaves/my');
    return res.data;
  },

  getAllLeaves: async (status) => {
    const params = status ? { status } : {};
    const res = await api.get('/leaves', { params });
    return res.data;
  },

  reviewLeave: async (id, decision, hrResponse) => {
    const res = await api.patch(`/leaves/${id}/review`, { decision, hrResponse });
    return res.data;
  },
};

export default leaveService;
