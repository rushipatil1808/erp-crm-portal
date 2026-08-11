import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, LogOut, User as UserIcon } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--erp-text-primary)' }}>{title}</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Active Role Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--erp-bg-muted)',
            border: '1px solid var(--erp-border)',
          }}
        >
          <ShieldCheck size={16} style={{ color: 'var(--mod-finance)' }} />
          <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--erp-text-secondary)' }}>Role:</span>
          <StatusBadge status={user?.role || 'SALES'} />
        </div>

        {/* User Account & Logout button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--erp-text-primary)',
            }}
          >
            <UserIcon size={16} style={{ color: 'var(--erp-text-muted)' }} />
            <span>{user?.name || 'Staff User'}</span>
          </div>

          <button
            onClick={logout}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.35rem 0.625rem' }}
            title="Log Out"
          >
            <LogOut size={14} />
            <span style={{ fontSize: '0.75rem' }}>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
