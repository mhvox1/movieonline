import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const SkillBar = ({ label, value, color = 'bg-blue-500', showValue = true }) => {
    return (_jsxs("div", { className: "mb-2", children: [_jsxs("div", { className: "flex justify-between items-end mb-1", children: [_jsx("span", { className: "text-xs text-gray-300 font-semibold uppercase", children: label }), showValue && _jsxs("span", { className: "text-xs font-mono text-white", children: [Math.round(value), "/100"] })] }), _jsx("div", { className: "w-full bg-gray-700 rounded-full h-2.5 overflow-hidden border border-gray-600", children: _jsx("div", { className: `${color} h-full rounded-full transition-all duration-500 ease-out`, style: { width: `${Math.min(100, Math.max(0, value))}%` } }) })] }));
};
export default SkillBar;
