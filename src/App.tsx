import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ThemeProvider } from './context/ThemeContext';

import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroBanner } from './components/home/HeroBanner';
import { CategoryGrid } from './components/home/CategoryGrid';
import { FlashSale } from './components/home/FlashSale';
import { SkinQuizModal } from './components/home/SkinQuizModal';
import { ProductCard } from './components/product/ProductCard';
import { ProductFilter } from './components/product/ProductFilter';
import { ProductDetailModal } from './components/product/ProductDetailModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/cart/CheckoutModal';
import { AuthModal } from './components/user/AuthModal';
import { UserProfileModal } from './components/user/UserProfileModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SupabaseGuideModal } from './components/common/SupabaseGuideModal';
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
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileTab, setProfileTab] = useState<'orders' | 'profile' | 'wishlist'>('orders');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSupabaseGuideOpen, setIsSupabaseGuideOpen] = useState(false);
  const [isSkinQuizOpen, setIsSkinQuizOpen] = useState(false);

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
        onOpenSupabaseGuide={() => setIsSupabaseGuideOpen(true)}
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
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#9CA3AF' }}>
                <p>กำลังโหลดสินค้า...</p>
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
              <div
                key={showcaseTab}
                className="animate-pop products-grid"
              >
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => setSelectedProduct(product)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Brand Footer */}
      <Footer />

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
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
      />

      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        categories={categories}
        onRefreshProducts={loadData}
      />

      <SupabaseGuideModal
        isOpen={isSupabaseGuideOpen}
        onClose={() => setIsSupabaseGuideOpen(false)}
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
