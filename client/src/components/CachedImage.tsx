/**
 * CachedImage Component
 *
 * Displays images with offline support using IndexedDB cache
 * Falls back to placeholder when offline and image not cached
 */

import { useState, useEffect } from "react";
import { getOfflineDB } from "@/lib/offline-db";
import { BookOpen } from "lucide-react";

interface CachedImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackIcon?: boolean;
}

export function CachedImage({ src, alt, className = "", fallbackIcon = true }: CachedImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(src || null);
  const [isLoading, setIsLoading] = useState(!!src);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const loadImage = async () => {
      try {
        // Try to load the image directly first
        const img = new Image();
        img.onload = () => {
          if (!cancelled) {
            setImageUrl(src);
            setIsLoading(false);

            // Cache the image for offline use (don't wait for it)
            cacheImageInBackground(src);
          }
        };

        img.onerror = async () => {
          if (cancelled) return;

          // Image failed to load - try IndexedDB cache
          console.log('[CachedImage] Image load failed, trying cache:', src);
          try {
            const offlineDB = getOfflineDB();
            const cachedBlob = await offlineDB.getCachedImage(src);

            if (cachedBlob && !cancelled) {
              const blobUrl = URL.createObjectURL(cachedBlob);
              setImageUrl(blobUrl);
              setIsLoading(false);
              console.log('[CachedImage] Loaded from cache');
            } else {
              setError(true);
              setIsLoading(false);
            }
          } catch (cacheError) {
            console.error('[CachedImage] Cache load failed:', cacheError);
            setError(true);
            setIsLoading(false);
          }
        };

        img.src = src;
      } catch (err) {
        console.error('[CachedImage] Load error:', err);
        if (!cancelled) {
          setError(true);
          setIsLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      cancelled = true;
    };
  }, [src]);

  // Cache image in background (don't block rendering)
  const cacheImageInBackground = async (url: string) => {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const blob = await response.blob();
        const offlineDB = getOfflineDB();
        await offlineDB.cacheImage(url, blob);
        console.log('[CachedImage] Cached for offline use');
      }
    } catch (error) {
      // Silently fail - caching is not critical
      console.debug('[CachedImage] Background cache failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-slate-100 animate-pulse ${className}`}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !imageUrl) {
    if (!fallbackIcon) {
      return null;
    }

    return (
      <div className={`bg-slate-100 ${className}`}>
        <div className="w-full h-full flex items-center justify-center">
          <BookOpen className="w-12 h-12 text-slate-400" />
        </div>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      loading="lazy"
    />
  );
}
