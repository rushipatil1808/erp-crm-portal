import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../api/client';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productToEdit?: any;
}

const CATEGORY_OPTIONS = [
  'Electronics & Accessories',
  'Hardware & Electricals',
  'Industrial Tools & Supplies',
  'Office Supplies & Packaging',
  'Fasteners & Components',
  'Others',
];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  productToEdit,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: CATEGORY_OPTIONS[0],
    customCategory: '',
    unitPrice: 0,
    currentStock: 0,
    minStockAlert: 5,
    location: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      const isPredefined = CATEGORY_OPTIONS.includes(productToEdit.category);
      setFormData({
        name: productToEdit.name || '',
        sku: productToEdit.sku || '',
        category: isPredefined ? productToEdit.category : 'Others',
        customCategory: isPredefined ? '' : productToEdit.category || '',
        unitPrice: productToEdit.unitPrice || 0,
        currentStock: productToEdit.currentStock || 0,
        minStockAlert: productToEdit.minStockAlert || 5,
        location: productToEdit.location || '',
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        category: CATEGORY_OPTIONS[0],
        customCategory: '',
        unitPrice: 0,
        currentStock: 0,
        minStockAlert: 5,
        location: '',
      });
    }
    setError(null);
  }, [productToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalCategory =
      formData.category === 'Others' ? formData.customCategory.trim() : formData.category;

    if (!finalCategory) {
      setError('Please specify a valid product category');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (productToEdit) {
        await api.updateProduct(productToEdit.id, {
          name: formData.name,
          sku: formData.sku,
          category: finalCategory,
          unitPrice: Number(formData.unitPrice),
          minStockAlert: Number(formData.minStockAlert),
          location: formData.location,
        });
      } else {
        await api.createProduct({
          name: formData.name,
          sku: formData.sku,
          category: finalCategory,
          unitPrice: Number(formData.unitPrice),
          currentStock: Number(formData.currentStock),
          minStockAlert: Number(formData.minStockAlert),
          location: formData.location,
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={productToEdit ? 'Edit Product' : 'Add New Product'}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : productToEdit ? 'Update Product' : 'Create Product'}
          </button>
        </>
      }
    >
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="label">Product Name *</label>
          <input
            className="input"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Braided Type-C USB Cable 2M"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="label">SKU / Item Code *</label>
            <input
              className="input"
              required
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
              placeholder="e.g. SKU-CBL-001"
            />
          </div>

          <div className="form-group">
            <label className="label">Category *</label>
            <select
              className="select"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Category Input if 'Others' is selected */}
        {formData.category === 'Others' && (
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="label">Custom Category Name *</label>
            <input
              className="input"
              required
              value={formData.customCategory}
              onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
              placeholder="e.g. Automotive Spare Parts"
            />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="label">Unit Selling Price (₹) *</label>
            <input
              className="input"
              type="number"
              step="0.01"
              min="0.01"
              required
              value={formData.unitPrice}
              onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
            />
          </div>
          {!productToEdit && (
            <div className="form-group">
              <label className="label">Initial Stock Quantity</label>
              <input
                className="input"
                type="number"
                min="0"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
          )}
          <div className="form-group">
            <label className="label">Low Stock Alert Limit</label>
            <input
              className="input"
              type="number"
              min="0"
              value={formData.minStockAlert}
              onChange={(e) => setFormData({ ...formData, minStockAlert: parseInt(e.target.value, 10) || 0 })}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="label">Warehouse Location / Rack *</label>
          <input
            className="input"
            required
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g. Warehouse Rack A-12, Bin B-05"
          />
        </div>
      </form>
    </Modal>
  );
};
