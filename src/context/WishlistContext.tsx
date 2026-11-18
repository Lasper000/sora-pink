import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { Product } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlist: Product[];
  toggleWishlist: (product: Product) => boolean; // returns true if added, false if removed
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'sora_pink_wishlist';
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isConfigured } = useAuth();
  const syncedUserRef = useRef<string | null>(null);

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.warn('Failed to save wishlist:', e);
    }
  }, [wishlist]);

  useEffect(() => {
    const activeUserId = isConfigured && user?.id ? user.id : null;
    if (!activeUserId) {
      syncedUserRef.current = null;
      return;
    }
    if (syncedUserRef.current === activeUserId) return;
    syncedUserRef.current = activeUserId;

    const syncWishlistFromSupabase = async () => {
      try {
        const { data, error } = await supabase
          .from('wishlists')
          .select('product_id, products(*)')
          .eq('user_id', activeUserId);
        if (error) return;

        setWishlist((prevLocal) => {
          const map = new Map<string, Product>();
          prevLocal.forEach((p) => map.set(p.id, p));
          (data || []).forEach((row: any) => {
            if (row.products) {
              map.set(row.products.id, row.products as Product);
            }
          });

          const dbIds = new Set((data || []).map((r: any) => r.product_id));
          const toInsert = prevLocal
            .filter((p) => !dbIds.has(p.id) && UUID_REGEX.test(p.id))
            .map((p) => ({ user_id: activeUserId, product_id: p.id }));
          if (toInsert.length > 0) {
            supabase
              .from('wishlists')
              .upsert(toInsert, { onConflict: 'product_id,user_id' })
              .then();
          }

          return Array.from(map.values());
        });
      } catch (err) {
        console.warn('Supabase wishlist sync note:', err);
      }
    };

    syncWishlistFromSupabase();
  }, [isConfigured, user?.id]);

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId);
  };

  const toggleWishlist = (product: Product): boolean => {
    const exists = isInWishlist(product.id);
    if (exists) {
      setWishlist(wishlist.filter((item) => item.id !== product.id));
      if (isConfigured && user?.id && UUID_REGEX.test(product.id)) {
        supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', product.id)
          .then();
      }
      return false;
    } else {
      setWishlist([...wishlist, product]);
      if (isConfigured && user?.id && UUID_REGEX.test(product.id)) {
        supabase
          .from('wishlists')
          .upsert({ user_id: user.id, product_id: product.id }, { onConflict: 'product_id,user_id' })
          .then();
      }
      return true;
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
