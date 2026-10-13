import React, { useState, useEffect } from 'react';
import taskService from '../services/taskService';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  History,
  Search,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  FolderKanban,
  CheckSquare,
} from 'lucide-react';
import '../styles/tables.css';

const WorkHistory = () => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [blockersOnly, setBlockersOnly] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await taskService.getMyProgress();
      if (res && res.success && res.data) {
        setUpdates(Array.isArray(res.data) ? res.data : []);
      } else {
        setUpdates([]);
      }
    } catch (err) {
      console.error('Failed to load work history', err);
      setError(err.errorMessage || err.response?.data?.message || 'Failed to load work history.');
      setUpdates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const safeUpdates = Array.isArray(updates) ? updates : [];

  const filteredUpdates = safeUpdates.filter((u) => {
    const matchesBlocker = !blockersOnly || (u.blockers && u.blockers.trim().length > 0);
    const matchesSearch =
      !searchTerm ||
      (u.taskTitle && u.taskTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.taskCode && u.taskCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.projectName && u.projectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.updateNotes && u.updateNotes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.blockers && u.blockers.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesBlocker && matchesSearch;
  });

  const totalLogs = safeUpdates.length;
  const uniqueTasks = new Set(safeUpdates.map((u) => u.taskId)).size;
  const blockerCount = safeUpdates.filter((u) => u.blockers && u.blockers.trim().length > 0).length;

  return (
    <div style={{ padding: '1.75rem 2rem' }}>
      <PageHeader
        title="My Work History & Progress Logs"
        subtitle="Chronological, immutable record of all daily progress entries, blockers, and milestone contributions"
        icon={History}
      />

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchHistory}
            style={{
              padding: '6px 12px',
              backgroundColor: '#ffffff',
              border: '1px solid #fca5a5',
              borderRadius: '6px',
              color: '#991b1b',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
            Total Progress Logs
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#2563eb', marginTop: '4px' }}>
            {totalLogs}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Immutable entries recorded</span>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
            Tasks Contributed To
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>
            {uniqueTasks}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Deliverables updated</span>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
            Blockers Logged
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: blockerCount > 0 ? '#dc2626' : '#16a34a', marginTop: '4px' }}>
            {blockerCount}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Flagged impediments</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          marginBottom: '1.5rem',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px' }}>
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search work logs by task, project, notes or blockers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: '0.9rem',
              color: '#0f172a',
            }}
          />
        </div>

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
          <span>Show Only Blockers</span>
        </label>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading work history..." />
      ) : filteredUpdates.length === 0 ? (
        <EmptyState
          icon={History}
          title="No Work History Found"
          description="You haven't logged any progress updates yet. Go to My Tasks to submit daily progress."
        />
      ) : (
        <div className="table-responsive" style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Submitted At</th>
                <th>Task & Project</th>
                <th>Progress %</th>
                <th>Work Done / Notes</th>
                <th>Blockers</th>
                <th>Remaining Work</th>
              </tr>
            </thead>
            <tbody>
              {filteredUpdates.map((u) => {
                const hasBlocker = u.blockers && u.blockers.trim().length > 0;
                return (
                  <tr key={u.id} style={{ backgroundColor: hasBlocker ? '#fffbfb' : 'inherit' }}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem', color: '#64748b' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleString() : 'N/A'}
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: '600', color: '#0f172a' }}>{u.taskTitle || `Task #${u.taskId}`}</div>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                          <span className="table-user-id">{u.taskCode || `TSK-${u.taskId}`}</span>
                          {u.projectName && (
                            <span style={{ fontSize: '0.785rem', color: '#64748b' }}>• {u.projectName}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '50px', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px' }}>
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
                    <td style={{ fontSize: '0.875rem', color: '#334155', maxWidth: '300px', lineHeight: '1.4' }}>
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
    </div>
  );
};

export default WorkHistory;
