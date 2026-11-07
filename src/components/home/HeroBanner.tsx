import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronLeft, ChevronRight, Tag, ArrowRight } from 'lucide-react';
import { showToast } from '../common/Toast';
import { CutePumpkinIcon } from '../common/HalloweenArtwork';
import { handleImageError } from '../../utils/imageFallback';

interface HeroBannerProps {
  onShopNow: () => void;
  onOpenSkinQuiz: () => void;
  isHalloweenMode?: boolean;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onShopNow, onOpenSkinQuiz, isHalloweenMode = true }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const allSlides = [
    {
      badge: 'HALLOWEEN ATELIER',
      title: 'Spooky Velvet Glow',
      subtitle: 'มนต์เสน่ห์ผิวฉ่ำโกลว์ สะกดทุกสายตาในยามค่ำคืน',
      desc: 'คอลเลกชันลิมิเต็ดเอดิชั่น ลิปทินท์สีเชอร์รี่ฉ่ำวาว กับมาสก์ฟักทองกู้ผิวหมองคล้ำ ให้ผิวดูสุขภาพดีอย่างเป็นธรรมชาติ ลดสูงสุดถึง 31% ตลอดเทศกาล',
      promoCode: 'SPOOKY31',
      promoText: 'ลด 31% เมื่อช้อปครบ ฿600',
      gradient: 'linear-gradient(135deg, #F9EFF1 0%, #F5EAEF 45%, #EBE7EF 100%)',
      heroImage: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
      accentColor: '#8C2E41',
      productName: 'Spooky Dew Tint #BloodCherry',
      productPrice: '฿338',
      originalPrice: '฿490',
    },
    {
      badge: 'NEW COLLECTION 2026',
      title: 'The Spring Radiance',
      subtitle: 'นิยามใหม่แห่งผิวฉ่ำโกลว์ สะท้อนความเปล่งประกายแบบธรรมชาติ',
      desc: 'ผสานคุณค่าจากเซราไมด์บริสุทธิ์และไฮยาลูรอน 8 มิติ ฟื้นบำรุงเกราะปกป้องผิวให้แข็งแรง เนียนนุ่ม อิ่มน้ำ เผยผิวเปล่งปลั่งดุจกลีบดอกไม้แรกแย้ม',
      promoCode: 'SORA50',
      promoText: 'ลดทันที ฿50 เมื่อช้อปครบ ฿500',
      gradient: 'linear-gradient(135deg, #FAF7F4 0%, #F5EFEB 45%, #EBE5E1 100%)',
      heroImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
      accentColor: '#8C2E41',
      productName: 'Cloud Hydrating Barrier Serum',
      productPrice: '฿690',
      originalPrice: '฿890',
    },
    {
      badge: 'HAUTE BESTSELLER',
      title: 'Velvet Dew Jelly Tint',
      subtitle: 'ริมฝีปากอวบอิ่ม ฉ่ำวาว ละมุนละไมในเฉด Sakura Pink',
      desc: 'ลิปทินท์เนื้อเจลลี่สูตรบำรุงล้ำลึก สบายปาก ไม่เหนียวเหนอะหนะ สีสวยชัดติดทนทั้งวัน มอบฟินิชปากฉ่ำสุขภาพดีดุจสาวเกาหลี',
      promoCode: 'GLOW20',
      promoText: 'รับส่วนลด 20% ทันที',
      gradient: 'linear-gradient(135deg, #FBF4F6 0%, #F7EAEF 50%, #EFE3E8 100%)',
      heroImage: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80',
      accentColor: '#8C2E41',
      productName: 'Dew Jelly Lip Tint #Sakura',
      productPrice: '฿320',
      originalPrice: '฿450',
    },
    {
      badge: 'SENSITIVE SKIN BOTANICAL',
      title: 'Blue Calming Cica Gel',
      subtitle: 'ปลอบประโลมผิวบอบบางแพ้ง่าย คืนความสดชื่นสู่ผิว',
      desc: 'เจลบำรุงเนื้อสัมผัสบางเบา ผสานสารสกัด Cica เข้มข้น 70% ปลอบประโลมผิวจากความร้อนและมลภาวะ ลดรอยแดง เติมเต็มความชุ่มชื้นทันทีที่สัมผัส',
      promoCode: 'FREESHIP',
      promoText: 'ส่งฟรีทุกออเดอร์ ไม่มีขั้นต่ำ',
      gradient: 'linear-gradient(135deg, #F4F8FA 0%, #EBF4F6 50%, #E2EFF2 100%)',
      heroImage: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
      accentColor: '#166074',
      productName: 'Blue Calming Cica Gel',
      productPrice: '฿420',
      originalPrice: '฿580',
    },
  ];

  const slides = isHalloweenMode
    ? allSlides
    : allSlides.filter((s) => !s.badge.includes('HALLOWEEN'));

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  // Autoplay with pause on hover
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  // Touch Swipe for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 50;
    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast(`คัดลอกโค้ด "${code}" สำเร็จ! นำไปใส่ในหน้าสั่งซื้อได้เลย`, 'success');
  };

  return (
    <section
      style={{
        padding: '1.5rem 0 2rem 0',
      }}
    >
      <div className="container">
        <div
          className="glass-card hero-carousel-wrapper"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            borderRadius: '28px',
            position: 'relative',
            overflow: 'hidden',
            border: '1.5px solid rgba(255, 255, 255, 0.95)',
            boxShadow: '0 20px 45px rgba(255, 180, 195, 0.25)',
          }}
        >
          {/* Decorative floating ambient blur circles */}
          <div
            style={{
              position: 'absolute',
              top: '-10%',
              right: '25%',
              width: '280px',
              height: '280px',
              borderRadius: '50%',
              background: 'rgba(255, 209, 220, 0.5)',
              filter: 'blur(60px)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-10%',
              left: '10%',
              width: '260px',
              height: '260px',
              borderRadius: '50%',
              background: 'rgba(191, 239, 255, 0.6)',
              filter: 'blur(60px)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />

          {/* Continuous Sliding Track with smooth horizontal glide */}
          <div
            style={{
              display: 'flex',
              width: '100%',
              transform: `translateX(-${currentSlide * 100}%)`,
              transition: 'transform 0.65s cubic-bezier(0.25, 1, 0.5, 1)',
              willChange: 'transform',
            }}
          >
            {slides.map((slide, idx) => (
              <div
                key={idx}
                className="hero-slide-item"
                style={{
                  minWidth: '100%',
                  maxWidth: '100%',
                  flexShrink: 0,
                  background: slide.gradient,
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  position: 'relative',
                }}
              >
                <div className="hero-slide-grid">
                  {/* Left Content */}
                  <div>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(8px)',
                        padding: '0.3rem 0.85rem',
                        borderRadius: '9999px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: slide.accentColor,
                        marginBottom: '1rem',
                        border: '1px solid rgba(28, 25, 23, 0.1)',
                      }}
                    >
                      {slide.badge.includes('HALLOWEEN') ? (
                        <CutePumpkinIcon size={14} />
                      ) : (
                        <Sparkles size={12} color="#C5A880" />
                      )}
                      <span>{slide.badge}</span>
                    </div>

                    <h1
                      className="hero-slide-title font-serif"
                      style={{
                        fontSize: 'clamp(2.4rem, 4.4vw, 3.8rem)',
                        fontWeight: 600,
                        lineHeight: 1.1,
                        letterSpacing: '0.01em',
                        marginBottom: '0.6rem',
                        color: '#2C2224',
                      }}
                    >
                      {slide.title}
                    </h1>

                    <h2
                      className="hero-slide-subtitle font-italic-serif"
                      style={{
                        fontSize: '1.35rem',
                        fontWeight: 500,
                        color: '#C73D62',
                        marginBottom: '1.1rem',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {slide.subtitle}
                    </h2>

                    <p
                      className="hero-slide-desc"
                      style={{
                        fontSize: '0.92rem',
                        color: '#706064',
                        lineHeight: 1.75,
                        marginBottom: '1.75rem',
                        maxWidth: '520px',
                      }}
                    >
                      {slide.desc}
                    </p>

                    {/* Promo Code Pill */}
                    <div
                      className="hero-promo-pill"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        background: '#FFFFFF',
                        padding: '0.4rem 0.6rem 0.4rem 1.1rem',
                        borderRadius: '9999px',
                        border: '1px solid rgba(222, 83, 119, 0.2)',
                        marginBottom: '1.5rem',
                        boxShadow: '0 2px 10px rgba(222, 83, 119, 0.08)',
                        maxWidth: '100%',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0, overflow: 'hidden' }}>
                        <Tag size={14} color="#DF5E7E" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: '0.8rem', color: '#706064', whiteSpace: 'nowrap' }}>
                          รหัสสิทธิพิเศษ: <strong style={{ color: '#C73D62', fontWeight: 700 }}>{slide.promoCode}</strong>
                          <span className="hero-promo-text-extra" style={{ color: '#A89AA0', fontSize: '0.75rem' }}> ({slide.promoText})</span>
                        </span>
                      </div>
                      <button
                        onClick={() => copyCode(slide.promoCode)}
                        className="hero-copy-btn"
                        style={{
                          background: '#FFF5F8',
                          color: '#C73D62',
                          border: '1px solid #FAD1DC',
                          padding: '0.25rem 0.85rem',
                          borderRadius: '9999px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        คัดลอกโค้ด
                      </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="hero-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem' }}>
                      <button onClick={onShopNow} className="btn btn-primary btn-lg hero-btn-shop">
                        ค้นพบคอลเลกชัน <ArrowRight size={16} />
                      </button>
                      <button onClick={onOpenSkinQuiz} className="btn btn-outline btn-lg hero-btn-quiz">
                        <Sparkles size={16} color="#C5A880" /> วิเคราะห์ผิวเฉพาะคุณ
                      </button>
                    </div>
                  </div>

                  {/* Right Product Image Feature Showcase */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'relative',
                    }}
                  >
                    <div className="animate-float hero-image-card">
                      <img
                        src={slide.heroImage}
                        alt={slide.productName}
                        onError={handleImageError}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.5s ease',
                        }}
                      />

                      {/* Chic Mobile Floating Chip on Photo */}
                      <div
                        className="hero-mobile-photo-tag"
                        style={{
                          position: 'absolute',
                          bottom: '10px',
                          left: '10px',
                          right: '10px',
                          background: 'rgba(255, 255, 255, 0.94)',
                          backdropFilter: 'blur(10px)',
                          padding: '0.45rem 0.85rem',
                          borderRadius: '14px',
                          display: 'none',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.12)',
                          border: '1px solid rgba(255, 255, 255, 0.9)',
                          zIndex: 5,
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: '#1F2937',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '62%',
                          }}
                        >
                          {slide.productName}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 900, color: '#E11D48' }}>
                            {slide.productPrice}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#9CA3AF', textDecoration: 'line-through' }}>
                            {slide.originalPrice}
                          </span>
                        </div>
                      </div>

                      {/* Floating Product Badge on image */}
                      <div
                        className="hero-image-badge"
                        style={{
                          position: 'absolute',
                          bottom: '1rem',
                          left: '1rem',
                          right: '1rem',
                          background: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(10px)',
                          padding: '0.85rem 1rem',
                          borderRadius: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
                          border: '1px solid rgba(255, 209, 220, 0.5)',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1F2937' }}>
                            {slide.productName}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#E11D48' }}>
                              {slide.productPrice}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: '#9CA3AF', textDecoration: 'line-through' }}>
                              {slide.originalPrice}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={onShopNow}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                        >
                          ดูสินค้า
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Left Arrow Button (Tailored Minimalist) */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous slide"
            className="hero-nav-btn prev"
            style={{
              position: 'absolute',
              left: '1.25rem',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 60,
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: '#FFFFFF',
              border: '1px solid rgba(222, 83, 119, 0.25)',
              color: '#C73D62',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(223, 94, 126, 0.12)',
              transition: 'all 0.2s ease',
              pointerEvents: 'auto',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
              e.currentTarget.style.background = '#FFF5F8';
              e.currentTarget.style.borderColor = '#DF5E7E';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.borderColor = 'rgba(222, 83, 119, 0.25)';
            }}
          >
            <ChevronLeft size={20} strokeWidth={2} />
          </button>

          {/* Right Arrow Button (Tailored Minimalist) */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next slide"
            className="hero-nav-btn next"
            style={{
              position: 'absolute',
              right: '1.25rem',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 60,
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: '#FFFFFF',
              border: '1px solid rgba(222, 83, 119, 0.25)',
              color: '#C73D62',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(223, 94, 126, 0.12)',
              transition: 'all 0.2s ease',
              pointerEvents: 'auto',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
              e.currentTarget.style.background = '#FFF5F8';
              e.currentTarget.style.borderColor = '#DF5E7E';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.borderColor = 'rgba(222, 83, 119, 0.25)';
            }}
          >
            <ChevronRight size={20} strokeWidth={2} />
          </button>

          {/* Dots Indicator with Minimalist Lookbook Counter */}
          <div
            className="hero-dots-container"
            style={{
              position: 'absolute',
              bottom: '1.25rem',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              zIndex: 50,
              background: '#FFFFFF',
              padding: '6px 16px',
              borderRadius: '9999px',
              boxShadow: '0 4px 14px rgba(223, 94, 126, 0.12)',
              border: '1px solid rgba(222, 83, 119, 0.2)',
            }}
          >
            {/* Mobile mini prev button */}
            <button
              type="button"
              onClick={handlePrev}
              className="hero-mobile-arrow"
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                padding: '0 4px',
                cursor: 'pointer',
                color: '#C73D62',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Previous slide"
            >
              <ChevronLeft size={16} strokeWidth={2} />
            </button>

            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlide(idx);
                }}
                aria-label={`Go to slide ${idx + 1}`}
                style={{
                  width: currentSlide === idx ? '24px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  border: 'none',
                  background: currentSlide === idx ? 'linear-gradient(135deg, #DF5E7E, #C73D62)' : 'rgba(222, 83, 119, 0.25)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: 0,
                }}
              />
            ))}

            {/* Mobile mini next button */}
            <button
              type="button"
              onClick={handleNext}
              className="hero-mobile-arrow"
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                padding: '0 4px',
                cursor: 'pointer',
                color: '#C73D62',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Next slide"
            >
              <ChevronRight size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
