export default function BinderIcon({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 32" fill="none" className={className} aria-hidden="true">
      {/* Spine */}
      <rect x="1" y="2" width="6" height="28" rx="2" fill="currentColor" opacity="0.25" />
      {/* Cover */}
      <rect x="5" y="2" width="22" height="28" rx="2" fill="currentColor" opacity="0.12" />
      <rect x="5" y="2" width="22" height="28" rx="2" stroke="currentColor" strokeWidth="1.5" />
      {/* Rings */}
      <circle cx="4" cy="9"  r="2.2" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <circle cx="4" cy="16" r="2.2" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <circle cx="4" cy="23" r="2.2" stroke="currentColor" strokeWidth="1.4" fill="none" />
      {/* Page lines */}
      <line x1="11" y1="11" x2="22" y2="11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      <line x1="11" y1="15" x2="22" y2="15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      <line x1="11" y1="19" x2="18" y2="19" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}
