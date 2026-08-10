import { jsx as _jsx } from "react/jsx-runtime";
const svgString = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-1.5m-15-13.5H18M15 7.5h3" /></svg>`;
const base64Svg = `data:image/svg+xml;base64,${btoa(svgString)}`;
const AusstattungIcon = ({ className }) => {
    return (_jsx("div", { className: className, style: {
            backgroundColor: 'currentColor',
            maskImage: `url(${base64Svg})`,
            WebkitMaskImage: `url(${base64Svg})`,
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
        }, "aria-hidden": "true" }));
};
export default AusstattungIcon;
