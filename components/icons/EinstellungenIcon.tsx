import React from 'react';

const svgString = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="black"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.26.716.53 1.003l.968.968c.27.27.63.417 1.003.53l1.28.213c.542.09.94.56.94 1.11v2.594c0 .55-.398 1.02-.94 1.11l-1.28.213c-.374.063-.716.26-1.003.53l-.968.968c-.27.27-.417.63-.53 1.003l-.213 1.28c-.09.542-.56.94-1.11.94h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.26-.716-.53-1.003l-.968-.968c-.27-.27-.63-.417-1.003-.53l-1.28-.213c-.542-.09-.94-.56-.94-1.11V9.594c0-.55.398-1.02.94-1.11l1.28-.213c.374-.063.716.26 1.003.53l.968.968c.27.27.417.63.53 1.003l.213 1.28z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`;
const base64Svg = `data:image/svg+xml;base64,${btoa(svgString)}`;

interface IconProps {
  className?: string;
}

const EinstellungenIcon: React.FC<IconProps> = ({ className }) => {
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

export default EinstellungenIcon;
