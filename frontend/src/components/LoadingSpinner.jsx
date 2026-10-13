import React from 'react';

const LoadingSpinner = ({ message, text, size = 'medium' }) => {
  const displayMsg = message || text || 'Loading...';
  const dim = size === 'small' ? '20px' : size === 'large' ? '48px' : '32px';
  const borderWidth = size === 'small' ? '2px' : '3px';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1rem',
      gap: '12px',
      color: '#64748b'
    }}>
      <div
        style={{
          width: dim,
          height: dim,
          border: `${borderWidth} solid #e2e8f0`,
          borderTopColor: '#2563eb',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}
      />
      {displayMsg && <p style={{ margin: 0, fontSize: '0.875rem' }}>{displayMsg}</p>}
    </div>
  );
};

export default LoadingSpinner;
