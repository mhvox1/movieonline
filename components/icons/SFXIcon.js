import { jsx as _jsx } from "react/jsx-runtime";
const svgString = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.115 5.19l.319 1.913A6 6 0 008.11 10.36L9.75 12l-.387.775c-.217.433-.132.956.21 1.298l1.348 1.348c.21.21.329.497.329.795v1.089c0 .426.24.815.622 1.006l.153.076c.433.217.956.132 1.298-.21l.775-.387 1.64.328a6 6 0 002.155-.795l1.913.319c.622.104 1.297-.282 1.51-1.006l1.37-4.112c.105-.316.035-.66-.201-.896L17.5 9.75l.387-.775c.217-.433.132-.956-.21-1.298L16.3 6.3c-.21-.21-.497-.329-.795-.329H14.25c-.426 0-.815.24-.1.622l-.076.153c-.217.433-.132.956.21 1.298l.387.775-1.64-.328a6 6 0 00-2.155.795l-1.913-.319c-.622-.104-1.297.282-1.51 1.006L4.622 15.5" /></svg>`;
const base64Svg = `data:image/svg+xml;base64,${btoa(svgString)}`;
const SFXIcon = ({ className }) => {
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
export default SFXIcon;
