import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { StatusBadge } from '../components/common/StatusBadge';
import { ProductModal } from '../components/products/ProductModal';
import { StockAdjustModal } from '../components/products/StockAdjustModal';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, AlertTriangle, ArrowUpDown, Edit, History, ArrowDownLeft, ArrowUpRight, Trash2 } from 'lucide-react';

interface ProductsPageProps {
  onNavigate: (page: string) => void;
  defaultTab?: 'catalog' | 'audit';
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ onNavigate, defaultTab = 'catalog' }) => {
  const { hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'catalog' | 'audit'>(defaultTab);
  const [products, setProducts] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<any>(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'catalog') {
        const res = await api.getProducts({
          search: search || undefined,
          lowStock: lowStockFilter,
        });
        setProducts(res.data || []);
      } else {
        const res = await api.getStockMovements();
        setMovements(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load products/stock movements', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [activeTab, search, lowStockFilter]);

  const handleOpenEdit = (product: any) => {
    setProductToEdit(product);
    setIsProductModalOpen(true);
  };

  const handleOpenStockAdjust = (product: any) => {
    setSelectedProduct(product);
    setIsStockModalOpen(true);
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete product '${name}'?`)) {
      return;
    }

    try {
      await api.deleteProduct(id);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    }
  };

  return (
    <DashboardLayout currentPage={activeTab === 'catalog' ? 'products' : 'stock-logs'} onNavigate={onNavigate} title="Product & Inventory Management">
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
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn ${activeTab === 'catalog' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('catalog')}
          >
            Product Catalog
          </button>
          <button
            className={`btn ${activeTab === 'audit' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('audit')}
          >
            <History size={16} /> Stock Movement Logs
          </button>
        </div>

        {activeTab === 'catalog' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ position: 'relative', width: '250px' }}>
              <input
                className="input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search product name or SKU..."
                style={{ paddingLeft: '2.5rem' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>

            <button
              className={`btn ${lowStockFilter ? 'btn-danger' : 'btn-secondary'}`}
              onClick={() => setLowStockFilter(!lowStockFilter)}
            >
              <AlertTriangle size={15} /> Low Stock Only
            </button>

            {hasRole('ADMIN', 'WAREHOUSE') && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setProductToEdit(null);
                  setIsProductModalOpen(true);
                }}
              >
                <Plus size={16} /> + Add Product
              </button>
            )}
          </div>
        )}
      </div>

      {activeTab === 'catalog' ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Product & SKU</th>
                <th>Category</th>
                <th>Unit Price (₹)</th>
                <th>Current Stock</th>
                <th>Location / Warehouse</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Loading inventory catalog...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No inventory items found.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isLowStock = p.currentStock <= p.minStockAlert;

                  return (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.name}</strong>
                        <div>
                          <code style={{ fontSize: '0.75rem', backgroundColor: 'var(--bg-muted)', padding: '2px 6px', borderRadius: '4px' }}>
                            {p.sku}
                          </code>
                        </div>
                      </td>
                      <td>{p.category}</td>
                      <td><strong>₹{p.unitPrice?.toFixed(2)}</strong></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.9375rem', fontWeight: 700 }}>{p.currentStock} units</span>
                          {isLowStock && (
                            <span
                              className="badge badge-danger"
                              title={'Below min alert limit (' + p.minStockAlert + ')'}
                            >
                              Low Stock ({p.currentStock}/{p.minStockAlert})
                            </span>
                          )}
                        </div>
                      </td>
                      <td>{p.location}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                          {hasRole('ADMIN', 'WAREHOUSE') && (
                            <>
                              <button
                                className="btn btn-secondary btn-sm"
                                title="Adjust Stock In/Out"
                                onClick={() => handleOpenStockAdjust(p)}
                              >
                                <ArrowUpDown size={14} style={{ color: 'var(--success-color)' }} /> Stock In/Out
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                title="Edit Product"
                                onClick={() => handleOpenEdit(p)}
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                title="Delete Product"
                                onClick={() => handleDeleteProduct(p.id, p.name)}
                                style={{ color: 'var(--danger-color)' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>SKU</th>
                <th>Product</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Reason</th>
                <th>Created By</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Loading stock movement logs...
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No stock movement logs recorded yet.
                  </td>
                </tr>
              ) : (
                movements.map((mv) => (
                  <tr key={mv.id}>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {new Date(mv.createdAt).toLocaleString()}
                    </td>
                    <td><code style={{ fontSize: '0.75rem', backgroundColor: 'var(--bg-muted)', padding: '2px 4px' }}>{mv.product?.sku}</code></td>
                    <td><strong>{mv.product?.name}</strong></td>
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
                    <td><strong style={{ color: mv.type === 'IN' ? 'var(--success-color)' : 'var(--danger-color)' }}>{mv.type === 'IN' ? '+' : '-'}{mv.quantity}</strong></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{mv.reason}</td>
                    <td>{mv.createdBy?.name || 'Staff'} ({mv.createdBy?.role})</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSuccess={fetchProducts}
        productToEdit={productToEdit}
      />
      <StockAdjustModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        onSuccess={fetchProducts}
        product={selectedProduct}
      />
    </DashboardLayout>
  );
};
