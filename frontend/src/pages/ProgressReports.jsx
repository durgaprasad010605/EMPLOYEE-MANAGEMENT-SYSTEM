import React, { useState, useEffect } from 'react';
import projectService from '../services/projectService';
import taskService from '../services/taskService';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  FileText,
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  Search,
  TrendingUp,
  User,
} from 'lucide-react';
import '../styles/tables.css';

const ProgressReports = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectTasks, setProjectTasks] = useState([]);
  const [progressUpdates, setProgressUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [blockersOnly, setBlockersOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load all projects on initial mount
  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      try {
        const res = await projectService.getAllProjects();
        if (res.success && res.data) {
          setProjects(res.data);
          if (res.data.length > 0) {
            setSelectedProjectId(String(res.data[0].id));
          }
        }
      } catch (err) {
        console.error('Failed to load projects', err);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Whenever selected project changes, load tasks and progress updates
  useEffect(() => {
    if (!selectedProjectId) return;

    const loadProjectData = async () => {
      setDetailsLoading(true);
      try {
        const proj = projects.find((p) => String(p.id) === String(selectedProjectId));
        setSelectedProject(proj || null);

        const [tasksRes, progressRes] = await Promise.all([
          taskService.getProjectTasks(selectedProjectId),
          taskService.getProjectProgress(selectedProjectId),
        ]);

        if (tasksRes.success) setProjectTasks(tasksRes.data || []);
        if (progressRes.success) setProgressUpdates(progressRes.data || []);
      } catch (err) {
        console.error('Failed to load project report data', err);
      } finally {
        setDetailsLoading(false);
      }
    };

    loadProjectData();
  }, [selectedProjectId, projects]);

  const filteredUpdates = progressUpdates.filter((u) => {
    const matchesBlocker = !blockersOnly || (u.blockers && u.blockers.trim().length > 0);
    const matchesSearch =
      !searchTerm ||
      (u.taskTitle && u.taskTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.employeeName && u.employeeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.updateNotes && u.updateNotes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.blockers && u.blockers.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesBlocker && matchesSearch;
  });

  const blockerCount = progressUpdates.filter((u) => u.blockers && u.blockers.trim().length > 0).length;

  return (
    <div style={{ padding: '1.75rem 2rem' }}>
      <PageHeader
        title="Progress Reports & Health"
        subtitle="Review project progress, milestones, sprint burn-down, and flagged blockers"
        icon={FileText}
      />

      {loading ? (
        <LoadingSpinner message="Loading projects..." />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No Projects Available"
          description="Create projects and assign tasks to view engineering progress reports."
        />
      ) : (
        <>
          {/* Project Selector Bar */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.25rem',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a' }}>Select Project:</span>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                style={{
                  flex: 1,
                  maxWidth: '360px',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  color: '#0f172a',
                }}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.projectCode || `PRJ-${p.id}`}) — {p.status}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  color: blockersOnly ? '#dc2626' : '#64748b',
                  cursor: 'pointer',
                  backgroundColor: blockersOnly ? '#fef2f2' : '#f8fafc',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: blockersOnly ? '1px solid #fecaca' : '1px solid #e2e8f0',
                }}
              >
                <input
                  type="checkbox"
                  checked={blockersOnly}
                  onChange={(e) => setBlockersOnly(e.target.checked)}
                />
                <AlertTriangle size={15} color={blockersOnly ? '#dc2626' : '#64748b'} />
                <span>Show Only Blockers ({blockerCount})</span>
              </label>
            </div>
          </div>

          {/* Project Summary Cards */}
          {selectedProject && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
                  Overall Progress
                </span>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#2563eb', marginTop: '4px' }}>
                  {selectedProject.completionPercentage || 0}%
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', marginTop: '8px' }}>
                  <div
                    style={{
                      width: `${selectedProject.completionPercentage || 0}%`,
                      height: '100%',
                      backgroundColor: '#2563eb',
                      borderRadius: '3px',
                    }}
                  />
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
                  Tasks Completed
                </span>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>
                  {selectedProject.completedTasks || 0} / {selectedProject.totalTasks || 0}
                </div>
                <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: '500' }}>
                  {selectedProject.totalTasks > 0
                    ? `${selectedProject.totalTasks - selectedProject.completedTasks} pending tasks`
                    : 'No tasks scheduled'}
                </span>
              </div>

              <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
                  Active Blockers
                </span>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: blockerCount > 0 ? '#dc2626' : '#16a34a', marginTop: '4px' }}>
                  {blockerCount}
                </div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {blockerCount > 0 ? 'Requires immediate attention' : 'No reported blockers'}
                </span>
              </div>

              <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
                  Target Deadline
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginTop: '8px' }}>
                  {selectedProject.currentDeadline || selectedProject.originalDeadline || 'TBD'}
                </div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Status: <strong>{selectedProject.status}</strong>
                </span>
              </div>
            </div>
          )}

          {/* Search Bar for Updates */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#ffffff',
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              marginBottom: '1rem',
            }}
          >
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search progress logs by task title, employee, notes or blockers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                width: '100%',
                fontSize: '0.875rem',
                color: '#0f172a',
              }}
            />
          </div>

          {/* Progress Logs Table */}
          {detailsLoading ? (
            <LoadingSpinner message="Loading progress updates..." />
          ) : filteredUpdates.length === 0 ? (
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '3rem',
                textAlign: 'center',
                color: '#64748b',
              }}
            >
              No progress updates found matching the criteria.
            </div>
          ) : (
            <div className="table-responsive" style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Task</th>
                    <th>Developer</th>
                    <th>Progress</th>
                    <th>Work Done</th>
                    <th>Blockers</th>
                    <th>Remaining Work</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUpdates.map((u) => {
                    const hasBlocker = u.blockers && u.blockers.trim().length > 0;
                    return (
                      <tr key={u.id} style={{ backgroundColor: hasBlocker ? '#fffbfb' : 'inherit' }}>
                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.825rem', color: '#64748b' }}>
                          {u.createdAt ? new Date(u.createdAt).toLocaleString() : 'N/A'}
                        </td>
                        <td>
                          <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.875rem' }}>
                            {u.taskTitle || `Task #${u.taskId}`}
                          </div>
                          <span className="table-user-id">{u.taskCode || `TSK-${u.taskId}`}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <User size={14} color="#64748b" />
                            <span style={{ fontWeight: '500', color: '#0f172a', fontSize: '0.85rem' }}>
                              {u.employeeName || 'Assigned Dev'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '45px', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px' }}>
                              <div
                                style={{
                                  width: `${u.progressPercentage}%`,
                                  height: '100%',
                                  backgroundColor: u.progressPercentage === 100 ? '#10b981' : '#2563eb',
                                  borderRadius: '3px',
                                }}
                              />
                            </div>
                            <span style={{ fontWeight: '700', color: '#2563eb', fontSize: '0.85rem' }}>
                              {u.progressPercentage}%
                            </span>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.85rem', color: '#334155', maxWidth: '260px' }}>
                          {u.updateNotes}
                        </td>
                        <td>
                          {hasBlocker ? (
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                backgroundColor: '#fee2e2',
                                color: '#b91c1c',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: '500',
                                maxWidth: '220px',
                              }}
                            >
                              <AlertTriangle size={13} />
                              <span>{u.blockers}</span>
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>None</span>
                          )}
                        </td>
                        <td style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '220px' }}>
                          {u.remainingWork || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProgressReports;
