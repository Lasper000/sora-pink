import React, { useState } from 'react';

// ============================================================================
// SORA PINK - CUSTOM PASTEL HALLOWEEN ARTWORK & VECTOR ILLUSTRATIONS
// Hand-crafted Cute Kawaii Vector Graphics (No raw OS emojis!)
// ============================================================================

/**
 * 1. ใยแมงมุมมุมบนสุด (Cute Pastel Spider Web for Top Corners)
 */
export const CuteSpiderWeb: React.FC<{
  position?: 'top-left' | 'top-right';
  size?: number;
  opacity?: number;
  className?: string;
}> = ({ position = 'top-right', size = 150, opacity = 0.85, className = '' }) => {
  const isLeft = position === 'top-left';

  return (
    <div
      className={className}
      style={{
        position: 'fixed',
        top: 0,
        [isLeft ? 'left' : 'right']: 0,
        width: `${size}px`,
        height: `${size}px`,
        pointerEvents: 'none',
        zIndex: 420,
        opacity,
        transform: isLeft ? 'none' : 'scaleX(-1)',
        filter: 'drop-shadow(0 0 10px rgba(233, 213, 255, 0.7))',
        transition: 'opacity 0.3s ease',
      }}
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%' }}
      >
        {/* Radial Web Ribs */}
        <line x1="0" y1="0" x2="120" y2="0" stroke="rgba(244, 114, 182, 0.45)" strokeWidth="1.8" />
        <line x1="0" y1="0" x2="114" y2="35" stroke="rgba(216, 180, 254, 0.55)" strokeWidth="1.5" />
        <line x1="0" y1="0" x2="98" y2="68" stroke="rgba(192, 132, 252, 0.5)" strokeWidth="1.5" />
        <line x1="0" y1="0" x2="72" y2="96" stroke="rgba(244, 114, 182, 0.5)" strokeWidth="1.5" />
        <line x1="0" y1="0" x2="38" y2="114" stroke="rgba(216, 180, 254, 0.55)" strokeWidth="1.5" />
        <line x1="0" y1="0" x2="0" y2="120" stroke="rgba(244, 114, 182, 0.45)" strokeWidth="1.8" />

        {/* Concentric Web Spirals (Cute Curved Arcs) */}
        {/* Ring 1 - Inner */}
        <path
          d="M 28,0 Q 26,9 23,17 Q 19,23 15,26 Q 9,28 0,28"
          stroke="rgba(244, 114, 182, 0.7)"
          strokeWidth="1.4"
          fill="none"
        />
        {/* Ring 2 */}
        <path
          d="M 55,0 Q 51,18 45,32 Q 38,44 28,51 Q 16,55 0,55"
          stroke="rgba(216, 180, 254, 0.75)"
          strokeWidth="1.4"
          fill="none"
        />
        {/* Ring 3 */}
        <path
          d="M 85,0 Q 80,26 69,49 Q 58,68 44,79 Q 25,85 0,85"
          stroke="rgba(244, 114, 182, 0.65)"
          strokeWidth="1.5"
          fill="none"
        />
        {/* Ring 4 - Outer */}
        <path
          d="M 115,0 Q 108,35 93,65 Q 77,91 58,106 Q 32,115 0,115"
          stroke="rgba(216, 180, 254, 0.6)"
          strokeWidth="1.5"
          fill="none"
        />

        {/* Tiny Magical Dew Drops / Pastel Sparkles on web intersections */}
        <circle cx="23" cy="17" r="2.2" fill="#FDE047" />
        <circle cx="45" cy="32" r="2.5" fill="#FFD1DC" />
        <circle cx="69" cy="49" r="2.2" fill="#BFEFFF" />
        <circle cx="28" cy="51" r="2.2" fill="#FDE047" />
        <circle cx="44" cy="79" r="2.5" fill="#FFD1DC" />

        {/* Little twinkle star */}
        <path
          d="M 93,65 Q 93,68 96,68 Q 93,68 93,71 Q 93,68 90,68 Q 93,68 93,65 Z"
          fill="#FFF"
        />
      </svg>
    </div>
  );
};

/**
 * 2. แมงมุมโหนใยตัวกลมน่ารัก (Cute Dangling Spider on Web Thread)
 * - โหนใยห้อยลงมาจากขอบบนของจอ
 * - ดุ๊กดิ๊ก แกว่งไปมาอย่างนุ่มนวล
 * - มีตาแป๋วแหวว แก้มชมพูระเรื่อ และโบว์ชมพูหวาน
 * - เมื่อคลิกหรือเอาเมาส์ชี้ แมงมุมจะเด้งดึ๋ง พร้อมข้อความทักทาย
 */
export const DanglingCuteSpider: React.FC<{
  style?: React.CSSProperties;
  threadLength?: number;
  className?: string;
}> = ({ style, threadLength = 135, className = '' }) => {
  const [isWiggling, setIsWiggling] = useState(false);
  const [showSpeech, setShowSpeech] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);

  const SPIDER_MESSAGES = [
    'แฮปปี้ฮาโลวีนน้า~ มีโค้ดลับซ่อนอยู่ด้วยนะ',
    'อย่าลืมบำรุงผิวให้ฉ่ำโกลว์นะคนสวย',
    'แวะไปสุ่มรับโค้ดลับตรงปุ่มขวาล่างรึยังเอ่ย~',
    'ผิวนุ่มสวยฉ่ำวาวรับเทศกาลไปด้วยกันน้า',
    'ขอให้วันนี้เป็นวันที่น่ารักและสดใสสำหรับเธอนะคะ',
  ];

  const handleSpiderClick = () => {
    setIsWiggling(true);
    setMsgIndex((prev) => (prev + 1) % SPIDER_MESSAGES.length);
    setShowSpeech(true);
    setTimeout(() => setIsWiggling(false), 800);
    setTimeout(() => setShowSpeech(false), 3200);
  };

  return (
    <div
      onClick={handleSpiderClick}
      onMouseEnter={() => setShowSpeech(true)}
      onMouseLeave={() => setShowSpeech(false)}
      className={className}
      style={{
        position: 'fixed',
        top: 0,
        right: '18%',
        zIndex: 430,
        cursor: 'pointer',
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        filter: 'drop-shadow(0 6px 16px rgba(168, 85, 247, 0.35))',
        ...style,
      }}
      title="จิ้มทักทายน้องแมงมุมได้น้า~"
    >
      {/* Speech Bubble */}
      {showSpeech && (
        <div
          className="animate-pop"
          style={{
            position: 'absolute',
            top: `${threadLength + 45}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F9 100%)',
            border: '2px solid #FFB8C9',
            padding: '5px 12px',
            borderRadius: '14px',
            boxShadow: '0 4px 15px rgba(255, 141, 168, 0.35)',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: '#BE123C',
            whiteSpace: 'nowrap',
            zIndex: 450,
            pointerEvents: 'none',
          }}
        >
          <span>{SPIDER_MESSAGES[msgIndex]}</span>
        </div>
      )}

      {/* Dangling Silk Web Thread */}
      <svg width="4" height={threadLength} style={{ overflow: 'visible' }}>
        <line
          x1="2"
          y1="0"
          x2="2"
          y2={threadLength}
          stroke="url(#threadGradient)"
          strokeWidth="2.2"
          strokeDasharray="4 3"
        />
        <defs>
          <linearGradient id="threadGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(244, 114, 182, 0.4)" />
            <stop offset="70%" stopColor="rgba(216, 180, 254, 0.85)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 1)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Spider Character Body with Dangle & Swing Animation */}
      <div
        className={isWiggling ? 'animate-heart' : 'spider-dangle'}
        style={{
          marginTop: '-6px',
          width: '56px',
          height: '56px',
          transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
          <defs>
            <radialGradient id="spiderBodyGrad" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="60%" stopColor="#6D28D9" />
              <stop offset="100%" stopColor="#4C1D95" />
            </radialGradient>
            <radialGradient id="spiderHeadGrad" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#A78BFA" />
              <stop offset="70%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#5B21B6" />
            </radialGradient>
          </defs>

          {/* 8 Cute Wavy Legs */}
          {/* Left Legs */}
          <path
            d="M 32 46 Q 14 36 6 48"
            stroke="#6D28D9"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 30 52 Q 10 50 4 64"
            stroke="#6D28D9"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 31 58 Q 12 64 8 78"
            stroke="#6D28D9"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 35 64 Q 18 78 16 92"
            stroke="#6D28D9"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Right Legs */}
          <path
            d="M 68 46 Q 86 36 94 48"
            stroke="#6D28D9"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 70 52 Q 90 50 96 64"
            stroke="#6D28D9"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 69 58 Q 88 64 92 78"
            stroke="#6D28D9"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 65 64 Q 82 78 84 92"
            stroke="#6D28D9"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Plump Round Spider Abdomen */}
          <circle cx="50" cy="58" r="26" fill="url(#spiderBodyGrad)" />

          {/* Little Pastel Pink Heart Belly Marking */}
          <path
            d="M 50 56 C 48 53 44 53 44 57 C 44 61 50 65 50 65 C 50 65 56 61 56 57 C 56 53 52 53 50 56 Z"
            fill="#FFB8C9"
            opacity="0.9"
          />

          {/* Spider Head */}
          <circle cx="50" cy="36" r="18" fill="url(#spiderHeadGrad)" />

          {/* Cute Little Pastel Pink Ribbon Bow on Head */}
          <g transform="translate(50, 20) scale(0.65)">
            <ellipse cx="-8" cy="-2" rx="7" ry="5" fill="#F472B6" />
            <ellipse cx="8" cy="-2" rx="7" ry="5" fill="#F472B6" />
            <circle cx="0" cy="-2" r="3.5" fill="#FFE4E6" />
          </g>

          {/* Big Shiny Kawaii Anime Eyes */}
          {/* Left Eye */}
          <ellipse cx="44" cy="35" rx="5" ry="6" fill="#1F2937" />
          <circle cx="43" cy="33" r="2.2" fill="#FFFFFF" />
          <circle cx="46" cy="37" r="1" fill="#FFFFFF" />

          {/* Right Eye */}
          <ellipse cx="56" cy="35" rx="5" ry="6" fill="#1F2937" />
          <circle cx="55" cy="33" r="2.2" fill="#FFFFFF" />
          <circle cx="58" cy="37" r="1" fill="#FFFFFF" />

          {/* Sweet Rosy Pink Blush Cheeks */}
          <ellipse cx="37" cy="41" rx="4" ry="2.5" fill="#FB7185" opacity="0.8" />
          <ellipse cx="63" cy="41" rx="4" ry="2.5" fill="#FB7185" opacity="0.8" />

          {/* Happy Tiny Mouth */}
          <path
            d="M 47 41 Q 50 44 53 41"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
    </div>
  );
};

/**
 * 3. ภูติน้อยพาสเทลตัวนุ่ม (Cute Pastel Ghost Illustration)
 */
export const CutePastelGhost: React.FC<{ size?: number; className?: string }> = ({
  size = 60,
  className = '',
}) => {
  return (
    <div
      className={className}
      style={{
        width: `${size}px`,
        height: `${size * 1.15}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: 'drop-shadow(0 8px 18px rgba(255, 180, 210, 0.75))',
      }}
    >
      <svg viewBox="0 0 100 115" style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="ghostGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#FFF1F5" />
            <stop offset="100%" stopColor="#E0F2FE" />
          </linearGradient>
        </defs>

        {/* Ghost Flowing Body */}
        <path
          d="M 50 10 
             C 25 10, 16 28, 16 52 
             C 16 68, 12 76, 12 90 
             C 12 99, 20 105, 28 98 
             C 36 90, 42 90, 50 98 
             C 58 105, 64 90, 72 98 
             C 80 105, 88 98, 88 90 
             C 88 76, 84 68, 84 52 
             C 84 28, 75 10, 50 10 Z"
          fill="url(#ghostGrad)"
          stroke="rgba(255, 209, 220, 0.7)"
          strokeWidth="2"
        />

        {/* Cute Little Waving Ghost Hands */}
        {/* Left Hand */}
        <path
          d="M 22 55 C 10 52 8 62 18 64"
          fill="url(#ghostGrad)"
          stroke="rgba(255, 209, 220, 0.6)"
          strokeWidth="1.8"
        />
        {/* Right Hand Waving */}
        <path
          d="M 78 52 C 92 46 95 56 82 62"
          fill="url(#ghostGrad)"
          stroke="rgba(255, 209, 220, 0.6)"
          strokeWidth="1.8"
        />

        {/* Big Kawaii Glossy Eyes */}
        <ellipse cx="40" cy="45" rx="5.5" ry="7" fill="#1F2937" />
        <circle cx="38.5" cy="42.5" r="2.4" fill="#FFFFFF" />
        <circle cx="42" cy="47" r="1.1" fill="#FFFFFF" />

        <ellipse cx="60" cy="45" rx="5.5" ry="7" fill="#1F2937" />
        <circle cx="58.5" cy="42.5" r="2.4" fill="#FFFFFF" />
        <circle cx="62" cy="47" r="1.1" fill="#FFFFFF" />

        {/* Rosy Pink Blush Cheeks */}
        <ellipse cx="31" cy="52" rx="5" ry="3" fill="#FB7185" opacity="0.75" />
        <ellipse cx="69" cy="52" rx="5" ry="3" fill="#FB7185" opacity="0.75" />

        {/* Open Cute Smile */}
        <path
          d="M 46 51 Q 50 57 54 51"
          stroke="#1F2937"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="#F43F5E"
        />

        {/* Floating Star Accent */}
        <path
          d="M 76 22 Q 76 26 80 26 Q 76 26 76 30 Q 76 26 72 26 Q 76 26 76 22 Z"
          fill="#FDE047"
        />
      </svg>
    </div>
  );
};

/**
 * 4. ฟักทองพาสเทลหน้าหวาน (Cute Pastel Pumpkin Illustration)
 */
export const CutePastelPumpkin: React.FC<{ size?: number; className?: string }> = ({
  size = 60,
  className = '',
}) => {
  return (
    <div
      className={className}
      style={{
        width: `${size}px`,
        height: `${size * 0.9}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: 'drop-shadow(0 8px 18px rgba(251, 146, 60, 0.55))',
      }}
    >
      <svg viewBox="0 0 100 90" style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="pumpkinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FED7AA" />
            <stop offset="40%" stopColor="#FDBA74" />
            <stop offset="100%" stopColor="#FB923C" />
          </linearGradient>
          <linearGradient id="stemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#86EFAC" />
            <stop offset="100%" stopColor="#22C55E" />
          </linearGradient>
        </defs>

        {/* Mint Green Stem */}
        <path
          d="M 48 24 Q 46 10 58 6 Q 52 14 54 24 Z"
          fill="url(#stemGrad)"
        />
        {/* Curly Tendril Vine */}
        <path
          d="M 54 18 Q 64 14 62 24 Q 60 28 66 26"
          stroke="#4ADE80"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Outer Pumpkin Lobes */}
        <ellipse cx="28" cy="54" rx="20" ry="25" fill="#FB923C" />
        <ellipse cx="72" cy="54" rx="20" ry="25" fill="#FB923C" />

        {/* Mid Pumpkin Lobes */}
        <ellipse cx="38" cy="54" rx="20" ry="27" fill="#FDBA74" />
        <ellipse cx="62" cy="54" rx="20" ry="27" fill="#FDBA74" />

        {/* Center Pumpkin Lobe */}
        <ellipse cx="50" cy="54" rx="20" ry="28" fill="url(#pumpkinGrad)" />

        {/* Sweet Smiling Eyes (^ ^) */}
        <path
          d="M 33 46 Q 38 41 43 46"
          stroke="#7C2D12"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 57 46 Q 62 41 67 46"
          stroke="#7C2D12"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Rosy Pastel Cheeks */}
        <ellipse cx="29" cy="55" rx="5.5" ry="3.5" fill="#F43F5E" opacity="0.75" />
        <ellipse cx="71" cy="55" rx="5.5" ry="3.5" fill="#F43F5E" opacity="0.75" />

        {/* Cute Smiling Mouth with Tiny Fang */}
        <path
          d="M 42 56 Q 50 66 58 56 Z"
          fill="#7C2D12"
        />
        <polygon points="46,56 48,60 50,56" fill="#FFFFFF" />
      </svg>
    </div>
  );
};

/**
 * 5. ค้างคาวน้อยพาสเทลปีกกลม (Cute Pastel Bat Illustration)
 */
export const CutePastelBat: React.FC<{ size?: number; className?: string }> = ({
  size = 56,
  className = '',
}) => {
  return (
    <div
      className={className}
      style={{
        width: `${size * 1.3}px`,
        height: `${size * 0.85}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: 'drop-shadow(0 6px 16px rgba(192, 132, 252, 0.6))',
      }}
    >
      <svg viewBox="0 0 120 75" style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="batWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#9333EA" />
          </linearGradient>
          <linearGradient id="batBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DDD6FE" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
        </defs>

        {/* Scalloped Cute Bat Wings */}
        {/* Left Wing */}
        <path
          d="M 50 42 
             C 40 22, 16 16, 4 30 
             C 12 44, 20 46, 26 42 
             C 32 50, 42 52, 50 46 Z"
          fill="url(#batWingGrad)"
        />
        {/* Right Wing */}
        <path
          d="M 70 42 
             C 80 22, 104 16, 116 30 
             C 108 44, 100 46, 94 42 
             C 88 50, 78 52, 70 46 Z"
          fill="url(#batWingGrad)"
        />

        {/* Pointy Cute Ears */}
        <polygon points="52,30 48,12 58,26" fill="#9333EA" />
        <polygon points="53,28 50,16 57,25" fill="#F472B6" />

        <polygon points="68,30 72,12 62,26" fill="#9333EA" />
        <polygon points="67,28 70,16 63,25" fill="#F472B6" />

        {/* Chubby Round Bat Body */}
        <ellipse cx="60" cy="44" rx="16" ry="19" fill="url(#batBodyGrad)" />

        {/* Kawaii Eyes */}
        <circle cx="54" cy="40" r="3.5" fill="#1F2937" />
        <circle cx="53" cy="38.5" r="1.3" fill="#FFFFFF" />

        <circle cx="66" cy="40" r="3.5" fill="#1F2937" />
        <circle cx="65" cy="38.5" r="1.3" fill="#FFFFFF" />

        {/* Pink Blush */}
        <ellipse cx="49" cy="45" rx="3" ry="1.8" fill="#F472B6" />
        <ellipse cx="71" cy="45" rx="3" ry="1.8" fill="#F472B6" />

        {/* Tiny Smile with 2 Cute Little Fangs */}
        <path d="M 57 45 Q 60 48 63 45" stroke="#1F2937" strokeWidth="1.5" fill="none" />
        <polygon points="58,45 59,47 60,45" fill="#FFFFFF" />
        <polygon points="60,45 61,47 62,45" fill="#FFFFFF" />
      </svg>
    </div>
  );
};

/**
 * 6. ลูกกวาดฮาโลวีนพาสเทล (Cute Pastel Halloween Candy)
 */
export const CutePastelCandy: React.FC<{ size?: number; className?: string }> = ({
  size = 50,
  className = '',
}) => {
  return (
    <div
      className={className}
      style={{
        width: `${size * 1.2}px`,
        height: `${size * 0.75}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: 'drop-shadow(0 6px 14px rgba(244, 114, 182, 0.5))',
      }}
    >
      <svg viewBox="0 0 100 60" style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="candyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFB8C9" />
            <stop offset="35%" stopColor="#BAE6FD" />
            <stop offset="70%" stopColor="#FEF08A" />
            <stop offset="100%" stopColor="#D8B4FE" />
          </linearGradient>
        </defs>

        {/* Wrapper Left Wing */}
        <polygon points="30,30 8,14 14,30 8,46" fill="#F472B6" opacity="0.9" />
        {/* Wrapper Right Wing */}
        <polygon points="70,30 92,14 86,30 92,46" fill="#A855F7" opacity="0.9" />

        {/* Center Round Candy */}
        <ellipse cx="50" cy="30" rx="24" ry="18" fill="url(#candyGrad)" stroke="#FFFFFF" strokeWidth="2" />

        {/* Candy Swirl Stripes */}
        <path d="M 40 13 Q 48 30 40 47" stroke="#FFFFFF" strokeWidth="2.5" fill="none" opacity="0.75" />
        <path d="M 52 12 Q 60 30 52 48" stroke="#FFFFFF" strokeWidth="2.5" fill="none" opacity="0.75" />

        {/* Tiny Sparkle Star */}
        <circle cx="58" cy="22" r="1.5" fill="#FFFFFF" />
      </svg>
    </div>
  );
};

// ============================================================================
// COMPACT VECTOR ICONS (For Buttons, Badges, Tabs, and Headers)
// ============================================================================

export const CutePumpkinIcon: React.FC<{ size?: number; style?: React.CSSProperties }> = ({
  size = 20,
  style,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
  >
    {/* Stem */}
    <path d="M12 2C11.5 4 12 5 12 6" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
    {/* Pumpkin Body */}
    <ellipse cx="12" cy="14" rx="9" ry="8" fill="#FB923C" />
    <ellipse cx="12" cy="14" rx="5.5" ry="8" fill="#FDBA74" />
    <ellipse cx="12" cy="14" rx="2.5" ry="8" fill="#FED7AA" />
    {/* Cute Eyes & Smile */}
    <path d="M8.5 12L9.5 13M15.5 12L14.5 13" stroke="#7C2D12" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M10 16Q12 18 14 16" stroke="#7C2D12" strokeWidth="1.6" strokeLinecap="round" fill="none" />
  </svg>
);

export const CuteGhostIcon: React.FC<{ size?: number; style?: React.CSSProperties }> = ({
  size = 20,
  style,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
  >
    {/* Ghost Body */}
    <path
      d="M12 2C7 2 5 6 5 12C5 16 4 18 4 21C4 22 6 22 8 20.5C10 19 11 19 12 20.5C13 22 14 19 16 20.5C18 22 20 22 20 21C20 18 19 16 19 12C19 6 17 2 12 2Z"
      fill="#FFFFFF"
      stroke="#FFB8C9"
      strokeWidth="1.4"
    />
    {/* Cute Eyes */}
    <circle cx="9.5" cy="10" r="1.3" fill="#1F2937" />
    <circle cx="14.5" cy="10" r="1.3" fill="#1F2937" />
    {/* Blush */}
    <circle cx="7.5" cy="12" r="1.1" fill="#FB7185" opacity="0.8" />
    <circle cx="16.5" cy="12" r="1.1" fill="#FB7185" opacity="0.8" />
    {/* Smile */}
    <path d="M11 13Q12 14.5 13 13" stroke="#1F2937" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

export const CuteBatIcon: React.FC<{ size?: number; style?: React.CSSProperties }> = ({
  size = 20,
  style,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
  >
    {/* Wings */}
    <path
      d="M12 12C9 7 4 6 1 10C3 14 6 14 7 13C8 16 10 16 12 14C14 16 16 16 17 13C18 14 21 14 23 10C20 6 15 7 12 12Z"
      fill="#A855F7"
    />
    {/* Body */}
    <ellipse cx="12" cy="13" rx="3.5" ry="4.5" fill="#DDD6FE" />
    {/* Ears */}
    <polygon points="10,9 9,5 11,8" fill="#9333EA" />
    <polygon points="14,9 15,5 13,8" fill="#9333EA" />
    {/* Eyes */}
    <circle cx="11" cy="12" r="0.8" fill="#1F2937" />
    <circle cx="13" cy="12" r="0.8" fill="#1F2937" />
  </svg>
);

export const CuteCandyIcon: React.FC<{ size?: number; style?: React.CSSProperties }> = ({
  size = 20,
  style,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
  >
    <polygon points="7,12 2,8 4,12 2,16" fill="#F472B6" />
    <polygon points="17,12 22,8 20,12 22,16" fill="#A855F7" />
    <ellipse cx="12" cy="12" rx="6" ry="4.5" fill="#FFB8C9" stroke="#FFF" strokeWidth="1" />
    <path d="M10 8Q12 12 10 16" stroke="#BAE6FD" strokeWidth="1.2" fill="none" />
  </svg>
);
