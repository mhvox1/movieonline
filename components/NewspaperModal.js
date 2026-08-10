import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo } from 'react';
import { useGame } from '../contexts/GameContext';
import { useTranslation } from '../hooks/useTranslation';
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
// Lorem ipsum text snippets of varying lengths
const loremLong = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.";
const loremMedium = "Vivamus luctus urna sed urna ultricies ac tempor dui sagittis. In condimentum facilisis porta. Sed nec diam eu diam mattis viverra. Nulla fringilla, orci ac euismod semper, magna diam porttitor mauris, quis sollicitudin sapien justo in libero. Vestibulum mollis mauris enim. Morbi euismod magna ac lorem rutrum elementum. Donec viverra, magna in semper ultrices.";
const loremShort = "Praesent id metus massa, ut blandit odio. Proin quis tortor orci. Etiam at risus et justo dignissim congue. Donec congue lacinia dui, a porttitor lectus condimentum laoreet. Nunc eu.";
const getWeather = (date, t) => {
    const month = date.getMonth(); // 0-11
    const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    let temp = 20;
    let conditions = [];
    // Using translation keys based on month/season
    if (month === 11 || month === 0 || month === 1) { // Winter
        temp = rand(12, 20);
        conditions = t.newspaper.weather.winter;
    }
    else if (month >= 2 && month <= 4) { // Spring
        temp = rand(18, 26);
        conditions = t.newspaper.weather.spring;
    }
    else if (month >= 5 && month <= 8) { // Summer
        temp = rand(26, 35);
        conditions = t.newspaper.weather.summer;
    }
    else { // Autumn
        temp = rand(20, 28);
        conditions = t.newspaper.weather.autumn;
    }
    const selected = pickRandom(conditions);
    // Assuming selected structure from translation matches { condition: string, detail: string }
    return { temp, condition: selected.condition, details: selected.detail };
};
const getWeatherIcon = (condition) => {
    const cond = condition.toLowerCase();
    if (cond.includes("regen") || cond.includes("rain")) {
        return (_jsxs("svg", { className: "h-8 w-8 text-blue-600", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: [_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" }), _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 19l-2 3m0-3l-2 3m5-3l-2 3" })] }));
    }
    if (cond.includes("wölkt") || cond.includes("cloud") || cond.includes("gray") || cond.includes("grau") || cond.includes("gloom") || cond.includes("nebel") || cond.includes("fog")) {
        return (_jsx("svg", { className: "h-8 w-8 text-gray-500", fill: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { d: "M7.02 11.25C7.3 7.78 10.2 5 13.75 5c3.14 0 5.82 2.13 6.68 5.08 2.78.3 4.95 2.65 4.95 5.55 0 3.09-2.51 5.6-5.6 5.6H7.6C3.95 21.25 1 18.3 1 14.65c0-3.35 2.5-6.14 5.75-6.5.09-.29.18-.59.27-.9z" }) }));
    }
    if (cond.includes("teils") || cond.includes("partly") || cond.includes("leicht") || cond.includes("light") || cond.includes("brise") || cond.includes("breeze")) {
        return (_jsxs("svg", { className: "h-8 w-8 text-yellow-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: [_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" }), _jsx("path", { strokeLinecap: "round", "stroke-linejoin": "round", d: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707", className: "text-yellow-400", strokeWidth: 3 })] }));
    }
    if (cond.includes("wind")) {
        return (_jsx("svg", { className: "h-8 w-8 text-blue-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" }) }));
    }
    // Default Sun
    return (_jsx("svg", { className: "h-8 w-8 text-yellow-500", fill: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { d: "M12 7a5 5 0 100 10 5 5 0 000-10zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.29 1.29c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.29 1.29c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L-1.29-1.29zm1.41-13.78c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l1.29 1.29c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L-1.29-1.29zm-13.78 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.29 1.29c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L-1.29-1.29z" }) }));
};
const WeatherWidget = () => {
    const { playerData } = useGame();
    const { t } = useTranslation();
    if (!playerData)
        return null;
    const weather = useMemo(() => getWeather(new Date(playerData.gameDate), t), [playerData.gameDate, t]);
    return (_jsxs("div", { className: "pb-3 px-2", children: [_jsx("h3", { className: "text-xl font-bold font-serif text-black leading-tight mb-3 text-center border-b border-black pb-1", children: t.newspaper.weatherReport }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2 text-left", children: [_jsx("div", { className: "p-1", children: getWeatherIcon(weather.condition) }), _jsx("div", { className: "text-sm font-bold", children: weather.condition })] }), _jsx("div", { className: "text-right", children: _jsxs("div", { className: "text-2xl font-bold font-sans leading-none", children: [weather.temp, "\u00B0C"] }) })] }), _jsx("p", { className: "text-[10px] text-gray-600 italic mt-1 text-left", children: weather.details })] }));
};
// --- New Component: New Releases Article ---
const NewReleasesArticle = () => {
    const { playerData } = useGame();
    const { t } = useTranslation();
    if (!playerData)
        return null;
    const today = new Date(playerData.gameDate);
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    // Combine and filter films
    const recentFilms = useMemo(() => {
        const compFilms = playerData.competitors.flatMap(c => c.completedFilms.map(f => ({
            title: f.title,
            studio: c.name,
            genre: f.genre,
            quality: f.quality,
            releaseDate: new Date(f.releaseDate)
        })));
        const myFilms = playerData.completedFilms
            .filter(f => f.cinemaRelease?.releaseDate)
            .map(f => ({
            title: f.workingTitle,
            studio: playerData.studioName,
            genre: f.genre,
            quality: f.finalQuality || 0,
            releaseDate: new Date(f.cinemaRelease.releaseDate)
        }));
        const combined = [...compFilms, ...myFilms]
            .filter(f => f.releaseDate > oneWeekAgo && f.releaseDate <= today)
            .sort((a, b) => b.quality - a.quality)
            .slice(0, 3);
        return combined;
    }, [playerData.competitors, playerData.completedFilms, playerData.gameDate]);
    return (_jsxs("div", { className: "py-3 px-2", children: [_jsx("h3", { className: "text-xl font-bold font-serif text-black leading-tight mb-3 text-center border-b border-black pb-1", children: t.newspaper.newInCinema }), recentFilms.length > 0 ? (_jsx("div", { className: "space-y-3", children: recentFilms.map((film, idx) => (_jsxs("div", { className: "flex flex-col border-b border-gray-400 last:border-0 pb-2 last:pb-0", children: [_jsx("div", { className: "flex justify-between items-baseline", children: _jsx("span", { className: "font-bold text-sm text-black truncate w-full", children: film.title }) }), _jsxs("div", { className: "flex justify-between items-center mt-0.5", children: [_jsx("span", { className: "text-[10px] text-gray-700 italic truncate max-w-[60%]", children: film.studio }), _jsx("span", { className: "text-[9px] uppercase tracking-wider font-semibold text-gray-600 border border-gray-500 px-1 rounded", children: t.genres[film.genre] || film.genre })] })] }, idx))) })) : (_jsx("div", { className: "text-center py-4", children: _jsx("p", { className: "text-sm text-gray-600 font-serif italic leading-relaxed", children: t.newspaper.noReleases }) })), _jsx("p", { className: "text-[9px] text-gray-500 italic mt-3 text-center font-serif leading-tight", children: t.newspaper.boxOfficeTip })] }));
};
// --- New Component: Stock Market Article ---
const StockMarketArticle = () => {
    const { playerData } = useGame();
    const { t } = useTranslation();
    if (!playerData || !playerData.stocks)
        return null;
    // Calculate changes based on history
    const stockPerformance = playerData.stocks.map(stock => {
        const currentPrice = stock.price;
        const prevPrice = stock.history.length > 1 ? stock.history[stock.history.length - 2] : stock.price;
        const changePercent = prevPrice > 0 ? ((currentPrice - prevPrice) / prevPrice) * 100 : 0;
        return { ...stock, changePercent };
    });
    stockPerformance.sort((a, b) => b.changePercent - a.changePercent);
    const winners = stockPerformance.slice(0, 2);
    const losers = stockPerformance.slice(-2).reverse();
    return (_jsxs("div", { className: "px-2", children: [_jsx("h3", { className: "text-xl font-bold font-serif text-black leading-tight mb-3 text-center border-b border-black pb-1", children: t.newspaper.stockTicker }), _jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { children: [_jsxs("h4", { className: "font-bold text-sm text-green-700 uppercase mb-1 flex items-center gap-1 border-b border-gray-400 pb-0.5", children: [_jsx("span", { children: "\u25B2" }), " ", t.newspaper.winners] }), _jsx("ul", { className: "space-y-1 mt-1", children: winners.map((s) => (_jsxs("li", { className: "text-sm font-serif text-black flex justify-between items-center", children: [_jsx("span", { className: "font-bold truncate mr-2", title: s.name, children: s.name }), _jsxs("span", { className: "text-green-600 font-mono whitespace-nowrap", children: ["+", s.changePercent.toFixed(1), "%"] })] }, s.ticker))) })] }), _jsxs("div", { children: [_jsxs("h4", { className: "font-bold text-sm text-red-700 uppercase mb-1 flex items-center gap-1 border-b border-gray-400 pb-0.5", children: [_jsx("span", { children: "\u25BC" }), " ", t.newspaper.losers] }), _jsx("ul", { className: "space-y-1 mt-1", children: losers.map((s) => (_jsxs("li", { className: "text-sm font-serif text-black flex justify-between items-center", children: [_jsx("span", { className: "font-bold truncate mr-2", title: s.name, children: s.name }), _jsxs("span", { className: "text-red-600 font-mono whitespace-nowrap", children: [s.changePercent.toFixed(1), "%"] })] }, s.ticker))) })] })] })] }));
};
const NewspaperModal = ({ event, onClose }) => {
    const { playerData } = useGame();
    const { t, language } = useTranslation();
    const locale = language === 'de' ? 'de-DE' : 'en-US';
    if (!playerData)
        return null;
    const headlines = useMemo(() => ({
        // FIX: Cast translation values to string arrays to ensure correct type inference.
        local: pickRandom(t.newspaper.headlines.local),
        finance: pickRandom(t.newspaper.headlines.finance),
        sports: pickRandom(t.newspaper.headlines.sports),
        culture: pickRandom(t.newspaper.headlines.culture),
        misc: pickRandom(t.newspaper.headlines.misc),
    }), [event, t]);
    const FillerArticle = ({ text, headline }) => (_jsxs(_Fragment, { children: [_jsx("h3", { className: "text-xl font-bold font-serif text-black leading-tight blur-[2px]", children: headline }), _jsx("p", { className: "text-sm text-gray-700 font-serif leading-normal blur-[2px]", children: text })] }));
    const positionIndex = useMemo(() => Math.floor(Math.random() * 4), [event]);
    const isWideColumnOnLeft = positionIndex < 2;
    const eventSlot = positionIndex % 2;
    const eventTextLengthCategory = useMemo(() => {
        const len = event.text.length;
        if (len > 350)
            return 'long';
        if (len > 200)
            return 'medium';
        return 'short';
    }, [event.text]);
    const adaptiveFillerTexts = useMemo(() => {
        if (eventTextLengthCategory === 'long')
            return [loremShort, loremShort];
        if (eventTextLengthCategory === 'medium')
            return [loremMedium, loremShort];
        return [loremLong, loremMedium];
    }, [eventTextLengthCategory]);
    const mainArticleContent = (_jsxs(_Fragment, { children: [_jsx("h2", { className: "text-xl font-bold font-serif text-black leading-tight", children: event.title }), event.imageUrl && event.id.startsWith('death_') && (_jsx("div", { className: "float-left mr-4 mb-2 mt-1", children: _jsx("div", { className: "w-24 h-24 bg-gray-300 border-2 border-black p-1 shadow-sm", children: _jsx("img", { src: event.imageUrl, alt: "Article Image", className: "w-full h-full object-cover grayscale" }) }) })), _jsx("p", { className: "text-gray-800 text-base mt-2 font-serif leading-relaxed tracking-wide text-justify", dangerouslySetInnerHTML: { __html: event.text } })] }));
    const renderColumn = (type) => {
        const isEventInThisColumn = type === 'wide';
        const defaultTexts = type === 'wide' ? [loremLong, loremMedium, loremShort] : [loremShort, loremLong, loremMedium];
        const columnHeadlines = type === 'wide' ? [headlines.finance, headlines.sports, headlines.misc] : [headlines.local, headlines.culture, headlines.sports];
        const slots = [0, 1, 2].map(i => _jsx(FillerArticle, { text: defaultTexts[i], headline: columnHeadlines[i] }));
        if (isEventInThisColumn) {
            slots[eventSlot] = mainArticleContent;
            const tickerSlot = eventSlot === 0 ? 1 : 0;
            slots[tickerSlot] = _jsx(StockMarketArticle, {});
            slots[2] = _jsx(FillerArticle, { text: adaptiveFillerTexts[1], headline: headlines.misc });
        }
        else if (type === 'narrow') {
            slots[0] = _jsx(WeatherWidget, {});
            slots[1] = _jsx(NewReleasesArticle, {});
            slots[2] = _jsx(FillerArticle, { text: loremShort, headline: headlines.local });
        }
        return (_jsxs(_Fragment, { children: [_jsx("div", { children: slots[0] }), _jsx("div", { className: "pt-4 border-t border-black", children: slots[1] }), _jsx("div", { className: "pt-4 border-t border-black", children: slots[2] })] }));
    };
    const WideColumn = _jsx("div", { className: `col-span-2 flex flex-col gap-y-4 ${isWideColumnOnLeft ? 'pr-5 border-r' : 'pl-5 border-l'} border-black/30`, children: renderColumn('wide') });
    const NarrowColumn = _jsx("div", { className: "col-span-1 flex flex-col gap-y-4", children: renderColumn('narrow') });
    return (_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4", "aria-modal": "true", role: "dialog", onClick: onClose, children: _jsxs("div", { onClick: (e) => e.stopPropagation(), className: "bg-stone-200 rounded-lg shadow-2xl w-full max-w-3xl h-[800px] p-6 text-center border-4 border-gray-600 overflow-hidden flex flex-col", children: [_jsxs("header", { className: "pb-2 mb-4 flex-shrink-0", children: [_jsx("h1", { className: "text-4xl lg:text-5xl font-black font-cinzel text-black tracking-tighter text-center", children: t.newspaper.title }), _jsxs("div", { className: "flex justify-between items-baseline border-t-4 border-b border-double border-black py-1 my-2 text-gray-800", children: [_jsx("span", { className: "text-lg font-bold", children: "$1.20" }), _jsx("p", { className: "text-sm font-semibold", children: new Date(playerData.gameDate).toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) })] })] }), _jsx("main", { className: "grid grid-cols-3 gap-x-5 text-left flex-grow overflow-hidden text-black font-serif", children: isWideColumnOnLeft ? _jsxs(_Fragment, { children: [WideColumn, NarrowColumn] }) : _jsxs(_Fragment, { children: [NarrowColumn, WideColumn] }) }), _jsx("footer", { className: "mt-auto pt-4 flex-shrink-0", children: _jsx("button", { onClick: onClose, className: "bg-gray-700 text-white font-bold py-2 px-10 rounded-sm uppercase tracking-wider transform hover:bg-gray-600 transition-all duration-300 ease-in-out shadow-lg", children: t.common.close }) })] }) }));
};
export default NewspaperModal;
