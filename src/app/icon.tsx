import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          background: '#f97316',
          borderRadius: 112,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Stylised pot / chef hat silhouette — a simple flame */}
        <svg width="300" height="300" viewBox="0 0 100 100" fill="none">
          {/* Pot body */}
          <rect x="20" y="45" width="60" height="42" rx="10" fill="white" />
          {/* Pot rim */}
          <rect x="14" y="40" width="72" height="10" rx="5" fill="white" />
          {/* Left handle */}
          <rect x="6" y="43" width="14" height="8" rx="4" fill="white" />
          {/* Right handle */}
          <rect x="80" y="43" width="14" height="8" rx="4" fill="white" />
          {/* Steam lines */}
          <path d="M38 32 Q34 24 38 16 Q42 8 38 2" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M50 32 Q46 24 50 16 Q54 8 50 2" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M62 32 Q58 24 62 16 Q66 8 62 2" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    ),
    { width: 512, height: 512 },
  );
}
