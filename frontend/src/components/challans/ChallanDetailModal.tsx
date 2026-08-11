import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { api } from '../../api/client';
import { Printer, CheckCircle, XCircle } from 'lucide-react';

interface ChallanDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  challan: any;
}

export const ChallanDetailModal: React.FC<ChallanDetailModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  challan,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!challan) return null;

  const handleStatusChange = async (newStatus: 'CONFIRMED' | 'CANCELLED') => {
    setIsUpdating(true);
    setError(null);
    try {
      await api.updateChallanStatus(challan.id, newStatus);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to set status to ' + newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const calculateSubtotal = () => {
    return (
      challan.items?.reduce((sum: number, item: any) => sum + item.unitPrice * item.quantity, 0) || 0
    );
  };

  const subtotal = calculateSubtotal();
  const cgst = subtotal * 0.09;
  const sgst = subtotal * 0.09;
  const grandTotal = subtotal + cgst + sgst;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={'Delivery Challan #' + challan.challanNumber}
      maxWidth="800px"
      footer={
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn btn-secondary no-print" onClick={handlePrint}>
            <Printer size={16} /> Print Delivery Challan Invoice
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }} className="no-print">
            {challan.status === 'DRAFT' && (
              <button
                className="btn btn-primary"
                onClick={() => handleStatusChange('CONFIRMED')}
                disabled={isUpdating}
              >
                <CheckCircle size={16} /> Confirm & Deduct Stock
              </button>
            )}
            {challan.status === 'CONFIRMED' && (
              <button
                className="btn btn-danger"
                onClick={() => handleStatusChange('CANCELLED')}
                disabled={isUpdating}
              >
                <XCircle size={16} /> Cancel & Restore Stock
              </button>
            )}
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      }
    >
      {error && <div className="alert alert-error no-print">{error}</div>}

      <div className="printable-area" style={{ padding: '0.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.25rem', borderBottom: '2px dashed var(--erp-border)', paddingBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            DELIVERY CHALLAN
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '0.875rem', marginTop: '0.375rem', color: 'var(--erp-text-secondary)' }}>
            <span>Challan No: <strong>#{challan.challanNumber}</strong></span>
            <span>Date: <strong>{new Date(challan.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</strong></span>
            <span>Status: <StatusBadge status={challan.status} /></span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--erp-bg-muted)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--erp-border)',
              fontSize: '0.875rem',
            }}
          >
            <h4 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', color: 'var(--erp-text-muted)', marginBottom: '0.5rem', fontWeight: 700 }}>
              DELIVERY BY (YOUR DETAILS)
            </h4>
            <strong>Apex Wholesale & Distribution Pvt Ltd</strong>
            <p style={{ color: 'var(--erp-text-secondary)' }}>104 Industrial Commerce Complex, Hub</p>
            <p style={{ color: 'var(--erp-text-muted)' }}>GSTIN: 27AAACA1234A1Z5 • Support: +91 98000 11122</p>
          </div>

          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--erp-bg-muted)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--erp-border)',
              fontSize: '0.875rem',
            }}
          >
            <h4 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', color: 'var(--erp-text-muted)', marginBottom: '0.5rem', fontWeight: 700 }}>
              DELIVERY TO (CLIENT DETAILS)
            </h4>
            <strong>{challan.customer?.name}</strong> ({challan.customer?.businessName})
            <p style={{ color: 'var(--erp-text-secondary)' }}>{challan.customer?.address}</p>
            <p style={{ color: 'var(--erp-text-muted)' }}>
              Phone: {challan.customer?.mobile} • GSTIN: {challan.customer?.gstNumber || 'N/A'}
            </p>
          </div>
        </div>

        <div className="table-container" style={{ marginBottom: '1.25rem' }}>
          <table className="table table-purple-header">
            <thead>
              <tr>
                <th>#</th>
                <th>Item Description</th>
                <th>SKU</th>
                <th>GST Rate</th>
                <th style={{ textAlign: 'center' }}>Quantity</th>
                <th style={{ textAlign: 'right' }}>Unit Rate (₹)</th>
                <th style={{ textAlign: 'right' }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {challan.items?.map((item: any, idx: number) => {
                const lineTotal = item.unitPrice * item.quantity;
                return (
                  <tr key={item.id || idx}>
                    <td>{idx + 1}</td>
                    <td><strong>{item.productName}</strong></td>
                    <td><code style={{ fontSize: '0.75rem', backgroundColor: 'var(--erp-bg-muted)', padding: '2px 4px' }}>{item.sku}</code></td>
                    <td>18% GST</td>
                    <td style={{ textAlign: 'center' }}><strong>{item.quantity}</strong></td>
                    <td style={{ textAlign: 'right' }}>₹{item.unitPrice.toFixed(2)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{lineTotal.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <div style={{ width: '280px', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
              <span>Item Subtotal Amount:</span>
              <strong>₹{subtotal.toFixed(2)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', color: 'var(--erp-text-muted)' }}>
              <span>CGST (9%):</span>
              <span>₹{cgst.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', color: 'var(--erp-text-muted)' }}>
              <span>SGST (9%):</span>
              <span>₹{sgst.toFixed(2)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.625rem 0',
                borderTop: '2px solid var(--purple-header)',
                marginTop: '0.5rem',
                fontSize: '1.125rem',
                fontWeight: 800,
                color: 'var(--purple-header)',
              }}
            >
              <span>Total (INR):</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
