import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronLeft, ChevronRight, Tag, ArrowRight } from 'lucide-react';
import { showToast } from '../common/Toast';
import { CutePumpkinIcon } from '../common/HalloweenArtwork';

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
      badge: 'HALLOWEEN LIMITED EDITION',
      title: 'SPOOKY PINK GLOW NIGHT',
      subtitle: 'อัปเลเวลผิวฉ่ำโกลว์ สวยสะกดรับค่ำคืนฮาโลวีน',
      desc: 'คอลเลกชันลิมิเต็ดสุดคิ้วท์! ลิปทินท์สีเชอร์รี่ฉ่ำวาว กับมาสก์ฟักทองกู้ผิวหมองคล้ำ ให้ผิวดูสุขภาพดี พิเศษเฉพาะช่วงนี้ ลดสูงสุดถึง 31% ช้อปเลยก่อนหมดน้า',
      promoCode: 'SPOOKY31',
      promoText: 'ลด 31% เมื่อช้อปครบ ฿600',
      gradient: 'linear-gradient(135deg, #FFE4E6 0%, #FAF5FF 45%, #E0F2FE 100%)',
      heroImage: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
      accentColor: '#9333EA',
      productName: 'Spooky Dew Tint #BloodCherry',
      productPrice: '฿338',
      originalPrice: '฿490',
    },
    {
      badge: 'NEW COLLECTION 2026',
      title: 'SORA PINK SPRING GLOW',
      subtitle: 'ผิวโกลว์ใส สุขภาพดี ในสไตล์พาสเทลมินิมอล',
      desc: 'รวมสกินแคร์และเมคอัพโทนหวานละมุน ฟื้นบำรุงผิวอย่างอ่อนโยนด้วยเซราไมด์เข้มข้นและไฮยา 8 มิติ ให้ผิวดูอิ่มน้ำ สดใสตลอดทั้งวัน',
      promoCode: 'SORA50',
      promoText: 'ลดทันที ฿50 เมื่อช้อปครบ ฿500',
      gradient: 'linear-gradient(135deg, #FFE8EF 0%, #FFF5F8 45%, #E0F4FF 100%)',
      heroImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
      accentColor: '#F43F5E',
      productName: 'Cloud Hydrating Barrier Serum',
      productPrice: '฿690',
      originalPrice: '฿890',
    },
    {
      badge: 'BEST SELLER DEAL',
      title: 'VELVET DEW JELLY TINT',
      subtitle: 'ปากอวบอิ่ม ฉ่ำวาว สี Sakura Pink ละมุนใจ',
      desc: 'ลิปทินท์เนื้อเจลลี่สูตรบำรุงล้ำลึก สบายปาก ไม่เหนียวเหนอะหนะ สีสวยชัดติดทนทั้งวัน ให้ลุคปากฉ่ำสุขภาพดีแบบสาวเกาหลี',
      promoCode: 'GLOW20',
      promoText: 'รับส่วนลด 20% ทันที',
      gradient: 'linear-gradient(135deg, #FFF0F3 0%, #FFE6EC 50%, #E6F8FF 100%)',
      heroImage: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80',
      accentColor: '#FB7185',
      productName: 'Dew Jelly Lip Tint #Sakura',
      productPrice: '฿320',
      originalPrice: '฿450',
    },
    {
      badge: 'SENSITIVE SKIN SPECIAL',
      title: 'BLUE CALMING CICA GEL',
      subtitle: 'ปลอบประโลมผิวแพ้ง่าย คืนความสดชื่นสบายผิว',
      desc: 'เจลบำรุงเนื้อเย็นสีฟ้าละมุน ผสานสารสกัด Cica เข้มข้น 70% ช่วยลดรอยแดง ปลอบประโลมผิวจากการระคายเคือง เติมความชุ่มชื้นทันทีที่ทา',
      promoCode: 'FREESHIP',
      promoText: 'ส่งฟรีทุกออเดอร์ ไม่มีขั้นต่ำ',
      gradient: 'linear-gradient(135deg, #E0F4FF 0%, #F0F9FF 50%, #FFE8EF 100%)',
      heroImage: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
      accentColor: '#0284C7',
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
                        gap: '0.4rem',
                        background: 'rgba(255, 255, 255, 0.88)',
                        backdropFilter: 'blur(8px)',
                        padding: '0.35rem 0.95rem',
                        borderRadius: '9999px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: slide.accentColor,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                        marginBottom: '1rem',
                        border: '1px solid rgba(255, 255, 255, 0.8)',
                      }}
                    >
                      {slide.badge.includes('HALLOWEEN') ? (
                        <CutePumpkinIcon size={15} />
                      ) : (
                        <Sparkles size={14} className="animate-spin-slow" />
                      )}
                      {slide.badge}
                    </div>

                    <h1
                      className="hero-slide-title"
                      style={{
                        fontSize: 'clamp(2rem, 3.8vw, 3rem)',
                        fontWeight: 800,
                        lineHeight: 1.15,
                        letterSpacing: '-0.5px',
                        marginBottom: '0.6rem',
                        color: '#1F2937',
                      }}
                    >
                      {slide.title}
                    </h1>

                    <h2
                      className="hero-slide-subtitle"
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        color: '#4B5563',
                        marginBottom: '1rem',
                      }}
                    >
                      {slide.subtitle}
                    </h2>

                    <p
                      className="hero-slide-desc"
                      style={{
                        fontSize: '0.95rem',
                        color: '#6B7280',
                        lineHeight: 1.7,
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
                        gap: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.95)',
                        padding: '0.5rem 0.85rem',
                        borderRadius: '14px',
                        border: '1.5px dashed #FF8DA8',
                        marginBottom: '1.75rem',
                        boxShadow: '0 4px 14px rgba(255, 141, 168, 0.18)',
                        maxWidth: '100%',
                        flexWrap: 'wrap',
                      }}
                    >
                      <Tag size={18} color="#F43F5E" className="animate-breathe" />
                      <span style={{ fontSize: '0.85rem', color: '#4B5563' }}>
                        โค้ด: <strong>{slide.promoCode}</strong> ({slide.promoText})
                      </span>
                      <button
                        onClick={() => copyCode(slide.promoCode)}
                        className="btn btn-sm btn-outline"
                        style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                      >
                        คัดลอกโค้ด
                      </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="hero-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem' }}>
                      <button onClick={onShopNow} className="btn btn-primary btn-lg">
                        ช้อปเลยตอนนี้ <ArrowRight size={18} />
                      </button>
                      <button onClick={onOpenSkinQuiz} className="btn btn-outline btn-lg">
                        <Sparkles size={18} /> ทำแบบประเมินผิว
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
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.5s ease',
                        }}
                      />

                      {/* Floating Product Badge on image */}
                      <div
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

          {/* Left Arrow Button (Pastel Rose Glassmorphism with Smooth Hover) */}
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
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(12px)',
              border: '2px solid rgba(255, 209, 220, 0.95)',
              color: '#E11D48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(255, 141, 168, 0.35)',
              transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              pointerEvents: 'auto',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.15)';
              e.currentTarget.style.borderColor = '#F43F5E';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(244, 63, 94, 0.45)';
              e.currentTarget.style.background = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              e.currentTarget.style.borderColor = 'rgba(255, 209, 220, 0.95)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 141, 168, 0.35)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.92)';
            }}
          >
            <ChevronLeft size={24} strokeWidth={2.75} />
          </button>

          {/* Right Arrow Button (Pastel Rose Glassmorphism with Smooth Hover) */}
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
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(12px)',
              border: '2px solid rgba(255, 209, 220, 0.95)',
              color: '#E11D48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(255, 141, 168, 0.35)',
              transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              pointerEvents: 'auto',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.15)';
              e.currentTarget.style.borderColor = '#F43F5E';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(244, 63, 94, 0.45)';
              e.currentTarget.style.background = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              e.currentTarget.style.borderColor = 'rgba(255, 209, 220, 0.95)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 141, 168, 0.35)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.92)';
            }}
          >
            <ChevronRight size={24} strokeWidth={2.75} />
          </button>

          {/* Dots Indicator with Floating Glass Pill */}
          <div
            className="hero-dots-container"
            style={{
              position: 'absolute',
              bottom: '1.25rem',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              zIndex: 50,
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(8px)',
              padding: '4px 10px',
              borderRadius: '9999px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.9)',
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
                color: '#E11D48',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Previous slide"
            >
              <ChevronLeft size={16} strokeWidth={2.75} />
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
                  width: currentSlide === idx ? '28px' : '8px',
                  height: '8px',
                  borderRadius: '9999px',
                  border: 'none',
                  background: currentSlide === idx ? 'linear-gradient(90deg, #FF6B8B 0%, #F43F5E 100%)' : 'rgba(0, 0, 0, 0.16)',
                  cursor: 'pointer',
                  transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
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
                color: '#E11D48',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Next slide"
            >
              <ChevronRight size={16} strokeWidth={2.75} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
