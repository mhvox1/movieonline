import { jsx as _jsx } from "react/jsx-runtime";
const svgString = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 10.5v-.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v.875m19.5 0v.875c0 .621-.504 1.125-1.125 1.125H3.375c-.621 0-1.125-.504-1.125-1.125v-.875m19.5 0-2.296-4.133a.563.563 0 00-.92-.225l-1.407.938-1.92-2.88a.563.563 0 00-.928-.063l-1.428 1.903-1.18-2.36a.563.563 0 00-1.003-.039l-1.92 3.84-1.428-1.428a.563.563 0 00-.796 0l-1.92 1.92-1.407-.938a.563.563 0 00-.92.225L2.25 10.5" /></svg>`;
const base64Svg = `data:image/svg+xml;base64,${btoa(svgString)}`;
const CateringIcon = ({ className }) => {
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
export default CateringIcon;
