import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const size = parseInt(searchParams.get('size') ?? '192', 10);

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          background: '#c04a12',
          borderRadius: size * 0.22,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: size * 0.04,
          }}
        >
          {/* Pot body */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Steam lines */}
            <div style={{ display: 'flex', gap: size * 0.06, marginBottom: size * 0.03 }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: size * 0.025,
                    height: size * 0.1,
                    background: 'rgba(255,255,255,0.7)',
                    borderRadius: size * 0.02,
                  }}
                />
              ))}
            </div>
            {/* Lid */}
            <div
              style={{
                width: size * 0.42,
                height: size * 0.06,
                background: 'white',
                borderRadius: size * 0.03,
                marginBottom: size * 0.01,
              }}
            />
            {/* Pot */}
            <div
              style={{
                width: size * 0.44,
                height: size * 0.28,
                background: 'white',
                borderRadius: `${size * 0.04}px ${size * 0.04}px ${size * 0.12}px ${size * 0.12}px`,
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
              }}
            >
              {/* Handles */}
              <div
                style={{
                  position: 'absolute',
                  left: -(size * 0.06),
                  top: size * 0.06,
                  width: size * 0.06,
                  height: size * 0.1,
                  background: 'white',
                  borderRadius: size * 0.02,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  right: -(size * 0.06),
                  top: size * 0.06,
                  width: size * 0.06,
                  height: size * 0.1,
                  background: 'white',
                  borderRadius: size * 0.02,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}
