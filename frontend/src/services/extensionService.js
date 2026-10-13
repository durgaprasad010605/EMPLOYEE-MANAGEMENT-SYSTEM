import api from './api';

export const extensionService = {
  createRequest: async (data) => {
    const res = await api.post('/extension-requests', data);
    return res.data;
  },

  getMyRequests: async () => {
    const res = await api.get('/extension-requests/my');
    return res.data;
  },

  getAllRequests: async (status) => {
    const params = status ? { status } : {};
    const res = await api.get('/extension-requests', { params });
    return res.data;
  },

  reviewRequest: async (id, decision, hrResponse) => {
    const res = await api.patch(`/extension-requests/${id}/review`, { decision, hrResponse });
    return res.data;
  },
};

export default extensionService;
