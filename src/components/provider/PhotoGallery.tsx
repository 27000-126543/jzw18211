import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { EnvPhoto } from '@/types';
import { cn } from '@/lib/utils';

interface PhotoGalleryProps {
  photos: EnvPhoto[];
}

export default function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activePhoto = photos[activeIndex];

  const scrollThumbnail = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    setActiveIndex(0);
  }, [photos]);

  if (!photos || photos.length === 0) {
    return (
      <div className="aspect-[4/3] w-full rounded-3xl bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400">暂无照片</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-3xl shadow-card group">
        <img
          src={activePhoto?.url}
          alt={activePhoto?.caption || '环境照片'}
          className="aspect-[16/9] w-full object-cover transition-all duration-500"
        />
        {activePhoto?.caption && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent p-5">
            <p className="text-white font-medium">{activePhoto.caption}</p>
          </div>
        )}

        {photos.length > 1 && (
          <>
            <button
              onClick={() =>
                setActiveIndex((activeIndex - 1 + photos.length) % photos.length)
              }
              className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2',
                'h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center',
                'text-gray-700 shadow-lg transition-all duration-200',
                'opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-110'
              )}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setActiveIndex((activeIndex + 1) % photos.length)}
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2',
                'h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center',
                'text-gray-700 shadow-lg transition-all duration-200',
                'opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-110'
              )}
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute right-4 top-4 rounded-full bg-black/50 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white">
              {activeIndex + 1} / {photos.length}
            </div>
          </>
        )}
      </div>

      <div className="relative">
        {photos.length > 5 && (
          <>
            <button
              onClick={() => scrollThumbnail('left')}
              className={cn(
                'absolute left-0 top-1/2 -translate-y-1/2 z-10',
                'h-8 w-8 rounded-full bg-white shadow-md flex items-center justify-center',
                'text-gray-600 hover:bg-gray-50 transition-colors'
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scrollThumbnail('right')}
              className={cn(
                'absolute right-0 top-1/2 -translate-y-1/2 z-10',
                'h-8 w-8 rounded-full bg-white shadow-md flex items-center justify-center',
                'text-gray-600 hover:bg-gray-50 transition-colors'
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        <div
          ref={scrollRef}
          className={cn(
            'flex gap-3 overflow-x-auto scrollbar-hide py-1',
            photos.length > 5 && 'px-10'
          )}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => setActiveIndex(index)}
              className={cn(
                'shrink-0 relative overflow-hidden rounded-2xl transition-all duration-200',
                'h-20 w-28 border-2',
                activeIndex === index
                  ? 'border-brand-500 shadow-float scale-105'
                  : 'border-transparent opacity-70 hover:opacity-100 hover:border-gray-200'
              )}
            >
              <img
                src={photo.url}
                alt={photo.caption || `缩略图 ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
