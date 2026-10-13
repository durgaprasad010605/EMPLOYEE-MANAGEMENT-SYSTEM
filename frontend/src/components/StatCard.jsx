import React from 'react';
import '../styles/dashboard.css';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  type,
  color,
  trend = 'neutral',
  onClick,
}) => {
  const iconTheme = color || type || 'blue';

  return (
    <div
      className={`stat-card ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="stat-card-top">
        <span className="stat-card-title">{title}</span>
        <div className={`stat-card-icon ${iconTheme}`}>
          {Icon && <Icon size={20} />}
        </div>
      </div>
      <div className="stat-card-value">{value}</div>
      <div className={`stat-card-bottom ${trend === 'up' ? 'trend-up' : 'trend-neutral'}`}>
        <span>{subtitle}</span>
      </div>
    </div>
  );
};

export default StatCard;
