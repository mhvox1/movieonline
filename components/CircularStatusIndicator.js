import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import DirectorIcon from './icons/DirectorIcon';
import ActorIcon from './icons/ActorIcon';
const CircularStatusIndicator = ({ portraitUrl, loyalty, moral, size, isDirector, isBusy }) => {
    const outerStrokeWidth = size / 14;
    const innerStrokeWidth = size / 14;
    const gap = size / 28;
    const center = size / 2;
    const outerRadius = center - outerStrokeWidth / 2;
    const innerRadius = center - outerStrokeWidth - gap - innerStrokeWidth / 2;
    const outerCircumference = 2 * Math.PI * outerRadius;
    const innerCircumference = 2 * Math.PI * innerRadius;
    // Outer circle is Moral (yellow)
    const moralOffset = outerCircumference - (moral / 100) * outerCircumference;
    // Inner circle is Loyalty (green)
    const loyaltyOffset = innerCircumference - (loyalty / 100) * innerCircumference;
    const imageContainerSize = (innerRadius - innerStrokeWidth / 2) * 2;
    const imageContainerOffset = (size - imageContainerSize) / 2;
    return (_jsxs("div", { className: "relative flex-shrink-0 group", style: { width: size, height: size }, children: [_jsxs("svg", { className: "absolute top-0 left-0 w-full h-full transform -rotate-90", viewBox: `0 0 ${size} ${size}`, children: [_jsx("circle", { className: "text-gray-700", stroke: "currentColor", strokeWidth: outerStrokeWidth, fill: "transparent", r: outerRadius, cx: center, cy: center }), _jsx("circle", { className: "text-gray-700", stroke: "currentColor", strokeWidth: innerStrokeWidth, fill: "transparent", r: innerRadius, cx: center, cy: center }), _jsx("circle", { className: "text-yellow-500 transition-all duration-300", stroke: "currentColor", strokeWidth: outerStrokeWidth, strokeDasharray: outerCircumference, strokeDashoffset: moralOffset, strokeLinecap: "round", fill: "transparent", r: outerRadius, cx: center, cy: center }), _jsx("circle", { className: "text-green-500 transition-all duration-300", stroke: "currentColor", strokeWidth: innerStrokeWidth, strokeDasharray: innerCircumference, strokeDashoffset: loyaltyOffset, strokeLinecap: "round", fill: "transparent", r: innerRadius, cx: center, cy: center })] }), _jsx("div", { className: `absolute w-full h-full rounded-full overflow-hidden bg-gray-700 flex-shrink-0 border-2 border-gray-900 flex items-center justify-center transition-all duration-300 ${isBusy ? 'grayscale' : ''}`, style: { top: imageContainerOffset, left: imageContainerOffset, width: imageContainerSize, height: imageContainerSize }, children: portraitUrl ? (_jsx("img", { src: portraitUrl, alt: "Talent", className: "w-full h-full object-cover rounded-full", draggable: "false" })) : (isDirector
                    ? _jsx(DirectorIcon, { className: "w-full h-full text-gray-400 p-1.5" })
                    : _jsx(ActorIcon, { className: "w-full h-full text-gray-400 p-1.5" })) })] }));
};
export default CircularStatusIndicator;
