import React, { useState, useEffect } from 'react';
import type { Order, Product } from '../../types';
import {
  X,
  Package,
  Heart,
  User,
  MapPin,
  Copy,
  Check,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { fetchOrders } from '../../services/api';
import { showToast } from '../common/Toast';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'orders' | 'profile' | 'wishlist';
  onSelectProduct?: (product: Product) => void;
  onOpenAuth?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'orders',
  onSelectProduct,
  onOpenAuth,
}) => {
  const { profile, updateProfile } = useAuth();
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'wishlist'>(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);

  // Profile form state
  const [name, setName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState(profile?.address || '');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      loadOrders();
      if (profile) {
        setName(profile.full_name || '');
        setPhone(profile.phone || '');
        setAddress(profile.address || '');
      }
    }
  }, [isOpen, initialTab, profile]);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await fetchOrders(profile?.id);
      setOrders(data);
    } catch {
      console.warn('Orders load error');
    } finally {
      setLoadingOrders(false);
    }
  };

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ full_name: name, phone, address });
    showToast('บันทึกข้อมูลส่วนตัวเรียบร้อยแล้วค่ะ', 'success');
  };

  const copyTracking = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedTracking(num);
    showToast(`คัดลอกเลขพัสดุ "${num}" สำเร็จ!`, 'success');
    setTimeout(() => setCopiedTracking(null), 2500);
  };

  const getStatusBadge = (status: Order['order_status']) => {
    switch (status) {
      case 'pending':
        return <span className="badge badge-warning">รอชำระเงิน</span>;
      case 'processing':
        return <span className="badge badge-blue">กำลังจัดเตรียมสินค้า</span>;
      case 'shipped':
        return <span className="badge badge-pink">จัดส่งแล้ว</span>;
      case 'delivered':
        return <span className="badge badge-success">จัดส่งสำเร็จ</span>;
      case 'cancelled':
        return <span className="badge badge-danger">ยกเลิกแล้ว</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-content-lg"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '2rem' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FFD1DC 0%, #BFEFFF 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                color: '#BE123C',
                fontSize: '1.1rem',
              }}
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="avatar"
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                profile?.full_name?.charAt(0) || 'U'
              )}
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{profile?.full_name || 'บัญชีผู้ใช้งาน (Guest)'}</h3>
              <p style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                {profile ? (profile.role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'ลูกค้าสมาชิก (Customer)') : 'ยังไม่ได้เข้าสู่ระบบ'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon btn-ghost">
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1.5px solid #F3F4F6',
            marginBottom: '1.5rem',
            paddingBottom: '0.5rem',
          }}
        >
          <button
            onClick={() => setActiveTab('orders')}
            className={`btn btn-sm ${activeTab === 'orders' ? 'btn-primary' : 'btn-ghost'}`}
          >
            <Package size={16} /> ประวัติการสั่งซื้อ ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`btn btn-sm ${activeTab === 'wishlist' ? 'btn-primary' : 'btn-ghost'}`}
          >
            <Heart size={16} /> รายการที่ชอบ ({wishlist.length})
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`btn btn-sm ${activeTab === 'profile' ? 'btn-primary' : 'btn-ghost'}`}
          >
            <User size={16} /> ข้อมูลส่วนตัว & ที่อยู่
          </button>
        </div>

        {/* Content Area */}
        <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {/* TAB 1: Order History */}
          {activeTab === 'orders' && (
            <div>
              {!profile ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9CA3AF' }}>
                  <Package size={48} color="#FFB8C9" style={{ margin: '0 auto 0.75rem auto' }} />
                  <h4 style={{ color: '#4B5563', fontWeight: 600, marginBottom: '0.4rem' }}>กรุณาเข้าสู่ระบบเพื่อดูประวัติคำสั่งซื้อ</h4>
                  <p style={{ fontSize: '0.88rem', marginBottom: '1.25rem' }}>เข้าสู่ระบบด้วย Google หรืออีเมล เพื่อดูสถานะการจัดส่งและประวัติการสั่งซื้อย้อนหลังของคุณ</p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAuth?.();
                    }}
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <User size={16} /> เข้าสู่ระบบ / สมัครสมาชิก
                  </button>
                </div>
              ) : loadingOrders ? (
                <p style={{ textAlign: 'center', color: '#9CA3AF', padding: '2rem' }}>กำลังโหลดคำสั่งซื้อ...</p>
              ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9CA3AF' }}>
                  <Package size={48} color="#FFB8C9" style={{ margin: '0 auto 0.75rem auto' }} />
                  <h4 style={{ color: '#4B5563', fontWeight: 600 }}>ยังไม่มีประวัติคำสั่งซื้อ</h4>
                  <p style={{ fontSize: '0.88rem' }}>เมื่อคุณช้อปปิ้งที่ Sora Pink ออเดอร์และสถานะจัดส่งจะปรากฏที่นี่</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      style={{
                        padding: '1.25rem',
                        borderRadius: '16px',
                        background: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '0.75rem',
                          marginBottom: '0.85rem',
                          borderBottom: '1px solid #F3F4F6',
                          paddingBottom: '0.75rem',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1F2937' }}>
                            หมายเลขคำสั่งซื้อ: <span style={{ color: '#0284C7' }}>{order.id}</span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>
                            วันที่สั่งซื้อ: {new Date(order.created_at).toLocaleString('th-TH')}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {getStatusBadge(order.order_status)}
                          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#E11D48' }}>
                            ฿{order.total_amount.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Tracking Number Section */}
                      {order.tracking_number ? (
                        <div
                          style={{
                            background: '#F0F9FF',
                            border: '1px solid #BAE6FD',
                            padding: '0.6rem 0.85rem',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '0.75rem',
                          }}
                        >
                          <div style={{ fontSize: '0.85rem', color: '#0369A1' }}>
                            เลขพัสดุจัดส่ง (Flash Express / Kerry): <strong>{order.tracking_number}</strong>
                          </div>
                          <button
                            onClick={() => copyTracking(order.tracking_number!)}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', borderColor: '#38BDF8', color: '#0284C7' }}
                          >
                            {copiedTracking === order.tracking_number ? <Check size={12} /> : <Copy size={12} />}
                            {copiedTracking === order.tracking_number ? 'คัดลอกแล้ว' : 'คัดลอก'}
                          </button>
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.82rem', color: '#6B7280', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Package size={14} color="#0284C7" /> พัสดุกำลังเตรียมบรรจุภัณฑ์ จะมีเลขพัสดุอัปเดตเมื่อเริ่มจัดส่งค่ะ
                        </div>
                      )}

                      {/* Shipping Address mini info */}
                      <div style={{ fontSize: '0.82rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={14} color="#9CA3AF" /> ผู้รับ: {order.shipping_address.fullName} ({order.shipping_address.phone}), {order.shipping_address.address} จ.{order.shipping_address.province} {order.shipping_address.postalCode}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Wishlist */}
          {activeTab === 'wishlist' && (
            <div>
              {wishlist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9CA3AF' }}>
                  <Heart size={48} color="#FFB8C9" style={{ margin: '0 auto 0.75rem auto' }} />
                  <h4 style={{ color: '#4B5563', fontWeight: 600 }}>ยังไม่มีสินค้าที่ถูกใจ</h4>
                  <p style={{ fontSize: '0.88rem' }}>คลิกไอคอนหัวใจที่สินค้าเพื่อบันทึกรายการที่ชื่นชอบไว้ที่นี่</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                  {wishlist.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '0.85rem',
                        borderRadius: '16px',
                        background: '#FFFFFF',
                        border: '1px solid #F3F4F6',
                        display: 'flex',
                        gap: '0.75rem',
                        alignItems: 'center',
                      }}
                    >
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        onClick={() => {
                          if (onSelectProduct) {
                            onClose();
                            onSelectProduct(item);
                          }
                        }}
                        style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover', cursor: 'pointer' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4
                          onClick={() => {
                            if (onSelectProduct) {
                              onClose();
                              onSelectProduct(item);
                            }
                          }}
                          style={{
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            lineHeight: 1.3,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            cursor: 'pointer',
                          }}
                        >
                          {item.name}
                        </h4>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#E11D48', marginTop: '2px' }}>
                          ฿{(item.discount_price || item.price).toLocaleString()}
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                          <button
                            onClick={() => {
                              const res = addToCart(item, 1);
                              showToast(res.message, res.success ? 'success' : 'error');
                            }}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                          >
                            <ShoppingBag size={12} /> ใส่ตะกร้า
                          </button>
                          <button
                            onClick={() => toggleWishlist(item)}
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: '#EF4444' }}
                          >
                            ลบ
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Profile Form */}
          {activeTab === 'profile' && (
            !profile ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9CA3AF' }}>
                <User size={48} color="#FFB8C9" style={{ margin: '0 auto 0.75rem auto' }} />
                <h4 style={{ color: '#4B5563', fontWeight: 600, marginBottom: '0.4rem' }}>ยังไม่ได้เข้าสู่ระบบ</h4>
                <p style={{ fontSize: '0.88rem', marginBottom: '1.25rem' }}>เข้าสู่ระบบด้วย Google หรืออีเมล เพื่อบันทึกชื่อ ที่อยู่จัดส่ง และข้อมูลติดต่อของคุณ</p>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuth?.();
                  }}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <User size={16} /> เข้าสู่ระบบ / สมัครสมาชิก
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '520px' }}>
                <div>
                  <label className="form-label">ชื่อ - นามสกุล</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">เบอร์โทรศัพท์ติดต่อ</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08X-XXX-XXXX"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">ที่อยู่จัดส่งเริ่มต้น</label>
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="ระบุที่อยู่จัดส่งสำหรับสั่งซื้อสินค้าในอนาคต..."
                    className="form-textarea"
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                  บันทึกการเปลี่ยนแปลง
                </button>
              </form>
            )
          )}
        </div>
      </div>
    </div>
  );
};
