import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import extensionService from '../services/extensionService';
import projectService from '../services/projectService';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  Clock,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FolderKanban,
  User,
  MessageSquare,
  Calendar,
} from 'lucide-react';
import '../styles/tables.css';

const ExtensionRequests = () => {
  const { user } = useAuth();
  const isHr = user?.role === 'HR';

  const [requests, setRequests] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Employee: Submit Request Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    projectId: '',
    requestedDeadline: '',
    reason: '',
  });

  // HR: Review Modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewDecision, setReviewDecision] = useState('APPROVED');
  const [hrResponseText, setHrResponseText] = useState('');

  // Confirmation dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      if (isHr) {
        const param = statusFilter === 'ALL' ? null : statusFilter;
        const res = await extensionService.getAllRequests(param);
        if (res.success) setRequests(res.data || []);
      } else {
        const res = await extensionService.getMyRequests();
        if (res.success) setRequests(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load extension requests', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const res = await projectService.getAllProjects();
      if (res.success) {
        setProjects(res.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
    if (!isHr) {
      loadProjects();
    }
  }, [statusFilter, isHr]);

  const handleOpenCreateModal = () => {
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    setFormData({
      projectId: projects[0]?.id || '',
      requestedDeadline: nextWeek,
      reason: '',
    });
    setErrorMsg(null);
    setCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.projectId) {
      setErrorMsg('Please select a project');
      return;
    }
    if (!formData.requestedDeadline) {
      setErrorMsg('Please select a requested deadline');
      return;
    }
    if (!formData.reason.trim()) {
      setErrorMsg('Please provide a reason for the extension request');
      return;
    }
    setActionLoading(true);
    setErrorMsg(null);
    try {
      await extensionService.createRequest({
        projectId: formData.projectId,
        requestedDeadline: formData.requestedDeadline,
        reason: formData.reason,
      });
      setCreateModalOpen(false);
      fetchRequests();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit extension request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenReviewModal = (req) => {
    setSelectedRequest(req);
    setReviewDecision('APPROVED');
    setHrResponseText('');
    setErrorMsg(null);
    setReviewModalOpen(true);
  };

  const handleConfirmReview = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      await extensionService.reviewRequest(selectedRequest.id, reviewDecision, hrResponseText);
      setReviewModalOpen(false);
      setConfirmDialogOpen(false);
      fetchRequests();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to review request');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="status-pill status-completed">APPROVED</span>;
      case 'REJECTED':
        return <span className="status-pill status-overdue">REJECTED</span>;
      case 'PENDING':
      default:
        return <span className="status-pill status-inprogress">PENDING</span>;
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (statusFilter === 'ALL') return true;
    return r.status === statusFilter;
  });

  return (
    <div style={{ padding: '1.75rem 2rem' }}>
      <PageHeader
        title="Deadline Extension Requests"
        subtitle={
          isHr
            ? 'Review and manage employee requests for project timeline and deadline extensions'
            : 'Submit and track deadline extensions for projects when unforeseen impediments arise'
        }
        icon={Clock}
        actions={
          !isHr && (
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
              <span>Request Extension</span>
            </button>
          )
        }
      />

      {/* Filter Bar */}
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
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="#64748b" />
          <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>Filter by Status:</span>
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
            <option value="ALL">All Requests</option>
            <option value="PENDING">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Total: <strong>{filteredRequests.length}</strong> request{filteredRequests.length === 1 ? '' : 's'}
        </span>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading requests..." />
      ) : filteredRequests.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No Extension Requests"
          description={
            isHr
              ? 'There are currently no deadline extension requests matching this filter.'
              : 'You have not submitted any extension requests yet.'
          }
          actionLabel={!isHr ? 'Request Extension' : null}
          onAction={!isHr ? handleOpenCreateModal : null}
        />
      ) : (
        <div className="table-responsive" style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Project</th>
                {isHr && <th>Requested By</th>}
                <th>Current Deadline</th>
                <th>Requested Deadline</th>
                <th>Reason</th>
                <th>Status</th>
                <th>HR Response</th>
                {isHr && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{r.projectName || 'Project'}</div>
                      <span className="table-user-id">{r.projectCode || `PRJ-${r.projectId}`}</span>
                    </div>
                  </td>

                  {isHr && (
                    <td>
                      <div>
                        <div style={{ fontWeight: '500', color: '#0f172a' }}>{r.requestedByEmployeeName}</div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.requestedByEmployeeCode}</span>
                      </div>
                    </td>
                  )}

                  <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{r.currentDeadline || 'N/A'}</td>

                  <td>
                    <span style={{ fontWeight: '700', color: '#d97706', fontSize: '0.85rem' }}>
                      {r.requestedDeadline}
                    </span>
                  </td>

                  <td style={{ fontSize: '0.85rem', color: '#334155', maxWidth: '240px' }}>
                    {r.reason}
                  </td>

                  <td>{getStatusBadge(r.status)}</td>

                  <td style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '200px' }}>
                    {r.hrResponse ? (
                      <div>
                        <div>{r.hrResponse}</div>
                        {r.reviewedByHrName && (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>— {r.reviewedByHrName}</span>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: '#cbd5e1' }}>—</span>
                    )}
                  </td>

                  {isHr && (
                    <td style={{ textAlign: 'right' }}>
                      {r.status === 'PENDING' ? (
                        <button
                          onClick={() => handleOpenReviewModal(r)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: '#2563eb',
                            color: '#ffffff',
                            fontWeight: '600',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                          }}
                        >
                          Review
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Reviewed</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Employee: Request Extension Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Request Project Deadline Extension"
        maxWidth="520px"
      >
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
              Project *
            </label>
            <select
              required
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
              }}
            >
              <option value="">-- Choose Project --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.projectCode || `PRJ-${p.id}`}) — Current Deadline: {p.currentDeadline || p.originalDeadline || 'TBD'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#334155', marginBottom: '4px' }}>
              Requested New Deadline *
            </label>
            <input
              type="date"
              required
              value={formData.requestedDeadline}
              onChange={(e) => setFormData({ ...formData, requestedDeadline: e.target.value })}
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
              Detailed Reason / Blockers *
            </label>
            <textarea
              required
              rows={4}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Explain unexpected technical complexity, vendor dependencies, or resource bottlenecks..."
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
              onClick={() => setCreateModalOpen(false)}
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
              {actionLoading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* HR: Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Review Deadline Extension Request"
        maxWidth="520px"
      >
        {selectedRequest && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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

            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.875rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '8px', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Project:</span>
                <span style={{ fontWeight: '600', color: '#0f172a' }}>{selectedRequest.projectName}</span>

                <span style={{ color: '#64748b' }}>Requested By:</span>
                <span>{selectedRequest.requestedByEmployeeName} ({selectedRequest.requestedByEmployeeCode})</span>

                <span style={{ color: '#64748b' }}>Current Deadline:</span>
                <span>{selectedRequest.currentDeadline || 'N/A'}</span>

                <span style={{ color: '#64748b' }}>New Deadline:</span>
                <span style={{ fontWeight: '700', color: '#d97706' }}>{selectedRequest.requestedDeadline}</span>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '8px' }}>
                <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Reason:</span>
                <p style={{ margin: 0, color: '#334155', fontStyle: 'italic', lineHeight: '1.4' }}>"{selectedRequest.reason}"</p>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>
                Decision *
              </label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: reviewDecision === 'APPROVED' ? '2px solid #16a34a' : '1px solid #cbd5e1',
                    backgroundColor: reviewDecision === 'APPROVED' ? '#f0fdf4' : '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="decision"
                    value="APPROVED"
                    checked={reviewDecision === 'APPROVED'}
                    onChange={() => setReviewDecision('APPROVED')}
                  />
                  <span style={{ fontWeight: '600', color: '#16a34a' }}>Approve Extension</span>
                </label>

                <label
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: reviewDecision === 'REJECTED' ? '2px solid #dc2626' : '1px solid #cbd5e1',
                    backgroundColor: reviewDecision === 'REJECTED' ? '#fef2f2' : '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="decision"
                    value="REJECTED"
                    checked={reviewDecision === 'REJECTED'}
                    onChange={() => setReviewDecision('REJECTED')}
                  />
                  <span style={{ fontWeight: '600', color: '#dc2626' }}>Reject Extension</span>
                </label>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#334155', marginBottom: '4px' }}>
                HR Response / Feedback Note (Optional)
              </label>
              <textarea
                rows={3}
                value={hrResponseText}
                onChange={(e) => setHrResponseText(e.target.value)}
                placeholder="e.g. Approved. Please ensure sprint goals align with new schedule..."
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
                onClick={() => setReviewModalOpen(false)}
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
                type="button"
                onClick={() => setConfirmDialogOpen(true)}
                style={{
                  padding: '0.6rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: reviewDecision === 'APPROVED' ? '#16a34a' : '#dc2626',
                  color: '#ffffff',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Submit Decision
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleConfirmReview}
        title={`Confirm ${reviewDecision === 'APPROVED' ? 'Approval' : 'Rejection'}`}
        message={`Are you sure you want to ${reviewDecision.toLowerCase()} this deadline extension request for ${selectedRequest?.projectName}?`}
        confirmText={`Yes, ${reviewDecision === 'APPROVED' ? 'Approve' : 'Reject'}`}
        type={reviewDecision === 'APPROVED' ? 'primary' : 'danger'}
        loading={actionLoading}
      />
    </div>
  );
};

export default ExtensionRequests;
