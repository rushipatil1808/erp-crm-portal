import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let badgeClass = 'badge-secondary';

  switch (status.toUpperCase()) {
    case 'ACTIVE':
    case 'CONFIRMED':
    case 'WHOLESALE':
    case 'IN':
      badgeClass = 'badge-success';
      break;
    case 'LEAD':
    case 'DRAFT':
    case 'RETAIL':
      badgeClass = 'badge-primary';
      break;
    case 'INACTIVE':
    case 'CANCELLED':
    case 'OUT':
      badgeClass = 'badge-danger';
      break;
    case 'DISTRIBUTOR':
    case 'ADMIN':
      badgeClass = 'badge-purple';
      break;
    case 'SALES':
    case 'WAREHOUSE':
    case 'ACCOUNTS':
      badgeClass = 'badge-warning';
      break;
    default:
      badgeClass = 'badge-secondary';
  }

  return (
    <span className={`badge ${badgeClass}`}>
      <span className="status-dot"></span>
      {status}
    </span>
  );
};
