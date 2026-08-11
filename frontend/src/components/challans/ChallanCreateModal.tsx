import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../api/client';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';

interface ChallanCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ItemRow {
  productId: string;
  quantity: number;
}

export const ChallanCreateModal: React.FC<ChallanCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'CONFIRMED'>('CONFIRMED');
  const [items, setItems] = useState<ItemRow[]>([{ productId: '', quantity: 1 }]);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [custRes, prodRes] = await Promise.all([
            api.getCustomers({ limit: 100 }),
            api.getProducts({ limit: 100 }),
          ]);
          setCustomers(custRes.data || []);
          setProducts(prodRes.data || []);
          if (custRes.data?.length > 0) {
            setSelectedCustomerId(custRes.data[0].id);
          }
          if (prodRes.data?.length > 0) {
            setItems([{ productId: prodRes.data[0].id, quantity: 1 }]);
          }
        } catch (err: any) {
          setError('Failed to load customers or product inventory catalog');
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
      setError(null);
    }
  }, [isOpen]);

  const productMap = new Map(products.map((p) => [p.id, p]));

  // Check if any line item quantity exceeds available stock
  const overstockItems = items
    .map((item, idx) => {
      const prod = productMap.get(item.productId);
      if (prod && item.quantity > prod.currentStock) {
        return {
          rowNumber: idx + 1,
          productName: prod.name,
          requested: item.quantity,
          available: prod.currentStock,
        };
      }
      return null;
    })
    .filter(Boolean);

  const hasStockOverage = overstockItems.length > 0 && status === 'CONFIRMED';

  const handleAddItem = () => {
    if (products.length > 0) {
      setItems([...items, { productId: products[0].id, quantity: 1 }]);
    }
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof ItemRow, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const calculateTotalQuantity = () => {
    return items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  };

  const calculateGrandTotal = () => {
    return items.reduce((sum, item) => {
      const prod = productMap.get(item.productId);
      const price = prod ? prod.unitPrice : 0;
      return sum + price * (item.quantity || 0);
    }, 0);
  };

  const handleSubmit = async (submitStatus: 'DRAFT' | 'CONFIRMED') => {
    if (!selectedCustomerId) {
      setError('Please select a customer for the sales challan');
      return;
    }

    if (items.some((i) => !i.productId || i.quantity <= 0)) {
      setError('All items must have a valid product selected and quantity > 0');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.createChallan({
        customerId: selectedCustomerId,
        status: submitStatus,
        items,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to generate Sales Challan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Delivery Sales Challan"
      maxWidth="750px"
      footer={
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--erp-text-secondary)' }}>
            Total Quantity: <strong>{calculateTotalQuantity()} items</strong> | Total: <strong>₹{calculateGrandTotal().toFixed(2)}</strong>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-secondary"
              onClick={() => handleSubmit('DRAFT')}
              disabled={isSubmitting || isLoading}
            >
              Save as Draft
            </button>
            <button
              className="btn btn-primary"
              onClick={() => handleSubmit('CONFIRMED')}
              disabled={isSubmitting || isLoading || hasStockOverage}
            >
              {isSubmitting ? 'Processing...' : 'Confirm & Reduce Stock'}
            </button>
          </div>
        </div>
      }
    >
      {error && <div className="alert alert-error">{error}</div>}

      {/* Stock Overage Warning Alert (Matching Wireframe 4) */}
      {hasStockOverage && (
        <div className="alert alert-warning">
          <AlertTriangle size={18} />
          <div>
            <strong>Stock Quantity Overage Warning:</strong>
            {overstockItems.map((o: any, i) => (
              <div key={i} style={{ fontSize: '0.8125rem' }}>
                * Alert: Selected quantity ({o.requested}) exceeds current stock ({o.available}) for '{o.productName}'.
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--erp-text-muted)' }}>
          Loading customer database & inventory catalog...
        </div>
      ) : (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="label">Select Customer *</label>
              <select
                className="select"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.businessName} ({c.name})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="label">Challan Number</label>
              <input
                className="input"
                disabled
                value="Auto-Generated (CH-2026-XXXX)"
                style={{ backgroundColor: 'var(--erp-bg-muted)' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="label" style={{ marginBottom: 0 }}>PRODUCTS TO ADD</label>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleAddItem}
              >
                <Plus size={14} /> Add Product Row
              </button>
            </div>

            {/* Product Selector Table Grid (Matching Wireframe 4) */}
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product Selection</th>
                    <th>Current Stock</th>
                    <th style={{ width: '100px' }}>Quantity</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ width: '50px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row, idx) => {
                    const selectedProd = productMap.get(row.productId);
                    const isOverage = selectedProd && row.quantity > selectedProd.currentStock;
                    const lineTotal = selectedProd ? selectedProd.unitPrice * row.quantity : 0;

                    return (
                      <tr key={idx}>
                        <td>
                          <select
                            className="select"
                            value={row.productId}
                            onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} (SKU: {p.sku}) — ₹{p.unitPrice}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          {selectedProd ? (
                            <span style={{ color: isOverage ? 'var(--danger-color)' : 'var(--erp-text-secondary)', fontWeight: isOverage ? 600 : 400 }}>
                              {selectedProd.currentStock} units available
                              {isOverage && ' *ERR*'}
                            </span>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td>
                          <input
                            className="input"
                            type="number"
                            min="1"
                            value={row.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value, 10) || 1)}
                            style={{
                              borderColor: isOverage ? '#ef4444' : 'var(--erp-border)',
                              backgroundColor: isOverage ? '#fef2f2' : 'var(--erp-bg-surface)',
                            }}
                          />
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>
                          ₹{lineTotal.toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleRemoveItem(idx)}
                            disabled={items.length === 1}
                            style={{ color: '#ef4444', border: 'none' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
