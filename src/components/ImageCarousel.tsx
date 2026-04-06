'use client';

import { useRef, useState, useCallback } from 'react';

interface Props {
  images: string[];
  height?: number;
}

export default function ImageCarousel({ images, height = 420 }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.offsetWidth);
    setActiveIndex(index);
  }, []);

  const scrollTo = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.offsetWidth, behavior: 'smooth' });
  };

  const prev = () => scrollTo(Math.max(0, activeIndex - 1));
  const next = () => scrollTo(Math.min(images.length - 1, activeIndex + 1));

  if (images.length === 0) return null;

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ height }}>
      {/* Scroll container */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex h-full"
        style={{
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {images.map((src, i) => (
          <div
            key={i}
            style={{ scrollSnapAlign: 'start', minWidth: '100%', height: '100%' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        ))}
      </div>

      {/* Chevron — prev */}
      {images.length > 1 && activeIndex > 0 && (
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full"
          style={{ background: 'rgba(0,0,0,0.35)', color: 'white' }}
          aria-label="Previous image"
        >
          <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
            <path d="M8 2L2 9l6 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {/* Chevron — next */}
      {images.length > 1 && activeIndex < images.length - 1 && (
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full"
          style={{ background: 'rgba(0,0,0,0.35)', color: 'white' }}
          aria-label="Next image"
        >
          <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
            <path d="M2 2l6 7-6 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className="rounded-full transition-all"
              style={{
                width: i === activeIndex ? 20 : 8,
                height: 8,
                background: i === activeIndex ? 'white' : 'rgba(255,255,255,0.5)',
              }}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
