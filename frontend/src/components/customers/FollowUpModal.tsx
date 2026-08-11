import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../api/client';

interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customer: any;
}

export const FollowUpModal: React.FC<FollowUpModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  customer,
}) => {
  const [note, setNote] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!customer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) {
      setError('Follow-up note cannot be empty');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.addFollowUp(customer.id, {
        note,
        nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate).toISOString() : undefined,
      });
      setNote('');
      setNextFollowUpDate('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add follow-up note');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Follow-up Log: ${customer.name}`}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving Note...' : 'Save Follow-up Log'}
          </button>
        </>
      }
    >
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="label">Follow-up Discussion / Call Notes *</label>
          <textarea
            className="textarea"
            required
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Record client feedback, pricing discussion, product inquiries..."
          />
        </div>

        <div className="form-group">
          <label className="label">Next Follow-up Reminder Date (Optional)</label>
          <input
            className="input"
            type="date"
            value={nextFollowUpDate}
            onChange={(e) => setNextFollowUpDate(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};
