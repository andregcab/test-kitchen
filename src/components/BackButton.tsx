'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface Props {
  href?: string;
  onClick?: () => void;
}

const style = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  color: 'var(--foreground)',
  width: 44,
  height: 44,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  transition: 'background 150ms ease',
} as const;

export default function BackButton({ href, onClick }: Props) {
  if (href) {
    return (
      <Link href={href} style={style} aria-label="Back">
        <ChevronLeft size={20} strokeWidth={2} />
      </Link>
    );
  }
  return (
    <button onClick={onClick} style={style} aria-label="Back">
      <ChevronLeft size={20} strokeWidth={2} />
    </button>
  );
}
