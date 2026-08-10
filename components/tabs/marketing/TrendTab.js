import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { EmployeeType } from '../../../types';
import { useGame } from '../../../contexts/GameContext';
import PieChartIcon from '../../icons/PieChartIcon';
import { useTranslation } from '../../../hooks/useTranslation';
// Helper Icons for Trends
const TrendUpIcon = () => (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 text-green-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" }) }));
const TrendDownIcon = () => (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 text-red-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" }) }));
const TrendFlatIcon = () => (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M5 12h14" }) }));
const UnknownIcon = () => (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 text-gray-600", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }));
// Pseudo-random number generator to keep values stable for a month/genre combination
const seededRandom = (seed) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    const x = Math.sin(hash) * 10000;
    return x - Math.floor(x);
};
const TrendTab = () => {
    const { playerData } = useGame();
    const { t } = useTranslation();
    if (!playerData)
        return null;
    const hasTech1 = playerData.unlockedTechnologies.includes('res_market_analysis_1');
    const hasTech2 = playerData.unlockedTechnologies.includes('res_market_analysis_2');
    const hasTech3 = playerData.unlockedTechnologies.includes('res_market_analysis_3');
    // Check for Marketing Manager (Employees OR Family)
    const hasManager = useMemo(() => {
        // Check standard employees
        if (playerData.employees.some(e => e.type === EmployeeType.Marketingmanager))
            return true;
        // Check Partner
        if (playerData.partnerIsEmployed && playerData.partnerEmployedAs === EmployeeType.Marketingmanager)
            return true;
        // Check Children
        if (playerData.children.some(c => c.isEmployed && c.employedAs === EmployeeType.Marketingmanager))
            return true;
        return false;
    }, [playerData.employees, playerData.partnerIsEmployed, playerData.partnerEmployedAs, playerData.children]);
    // Calculate Marketing Manager Effective Talent for Precision
    const effectiveManagerTalent = useMemo(() => {
        let bestEffectiveTalent = 0;
        playerData.employees.filter(e => e.type === EmployeeType.Marketingmanager).forEach(e => {
            const eff = e.talent * (e.satisfaction / 100);
            if (eff > bestEffectiveTalent)
                bestEffectiveTalent = eff;
        });
        if (playerData.partnerIsEmployed && playerData.partnerEmployedAs === EmployeeType.Marketingmanager && playerData.partnerSkills) {
            const eff = playerData.partnerSkills.marketing;
            if (eff > bestEffectiveTalent)
                bestEffectiveTalent = eff;
        }
        playerData.children.forEach(c => {
            if (c.isEmployed && c.employedAs === EmployeeType.Marketingmanager && c.skills) {
                const eff = c.skills.marketing;
                if (eff > bestEffectiveTalent)
                    bestEffectiveTalent = eff;
            }
        });
        return bestEffectiveTalent;
    }, [playerData]);
    const isUnlocked = hasTech1 && hasManager;
    // Determine Analysis Quality
    let maxDeviation = 0.5; // 50% default (Tier 1)
    let showArrows = false;
    let analysisLabel = t.marketing.trends.qualityVeryInaccurate;
    let analysisColor = "text-red-400";
    if (hasTech3) {
        maxDeviation = 0.0; // 0% (Tier 3)
        showArrows = true;
        analysisLabel = t.marketing.trends.qualityVeryAccurate;
        analysisColor = "text-green-400";
    }
    else if (hasTech2) {
        maxDeviation = 0.25; // 25% (Tier 2)
        showArrows = true;
        analysisLabel = t.marketing.trends.qualityInaccurate;
        analysisColor = "text-yellow-400";
    }
    // CONCEPT IMPLEMENTATION: Improve accuracy with Talent
    // Formula: New Deviation = BaseDeviation * (1 - (EffTalent / 150));
    // Example: Base 0.25 (Tier 2). Talent 75 -> Factor 0.5 -> New Dev 0.125
    if (maxDeviation > 0 && effectiveManagerTalent > 0) {
        const reductionFactor = Math.min(1, effectiveManagerTalent / 150); // Up to ~66% reduction
        maxDeviation = maxDeviation * (1 - reductionFactor);
        // Update label if significant improvement
        if (hasTech2 && maxDeviation < 0.1) {
            analysisLabel = t.marketing.trends.qualityAccurate; // Upgrade label visually
            analysisColor = "text-green-300";
        }
    }
    if (!isUnlocked) {
        return (_jsx("div", { className: "w-full h-full flex flex-col items-center justify-center bg-gray-800/80 p-6 rounded-lg shadow-2xl border border-gray-700", children: _jsxs("div", { className: "bg-gray-900/50 p-8 rounded-xl border border-gray-600 flex flex-col items-center text-center max-w-md", children: [_jsx(PieChartIcon, { className: "h-16 w-16 text-gray-600 mb-4" }), _jsx("h2", { className: "text-2xl font-bold font-cinzel text-gray-400 mb-4", children: t.marketing.trends.lockedTitle }), _jsx("p", { className: "text-gray-300 mb-6", children: t.marketing.trends.lockedDesc }), _jsxs("div", { className: "w-full space-y-3 text-left bg-black/20 p-4 rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-gray-400", children: t.marketing.trends.reqResearch }), _jsx("span", { className: hasTech1 ? "text-green-400 font-bold" : "text-red-400 font-bold", children: hasTech1 ? t.marketing.trends.reqDone : t.marketing.trends.reqMissing })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-gray-400", children: t.marketing.trends.reqStaff }), _jsx("span", { className: hasManager ? "text-green-400 font-bold" : "text-red-400 font-bold", children: hasManager ? t.marketing.trends.reqHired : t.marketing.trends.reqMissing })] })] })] }) }));
    }
    const trendData = useMemo(() => {
        if (!playerData.genreTrends)
            return [];
        const currentMonthKey = `${playerData.gameDate.getFullYear()}-${playerData.gameDate.getMonth()}`;
        return Object.entries(playerData.genreTrends).map(([genre, data]) => {
            // Calculate perceived popularity based on deviation
            const seed = `${currentMonthKey}-${genre}`;
            const randomFactor = seededRandom(seed); // 0 to 1
            // Deviation range: -maxDeviation to +maxDeviation
            const deviation = (randomFactor - 0.5) * 2 * maxDeviation;
            const perceivedPopularity = data.popularity * (1 + deviation);
            return {
                genre: genre,
                actualPopularity: data.popularity,
                perceivedPopularity: perceivedPopularity,
                momentum: data.momentum,
            };
        }).sort((a, b) => b.perceivedPopularity - a.perceivedPopularity); // Sort by what the player SEES
    }, [playerData.genreTrends, playerData.gameDate, maxDeviation]);
    const getTrendStatus = (popularity) => {
        if (popularity >= 1.3)
            return { text: t.marketing.trends.status.hype, color: "text-fuchsia-400" };
        if (popularity >= 1.1)
            return { text: t.marketing.trends.status.popular, color: "text-green-400" };
        if (popularity <= 0.7)
            return { text: t.marketing.trends.status.dead, color: "text-red-600" };
        if (popularity <= 0.9)
            return { text: t.marketing.trends.status.niche, color: "text-orange-400" };
        return { text: t.marketing.trends.status.stable, color: "text-gray-300" };
    };
    return (_jsx("div", { className: "w-full h-full flex flex-col", children: _jsxs("div", { className: "flex-grow bg-gray-800/80 p-6 rounded-lg shadow-2xl border border-gray-700 overflow-y-auto", children: [_jsxs("div", { className: "flex justify-between items-center mb-6 border-b border-gray-700 pb-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-4xl font-bold font-cinzel text-amber-400", children: t.marketing.trends.title }), _jsx("p", { className: "text-gray-400 text-sm mt-1", children: t.marketing.trends.subtitle })] }), _jsxs("div", { className: "bg-black/30 px-4 py-2 rounded-lg border border-gray-600 text-right", children: [_jsx("p", { className: `text-xs uppercase tracking-wider ${analysisColor}`, children: t.marketing.trends.dataQuality }), _jsx("p", { className: `font-bold ${analysisColor}`, children: analysisLabel })] })] }), _jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4", children: trendData.map((trend) => {
                        const status = getTrendStatus(trend.perceivedPopularity);
                        // Scale 0.5-1.5 to approx 10%-100% for the bar
                        const barWidth = Math.max(5, Math.min(100, (trend.perceivedPopularity - 0.4) * 100));
                        let barColor = 'bg-gray-500';
                        if (trend.perceivedPopularity >= 1.2)
                            barColor = 'bg-fuchsia-500';
                        else if (trend.perceivedPopularity >= 1.05)
                            barColor = 'bg-green-500';
                        else if (trend.perceivedPopularity >= 0.95)
                            barColor = 'bg-yellow-500';
                        else if (trend.perceivedPopularity >= 0.8)
                            barColor = 'bg-orange-500';
                        else
                            barColor = 'bg-red-600';
                        return (_jsxs("div", { className: "bg-gray-900/50 p-3 rounded-lg border border-gray-700 flex items-center gap-4", children: [_jsxs("div", { className: "w-32 flex-shrink-0", children: [_jsx("span", { className: "font-bold text-white block truncate", children: t.genres[trend.genre] }), _jsx("span", { className: `text-xs font-bold ${status.color}`, children: status.text })] }), _jsxs("div", { className: "flex-grow", children: [_jsx("div", { className: "flex justify-end text-xs text-gray-400 mb-1", children: _jsx("span", { className: "text-gray-400", children: t.marketing.trends.demand }) }), _jsxs("div", { className: "w-full bg-gray-800 rounded-full h-3 overflow-hidden relative", children: [!hasTech3 && (_jsx("div", { className: "absolute inset-0 bg-gray-800/30 backdrop-blur-[1px] z-10" })), _jsx("div", { className: `h-full rounded-full transition-all duration-500 ${barColor}`, style: { width: `${barWidth}%` } })] })] }), _jsx("div", { className: "w-8 flex-shrink-0 flex justify-center", title: showArrows ? t.marketing.trends.trendDirection : t.marketing.trends.trendTooltip, children: showArrows ? (trend.momentum > 0.005 ? _jsx(TrendUpIcon, {}) : trend.momentum < -0.005 ? _jsx(TrendDownIcon, {}) : _jsx(TrendFlatIcon, {})) : (_jsx(UnknownIcon, {})) })] }, trend.genre));
                    }) })] }) }));
};
export default TrendTab;
