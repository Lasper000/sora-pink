import React from 'react';

/**
 * Fallback luxury SVG placeholder in case remote image fails or network is offline
 */
export const DEFAULT_FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'%3E%3Crect width='600' height='600' fill='%23FFF1F5'/%3E%3Ccircle cx='300' cy='260' r='90' fill='%23FFD1DC' opacity='0.7'/%3E%3Cpath d='M260 260 C260 230, 340 230, 340 260 C340 290, 260 310, 300 340' stroke='%23D47690' stroke-width='4' fill='none' stroke-linecap='round'/%3E%3Ctext x='300' y='390' font-family='sans-serif' font-size='22' font-weight='600' fill='%23D47690' text-anchor='middle'%3ESORA PINK BEAUTY%3C/text%3E%3Ctext x='300' y='425' font-family='sans-serif' font-size='14' fill='%23A07080' text-anchor='middle'%3ELuxury Cosmetic Collection%3C/text%3E%3C/svg%3E";

export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.currentTarget;
  if (target.src !== DEFAULT_FALLBACK_IMAGE) {
    target.onerror = null; // Prevents recursive loop
    target.src = DEFAULT_FALLBACK_IMAGE;
  }
};
