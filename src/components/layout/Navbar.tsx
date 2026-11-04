import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingBag,
  Heart,
  Search,
  User,
  Shield,
  Sparkles,
  Menu,
  X,
  LogOut,
  Package,
  Flame,
  Layers,
  Sun,
  Moon,
  Ticket,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';
import { CutePumpkinIcon, CuteGhostIcon } from '../common/HalloweenArtwork';
import { handleImageError } from '../../utils/imageFallback';
import type { Product } from '../../types';

interface NavbarProps {
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenAdmin: () => void;
  onOpenCouponCenter?: () => void;
  onOpenSkinQuiz: () => void;
  onOpenTrickOrTreat: () => void;
  isHalloweenMode: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onCategorySelect?: (catId: string) => void;
  products?: Product[];
  onSelectProduct?: (product: Product) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCart,
  onOpenWishlist,
  onOpenAuth,
  onOpenProfile,
  onOpenAdmin,
  onOpenCouponCenter,
  onOpenSkinQuiz,
  onOpenTrickOrTreat,
  isHalloweenMode,
  searchQuery,
  onSearchChange,
  products = [],
  onSelectProduct,
}) => {
  const { profile, role, logout } = useAuth();
  const { itemCount, subtotal } = useCart();
  const { wishlistCount } = useWishlist();
  const { isDark, toggleTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);

  const scrollToProducts = () => {
    const el = document.getElementById('all-products');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setIsSearchFocused(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideDesktop = searchContainerRef.current?.contains(target);
      const insideMobile = mobileSearchContainerRef.current?.contains(target);
      if (!insideDesktop && !insideMobile) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cleanQ = searchQuery.toLowerCase().trim();
  const searchResults = cleanQ
    ? products.filter((p) => {
        return (
          p.name.toLowerCase().includes(cleanQ) ||
          p.description.toLowerCase().includes(cleanQ) ||
          p.ingredients.toLowerCase().includes(cleanQ) ||
          p.skin_types.some((st) => st.toLowerCase().includes(cleanQ)) ||
          p.skin_concerns.some((sc) => sc.toLowerCase().includes(cleanQ))
        );
      })
    : [];

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

        {onOpenCouponCenter && (
          <button
            onClick={onOpenCouponCenter}
            className="desktop-only"
            style={{
              background: 'linear-gradient(135deg, #FFE4E6 0%, #FFD1DC 100%)',
              color: '#BE123C',
              border: '1px solid #FECDD3',
              borderRadius: '9999px',
              padding: '2px 9px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              marginLeft: '6px',
              boxShadow: '0 2px 6px rgba(225, 29, 72, 0.12)',
            }}
          >
            <Ticket size={12} color="#E11D48" />
            <span>เก็บคูปองส่วนลด</span>
          </button>
        )}
      </div>

      <div className="navbar-container" style={{ padding: '0.65rem 1.5rem', width: '100%', maxWidth: '1440px', margin: '0 auto', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem', width: '100%' }}>
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
                    className="brand-spooky-badge"
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
                className="brand-subtitle"
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

          {/* Quick Nav Links (Center) */}
          <nav
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '1.5rem',
              fontSize: '0.92rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
            className="desktop-nav"
          >
            <a
              href="#categories"
              style={{ color: 'var(--text-secondary)', transition: 'color 0.2s', textDecoration: 'none', whiteSpace: 'nowrap' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#E11D48')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              หมวดหมู่สินค้า
            </a>
            <a
              href="#flash-sale"
              style={{
                color: '#E11D48',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: 700,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              <Flame size={15} color="#E11D48" /> <span>Flash Sale</span>
            </a>
            <a
              href="#all-products"
              style={{ color: 'var(--text-secondary)', transition: 'color 0.2s', textDecoration: 'none', whiteSpace: 'nowrap' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#E11D48')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              สินค้าทั้งหมด
            </a>
            <button
              onClick={onOpenSkinQuiz}
              className="btn btn-outline btn-sm nav-quiz-btn"
              style={{
                borderRadius: '9999px',
                borderColor: '#BFEFFF',
                background: 'rgba(224, 244, 255, 0.55)',
                color: '#0284C7',
                padding: '0.35rem 0.85rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Sparkles size={14} /> วิเคราะห์สภาพผิว
            </button>
          </nav>

          {/* Right Action Icons & Search */}
          <div className="navbar-right-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexShrink: 0 }}>
            {/* Search Bar (Desktop) */}
            <div
              ref={searchContainerRef}
              style={{
                width: isSearchFocused ? '260px' : '210px',
                position: 'relative',
                display: 'none',
                transition: 'width 0.25s ease',
              }}
              className="desktop-search"
            >
              <Search
                size={16}
                color={isSearchFocused ? '#E11D48' : '#9CA3AF'}
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', transition: 'color 0.2s' }}
              />
              <input
                type="text"
                placeholder="ค้นหาสินค้า, สกินแคร์..."
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setIsSearchFocused(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    scrollToProducts();
                  }
                }}
                className="desktop-search-input"
                style={{
                  width: '100%',
                  paddingLeft: '2.3rem',
                  paddingRight: searchQuery ? '2rem' : '0.85rem',
                  paddingTop: '0.45rem',
                  paddingBottom: '0.45rem',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: isSearchFocused ? '1.5px solid #F43F5E' : '1.5px solid rgba(255, 209, 220, 0.8)',
                  boxShadow: isSearchFocused ? '0 0 0 3px rgba(244, 63, 94, 0.15)' : 'none',
                  fontSize: '0.84rem',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'all 0.25s ease',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    onSearchChange('');
                    setIsSearchFocused(false);
                  }}
                  style={{
                    position: 'absolute',
                    right: '0.65rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#9CA3AF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2px',
                  }}
                  title="ล้างข้อความค้นหา"
                >
                  <X size={14} />
                </button>
              )}

              {/* Desktop Live Search Dropdown */}
              {isSearchFocused && cleanQ.length > 0 && (
                <div
                  className="live-search-dropdown animate-pop"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '360px',
                    background: '#FFFFFF',
                    borderRadius: '18px',
                    boxShadow: '0 18px 45px rgba(0, 0, 0, 0.18), 0 0 20px rgba(255, 141, 168, 0.15)',
                    border: '1.5px solid rgba(255, 209, 220, 0.85)',
                    zIndex: 1200,
                    overflow: 'hidden',
                    padding: '0.65rem',
                  }}
                >
                  <div
                    style={{
                      padding: '0.35rem 0.5rem 0.5rem',
                      fontSize: '0.76rem',
                      color: '#6B7280',
                      fontWeight: 600,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid #F3F4F6',
                      marginBottom: '0.4rem',
                    }}
                  >
                    <span>ผลการค้นหา ({searchResults.length} ชิ้น)</span>
                    {searchResults.length > 0 && (
                      <span
                        onClick={scrollToProducts}
                        style={{ color: '#E11D48', cursor: 'pointer', fontWeight: 700 }}
                      >
                        ดูผลลัพธ์ทั้งหมด
                      </span>
                    )}
                  </div>

                  {searchResults.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '310px', overflowY: 'auto' }}>
                      {searchResults.slice(0, 5).map((prod) => (
                        <div
                          key={prod.id}
                          onClick={() => {
                            if (onSelectProduct) {
                              onSelectProduct(prod);
                              setIsSearchFocused(false);
                            }
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.65rem',
                            padding: '0.45rem 0.6rem',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'background 0.15s ease',
                          }}
                          className="search-result-row"
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#FFF5F8')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <img
                            src={prod.images[0]}
                            alt={prod.name}
                            onError={handleImageError}
                            style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {prod.name}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#E11D48' }}>
                                ฿{(prod.discount_price || prod.price).toLocaleString()}
                              </span>
                              {prod.discount_price && (
                                <span style={{ fontSize: '0.72rem', color: '#9CA3AF', textDecoration: 'line-through' }}>
                                  ฿{prod.price.toLocaleString()}
                                </span>
                              )}
                              {prod.stock_quantity <= 0 ? (
                                <span style={{ fontSize: '0.68rem', color: '#DC2626', background: '#FEE2E2', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, marginLeft: 'auto' }}>
                                  สินค้าหมด
                                </span>
                              ) : prod.stock_quantity <= 5 ? (
                                <span style={{ fontSize: '0.68rem', color: '#B45309', background: '#FEF3C7', padding: '1px 6px', borderRadius: '4px', fontWeight: 600, marginLeft: 'auto' }}>
                                  เหลือ {prod.stock_quantity} ชิ้น
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.68rem', color: '#059669', background: '#ECFDF5', padding: '1px 6px', borderRadius: '4px', fontWeight: 600, marginLeft: 'auto' }}>
                                  คงเหลือ {prod.stock_quantity}
                                </span>
                              )}
                            </div>
                          </div>
                          <ArrowRight size={14} color="#9CA3AF" />
                        </div>
                      ))}

                      {searchResults.length > 5 && (
                        <button
                          type="button"
                          onClick={scrollToProducts}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            marginTop: '0.3rem',
                            border: 'none',
                            background: 'linear-gradient(135deg, #FFE4E6 0%, #FFD1DC 100%)',
                            color: '#BE123C',
                            borderRadius: '10px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                          }}
                        >
                          ดูผลลัพธ์ทั้งหมดในร้าน ({searchResults.length} ชิ้น) <ArrowRight size={13} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div style={{ padding: '1.25rem 0.75rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        ไม่พบสินค้าที่ตรงกับ "{searchQuery}"
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '4px' }}>
                        ลองค้นหาด้วยคำอื่น เช่น เซรั่ม, ครีม, ลิป, Cica
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
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
                <span className="auth-btn-text">เข้าสู่ระบบ</span>
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
                      onError={handleImageError}
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

                    {onOpenCouponCenter && (
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onOpenCouponCenter();
                        }}
                        className="btn btn-ghost"
                        style={{
                          justifyContent: 'flex-start',
                          padding: '0.5rem 0.75rem',
                          fontSize: '0.88rem',
                          color: '#BE123C',
                          fontWeight: 600,
                        }}
                      >
                        <Ticket size={16} /> กระเป๋าคูปองส่วนลด
                      </button>
                    )}

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
        <div ref={mobileSearchContainerRef} className="mobile-search" style={{ marginTop: '0.75rem', display: 'none', position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              color={isSearchFocused ? '#E11D48' : '#9CA3AF'}
              style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', transition: 'color 0.2s' }}
            />
            <input
              type="text"
              placeholder="ค้นหาเครื่องสำอาง, สกินแคร์, ส่วนผสม..."
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setIsSearchFocused(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  scrollToProducts();
                }
              }}
              className="form-input"
              style={{
                paddingLeft: '2.3rem',
                paddingRight: searchQuery ? '2.2rem' : '1rem',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                border: isSearchFocused ? '1.5px solid #F43F5E' : '1.5px solid #E5E7EB',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  onSearchChange('');
                  setIsSearchFocused(false);
                }}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2px',
                }}
                title="ล้างข้อความค้นหา"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Mobile Live Search Dropdown */}
          {isSearchFocused && cleanQ.length > 0 && (
            <div
              className="live-search-dropdown animate-pop"
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                right: 0,
                background: '#FFFFFF',
                borderRadius: '16px',
                boxShadow: '0 14px 35px rgba(0, 0, 0, 0.18)',
                border: '1.5px solid rgba(255, 209, 220, 0.85)',
                zIndex: 1200,
                padding: '0.55rem',
                maxHeight: '340px',
                overflowY: 'auto',
              }}
            >
              <div
                style={{
                  padding: '0.3rem 0.4rem 0.4rem',
                  fontSize: '0.74rem',
                  color: '#6B7280',
                  fontWeight: 600,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #F3F4F6',
                  marginBottom: '0.35rem',
                }}
              >
                <span>ผลการค้นหา ({searchResults.length} ชิ้น)</span>
                {searchResults.length > 0 && (
                  <span
                    onClick={scrollToProducts}
                    style={{ color: '#E11D48', cursor: 'pointer', fontWeight: 700 }}
                  >
                    ดูทั้งหมด
                  </span>
                )}
              </div>

              {searchResults.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {searchResults.slice(0, 4).map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        if (onSelectProduct) {
                          onSelectProduct(prod);
                          setIsSearchFocused(false);
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.45rem 0.5rem',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        background: '#FAF5F7',
                      }}
                    >
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        onError={handleImageError}
                        style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1F2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {prod.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#E11D48' }}>
                            ฿{(prod.discount_price || prod.price).toLocaleString()}
                          </span>
                          {prod.stock_quantity <= 0 ? (
                            <span style={{ fontSize: '0.66rem', color: '#DC2626', background: '#FEE2E2', padding: '1px 5px', borderRadius: '4px', fontWeight: 700, marginLeft: 'auto' }}>
                              สินค้าหมด
                            </span>
                          ) : prod.stock_quantity <= 5 ? (
                            <span style={{ fontSize: '0.66rem', color: '#B45309', background: '#FEF3C7', padding: '1px 5px', borderRadius: '4px', fontWeight: 600, marginLeft: 'auto' }}>
                              เหลือ {prod.stock_quantity} ชิ้น
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.66rem', color: '#059669', background: '#ECFDF5', padding: '1px 5px', borderRadius: '4px', fontWeight: 600, marginLeft: 'auto' }}>
                              คงเหลือ {prod.stock_quantity}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight size={13} color="#9CA3AF" />
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={scrollToProducts}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      marginTop: '0.25rem',
                      border: 'none',
                      background: 'linear-gradient(135deg, #FFE4E6 0%, #FFD1DC 100%)',
                      color: '#BE123C',
                      borderRadius: '10px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    ดูผลลัพธ์ทั้งหมดในร้าน ({searchResults.length} ชิ้น) <ArrowRight size={13} />
                  </button>
                </div>
              ) : (
                <div style={{ padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    ไม่พบสินค้าที่ตรงกับ "{searchQuery}"
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#9CA3AF', marginTop: '3px' }}>
                    ลองค้นหาด้วยคำอื่น เช่น เซรั่ม, ครีม, ลิป
                  </div>
                </div>
              )}
            </div>
          )}
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
        .desktop-search-input:focus {
          border-color: #F43F5E !important;
          box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.15) !important;
          background: #FFFFFF !important;
        }
        @media (min-width: 992px) {
          .desktop-search { display: block !important; }
          .desktop-nav { display: flex !important; }
          .cart-text, .cart-total { display: inline !important; }
        }
        @media (max-width: 991px) {
          .mobile-search { display: block !important; }
          .mobile-menu-btn { display: inline-flex !important; }
          .desktop-user-menu { display: none !important; }
          .desktop-only { display: none !important; }
          .announcement-text-desktop { display: none !important; }
          .announcement-text-mobile { display: inline !important; }
        }
        @media (max-width: 1280px) {
          .desktop-search { width: 175px !important; }
          .desktop-nav { gap: 1rem !important; font-size: 0.88rem !important; }
          .nav-quiz-btn { padding: 0.3rem 0.7rem !important; font-size: 0.78rem !important; }
        }
        @media (max-width: 1120px) {
          .nav-quiz-btn { display: none !important; }
          .auth-btn-text { display: none !important; }
          .desktop-search { width: 155px !important; }
        }
        @media (max-width: 640px) {
          .brand-title { font-size: 1.18rem !important; }
          .brand-subtitle { display: none !important; }
          .brand-spooky-badge span { display: none !important; }
          .brand-spooky-badge { padding: 2px 4px !important; }
          .navbar-right-actions { gap: 0.35rem !important; }
          .cart-btn-main { padding: 0.42rem 0.65rem !important; }
          .theme-toggle-btn { width: 34px !important; height: 34px !important; }
        }
        @media (max-width: 380px) {
          .brand-title { font-size: 1.05rem !important; }
          .brand-spooky-badge { display: none !important; }
        }
      `}</style>
    </header>
  );
};
