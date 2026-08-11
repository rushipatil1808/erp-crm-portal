import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { StatusBadge } from '../components/common/StatusBadge';
import { ChallanCreateModal } from '../components/challans/ChallanCreateModal';
import { ChallanDetailModal } from '../components/challans/ChallanDetailModal';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Eye, FileText, Trash2 } from 'lucide-react';

interface ChallansPageProps {
  onNavigate: (page: string) => void;
}

export const ChallansPage: React.FC<ChallansPageProps> = ({ onNavigate }) => {
  const { hasRole } = useAuth();
  const [challans, setChallans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState<any>(null);

  const fetchChallans = async () => {
    setIsLoading(true);
    try {
      const res = await api.getChallans({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setChallans(res.data || []);
    } catch (err) {
      console.error('Failed to load sales challans', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [search, statusFilter]);

  const handleOpenDetail = async (id: string) => {
    try {
      const res = await api.getChallanById(id);
      setSelectedChallan(res.data);
      setIsDetailModalOpen(true);
    } catch (err) {
      console.error('Failed to load challan details', err);
    }
  };

  const handleDeleteChallan = async (id: string, challanNo: string) => {
    if (!window.confirm(`Are you sure you want to delete Sales Challan #${challanNo}?`)) {
      return;
    }

    try {
      await api.deleteChallan(id);
      fetchChallans();
    } catch (err: any) {
      alert(err.message || 'Failed to delete Sales Challan');
    }
  };

  return (
    <DashboardLayout currentPage="challans" onNavigate={onNavigate} title="Sales Challan Operations">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              className="input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search challan # or customer name..."
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          <select
            className="select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '160px' }}
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {hasRole('ADMIN', 'SALES') && (
          <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={16} /> Create Sales Challan
          </button>
        )}
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Challan Number</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items & Qty</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Loading sales challans...
                </td>
              </tr>
            ) : challans.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No sales challans generated yet.
                </td>
              </tr>
            ) : (
              challans.map((ch) => (
                <tr key={ch.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText size={16} style={{ color: 'var(--text-muted)' }} />
                      <strong>#{ch.challanNumber}</strong>
                    </div>
                  </td>
                  <td>
                    <strong>{ch.customer?.name}</strong>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{ch.customer?.businessName}</div>
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {new Date(ch.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td>{ch.totalQuantity} items</td>
                  <td><strong>₹{ch.totalAmount?.toFixed(2)}</strong></td>
                  <td><StatusBadge status={ch.status} /></td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenDetail(ch.id)}
                        title="View Printable Invoice"
                      >
                        <Eye size={14} /> View Invoice
                      </button>
                      {hasRole('ADMIN', 'SALES') && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleDeleteChallan(ch.id, ch.challanNumber)}
                          title="Delete Challan"
                          style={{ color: 'var(--danger-color)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ChallanCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchChallans}
      />
      <ChallanDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onSuccess={fetchChallans}
        challan={selectedChallan}
      />
    </DashboardLayout>
  );
};
