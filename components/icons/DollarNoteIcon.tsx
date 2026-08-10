import React from 'react';

const svgString = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182.553-.44 1.282-.659 2.003-.659.725 0 1.45.22 2.003.659.879.659 2.293.659 3.182 0l.879-.659m-1.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75" /><rect x="2" y="5" width="20" height="14" rx="2" ry="2" fill="none" /></svg>`;
const base64Svg = `data:image/svg+xml;base64,${btoa(svgString)}`;

interface IconProps {
  className?: string;
}

const DollarNoteIcon: React.FC<IconProps> = ({ className }) => {
  const customSvgString = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V8.25c0-.621.504-1.125 1.125-1.125h1.5c.621 0 1.125.504 1.125 1.125v.375m0 0h12.75M12 15V9.75M14.25 12l-2.25 2.25-2.25-2.25" /></svg>`;
  const customBase64 = `data:image/svg+xml;base64,${btoa(customSvgString)}`;
  return (
    <div
      className={className}
      style={{
        backgroundColor: 'currentColor',
        maskImage: `url(${customBase64})`,
        WebkitMaskImage: `url(${customBase64})`,
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
      }}
      aria-hidden="true"
    />
  );
};

export default DollarNoteIcon;
