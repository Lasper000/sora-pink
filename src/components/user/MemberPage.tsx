import React, { useState, useEffect, useCallback } from 'react';
import type { Order, Product, SavedAddress } from '../../types';
import {
  ArrowLeft,
  Award,
  Crown,
  Sparkles,
  Gift,
  Ticket,
  Package,
  Heart,
  User,
  MapPin,
  Copy,
  Check,
  Printer,
  Truck,
  XCircle,
  ShoppingBag,
  LogOut,
  Plus,
  Trash2,
  ShieldCheck,
  Star,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { fetchOrders, customerCancelOrder } from '../../services/api';
import { showToast } from '../common/Toast';
import { handleImageError, DEFAULT_FALLBACK_IMAGE } from '../../utils/imageFallback';
import { printOrderReceipt } from '../../utils/printDocuments';
import {
  THAI_PROVINCES,
  resolveProvinceFromPostalCode,
  getSavedAddresses,
  saveAddressToBook,
  deleteAddressFromBook,
} from '../../utils/thaiLocations';

export type MemberTab = 'benefits' | 'rewards' | 'orders' | 'wishlist' | 'profile';

interface MemberPageProps {
  initialTab?: MemberTab;
  onBackToStore: () => void;
  onOpenAuth: () => void;
  onOpenCart: () => void;
  onSelectProduct: (product: Product) => void;
  onTrackOrder: (order: Order) => void;
  onOrderCancelled?: () => void;
}

const MEMBERSHIP_TIERS = [
  {
    id: 'sakura',
    name: 'Sakura Member',
    thaiName: 'สมาชิกซากุระ',
    minSpend: 0,
    maxSpendLabel: '฿0 – ฿1,499',
    badgeBg: 'linear-gradient(135deg, #F48BA5 0%, #DF5E7E 100%)',
    accent: '#C73D62',
    pointsRate: '1x Glow Points (ทุก ฿10 = 1 คะแนน)',
    shippingPerk: 'ส่งฟรีเมื่อช้อปครบ ฿500',
    birthdayPerk: 'โค้ดส่วนลดเดือนเกิด 10%',
    exclusivePerks: [
      'รับคะแนนต้อนรับฟรีทันที 50 Glow Points เมื่อสมัครสมาชิก',
      'เก็บคูปองส่วนลดพิเศษในศูนย์รวมคูปองได้ทุกเดือน',
      'บันทึกสมุดที่อยู่และติดตามพัสดุเรียลไทม์',
    ],
  },
  {
    id: 'rosegold',
    name: 'Rose Gold VIP',
    thaiName: 'สมาชิกโรสโกลด์ วีไอพี',
    minSpend: 1500,
    maxSpendLabel: '฿1,500 – ฿4,999',
    badgeBg: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
    accent: '#B45309',
    pointsRate: '1.5x Glow Points (สะสมไวขึ้น 50%)',
    shippingPerk: 'ส่งฟรี + คูปองส่งฟรีรายเดือน',
    birthdayPerk: 'โค้ดเดือนเกิดลด 20% + Mini Serum ฟรี',
    exclusivePerks: [
      'สิทธิ์แลกโค้ด GLOWVIP100 ลดเพิ่มทันที ฿100',
      'เข้าถึงรอบ Flash Drop & เซ็ตพิเศษก่อนบุคคลทั่วไป',
      'ของขวัญแถมพรีเมียมอัตโนมัติเมื่อช้อปครบ ฿800 / ฿1,200',
    ],
  },
  {
    id: 'diamond',
    name: 'Diamond Atelier',
    thaiName: 'สมาชิกไดมอนด์ อะเทอลิเยร์',
    minSpend: 5000,
    maxSpendLabel: 'ตั้งแต่ ฿5,000 ขึ้นไป',
    badgeBg: 'linear-gradient(135deg, #6D28D9 0%, #BE185D 100%)',
    accent: '#7C3AED',
    pointsRate: '2x Glow Points (คูณสองทุกออเดอร์)',
    shippingPerk: 'จัดส่งด่วนพิเศษ Priority Dispatch ทุกออเดอร์',
    birthdayPerk: 'ชุดของขวัญ Full-Size Birthday Box + โค้ดลด 25%',
    exclusivePerks: [
      'ที่ปรึกษาผิวส่วนตัว Beauty Concierge ดูแลเฉพาะบุคคล',
      'สิทธิ์ลองสินค้าคอลเลกชันใหม่ Limited Edition ก่อนใคร',
      'รับประกันความพึงพอใจและเปลี่ยนสินค้าแบบ Priority 14 วัน',
    ],
  },
];

export const MemberPage: React.FC<MemberPageProps> = ({
  initialTab = 'benefits',
  onBackToStore,
  onOpenAuth,
  onOpenCart,
  onSelectProduct,
  onTrackOrder,
  onOrderCancelled,
}) => {
  const { profile, updateProfile, logout } = useAuth();
  const {
    addToCart,
    availableVouchers,
    collectedVouchers,
    collectVoucher,
    isVoucherCollected,
    applyPromoCode,
    appliedPromo,
    itemCount,
  } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();

  const [activeTab, setActiveTab] = useState<MemberTab>(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | Order['order_status']>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  // Profile fields
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [defaultAddress, setDefaultAddress] = useState(profile?.address || '');

  // Address Book state
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(() => getSavedAddresses());
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddr, setNewAddr] = useState({
    label: 'บ้าน / คอนโด',
    fullName: profile?.full_name || '',
    phone: profile?.phone || '',
    address: '',
    postalCode: '',
    province: 'กรุงเทพมหานคร',
    note: '',
  });

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setDefaultAddress(profile.address || '');
    }
  }, [profile]);

  const loadOrders = useCallback(async () => {
    if (!profile) {
      setOrders([]);
      return;
    }
    setLoadingOrders(true);
    try {
      const data = await fetchOrders(profile.id);
      setOrders(data);
    } catch {
      console.warn('Member orders load error');
    } finally {
      setLoadingOrders(false);
    }
  }, [profile]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Compute tier & Glow Points
  const validOrders = orders.filter((o) => o.order_status !== 'cancelled');
  const totalSpent = validOrders.reduce((sum, o) => sum + o.total_amount, 0);
  const currentTier =
    totalSpent >= 5000
      ? MEMBERSHIP_TIERS[2]
      : totalSpent >= 1500
      ? MEMBERSHIP_TIERS[1]
      : MEMBERSHIP_TIERS[0];
  const nextTier =
    totalSpent >= 5000
      ? null
      : totalSpent >= 1500
      ? MEMBERSHIP_TIERS[2]
      : MEMBERSHIP_TIERS[1];

  const pointsMultiplier = currentTier.id === 'diamond' ? 2 : currentTier.id === 'rosegold' ? 1.5 : 1;
  const welcomeBonus = profile ? 50 : 0;
  const glowPoints = Math.round((totalSpent / 10) * pointsMultiplier) + welcomeBonus;
  const progressPct = nextTier
    ? Math.min(100, Math.round((totalSpent / nextTier.minSpend) * 100))
    : 100;
  const memberCode = profile ? `SP-${profile.id.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()}` : 'GUEST-PASS';

  const filteredOrders =
    orderStatusFilter === 'all'
      ? orders
      : orders.filter((o) => o.order_status === orderStatusFilter);

  const handleCopyText = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    setCopiedCode(value);
    showToast(`คัดลอก ${label} "${value}" เรียบร้อยแล้วค่ะ`, 'success');
    setTimeout(() => setCopiedCode(null), 2200);
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm(`คุณต้องการยกเลิกคำสั่งซื้อ #${orderId} ใช่หรือไม่?`)) return;
    setCancellingOrderId(orderId);
    try {
      const res = await customerCancelOrder(orderId, profile?.id);
      showToast(res.message, res.success ? 'info' : 'error');
      if (res.success) {
        await loadOrders();
        onOrderCancelled?.();
      }
    } finally {
      setCancellingOrderId(null);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      onOpenAuth();
      return;
    }
    updateProfile({ full_name: fullName, phone, address: defaultAddress });
    showToast('บันทึกข้อมูลส่วนตัวสมาชิกเรียบร้อยแล้วค่ะ ✨', 'success');
  };

  const handleAddSavedAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.fullName.trim() || !newAddr.phone.trim() || !newAddr.address.trim()) {
      showToast('กรุณากรอกข้อมูลที่อยู่จัดส่งให้ครบถ้วนค่ะ', 'error');
      return;
    }
    const nextList = saveAddressToBook({
      label: newAddr.label.trim() || 'ที่อยู่จัดส่ง',
      fullName: newAddr.fullName.trim(),
      phone: newAddr.phone.trim(),
      address: newAddr.address.trim(),
      province: newAddr.province.trim() || 'กรุงเทพมหานคร',
      postalCode: newAddr.postalCode.trim(),
      note: newAddr.note.trim(),
    });
    setSavedAddresses(nextList);
    setShowAddressForm(false);
    setNewAddr({
      label: 'ที่ทำงาน / คอนโด',
      fullName: profile?.full_name || '',
      phone: profile?.phone || '',
      address: '',
      postalCode: '',
      province: 'กรุงเทพมหานคร',
      note: '',
    });
    showToast('เพิ่มที่อยู่ใหม่ลงสมุดที่อยู่เรียบร้อยแล้วค่ะ', 'success');
  };

  const getOrderStatusBadge = (order: Order) => {
    switch (order.order_status) {
      case 'pending':
        return (
          <span className="badge badge-warning" style={{ background: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A' }}>
            <Clock size={12} /> {order.payment_method === 'promptpay' ? 'รอตรวจสอบสลิป' : 'รอแอดมินยืนยัน'}
          </span>
        );
      case 'processing':
        return <span className="badge badge-blue">กำลังจัดเตรียมสินค้า</span>;
      case 'shipped':
        return <span className="badge badge-pink">อยู่ระหว่างจัดส่ง</span>;
      case 'delivered':
        return <span className="badge badge-success">จัดส่งสำเร็จ</span>;
      case 'cancelled':
        return <span className="badge badge-danger">ยกเลิกแล้ว</span>;
      default:
        return <span className="badge badge-pink">{order.order_status}</span>;
    }
  };

  const tabItems: { id: MemberTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'benefits', label: 'สิทธิพิเศษ & ระดับสมาชิก', icon: <Crown size={15} /> },
    { id: 'rewards', label: 'แลกคะแนน & คูปอง', icon: <Gift size={15} />, count: collectedVouchers.length },
    { id: 'orders', label: 'คำสั่งซื้อ & พัสดุ', icon: <Package size={15} />, count: orders.length },
    { id: 'wishlist', label: 'รายการที่ชอบ', icon: <Heart size={15} />, count: wishlist.length },
    { id: 'profile', label: 'ข้อมูลส่วนตัว & ที่อยู่', icon: <User size={15} /> },
  ];

  return (
    <div className="member-page-wrapper" style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* Sticky Member Topbar */}
      <div
        className="member-topbar"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 80,
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(222, 83, 119, 0.16)',
          padding: '0.85rem 0',
        }}
      >
        <div
          className="container member-topbar-inner"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
            <button
              type="button"
              onClick={onBackToStore}
              className="btn btn-outline btn-sm member-back-btn"
              style={{ borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              <ArrowLeft size={15} /> <span className="member-back-text-full">กลับหน้าร้านค้า</span><span className="member-back-text-short" style={{ display: 'none' }}>ร้านค้า</span>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
              <img
                src="/logo.png"
                alt="SORA PINK"
                style={{ width: 32, height: 32, borderRadius: '10px', objectFit: 'cover', border: '1px solid #FAD1DC', flexShrink: 0 }}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '0.94rem', color: 'var(--text-primary)', lineHeight: 1.1, whiteSpace: 'nowrap' }}>
                  SORA CLUB
                </div>
                <div className="member-topbar-subtitle" style={{ fontSize: '0.68rem', color: '#C73D62', fontWeight: 600, letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                  MEMBER PRIVILEGE CENTER
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
            <button
              type="button"
              onClick={onOpenCart}
              className="btn btn-primary btn-sm member-cart-btn"
              style={{ borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}
            >
              <ShoppingBag size={15} /> <span className="desktop-only">ตะกร้า</span> ({itemCount})
            </button>
            {profile ? (
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  showToast('ออกจากระบบเรียบร้อยแล้วค่ะ', 'info');
                }}
                className="btn btn-ghost btn-sm"
                style={{ color: '#DC2626', borderRadius: '9999px', whiteSpace: 'nowrap' }}
                title="ออกจากระบบ"
              >
                <LogOut size={15} /> <span className="desktop-only">ออกจากระบบ</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="btn btn-outline btn-sm member-auth-btn"
                style={{ borderRadius: '9999px', whiteSpace: 'nowrap' }}
              >
                <span className="member-auth-text-full">เข้าสู่ระบบ / สมัครฟรี</span>
                <span className="member-auth-text-short" style={{ display: 'none' }}>เข้าสู่ระบบ</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2rem' }}>
        {/* Digital VIP Member Hero Card */}
        <div
          className="member-hero-card"
          style={{
            background: profile
              ? currentTier.badgeBg
              : 'linear-gradient(135deg, #DF5E7E 0%, #C73D62 55%, #8C2E41 100%)',
            borderRadius: '28px',
            padding: '2rem',
            color: '#FFFFFF',
            boxShadow: '0 20px 45px rgba(199, 61, 98, 0.25)',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '1.75rem',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-40px',
              right: '-30px',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.12)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1.5rem',
              flexWrap: 'wrap',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Left Member Identity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem', minWidth: 0 }}>
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: '2.5px solid rgba(255, 255, 255, 0.75)',
                  background: 'rgba(255, 255, 255, 0.2)',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={profile?.avatar_url || '/logo.png'}
                  alt={profile?.full_name || 'Sora Club Member'}
                  onError={handleImageError}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(6px)', padding: '3px 12px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '0.45rem' }}>
                  <Crown size={13} />
                  {profile ? `${currentTier.name.toUpperCase()} • ${memberCode}` : 'SORA CLUB MEMBERSHIP • สมัครฟรีไม่มีค่าธรรมเนียม'}
                </div>
                <h1 className="font-serif" style={{ fontSize: 'clamp(1.35rem, 3vw, 2rem)', fontWeight: 700, margin: 0, color: '#FFFFFF', lineHeight: 1.2 }}>
                  {profile ? `สวัสดีค่ะ, ${profile.full_name}` : 'ยินดีต้อนรับสู่ SORA CLUB'}
                </h1>
                <p style={{ fontSize: '0.86rem', color: 'rgba(255, 255, 255, 0.9)', margin: '0.35rem 0 0 0', maxWidth: '540px' }}>
                  {profile
                    ? `${currentTier.thaiName} • ${currentTier.pointsRate}`
                    : 'สมัครสมาชิกฟรีวันนี้ รับทันที 50 Glow Points, โค้ดส่วนลดพิเศษ, สมุดที่อยู่ และสิทธิ์ติดตามพัสดุเรียลไทม์'}
                </p>
              </div>
            </div>

            {/* Right Points / Login CTA */}
            {profile ? (
              <div
                className="member-points-box"
                style={{
                  background: 'rgba(255, 255, 255, 0.16)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.28)',
                  borderRadius: '20px',
                  padding: '1rem 1.35rem',
                  minWidth: '220px',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ fontSize: '0.74rem', opacity: 0.9, letterSpacing: '0.05em' }}>คะแนนสะสมคงเหลือ</div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, lineHeight: 1.15, margin: '2px 0' }}>
                  {glowPoints.toLocaleString()} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Glow Pts</span>
                </div>
                <div style={{ fontSize: '0.74rem', opacity: 0.9 }}>
                  ยอดช้อปสะสม: ฿{totalSpent.toLocaleString()}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="btn"
                style={{
                  background: '#FFFFFF',
                  color: '#C73D62',
                  borderRadius: '9999px',
                  padding: '0.8rem 1.75rem',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                }}
              >
                <Sparkles size={17} /> เข้าสู่ระบบ / สมัครสมาชิกฟรี
              </button>
            )}
          </div>

          {/* Tier Progress Bar */}
          {profile && (
            <div style={{ marginTop: '1.35rem', position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '6px', opacity: 0.95, flexWrap: 'wrap', gap: '4px' }}>
                <span>ระดับปัจจุบัน: <strong>{currentTier.name}</strong></span>
                <span>
                  {nextTier
                    ? `ช้อปเพิ่มอีก ฿${Math.max(0, nextTier.minSpend - totalSpent).toLocaleString()} เพื่ออัปเกรดเป็น ${nextTier.name}`
                    : '✨ คุณอยู่ระดับสูงสุด Diamond Atelier แล้วค่ะ!'}
                </span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.25)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${progressPct}%`,
                    background: '#FFFFFF',
                    borderRadius: '9999px',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 4 Summary Stat Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(136px, 100%), 1fr))',
            gap: '0.85rem',
            marginBottom: '1.75rem',
          }}
        >
          <div className="glass-card member-stat-card" style={{ padding: '1rem 1.15rem', borderRadius: '18px', background: '#FFFFFF' }}>
            <div style={{ fontSize: '0.74rem', color: '#706064', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Sparkles size={14} color="#C73D62" /> Glow Points
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#C73D62', marginTop: '4px' }}>
              {glowPoints.toLocaleString()}
            </div>
          </div>

          <div
            onClick={() => setActiveTab('orders')}
            className="glass-card member-stat-card"
            style={{ padding: '1rem 1.15rem', borderRadius: '18px', background: '#FFFFFF', cursor: 'pointer' }}
          >
            <div style={{ fontSize: '0.74rem', color: '#706064', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Package size={14} color="#0284C7" /> คำสั่งซื้อทั้งหมด
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              {orders.length} รายการ
            </div>
          </div>

          <div
            onClick={() => setActiveTab('rewards')}
            className="glass-card member-stat-card"
            style={{ padding: '1rem 1.15rem', borderRadius: '18px', background: '#FFFFFF', cursor: 'pointer' }}
          >
            <div style={{ fontSize: '0.74rem', color: '#706064', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Ticket size={14} color="#D97706" /> คูปองในกระเป๋า
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              {collectedVouchers.length} ใบ
            </div>
          </div>

          <div
            onClick={() => setActiveTab('wishlist')}
            className="glass-card member-stat-card"
            style={{ padding: '1rem 1.15rem', borderRadius: '18px', background: '#FFFFFF', cursor: 'pointer' }}
          >
            <div style={{ fontSize: '0.74rem', color: '#706064', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Heart size={14} color="#E11D48" /> สินค้าที่ถูกใจ
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              {wishlist.length} ชิ้น
            </div>
          </div>
        </div>

        {/* Navigation Pill Tabs */}
        <div
          className="member-tabs-scroll"
          style={{
            display: 'flex',
            gap: '0.55rem',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            paddingBottom: '0.5rem',
            marginBottom: '1.5rem',
            scrollbarWidth: 'none',
          }}
        >
          {tabItems.map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`btn btn-sm member-tab-pill ${active ? 'btn-primary' : 'btn-outline'}`}
                style={{
                  borderRadius: '9999px',
                  padding: '0.55rem 1.1rem',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: active ? 700 : 600,
                }}
              >
                {t.icon}
                <span>{t.label}</span>
                {typeof t.count === 'number' && (
                  <span
                    style={{
                      background: active ? 'rgba(255,255,255,0.25)' : 'rgba(223, 94, 126, 0.12)',
                      color: active ? '#FFFFFF' : '#C73D62',
                      borderRadius: '9999px',
                      padding: '0 7px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                    }}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: MEMBERSHIP TIERS & BENEFITS OVERVIEW */}
        {activeTab === 'benefits' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h2 className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  สิทธิพิเศษสมาชิก SORA CLUB (3 ระดับ)
                </h2>
                <p style={{ fontSize: '0.86rem', color: '#706064', margin: '4px 0 0 0' }}>
                  ช้อปสะสมยอดเพื่อปลดล็อกสิทธิประโยชน์ที่มากขึ้น พร้อมคะแนนสะสมและของขวัญสุดเอ็กซ์คลูซีฟ
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('rewards')}
                className="btn btn-primary btn-sm"
                style={{ borderRadius: '9999px' }}
              >
                <Gift size={15} /> ไปหน้าแลกคะแนน & คูปอง
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
                gap: '1.15rem',
              }}
            >
              {MEMBERSHIP_TIERS.map((tier) => {
                const isCurrent = Boolean(profile) && currentTier.id === tier.id;
                return (
                  <div
                    key={tier.id}
                    className="glass-card member-tier-card"
                    style={{
                      borderRadius: '24px',
                      overflow: 'hidden',
                      background: '#FFFFFF',
                      border: isCurrent ? `2px solid ${tier.accent}` : '1px solid rgba(222, 83, 119, 0.16)',
                      boxShadow: isCurrent ? '0 12px 30px rgba(223, 94, 126, 0.18)' : '0 4px 18px rgba(0, 0, 0, 0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div style={{ background: tier.badgeBg, padding: '1.25rem 1.35rem', color: '#FFFFFF' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.92 }}>
                          {tier.maxSpendLabel}
                        </span>
                        {isCurrent && (
                          <span style={{ background: '#FFFFFF', color: tier.accent, padding: '2px 10px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 800 }}>
                            ระดับของคุณ
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0.4rem 0 2px 0', color: '#FFFFFF' }}>
                        {tier.name}
                      </h3>
                      <div style={{ fontSize: '0.8rem', opacity: 0.92 }}>{tier.thaiName}</div>
                    </div>

                    <div style={{ padding: '1.25rem 1.35rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                      <div style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <Star size={15} color={tier.accent} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span><strong>สะสมแต้ม:</strong> {tier.pointsRate}</span>
                      </div>
                      <div style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <Truck size={15} color={tier.accent} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span><strong>จัดส่ง:</strong> {tier.shippingPerk}</span>
                      </div>
                      <div style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <Gift size={15} color={tier.accent} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span><strong>ของขวัญวันเกิด:</strong> {tier.birthdayPerk}</span>
                      </div>

                      <div style={{ borderTop: '1px dashed rgba(222, 83, 119, 0.2)', paddingTop: '0.75rem', marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                        {tier.exclusivePerks.map((perk) => (
                          <div key={perk} style={{ fontSize: '0.79rem', color: '#706064', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                            <ShieldCheck size={14} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>{perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: REWARDS & VOUCHER WALLET */}
        {activeTab === 'rewards' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h2 className="font-serif" style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  แลกคะแนน & คูปองสิทธิพิเศษสมาชิก
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#706064', margin: '4px 0 0 0' }}>
                  เก็บโค้ดเข้ากระเป๋าหรือกดใช้งานในตะกร้าได้ทันที • คะแนนของคุณ: <strong style={{ color: '#C73D62' }}>{glowPoints.toLocaleString()} Glow Points</strong>
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(290px, 100%), 1fr))', gap: '1rem' }}>
              {availableVouchers
                .filter((p) => p.isActive !== false)
                .map((promo) => {
                  const collected = isVoucherCollected(promo.code);
                  const isApplied = appliedPromo?.code === promo.code;
                  return (
                    <div
                      key={promo.code}
                      className="glass-card coupon-ticket-card"
                      style={{
                        borderRadius: '20px',
                        padding: '1.15rem',
                        background: '#FFFFFF',
                        border: isApplied ? '2px solid #10B981' : '1px solid rgba(222, 83, 119, 0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '0.85rem',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                          <span
                            onClick={() => handleCopyText(promo.code, 'โค้ดส่วนลด')}
                            style={{
                              background: '#FFF0F4',
                              color: '#C73D62',
                              border: '1px dashed #F48BA5',
                              padding: '3px 10px',
                              borderRadius: '8px',
                              fontFamily: 'monospace',
                              fontWeight: 800,
                              fontSize: '0.88rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}
                          >
                            {promo.code}
                            {copiedCode === promo.code ? <Check size={12} /> : <Copy size={12} />}
                          </span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#C73D62' }}>
                            {promo.discountPercent
                              ? `ลด ${promo.discountPercent}%`
                              : promo.discountAmount
                              ? `ลด ฿${promo.discountAmount}`
                              : promo.freeShipping
                              ? 'ส่งฟรี'
                              : 'สิทธิพิเศษ'}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                          {promo.description}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#706064' }}>
                          {promo.minSpend ? `ขั้นต่ำ ฿${promo.minSpend.toLocaleString()}` : 'ไม่มีขั้นต่ำ'}
                          {promo.expiresAt ? ` • หมดอายุ ${new Date(promo.expiresAt).toLocaleDateString('th-TH')}` : ''}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {!collected ? (
                          <button
                            type="button"
                            onClick={() => {
                              const res = collectVoucher(promo.code);
                              showToast(res.message, res.success ? 'success' : 'info');
                            }}
                            className="btn btn-primary btn-sm"
                            style={{ flex: 1, borderRadius: '9999px', justifyContent: 'center' }}
                          >
                            <Award size={14} /> เก็บคูปองนี้
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isApplied}
                            onClick={() => {
                              const res = applyPromoCode(promo.code);
                              showToast(res.message, res.success ? 'success' : 'error');
                              if (res.success) onOpenCart();
                            }}
                            className={`btn btn-sm ${isApplied ? 'btn-outline' : 'btn-primary'}`}
                            style={{ flex: 1, borderRadius: '9999px', justifyContent: 'center' }}
                          >
                            {isApplied ? '✓ ใช้งานอยู่ในตะกร้า' : 'ใช้โค้ดในตะกร้าเลย'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* TAB 3: ORDER HISTORY & TRACKING */}
        {activeTab === 'orders' && (
          <div>
            {!profile ? (
              <div className="glass-card profile-order-card" style={{ textAlign: 'center', padding: '3rem 1.5rem', borderRadius: '24px', background: '#FFFFFF' }}>
                <Package size={48} color="#DF5E7E" style={{ margin: '0 auto 0.85rem auto' }} />
                <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                  กรุณาเข้าสู่ระบบเพื่อดูประวัติคำสั่งซื้อและเลขพัสดุ
                </h3>
                <p style={{ fontSize: '0.86rem', color: '#706064', marginBottom: '1.25rem' }}>
                  คุณสามารถติดตามสถานะพัสดุ พิมพ์ใบเสร็จ และยกเลิกคำสั่งซื้อที่รอตรวจสอบได้จากหน้านี้
                </p>
                <button type="button" onClick={onOpenAuth} className="btn btn-primary" style={{ borderRadius: '9999px' }}>
                  เข้าสู่ระบบตอนนี้
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                  {(
                    [
                      { id: 'all', label: 'ทั้งหมด' },
                      { id: 'pending', label: 'รอตรวจสอบ' },
                      { id: 'processing', label: 'กำลังจัดเตรียม' },
                      { id: 'shipped', label: 'จัดส่งแล้ว' },
                      { id: 'delivered', label: 'สำเร็จ' },
                      { id: 'cancelled', label: 'ยกเลิก' },
                    ] as const
                  ).map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setOrderStatusFilter(st.id)}
                      className={`filter-pill ${orderStatusFilter === st.id ? 'active' : ''}`}
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.9rem' }}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                {loadingOrders ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#706064' }}>กำลังโหลดคำสั่งซื้อของคุณ...</div>
                ) : filteredOrders.length === 0 ? (
                  <div className="glass-card profile-order-card" style={{ textAlign: 'center', padding: '3rem 1.5rem', borderRadius: '24px', background: '#FFFFFF' }}>
                    <Package size={44} color="#FFB8C9" style={{ margin: '0 auto 0.75rem auto' }} />
                    <h4 style={{ margin: '0 0 0.35rem 0', color: 'var(--text-primary)' }}>ยังไม่มีคำสั่งซื้อในหมวดนี้</h4>
                    <p style={{ fontSize: '0.85rem', color: '#706064', marginBottom: '1rem' }}>
                      เริ่มเลือกชมสกินแคร์และสะสมคะแนน Glow Points ได้เลยค่ะ
                    </p>
                    <button type="button" onClick={onBackToStore} className="btn btn-primary btn-sm" style={{ borderRadius: '9999px' }}>
                      กลับไปช้อปสินค้า
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredOrders.map((order) => (
                      <div
                        key={order.id}
                        className="glass-card profile-order-card"
                        style={{
                          padding: '1.25rem',
                          borderRadius: '20px',
                          background: '#FFFFFF',
                          border: '1px solid rgba(222, 83, 119, 0.16)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.65rem', paddingBottom: '0.75rem', marginBottom: '0.85rem', borderBottom: '1px solid rgba(148, 163, 184, 0.18)' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-primary)' }}>
                              คำสั่งซื้อ #{order.id}
                            </div>
                            <div style={{ fontSize: '0.76rem', color: '#94A3B8' }}>
                              {new Date(order.created_at).toLocaleString('th-TH')}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
                            {getOrderStatusBadge(order)}
                            <span style={{ fontSize: '1.08rem', fontWeight: 800, color: '#C73D62' }}>
                              ฿{order.total_amount.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {order.items && order.items.length > 0 && (
                          <div className="profile-order-items-box" style={{ padding: '0.7rem 0.9rem', borderRadius: '14px', background: '#FFF9FB', border: '1px solid #FCE7F3', marginBottom: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                            {order.items.map((item) => (
                              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', minWidth: 0 }}>
                                  <img
                                    src={item.product?.images?.[0] || DEFAULT_FALLBACK_IMAGE}
                                    alt={item.product?.name || 'สินค้า'}
                                    onError={handleImageError}
                                    style={{ width: 34, height: 34, borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                                  />
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {item.product?.name || `สินค้า ${item.product_id}`}
                                    </div>
                                    {item.selected_shade && (
                                      <div style={{ fontSize: '0.7rem', color: '#C73D62', fontWeight: 600 }}>
                                        เฉดสี: {item.selected_shade}
                                      </div>
                                    )}
                                  </div>
                                  <span style={{ color: '#64748B', flexShrink: 0 }}>×{item.quantity}</span>
                                </div>
                                <strong style={{ color: '#C73D62', flexShrink: 0 }}>
                                  ฿{(item.price_at_purchase * item.quantity).toLocaleString()}
                                </strong>
                              </div>
                            ))}
                          </div>
                        )}

                        {order.tracking_number && order.order_status !== 'cancelled' && (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '12px', padding: '0.55rem 0.85rem', marginBottom: '0.85rem', fontSize: '0.82rem', color: '#0369A1' }}>
                            <span>เลขพัสดุ: <strong>{order.tracking_number}</strong></span>
                            <button
                              type="button"
                              onClick={() => handleCopyText(order.tracking_number!, 'เลขพัสดุ')}
                              className="btn btn-outline btn-sm"
                              style={{ borderRadius: '9999px', padding: '2px 10px', fontSize: '0.74rem' }}
                            >
                              <Copy size={12} /> คัดลอก
                            </button>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.55rem' }}>
                          <div style={{ fontSize: '0.8rem', color: '#706064', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={14} color="#DF5E7E" /> {order.shipping_address.fullName} • จ.{order.shipping_address.province}
                          </div>
                          <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              onClick={() => printOrderReceipt(order)}
                              className="btn btn-outline btn-sm"
                              style={{ borderRadius: '9999px', fontSize: '0.76rem' }}
                            >
                              <Printer size={13} /> ใบเสร็จ
                            </button>
                            {order.order_status === 'pending' && (
                              <button
                                type="button"
                                disabled={cancellingOrderId === order.id}
                                onClick={() => handleCancelOrder(order.id)}
                                className="btn btn-outline btn-sm"
                                style={{ borderRadius: '9999px', fontSize: '0.76rem', color: '#DC2626', borderColor: '#FECACA' }}
                              >
                                <XCircle size={13} /> {cancellingOrderId === order.id ? 'กำลังยกเลิก...' : 'ยกเลิกออเดอร์'}
                              </button>
                            )}
                            {order.order_status !== 'cancelled' && (
                              <button
                                type="button"
                                onClick={() => onTrackOrder(order)}
                                className="btn btn-primary btn-sm"
                                style={{ borderRadius: '9999px', fontSize: '0.76rem' }}
                              >
                                <Truck size={13} /> ติดตามพัสดุ
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB 4: WISHLIST */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlist.length === 0 ? (
              <div className="glass-card profile-wishlist-card" style={{ textAlign: 'center', padding: '3rem 1.5rem', borderRadius: '24px', background: '#FFFFFF' }}>
                <Heart size={46} color="#FFB8C9" style={{ margin: '0 auto 0.75rem auto' }} />
                <h4 style={{ margin: '0 0 0.35rem 0', color: 'var(--text-primary)' }}>ยังไม่มีสินค้าในรายการที่ชอบ</h4>
                <p style={{ fontSize: '0.85rem', color: '#706064', marginBottom: '1rem' }}>
                  แตะรูปหัวใจที่สินค้าที่คุณสนใจเพื่อบันทึกไว้กลับมาช้อปภายหลังได้ง่ายๆ
                </p>
                <button type="button" onClick={onBackToStore} className="btn btn-primary btn-sm" style={{ borderRadius: '9999px' }}>
                  เลือกชมสินค้าเลย
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))', gap: '1rem' }}>
                {wishlist.map((prod) => (
                  <div
                    key={prod.id}
                    className="glass-card profile-wishlist-card"
                    style={{
                      padding: '1rem',
                      borderRadius: '20px',
                      background: '#FFFFFF',
                      border: '1px solid rgba(222, 83, 119, 0.16)',
                      display: 'flex',
                      gap: '0.85rem',
                      alignItems: 'center',
                    }}
                  >
                    <img
                      src={prod.images?.[0] || DEFAULT_FALLBACK_IMAGE}
                      alt={prod.name}
                      onError={handleImageError}
                      onClick={() => onSelectProduct(prod)}
                      style={{ width: 72, height: 72, borderRadius: '14px', objectFit: 'cover', cursor: 'pointer', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        onClick={() => onSelectProduct(prod)}
                        style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                      >
                        {prod.name}
                      </div>
                      <div style={{ fontWeight: 800, color: '#C73D62', fontSize: '0.96rem', margin: '3px 0 6px 0' }}>
                        ฿{(prod.discount_price || prod.price).toLocaleString()}
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => {
                            const res = addToCart(prod, 1);
                            showToast(res.message, res.success ? 'success' : 'error');
                          }}
                          className="btn btn-primary btn-sm"
                          style={{ borderRadius: '9999px', padding: '0.28rem 0.75rem', fontSize: '0.74rem' }}
                        >
                          <ShoppingBag size={12} /> ใส่ตะกร้า
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            toggleWishlist(prod);
                            showToast('นำออกจากรายการที่ชอบแล้ว', 'info');
                          }}
                          className="btn btn-ghost btn-sm"
                          style={{ color: '#DC2626', padding: '0.28rem 0.55rem', fontSize: '0.74rem' }}
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

        {/* TAB 5: PROFILE & SAVED ADDRESS BOOK */}
        {activeTab === 'profile' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: '1.25rem' }}>
            {/* Personal Profile Card */}
            <div className="glass-card profile-order-card" style={{ padding: '1.5rem', borderRadius: '22px', background: '#FFFFFF' }}>
              <h3 style={{ fontSize: '1.08rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={18} color="#C73D62" /> ข้อมูลส่วนตัวสมาชิก
              </h3>
              {!profile ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                  <p style={{ fontSize: '0.86rem', color: '#706064', marginBottom: '1rem' }}>
                    เข้าสู่ระบบเพื่อแก้ไขชื่อ เบอร์โทร และข้อมูลสมาชิกของคุณ
                  </p>
                  <button type="button" onClick={onOpenAuth} className="btn btn-primary btn-sm" style={{ borderRadius: '9999px' }}>
                    เข้าสู่ระบบ / สมัครสมาชิก
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div>
                    <label className="form-label">ชื่อ - นามสกุล</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">เบอร์โทรศัพท์ติดต่อ</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="form-input"
                      placeholder="เช่น 081-234-5678"
                    />
                  </div>
                  <div>
                    <label className="form-label">ที่อยู่หลัก</label>
                    <textarea
                      rows={3}
                      value={defaultAddress}
                      onChange={(e) => setDefaultAddress(e.target.value)}
                      className="form-textarea"
                      placeholder="ระบุบ้านเลขที่ ถนน แขวง/ตำบล เขต/อำเภอ..."
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ borderRadius: '9999px', marginTop: '0.25rem' }}>
                    บันทึกข้อมูลส่วนตัว
                  </button>
                </form>
              )}
            </div>

            {/* Saved Address Book Manager */}
            <div className="glass-card profile-order-card" style={{ padding: '1.5rem', borderRadius: '22px', background: '#FFFFFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.08rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={18} color="#C73D62" /> สมุดที่อยู่จัดส่ง ({savedAddresses.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddressForm((v) => !v)}
                  className="btn btn-outline btn-sm"
                  style={{ borderRadius: '9999px', fontSize: '0.76rem' }}
                >
                  <Plus size={14} /> {showAddressForm ? 'ปิดฟอร์ม' : 'เพิ่มที่อยู่ใหม่'}
                </button>
              </div>

              {showAddressForm && (
                <form
                  onSubmit={handleAddSavedAddress}
                  className="profile-order-items-box"
                  style={{
                    padding: '1rem',
                    borderRadius: '16px',
                    background: '#FFF9FB',
                    border: '1px solid #FAD1DC',
                    marginBottom: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem',
                  }}
                >
                  <input
                    type="text"
                    placeholder="ป้ายชื่อ (เช่น บ้าน, คอนโด, ที่ทำงาน)"
                    value={newAddr.label}
                    onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                    className="form-input"
                  />
                  <div className="form-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem' }}>
                    <input
                      type="text"
                      required
                      placeholder="ชื่อผู้รับ *"
                      value={newAddr.fullName}
                      onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                      className="form-input"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="เบอร์โทร *"
                      value={newAddr.phone}
                      onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <textarea
                    rows={2}
                    required
                    placeholder="บ้านเลขที่ ซอย ถนน แขวง/ตำบล *"
                    value={newAddr.address}
                    onChange={(e) => setNewAddr({ ...newAddr, address: e.target.value })}
                    className="form-textarea"
                  />
                  <div className="form-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem' }}>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={5}
                      required
                      placeholder="รหัสไปรษณีย์ 5 หลัก *"
                      value={newAddr.postalCode}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, '').slice(0, 5);
                        const detected = resolveProvinceFromPostalCode(clean);
                        setNewAddr((prev) => ({ ...prev, postalCode: clean, province: detected || prev.province }));
                      }}
                      className="form-input"
                    />
                    <input
                      type="text"
                      required
                      list="member-thai-provinces"
                      placeholder="จังหวัด *"
                      value={newAddr.province}
                      onChange={(e) => setNewAddr({ ...newAddr, province: e.target.value })}
                      className="form-input"
                    />
                    <datalist id="member-thai-provinces">
                      {THAI_PROVINCES.map((p) => (
                        <option key={p} value={p} />
                      ))}
                    </datalist>
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm" style={{ borderRadius: '9999px' }}>
                    บันทึกที่อยู่ลงสมุด
                  </button>
                </form>
              )}

              {savedAddresses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.75rem 0.5rem', color: '#706064', fontSize: '0.84rem' }}>
                  ยังไม่มีที่อยู่ที่บันทึกไว้ • เพิ่มที่อยู่ไว้ล่วงหน้าเพื่อสั่งซื้อครั้งต่อไปได้ไวขึ้นค่ะ
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="profile-order-items-box"
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: '14px',
                        background: '#FFF9FB',
                        border: '1px solid #FCE7F3',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '0.65rem',
                      }}
                    >
                      <div style={{ fontSize: '0.82rem', lineHeight: 1.55 }}>
                        <span style={{ display: 'inline-block', background: '#C73D62', color: '#FFFFFF', fontSize: '0.68rem', fontWeight: 700, padding: '1px 8px', borderRadius: '9999px', marginBottom: '4px' }}>
                          {addr.label}
                        </span>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {addr.fullName} ({addr.phone})
                        </div>
                        <div style={{ color: '#706064' }}>
                          {addr.address} จ.{addr.province} {addr.postalCode}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSavedAddresses(deleteAddressFromBook(addr.id));
                          showToast('ลบที่อยู่ออกจากสมุดเรียบร้อยแล้ว', 'info');
                        }}
                        className="btn btn-ghost btn-sm"
                        style={{ color: '#DC2626', padding: '4px' }}
                        title="ลบที่อยู่"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
