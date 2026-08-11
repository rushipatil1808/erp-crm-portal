import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { StatusBadge } from '../components/common/StatusBadge';
import { CustomerModal } from '../components/customers/CustomerModal';
import { CustomerDrawer } from '../components/customers/CustomerDrawer';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';

interface CustomersPageProps {
  onNavigate: (page: string) => void;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({ onNavigate }) => {
  const { hasRole } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<any>(null);
  const [drawerCustomer, setDrawerCustomer] = useState<any>(null);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await api.getCustomers({
        search: search || undefined,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
      });
      setCustomers(res.data || []);
    } catch (err) {
      console.error('Failed to load customer list', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, statusFilter, typeFilter]);

  const handleOpenEdit = (customer: any) => {
    setCustomerToEdit(customer);
    setIsCustomerModalOpen(true);
  };

  const handleOpenDrawer = async (id: string) => {
    try {
      const res = await api.getCustomerById(id);
      setDrawerCustomer(res.data);
    } catch (err) {
      console.error('Failed to load customer details', err);
    }
  };

  const handleDeleteCustomer = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete customer '${name}'?`)) {
      return;
    }

    try {
      await api.deleteCustomer(id);
      fetchCustomers();
    } catch (err: any) {
      alert(err.message || 'Failed to delete customer');
    }
  };

  return (
    <DashboardLayout currentPage="customers" onNavigate={onNavigate} title="Customers CRM">
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
              placeholder="Search name/business..."
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          <select
            className="select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="">Filter Type: All</option>
            <option value="RETAIL">Retail</option>
            <option value="WHOLESALE">Wholesale</option>
            <option value="DISTRIBUTOR">Distributor</option>
          </select>

          <select
            className="select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '140px' }}
          >
            <option value="">Status: All</option>
            <option value="LEAD">Lead</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        {hasRole('ADMIN', 'SALES') && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setCustomerToEdit(null);
              setIsCustomerModalOpen(true);
            }}
          >
            <Plus size={16} /> + Add New Customer
          </button>
        )}
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Business</th>
              <th>Type</th>
              <th>Status</th>
              <th>Follow-up Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Loading customer records...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No customer records found.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.businessName}</td>
                  <td><StatusBadge status={c.type} /></td>
                  <td><StatusBadge status={c.status} /></td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {c.followUpDate ? new Date(c.followUpDate).toLocaleDateString('en-IN') : 'N/A'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenDrawer(c.id)}
                        title="View Customer Detail Drawer"
                      >
                        <Eye size={14} /> View Notes
                      </button>
                      {hasRole('ADMIN', 'SALES') && (
                        <>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenEdit(c)}
                            title="Edit Customer"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleDeleteCustomer(c.id, c.name)}
                            title="Delete Customer"
                            style={{ color: 'var(--danger-color)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {drawerCustomer && (
        <CustomerDrawer
          customer={drawerCustomer}
          onClose={() => setDrawerCustomer(null)}
          onRefresh={() => {
            fetchCustomers();
            handleOpenDrawer(drawerCustomer.id);
          }}
        />
      )}

      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSuccess={fetchCustomers}
        customerToEdit={customerToEdit}
      />
    </DashboardLayout>
  );
};
