import React, { useState, useEffect, useCallback } from 'react';
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
  CheckCircle2,
  Clock,
  Eye,
  Check,
  XCircle,
} from 'lucide-react';
import {
  adminFetchAllOrders,
  adminUpdateOrderStatus,
  adminSaveProduct,
  adminDeleteProduct,
  adminVerifyOrderSlip,
} from '../../services/api';
import { showToast } from '../common/Toast';
import { handleImageError, DEFAULT_FALLBACK_IMAGE } from '../../utils/imageFallback';
import { useAuth } from '../../context/AuthContext';

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
  const [productSearch, setProductSearch] = useState('');

  const { role } = useAuth();

  // Tracking number editing per order
  const [trackingInputs, setTrackingInputs] = useState<{ [orderId: string]: string }>({});

  // Slip lightbox preview & verification state
  const [viewingSlipOrder, setViewingSlipOrder] = useState<Order | null>(null);
  const [isVerifying, setIsVerifying] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    if (isOpen && role === 'admin') {
      loadOrders();
    }
  }, [isOpen, role, loadOrders]);

  if (!isOpen || role !== 'admin') return null;

  // Analytics Metrics (Exclude cancelled orders from revenue & breakdown)
  const validOrders = orders.filter((o) => o.order_status !== 'cancelled');
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.total_amount, 0);
  const lowStockCount = products.filter((p) => p.stock_quantity <= 5).length;

  const totalValidCount = validOrders.length;
  const promptpayPct = totalValidCount
    ? Math.round((validOrders.filter((o) => o.payment_method === 'promptpay').length / totalValidCount) * 100)
    : 75;
  const cardPct = totalValidCount
    ? Math.round((validOrders.filter((o) => o.payment_method === 'credit_card').length / totalValidCount) * 100)
    : 15;
  const codPct = totalValidCount ? Math.max(0, 100 - promptpayPct - cardPct) : 10;

  const categoryBreakdown = (() => {
    const counts: Record<string, number> = {};
    let totalItemsSold = 0;
    validOrders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const catId = item.product?.category_id || products.find((p) => p.id === item.product_id)?.category_id;
        if (catId) {
          counts[catId] = (counts[catId] || 0) + item.quantity;
          totalItemsSold += item.quantity;
        }
      });
    });

    if (totalItemsSold === 0) {
      return [
        { name: 'ดูแลผิวหน้า (Facial Skincare)', pct: 52 },
        { name: 'เครื่องสำอาง (Cosmetics)', pct: 33 },
        { name: 'ดูแลผิวกาย (Body Care)', pct: 15 },
      ];
    }

    return categories
      .map((cat) => ({
        name: cat.name,
        pct: Math.round(((counts[cat.id] || 0) / totalItemsSold) * 100),
      }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 4);
  })();

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
    await loadOrders();
    onRefreshProducts();
  };

  const handleSaveTracking = async (orderId: string) => {
    const tracking = trackingInputs[orderId] || '';
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    await adminUpdateOrderStatus(orderId, order.order_status, tracking);
    showToast(`บันทึกเลขพัสดุ "${tracking}" สำเร็จ!`, 'success');
    loadOrders();
  };

  const handleVerifySlip = async (orderId: string, approved: boolean) => {
    setIsVerifying(orderId);
    try {
      await adminVerifyOrderSlip(orderId, approved);
      showToast(
        approved
          ? 'ยืนยันยอดเงินและอนุมัติคำสั่งซื้อเรียบร้อยแล้วค่ะ ✅'
          : 'ปฏิเสธและยกเลิกคำสั่งซื้อพร้อมคืนสต็อกแล้ว ❌',
        approved ? 'success' : 'info'
      );
      if (viewingSlipOrder && viewingSlipOrder.id === orderId) {
        setViewingSlipOrder(null);
      }
      await loadOrders();
      onRefreshProducts();
    } catch (err) {
      console.error('Verify slip error:', err);
      showToast('เกิดข้อผิดพลาดในการตรวจสอบคำสั่งซื้อ', 'error');
    } finally {
      setIsVerifying(null);
    }
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
        <div className="admin-brand-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
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
        <div className="admin-top-nav-tabs" style={{ display: 'flex', gap: '0.5rem' }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>รายการสินค้าในระบบ ({products.length} รายการ)</h3>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>จัดการสต็อก ราคา และข้อมูลสินค้า</span>
              </div>
              <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ หรือหมวดหมู่..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="admin-search-input"
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '9999px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.82rem',
                    outline: 'none',
                    width: '220px',
                    maxWidth: '100%',
                  }}
                />
                <button onClick={handleOpenAddProduct} className="btn btn-primary btn-sm">
                  <Plus size={16} /> เพิ่มสินค้าใหม่
                </button>
              </div>
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
                  {products
                    .filter((p) => {
                      if (!productSearch.trim()) return true;
                      const q = productSearch.toLowerCase();
                      const catName = categories.find((c) => c.id === p.category_id)?.name.toLowerCase() || '';
                      return p.name.toLowerCase().includes(q) || catName.includes(q);
                    })
                    .map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          onError={handleImageError}
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

                    {/* Ordered Product Items List */}
                    {order.items && order.items.length > 0 && (
                      <div
                        style={{
                          marginTop: '0.85rem',
                          padding: '0.75rem 0.9rem',
                          background: '#FFFFFF',
                          borderRadius: '12px',
                          border: '1px solid #E2E8F0',
                        }}
                      >
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Package size={14} color="#DF5E7E" /> รายการสินค้าที่สั่งซื้อ ({order.items.reduce((s, i) => s + i.quantity, 0)} ชิ้น):
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                          {order.items.map((item) => {
                            const prod = item.product || products.find((p) => p.id === item.product_id);
                            return (
                              <div
                                key={item.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '0.65rem',
                                  fontSize: '0.82rem',
                                  paddingBottom: '0.35rem',
                                  borderBottom: '1px dashed #F1F5F9',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                                  <img
                                    src={prod?.images?.[0] || DEFAULT_FALLBACK_IMAGE}
                                    alt={prod?.name || 'สินค้า'}
                                    onError={handleImageError}
                                    style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1px solid #F1F5F9' }}
                                  />
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {prod?.name || `รหัสสินค้า ${item.product_id}`}
                                    </div>
                                    <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                                      ฿{item.price_at_purchase.toLocaleString()} × {item.quantity} ชิ้น
                                    </div>
                                  </div>
                                </div>
                                <div style={{ fontWeight: 700, color: '#BE123C', flexShrink: 0 }}>
                                  ฿{(item.price_at_purchase * item.quantity).toLocaleString()}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Non-PromptPay Pending Order Approval Panel */}
                    {order.payment_method !== 'promptpay' && !order.slip_url && order.order_status === 'pending' && (
                      <div
                        style={{
                          marginTop: '0.85rem',
                          padding: '0.75rem 1rem',
                          borderRadius: '12px',
                          background: '#FEF3C7',
                          border: '1.5px solid #FDE68A',
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.75rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', color: '#92400E', fontWeight: 600 }}>
                          <Clock size={16} color="#D97706" /> รอแอดมินตรวจสอบและยืนยันคำสั่งซื้อ ({order.payment_method.toUpperCase()})
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleVerifySlip(order.id, true)}
                            disabled={isVerifying === order.id}
                            className="btn btn-sm"
                            style={{
                              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                              color: '#FFFFFF',
                              border: 'none',
                              fontSize: '0.8rem',
                              padding: '0.4rem 0.85rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              borderRadius: '9999px',
                              cursor: 'pointer',
                            }}
                          >
                            <Check size={14} /> ยืนยันและอนุมัติออเดอร์
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('คุณต้องการยกเลิกคำสั่งซื้อนี้ใช่หรือไม่?')) {
                                handleVerifySlip(order.id, false);
                              }
                            }}
                            disabled={isVerifying === order.id}
                            className="btn btn-ghost btn-sm"
                            style={{
                              color: '#EF4444',
                              fontSize: '0.8rem',
                              padding: '0.4rem 0.75rem',
                              border: '1px solid #FECDD3',
                              background: '#FFFFFF',
                              borderRadius: '9999px',
                            }}
                          >
                            ยกเลิกออเดอร์
                          </button>
                        </div>
                      </div>
                    )}

                    {/* PromptPay & Slip Verification Panel */}
                    {(order.payment_method === 'promptpay' || order.slip_url) && (
                      <div
                        style={{
                          marginTop: '0.9rem',
                          padding: '0.85rem 1rem',
                          borderRadius: '12px',
                          background: order.admin_verified ? '#F0FDF4' : '#FEF3C7',
                          border: order.admin_verified ? '1.5px solid #BBF7D0' : '1.5px solid #FDE68A',
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.85rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          {order.slip_url ? (
                            <div
                              onClick={() => setViewingSlipOrder(order)}
                              style={{
                                position: 'relative',
                                cursor: 'pointer',
                                width: 56,
                                height: 56,
                                borderRadius: 10,
                                overflow: 'hidden',
                                border: '2px solid #0284C7',
                                flexShrink: 0,
                                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                              }}
                              title="คลิกเพื่อดูสลิปขนาดใหญ่"
                            >
                              <img
                                src={order.slip_url}
                                alt="สลิปโอนเงิน"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                              <div
                                style={{
                                  position: 'absolute',
                                  inset: 0,
                                  background: 'rgba(0,0,0,0.25)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#FFFFFF',
                                }}
                              >
                                <Eye size={18} />
                              </div>
                            </div>
                          ) : (
                            <div
                              style={{
                                width: 56,
                                height: 56,
                                borderRadius: 10,
                                background: '#F1F5F9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#94A3B8',
                                fontSize: '0.72rem',
                                textAlign: 'center',
                                border: '1px dashed #CBD5E1',
                              }}
                            >
                              ยังไม่พบสลิป
                            </div>
                          )}

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1F2937' }}>
                                หลักฐานสลิปพร้อมเพย์:
                              </span>
                              {order.admin_verified ? (
                                <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <CheckCircle2 size={12} /> แอดมินยืนยันยอดเงินแล้ว
                                </span>
                              ) : order.order_status === 'cancelled' ? (
                                <span className="badge badge-danger">
                                  ปฏิเสธคำสั่งซื้อ
                                </span>
                              ) : (
                                <span
                                  className="badge badge-warning"
                                  style={{
                                    background: '#FEF3C7',
                                    color: '#B45309',
                                    border: '1px solid #FDE68A',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                  }}
                                >
                                  <Clock size={12} /> รอตรวจสอบสลิปและยืนยันยอด
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#4B5563' }}>
                              {order.admin_verified
                                ? `ยอดเงินเข้าถูกต้อง อนุมัติเมื่อ: ${order.verified_at ? new Date(order.verified_at).toLocaleString('th-TH') : 'ก่อนหน้า'}`
                                : 'โปรดตรวจสอบยอดเงินในบัญชีก่อนกดยืนยันออเดอร์ เพื่อให้ระบบส่งต่อไปยังฝ่ายจัดเตรียมพัสดุ'}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {order.slip_url && (
                            <button
                              onClick={() => setViewingSlipOrder(order)}
                              className="btn btn-outline btn-sm"
                              style={{
                                fontSize: '0.8rem',
                                padding: '0.4rem 0.75rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                background: '#FFFFFF',
                              }}
                            >
                              <Eye size={14} /> ดูสลิป
                            </button>
                          )}

                          {!order.admin_verified && order.order_status !== 'cancelled' && (
                            <>
                              <button
                                onClick={() => handleVerifySlip(order.id, true)}
                                disabled={isVerifying === order.id}
                                className="btn btn-sm"
                                style={{
                                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  fontSize: '0.8rem',
                                  padding: '0.4rem 0.85rem',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)',
                                }}
                              >
                                <Check size={14} /> ยืนยันยอดเงิน & อนุมัติ
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('คุณต้องการปฏิเสธสลิปและยกเลิกคำสั่งซื้อนี้ใช่หรือไม่?')) {
                                    handleVerifySlip(order.id, false);
                                  }
                                }}
                                disabled={isVerifying === order.id}
                                className="btn btn-ghost btn-sm"
                                style={{
                                  color: '#EF4444',
                                  fontSize: '0.8rem',
                                  padding: '0.4rem 0.75rem',
                                  border: '1px solid #FECDD3',
                                  background: '#FFFFFF',
                                  borderRadius: '8px',
                                }}
                              >
                                ปฏิเสธสลิป
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
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

            <div className="admin-analytics-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ background: '#F8FAFC', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <h4 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>สัดส่วนการชำระเงิน</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>PromptPay QR Code</span>
                    <strong>{promptpayPct}%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Credit / Debit Card</span>
                    <strong>{cardPct}%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Cash on Delivery (COD)</span>
                    <strong>{codPct}%</strong>
                  </div>
                </div>
              </div>

              <div style={{ background: '#FFF5F8', padding: '1.5rem', borderRadius: '16px', border: '1px solid #FFE4E6' }}>
                <h4 style={{ fontWeight: 600, marginBottom: '0.75rem', color: '#BE123C' }}>หมวดหมู่ที่ขายดีที่สุด</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
                  {categoryBreakdown.map((cat) => (
                    <div key={cat.name} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{cat.name}</span>
                      <strong>{cat.pct}%</strong>
                    </div>
                  ))}
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
              <div className="admin-form-row-2col" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
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

              <div className="admin-form-row-3col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
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

              <div className="admin-form-row-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

      {/* Slip Lightbox Inspection Modal */}
      {viewingSlipOrder && (
        <div className="modal-overlay" onClick={() => setViewingSlipOrder(null)} style={{ zIndex: 1300 }}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '560px', width: '92%', padding: '1.75rem', borderRadius: '20px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1F2937' }}>
                  ตรวจสอบสลิปการโอนเงิน
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                  คำสั่งซื้อ: <strong style={{ color: '#0284C7' }}>{viewingSlipOrder.id}</strong>
                </p>
              </div>
              <button onClick={() => setViewingSlipOrder(null)} className="btn-icon btn-ghost">
                <X size={20} />
              </button>
            </div>

            {/* Slip Meta Info Box */}
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                marginBottom: '1rem',
                fontSize: '0.85rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem',
              }}
            >
              <div>
                <span style={{ color: '#6B7280' }}>ผู้สั่งซื้อ: </span>
                <strong>{viewingSlipOrder.shipping_address.fullName}</strong>
              </div>
              <div>
                <span style={{ color: '#6B7280' }}>เบอร์โทร: </span>
                <strong>{viewingSlipOrder.shipping_address.phone}</strong>
              </div>
              <div>
                <span style={{ color: '#6B7280' }}>ยอดเงินที่ต้องโอน: </span>
                <strong style={{ color: '#E11D48', fontSize: '1rem' }}>
                  ฿{viewingSlipOrder.total_amount.toLocaleString()}
                </strong>
              </div>
              <div>
                <span style={{ color: '#6B7280' }}>สถานะ: </span>
                {viewingSlipOrder.admin_verified ? (
                  <span className="badge badge-success">ยืนยันยอดเงินแล้ว</span>
                ) : (
                  <span className="badge badge-warning" style={{ background: '#FEF3C7', color: '#B45309' }}>
                    รอตรวจสอบยอด
                  </span>
                )}
              </div>
            </div>

            {/* High-res Slip Image */}
            <div
              style={{
                background: '#0F172A',
                borderRadius: '14px',
                padding: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                maxHeight: '440px',
                overflow: 'hidden',
                marginBottom: '1.25rem',
              }}
            >
              {viewingSlipOrder.slip_url ? (
                <img
                  src={viewingSlipOrder.slip_url}
                  alt="สลิปโอนเงิน"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '420px',
                    objectFit: 'contain',
                    borderRadius: '8px',
                  }}
                />
              ) : (
                <div style={{ color: '#94A3B8', padding: '2rem' }}>ไม่พบไฟล์ภาพสลิป</div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setViewingSlipOrder(null)}
                className="btn btn-ghost btn-sm"
              >
                ปิดหน้าต่าง
              </button>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {!viewingSlipOrder.admin_verified && viewingSlipOrder.order_status !== 'cancelled' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('คุณต้องการปฏิเสธสลิปนี้ใช่หรือไม่?')) {
                          handleVerifySlip(viewingSlipOrder.id, false);
                        }
                      }}
                      disabled={isVerifying === viewingSlipOrder.id}
                      className="btn btn-outline btn-sm"
                      style={{ color: '#EF4444', borderColor: '#FECDD3' }}
                    >
                      <XCircle size={15} /> สลิปไม่ถูกต้อง (ปฏิเสธ)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVerifySlip(viewingSlipOrder.id, true)}
                      disabled={isVerifying === viewingSlipOrder.id}
                      className="btn btn-primary btn-sm"
                      style={{
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        border: 'none',
                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      <Check size={15} /> ยืนยันยอดเงิน ฿{viewingSlipOrder.total_amount.toLocaleString()} ถูกต้อง
                    </button>
                  </>
                ) : (
                  <span style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 600 }}>
                    {viewingSlipOrder.admin_verified ? '✅ สลิปนี้ได้รับการยืนยันแล้ว' : '❌ คำสั่งซื้อนี้ถูกยกเลิกแล้ว'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .admin-analytics-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          .admin-form-row-2col,
          .admin-form-row-3col {
            grid-template-columns: 1fr !important;
            gap: 0.85rem !important;
          }
          .admin-search-input {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};
