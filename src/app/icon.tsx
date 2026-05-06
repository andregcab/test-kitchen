import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

// Lucide ChefHat path — closed shape, fills cleanly as a solid silhouette
const HAT_PATH = "M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          background: '#4a6741',
          borderRadius: 115,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* viewBox 24x24 → rendered at 340px gives good weight at all favicon sizes */}
        <svg width="340" height="340" viewBox="0 0 24 24" fill="none">
          <path d={HAT_PATH} fill="white" strokeLinecap="round" strokeLinejoin="round" />
          {/* Brim divider line — slightly darker so it reads at larger sizes */}
          <path d="M6 17h12" stroke="#4a6741" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { width: 512, height: 512 },
  );
}
