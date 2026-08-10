import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const HeartIconSVG = ({ fillPercentage, sizeClass }) => {
    const uniqueId = `grad-heart-${Math.random()}`;
    return (_jsxs("svg", { viewBox: "0 0 24 24", className: `${sizeClass} inline-block text-red-500`, fill: "none", stroke: "currentColor", strokeWidth: "1.5", children: [_jsx("defs", { children: _jsxs("linearGradient", { id: uniqueId, children: [_jsx("stop", { offset: `${fillPercentage}%`, stopColor: "currentColor" }), _jsx("stop", { offset: `${fillPercentage}%`, stopColor: "#6b7280" }), " "] }) }), _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z", fill: `url(#${uniqueId})` })] }));
};
const HeartRating = ({ rating, isTestMode = false, showValue = true, size = 'sm' }) => {
    const heartValue = rating / 10;
    const hearts = [];
    const sizeClass = size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-8 w-8';
    for (let i = 1; i <= 10; i++) {
        let fillPercentage = 0;
        if (i <= heartValue) {
            fillPercentage = 100; // Full heart
        }
        else if (i - 0.5 <= heartValue) {
            fillPercentage = 50; // Half heart
        }
        hearts.push(_jsx(HeartIconSVG, { fillPercentage: fillPercentage, sizeClass: sizeClass }, i));
    }
    const displayTitle = `${Math.round(rating)}/100`;
    return (_jsxs("div", { className: "flex items-center gap-1", title: displayTitle, children: [_jsx("span", { className: "flex items-center", children: hearts }), isTestMode && showValue && _jsxs("span", { className: "text-xs text-gray-400 ml-1", children: ["(", Math.round(rating), ")"] })] }));
};
export default HeartRating;
