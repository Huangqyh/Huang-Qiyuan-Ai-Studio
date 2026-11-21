import { useEffect, useState } from 'react';
import { Compass } from 'lucide-react';

interface ArchitecturalImageProps {
  src?: string;
  alt: string;
  title?: string;
  plateNumber?: string;
  className?: string;
  imgClassName?: string;
  fit?: 'cover' | 'contain';
  priority?: boolean;
  /**
   * 'thumbnail' resolves local portfolio/model assets to pre-generated lightweight WebP
   * thumbnails for silky-smooth grid scrolling, falling back automatically to the original
   * source if unavailable. 'full' always loads the original high-resolution plate.
   */
  variant?: 'thumbnail' | 'full';
}

const THUMBNAIL_SOURCE_RE = /^(\/assets\/)(portfolio|models)\/(.+)\.(jpe?g|png)$/i;

export function resolveThumbnailSrc(src?: string): string | null {
  if (!src) return null;
  const match = src.match(THUMBNAIL_SOURCE_RE);
  if (!match) return null;
  const [, prefix, bucket, relPath] = match;
  return `${prefix}thumbs/${bucket}/${relPath}.webp`;
}

export function ArchitecturalImage({
  src,
  alt,
  title,
  plateNumber,
  className = '',
  imgClassName = '',
  fit = 'cover',
  priority = false,
  variant = 'full',
}: ArchitecturalImageProps) {
  const thumbSrc = variant === 'thumbnail' ? resolveThumbnailSrc(src) : null;
  const [useOriginalFallback, setUseOriginalFallback] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setUseOriginalFallback(false);
    setFailed(false);
  }, [src, variant]);

  const activeSrc = thumbSrc && !useOriginalFallback ? thumbSrc : src;

  if (!activeSrc || failed) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center bg-[#F3F2EE] text-[#6B6A65] select-none overflow-hidden ${className}`}
        role="img"
        aria-label={alt}
      >
        <div
          className="absolute inset-0 opacity-35 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #D6D5CE 1px, transparent 1px), linear-gradient(to bottom, #D6D5CE 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative z-10 flex flex-col items-center text-center px-6 py-8">
          <Compass className="w-7 h-7 stroke-[1.25] text-[#8E8C84] mb-3" aria-hidden="true" />
          {plateNumber && (
            <span className="font-mono-tabular text-[11px] tracking-wider text-[#6B6A65] mb-1">
              {plateNumber}
            </span>
          )}
          <span className="font-editorial text-lg text-[#2C2C2A] max-w-[24ch] leading-snug">
            {title || alt}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#F7F6F2] ${className}`}>
      <img
        src={activeSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        referrerPolicy="no-referrer"
        onError={() => {
          if (thumbSrc && !useOriginalFallback) {
            setUseOriginalFallback(true);
          } else {
            setFailed(true);
          }
        }}
        className={`w-full h-full ${
          fit === 'contain' ? 'object-contain' : 'object-cover'
        } ${imgClassName}`}
      />
    </div>
  );
}
