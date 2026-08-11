import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, Package, FileText, History, LogOut } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { Logo } from '../common/Logo';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const { user, logout } = useAuth();
  const role = user?.role || 'SALES';

  // Role-Specific Navigation Menu Filtering (PDF Core Modules)
  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
    { id: 'customers', label: 'Customers CRM', Icon: Users, roles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
    { id: 'products', label: 'Inventory & Stock', Icon: Package, roles: ['ADMIN', 'WAREHOUSE'] },
    { id: 'challans', label: 'Sales Challans', Icon: FileText, roles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
    { id: 'stock-logs', label: 'Stock Audit Logs', Icon: History, roles: ['ADMIN', 'WAREHOUSE'] },
  ];

  const allowedNavItems = allNavItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="sidebar">
      {/* Branding with Logo */}
      <div
        style={{
          padding: '1.25rem 1.25rem',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <Logo size={38} showText={true} subtitle="Wholesale & CRM" />
      </div>

      {/* Role-Customized Nav List */}
      <nav style={{ padding: '1rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {allowedNavItems.map((item) => {
          const isActive = currentPage === item.id;
          const ItemIcon = item.Icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="btn"
              style={{
                width: '100%',
                justifyContent: 'flex-start',
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isActive ? 'var(--primary-lt)' : 'transparent',
                color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                border: 'none',
              }}
            >
              <ItemIcon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Footer Card */}
      <div
        style={{
          padding: '1rem',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-muted)',
          margin: '0.5rem',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.name}</span>
          <StatusBadge status={user?.role || 'USER'} />
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{user?.email}</p>
        <button
          onClick={logout}
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
