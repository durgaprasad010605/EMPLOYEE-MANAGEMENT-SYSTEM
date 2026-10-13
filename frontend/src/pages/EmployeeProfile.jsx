import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import employeeService from '../services/employeeService';
import {
  User,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  CheckSquare,
  Clock,
  Layers,
  AlertTriangle,
  FolderKanban,
  FileText,
} from 'lucide-react';
import '../styles/tables.css';

const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await employeeService.getEmployeeProfile(id);
        if (res.success && res.data) {
          setProfile(res.data);
        } else {
          setError('Employee details could not be found');
        }
      } catch (err) {
        console.error('Failed to load profile', err);
        setError(err.response?.data?.message || 'Failed to load employee profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#64748b' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>Loading employee profile...</div>
      </div>
    );
  }

  if (error || !profile?.employee) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>Employee Not Found</h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{error || 'Unable to retrieve employee records.'}</p>
        <button
          onClick={() => navigate('/employees')}
          style={{
            padding: '0.6rem 1.25rem',
            backgroundColor: '#2563eb',
            color: '#fff',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          Back to Employees
        </button>
      </div>
    );
  }

  const emp = profile.employee;
  const projectMemberships = profile.projectMemberships || [];
  const tasks = profile.tasks || [];
  const progressUpdates = profile.progressUpdates || [];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="status-pill status-active">ACTIVE</span>;
      case 'INACTIVE':
        return <span className="status-pill status-inactive">INACTIVE</span>;
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
      case 'HIGH':
        return <span style={{ color: '#ef4444', fontWeight: '600', fontSize: '0.8rem' }}>HIGH</span>;
      case 'MEDIUM':
        return <span style={{ color: '#f59e0b', fontWeight: '600', fontSize: '0.8rem' }}>MEDIUM</span>;
      case 'LOW':
      default:
        return <span style={{ color: '#10b981', fontWeight: '600', fontSize: '0.8rem' }}>LOW</span>;
    }
  };

  return (
    <div style={{ padding: '1.75rem 2rem' }}>
      <button
        onClick={() => navigate('/employees')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: '#64748b',
          fontSize: '0.875rem',
          fontWeight: '500',
          marginBottom: '1.25rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to Employees</span>
      </button>

      {/* Header Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '1.75rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              backgroundColor: '#e0e7ff',
              color: '#3730a3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: '700',
            }}
          >
            {(emp.fullName || 'E').substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                {emp.fullName}
              </h1>
              <span className="table-user-id">{emp.employeeCode}</span>
              {getStatusBadge(emp.status)}
            </div>
            <p style={{ color: '#475569', fontSize: '0.9rem', marginTop: '4px', marginBottom: '6px' }}>
              {emp.designation || 'Software Engineer'}
            </p>
            <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.825rem', color: '#64748b' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Mail size={14} /> {emp.email || 'No email attached'}
              </span>
              {emp.phone && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={14} /> {emp.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div style={{ textAlign: 'center', padding: '0.5rem 1rem', background: '#f8fafc', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>
              Projects
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>
              {projectMemberships.length}
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '0.5rem 1rem', background: '#f8fafc', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>
              Assigned Tasks
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>
              {tasks.length}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
        {[
          { key: 'overview', label: 'Overview', icon: User },
          { key: 'projects', label: `Projects (${projectMemberships.length})`, icon: FolderKanban },
          { key: 'tasks', label: `Tasks (${tasks.length})`, icon: CheckSquare },
          { key: 'progress', label: `Progress History (${progressUpdates.length})`, icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                fontSize: '0.875rem',
                fontWeight: isActive ? '600' : '500',
                color: isActive ? '#2563eb' : '#64748b',
                border: 'none',
                background: 'none',
                borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
                cursor: 'pointer',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a', marginBottom: '1.25rem' }}>
              Employee Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '12px', fontSize: '0.875rem' }}>
              <span style={{ color: '#64748b' }}>Employee Code:</span>
              <span style={{ fontWeight: '600', color: '#0f172a' }}>{emp.employeeCode}</span>

              <span style={{ color: '#64748b' }}>Full Name:</span>
              <span style={{ fontWeight: '500', color: '#0f172a' }}>{emp.fullName}</span>

              <span style={{ color: '#64748b' }}>Designation:</span>
              <span style={{ color: '#0f172a' }}>{emp.designation || 'N/A'}</span>

              <span style={{ color: '#64748b' }}>Email:</span>
              <span style={{ color: '#0f172a' }}>{emp.email || 'N/A'}</span>

              <span style={{ color: '#64748b' }}>Phone:</span>
              <span style={{ color: '#0f172a' }}>{emp.phone || 'N/A'}</span>

              <span style={{ color: '#64748b' }}>Joining Date:</span>
              <span style={{ color: '#0f172a' }}>{emp.joiningDate || 'N/A'}</span>

              <span style={{ color: '#64748b' }}>Status:</span>
              <div>{getStatusBadge(emp.status)}</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a', marginBottom: '1.25rem' }}>
              Account & Credentials
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '12px', fontSize: '0.875rem' }}>
              <span style={{ color: '#64748b' }}>User Account:</span>
              <span style={{ fontWeight: '500', color: '#0f172a' }}>
                {emp.username ? `@${emp.username}` : 'No login account linked'}
              </span>

              <span style={{ color: '#64748b' }}>Role:</span>
              <span style={{ fontWeight: '600', color: '#2563eb' }}>EMPLOYEE</span>

              <span style={{ color: '#64748b' }}>Created On:</span>
              <span style={{ color: '#64748b' }}>{emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Projects */}
      {activeTab === 'projects' && (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
          {projectMemberships.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              No projects currently assigned to this employee.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Code</th>
                    <th>Assigned Role</th>
                    <th>Assigned On</th>
                  </tr>
                </thead>
                <tbody>
                  {projectMemberships.map((m) => (
                    <tr key={m.id}>
                      <td style={{ fontWeight: '600', color: '#0f172a' }}>{m.projectName || 'Project'}</td>
                      <td><span className="table-user-id">{m.projectCode || `PRJ-${m.projectId}`}</span></td>
                      <td>
                        <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '3px 8px', borderRadius: '4px', fontSize: '0.785rem', fontWeight: '600' }}>
                          {m.projectRole || 'Team Member'}
                        </span>
                      </td>
                      <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                        {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Tasks */}
      {activeTab === 'tasks' && (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
          {tasks.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              No tasks currently assigned to this employee.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Task Code</th>
                    <th>Title</th>
                    <th>Project</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Progress</th>
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t) => (
                    <tr key={t.id}>
                      <td><span className="table-user-id">{t.taskCode || `TSK-${t.id}`}</span></td>
                      <td style={{ fontWeight: '600', color: '#0f172a' }}>{t.title}</td>
                      <td>{t.projectName || `Project #${t.projectId}`}</td>
                      <td>{getPriorityBadge(t.priority)}</td>
                      <td>{getStatusBadge(t.status)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', width: '60px' }}>
                            <div
                              style={{
                                width: `${t.progressPercentage || 0}%`,
                                height: '100%',
                                backgroundColor: '#2563eb',
                                borderRadius: '3px',
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '0.785rem', color: '#64748b' }}>{t.progressPercentage || 0}%</span>
                        </div>
                      </td>
                      <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{t.dueDate || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Progress History */}
      {activeTab === 'progress' && (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
          {progressUpdates.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              No progress updates submitted by this employee yet.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Submitted On</th>
                    <th>Task</th>
                    <th>Progress %</th>
                    <th>Notes</th>
                    <th>Blockers</th>
                    <th>Remaining Work</th>
                  </tr>
                </thead>
                <tbody>
                  {progressUpdates.map((p) => (
                    <tr key={p.id}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem', color: '#64748b' }}>
                        {p.createdAt ? new Date(p.createdAt).toLocaleString() : 'N/A'}
                      </td>
                      <td style={{ fontWeight: '600', color: '#0f172a' }}>{p.taskTitle || `Task #${p.taskId}`}</td>
                      <td>
                        <span style={{ fontWeight: '700', color: '#2563eb' }}>{p.progressPercentage}%</span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: '#334155', maxWidth: '280px' }}>{p.updateNotes || '-'}</td>
                      <td style={{ fontSize: '0.85rem', color: p.blockers ? '#dc2626' : '#64748b', maxWidth: '200px' }}>
                        {p.blockers || 'None'}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '200px' }}>
                        {p.remainingWork || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeProfile;
