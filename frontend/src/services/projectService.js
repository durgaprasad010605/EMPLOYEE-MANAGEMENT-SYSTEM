import api from './api';

export const projectService = {
  getAllProjects: async () => {
    const res = await api.get('/projects');
    return res.data;
  },

  getProjectById: async (id) => {
    const res = await api.get(`/projects/${id}`);
    return res.data;
  },

  createProject: async (data) => {
    const res = await api.post('/projects', data);
    return res.data;
  },

  updateProject: async (id, data) => {
    const res = await api.put(`/projects/${id}`, data);
    return res.data;
  },

  getProjectMembers: async (projectId) => {
    const res = await api.get(`/projects/${projectId}/members`);
    return res.data;
  },

  addProjectMember: async (projectId, employeeId, projectRole) => {
    const res = await api.post(`/projects/${projectId}/members`, { employeeId, projectRole });
    return res.data;
  },

  removeProjectMember: async (projectId, employeeId) => {
    const res = await api.delete(`/projects/${projectId}/members/${employeeId}`);
    return res.data;
  },

  getProjectTasks: async (projectId) => {
    const res = await api.get(`/projects/${projectId}/tasks`);
    return res.data;
  },

  getProjectProgress: async (projectId) => {
    const res = await api.get(`/projects/${projectId}/progress`);
    return res.data;
  },
};

export default projectService;
