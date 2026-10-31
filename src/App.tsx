import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ThemeProvider } from './context/ThemeContext';

import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroBanner } from './components/home/HeroBanner';
import { BrandTrustBadges } from './components/home/BrandTrustBadges';
import { CategoryGrid } from './components/home/CategoryGrid';
import { FlashSale } from './components/home/FlashSale';
import { ShopByRoutine } from './components/home/ShopByRoutine';
import { CustomerReviewsWall } from './components/home/CustomerReviewsWall';
import { InstagramCommunityWall } from './components/home/InstagramCommunityWall';
import { FAQSection } from './components/home/FAQSection';
import { SkinQuizModal } from './components/home/SkinQuizModal';
import { ProductCard } from './components/product/ProductCard';
import { ProductFilter } from './components/product/ProductFilter';
import { ProductDetailModal } from './components/product/ProductDetailModal';
import { QuickViewModal } from './components/product/QuickViewModal';
import { SkeletonProductCard } from './components/common/SkeletonProductCard';
import { LiveSalesNotification } from './components/common/LiveSalesNotification';
import { BeautyConciergeFloat } from './components/common/BeautyConciergeFloat';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/cart/CheckoutModal';
import { AuthModal } from './components/user/AuthModal';
import { UserProfileModal } from './components/user/UserProfileModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CouponCenterModal } from './components/common/CouponCenterModal';
import { OrderTrackingModal } from './components/common/OrderTrackingModal';
import { ToastContainer, showToast } from './components/common/Toast';
import { SpookyEffects } from './components/common/SpookyEffects';
import { CutePumpkinIcon } from './components/common/HalloweenArtwork';
import { TrickOrTreatModal } from './components/home/TrickOrTreatModal';
import { getActiveSeasonalFestival } from './utils/seasonalTheme';

import { fetchProducts, fetchCategories } from './services/api';
import type { Product, Category, FilterState, Order } from './types';
import { Sparkles, PackageSearch, Star } from 'lucide-react';

const initialFilters: FilterState = {
  searchQuery: '',
  categoryId: '',
  priceRange: [0, 1500],
  skinTypes: [],
  skinConcerns: [],
  minRating: 0,
  sortBy: 'featured',
};

const MainStore: React.FC = () => {
  const { profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // Modals & Panels State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileTab, setProfileTab] = useState<'orders' | 'profile' | 'wishlist'>('orders');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSkinQuizOpen, setIsSkinQuizOpen] = useState(false);
  const [isCouponCenterOpen, setIsCouponCenterOpen] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(24);

  // Allow store owner to open admin panel via URL hash #admin
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#admin') {
        setIsAdminOpen(true);
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Automated Seasonal Festival Engine (7 days before to 7 days after)
  const activeSeasonalFestival = useMemo(() => getActiveSeasonalFestival(), []);
  const isHalloweenMode = activeSeasonalFestival?.id === 'halloween';
  const [isTrickOrTreatOpen, setIsTrickOrTreatOpen] = useState(false);

  // Active showcase tab: 'all' | 'best_seller' | 'new_arrival' | 'halloween'
  const [showcaseTab, setShowcaseTab] = useState<'all' | 'best_seller' | 'new_arrival' | 'halloween'>('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([fetchProducts(), fetchCategories()]);
      setProducts(prods);
      setCategories(cats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setVisibleCount(24);
  }, [filters, showcaseTab]);

  // Filter and Sort Engine
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Search query (name, ingredients, description)
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesIngr = p.ingredients.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesIngr) return false;
      }

      // 2. Category
      if (filters.categoryId && p.category_id !== filters.categoryId) {
        return false;
      }

      // 3. Price Range
      const effectivePrice = p.discount_price ?? p.price;
      if (effectivePrice < filters.priceRange[0] || effectivePrice > filters.priceRange[1]) {
        return false;
      }

      // 4. Rating
      if (filters.minRating > 0 && (p.rating || 5) < filters.minRating) {
        return false;
      }

      // 5. Skin Types filter (Smart Beauty Filter)
      if (filters.skinTypes.length > 0) {
        const matchesSkin = filters.skinTypes.some((st) =>
          p.skin_types.includes(st) || p.skin_types.includes('ทุกสภาพผิว')
        );
        if (!matchesSkin) return false;
      }

      // 6. Skin Concerns filter
      if (filters.skinConcerns.length > 0) {
        const matchesConcern = filters.skinConcerns.some((sc) =>
          p.skin_concerns.includes(sc)
        );
        if (!matchesConcern) return false;
      }

      // 7. Showcase Tab filter
      if (
        showcaseTab === 'halloween' &&
        !(
          p.name.includes('Spooky') ||
          p.name.includes('Pumpkin') ||
          p.name.includes('Halloween') ||
          p.name.toLowerCase().includes('ghost')
        )
      ) {
        return false;
      }
      if (showcaseTab === 'best_seller' && (p.review_count || 0) < 60) {
        return false;
      }
      if (showcaseTab === 'new_arrival' && (p.price < 500 && !p.discount_price)) {
        // demo condition for new arrival
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price_asc') {
        const priceA = a.discount_price ?? a.price;
        const priceB = b.discount_price ?? b.price;
        return priceA - priceB;
      }
      if (filters.sortBy === 'price_desc') {
        const priceA = a.discount_price ?? a.price;
        const priceB = b.discount_price ?? b.price;
        return priceB - priceA;
      }
      if (filters.sortBy === 'rating') {
        return (b.rating || 5) - (a.rating || 5);
      }
      return 0; // featured default
    });
  }, [products, filters, showcaseTab]);

  const handleUpdateFilter = (updated: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  const handleApplyRoutineQuiz = (skinType: string, concern: string) => {
    setFilters({
      ...initialFilters,
      skinTypes: [skinType],
      skinConcerns: [concern],
    });
    showToast(`กรองตามรูทีน: ${skinType} + ${concern} เรียบร้อยแล้ว`, 'success');
    const el = document.getElementById('all-products');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOrderSuccess = (_order: Order) => {
    void _order;
    loadData(); // reload product stock
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Alert Container */}
      <ToastContainer />

      {/* Navigation Header */}
      <Navbar
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => {
          setProfileTab('wishlist');
          setIsProfileOpen(true);
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => {
          if (!profile) {
            setIsAuthOpen(true);
            showToast('กรุณาเข้าสู่ระบบด้วย Google หรืออีเมล เพื่อดูโปรไฟล์ค่ะ', 'info');
            return;
          }
          setProfileTab('orders');
          setIsProfileOpen(true);
        }}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenCouponCenter={() => setIsCouponCenterOpen(true)}
        onOpenSkinQuiz={() => setIsSkinQuizOpen(true)}
        onOpenTrickOrTreat={() => setIsTrickOrTreatOpen(true)}
        isHalloweenMode={isHalloweenMode}
        searchQuery={filters.searchQuery}
        onSearchChange={(q) => handleUpdateFilter({ searchQuery: q })}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {/* Hero Banner Carousel */}
        <HeroBanner
          onShopNow={() => {
            const el = document.getElementById('all-products');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenSkinQuiz={() => setIsSkinQuizOpen(true)}
          isHalloweenMode={isHalloweenMode}
        />

        {/* 1. Brand Trust & Safety Badges */}
        <BrandTrustBadges />

        {/* 4 Primary Categories Grid */}
        <CategoryGrid
          categories={categories}
          selectedCategory={filters.categoryId}
          onSelectCategory={(catId) => {
            handleUpdateFilter({ categoryId: catId });
            const el = document.getElementById('all-products');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Flash Sale Section */}
        <FlashSale
          products={products}
          onSelectProduct={(p) => setSelectedProduct(p)}
        />

        {/* 2. Shop by Routine / Bundle Deals */}
        <ShopByRoutine
          products={products}
          onSelectProduct={(p) => setSelectedProduct(p)}
        />

        {/* All Products Showcase with Smart Filters */}
        <section id="all-products" style={{ padding: '3rem 0 4rem 0' }}>
          <div className="container">
            {/* Section Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: '#F43F5E',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '0.4rem',
                }}
              >
                <Sparkles size={16} /> คอลเลกชันความงามพรีเมียม
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>เลือกสรรสินค้าเพื่อคุณ</h2>
              <p style={{ color: '#6B7280', fontSize: '0.95rem' }}>
                ปลอดภัยสำหรับผิวบอบบางแพ้ง่าย พร้อมส่วนผสมคุณภาพสูงที่ผ่านการรับรอง
              </p>

              {/* Showcase Sub-tabs: ทั้งหมด, สินค้าขายดี, สินค้ามาใหม่ */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  maxWidth: '100%',
                  marginTop: '1.25rem',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    background: 'rgba(255, 255, 255, 0.85)',
                    padding: '4px',
                    borderRadius: '9999px',
                    boxShadow: '0 2px 10px rgba(255, 175, 190, 0.2)',
                    border: '1px solid rgba(255, 209, 220, 0.6)',
                    maxWidth: '100%',
                    overflowX: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <button
                    onClick={() => setShowcaseTab('all')}
                    className={`btn btn-sm ${showcaseTab === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ borderRadius: '9999px', fontSize: '0.85rem', flexShrink: 0 }}
                  >
                    ทั้งหมด ({products.length})
                  </button>
                  <button
                    onClick={() => setShowcaseTab('best_seller')}
                    className={`btn btn-sm ${showcaseTab === 'best_seller' ? 'btn-primary' : 'btn-ghost'}`}
                    style={{
                      borderRadius: '9999px',
                      fontSize: '0.85rem',
                      flexShrink: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <Star size={14} fill="#F59E0B" color="#F59E0B" /> สินค้าขายดี
                  </button>
                  <button
                    onClick={() => setShowcaseTab('new_arrival')}
                    className={`btn btn-sm ${showcaseTab === 'new_arrival' ? 'btn-primary' : 'btn-ghost'}`}
                    style={{
                      borderRadius: '9999px',
                      fontSize: '0.85rem',
                      flexShrink: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <Sparkles size={14} color="#F43F5E" /> สินค้ามาใหม่
                  </button>
                  {isHalloweenMode && (
                    <button
                      onClick={() => setShowcaseTab('halloween')}
                      className={`btn btn-sm ${showcaseTab === 'halloween' ? 'btn-primary' : 'btn-ghost'}`}
                      style={{
                        borderRadius: '9999px',
                        fontSize: '0.85rem',
                        background: showcaseTab === 'halloween' ? 'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)' : 'transparent',
                        color: showcaseTab === 'halloween' ? '#fff' : '#7E22CE',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        flexShrink: 0,
                      }}
                    >
                      <CutePumpkinIcon size={15} /> ฮาโลวีน
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Smart Search & Filter Box */}
            <ProductFilter
              categories={categories}
              filters={filters}
              onFilterChange={handleUpdateFilter}
              onResetFilters={handleResetFilters}
              totalResults={filteredProducts.length}
            />

            {/* Products Grid */}
            {loading ? (
              <div className="products-grid">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonProductCard key={i} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div
                className="glass-card"
                style={{
                  textAlign: 'center',
                  padding: '4rem 2rem',
                  borderRadius: '24px',
                  background: '#FFFFFF',
                }}
              >
                <PackageSearch size={54} color="#FF8DA8" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1F2937', marginBottom: '0.5rem' }}>
                  ไม่พบสินค้าที่ตรงกับเงื่อนไขการค้นหา
                </h3>
                <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  ลองปรับเปลี่ยนตัวกรองสภาพผิว หรือล้างตัวกรองเพื่อดูสินค้าทั้งหมด
                </p>
                <button onClick={handleResetFilters} className="btn btn-outline">
                  ล้างตัวกรองทั้งหมด
                </button>
              </div>
            ) : (
              <>
                <div
                  key={showcaseTab}
                  className="animate-pop products-grid"
                >
                  {filteredProducts.slice(0, visibleCount).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onClick={() => setSelectedProduct(product)}
                      onQuickView={(p) => setQuickViewProduct(p)}
                    />
                  ))}
                </div>

                {/* Load More & Catalog Progress */}
                {filteredProducts.length > visibleCount && (
                  <div
                    style={{
                      textAlign: 'center',
                      marginTop: '3rem',
                      padding: '2rem 1.5rem',
                      background: 'rgba(255, 240, 243, 0.45)',
                      borderRadius: '24px',
                      border: '1px solid rgba(255, 209, 220, 0.6)',
                      maxWidth: '560px',
                      marginLeft: 'auto',
                      marginRight: 'auto',
                    }}
                  >
                    <div style={{ marginBottom: '0.85rem' }}>
                      <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        กำลังแสดง <strong>{Math.min(visibleCount, filteredProducts.length)}</strong> จากทั้งหมด <strong>{filteredProducts.length}</strong> รายการ
                      </span>
                      {/* Progress bar */}
                      <div
                        style={{
                          height: '6px',
                          background: 'rgba(0, 0, 0, 0.08)',
                          borderRadius: '9999px',
                          overflow: 'hidden',
                          marginTop: '0.5rem',
                          maxWidth: '280px',
                          marginLeft: 'auto',
                          marginRight: 'auto',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${(Math.min(visibleCount, filteredProducts.length) / filteredProducts.length) * 100}%`,
                            background: 'linear-gradient(90deg, #F43F5E 0%, #EC4899 100%)',
                            borderRadius: '9999px',
                            transition: 'width 0.4s ease',
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => setVisibleCount((prev) => prev + 24)}
                        className="btn btn-primary"
                        style={{
                          borderRadius: '9999px',
                          padding: '0.65rem 1.5rem',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          boxShadow: '0 4px 14px rgba(244, 63, 94, 0.3)',
                        }}
                      >
                        โหลดสินค้าเพิ่มเติม (+24 ชิ้น)
                      </button>
                      <button
                        onClick={() => setVisibleCount(filteredProducts.length)}
                        className="btn btn-outline"
                        style={{
                          borderRadius: '9999px',
                          padding: '0.65rem 1.25rem',
                          fontWeight: 600,
                          fontSize: '0.88rem',
                        }}
                      >
                        แสดงทั้งหมด ({filteredProducts.length})
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* 3. Real Customer Reviews & Social Proof Wall */}
        <CustomerReviewsWall />

        {/* 4. Instagram / Community Aesthetics Wall */}
        <InstagramCommunityWall
          products={products}
          onSelectProduct={(p) => setSelectedProduct(p)}
        />

        {/* 5. Interactive FAQ Accordion */}
        <FAQSection onOpenSkinQuiz={() => setIsSkinQuizOpen(true)} />
      </main>

      {/* Brand Footer */}
      <Footer onOpenAdmin={() => setIsAdminOpen(true)} />

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onOpenFullDetail={(p) => setSelectedProduct(p)}
      />

      {/* Floating Concierge & Live Sales Social Proof Toast */}
      <LiveSalesNotification
        products={products}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      <BeautyConciergeFloat
        onOpenSkinQuiz={() => setIsSkinQuizOpen(true)}
        onOpenProfile={() => {
          setProfileTab('orders');
          setIsProfileOpen(true);
        }}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOpenCouponCenter={() => setIsCouponCenterOpen(true)}
        onCheckout={() => {
          setIsCartOpen(false);
          if (!profile) {
            setPendingCheckout(true);
            setIsAuthOpen(true);
            showToast('กรุณาเข้าสู่ระบบด้วย Google หรืออีเมล เพื่อดำเนินการสั่งซื้อสินค้าค่ะ', 'info');
          } else {
            setIsCheckoutOpen(true);
          }
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          setPendingCheckout(false);
        }}
        onSuccess={() => {
          if (pendingCheckout) {
            setPendingCheckout(false);
            setIsCheckoutOpen(true);
          }
        }}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        initialTab={profileTab}
        onSelectProduct={(p) => setSelectedProduct(p)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onTrackOrder={(o) => setTrackingOrder(o)}
      />

      <CouponCenterModal
        isOpen={isCouponCenterOpen}
        onClose={() => setIsCouponCenterOpen(false)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <OrderTrackingModal
        order={trackingOrder}
        onClose={() => setTrackingOrder(null)}
      />

      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        categories={categories}
        onRefreshProducts={loadData}
      />

      <SkinQuizModal
        isOpen={isSkinQuizOpen}
        onClose={() => setIsSkinQuizOpen(false)}
        onApplyRoutine={handleApplyRoutineQuiz}
      />

      {/* Halloween Ambient & Interactive Widgets */}
      <SpookyEffects
        onOpenTrickOrTreat={() => setIsTrickOrTreatOpen(true)}
        isHalloweenMode={isHalloweenMode}
      />

      <TrickOrTreatModal
        isOpen={isTrickOrTreatOpen}
        onClose={() => setIsTrickOrTreatOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <MainStore />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
