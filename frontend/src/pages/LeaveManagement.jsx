import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import leaveService from '../services/leaveService';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  CalendarOff,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  User,
  Calendar,
} from 'lucide-react';
import '../styles/tables.css';

const LeaveManagement = () => {
  const { user } = useAuth();
  const isHr = user?.role === 'HR';

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Employee: Apply Leave Modal
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'CASUAL',
    startDate: '',
    endDate: '',
    reason: '',
  });

  // HR: Review Modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewDecision, setReviewDecision] = useState('APPROVED');
  const [hrResponseText, setHrResponseText] = useState('');

  // Confirmation dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      if (isHr) {
        const param = statusFilter === 'ALL' ? null : statusFilter;
        const res = await leaveService.getAllLeaves(param);
        if (res.success) setLeaves(res.data || []);
      } else {
        const res = await leaveService.getMyLeaves();
        if (res.success) setLeaves(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load leaves', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter, isHr]);

  const handleOpenApplyModal = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      leaveType: 'CASUAL',
      startDate: today,
      endDate: today,
      reason: '',
    });
    setErrorMsg(null);
    setApplyModalOpen(true);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate) {
      setErrorMsg('Please specify start and end dates');
      return;
    }
    if (formData.endDate < formData.startDate) {
      setErrorMsg('End date cannot be earlier than start date');
      return;
    }
    if (!formData.reason.trim()) {
      setErrorMsg('Please specify a reason for leave');
      return;
    }
    setActionLoading(true);
    setErrorMsg(null);
    try {
      await leaveService.applyLeave(formData);
      setApplyModalOpen(false);
      fetchLeaves();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenReviewModal = (leave) => {
    setSelectedLeave(leave);
    setReviewDecision('APPROVED');
    setHrResponseText('');
    setErrorMsg(null);
    setReviewModalOpen(true);
  };

  const handleConfirmReview = async () => {
    if (!selectedLeave) return;
    setActionLoading(true);
    try {
      await leaveService.reviewLeave(selectedLeave.id, reviewDecision, hrResponseText);
      setReviewModalOpen(false);
      setConfirmDialogOpen(false);
      fetchLeaves();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to review leave application');
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

  const filteredLeaves = leaves.filter((l) => {
    if (statusFilter === 'ALL') return true;
    return l.status === statusFilter;
  });

  return (
    <div style={{ padding: '1.75rem 2rem' }}>
      <PageHeader
        title={isHr ? 'Leave Requests Management' : 'My Leave Requests'}
        subtitle={
          isHr
            ? 'Review and manage employee time off, sick leave, and casual absence requests'
            : 'Apply for time off and track your approval status in real time'
        }
        icon={CalendarOff}
        actions={
          !isHr && (
            <button
              onClick={handleOpenApplyModal}
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
              <span>Apply for Leave</span>
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
          Total: <strong>{filteredLeaves.length}</strong> record{filteredLeaves.length === 1 ? '' : 's'}
        </span>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading leave records..." />
      ) : filteredLeaves.length === 0 ? (
        <EmptyState
          icon={CalendarOff}
          title="No Leave Records Found"
          description={
            isHr
              ? 'There are no leave requests matching the selected filter.'
              : 'You have not submitted any leave requests yet.'
          }
          actionLabel={!isHr ? 'Apply for Leave' : null}
          onAction={!isHr ? handleOpenApplyModal : null}
        />
      ) : (
        <div className="table-responsive" style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <table className="custom-table">
            <thead>
              <tr>
                {isHr && <th>Employee</th>}
                <th>Leave Type</th>
                <th>Dates</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>HR Response</th>
                {isHr && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.map((l) => (
                <tr key={l.id}>
                  {isHr && (
                    <td>
                      <div>
                        <div style={{ fontWeight: '600', color: '#0f172a' }}>{l.employeeName}</div>
                        <span className="table-user-id">{l.employeeCode}</span>
                      </div>
                    </td>
                  )}

                  <td>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.785rem',
                        fontWeight: '700',
                        backgroundColor: '#f1f5f9',
                        color: '#334155',
                      }}
                    >
                      {l.leaveType}
                    </span>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#475569' }}>
                      <Calendar size={13} color="#94a3b8" />
                      <span>
                        {l.startDate} &rarr; {l.endDate}
                      </span>
                    </div>
                  </td>

                  <td>
                    <span style={{ fontWeight: '700', color: '#0f172a' }}>{l.days || 1} day{l.days > 1 ? 's' : ''}</span>
                  </td>

                  <td style={{ fontSize: '0.85rem', color: '#334155', maxWidth: '240px' }}>
                    {l.reason}
                  </td>

                  <td>{getStatusBadge(l.status)}</td>

                  <td style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '200px' }}>
                    {l.hrResponse ? (
                      <div>
                        <div>{l.hrResponse}</div>
                        {l.reviewedByHrName && (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>— {l.reviewedByHrName}</span>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: '#cbd5e1' }}>—</span>
                    )}
                  </td>

                  {isHr && (
                    <td style={{ textAlign: 'right' }}>
                      {l.status === 'PENDING' ? (
                        <button
                          onClick={() => handleOpenReviewModal(l)}
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

      {/* Employee: Apply Leave Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title="Apply for Leave of Absence"
        maxWidth="500px"
      >
        <form onSubmit={handleApplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
              Leave Type *
            </label>
            <select
              value={formData.leaveType}
              onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
              }}
            >
              <option value="CASUAL">Casual Leave</option>
              <option value="SICK">Sick / Medical Leave</option>
              <option value="PERSONAL">Personal Emergency</option>
              <option value="VACATION">Vacation / Planned Time Off</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#334155', marginBottom: '4px' }}>
                Start Date *
              </label>
              <input
                type="date"
                required
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
                End Date *
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
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
              Reason for Absence *
            </label>
            <textarea
              required
              rows={3}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Provide context regarding coverage and handover..."
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
              onClick={() => setApplyModalOpen(false)}
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
              {actionLoading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </Modal>

      {/* HR: Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Review Leave Application"
        maxWidth="520px"
      >
        {selectedLeave && (
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
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Employee:</span>
                <span style={{ fontWeight: '600', color: '#0f172a' }}>{selectedLeave.employeeName} ({selectedLeave.employeeCode})</span>

                <span style={{ color: '#64748b' }}>Leave Type:</span>
                <span style={{ fontWeight: '600' }}>{selectedLeave.leaveType}</span>

                <span style={{ color: '#64748b' }}>Duration:</span>
                <span>{selectedLeave.startDate} &rarr; {selectedLeave.endDate} ({selectedLeave.days || 1} day{selectedLeave.days > 1 ? 's' : ''})</span>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '8px' }}>
                <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Reason:</span>
                <p style={{ margin: 0, color: '#334155', fontStyle: 'italic', lineHeight: '1.4' }}>"{selectedLeave.reason}"</p>
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
                  <span style={{ fontWeight: '600', color: '#16a34a' }}>Approve Leave</span>
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
                  <span style={{ fontWeight: '600', color: '#dc2626' }}>Reject Leave</span>
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
                placeholder="e.g. Approved. Have a good break!..."
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
        title={`Confirm Leave ${reviewDecision === 'APPROVED' ? 'Approval' : 'Rejection'}`}
        message={`Are you sure you want to ${reviewDecision.toLowerCase()} this leave request for ${selectedLeave?.employeeName}?`}
        confirmText={`Yes, ${reviewDecision === 'APPROVED' ? 'Approve' : 'Reject'}`}
        type={reviewDecision === 'APPROVED' ? 'primary' : 'danger'}
        loading={actionLoading}
      />
    </div>
  );
};

export default LeaveManagement;
