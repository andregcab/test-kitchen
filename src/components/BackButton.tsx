'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface Props {
  href?: string;
  onClick?: () => void;
}

const cls = 'flex items-center justify-center w-11 h-11 rounded-full flex-shrink-0 bg-white/65 hover:bg-white/85 transition-all active:scale-[0.97]';

export default function BackButton({ href, onClick }: Props) {
  if (href) {
    return (
      <Link href={href} className={cls} aria-label="Back">
        <ChevronLeft size={20} strokeWidth={2} />
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={cls} aria-label="Back">
      <ChevronLeft size={20} strokeWidth={2} />
    </button>
  );
}
