import React from 'react';

const svgString = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="black"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5m3-15H5.25a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V5.25A2.25 2.25 0 0018.75 3z" /></svg>`;
const base64Svg = `data:image/svg+xml;base64,${btoa(svgString)}`;

interface IconProps {
  className?: string;
}

const LaufendeKrediteIcon: React.FC<IconProps> = ({ className }) => {
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

export default LaufendeKrediteIcon;
