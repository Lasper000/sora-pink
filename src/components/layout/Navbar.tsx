import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Heart,
  Search,
  User,
  Shield,
  Sparkles,
  Menu,
  X,
  Database,
  LogOut,
  Package,
  Flame,
  Layers,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';
import { CutePumpkinIcon, CuteGhostIcon } from '../common/HalloweenArtwork';

interface NavbarProps {
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenAdmin: () => void;
  onOpenSupabaseGuide: () => void;
  onOpenSkinQuiz: () => void;
  onOpenTrickOrTreat: () => void;
  isHalloweenMode: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onCategorySelect?: (catId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCart,
  onOpenWishlist,
  onOpenAuth,
  onOpenProfile,
  onOpenAdmin,
  onOpenSupabaseGuide,
  onOpenSkinQuiz,
  onOpenTrickOrTreat,
  isHalloweenMode,
  searchQuery,
  onSearchChange,
}) => {
  const { profile, role, isConfigured, logout, toggleRole } = useAuth();
  const { itemCount, subtotal } = useCart();
  const { wishlistCount } = useWishlist();
  const { isDark, toggleTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sora-navbar-header glass-panel ${isScrolled ? 'is-scrolled' : ''}`}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Top micro announcement bar */}
      <div
        className="top-announcement-bar"
        style={{
          background: isHalloweenMode
            ? 'linear-gradient(90deg, #FCE7F3 0%, #EDE9FE 50%, #E0F2FE 100%)'
            : 'linear-gradient(90deg, #FFD1DC 0%, #FFF0F3 50%, #BFEFFF 100%)',
          padding: '0.35rem 1rem',
          fontSize: '0.8rem',
          textAlign: 'center',
          color: '#4B5563',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.85rem',
          flexWrap: 'wrap',
          transition: 'all 0.3s ease',
        }}
      >
        <span>
          {isHalloweenMode ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <CutePumpkinIcon size={18} />
              <span className="announcement-text-desktop">
                <strong>ต้อนรับฮาโลวีน!</strong> จิ้มกล่องสุ่มรับโค้ดลับ หรือกรอก <strong>SPOOKY31</strong> ลดทันที 31%
              </span>
              <span className="announcement-text-mobile" style={{ display: 'none' }}>
                <strong>ฮาโลวีน!</strong> ลด 31% โค้ด <strong>SPOOKY31</strong>
              </span>
            </span>
          ) : (
            <>
              <span className="announcement-text-desktop" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={13} color="#F43F5E" /> ต้อนรับฤดูกาลใหม่! ช้อปครบ ฿500 จัดส่งฟรี | กรอกโค้ด <strong>SORA50</strong> ลดทันที ฿50
              </span>
              <span className="announcement-text-mobile" style={{ display: 'none', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={12} color="#F43F5E" /> ส่งฟรี ฿500 | โค้ด <strong>SORA50</strong> ลด ฿50
              </span>
            </>
          )}
        </span>

        {/* Trick or Treat Mini Trigger (only when Halloween mode is active) */}
        {isHalloweenMode && (
          <button
            onClick={onOpenTrickOrTreat}
            style={{
              background: 'linear-gradient(135deg, #FF6B8B 0%, #A855F7 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '9999px',
              padding: '2px 10px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 6px rgba(168, 85, 247, 0.3)',
            }}
          >
            <CutePumpkinIcon size={14} />
            <span>สุ่มโค้ดลับ</span>
          </button>
        )}

        <button
          onClick={onOpenSupabaseGuide}
          className="desktop-only"
          style={{
            background: 'rgba(255, 255, 255, 0.7)',
            border: 'none',
            borderRadius: '9999px',
            padding: '2px 8px',
            fontSize: '0.72rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            color: '#1F2937',
            fontWeight: 600,
          }}
        >
          <Database size={11} color={isConfigured ? '#10B981' : '#F59E0B'} />
          {isConfigured ? 'Supabase Live' : 'Demo Mode'}
        </button>
      </div>

      <div className="container" style={{ padding: '0.65rem 1rem', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', width: '100%' }}>
          {/* Brand Logo */}
          <a
            href="#"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none',
              position: 'relative',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '12px',
                background: isHalloweenMode
                  ? 'linear-gradient(135deg, #FFB3C6 0%, #D8B4FE 50%, #BFEFFF 100%)'
                  : 'linear-gradient(135deg, #FFD1DC 0%, #BFEFFF 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(255, 175, 190, 0.4)',
                position: 'relative',
              }}
            >
              {isHalloweenMode ? (
                <span style={{ display: 'inline-flex', animation: 'pumpkinWiggle 2s infinite ease-in-out' }}>
                  <CutePumpkinIcon size={22} />
                </span>
              ) : (
                <Sparkles size={20} color="#F43F5E" />
              )}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  className="brand-title"
                  style={{
                    fontSize: '1.45rem',
                    fontWeight: 800,
                    letterSpacing: '-0.5px',
                    whiteSpace: 'nowrap',
                    background: isHalloweenMode
                      ? 'linear-gradient(135deg, #9333EA 0%, #BE123C 50%, #0284C7 100%)'
                      : 'linear-gradient(135deg, #E11D48 0%, #BE123C 40%, #0284C7 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  SORA PINK
                </span>
                {isHalloweenMode && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      background: '#FDF4FF',
                      border: '1px solid #E9D5FF',
                      color: '#9333EA',
                      padding: '1px 7px',
                      borderRadius: '9999px',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                  >
                    <CuteGhostIcon size={13} />
                    <span>Spooky</span>
                  </span>
                )}
              </div>
              <span
                style={{
                  display: 'block',
                  fontSize: '0.62rem',
                  letterSpacing: '1.2px',
                  textTransform: 'uppercase',
                  color: '#9CA3AF',
                  marginTop: '-3px',
                }}
              >
                {isHalloweenMode ? 'Pastel Goth & Beauty Sanctuary' : 'Pastel Beauty Sanctuary'}
              </span>
            </div>
          </a>

          {/* Search Bar (Desktop) */}
          <div
            style={{
              flex: '1',
              maxWidth: '420px',
              position: 'relative',
              display: 'none',
            }}
            className="desktop-search"
          >
            <Search
              size={18}
              color="#9CA3AF"
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="ค้นหาเครื่องสำอาง, สกินแคร์, ส่วนผสม เช่น เซรั่ม, Cica..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: '2.5rem',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.9)',
                borderColor: 'rgba(255, 209, 220, 0.6)',
                fontSize: '0.88rem',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Quick Nav Links */}
          <nav
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '1.5rem',
              fontSize: '0.92rem',
              fontWeight: 500,
            }}
            className="desktop-nav"
          >
            <a href="#categories" style={{ color: '#4B5563', transition: 'color 0.2s' }}>
              หมวดหมู่สินค้า
            </a>
            <a href="#flash-sale" style={{ color: '#E11D48', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
              <Flame size={15} color="#E11D48" /> Flash Sale
            </a>
            <a href="#all-products" style={{ color: '#4B5563' }}>
              สินค้าทั้งหมด
            </a>
            <button
              onClick={onOpenSkinQuiz}
              className="btn btn-outline btn-sm"
              style={{
                borderRadius: '9999px',
                borderColor: '#BFEFFF',
                background: 'rgba(224, 244, 255, 0.5)',
                color: '#0284C7',
              }}
            >
              <Sparkles size={14} /> วิเคราะห์สภาพผิว
            </button>
          </nav>

          {/* Right Action Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
            {/* Theme Toggle Button (Light/Dark Mode) */}
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              title={isDark ? 'สลับเป็นโหมดสว่าง (Light Mode)' : 'สลับเป็นโหมดมืด (Dark Mode)'}
              aria-label="Toggle Theme"
              type="button"
            >
              {isDark ? (
                <Sun size={20} color="#FDE047" className="animate-spin-slow" />
              ) : (
                <Moon size={20} color="#6366F1" />
              )}
            </button>

            {/* Wishlist Button */}
            <button
              onClick={onOpenWishlist}
              className="btn-icon btn-ghost"
              style={{ position: 'relative' }}
              title="รายการที่ถูกใจ"
            >
              <Heart size={20} color="#E11D48" />
              {wishlistCount > 0 && (
                <span
                  key={`wishlist-${wishlistCount}`}
                  className="animate-badge-pop"
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    background: '#FF8DA8',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(255, 141, 168, 0.4)',
                  }}
                >
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="btn btn-primary btn-sm cart-btn-main"
              style={{
                position: 'relative',
                padding: '0.5rem 0.85rem',
                gap: '0.4rem',
              }}
            >
              <ShoppingBag size={18} />
              <span style={{ display: 'none' }} className="cart-text">ตะกร้า</span>
              {itemCount > 0 && (
                <span
                  key={`cart-${itemCount}`}
                  className="animate-badge-pop"
                  style={{
                    background: '#FFFFFF',
                    color: '#E11D48',
                    borderRadius: '9999px',
                    padding: '1px 7px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
                  }}
                >
                  {itemCount}
                </span>
              )}
              {itemCount > 0 && (
                <span style={{ fontSize: '0.8rem', opacity: 0.9, display: 'none' }} className="cart-total">
                  ฿{subtotal.toLocaleString()}
                </span>
              )}
            </button>

            {/* User Account / Login Button */}
            {!profile ? (
              <button
                onClick={onOpenAuth}
                className="btn btn-ghost desktop-user-menu navbar-auth-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '9999px',
                  border: '1.5px solid var(--pink-300)',
                  background: 'rgba(255, 255, 255, 0.85)',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.25s ease',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FFE4E6 0%, #FFD1DC 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#E11D48',
                  }}
                >
                  <User size={15} />
                </div>
                <span className="auth-btn-text">เข้าสู่ระบบ / สมัครสมาชิก</span>
              </button>
            ) : (
              <div style={{ position: 'relative' }} className="desktop-user-menu">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="btn-icon btn-ghost"
                  style={{
                    border: role === 'admin' ? '2px solid #0284C7' : '2px solid var(--pink-300)',
                    overflow: 'hidden',
                    width: 40,
                    height: 40,
                  }}
                >
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #FFD1DC 0%, #BFEFFF 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        color: '#BE123C',
                        fontSize: '0.9rem',
                      }}
                    >
                      {profile.full_name?.charAt(0) || 'U'}
                    </div>
                  )}
                </button>

              {userMenuOpen && (
                <div
                  className="glass-card animate-dropdown"
                  style={{
                    position: 'absolute',
                    top: '115%',
                    right: 0,
                    width: '270px',
                    padding: '0.85rem',
                    zIndex: 600,
                    boxShadow: '0 16px 36px rgba(0, 0, 0, 0.15)',
                    border: '1px solid rgba(255, 209, 220, 0.8)',
                  }}
                >
                  {/* User Profile Mini Header */}
                  <div
                    style={{
                      borderBottom: '1px solid #F3F4F6',
                      paddingBottom: '0.75rem',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #FFD1DC 0%, #BFEFFF 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          color: '#BE123C',
                        }}
                      >
                        {profile?.full_name ? profile.full_name.charAt(0) : 'U'}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                          }}
                        >
                          {profile?.full_name || 'ลูกค้าทั่วไป'}
                        </div>
                        <span
                          className={`badge ${role === 'admin' ? 'badge-blue' : 'badge-pink'}`}
                          style={{ fontSize: '0.68rem', marginTop: '2px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          {role === 'admin' ? (
                            <><Shield size={10} /> ผู้ดูแลระบบ (Admin)</>
                          ) : (
                            <><Sparkles size={10} /> ลูกค้าสมาชิก</>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Switch Role Quick Button for Pair Programming & Testing */}
                  <div
                    style={{
                      background: '#FFF5F8',
                      border: '1px dashed #FFB8C9',
                      borderRadius: '10px',
                      padding: '0.6rem',
                      marginBottom: '0.75rem',
                      fontSize: '0.8rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#4B5563' }}>สลับโหมดทดสอบ:</span>
                      <button
                        onClick={() => toggleRole()}
                        className="btn btn-sm"
                        style={{
                          background: role === 'admin' ? '#FFD1DC' : '#BFEFFF',
                          color: role === 'admin' ? '#9F1239' : '#0369A1',
                          padding: '0.2rem 0.6rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        {role === 'admin' ? 'สลับเป็น ลูกค้า' : 'สลับเป็น แอดมิน'}
                      </button>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {role === 'admin' && (
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onOpenAdmin();
                        }}
                        className="btn btn-ghost"
                        style={{
                          justifyContent: 'flex-start',
                          padding: '0.5rem 0.75rem',
                          color: '#0284C7',
                          fontWeight: 600,
                          fontSize: '0.88rem',
                        }}
                      >
                        <Shield size={16} /> ระบบหลังบ้าน (Admin Dashboard)
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenProfile();
                      }}
                      className="btn btn-ghost"
                      style={{
                        justifyContent: 'flex-start',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.88rem',
                      }}
                    >
                      <Package size={16} /> คำสั่งซื้อและโปรไฟล์
                    </button>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenSupabaseGuide();
                      }}
                      className="btn btn-ghost"
                      style={{
                        justifyContent: 'flex-start',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.88rem',
                        color: isConfigured ? '#059669' : '#D97706',
                      }}
                    >
                      <Database size={16} /> การตั้งค่า Supabase
                    </button>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        if (profile) {
                          logout();
                        } else {
                          onOpenAuth();
                        }
                      }}
                      className="btn btn-ghost"
                      style={{
                        justifyContent: 'flex-start',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.88rem',
                        color: '#EF4444',
                      }}
                    >
                      <LogOut size={16} /> {profile ? 'ออกจากระบบ' : 'เข้าสู่ระบบ'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn-icon btn-ghost mobile-menu-btn"
              style={{ display: 'none' }}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mobile-search" style={{ marginTop: '0.75rem', display: 'none' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              color="#9CA3AF"
              style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="ค้นหาเครื่องสำอาง, สกินแคร์, ส่วนผสม..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: '2.3rem',
                borderRadius: '9999px',
                fontSize: '0.85rem',
              }}
            />
          </div>
        </div>

        {/* Mobile Slide-down Navigation Drawer */}
        {mobileMenuOpen && (
          <>
            <div
              className="mobile-drawer-backdrop"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                top: '110px',
                background: 'rgba(15, 23, 42, 0.45)',
                backdropFilter: 'blur(4px)',
                zIndex: 550,
              }}
            />
            <div
              className="mobile-nav-drawer animate-dropdown"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: '#FFFFFF',
                borderBottom: '2px solid rgba(255, 209, 220, 0.8)',
                boxShadow: '0 20px 35px rgba(0, 0, 0, 0.15)',
                padding: '1.25rem',
                zIndex: 560,
                maxHeight: '75vh',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              {/* Quick Links */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <a
                  href="#all-products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-ghost"
                  style={{ justifyContent: 'flex-start', fontSize: '0.95rem', fontWeight: 600, padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Sparkles size={16} color="#F43F5E" />
                  <span>สินค้าทั้งหมด</span>
                </a>
                <a
                  href="#flash-sale"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-ghost"
                  style={{ justifyContent: 'flex-start', fontSize: '0.95rem', fontWeight: 600, color: '#E11D48', padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Flame size={16} color="#E11D48" />
                  <span>Flash Sale ดีลเด็ด</span>
                </a>
                <a
                  href="#categories"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-ghost"
                  style={{ justifyContent: 'flex-start', fontSize: '0.95rem', fontWeight: 600, padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Layers size={16} color="#0284C7" />
                  <span>หมวดหมู่สินค้า</span>
                </a>
                {isHalloweenMode && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenTrickOrTreat();
                    }}
                    className="btn"
                    style={{
                      justifyContent: 'flex-start',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #FDF4FF 0%, #FFE4E6 100%)',
                      border: '1.5px solid #FBCFE8',
                      color: '#9333EA',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <CutePumpkinIcon size={18} />
                    <span>สุ่มโค้ดลับ Trick or Treat</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenSkinQuiz();
                  }}
                  className="btn btn-outline"
                  style={{
                    justifyContent: 'flex-start',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    borderColor: '#BFEFFF',
                    background: 'rgba(224, 244, 255, 0.4)',
                    color: '#0284C7',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Sparkles size={16} /> เช็กสภาพผิว & ค้นหารูทีน
                </button>
              </div>

              {/* Theme Mode Switch for Mobile */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '14px',
                  background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.03)',
                  border: '1px solid var(--border-light)',
                  margin: '0.35rem 0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                  {isDark ? <Moon size={18} color="#7ED4FC" /> : <Sun size={18} color="#F59E0B" />}
                  <span>{isDark ? 'โหมดมืด (Dark Mode)' : 'โหมดสว่าง (Light Mode)'}</span>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  style={{
                    width: '46px',
                    height: '26px',
                    borderRadius: '9999px',
                    background: isDark ? 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)' : '#CBD5E1',
                    border: 'none',
                    padding: '2px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isDark ? 'flex-end' : 'flex-start',
                    transition: 'all 0.3s ease',
                    boxShadow: isDark ? '0 0 10px rgba(56, 189, 248, 0.4)' : 'none',
                  }}
                  aria-label="สลับโหมดมืด/สว่าง"
                >
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.25)',
                      transition: 'transform 0.25s ease',
                    }}
                  />
                </button>
              </div>

              {/* User Account & Links */}
              <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {profile ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0.5rem' }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#FFD1DC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#BE123C' }}>
                        {profile.full_name?.charAt(0) || 'U'}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{profile.full_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#9CA3AF', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                          {role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'สมาชิกระดับพรีเมียม'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenProfile();
                      }}
                      className="btn btn-ghost"
                      style={{ justifyContent: 'flex-start', padding: '0.55rem 0.75rem', fontSize: '0.88rem' }}
                    >
                      <Package size={16} /> คำสั่งซื้อและโปรไฟล์
                    </button>
                    {role === 'admin' && (
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onOpenAdmin();
                        }}
                        className="btn btn-ghost"
                        style={{ justifyContent: 'flex-start', padding: '0.55rem 0.75rem', fontSize: '0.88rem', color: '#0284C7' }}
                      >
                        <Shield size={16} /> แดชบอร์ดผู้ดูแลระบบ
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="btn btn-ghost"
                      style={{ justifyContent: 'flex-start', padding: '0.55rem 0.75rem', fontSize: '0.88rem', color: '#EF4444' }}
                    >
                      <LogOut size={16} /> ออกจากระบบ
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth();
                    }}
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '0.65rem' }}
                  >
                    <User size={16} /> เข้าสู่ระบบ / สมัครสมาชิก
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @media (min-width: 868px) {
          .desktop-search { display: block !important; }
          .desktop-nav { display: flex !important; }
          .cart-text, .cart-total { display: inline !important; }
        }
        @media (max-width: 867px) {
          .mobile-search { display: block !important; }
          .mobile-menu-btn { display: inline-flex !important; }
          .desktop-user-menu { display: none !important; }
          .desktop-only { display: none !important; }
          .announcement-text-desktop { display: none !important; }
          .announcement-text-mobile { display: inline !important; }
        }
        @media (max-width: 1100px) {
          .auth-btn-text { display: none !important; }
        }
        @media (max-width: 640px) {
          .brand-title { font-size: 1.25rem !important; }
        }
      `}</style>
    </header>
  );
};
