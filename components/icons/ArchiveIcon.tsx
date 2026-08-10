import React from 'react';

const svgString = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="black"><path stroke-linecap="round" stroke-linejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>`;
const base64Svg = `data:image/svg+xml;base64,${btoa(svgString)}`;

interface IconProps {
  className?: string;
}

const ArchiveIcon: React.FC<IconProps> = ({ className }) => {
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

export default ArchiveIcon;
