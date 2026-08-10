import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const DashboardWidget = ({ title, children, className }) => (_jsxs("div", { className: `bg-black bg-opacity-60 backdrop-blur-sm border border-gray-700/50 rounded-lg ${className}`, children: [_jsx("h3", { className: "text-lg font-bold font-cinzel text-amber-400 border-b border-gray-700/50 px-4 py-2", children: title }), _jsx("div", { className: "p-4 text-sm", children: children })] }));
export default DashboardWidget;
