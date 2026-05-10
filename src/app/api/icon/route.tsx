import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

const HAT_PATH = "M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const size = parseInt(searchParams.get('size') ?? '192', 10);
  const iconSize = Math.round(size * 0.665);

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          background: '#4a6741',
          borderRadius: Math.round(size * 0.225),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
          <path d={HAT_PATH} fill="white" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 17h12" stroke="#4a6741" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { width: size, height: size },
  );
}
