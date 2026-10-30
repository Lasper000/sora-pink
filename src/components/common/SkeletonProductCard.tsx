import React from 'react';

export const SkeletonProductCard: React.FC = () => {
  return (
    <div
      className="glass-card"
      style={{
        borderRadius: '20px',
        overflow: 'hidden',
        background: '#FFFFFF',
        border: '1px solid rgba(255, 209, 220, 0.4)',
        padding: '0',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Image Skeleton */}
      <div
        className="skeleton-shimmer"
        style={{
          width: '100%',
          aspectRatio: '1 / 1',
          background: 'linear-gradient(90deg, #FCE7F3 0%, #FFF1F2 50%, #FCE7F3 100%)',
        }}
      />

      {/* Content Skeleton */}
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {/* Category Pill Skeleton */}
        <div
          className="skeleton-shimmer"
          style={{ width: '45%', height: '14px', borderRadius: '9999px', background: '#F1F5F9' }}
        />

        {/* Title Skeleton */}
        <div
          className="skeleton-shimmer"
          style={{ width: '90%', height: '18px', borderRadius: '6px', background: '#F1F5F9' }}
        />
        <div
          className="skeleton-shimmer"
          style={{ width: '65%', height: '18px', borderRadius: '6px', background: '#F1F5F9' }}
        />

        {/* Rating & Stock */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem' }}>
          <div
            className="skeleton-shimmer"
            style={{ width: '35%', height: '14px', borderRadius: '4px', background: '#F8FAFC' }}
          />
          <div
            className="skeleton-shimmer"
            style={{ width: '25%', height: '14px', borderRadius: '4px', background: '#F8FAFC' }}
          />
        </div>

        {/* Price & Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
          <div
            className="skeleton-shimmer"
            style={{ width: '40%', height: '24px', borderRadius: '8px', background: '#FCE7F3' }}
          />
          <div
            className="skeleton-shimmer"
            style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#F1F5F9' }}
          />
        </div>
      </div>

      <style>{`
        @keyframes shimmerGlow {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .skeleton-shimmer {
          background-size: 200% 100% !important;
          animation: shimmerGlow 1.8s infinite linear;
        }
      `}</style>
    </div>
  );
};
