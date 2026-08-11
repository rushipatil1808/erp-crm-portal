import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../api/client';

interface StockAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product: any;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  product,
}) => {
  const [type, setType] = useState<'IN' | 'OUT'>('IN');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }
    if (!reason.trim()) {
      setError('Reason for stock movement is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.adjustStock(product.id, {
        quantity: Number(quantity),
        type,
        reason,
      });
      setQuantity(1);
      setReason('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to adjust stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={'Adjust Stock: ' + product.name + ' (SKU: ' + product.sku + ')'}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Updating Stock...' : 'Confirm Stock Adjustment'}
          </button>
        </>
      }
    >
      {error && <div className="alert alert-error">{error}</div>}
      <div
        style={{
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--bg-muted)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1rem',
          fontSize: '0.875rem',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>Current Available Stock:</span>
        <strong style={{ fontSize: '1rem' }}>{product.currentStock} units</strong>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="label">Movement Type</label>
            <select
              className="select"
              value={type}
              onChange={(e) => setType(e.target.value as 'IN' | 'OUT')}
            >
              <option value="IN">IN (Stock Arrival / Inward)</option>
              <option value="OUT">OUT (Manual Reduction / Damage)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="label">Quantity</label>
            <input
              className="input"
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="label">Reason / Reference Note *</label>
          <input
            className="input"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Purchase Order Batch #104, Damaged items removed"
          />
        </div>
      </form>
    </Modal>
  );
};
