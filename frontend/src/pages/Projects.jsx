import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import projectService from '../services/projectService';
import employeeService from '../services/employeeService';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Calendar,
  Edit2,
  Trash2,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  UserPlus,
  X,
} from 'lucide-react';
import '../styles/tables.css';

const Projects = () => {
  const { user } = useAuth();
  const isHr = user?.role === 'HR';

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Create / Edit Project Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    projectCode: '',
    name: '',
    description: '',
    startDate: '',
    originalDeadline: '',
    status: 'PLANNED',
  });

  // Members Management Modal
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [newMemberForm, setNewMemberForm] = useState({ employeeId: '', projectRole: 'DEVELOPER' });

  // Delete Member Confirm
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [memberErrorMsg, setMemberErrorMsg] = useState(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await projectService.getAllProjects();
      if (res.success) {
        setProjects(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load projects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingProject(null);
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      projectCode: `PRJ-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      description: '',
      startDate: today,
      originalDeadline: '',
      status: 'PLANNED',
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (proj) => {
    setEditingProject(proj);
    setFormData({
      projectCode: proj.projectCode || proj.code || '',
      name: proj.name || '',
      description: proj.description || '',
      startDate: proj.startDate || '',
      originalDeadline: proj.originalDeadline || proj.currentDeadline || '',
      status: proj.status || 'PLANNED',
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Project title is required');
      return;
    }
    setActionLoading(true);
    setErrorMsg(null);
    try {
      if (editingProject) {
        await projectService.updateProject(editingProject.id, formData);
      } else {
        await projectService.createProject(formData);
      }
      setModalOpen(false);
      fetchProjects();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save project');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Members Modal
  const handleOpenMembersModal = async (project) => {
    setSelectedProject(project);
    setMembersModalOpen(true);
    setMemberErrorMsg(null);
    setMembersLoading(true);
    try {
      const [membersRes, empsRes] = await Promise.all([
        projectService.getProjectMembers(project.id),
        isHr ? employeeService.getAllEmployeesList() : Promise.resolve({ data: [] }),
      ]);
      setProjectMembers(membersRes.data || []);
      if (empsRes.data) {
        setAllEmployees(empsRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load project members', err);
    } finally {
      setMembersLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberForm.employeeId) {
      setMemberErrorMsg('Please select an employee');
      return;
    }
    setMemberErrorMsg(null);
    setActionLoading(true);
    try {
      await projectService.addProjectMember(
        selectedProject.id,
        newMemberForm.employeeId,
        newMemberForm.projectRole
      );
      // Refresh members
      const refreshed = await projectService.getProjectMembers(selectedProject.id);
      setProjectMembers(refreshed.data || []);
      setNewMemberForm({ employeeId: '', projectRole: 'DEVELOPER' });
      fetchProjects(); // updates member count on cards
    } catch (err) {
      setMemberErrorMsg(err.response?.data?.message || 'Failed to assign team member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMemberConfirm = async () => {
    if (!memberToRemove || !selectedProject) return;
    setActionLoading(true);
    try {
      await projectService.removeProjectMember(selectedProject.id, memberToRemove.employeeId);
      const refreshed = await projectService.getProjectMembers(selectedProject.id);
      setProjectMembers(refreshed.data || []);
      setRemoveConfirmOpen(false);
      setMemberToRemove(null);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      (p.name && p.name.toLowerCase().includes(search.toLowerCase())) ||
      (p.projectCode && p.projectCode.toLowerCase().includes(search.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="status-pill status-completed">COMPLETED</span>;
      case 'IN_PROGRESS':
        return <span className="status-pill status-inprogress">IN PROGRESS</span>;
      case 'ON_HOLD':
        return <span className="status-pill status-overdue">ON HOLD</span>;
      case 'CANCELLED':
        return <span className="status-pill status-inactive">CANCELLED</span>;
      case 'PLANNED':
      default:
        return <span className="status-pill status-todo">PLANNED</span>;
    }
  };

  return (
    <div style={{ padding: '1.75rem 2rem' }}>
      <PageHeader
        title={isHr ? 'Projects & Assignments' : 'My Projects'}
        subtitle={
          isHr
            ? 'Manage technology projects, team assignments, and tracking timelines'
            : 'View projects and tech initiatives you are actively contributing to'
        }
        icon={FolderKanban}
        actions={
          isHr && (
            <button
              onClick={handleOpenCreateModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '0.6rem 1.25rem',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              <Plus size={18} />
              <span>Create Project</span>
            </button>
          )
        }
      />

      {/* Filter / Search Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '260px' }}>
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search projects by code or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: '0.9rem',
              color: '#0f172a',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="#64748b" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#f8fafc',
              fontSize: '0.85rem',
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="PLANNED">Planned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading projects..." />
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description={
            isHr
              ? 'Create a project to assign developers and track task progress.'
              : 'You are currently not assigned to any projects.'
          }
          actionLabel={isHr ? 'Create Project' : null}
          onAction={isHr ? handleOpenCreateModal : null}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '1.4rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="table-user-id">{proj.projectCode || `PRJ-${proj.id}`}</span>
                    {getStatusBadge(proj.status)}
                  </div>
                  {isHr && (
                    <button
                      onClick={() => handleOpenEditModal(proj)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        color: '#64748b',
                        borderRadius: '4px',
                      }}
                      title="Edit project"
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                  {proj.name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1rem 0', minHeight: '36px', lineHeight: '1.4' }}>
                  {proj.description || 'No description provided.'}
                </p>

                {/* Progress bar */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.785rem', marginBottom: '4px', color: '#64748b' }}>
                    <span>Completion</span>
                    <span style={{ fontWeight: '600', color: '#0f172a' }}>{proj.completionPercentage || 0}%</span>
                  </div>
                  <div style={{ width: '100%', height: '7px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${proj.completionPercentage || 0}%`,
                        height: '100%',
                        backgroundColor: proj.completionPercentage === 100 ? '#10b981' : '#2563eb',
                        borderRadius: '4px',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '4px', color: '#94a3b8' }}>
                    <span>{proj.completedTasks || 0} / {proj.totalTasks || 0} tasks done</span>
                    <span>{proj.memberCount || 0} team members</span>
                  </div>
                </div>

                {/* Deadlines */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.825rem', color: '#475569', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} color="#94a3b8" />
                    <span>Start: {proj.startDate || 'TBD'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} color="#94a3b8" />
                    <span>
                      Deadline: <strong>{proj.currentDeadline || proj.originalDeadline || 'TBD'}</strong>
                    </span>
                    {proj.currentDeadline && proj.originalDeadline && proj.currentDeadline !== proj.originalDeadline && (
                      <span style={{ color: '#d97706', fontSize: '0.75rem', fontWeight: '600' }}>(Extended)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={() => handleOpenMembersModal(proj)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.825rem',
                    fontWeight: '600',
                    color: '#334155',
                    cursor: 'pointer',
                  }}
                >
                  <Users size={14} />
                  <span>{isHr ? 'Manage Team' : 'View Team'} ({proj.memberCount || 0})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Project Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'Create New Project'}
        maxWidth="540px"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {errorMsg && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fee2e2',
                color: '#ef4444',
                padding: '0.75rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#334155', marginBottom: '4px' }}>
                Project Code *
              </label>
              <input
                type="text"
                required
                value={formData.projectCode}
                onChange={(e) => setFormData({ ...formData, projectCode: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#334155', marginBottom: '4px' }}>
                Project Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Cloud Migration Platform"
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#334155', marginBottom: '4px' }}>
              Description & Objectives
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline project deliverables and technical specifications..."
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#334155', marginBottom: '4px' }}>
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#334155', marginBottom: '4px' }}>
                Deadline
              </label>
              <input
                type="date"
                value={formData.originalDeadline}
                onChange={(e) => setFormData({ ...formData, originalDeadline: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#334155', marginBottom: '4px' }}>
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none',
                backgroundColor: '#ffffff',
              }}
            >
              <option value="PLANNED">Planned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              style={{
                padding: '0.6rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {actionLoading ? 'Saving...' : editingProject ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Team Members Modal */}
      <Modal
        isOpen={membersModalOpen}
        onClose={() => setMembersModalOpen(false)}
        title={`Team Members — ${selectedProject?.name || 'Project'}`}
        maxWidth="680px"
      >
        <div>
          {memberErrorMsg && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fee2e2',
                color: '#ef4444',
                padding: '0.75rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={16} />
              <span>{memberErrorMsg}</span>
            </div>
          )}

          {/* HR: Add Member Form */}
          {isHr && (
            <form
              onSubmit={handleAddMember}
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.25rem',
                display: 'grid',
                gridTemplateColumns: '2fr 1.5fr auto',
                gap: '10px',
                alignItems: 'flex-end',
              }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>
                  Assign Employee
                </label>
                <select
                  required
                  value={newMemberForm.employeeId}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, employeeId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <option value="">-- Choose Employee --</option>
                  {allEmployees.map((emp) => (
                    <tr key={emp.id} /> && (
                      <option key={emp.id} value={emp.id}>
                        {emp.fullName} ({emp.employeeCode}) — {emp.designation || 'Staff'}
                      </option>
                    )
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>
                  Project Role
                </label>
                <select
                  value={newMemberForm.projectRole}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, projectRole: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <option value="TECH_LEAD">Tech Lead</option>
                  <option value="DEVELOPER">Developer</option>
                  <option value="QA_ENGINEER">QA Engineer</option>
                  <option value="DEVOPS">DevOps</option>
                  <option value="UI_UX_DESIGNER">UI/UX Designer</option>
                  <option value="BUSINESS_ANALYST">Business Analyst</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.55rem 1rem',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  height: '36px',
                }}
              >
                <UserPlus size={16} />
                <span>Assign</span>
              </button>
            </form>
          )}

          {/* Members Table */}
          {membersLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading team members...</div>
          ) : projectMembers.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
              No members assigned to this project yet.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Designation</th>
                    <th>Project Role</th>
                    {isHr && <th style={{ textAlign: 'right' }}>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {projectMembers.map((m) => (
                    <tr key={m.id || m.employeeId}>
                      <td>
                        <div>
                          <div style={{ fontWeight: '600', color: '#0f172a' }}>{m.employeeName}</div>
                          <span className="table-user-id">{m.employeeCode}</span>
                        </div>
                      </td>
                      <td style={{ color: '#475569', fontSize: '0.85rem' }}>{m.designation || 'Engineer'}</td>
                      <td>
                        <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '3px 8px', borderRadius: '4px', fontSize: '0.785rem', fontWeight: '600' }}>
                          {m.projectRole}
                        </span>
                      </td>
                      {isHr && (
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => {
                              setMemberToRemove(m);
                              setRemoveConfirmOpen(true);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              padding: '4px 8px',
                              borderRadius: '4px',
                            }}
                            title="Remove member"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>

      {/* Remove Member Confirmation */}
      <ConfirmDialog
        isOpen={removeConfirmOpen}
        onClose={() => setRemoveConfirmOpen(false)}
        onConfirm={handleRemoveMemberConfirm}
        title="Remove Member from Project"
        message={`Are you sure you want to remove ${memberToRemove?.employeeName} from ${selectedProject?.name}? They will no longer be assigned to this project.`}
        confirmText="Remove Member"
        type="danger"
        loading={actionLoading}
      />
    </div>
  );
};

export default Projects;
