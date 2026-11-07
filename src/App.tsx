import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { getActiveSeasonalFestival } from './utils/seasonalTheme';
import {
  getProductIdFromUrl,
  findProductFromList,
  setDocumentProductTitle,
  resetDocumentTitle,
} from './utils/productRouting';

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
  const { profile, role } = useAuth();
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

  // Synchronize product selection with browser address bar and history
  const handleSelectProduct = (product: Product | null, pushHistory = true) => {
    if (product) {
      setSelectedProduct(product);
      setDocumentProductTitle(product.name);
      if (pushHistory) {
        const targetPath = `/product/${product.id}`;
        // Push state only if URL isn't already pointing to this product
        if (window.location.pathname !== targetPath && !window.location.search.includes(`product=${product.id}`)) {
          window.history.pushState({ productId: product.id, isProductModal: true }, '', targetPath);
        }
      }
    } else {
      handleCloseProduct();
    }
  };

  const handleCloseProduct = () => {
    setSelectedProduct(null);
    resetDocumentTitle();
    // If the modal was opened via in-app navigation and pushed history:
    if (window.history.state?.isProductModal) {
      window.history.back();
    } else if (
      window.location.pathname.startsWith('/product') ||
      window.location.pathname.startsWith('/products') ||
      window.location.search.includes('product=')
    ) {
      // Direct landing: replace state to home route cleanly without leaving the app
      window.history.replaceState({}, '', '/');
    }
  };

  // Check URL on initial load when products finish fetching (deep link support)
  const initialUrlCheckedRef = useRef(false);
  useEffect(() => {
    if (products.length === 0 || initialUrlCheckedRef.current) return;
    initialUrlCheckedRef.current = true;

    const targetParam = getProductIdFromUrl();
    if (targetParam) {
      const matched = findProductFromList(products, targetParam);
      if (matched) {
        setSelectedProduct(matched);
        setDocumentProductTitle(matched.name);
      } else {
        showToast('ไม่พบสินค้าที่ระบุ หรือสินค้านี้อาจหมดหรือสิ้นสุดการจำหน่ายแล้ว', 'info');
        window.history.replaceState({}, '', '/');
        resetDocumentTitle();
      }
    }
  }, [products]);

  // Browser Back / Forward navigation sync (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const targetParam = getProductIdFromUrl();
      if (targetParam && products.length > 0) {
        const matched = findProductFromList(products, targetParam);
        if (matched) {
          setSelectedProduct(matched);
          setDocumentProductTitle(matched.name);
          return;
        }
      }
      setSelectedProduct(null);
      resetDocumentTitle();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [products]);

  // Allow store owner to open admin panel via URL hash #admin (Admin role required)
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#admin') {
        if (role === 'admin') {
          setIsAdminOpen(true);
        } else {
          window.location.hash = '';
          showToast('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถเข้าใช้งานได้', 'error');
        }
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, [role]);

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

  const handleOrderSuccess = (order: Order) => {
    // Immediately deduct stock in React state for instant UI updates
    setProducts((prevProducts) => {
      const updated = prevProducts.map((p) => {
        const purchased = order.items?.find((i) => i.product_id === p.id);
        if (purchased) {
          return {
            ...p,
            stock_quantity: Math.max(0, p.stock_quantity - purchased.quantity),
          };
        }
        return p;
      });

      if (selectedProduct) {
        const found = updated.find((p) => p.id === selectedProduct.id);
        if (found) setSelectedProduct(found);
      }
      if (quickViewProduct) {
        const found = updated.find((p) => p.id === quickViewProduct.id);
        if (found) setQuickViewProduct(found);
      }

      return updated;
    });

    loadData(); // reload product stock from storage/backend
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
        onOpenAdmin={() => {
          if (role === 'admin') {
            setIsAdminOpen(true);
          } else {
            showToast('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถเข้าใช้งานได้', 'error');
          }
        }}
        onOpenCouponCenter={() => setIsCouponCenterOpen(true)}
        onOpenSkinQuiz={() => setIsSkinQuizOpen(true)}
        onOpenTrickOrTreat={() => setIsTrickOrTreatOpen(true)}
        isHalloweenMode={isHalloweenMode}
        searchQuery={filters.searchQuery}
        onSearchChange={(q) => handleUpdateFilter({ searchQuery: q })}
        products={products}
        onSelectProduct={(p) => handleSelectProduct(p)}
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
          onSelectProduct={(p) => handleSelectProduct(p)}
        />

        {/* 2. Shop by Routine / Bundle Deals */}
        <ShopByRoutine
          products={products}
          onSelectProduct={(p) => handleSelectProduct(p)}
        />

        {/* All Products Showcase with Smart Filters */}
        <section id="all-products" style={{ padding: '3rem 0 4rem 0' }}>
          <div className="container">
            {/* Section Header */}
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--rose-damask, #8C2E41)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.16em',
                  marginBottom: '0.5rem',
                }}
              >
                <Sparkles size={14} /> ATELIER CURATION • CLEAN FORMULAS
              </div>
              <h2
                className="font-serif"
                style={{
                  fontSize: '2.4rem',
                  fontWeight: 600,
                  color: '#2C2224',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                  marginBottom: '0.5rem',
                }}
              >
                The Beauty Collection
              </h2>
              <p style={{ color: '#706064', fontSize: '0.95rem', maxWidth: '520px', margin: '0 auto' }}>
                พิถีพิถันในการคัดสรรส่วนผสมระดับเวชสำอาง บริสุทธิ์และอ่อนโยนต่อทุกสภาพผิว
              </p>

              {/* Showcase Sub-tabs: ทั้งหมด, สินค้าขายดี, สินค้ามาใหม่ */}
              <div
                className="showcase-tabs-container"
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  maxWidth: '100%',
                  marginTop: '1.75rem',
                  overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'none',
                  padding: '4px 0',
                }}
              >
                <div
                  className="showcase-tabs-pill"
                  style={{
                    display: 'inline-flex',
                    background: '#FFFFFF',
                    padding: '4px',
                    borderRadius: '9999px',
                    boxShadow: '0 2px 10px rgba(216, 74, 110, 0.06)',
                    border: '1px solid rgba(222, 83, 119, 0.18)',
                    maxWidth: '100%',
                    overflowX: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'none',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    gap: '4px',
                  }}
                >
                  <button
                    onClick={() => setShowcaseTab('all')}
                    className={`btn btn-sm ${showcaseTab === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                    style={{
                      borderRadius: '9999px',
                      fontSize: '0.82rem',
                      fontWeight: showcaseTab === 'all' ? 700 : 500,
                      flexShrink: 0,
                      letterSpacing: '0.02em',
                      padding: '0.45rem 1.15rem',
                    }}
                  >
                    ทั้งหมด ({products.length})
                  </button>
                  <button
                    onClick={() => setShowcaseTab('best_seller')}
                    className={`btn btn-sm ${showcaseTab === 'best_seller' ? 'btn-primary' : 'btn-ghost'}`}
                    style={{
                      borderRadius: '9999px',
                      fontSize: '0.82rem',
                      fontWeight: showcaseTab === 'best_seller' ? 700 : 500,
                      flexShrink: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      letterSpacing: '0.02em',
                      padding: '0.45rem 1.15rem',
                    }}
                  >
                    <Star size={13} fill={showcaseTab === 'best_seller' ? '#FFFFFF' : '#D97706'} color={showcaseTab === 'best_seller' ? '#FFFFFF' : '#D97706'} /> Best Sellers
                  </button>
                  <button
                    onClick={() => setShowcaseTab('new_arrival')}
                    className={`btn btn-sm ${showcaseTab === 'new_arrival' ? 'btn-primary' : 'btn-ghost'}`}
                    style={{
                      borderRadius: '9999px',
                      fontSize: '0.82rem',
                      fontWeight: showcaseTab === 'new_arrival' ? 700 : 500,
                      flexShrink: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      letterSpacing: '0.02em',
                      padding: '0.45rem 1.15rem',
                    }}
                  >
                    <Sparkles size={13} color={showcaseTab === 'new_arrival' ? '#FFFFFF' : 'var(--rose-damask, #C73D62)'} /> New Arrivals
                  </button>
                  {isHalloweenMode && (
                    <button
                      onClick={() => setShowcaseTab('halloween')}
                      className={`btn btn-sm ${showcaseTab === 'halloween' ? 'btn-primary' : 'btn-ghost'}`}
                      style={{
                        borderRadius: '9999px',
                        fontSize: '0.82rem',
                        fontWeight: showcaseTab === 'halloween' ? 700 : 500,
                        background: showcaseTab === 'halloween' ? 'linear-gradient(135deg, #DF5E7E 0%, #C73D62 100%)' : 'transparent',
                        color: showcaseTab === 'halloween' ? '#FFFFFF' : '#706064',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        flexShrink: 0,
                        padding: '0.45rem 1.15rem',
                      }}
                    >
                      <CutePumpkinIcon size={14} /> Festive Edition
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
                      onClick={() => handleSelectProduct(product)}
                      onQuickView={(p) => setQuickViewProduct(p)}
                    />
                  ))}
                </div>

                {/* Load More & Catalog Progress */}
                {filteredProducts.length > visibleCount && (
                  <div
                    style={{
                      textAlign: 'center',
                      marginTop: '3.5rem',
                      padding: '2rem 1.5rem',
                      background: '#FFFFFF',
                      borderRadius: '24px',
                      border: '1px solid rgba(222, 83, 119, 0.16)',
                      boxShadow: '0 4px 20px rgba(216, 74, 110, 0.05)',
                      maxWidth: '520px',
                      marginLeft: 'auto',
                      marginRight: 'auto',
                    }}
                  >
                    <div style={{ marginBottom: '1.25rem' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 500, color: '#706064', letterSpacing: '0.04em' }}>
                        กำลังแสดง <strong style={{ color: '#C73D62' }}>{Math.min(visibleCount, filteredProducts.length)}</strong> จากทั้งหมด <strong style={{ color: '#2C2224' }}>{filteredProducts.length}</strong> รายการ
                      </span>
                      {/* Refined Hairline Progress bar */}
                      <div
                        style={{
                          height: '3px',
                          background: '#FEECEF',
                          borderRadius: '2px',
                          overflow: 'hidden',
                          marginTop: '0.75rem',
                          maxWidth: '240px',
                          marginLeft: 'auto',
                          marginRight: 'auto',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${(Math.min(visibleCount, filteredProducts.length) / filteredProducts.length) * 100}%`,
                            background: 'linear-gradient(90deg, #F48BA5 0%, #DF5E7E 100%)',
                            borderRadius: '2px',
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
                          padding: '0.65rem 1.65rem',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          letterSpacing: '0.02em',
                        }}
                      >
                        โหลดสินค้าเพิ่มเติม (+24 ชิ้น)
                      </button>
                      <button
                        onClick={() => setVisibleCount(filteredProducts.length)}
                        className="btn btn-outline"
                        style={{
                          borderRadius: '9999px',
                          padding: '0.65rem 1.45rem',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          letterSpacing: '0.02em',
                        }}
                      >
                        แสดงทั้งหมด
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* 4. Real Customer Reviews & Social Proof Wall */}
        <CustomerReviewsWall />

        {/* 5. Instagram / Community Aesthetics Wall */}
        <InstagramCommunityWall
          products={products}
          onSelectProduct={(p) => handleSelectProduct(p)}
        />

        {/* 6. Interactive FAQ Accordion */}
        <FAQSection onOpenSkinQuiz={() => setIsSkinQuizOpen(true)} />
      </main>

      {/* Brand Footer */}
      <Footer onOpenAdmin={role === 'admin' ? () => setIsAdminOpen(true) : undefined} />

      {/* Modals & Drawers */}
      <ErrorBoundary fallbackTitle="เกิดข้อผิดพลาดในการโหลดรายละเอียดสินค้า">
        <ProductDetailModal
          product={selectedProduct}
          onClose={handleCloseProduct}
        />
      </ErrorBoundary>

      <ErrorBoundary fallbackTitle="เกิดข้อผิดพลาดในการโหลดดูด่วนสินค้า">
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onOpenFullDetail={(p) => handleSelectProduct(p)}
        />
      </ErrorBoundary>

      {/* Floating Concierge & Live Sales Social Proof Toast */}
      <LiveSalesNotification
        products={products}
        onSelectProduct={(p) => handleSelectProduct(p)}
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
        onSelectProduct={(p) => handleSelectProduct(p)}
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
