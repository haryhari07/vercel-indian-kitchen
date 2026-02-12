import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 24,
          background: 'transparent',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          width="32"
          height="32"
          style={{ width: '100%', height: '100%' }}
        >
          {/* Professional Clay Pot Icon - Clean & Bold */}
          <defs>
            <linearGradient id="potGradient" x1="256" y1="150" x2="256" y2="450" gradientUnits="userSpaceOnUse">
              <stop stopColor="#EA580C" />
              <stop offset="1" stopColor="#9A3412" />
            </linearGradient>
          </defs>
          
          {/* Main Pot Body */}
          <path
            d="M110 200 C 110 200, 100 450, 256 450 C 412 450, 402 200, 402 200 Z"
            fill="url(#potGradient)"
          />
          
          {/* Pot Rim */}
          <rect x="90" y="160" width="332" height="40" rx="10" fill="#C2410C" stroke="#7C2D12" strokeWidth="10" />
          
          {/* Steam / Aroma - Stylized */}
          <path d="M256 60 Q 220 100 256 140" stroke="#F97316" strokeWidth="20" strokeLinecap="round" opacity="0.9" fill="none" />
          <path d="M190 80 Q 150 120 190 150" stroke="#F97316" strokeWidth="15" strokeLinecap="round" opacity="0.8" fill="none" />
          <path d="M322 80 Q 360 120 322 150" stroke="#F97316" strokeWidth="15" strokeLinecap="round" opacity="0.8" fill="none" />
        </svg>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  );
}
