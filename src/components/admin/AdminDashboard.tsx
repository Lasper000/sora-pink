import React, { useState, useEffect } from 'react';
import type { Product, Order, Category } from '../../types';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Package,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Truck,
  ArrowLeft,
  Save,
  Shield,
  BarChart3,
} from 'lucide-react';
import { adminFetchAllOrders, adminUpdateOrderStatus, adminSaveProduct, adminDeleteProduct } from '../../services/api';
import { showToast } from '../common/Toast';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  categories: Category[];
  onRefreshProducts: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  products,
  categories,
  onRefreshProducts,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'analytics'>('products');
  const [orders, setOrders] = useState<Order[]>([]);

  // Product CRUD Modal state
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Tracking number editing per order
  const [trackingInputs, setTrackingInputs] = useState<{ [orderId: string]: string }>({});

  useEffect(() => {
    if (isOpen) {
      loadOrders();
    }
  }, [isOpen]);

  const loadOrders = async () => {
    try {
      const data = await adminFetchAllOrders();
      setOrders(data);
      const initialTrack: { [key: string]: string } = {};
      data.forEach((o) => {
        if (o.tracking_number) initialTrack[o.id] = o.tracking_number;
      });
      setTrackingInputs(initialTrack);
    } catch (e) {
      console.warn('Orders fetch error', e);
    }
  };

  if (!isOpen) return null;

  // Analytics Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const lowStockCount = products.filter((p) => p.stock_quantity <= 5).length;

  const handleOpenAddProduct = () => {
    setEditingProduct({
      name: '',
      category_id: categories[0]?.id || '',
      price: 0,
      discount_price: null,
      stock_quantity: 20,
      description: '',
      ingredients: '',
      how_to_use: '',
      skin_types: ['ทุกสภาพผิว'],
      skin_concerns: ['ความชุ่มชื้น'],
      images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80'],
      is_active: true,
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct({ ...p });
    setIsProductModalOpen(true);
  };

  const handleSaveProductForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name) return;

    try {
      await adminSaveProduct(editingProduct);
      showToast(editingProduct.id ? 'อัปเดตข้อมูลสินค้าสำเร็จ' : 'เพิ่มสินค้าใหม่สำเร็จ!', 'success');
      setIsProductModalOpen(false);
      onRefreshProducts();
    } catch {
      showToast('เกิดข้อผิดพลาดในการบันทึกสินค้า', 'error');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`คุณต้องการลบสินค้า "${name}" ใช่หรือไม่?`)) {
      await adminDeleteProduct(id);
      showToast(`ลบสินค้า "${name}" เรียบร้อยแล้ว`, 'info');
      onRefreshProducts();
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['order_status']) => {
    const tracking = trackingInputs[orderId];
    await adminUpdateOrderStatus(orderId, newStatus, tracking);
    showToast(`อัปเดตสถานะออเดอร์ ${orderId} เป็น "${newStatus}" แล้ว`, 'success');
    loadOrders();
  };

  const handleSaveTracking = async (orderId: string) => {
    const tracking = trackingInputs[orderId] || '';
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    await adminUpdateOrderStatus(orderId, order.order_status, tracking);
    showToast(`บันทึกเลขพัสดุ "${tracking}" สำเร็จ!`, 'success');
    loadOrders();
  };

  return (
    <div
      className="admin-dashboard-container"
      style={{
        position: 'fixed',
        inset: 0,
        background: '#F8FAFC',
        zIndex: 1200,
        overflowY: 'auto',
      }}
    >
      {/* Top Navbar */}
      <div
        className="admin-top-nav"
        style={{
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={onClose} className="btn btn-outline btn-sm" style={{ gap: '6px' }}>
            <ArrowLeft size={16} /> กลับหน้าร้านค้า
          </button>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1F2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={20} color="#0284C7" /> Sora Pink Admin Dashboard
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>
              ระบบบริหารจัดการสินค้า คำสั่งซื้อ และสต็อกสินค้า
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('products')}
            className={`btn btn-sm ${activeTab === 'products' ? 'btn-primary' : 'btn-ghost'}`}
          >
            <Package size={16} /> จัดการสินค้า ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`btn btn-sm ${activeTab === 'orders' ? 'btn-primary' : 'btn-ghost'}`}
          >
            <Truck size={16} /> จัดการคำสั่งซื้อ ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`btn btn-sm ${activeTab === 'analytics' ? 'btn-primary' : 'btn-ghost'}`}
          >
            <TrendingUp size={16} /> ภาพรวมยอดขาย
          </button>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.25rem' }}>
        {/* Metric Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2rem',
          }}
        >
          <div className="glass-card" style={{ padding: '1.25rem', background: '#FFFFFF', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#6B7280', fontWeight: 500 }}>ยอดขายรวมทั้งหมด</span>
              <DollarSign size={20} color="#10B981" />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10B981' }}>
              ฿{totalRevenue.toLocaleString()}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#059669' }}>คำสั่งซื้อที่ดำเนินการแล้ว</span>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem', background: '#FFFFFF', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#6B7280', fontWeight: 500 }}>จำนวนออเดอร์</span>
              <Truck size={20} color="#0284C7" />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0284C7' }}>
              {orders.length}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#0369A1' }}>รายการสั่งซื้อทั้งหมด</span>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem', background: '#FFFFFF', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#6B7280', fontWeight: 500 }}>สินค้าในคลัง</span>
              <Package size={20} color="#F43F5E" />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F43F5E' }}>
              {products.length}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#BE123C' }}>4 หมวดหมู่หลัก</span>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem', background: '#FFFFFF', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#6B7280', fontWeight: 500 }}>สินค้าใกล้หมดสต็อก</span>
              <AlertTriangle size={20} color="#F59E0B" />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F59E0B' }}>
              {lowStockCount}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#B45309' }}>สต็อกเหลือน้อยกว่า 5 ชิ้น</span>
          </div>
        </div>

        {/* TAB 1: Products Management */}
        {activeTab === 'products' && (
          <div className="glass-card" style={{ background: '#FFFFFF', borderRadius: '20px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>รายการสินค้าในระบบ (Products Catalog)</h3>
              <button onClick={handleOpenAddProduct} className="btn btn-primary btn-sm">
                <Plus size={16} /> เพิ่มสินค้าใหม่
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0', color: '#475569' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>รูปภาพ</th>
                    <th style={{ padding: '0.75rem 1rem' }}>ชื่อสินค้า</th>
                    <th style={{ padding: '0.75rem 1rem' }}>ราคา (ปกติ/ลด)</th>
                    <th style={{ padding: '0.75rem 1rem' }}>สต็อกคงเหลือ</th>
                    <th style={{ padding: '0.75rem 1rem' }}>สภาพผิว</th>
                    <th style={{ padding: '0.75rem 1rem' }}>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover' }}
                        />
                      </td>
                      <td style={{ padding: '0.75rem 1rem', maxWidth: '280px' }}>
                        <div style={{ fontWeight: 600, color: '#1F2937' }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                          หมวดหมู่: {categories.find((c) => c.id === p.category_id)?.name || 'ทั่วไป'}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ fontWeight: 700, color: '#E11D48' }}>
                          ฿{(p.discount_price || p.price).toLocaleString()}
                        </div>
                        {p.discount_price && (
                          <div style={{ fontSize: '0.75rem', color: '#9CA3AF', textDecoration: 'line-through' }}>
                            ฿{p.price.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span
                          className={`badge ${
                            p.stock_quantity <= 0
                              ? 'badge-danger'
                              : p.stock_quantity <= 5
                              ? 'badge-warning'
                              : 'badge-success'
                          }`}
                        >
                          {p.stock_quantity} ชิ้น
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ fontSize: '0.78rem', color: '#4B5563' }}>
                          {p.skin_types.slice(0, 2).join(', ')}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleOpenEditProduct(p)}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.35rem 0.65rem' }}
                            title="แก้ไข"
                          >
                            <Edit2 size={14} /> แก้ไข
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '0.35rem 0.65rem', color: '#EF4444' }}
                            title="ลบ"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Orders Management */}
        {activeTab === 'orders' && (
          <div className="glass-card" style={{ background: '#FFFFFF', borderRadius: '20px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              รายการสั่งซื้อทั้งหมด (Order Management)
            </h3>

            {orders.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#9CA3AF', padding: '2rem' }}>
                ยังไม่มีคำสั่งซื้อในระบบ ลองสั่งซื้อสินค้าจากหน้าร้านเพื่อทดสอบ!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {orders.map((order) => (
                  <div
                    key={order.id}
                    style={{
                      border: '1px solid #E2E8F0',
                      borderRadius: '16px',
                      padding: '1.25rem',
                      background: '#FAFAFA',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '0.75rem',
                        borderBottom: '1px solid #E5E7EB',
                        paddingBottom: '0.5rem',
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 800, color: '#0284C7', fontSize: '1rem' }}>{order.id}</span>
                        <span style={{ fontSize: '0.8rem', color: '#6B7280', marginLeft: '0.75rem' }}>
                          {new Date(order.created_at).toLocaleString('th-TH')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#E11D48' }}>
                          ฿{order.total_amount.toLocaleString()}
                        </span>
                        <select
                          value={order.order_status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as Order['order_status'])}
                          className="form-select"
                          style={{
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            borderRadius: '9999px',
                            background:
                              order.order_status === 'delivered'
                                ? '#ECFDF5'
                                : order.order_status === 'shipped'
                                ? '#FFE8EF'
                                : '#F0F9FF',
                            borderColor: '#CBD5E1',
                          }}
                        >
                          <option value="pending">รอชำระเงิน</option>
                          <option value="processing">กำลังจัดเตรียม</option>
                          <option value="shipped">จัดส่งแล้ว</option>
                          <option value="delivered">จัดส่งสำเร็จ</option>
                          <option value="cancelled">ยกเลิก</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                      {/* Customer & Address */}
                      <div style={{ fontSize: '0.85rem', color: '#4B5563' }}>
                        <strong>ผู้รับ:</strong> {order.shipping_address.fullName} ({order.shipping_address.phone})<br />
                        <strong>ที่อยู่:</strong> {order.shipping_address.address} จ.{order.shipping_address.province} {order.shipping_address.postalCode}<br />
                        <strong>การชำระ:</strong> {order.payment_method} ({order.payment_status})
                      </div>

                      {/* Tracking Number Input & Save */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '0.78rem', color: '#6B7280', display: 'block', marginBottom: '2px' }}>
                            เลขพัสดุ (Flash/Kerry):
                          </label>
                          <input
                            type="text"
                            placeholder="เช่น TH123456789"
                            value={trackingInputs[order.id] || ''}
                            onChange={(e) => setTrackingInputs({ ...trackingInputs, [order.id]: e.target.value })}
                            className="form-input"
                            style={{ fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}
                          />
                        </div>
                        <button
                          onClick={() => handleSaveTracking(order.id)}
                          className="btn btn-outline btn-sm"
                          style={{ alignSelf: 'flex-end', padding: '0.45rem 0.85rem' }}
                        >
                          <Save size={14} /> บันทึก
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Sales Overview */}
        {activeTab === 'analytics' && (
          <div className="glass-card" style={{ background: '#FFFFFF', borderRadius: '20px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={20} color="#0284C7" /> ภาพรวมและข้อมูลยอดขาย (Sales Analytics)
            </h3>
            <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              สรุปข้อมูลยอดขายสินค้าบิวตี้และสกินแคร์จากทุกช่องทางการสั่งซื้อ
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ background: '#F8FAFC', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <h4 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>สัดส่วนการชำระเงิน</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>PromptPay QR Code</span>
                    <strong>75%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Credit / Debit Card</span>
                    <strong>15%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Cash on Delivery (COD)</span>
                    <strong>10%</strong>
                  </div>
                </div>
              </div>

              <div style={{ background: '#FFF5F8', padding: '1.5rem', borderRadius: '16px', border: '1px solid #FFE4E6' }}>
                <h4 style={{ fontWeight: 600, marginBottom: '0.75rem', color: '#BE123C' }}>หมวดหมู่ที่ขายดีที่สุด</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>ดูแลผิวหน้า (Facial Skincare)</span>
                    <strong>52%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>เครื่องสำอาง (Cosmetics)</span>
                    <strong>33%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>ดูแลผิวกาย (Body Care)</span>
                    <strong>15%</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isProductModalOpen && editingProduct && (
        <div className="modal-overlay" onClick={() => setIsProductModalOpen(false)}>
          <div
            className="modal-content modal-content-lg"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '2rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {editingProduct.id ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มสินค้าใหม่'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="btn-icon btn-ghost">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProductForm} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">ชื่อสินค้า *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">หมวดหมู่ *</label>
                  <select
                    value={editingProduct.category_id || categories[0]?.id}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value })}
                    className="form-select"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">ราคาปกติ (บาท) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editingProduct.price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">ราคาลดพิเศษ (บาท)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="เว้นว่างถ้าไม่มี"
                    value={editingProduct.discount_price || ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        discount_price: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">จำนวนสต็อกสินค้า (ชิ้น) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editingProduct.stock_quantity ?? 10}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock_quantity: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">รูปภาพสินค้า URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={editingProduct.images?.[0] || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, images: [e.target.value] })}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">รายละเอียดสินค้า</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">ส่วนผสมสำคัญ (Key Ingredients)</label>
                  <textarea
                    rows={2}
                    value={editingProduct.ingredients || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, ingredients: e.target.value })}
                    className="form-textarea"
                  />
                </div>
                <div>
                  <label className="form-label">วิธีใช้งาน (How to Use)</label>
                  <textarea
                    rows={2}
                    value={editingProduct.how_to_use || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, how_to_use: e.target.value })}
                    className="form-textarea"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="btn btn-ghost"
                >
                  ยกเลิก
                </button>
                <button type="submit" className="btn btn-primary">
                  บันทึกข้อมูลสินค้า
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
