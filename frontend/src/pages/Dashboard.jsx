import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import {
  Users,
  FolderKanban,
  CheckSquare,
  Clock,
  CalendarOff,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Briefcase,
  FileText,
  UserCheck,
} from 'lucide-react';
import '../styles/dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isHr = user?.role === 'HR';

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (isHr) {
        res = await dashboardService.getHrDashboard();
      } else {
        res = await dashboardService.getEmployeeDashboard();
      }
      if (res && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard', err);
      setError('Failed to load dashboard metrics. Please check server connectivity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [user?.role]);

  if (loading) {
    return <LoadingSpinner text="Loading dashboard metrics..." />;
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <PageHeader title="Dashboard" subtitle="System Overview" />
        <div className="alert-card alert-error">
          <AlertTriangle size={20} />
          <span>{error}</span>
          <button onClick={loadDashboard} className="btn-secondary btn-sm" style={{ marginLeft: 'auto' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <PageHeader
        title={isHr ? 'HR Administration Dashboard' : 'Employee Workspace Dashboard'}
        subtitle={`Welcome back, ${user?.displayName || user?.username || 'User'}`}
      />

      {isHr ? renderHrDashboard() : renderEmployeeDashboard()}
    </div>
  );

  function renderHrDashboard() {
    const totalEmp = data?.totalEmployees || 0;
    const activeProjects = data?.activeProjects || 0;
    const inProgressTasks = data?.inProgressTasks || 0;
    const pendingReqs = data?.pendingRequests || 0;

    const recentProjects = data?.recentProjects || [];
    const blockedOrOverdue = data?.blockedOrOverdueTasks || [];
    const recentProgress = data?.recentProgress || [];
    const pendingExtensions = data?.pendingExtensions || [];
    const pendingLeaves = data?.pendingLeaves || [];

    return (
      <>
        {/* KPI Cards */}
        <div className="dashboard-stats-grid">
          <StatCard
            title="Total Employees"
            value={totalEmp}
            icon={Users}
            color="blue"
            subtitle="Active IT workforce"
            onClick={() => navigate('/employees')}
          />
          <StatCard
            title="Active Projects"
            value={activeProjects}
            icon={FolderKanban}
            color="green"
            subtitle="Current active engagements"
            onClick={() => navigate('/projects')}
          />
          <StatCard
            title="Tasks In Progress"
            value={inProgressTasks}
            icon={CheckSquare}
            color="orange"
            subtitle="Actively executing tasks"
            onClick={() => navigate('/tasks')}
          />
          <StatCard
            title="Pending Requests"
            value={pendingReqs}
            icon={Clock}
            color="purple"
            subtitle={`${data?.pendingExtensionRequests || 0} extensions • ${data?.pendingLeaveRequests || 0} leaves`}
            onClick={() => navigate('/extension-requests')}
          />
        </div>

        {/* Attention: Blocked / Overdue Tasks Banner */}
        {blockedOrOverdue.length > 0 && (
          <div className="alert-card alert-warning" style={{ marginTop: '1.5rem' }}>
            <AlertTriangle size={20} color="#b45309" />
            <div>
              <strong>Action Needed:</strong> {blockedOrOverdue.length} task(s) currently marked BLOCKED or overdue.
            </div>
            <button
              onClick={() => navigate('/tasks')}
              className="btn-warning btn-sm"
              style={{ marginLeft: 'auto' }}
            >
              Review Tasks
            </button>
          </div>
        )}

        {/* Main Grid */}
        <div className="dashboard-content-grid" style={{ marginTop: '1.5rem' }}>
          {/* Recent Projects */}
          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-title-group">
                <FolderKanban size={18} color="#2563eb" />
                <h2 className="card-title">Recent Projects & Progress</h2>
              </div>
              <button onClick={() => navigate('/projects')} className="card-action-link">
                View all <ArrowRight size={14} />
              </button>
            </div>
            <div className="card-body">
              {recentProjects.length === 0 ? (
                <EmptyState
                  title="No projects found"
                  description="Create a project to start assigning team members and tracking deadlines."
                  actionText="Create Project"
                  onAction={() => navigate('/projects')}
                />
              ) : (
                <div className="project-list-compact">
                  {recentProjects.map((p) => (
                    <div key={p.id} className="project-row-item">
                      <div className="project-info-main">
                        <span className="project-code-badge">{p.projectCode}</span>
                        <div className="project-name-text">{p.name}</div>
                        <div className="project-meta-text">
                          Deadline: {p.currentDeadline} • Team: {p.memberCount || 0} members
                        </div>
                      </div>
                      <div className="project-progress-box">
                        <div className="progress-labels">
                          <span>Completion</span>
                          <strong>{p.completionPercentage}%</strong>
                        </div>
                        <div className="progress-bar-track">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${Math.min(100, p.completionPercentage)}%` }}
                          />
                        </div>
                        <span className="task-count-text">
                          {p.completedTasks}/{p.totalTasks} tasks done
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pending Extensions & Leaves */}
          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-title-group">
                <Clock size={18} color="#f59e0b" />
                <h2 className="card-title">Pending Extension Requests</h2>
              </div>
              <button onClick={() => navigate('/extension-requests')} className="card-action-link">
                Review all <ArrowRight size={14} />
              </button>
            </div>
            <div className="card-body">
              {pendingExtensions.length === 0 ? (
                <div className="empty-mini">No pending deadline extension requests.</div>
              ) : (
                <div className="request-list-compact">
                  {pendingExtensions.map((req) => (
                    <div key={req.id} className="request-row-item">
                      <div>
                        <strong>{req.projectName}</strong>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                          Requested by {req.requestedByEmployeeName} until {req.requestedDeadline}
                        </div>
                        <div className="text-secondary" style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>
                          "{req.reason}"
                        </div>
                      </div>
                      <button
                        onClick={() => navigate('/extension-requests')}
                        className="btn-secondary btn-sm"
                      >
                        Review
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                <div className="card-title-group" style={{ marginBottom: '0.75rem' }}>
                  <CalendarOff size={16} color="#8b5cf6" />
                  <h3 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>Pending Leaves ({pendingLeaves.length})</h3>
                </div>
                {pendingLeaves.length === 0 ? (
                  <div className="empty-mini">No pending leave applications.</div>
                ) : (
                  <div className="request-list-compact">
                    {pendingLeaves.map((l) => (
                      <div key={l.id} className="request-row-item">
                        <div>
                          <strong>{l.employeeName}</strong> — <span className="badge-type">{l.leaveType}</span>
                          <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                            {l.startDate} to {l.endDate} ({l.days} days)
                          </div>
                        </div>
                        <button onClick={() => navigate('/leaves')} className="btn-secondary btn-sm">
                          Review
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Progress Updates Submissions */}
        <div className="dashboard-card" style={{ marginTop: '1.5rem' }}>
          <div className="card-header">
            <div className="card-title-group">
              <TrendingUp size={18} color="#10b981" />
              <h2 className="card-title">Recent Progress Submissions</h2>
            </div>
            <button onClick={() => navigate('/progress-reports')} className="card-action-link">
              Full Reports <ArrowRight size={14} />
            </button>
          </div>
          <div className="card-body">
            {recentProgress.length === 0 ? (
              <EmptyState
                title="No progress updates submitted yet"
                description="Team members' task progress and blockers will appear here in chronological order."
              />
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Project / Task</th>
                      <th>Employee</th>
                      <th>Progress</th>
                      <th>Work Completed</th>
                      <th>Blockers</th>
                      <th>Submitted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentProgress.map((pu) => (
                      <tr key={pu.id}>
                        <td>
                          <strong>{pu.taskTitle}</strong>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{pu.projectName}</div>
                        </td>
                        <td>{pu.employeeName}</td>
                        <td>
                          <span className="badge-progress">{pu.progressPercentage}%</span>
                        </td>
                        <td style={{ maxWidth: '240px' }} className="truncate-text">{pu.workCompleted}</td>
                        <td style={{ maxWidth: '160px' }}>
                          {pu.blockers ? (
                            <span className="text-danger" title={pu.blockers}>⚠️ {pu.blockers}</span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td className="text-muted" style={{ fontSize: '0.8rem' }}>
                          {new Date(pu.submittedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  function renderEmployeeDashboard() {
    const activeProjectsCount = data?.myActiveProjects || 0;
    const pendingTasksCount = data?.myPendingTasks || 0;
    const completedTasksCount = data?.myCompletedTasks || 0;
    const pendingReqsCount = data?.myPendingRequests || 0;

    const assignedProjects = data?.assignedProjects || [];
    const assignedTasks = data?.assignedTasks || [];
    const recentProgress = data?.recentProgress || [];
    const pendingExtensions = data?.pendingExtensions || [];
    const leaves = data?.leaves || [];

    return (
      <>
        {/* KPI Cards */}
        <div className="dashboard-stats-grid">
          <StatCard
            title="My Active Projects"
            value={activeProjectsCount}
            icon={FolderKanban}
            color="blue"
            subtitle="Engagements you belong to"
            onClick={() => navigate('/projects')}
          />
          <StatCard
            title="My Pending Tasks"
            value={pendingTasksCount}
            icon={CheckSquare}
            color="orange"
            subtitle="Tasks requiring action"
            onClick={() => navigate('/tasks')}
          />
          <StatCard
            title="My Completed Tasks"
            value={completedTasksCount}
            icon={UserCheck}
            color="green"
            subtitle="Delivered successfully"
            onClick={() => navigate('/tasks')}
          />
          <StatCard
            title="My Pending Requests"
            value={pendingReqsCount}
            icon={Clock}
            color="purple"
            subtitle="Awaiting HR review"
            onClick={() => navigate('/extension-requests')}
          />
        </div>

        {/* Content Grid */}
        <div className="dashboard-content-grid" style={{ marginTop: '1.5rem' }}>
          {/* My Assigned Projects */}
          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-title-group">
                <FolderKanban size={18} color="#2563eb" />
                <h2 className="card-title">My Assigned Projects</h2>
              </div>
              <button onClick={() => navigate('/projects')} className="card-action-link">
                View Details <ArrowRight size={14} />
              </button>
            </div>
            <div className="card-body">
              {assignedProjects.length === 0 ? (
                <EmptyState
                  title="No assigned projects"
                  description="You are currently not assigned to any projects. Check back once HR assigns you to a team."
                />
              ) : (
                <div className="project-list-compact">
                  {assignedProjects.map((p) => (
                    <div key={p.id} className="project-row-item">
                      <div className="project-info-main">
                        <span className="project-code-badge">{p.projectCode}</span>
                        <div className="project-name-text">{p.name}</div>
                        <div className="project-meta-text">
                          Deadline: {p.currentDeadline} • {p.totalTasks} total tasks
                        </div>
                      </div>
                      <div className="project-progress-box">
                        <div className="progress-labels">
                          <span>Project Done</span>
                          <strong>{p.completionPercentage}%</strong>
                        </div>
                        <div className="progress-bar-track">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${Math.min(100, p.completionPercentage)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* My Urgent / Assigned Tasks */}
          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-title-group">
                <CheckSquare size={18} color="#f59e0b" />
                <h2 className="card-title">My Assigned Tasks</h2>
              </div>
              <button onClick={() => navigate('/tasks')} className="card-action-link">
                Open Task Board <ArrowRight size={14} />
              </button>
            </div>
            <div className="card-body">
              {assignedTasks.length === 0 ? (
                <EmptyState
                  title="No tasks assigned"
                  description="You have no tasks assigned at the moment."
                />
              ) : (
                <div className="task-list-compact">
                  {assignedTasks.slice(0, 5).map((t) => (
                    <div key={t.id} className="task-row-item">
                      <div>
                        <strong>{t.title}</strong>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                          Project: {t.projectName} • Due: {t.deadline}
                        </div>
                        {t.overdue && (
                          <span className="badge-danger" style={{ fontSize: '0.72rem' }}>OVERDUE</span>
                        )}
                      </div>
                      <span className={`status-badge status-${t.status.toLowerCase()}`}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Work History Quick Glance */}
        <div className="dashboard-card" style={{ marginTop: '1.5rem' }}>
          <div className="card-header">
            <div className="card-title-group">
              <FileText size={18} color="#10b981" />
              <h2 className="card-title">My Recent Progress Submissions</h2>
            </div>
            <button onClick={() => navigate('/work-history')} className="card-action-link">
              Work History <ArrowRight size={14} />
            </button>
          </div>
          <div className="card-body">
            {recentProgress.length === 0 ? (
              <div className="empty-mini">No progress updates submitted yet. Update your tasks to track your history.</div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Task</th>
                      <th>Progress</th>
                      <th>Work Completed</th>
                      <th>Remaining Work</th>
                      <th>Submitted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentProgress.map((pu) => (
                      <tr key={pu.id}>
                        <td><strong>{pu.taskTitle}</strong></td>
                        <td><span className="badge-progress">{pu.progressPercentage}%</span></td>
                        <td>{pu.workCompleted}</td>
                        <td className="text-muted">{pu.remainingWork || '—'}</td>
                        <td className="text-muted" style={{ fontSize: '0.8rem' }}>
                          {new Date(pu.submittedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }
};

export default Dashboard;
