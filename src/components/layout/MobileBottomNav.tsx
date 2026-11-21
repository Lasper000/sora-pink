import React from 'react';
import { Home, LayoutGrid, Ticket, ShoppingBag, User } from 'lucide-react';

interface MobileBottomNavProps {
  itemCount: number;
  currentSection?: string;
  onOpenCart: () => void;
  onOpenCouponCenter: () => void;
  onOpenProfile: () => void;
  onNavigateSection: (id?: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  itemCount,
  currentSection = 'home',
  onOpenCart,
  onOpenCouponCenter,
  onOpenProfile,
  onNavigateSection,
}) => {
  return (
    <nav className="mobile-bottom-nav" aria-label="เมนูหลักบนมือถือ">
      <button
        type="button"
        onClick={() => onNavigateSection(undefined)}
        className={`mobile-bottom-nav-btn ${currentSection === 'home' ? 'is-active' : ''}`}
      >
        <Home size={20} strokeWidth={currentSection === 'home' ? 2.4 : 1.9} />
        <span>หน้าแรก</span>
      </button>

      <button
        type="button"
        onClick={() => onNavigateSection('categories')}
        className={`mobile-bottom-nav-btn ${currentSection === 'categories' ? 'is-active' : ''}`}
      >
        <LayoutGrid size={20} strokeWidth={currentSection === 'categories' ? 2.4 : 1.9} />
        <span>หมวดหมู่</span>
      </button>

      <button
        type="button"
        onClick={onOpenCouponCenter}
        className="mobile-bottom-nav-btn"
      >
        <Ticket size={20} strokeWidth={2} />
        <span>คูปอง</span>
      </button>

      <button
        type="button"
        onClick={onOpenCart}
        className="mobile-bottom-nav-btn"
        style={{ position: 'relative' }}
      >
        <div style={{ position: 'relative', display: 'inline-flex' }}>
          <ShoppingBag size={20} strokeWidth={2} />
          {itemCount > 0 && (
            <span className="mobile-bottom-nav-badge">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          )}
        </div>
        <span>ตะกร้า</span>
      </button>

      <button
        type="button"
        onClick={onOpenProfile}
        className={`mobile-bottom-nav-btn ${currentSection === 'member' ? 'is-active' : ''}`}
      >
        <User size={20} strokeWidth={currentSection === 'member' ? 2.4 : 2} />
        <span>สมาชิก</span>
      </button>
    </nav>
  );
};
