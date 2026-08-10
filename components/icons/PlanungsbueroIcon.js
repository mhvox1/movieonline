import { jsx as _jsx } from "react/jsx-runtime";
const svgString = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="black"><path stroke-linecap="round" stroke-linejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5V7.5c0-1.036.84-1.875 1.875-1.875h13.5c1.036 0 1.875.84 1.875 1.875v10.875m-17.25 0c0 .621.504 1.125 1.125 1.125h15c.621 0 1.125-.504 1.125-1.125m-17.25 0V3.75c0-.621.504-1.125 1.125-1.125h15c.621 0 1.125.504 1.125-1.125v1.5m-17.25 0h.008v.008H3.375v-.008zM9.75 12.75h.008v.008H9.75v-.008zM9.75 15.75h.008v.008H9.75v-.008zM9.75 18.75h.008v.008H9.75v-.008zM12.75 12.75h.008v.008h-.008v-.008zM12.75 15.75h.008v.008h-.008v-.008zM12.75 18.75h.008v.008h-.008v-.008zM15.75 12.75h.008v.008h-.008v-.008zM15.75 15.75h.008v.008h-.008v-.008zM15.75 18.75h.008v.008h-.008v-.008z" /></svg>`;
const base64Svg = `data:image/svg+xml;base64,${btoa(svgString)}`;
const PlanungsbueroIcon = ({ className }) => {
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
export default PlanungsbueroIcon;
