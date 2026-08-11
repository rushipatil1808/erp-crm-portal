import React, { useState } from 'react';
import { api } from '../../api/client';
import { X, MessageSquare, Clock, Plus } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

interface CustomerDrawerProps {
  customer: any;
  onClose: () => void;
  onRefresh: () => void;
}

export const CustomerDrawer: React.FC<CustomerDrawerProps> = ({
  customer,
  onClose,
  onRefresh,
}) => {
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!customer) return null;

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await api.addFollowUp(customer.id, { note: newNote });
      setNewNote('');
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to add follow-up note');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: '650px', height: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <h3 className="card-title" style={{ fontSize: '1.125rem' }}>Customer Details: {customer.name}</h3>
              <StatusBadge status={customer.status} />
            </div>
            <p className="card-subtitle">{customer.businessName} • {customer.type} Customer</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}

          {/* Contact Details Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              backgroundColor: 'var(--erp-bg-muted)',
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
            }}
          >
            <div>
              <p style={{ color: 'var(--erp-text-muted)', marginBottom: '0.25rem' }}>Phone & Email:</p>
              <p><strong>Phone:</strong> {customer.mobile}</p>
              <p><strong>Email:</strong> {customer.email}</p>
            </div>
            <div>
              <p style={{ color: 'var(--erp-text-muted)', marginBottom: '0.25rem' }}>GSTIN & Address:</p>
              <p><strong>GST:</strong> {customer.gstNumber || 'N/A'}</p>
              <p><strong>Address:</strong> {customer.address}</p>
            </div>
          </div>

          {/* Follow-up Notes Section */}
          <div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <MessageSquare size={16} style={{ color: 'var(--mod-finance)' }} /> FOLLOW-UP NOTES ({customer.followUps?.length || 0})
            </h4>

            <form onSubmit={handleAddFollowUp} style={{ marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                <textarea
                  className="textarea"
                  required
                  rows={2}
                  placeholder="Add new client follow-up note (e.g. Client requested wholesale price quote)..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={isSubmitting || !newNote.trim()}
              >
                <Plus size={14} /> {isSubmitting ? 'Saving...' : 'Save Note'}
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {customer.followUps?.length === 0 ? (
                <p style={{ fontSize: '0.875rem', color: 'var(--erp-text-muted)', fontStyle: 'italic' }}>
                  No follow-up notes recorded yet. Add your first note above.
                </p>
              ) : (
                customer.followUps?.map((note: any) => (
                  <div
                    key={note.id}
                    style={{
                      padding: '0.75rem 1rem',
                      backgroundColor: 'var(--erp-bg-muted)',
                      borderLeft: '3px solid var(--mod-finance)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.875rem',
                    }}
                  >
                    <p style={{ color: 'var(--erp-text-primary)', marginBottom: '0.375rem' }}>{note.note}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--erp-text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} /> Logged by: {note.createdBy?.name || 'Staff'} ({note.createdBy?.role})
                      </span>
                      <span>{new Date(note.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
