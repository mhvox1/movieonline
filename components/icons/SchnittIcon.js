import { jsx as _jsx } from "react/jsx-runtime";
const svgString = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="black"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" /><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 9.75L4.5 3l.938 6.75m0 0L12 9.75l6.562-6.75L19.5 9.75" /></svg>`;
const base64Svg = `data:image/svg+xml;base64,${btoa(svgString)}`;
const SchnittIcon = ({ className }) => {
    return (_jsx("div", { className: className, style: {
            backgroundColor: 'currentColor',
            maskImage: `url(${base64Svg})`,
            WebkitMaskImage: `url(${base64Svg})`,
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            width: '1em',
            height: '1em'
        }, "aria-hidden": "true" }));
};
export default SchnittIcon;
