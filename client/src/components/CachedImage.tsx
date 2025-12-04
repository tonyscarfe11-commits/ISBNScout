/**
 * CachedImage Component
 *
 * Displays images with proxy support for Google Books
 */

import { useState } from "react";
import { BookOpen } from "lucide-react";

interface CachedImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackIcon?: boolean;
}

export function CachedImage({ src, alt, className = "", fallbackIcon = true }: CachedImageProps) {
  const [error, setError] = useState(false);

  // Proxy Google Books images through our server to avoid CORS issues
  const proxiedSrc = src?.startsWith('https://books.google.com/')
    ? `/api/proxy-image?url=${encodeURIComponent(src)}`
    : src;

  console.log('[CachedImage] Rendering:', { src, proxiedSrc });

  // No src provided
  if (!proxiedSrc) {
    if (!fallbackIcon) return null;
    return (
      <div className={`bg-slate-100 ${className} flex items-center justify-center`}>
        <BookOpen className="w-12 h-12 text-slate-400" />
      </div>
    );
  }

  // Image failed to load
  if (error) {
    if (!fallbackIcon) return null;
    return (
      <div className={`bg-slate-100 ${className} flex items-center justify-center`}>
        <BookOpen className="w-12 h-12 text-slate-400" />
      </div>
    );
  }

  // Show image
  return (
    <img
      src={proxiedSrc}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        console.error('[CachedImage] Image failed to load:', proxiedSrc);
        setError(true);
      }}
      onLoad={() => {
        console.log('[CachedImage] Image loaded successfully:', proxiedSrc);
      }}
    />
  );
}
