import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import taskService from '../services/taskService';
import projectService from '../services/projectService';
import employeeService from '../services/employeeService';
import extensionService from '../services/extensionService';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  Clock,
  Edit2,
  Trash2,
  User,
  FolderKanban,
  Flag,
  Send,
  MessageSquare,
  TrendingUp,
  History,
  AlertTriangle,
} from 'lucide-react';
import '../styles/tables.css';

const Tasks = () => {
  const { user } = useAuth();
  const isHr = user?.role === 'HR';

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [projectFilter, setProjectFilter] = useState('ALL');

  // HR Create / Edit Task Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    projectId: '',
    taskCode: '',
    title: '',
    description: '',
    assignedEmployeeId: '',
    priority: 'MEDIUM',
    status: 'TODO',
    startDate: '',
    dueDate: '',
  });

  // Employee: Submit Progress Update Modal
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [selectedTaskForProgress, setSelectedTaskForProgress] = useState(null);
  const [progressFormData, setProgressFormData] = useState({
    progressPercentage: 50,
    updateNotes: '',
    blockers: '',
    remainingWork: '',
  });

  // Employee: Request Deadline Extension Modal
  const [extensionModalOpen, setExtensionModalOpen] = useState(false);
  const [selectedTaskForExtension, setSelectedTaskForExtension] = useState(null);
  const [extensionFormData, setExtensionFormData] = useState({
    requestedDeadline: '',
    reason: '',
  });

  // Task Progress History Modal
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedTaskForHistory, setSelectedTaskForHistory] = useState(null);
  const [historyUpdates, setHistoryUpdates] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await taskService.getAllTasks();
      if (res.success) {
        setTasks(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load tasks', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMetadata = async () => {
    try {
      const [projRes, empRes] = await Promise.all([
        projectService.getAllProjects(),
        isHr ? employeeService.getAllEmployeesList() : Promise.resolve({ data: [] }),
      ]);
      if (projRes.success) setProjects(projRes.data || []);
      if (empRes.data) setAllEmployees(empRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
    loadMetadata();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    setFormData({
      projectId: projects[0]?.id || '',
      taskCode: `TSK-${Math.floor(1000 + Math.random() * 9000)}`,
      title: '',
      description: '',
      assignedEmployeeId: '',
      priority: 'MEDIUM',
      status: 'TODO',
      startDate: today,
      dueDate: nextWeek,
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      projectId: task.projectId || '',
      taskCode: task.taskCode || '',
      title: task.title || '',
      description: task.description || '',
      assignedEmployeeId: task.assignedEmployeeId || '',
      priority: task.priority || 'MEDIUM',
      status: task.status || 'TODO',
      startDate: task.startDate || '',
      dueDate: task.dueDate || '',
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrorMsg('Task title is required');
      return;
    }
    if (!formData.projectId) {
      setErrorMsg('Please select a project');
      return;
    }
    setActionLoading(true);
    setErrorMsg(null);
    try {
      if (editingTask) {
        await taskService.updateTask(editingTask.id, formData);
      } else {
        await taskService.createTask(formData.projectId, formData);
      }
      setModalOpen(false);
      fetchTasks();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save task');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskService.updateTaskStatus(taskId, newStatus);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task status');
    }
  };

  // Progress submission
  const handleOpenProgressModal = (task) => {
    setSelectedTaskForProgress(task);
    setProgressFormData({
      progressPercentage: task.progressPercentage || 0,
      updateNotes: '',
      blockers: '',
      remainingWork: '',
    });
    setErrorMsg(null);
    setProgressModalOpen(true);
  };

  const handleSubmitProgress = async (e) => {
    e.preventDefault();
    if (!progressFormData.updateNotes.trim()) {
      setErrorMsg('Progress update notes are required');
      return;
    }
    setActionLoading(true);
    setErrorMsg(null);
    try {
      await taskService.submitProgress(selectedTaskForProgress.id, progressFormData);
      setProgressModalOpen(false);
      fetchTasks();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit progress update');
    } finally {
      setActionLoading(false);
    }
  };

  // Extension request
  const handleOpenExtensionModal = (task) => {
    setSelectedTaskForExtension(task);
    setExtensionFormData({
      requestedDeadline: task.dueDate || '',
      reason: '',
    });
    setErrorMsg(null);
    setExtensionModalOpen(true);
  };

  const handleSubmitExtension = async (e) => {
    e.preventDefault();
    if (!extensionFormData.requestedDeadline) {
      setErrorMsg('Requested deadline is required');
      return;
    }
    if (!extensionFormData.reason.trim()) {
      setErrorMsg('Reason for deadline extension is required');
      return;
    }
    setActionLoading(true);
    setErrorMsg(null);
    try {
      await extensionService.createRequest({
        taskId: selectedTaskForExtension.id,
        requestedDeadline: extensionFormData.requestedDeadline,
        reason: extensionFormData.reason,
      });
      setExtensionModalOpen(false);
      alert('Extension request submitted successfully for HR review.');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit extension request');
    } finally {
      setActionLoading(false);
    }
  };

  // View progress history
  const handleOpenHistoryModal = async (task) => {
    setSelectedTaskForHistory(task);
    setHistoryModalOpen(true);
    setHistoryLoading(true);
    try {
      const res = await taskService.getTaskProgress(task.id);
      setHistoryUpdates(res.data || []);
    } catch (err) {
      console.error('Failed to load progress history', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      (t.title && t.title.toLowerCase().includes(search.toLowerCase())) ||
      (t.taskCode && t.taskCode.toLowerCase().includes(search.toLowerCase())) ||
      (t.assignedEmployeeName && t.assignedEmployeeName.toLowerCase().includes(search.toLowerCase())) ||
      (t.projectName && t.projectName.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    const matchesProject = projectFilter === 'ALL' || String(t.projectId) === String(projectFilter);
    return matchesSearch && matchesStatus && matchesPriority && matchesProject;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="status-pill status-completed">COMPLETED</span>;
      case 'IN_PROGRESS':
        return <span className="status-pill status-inprogress">IN PROGRESS</span>;
      case 'BLOCKED':
        return <span className="status-pill status-overdue">BLOCKED</span>;
      case 'TODO':
      default:
        return <span className="status-pill status-todo">TODO</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>CRITICAL</span>;
      case 'HIGH':
        return <span style={{ backgroundColor: '#ffedd5', color: '#c2410c', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>HIGH</span>;
      case 'MEDIUM':
        return <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>MEDIUM</span>;
      case 'LOW':
      default:
        return <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>LOW</span>;
    }
  };

  return (
    <div style={{ padding: '1.75rem 2rem' }}>
      <PageHeader
        title={isHr ? 'Task Management' : 'My Tasks'}
        subtitle={
          isHr
            ? 'Assign, monitor progress, and review delivery milestones across all projects'
            : 'Track your assigned deliverables, submit daily progress, and log blockers'
        }
        icon={CheckSquare}
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
              <span>Create Task</span>
            </button>
          )
        }
      />

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.85rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px' }}>
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search tasks by code, title, employee, project..."
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

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          {/* Project Filter */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#f8fafc',
              fontSize: '0.85rem',
              color: '#334155',
            }}
          >
            <option value="ALL">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
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
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="BLOCKED">Blocked</option>
            <option value="COMPLETED">Completed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#f8fafc',
              fontSize: '0.85rem',
              color: '#334155',
            }}
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading tasks..." />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks found"
          description={
            isHr
              ? 'Create tasks under projects to assign developers and track sprint deliverables.'
              : 'You have no tasks assigned to you matching the selected filters.'
          }
          actionLabel={isHr ? 'Create Task' : null}
          onAction={isHr ? handleOpenCreateModal : null}
        />
      ) : (
        <div className="table-responsive" style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                {isHr && <th>Assigned To</th>}
                <th>Priority</th>
                <th>Status</th>
                <th>Progress %</th>
                <th>Due Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((t) => {
                const isOverdue = t.dueDate && t.dueDate < todayStr && t.status !== 'COMPLETED';

                return (
                  <tr key={t.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: '600', color: '#0f172a' }}>{t.title}</div>
                        <span className="table-user-id">{t.taskCode || `TSK-${t.id}`}</span>
                      </div>
                    </td>

                    <td>
                      <span style={{ color: '#475569', fontSize: '0.875rem', fontWeight: '500' }}>
                        {t.projectName || 'Project'}
                      </span>
                    </td>

                    {isHr && (
                      <td>
                        {t.assignedEmployeeName ? (
                          <div>
                            <div style={{ fontWeight: '500', color: '#0f172a', fontSize: '0.875rem' }}>{t.assignedEmployeeName}</div>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{t.assignedEmployeeCode}</span>
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>Unassigned</span>
                        )}
                      </td>
                    )}

                    <td>{getPriorityBadge(t.priority)}</td>

                    <td>
                      {/* Status select for quick updates */}
                      <select
                        value={t.status || 'TODO'}
                        onChange={(e) => handleStatusChange(t.id, e.target.value)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.785rem',
                          fontWeight: '600',
                          border: '1px solid #cbd5e1',
                          backgroundColor:
                            t.status === 'COMPLETED'
                              ? '#dcfce7'
                              : t.status === 'IN_PROGRESS'
                              ? '#dbeafe'
                              : t.status === 'BLOCKED'
                              ? '#fee2e2'
                              : '#f1f5f9',
                          color:
                            t.status === 'COMPLETED'
                              ? '#15803d'
                              : t.status === 'IN_PROGRESS'
                              ? '#1d4ed8'
                              : t.status === 'BLOCKED'
                              ? '#b91c1c'
                              : '#475569',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="TODO">TODO</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="BLOCKED">BLOCKED</option>
                        <option value="COMPLETED">COMPLETED</option>
                      </select>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '60px', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px' }}>
                          <div
                            style={{
                              width: `${t.progressPercentage || 0}%`,
                              height: '100%',
                              backgroundColor: t.progressPercentage === 100 ? '#10b981' : '#2563eb',
                              borderRadius: '3px',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#0f172a' }}>
                          {t.progressPercentage || 0}%
                        </span>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: isOverdue ? '700' : '500',
                            color: isOverdue ? '#dc2626' : '#475569',
                          }}
                        >
                          {t.dueDate || 'TBD'}
                        </span>
                        {isOverdue && (
                          <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', fontSize: '0.7rem', padding: '1px 5px', borderRadius: '4px', fontWeight: '700' }}>
                            OVERDUE
                          </span>
                        )}
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        {/* History button for all */}
                        <button
                          onClick={() => handleOpenHistoryModal(t)}
                          style={{
                            padding: '5px 8px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#ffffff',
                            color: '#475569',
                            fontSize: '0.785rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                          title="View progress updates"
                        >
                          <History size={14} />
                          <span>Updates</span>
                        </button>

                        {/* Employee: Progress Update Button */}
                        {!isHr && (
                          <>
                            <button
                              onClick={() => handleOpenProgressModal(t)}
                              style={{
                                padding: '5px 10px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: '#2563eb',
                                color: '#ffffff',
                                fontSize: '0.785rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <TrendingUp size={14} />
                              <span>Log Progress</span>
                            </button>

                            <button
                              onClick={() => handleOpenExtensionModal(t)}
                              style={{
                                padding: '5px 8px',
                                borderRadius: '6px',
                                border: '1px solid #f59e0b',
                                backgroundColor: '#fffbeb',
                                color: '#b45309',
                                fontSize: '0.785rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                              }}
                              title="Request deadline extension"
                            >
                              Extend
                            </button>
                          </>
                        )}

                        {/* HR: Edit Task */}
                        {isHr && (
                          <button
                            onClick={() => handleOpenEditModal(t)}
                            style={{
                              padding: '5px 8px',
                              borderRadius: '6px',
                              border: '1px solid #e2e8f0',
                              backgroundColor: '#ffffff',
                              color: '#2563eb',
                              cursor: 'pointer',
                            }}
                            title="Edit task"
                          >
                            <Edit2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* HR: Create / Edit Task Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'Create Task'}
        maxWidth="560px"
      >
        <form onSubmit={handleSaveTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                Task Code *
              </label>
              <input
                type="text"
                required
                value={formData.taskCode}
                onChange={(e) => setFormData({ ...formData, taskCode: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#334155', marginBottom: '4px' }}>
                Task Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Implement OAuth JWT Authentication"
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#334155', marginBottom: '4px' }}>
              Project *
            </label>
            <select
              required
              disabled={!!editingTask}
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                backgroundColor: editingTask ? '#f8fafc' : '#ffffff',
              }}
            >
              <option value="">-- Select Project --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.projectCode || `PRJ-${p.id}`})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#334155', marginBottom: '4px' }}>
              Assign Employee
            </label>
            <select
              value={formData.assignedEmployeeId}
              onChange={(e) => setFormData({ ...formData, assignedEmployeeId: e.target.value })}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                backgroundColor: '#ffffff',
              }}
            >
              <option value="">-- Unassigned --</option>
              {allEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.employeeCode}) — {emp.designation || 'Developer'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#334155', marginBottom: '4px' }}>
              Description & Requirements
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Technical specifications, acceptance criteria, or API contracts..."
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#334155', marginBottom: '4px' }}>
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                }}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
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
                }}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="BLOCKED">Blocked</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
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
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#334155', marginBottom: '4px' }}>
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                }}
              />
            </div>
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
              {actionLoading ? 'Saving...' : editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Employee: Submit Progress Modal */}
      <Modal
        isOpen={progressModalOpen}
        onClose={() => setProgressModalOpen(false)}
        title={`Log Progress — ${selectedTaskForProgress?.title || 'Task'}`}
        maxWidth="520px"
      >
        <form onSubmit={handleSubmitProgress} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '500', color: '#334155' }}>
                Progress Percentage
              </label>
              <span style={{ fontWeight: '700', color: '#2563eb', fontSize: '1rem' }}>
                {progressFormData.progressPercentage}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progressFormData.progressPercentage}
              onChange={(e) => setProgressFormData({ ...progressFormData, progressPercentage: Number(e.target.value) })}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#334155', marginBottom: '4px' }}>
              Work Done / Accomplishments *
            </label>
            <textarea
              required
              rows={3}
              value={progressFormData.updateNotes}
              onChange={(e) => setProgressFormData({ ...progressFormData, updateNotes: e.target.value })}
              placeholder="e.g. Completed JWT filter, wrote unit tests for token validation..."
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#334155', marginBottom: '4px' }}>
              Blockers / Impediments (Optional)
            </label>
            <input
              type="text"
              value={progressFormData.blockers}
              onChange={(e) => setProgressFormData({ ...progressFormData, blockers: e.target.value })}
              placeholder="e.g. Awaiting database schema migrations or credentials..."
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#334155', marginBottom: '4px' }}>
              Remaining Work (Optional)
            </label>
            <input
              type="text"
              value={progressFormData.remainingWork}
              onChange={(e) => setProgressFormData({ ...progressFormData, remainingWork: e.target.value })}
              placeholder="e.g. Swagger docs and integration test suite..."
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setProgressModalOpen(false)}
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
              {actionLoading ? 'Submitting...' : 'Submit Progress'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Employee: Deadline Extension Modal */}
      <Modal
        isOpen={extensionModalOpen}
        onClose={() => setExtensionModalOpen(false)}
        title={`Request Deadline Extension — ${selectedTaskForExtension?.title || 'Task'}`}
        maxWidth="500px"
      >
        <form onSubmit={handleSubmitExtension} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#334155', marginBottom: '4px' }}>
              Current Deadline
            </label>
            <div style={{ padding: '0.6rem 0.85rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.9rem' }}>
              {selectedTaskForExtension?.dueDate || 'Not set'}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#334155', marginBottom: '4px' }}>
              Requested New Deadline *
            </label>
            <input
              type="date"
              required
              value={extensionFormData.requestedDeadline}
              onChange={(e) => setExtensionFormData({ ...extensionFormData, requestedDeadline: e.target.value })}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#334155', marginBottom: '4px' }}>
              Reason for Extension *
            </label>
            <textarea
              required
              rows={3}
              value={extensionFormData.reason}
              onChange={(e) => setExtensionFormData({ ...extensionFormData, reason: e.target.value })}
              placeholder="Explain unexpected blockers, third-party dependencies, or scope adjustments..."
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setExtensionModalOpen(false)}
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
                backgroundColor: '#f59e0b',
                color: '#ffffff',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {actionLoading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Progress History Modal */}
      <Modal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title={`Progress History — ${selectedTaskForHistory?.title || 'Task'}`}
        maxWidth="680px"
      >
        <div>
          {historyLoading ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
              Loading progress history...
            </div>
          ) : historyUpdates.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              No progress updates have been submitted for this task yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '500px', overflowY: 'auto' }}>
              {historyUpdates.map((u) => (
                <div
                  key={u.id}
                  style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    padding: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '700', color: '#2563eb', fontSize: '1rem' }}>
                        {u.progressPercentage}% Complete
                      </span>
                      {u.employeeName && (
                        <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                          by <strong>{u.employeeName}</strong>
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleString() : ''}
                    </span>
                  </div>

                  <p style={{ margin: '0 0 6px 0', fontSize: '0.875rem', color: '#334155', lineHeight: '1.4' }}>
                    {u.updateNotes}
                  </p>

                  {(u.blockers || u.remainingWork) && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px', fontSize: '0.8rem' }}>
                      {u.blockers && (
                        <div style={{ backgroundColor: '#fef2f2', padding: '6px 10px', borderRadius: '6px', color: '#dc2626' }}>
                          <strong>Blocker:</strong> {u.blockers}
                        </div>
                      )}
                      {u.remainingWork && (
                        <div style={{ backgroundColor: '#eff6ff', padding: '6px 10px', borderRadius: '6px', color: '#1d4ed8' }}>
                          <strong>Remaining:</strong> {u.remainingWork}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Tasks;
