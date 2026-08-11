import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'purple' | 'success' | 'warning' | 'danger';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'primary',
}) => {
  let cardBgClass = 'card-blue';
  let avatarClass = 'avatar-primary';

  switch (variant) {
    case 'purple':
      cardBgClass = 'card-purple';
      avatarClass = 'avatar-purple';
      break;
    case 'success':
      cardBgClass = 'card-emerald';
      avatarClass = 'avatar-success';
      break;
    case 'warning':
      cardBgClass = 'card-amber';
      avatarClass = 'avatar-warning';
      break;
    case 'danger':
      cardBgClass = 'card-danger';
      avatarClass = 'avatar-danger';
      break;
    case 'primary':
    default:
      cardBgClass = 'card-blue';
      avatarClass = 'avatar-primary';
      break;
  }

  return (
    <div className={`card ${cardBgClass}`}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span className="card-subtitle" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.75rem' }}>
            {title}
          </span>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.25rem 0' }}>
            {value}
          </div>
          {subtitle && <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{subtitle}</div>}
        </div>

        {icon && <div className={`avatar-circle ${avatarClass}`}>{icon}</div>}
      </div>
    </div>
  );
};
