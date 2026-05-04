'use client';

import { useEffect, useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function BottomSheet({ isOpen, onClose, title, children }: Props) {
  const [mounted, setMounted] = useState(false);
  const [animIn, setAnimIn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // Double RAF ensures the initial translateY(100%) is painted before transitioning to 0
      const id = requestAnimationFrame(() =>
        requestAnimationFrame(() => setAnimIn(true)),
      );
      return () => cancelAnimationFrame(id);
    } else {
      setAnimIn(false);
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{ background: 'rgba(0,0,0,0.4)', opacity: animIn ? 1 : 0 }}
        onClick={onClose}
      />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-3xl transition-transform duration-300"
        style={{
          background: 'var(--background)',
          maxHeight: '85vh',
          transform: animIn ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border)' }} />
        </div>
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl font-bold"
            style={{ color: 'var(--muted)', background: 'var(--card)' }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-6 py-5 pb-28">
          {children}
        </div>
      </div>
    </>
  );
}
