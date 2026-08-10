
import React from 'react';

const svgString = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9.75v6.75m0 0l-3-3m3 3l3-3m-8.25 6a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>`; // Fallback generic

// Actually let's use a real bug icon
const bugSvgString = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75M12 8.25a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5zM3 15.75l3.75-3.75M3 15.75h6M21 15.75l-3.75-3.75M21 15.75h-6" /></svg>`;

// Correct Bug Icon
const properBugSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.854 1.591-2.16.815-.266 1.62-.572 2.409-.916a23.957 23.957 0 00-3.32-6.51m-6 6.51c.642.343 1.332.65 2.053.915.933.307 1.591 1.178 1.591 2.16v.192m-6-8.58a14.397 14.397 0 01-3.32-6.51 24.12 24.12 0 013.32-6.51m6-6.51a14.397 14.397 0 013.32 6.51M9 13.5v-3m6 3v-3" /></svg>`;
const base64Svg = `data:image/svg+xml;base64,${btoa(properBugSvg)}`;

interface IconProps {
  className?: string;
}

const BugIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <div
      className={className}
      style={{
        backgroundColor: 'currentColor',
        maskImage: `url(${base64Svg})`,
        WebkitMaskImage: `url(${base64Svg})`,
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
      }}
      aria-hidden="true"
    />
  );
};

export default BugIcon;
