import { jsx as _jsx } from "react/jsx-runtime";
const svgString = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.722.372c-1.07.107-2.13-.387-2.5-1.456l-.364-1.092a1.875 1.875 0 00-3.415 0l-.364 1.092c-.37.969-1.43 1.563-2.5 1.456l-3.722-.372a2.1 2.1 0 01-1.98-2.193v-4.286c0-.97.616-1.813 1.5-2.097m14.25 0a2.25 2.25 0 00-2.25-2.25H5.25a2.25 2.25 0 00-2.25 2.25m14.25 0-1.875 1.875M3.75 8.511L5.625 10.386m0 0L7.5 8.511" /></svg>`;
const base64Svg = `data:image/svg+xml;base64,${btoa(svgString)}`;
const ChatBubbleIcon = ({ className }) => {
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
export default ChatBubbleIcon;
