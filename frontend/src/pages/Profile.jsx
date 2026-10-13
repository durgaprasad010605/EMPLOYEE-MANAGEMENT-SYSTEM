import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Shield,
  Key,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import '../styles/tables.css';

const Profile = () => {
  const { user } = useAuth();
  const isHr = user?.role === 'HR';

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        if (isHr) {
          const res = await api.get('/hr/me');
          if (res.data?.success) {
            setProfileData(res.data.data);
          }
        } else {
          const res = await api.get('/employees/me');
          if (res.data?.success) {
            setProfileData(res.data.data);
          }
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isHr]);

  if (loading) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  const displayName = profileData?.fullName || user?.displayName || user?.username || 'User';
  const displayRole = user?.role || 'EMPLOYEE';
  const displayEmail = profileData?.email || user?.email || 'N/A';
  const displayPhone = profileData?.phone || 'N/A';
  const displayDesignation = profileData?.designation || (isHr ? 'HR Administrator' : 'Software Engineer');
  const employeeCode = profileData?.employeeCode || null;

  return (
    <div style={{ padding: '1.75rem 2rem' }}>
      <PageHeader
        title="My Profile"
        subtitle="Manage personal contact credentials, role authorizations, and account status"
        icon={User}
      />

      {/* Profile Header Banner */}
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
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: isHr ? '#ede9fe' : '#e0e7ff',
              color: isHr ? '#6d28d9' : '#1d4ed8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              fontWeight: '700',
            }}
          >
            {displayName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                {displayName}
              </h1>
              {employeeCode && <span className="table-user-id">{employeeCode}</span>}
              <span className={`user-role-badge ${isHr ? 'role-hr' : 'role-emp'}`}>
                {displayRole}
              </span>
            </div>
            <p style={{ color: '#475569', fontSize: '0.9rem', marginTop: '4px', marginBottom: '6px' }}>
              {displayDesignation}
            </p>
            <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.825rem', color: '#64748b' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Mail size={14} /> {displayEmail}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Phone size={14} /> {displayPhone}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '20px',
              backgroundColor: '#f0fdf4',
              color: '#16a34a',
              fontSize: '0.85rem',
              fontWeight: '600',
              border: '1px solid #bbf7d0',
            }}
          >
            <CheckCircle2 size={16} />
            <span>Account Active</span>
          </div>
        </div>
      </div>

      {/* Grid of Profile Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Personal Details */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Briefcase size={18} color="#2563eb" />
            <span>Professional Details</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '12px', fontSize: '0.875rem' }}>
            {employeeCode && (
              <>
                <span style={{ color: '#64748b' }}>Employee Code:</span>
                <span style={{ fontWeight: '600', color: '#0f172a' }}>{employeeCode}</span>
              </>
            )}

            <span style={{ color: '#64748b' }}>Full Name:</span>
            <span style={{ fontWeight: '500', color: '#0f172a' }}>{displayName}</span>

            <span style={{ color: '#64748b' }}>Designation:</span>
            <span style={{ color: '#0f172a' }}>{displayDesignation}</span>

            <span style={{ color: '#64748b' }}>Email Address:</span>
            <span style={{ color: '#0f172a' }}>{displayEmail}</span>

            <span style={{ color: '#64748b' }}>Contact Phone:</span>
            <span style={{ color: '#0f172a' }}>{displayPhone}</span>

            {profileData?.joiningDate && (
              <>
                <span style={{ color: '#64748b' }}>Joining Date:</span>
                <span style={{ color: '#0f172a' }}>{profileData.joiningDate}</span>
              </>
            )}
          </div>
        </div>

        {/* Security & Access */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} color="#2563eb" />
            <span>Authentication & Security</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '12px', fontSize: '0.875rem' }}>
            <span style={{ color: '#64748b' }}>Username:</span>
            <span style={{ fontWeight: '600', color: '#0f172a' }}>@{user?.username || 'user'}</span>

            <span style={{ color: '#64748b' }}>Security Role:</span>
            <span style={{ fontWeight: '700', color: isHr ? '#6d28d9' : '#1d4ed8' }}>
              {displayRole}
            </span>

            <span style={{ color: '#64748b' }}>Auth Mechanism:</span>
            <span style={{ color: '#0f172a' }}>SHA-256 + Stateless JWT</span>

            <span style={{ color: '#64748b' }}>Account Setup:</span>
            <span style={{ color: '#475569' }}>Manual database provisioned</span>
          </div>

          <div
            style={{
              marginTop: '1.5rem',
              padding: '0.85rem',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '0.8rem',
              color: '#64748b',
              lineHeight: '1.4',
            }}
          >
            <Lock size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
            In accordance with workforce security policies, user credentials and roles are provisioned via IT administration scripts.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
