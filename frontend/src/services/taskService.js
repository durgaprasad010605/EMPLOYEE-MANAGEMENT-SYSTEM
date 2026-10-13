import api from './api';

export const taskService = {
  getAllTasks: async () => {
    const res = await api.get('/tasks');
    return res.data;
  },

  getMyTasks: async () => {
    const res = await api.get('/tasks/my');
    return res.data;
  },

  getTaskById: async (id) => {
    const res = await api.get(`/tasks/${id}`);
    return res.data;
  },

  createTask: async (projectId, data) => {
    const res = await api.post(`/projects/${projectId}/tasks`, data);
    return res.data;
  },

  updateTask: async (id, data) => {
    const res = await api.put(`/tasks/${id}`, data);
    return res.data;
  },

  updateTaskStatus: async (id, status) => {
    const res = await api.patch(`/tasks/${id}/status`, { status });
    return res.data;
  },

  submitProgress: async (taskId, progressData) => {
    const res = await api.post(`/tasks/${taskId}/progress`, progressData);
    return res.data;
  },

  getTaskProgress: async (taskId) => {
    const res = await api.get(`/tasks/${taskId}/progress`);
    return res.data;
  },

  getMyProgress: async () => {
    const res = await api.get('/progress/my');
    return res.data;
  },

  getProjectProgress: async (projectId) => {
    const res = await api.get(`/projects/${projectId}/progress`);
    return res.data;
  },

  getProjectTasks: async (projectId) => {
    const res = await api.get(`/projects/${projectId}/tasks`);
    return res.data;
  },
};

export default taskService;
