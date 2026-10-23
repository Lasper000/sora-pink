import React, { useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import {
  CuteSpiderWeb,
  DanglingCuteSpider,
  CutePastelGhost,
  CutePastelPumpkin,
  CutePastelBat,
  CutePumpkinIcon,
} from './HalloweenArtwork';

interface SpookyEffectsProps {
  onOpenTrickOrTreat: () => void;
  isHalloweenMode: boolean;
}

export const SpookyEffects: React.FC<SpookyEffectsProps> = ({
  onOpenTrickOrTreat,
  isHalloweenMode,
}) => {
  // Apply spooky theme class to body
  useEffect(() => {
    if (isHalloweenMode) {
      document.body.classList.add('spooky-theme');
    } else {
      document.body.classList.remove('spooky-theme');
    }
    return () => {
      document.body.classList.remove('spooky-theme');
    };
  }, [isHalloweenMode]);

  if (!isHalloweenMode) return null;

  return (
    <>
      {/* 1. Delicate Pastel Spider Web in the Top-Right Corner */}
      <CuteSpiderWeb position="top-right" size={170} opacity={0.88} className="spiderweb-corner-right" />
      <CuteSpiderWeb position="top-left" size={110} opacity={0.5} className="spiderweb-corner-left" />

      {/* 2. Cute Dangling Spider hanging from top silk thread */}
      <DanglingCuteSpider threadLength={125} className="dangling-spider-container" />

      {/* 3. Floating Ambient Vector Characters (Ghosts, Bats, Pumpkins) */}
      <div
        className="ambient-ghosts-container"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 400,
          overflow: 'hidden',
        }}
      >
        {/* Ghost 1 - Left Floating */}
        <div
          style={{
            position: 'absolute',
            top: '18%',
            left: '3.5%',
            opacity: 0.9,
          }}
        >
          <CutePastelGhost size={64} className="floating-ghost ghost-1" />
        </div>

        {/* Bat 1 - Top Right Floating */}
        <div
          style={{
            position: 'absolute',
            top: '13%',
            right: '7%',
            opacity: 0.88,
          }}
        >
          <CutePastelBat size={66} className="floating-bat bat-1" />
        </div>

        {/* Ghost 2 - Bottom Right */}
        <div
          style={{
            position: 'absolute',
            bottom: '22%',
            right: '3.5%',
            opacity: 0.85,
          }}
        >
          <CutePastelGhost size={52} className="floating-ghost ghost-2" />
        </div>

        {/* Cute Floating Pastel Pumpkin - Bottom Left */}
        <div
          style={{
            position: 'absolute',
            bottom: '15%',
            left: '3%',
            opacity: 0.9,
          }}
        >
          <CutePastelPumpkin size={58} className="floating-pumpkin" />
        </div>
      </div>

      {/* 4. Floating Interactive Widget (Bottom Right) */}
      <div
        className="trick-or-treat-floating-widget"
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '1.5rem',
          zIndex: 900,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '0.5rem',
        }}
      >
        {/* Trick or Treat Mystery Button */}
        <button
          onClick={onOpenTrickOrTreat}
          className="trick-or-treat-btn"
          style={{
            background: 'linear-gradient(135deg, #FF6B8B 0%, #D946EF 50%, #38BDF8 100%)',
            color: '#FFFFFF',
            padding: '0.65rem 1.15rem',
            borderRadius: '9999px',
            border: '2px solid rgba(255, 255, 255, 0.9)',
            boxShadow: '0 8px 25px rgba(217, 70, 239, 0.45)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 700,
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08) translateY(-3px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1) translateY(0)')}
        >
          <span style={{ display: 'inline-flex', animation: 'pumpkinWiggle 1.5s infinite ease-in-out' }}>
            <CutePumpkinIcon size={22} />
          </span>
          <span className="trick-or-treat-text-desktop">Trick or Treat! จิ้มรับโค้ดลดเลย</span>
          <span className="trick-or-treat-text-mobile" style={{ display: 'none' }}>สุ่มโค้ดลับ</span>
          <Sparkles size={16} />
        </button>
      </div>
    </>
  );
};
