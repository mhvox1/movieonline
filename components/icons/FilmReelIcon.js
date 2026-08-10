import { jsx as _jsx } from "react/jsx-runtime";
const svgString = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75v-1.5m0 0l-2.25-1.313M12 21.75l2.25-1.313M12 21.75v-1.5M3.375 5.625c1.125 0 2.25.625 2.25 1.375s-1.125 1.375-2.25 1.375S1.125 8.125 1.125 7.375s1.125-1.75 2.25-1.75zM21.375 5.625c1.125 0 2.25.625 2.25 1.375s-1.125 1.375-2.25 1.375-2.25-.625-2.25-1.375S20.25 5.625 21.375 5.625zM12 3.375c1.125 0 2.25.625 2.25 1.375s-1.125 1.375-2.25 1.375S9.75 5.875 9.75 5.125s1.125-1.75 2.25-1.75z" /></svg>`;
const base64Svg = `data:image/svg+xml;base64,${btoa(svgString)}`;
const FilmReelIcon = ({ className }) => {
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
export default FilmReelIcon;
