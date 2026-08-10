import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const StarIconSVG = ({ fillPercentage, sizeClass }) => {
    const uniqueId = `grad-${Math.random()}`;
    return (_jsxs("svg", { viewBox: "0 0 24 24", className: `${sizeClass} inline-block text-yellow-400`, fill: "none", stroke: "currentColor", strokeWidth: "1.5", children: [_jsx("defs", { children: _jsxs("linearGradient", { id: uniqueId, children: [_jsx("stop", { offset: `${fillPercentage}%`, stopColor: "currentColor" }), _jsx("stop", { offset: `${fillPercentage}%`, stopColor: "#6b7280" })] }) }), _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.31h5.418a.562.562 0 01.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 21.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988h5.418a.563.563 0 00.475-.31L11.48 3.5z", fill: `url(#${uniqueId})` })] }));
};
const StarRating = ({ rating, isTestMode = false, showValue = true, size = 'sm', isRevealed = true }) => {
    const starValue = isRevealed ? rating / 10 : 0;
    const stars = [];
    const sizeClass = size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-8 w-8';
    for (let i = 1; i <= 10; i++) {
        let fillPercentage = 0;
        if (i <= starValue) {
            fillPercentage = 100; // Full star
        }
        else if (i - 0.5 <= starValue) {
            fillPercentage = 50; // Half star
        }
        stars.push(_jsx(StarIconSVG, { fillPercentage: fillPercentage, sizeClass: sizeClass }, i));
    }
    const displayTitle = isRevealed ? `${Math.round(rating)}/100` : 'Fähigkeit unbekannt';
    return (_jsxs("div", { className: "flex items-center gap-1", title: displayTitle, children: [_jsx("span", { className: "flex items-center", children: stars }), isTestMode && showValue && isRevealed && _jsxs("span", { className: "text-xs text-gray-400 ml-1", children: ["(", Math.round(rating), ")"] })] }));
};
export default StarRating;
