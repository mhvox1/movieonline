import React from 'react';

const svgString = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.5-13.5v.75m-12-1.5v.75m12-1.5v.75m-12-1.5v.75M12 3v1.5m0 16.5v1.5m-3-1.5v-1.5m6 0v-1.5" /></svg>`;
const base64Svg = `data:image/svg+xml;base64,${btoa(svgString)}`;

interface IconProps {
  className?: string;
}

const LocationIcon: React.FC<IconProps> = ({ className }) => {
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

export default LocationIcon;