import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { CustomerModal } from '../components/customers/CustomerModal';
import { StockAdjustModal } from '../components/products/StockAdjustModal';
import { ChallanCreateModal } from '../components/challans/ChallanCreateModal';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Users, Package, FileText, AlertTriangle, Plus, ArrowUpDown, ArrowUpRight, ArrowDownLeft, ShieldCheck } from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, hasRole } = useAuth();
  const role = user?.role || 'SALES';

  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalProducts: 0,
    lowStockCount: 0,
    totalChallans: 0,
    recentChallans: [] as any[],
    recentMovements: [] as any[],
    sampleProduct: null as any,
  });
  const [isLoading, setIsLoading] = useState(true);

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isChallanModalOpen, setIsChallanModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [custRes, prodRes, lowStockRes, challanRes, moveRes] = await Promise.all([
        api.getCustomers({ limit: 1 }),
        api.getProducts({ limit: 50 }),
        api.getProducts({ lowStock: true }),
        api.getChallans({ limit: 5 }),
        api.getStockMovements(),
      ]);

      setStats({
        totalCustomers: custRes.meta?.total || 0,
        totalProducts: prodRes.meta?.total || 0,
        lowStockCount: lowStockRes.meta?.total || 0,
        totalChallans: challanRes.meta?.total || 0,
        recentChallans: challanRes.data || [],
        recentMovements: (moveRes.data || []).slice(0, 5),
        sampleProduct: prodRes.data?.[0] || null,
      });
    } catch (err) {
      console.error('Failed to load dashboard statistics', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Role-Specific Welcome Text Descriptions
  const getRoleDescription = () => {
    switch (role) {
      case 'ADMIN':
        return 'Full system access & administrative controls across all 4 operational modules.';
      case 'SALES':
        return 'CRM Customer management & Sales Order Challan creation workspace.';
      case 'WAREHOUSE':
        return 'Inventory stock level tracking, low-stock warnings & stock movement audit logs.';
      case 'ACCOUNTS':
        return 'Sales Challan invoice verification, client accounts & official billing statements.';
      default:
        return 'Wholesale ERP & CRM operations workspace.';
    }
  };

  return (
    <DashboardLayout currentPage="dashboard" onNavigate={onNavigate} title={`${role} Dashboard`}>
      {/* Role Banner */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderLeft: '4px solid #2563eb',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
            }}
          >
            <ShieldCheck size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e3a8a' }}>
              Welcome back, {user?.name || 'User'}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#1e40af' }}>
              Logged in as <strong style={{ textTransform: 'uppercase' }}>{role}</strong>. {getRoleDescription()}
            </p>
          </div>
        </div>
      </div>

      {/* Role-Tailored KPI Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.5rem',
        }}
      >
        {(role === 'ADMIN' || role === 'SALES' || role === 'ACCOUNTS') && (
          <MetricCard
            title="TOTAL CRM CUSTOMERS"
            value={isLoading ? '...' : stats.totalCustomers}
            subtitle="Active client accounts"
            icon={<Users size={22} />}
            variant="primary"
          />
        )}

        {(role === 'ADMIN' || role === 'WAREHOUSE') && (
          <MetricCard
            title="INVENTORY ITEMS"
            value={isLoading ? '...' : stats.totalProducts}
            subtitle="Catalog SKU items"
            icon={<Package size={22} />}
            variant="purple"
          />
        )}

        {(role === 'ADMIN' || role === 'WAREHOUSE') && (
          <MetricCard
            title="LOW STOCK ALERTS"
            value={isLoading ? '...' : stats.lowStockCount}
            subtitle={stats.lowStockCount > 0 ? 'Re-order required' : 'All stock healthy'}
            icon={<AlertTriangle size={22} />}
            variant={stats.lowStockCount > 0 ? 'danger' : 'success'}
          />
        )}

        {(role === 'ADMIN' || role === 'SALES' || role === 'ACCOUNTS') && (
          <MetricCard
            title="SALES CHALLANS"
            value={isLoading ? '...' : stats.totalChallans}
            subtitle="Total generated"
            icon={<FileText size={22} />}
            variant="warning"
          />
        )}
      </div>

      {/* Quick Actions Bar (Role Filtered) */}
      <div
        className="card"
        style={{
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1.25rem 1.5rem',
        }}
      >
        <span style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
          {role} QUICK ACTIONS
        </span>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {hasRole('ADMIN', 'SALES') && (
            <>
              <button className="btn btn-primary" onClick={() => setIsCustomerModalOpen(true)}>
                <Plus size={16} /> + Add Customer
              </button>
              <button className="btn btn-primary" onClick={() => setIsChallanModalOpen(true)}>
                <Plus size={16} /> + Create Sales Challan
              </button>
            </>
          )}
          {hasRole('ADMIN', 'WAREHOUSE') && (
            <button className="btn btn-secondary" onClick={() => setIsStockModalOpen(true)}>
              <ArrowUpDown size={16} /> Stock In/Out Adjustment
            </button>
          )}
          {role === 'ACCOUNTS' && (
            <button className="btn btn-secondary" onClick={() => onNavigate('challans')}>
              <FileText size={16} /> View All Sales Challan Invoices
            </button>
          )}
        </div>
      </div>

      {/* Role-Tailored Section Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: role === 'WAREHOUSE' ? '1fr' : role === 'SALES' ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>
        {/* Recent Sales Challans Table (Shown for Admin, Sales, Accounts) */}
        {(role === 'ADMIN' || role === 'SALES' || role === 'ACCOUNTS') && (
          <div className="card card-top-primary">
            <div className="card-header">
              <div>
                <h3 className="card-title">Recent Sales Challans</h3>
                <p className="card-subtitle">Latest order dispatches & billing status</p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('challans')}>
                View All
              </button>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Challan No</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentChallans.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        No recent sales challans found.
                      </td>
                    </tr>
                  ) : (
                    stats.recentChallans.map((ch) => (
                      <tr key={ch.id}>
                        <td><strong>#{ch.challanNumber}</strong></td>
                        <td>{ch.customer?.name}</td>
                        <td><StatusBadge status={ch.status} /></td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{ch.totalAmount?.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stock Movement Audit Log Card (Shown for Admin, Warehouse) */}
        {(role === 'ADMIN' || role === 'WAREHOUSE') && (
          <div className="card card-top-success">
            <div className="card-header">
              <div>
                <h3 className="card-title">Stock Movement Audit Feed</h3>
                <p className="card-subtitle">Real-time inventory logs</p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('stock-logs')}>
                View Audit Feed
              </button>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Product SKU</th>
                    <th>Qty</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentMovements.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        No inventory movements recorded yet.
                      </td>
                    </tr>
                  ) : (
                    stats.recentMovements.map((mv) => (
                      <tr key={mv.id}>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            {mv.type === 'IN' ? (
                              <ArrowDownLeft size={14} style={{ color: 'var(--success-color)' }} />
                            ) : (
                              <ArrowUpRight size={14} style={{ color: 'var(--danger-color)' }} />
                            )}
                            <StatusBadge status={mv.type} />
                          </span>
                        </td>
                        <td><code style={{ backgroundColor: 'var(--bg-muted)', padding: '2px 4px' }}>{mv.product?.sku}</code></td>
                        <td><strong>{mv.quantity}</strong></td>
                        <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{mv.reason}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals for Quick Actions */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSuccess={fetchDashboardData}
      />
      <ChallanCreateModal
        isOpen={isChallanModalOpen}
        onClose={() => setIsChallanModalOpen(false)}
        onSuccess={fetchDashboardData}
      />
      {stats.sampleProduct && (
        <StockAdjustModal
          isOpen={isStockModalOpen}
          onClose={() => setIsStockModalOpen(false)}
          onSuccess={fetchDashboardData}
          product={stats.sampleProduct}
        />
      )}
    </DashboardLayout>
  );
};
