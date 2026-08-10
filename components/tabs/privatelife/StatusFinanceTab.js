import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { useGame } from '../../../contexts/GameContext';
import { MaritalStatus } from '../../../types';
import { ALL_PROPERTIES, SCHOOL_TYPES, SECONDARY_SCHOOL_TYPES, UNIVERSITY_TYPES } from '../../privateLifeData';
import { useTranslation } from '../../../hooks/useTranslation';
const TabButton = ({ title, isActive, onClick }) => (_jsx("button", { onClick: onClick, className: `py-2 px-6 font-bold text-base transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-amber-500/50 relative top-px
            ${isActive
        ? 'bg-gray-800/80 text-amber-400 border-gray-700 border-t border-x rounded-t-lg'
        : 'bg-gray-900/50 text-gray-300 hover:text-amber-400 hover:bg-gray-800/50 border-b border-gray-700'}`, children: title }));
// Helper component for mini sparkline chart (Replicated here for self-containment)
const StockSparkline = ({ data, color, height = 40, noDataText }) => {
    if (!data || data.length < 2)
        return _jsx("div", { className: `h-[${height}px] w-full bg-gray-900/30 rounded flex items-center justify-center text-xs text-gray-500`, children: noDataText });
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 100;
    const points = data.map((val, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');
    return (_jsx("svg", { width: "100%", height: height, viewBox: `0 0 ${width} ${height}`, preserveAspectRatio: "none", className: "opacity-80", children: _jsx("polyline", { fill: "none", stroke: color, strokeWidth: "2", points: points, vectorEffect: "non-scaling-stroke" }) }));
};
export const StatusFinanceTab = () => {
    const { playerData, setPlayerData } = useGame();
    const { t, language } = useTranslation();
    const locale = language === 'de' ? 'de-DE' : 'en-US';
    const [subTab, setSubTab] = useState('finance');
    const [timeRange, setTimeRange] = useState('1Y');
    const [selectedStockTicker, setSelectedStockTicker] = useState(null);
    const [buyAmounts, setBuyAmounts] = useState({});
    const [sellAmounts, setSellAmounts] = useState({});
    // Donation State
    const [donationAmount, setDonationAmount] = useState(0);
    const [showDonationConfirm, setShowDonationConfirm] = useState(false);
    if (!playerData)
        return null;
    const formatCurrency = (value) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
    const isTestMode = playerData.playerName === 'Max Mustermann' && playerData.studioName === 'Teststudio';
    // Stock Market Helpers
    const getVisibleHistory = (history) => {
        if (!history || history.length === 0)
            return [];
        switch (timeRange) {
            case '1Y': return history.slice(-52);
            case '6M': return history.slice(-26);
            case '3M': return history.slice(-13);
            case '1M': return history.slice(-4);
            case '1W': return history.slice(-2);
            case '1D': return history.slice(-2);
            default: return history;
        }
    };
    const calculateTrendPercent = (history, range, currentPrice) => {
        if (!history || history.length < 2)
            return 0;
        let weeksBack = 1;
        switch (range) {
            case '1Y':
                weeksBack = 52;
                break;
            case '6M':
                weeksBack = 26;
                break;
            case '3M':
                weeksBack = 13;
                break;
            case '1M':
                weeksBack = 4;
                break;
            case '1W':
                weeksBack = 1;
                break;
            case '1D':
                weeksBack = 1;
                break;
        }
        const startIndex = Math.max(0, history.length - 1 - weeksBack);
        const startPrice = history[startIndex];
        if (!startPrice)
            return 0;
        return ((currentPrice - startPrice) / startPrice) * 100;
    };
    const handleBuyAmountChange = (ticker, value) => {
        const stock = playerData.stocks.find(s => s.ticker === ticker);
        if (!stock)
            return;
        const maxCanBuy = isTestMode ? 10000 : Math.floor(playerData.privateCapital / stock.price);
        let numValue = parseInt(value, 10);
        if (isNaN(numValue) || numValue < 0)
            numValue = 0;
        if (numValue > maxCanBuy)
            numValue = maxCanBuy;
        setBuyAmounts(p => ({ ...p, [ticker]: numValue }));
    };
    const handleBuyStock = (ticker) => {
        const stock = playerData.stocks.find(s => s.ticker === ticker);
        const amount = buyAmounts[ticker] || 0;
        if (!stock || amount <= 0)
            return;
        const cost = stock.price * amount;
        if (playerData.privateCapital < cost && !isTestMode)
            return;
        setPlayerData(prev => {
            if (!prev)
                return null;
            const oldPortfolioData = prev.privatePortfolio[ticker] || { shares: 0, totalCost: 0 };
            const newPortfolioData = {
                shares: oldPortfolioData.shares + amount,
                totalCost: oldPortfolioData.totalCost + cost,
            };
            // Note: Private stock transactions are NOT logged in studio transaction log
            return {
                ...prev,
                privateCapital: prev.privateCapital - cost,
                privatePortfolio: { ...prev.privatePortfolio, [ticker]: newPortfolioData }
            };
        });
        setBuyAmounts(prev => ({ ...prev, [ticker]: 0 }));
    };
    const handleSellAmountChange = (ticker, value) => {
        const sharesOwned = playerData.privatePortfolio[ticker]?.shares || 0;
        let numValue = parseInt(value, 10);
        if (isNaN(numValue) || numValue < 0)
            numValue = 0;
        if (numValue > sharesOwned)
            numValue = Math.floor(sharesOwned);
        setSellAmounts(p => ({ ...p, [ticker]: numValue }));
    };
    const handleSellStock = (ticker) => {
        const stock = playerData.stocks.find(s => s.ticker === ticker);
        const amount = sellAmounts[ticker] || 0;
        const sharesOwned = playerData.privatePortfolio[ticker]?.shares || 0;
        if (!stock || sharesOwned < amount || amount <= 0)
            return;
        const revenue = stock.price * amount;
        setPlayerData(prev => {
            if (!prev)
                return null;
            const oldPortfolioData = prev.privatePortfolio[ticker];
            const avgPrice = oldPortfolioData.shares > 0 ? oldPortfolioData.totalCost / oldPortfolioData.shares : 0;
            const costOfSoldShares = avgPrice * amount;
            const newShares = oldPortfolioData.shares - amount;
            const newPortfolio = { ...prev.privatePortfolio };
            if (newShares <= 0.001) {
                delete newPortfolio[ticker];
            }
            else {
                newPortfolio[ticker] = {
                    shares: newShares,
                    totalCost: oldPortfolioData.totalCost - costOfSoldShares,
                };
            }
            return {
                ...prev,
                privateCapital: prev.privateCapital + revenue,
                privatePortfolio: newPortfolio
            };
        });
        setSellAmounts(prev => ({ ...prev, [ticker]: 0 }));
    };
    const selectedStock = useMemo(() => {
        if (!selectedStockTicker)
            return null;
        return playerData.stocks.find(s => s.ticker === selectedStockTicker);
    }, [selectedStockTicker, playerData.stocks]);
    const portfolioStocks = Object.keys(playerData.privatePortfolio || {});
    // Calculate total portfolio value
    const totalPortfolioValue = useMemo(() => {
        return portfolioStocks.reduce((sum, ticker) => {
            const stock = playerData.stocks.find(s => s.ticker === ticker);
            const entry = playerData.privatePortfolio[ticker];
            if (stock && entry) {
                return sum + (entry.shares * stock.price);
            }
            return sum;
        }, 0);
    }, [portfolioStocks, playerData.stocks, playerData.privatePortfolio]);
    // Income Calculation
    let partnerContribution = 0;
    const isSharedIncome = [MaritalStatus.Dating, MaritalStatus.Engaged, MaritalStatus.Married].includes(playerData.maritalStatus);
    if (isSharedIncome) {
        if (playerData.partnerIsEmployed) {
            if (playerData.partnerEmployedAs === 'Actor' || playerData.partnerEmployedAs === 'Director') {
                partnerContribution = 0; // Talent gets no fixed salary
            }
            else {
                const employee = playerData.employees.find(e => e.name === playerData.partnerName);
                if (employee)
                    partnerContribution = employee.salary;
            }
        }
        else if (playerData.partnerSalary) {
            partnerContribution = playerData.partnerSalary;
        }
    }
    // Real Estate Calculation
    let realEstateIncome = 0;
    let realEstateExpenses = 0;
    // Income from rented properties
    playerData.rentedProperties.forEach(id => {
        const p = ALL_PROPERTIES.find(prop => prop.id === id);
        if (p)
            realEstateIncome += (p.rentalIncome || 0);
    });
    // Expenses (Upkeep of owned + Rent of current if not owned)
    playerData.ownedProperties.forEach(id => {
        const p = ALL_PROPERTIES.find(prop => prop.id === id);
        if (p)
            realEstateExpenses += p.monthlyCost;
    });
    // Add rent cost if living in a property not owned (e.g. initial rental)
    const currentProp = ALL_PROPERTIES.find(p => p.id === playerData.activePropertyId);
    if (currentProp && !playerData.ownedProperties.includes(currentProp.id)) {
        realEstateExpenses += currentProp.monthlyCost;
    }
    // NEW: Education Expenses Calculation
    let educationExpenses = 0;
    playerData.children.forEach(child => {
        if (child.schoolId) {
            const school = SCHOOL_TYPES.find(s => s.id === child.schoolId) ||
                SECONDARY_SCHOOL_TYPES.find(s => s.id === child.schoolId) ||
                UNIVERSITY_TYPES.find(s => s.id === child.schoolId);
            if (school && school.monthlyCost > 0)
                educationExpenses += school.monthlyCost;
        }
    });
    // Updated Household Income Formula (subtracting education expenses)
    const householdIncome = playerData.ceoSalary + partnerContribution + realEstateIncome - realEstateExpenses - educationExpenses;
    const handleDonationSliderChange = (e) => {
        const val = Number(e.target.value);
        if (val > playerData.privateCapital) {
            setDonationAmount(playerData.privateCapital);
        }
        else {
            setDonationAmount(val);
        }
    };
    const confirmDonation = () => {
        if (donationAmount <= 0)
            return;
        setPlayerData(prev => {
            if (!prev)
                return null;
            if (prev.privateCapital < donationAmount)
                return prev; // Safety check
            return {
                ...prev,
                privateCapital: prev.privateCapital - donationAmount,
                capital: prev.capital + donationAmount,
                transactionLog: [
                    ...prev.transactionLog,
                    {
                        date: new Date(prev.gameDate),
                        type: 'Einnahme',
                        category: 'Finanzen',
                        description: `Privateinlage (${prev.playerName})`,
                        amount: donationAmount
                    }
                ]
            };
        });
        setDonationAmount(0);
        setShowDonationConfirm(false);
    };
    return (_jsxs("div", { className: "w-full h-full flex flex-col bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden", children: [_jsxs("div", { className: "p-4 border-b border-gray-700 bg-gray-800/60 flex items-center justify-between", children: [_jsx("h2", { className: "text-2xl font-bold font-cinzel text-amber-400", children: t.privatelife.screen.nav.status }), _jsxs("div", { className: "text-sm text-gray-400", children: [t.privatelife.status.privateCapital, ": ", _jsx("span", { className: "font-bold text-white ml-2", children: formatCurrency(playerData.privateCapital) })] })] }), _jsxs("div", { className: "flex-shrink-0 px-6 pt-4 border-b border-gray-700 bg-gray-800/30", children: [_jsx(TabButton, { title: t.privatelife.status.tabs.finance, isActive: subTab === 'finance', onClick: () => setSubTab('finance') }), _jsx(TabButton, { title: t.privatelife.status.tabs.stockMarket, isActive: subTab === 'stock_market', onClick: () => setSubTab('stock_market') }), _jsx(TabButton, { title: t.privatelife.status.tabs.portfolio, isActive: subTab === 'portfolio', onClick: () => setSubTab('portfolio') })] }), _jsxs("div", { className: "flex-grow p-6 overflow-y-auto", children: [subTab === 'finance' && (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "grid grid-cols-2 gap-8", children: [_jsxs("div", { className: "text-left bg-gray-800/60 p-4 rounded-lg border border-gray-700", children: [_jsx("p", { className: "text-sm text-amber-400 uppercase tracking-wider mb-2", children: t.privatelife.status.householdIncome }), _jsxs("div", { className: "space-y-2 mb-4", children: [_jsxs("div", { className: "flex justify-between", children: [_jsxs("span", { className: "text-gray-400", children: [t.privatelife.status.yourSalary, ":"] }), _jsx("span", { className: "text-white font-bold", children: formatCurrency(playerData.ceoSalary) })] }), partnerContribution > 0 && (_jsxs("div", { className: "flex justify-between", children: [_jsxs("span", { className: "text-gray-400", children: [t.privatelife.status.partner, " (", playerData.partnerJob || (playerData.partnerIsEmployed ? playerData.partnerEmployedAs : t.privatelife.status.unemployed), "):"] }), _jsx("span", { className: "text-white font-bold", children: formatCurrency(partnerContribution) })] })), realEstateIncome > 0 && (_jsxs("div", { className: "flex justify-between", children: [_jsxs("span", { className: "text-gray-400", children: [t.privatelife.status.realEstateIncome, ":"] }), _jsxs("span", { className: "text-green-400 font-bold", children: ["+", formatCurrency(realEstateIncome)] })] })), realEstateExpenses > 0 && (_jsxs("div", { className: "flex justify-between", children: [_jsxs("span", { className: "text-gray-400", children: [t.privatelife.status.realEstateCost, ":"] }), _jsxs("span", { className: "text-red-400 font-bold", children: ["-", formatCurrency(realEstateExpenses)] })] })), educationExpenses > 0 && (_jsxs("div", { className: "flex justify-between", children: [_jsxs("span", { className: "text-gray-400", children: [t.privatelife.status.educationCosts, ":"] }), _jsxs("span", { className: "text-red-400 font-bold", children: ["-", formatCurrency(educationExpenses)] })] })), _jsxs("div", { className: "border-t border-gray-600 pt-2 flex justify-between", children: [_jsxs("span", { className: "text-white font-bold", children: [t.privatelife.status.totalNet, ":"] }), _jsx("span", { className: `${householdIncome >= 0 ? 'text-green-400' : 'text-red-400'} font-bold text-xl`, children: formatCurrency(householdIncome) })] })] }), _jsx("p", { className: "text-xs text-gray-500 mt-2", children: t.privatelife.status.salaryDesc })] }), _jsxs("div", { className: "text-left bg-gray-800/60 p-4 rounded-lg border border-gray-700 flex flex-col justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-amber-400 uppercase tracking-wider mb-2", children: t.privatelife.status.privateCapital }), _jsx("p", { className: "text-3xl font-bold text-white", children: formatCurrency(playerData.privateCapital) }), _jsx("p", { className: "text-xs text-gray-500 mt-2", children: t.privatelife.status.privateCapitalDesc })] }), _jsxs("div", { className: "mt-6 pt-4 border-t border-gray-600", children: [_jsx("p", { className: "text-sm text-amber-400 uppercase tracking-wider mb-2 font-bold", children: t.privatelife.status.donateToStudio }), _jsx("p", { className: "text-xs text-gray-400 mb-3", children: t.privatelife.status.donateToStudioDesc }), _jsxs("div", { className: "flex items-center gap-4 mb-2", children: [_jsx("input", { type: "range", min: "0", max: playerData.privateCapital, step: 100, value: donationAmount, onChange: handleDonationSliderChange, className: "flex-grow h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500", disabled: playerData.privateCapital <= 0 }), _jsx("div", { className: "w-24 text-right font-mono font-bold text-white", children: formatCurrency(donationAmount) })] }), _jsx("button", { onClick: () => setShowDonationConfirm(true), disabled: donationAmount <= 0, className: "w-full bg-green-700 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-2 rounded uppercase text-xs transition-colors", children: t.privatelife.status.donateAction })] })] })] }), _jsxs("div", { className: "bg-gray-800/60 p-6 rounded-lg border border-gray-700", children: [_jsx("h3", { className: "text-lg font-bold text-white mb-4", children: t.privatelife.status.bonusHistory }), playerData.ceoBonusHistory && playerData.ceoBonusHistory.length > 0 ? (_jsxs("table", { className: "w-full text-left text-sm", children: [_jsx("thead", { className: "text-gray-400 uppercase border-b border-gray-600", children: _jsxs("tr", { children: [_jsx("th", { className: "py-2", children: t.privatelife.status.year }), _jsx("th", { className: "py-2 text-right", children: t.privatelife.status.amount })] }) }), _jsx("tbody", { className: "text-gray-300", children: [...playerData.ceoBonusHistory].reverse().map((entry, index) => (_jsxs("tr", { className: "border-b border-gray-700/50", children: [_jsx("td", { className: "py-2", children: entry.year }), _jsxs("td", { className: "py-2 text-right font-mono text-green-400", children: ["+", formatCurrency(entry.amount)] })] }, index))) })] })) : (_jsx("p", { className: "text-gray-500 italic text-center py-4", children: t.privatelife.status.noBonuses }))] })] })), subTab === 'stock_market' && (_jsxs("div", { className: "flex flex-col h-full bg-gray-900/90 rounded-lg border border-gray-700 overflow-hidden", children: [_jsxs("div", { className: "p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/50", children: [_jsx("h2", { className: "text-xl font-cinzel text-amber-400", children: t.finanzen.stockMarket.buy }), _jsxs("select", { value: timeRange, onChange: (e) => setTimeRange(e.target.value), className: "bg-gray-800 border border-gray-600 rounded-md p-1 text-white text-sm focus:ring-amber-500 focus:border-amber-500", children: [_jsx("option", { value: "1D", children: t.finanzen.stockMarket.ranges["1D"] }), _jsx("option", { value: "1W", children: t.finanzen.stockMarket.ranges["1W"] }), _jsx("option", { value: "1M", children: t.finanzen.stockMarket.ranges["1M"] }), _jsx("option", { value: "3M", children: t.finanzen.stockMarket.ranges["3M"] }), _jsx("option", { value: "6M", children: t.finanzen.stockMarket.ranges["6M"] }), _jsx("option", { value: "1Y", children: t.finanzen.stockMarket.ranges["1Y"] })] })] }), _jsx("div", { className: "overflow-y-auto flex-grow p-4", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: playerData.stocks.map(stock => {
                                        const trendPercent = calculateTrendPercent(stock.history, timeRange, stock.price);
                                        const isTrendPositive = trendPercent >= 0;
                                        return (_jsxs("div", { onClick: () => setSelectedStockTicker(stock.ticker), className: "bg-gray-800/50 border border-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-700/50 transition-colors flex flex-col justify-between", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsx("div", { className: "font-bold text-white text-lg", children: stock.name }), _jsx("div", { className: "text-right font-mono text-white text-lg", children: formatCurrency(stock.price) })] }), _jsxs("div", { className: "flex justify-between items-end", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs text-gray-500 font-mono", children: t.finanzen.stockMarket.industries[stock.industry] }), _jsx("div", { className: "text-xs text-gray-400 font-mono", children: stock.ticker })] }), _jsxs("div", { className: `font-bold text-sm ${isTrendPositive ? 'text-green-400' : 'text-red-400'}`, children: [isTrendPositive ? '+' : '', trendPercent.toFixed(2), "%"] })] })] }, stock.ticker));
                                    }) }) })] })), subTab === 'portfolio' && (_jsxs("div", { className: "flex flex-col h-full bg-gray-900/90 rounded-lg border border-gray-700 overflow-hidden", children: [_jsxs("div", { className: "p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/50", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-cinzel text-amber-400", children: t.finanzen.portfolio.title }), _jsxs("p", { className: "text-xs text-gray-400 mt-1", children: [t.finanzen.portfolio.totalValue, " ", _jsx("span", { className: "text-green-400 font-mono font-bold text-sm", children: formatCurrency(totalPortfolioValue) })] })] }), _jsxs("select", { value: timeRange, onChange: (e) => setTimeRange(e.target.value), className: "bg-gray-800 border border-gray-600 rounded-md p-1 text-white text-sm focus:ring-amber-500 focus:border-amber-500", children: [_jsx("option", { value: "1D", children: t.finanzen.stockMarket.ranges["1D"] }), _jsx("option", { value: "1W", children: t.finanzen.stockMarket.ranges["1W"] }), _jsx("option", { value: "1M", children: t.finanzen.stockMarket.ranges["1M"] }), _jsx("option", { value: "3M", children: t.finanzen.stockMarket.ranges["3M"] }), _jsx("option", { value: "6M", children: t.finanzen.stockMarket.ranges["6M"] }), _jsx("option", { value: "1Y", children: t.finanzen.stockMarket.ranges["1Y"] })] })] }), _jsx("div", { className: "overflow-y-auto flex-grow p-4", children: portfolioStocks.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: portfolioStocks.map(ticker => {
                                        const stock = playerData.stocks.find(s => s.ticker === ticker);
                                        if (!stock)
                                            return null;
                                        const portfolioData = playerData.privatePortfolio[ticker];
                                        const shares = portfolioData.shares;
                                        const totalCost = portfolioData.totalCost;
                                        const currentValue = stock.price * shares;
                                        const profitLoss = currentValue - totalCost;
                                        const profitLossPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;
                                        const isProfit = profitLoss >= 0;
                                        return (_jsxs("div", { onClick: () => setSelectedStockTicker(ticker), className: "bg-gray-800/50 border border-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-700/50 transition-colors flex flex-col justify-between", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsx("div", { className: "font-bold text-white text-lg", children: stock.name }), _jsx("div", { className: "text-right font-mono text-white text-lg", children: formatCurrency(currentValue) })] }), _jsxs("div", { className: "flex justify-between items-end", children: [_jsxs("div", { children: [_jsxs("div", { className: "text-xs text-gray-500 font-mono", children: [shares.toLocaleString(locale, { maximumFractionDigits: 0 }), " ", t.finanzen.portfolio.quantity.replace(':', '')] }), _jsx("div", { className: "text-xs text-gray-400 font-mono", children: stock.ticker })] }), _jsxs("div", { className: `font-bold text-sm ${isProfit ? 'text-green-400' : 'text-red-400'}`, children: [isProfit ? '+' : '', formatCurrency(profitLoss), " (", isProfit ? '+' : '', profitLossPercent.toFixed(2), "%)"] })] })] }, ticker));
                                    }) })) : (_jsx("div", { className: "flex items-center justify-center h-full", children: _jsx("p", { className: "text-gray-400 text-lg", children: t.finanzen.portfolio.noStocks }) })) })] }))] }), selectedStock && (_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4", onClick: () => setSelectedStockTicker(null), children: _jsxs("div", { className: "bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-6xl p-6 relative overflow-y-auto max-h-[90vh]", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "flex justify-between items-start mb-6 border-b border-gray-700 pb-4", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-3xl font-bold font-cinzel text-amber-400", children: [selectedStock.name, " ", _jsxs("span", { className: "text-gray-500 text-xl", children: ["(", selectedStock.ticker, ")"] })] }), _jsx("p", { className: "text-gray-400", children: t.finanzen.stockMarket.industries[selectedStock.industry] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-3xl font-mono text-white font-bold", children: formatCurrency(selectedStock.price) }), _jsx("div", { className: "mt-1", children: (() => {
                                                const trend = calculateTrendPercent(selectedStock.history, timeRange, selectedStock.price);
                                                const isPos = trend >= 0;
                                                return (_jsxs("span", { className: `text-lg font-bold ${isPos ? 'text-green-400' : 'text-red-400'}`, children: [isPos ? '▲' : '▼', " ", Math.abs(trend).toFixed(2), "% (", t.finanzen.stockMarket.ranges[timeRange], ")"] }));
                                            })() })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "lg:col-span-2 flex flex-col", children: [_jsx("div", { className: "bg-gray-900/50 rounded-lg p-4 mb-4 border border-gray-700 flex-grow", children: _jsx(StockSparkline, { data: getVisibleHistory(selectedStock.history), color: calculateTrendPercent(selectedStock.history, timeRange, selectedStock.price) >= 0 ? '#10b981' : '#ef4444', height: 300, noDataText: t.finanzen.stockMarket.noData }) }), _jsx("div", { className: "flex justify-center gap-2", children: ['1D', '1W', '1M', '3M', '6M', '1Y'].map(range => (_jsx("button", { onClick: () => setTimeRange(range), className: `px-4 py-2 text-sm font-bold rounded-full transition-colors ${timeRange === range ? 'bg-amber-500 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`, children: t.finanzen.stockMarket.ranges[range] }, range))) })] }), _jsxs("div", { className: "flex flex-col gap-6", children: [subTab === 'portfolio' ? (
                                        /* Performance View for Portfolio */
                                        _jsxs("div", { className: "bg-gray-900/50 p-4 rounded-lg border border-gray-700 flex-1", children: [_jsx("h3", { className: "text-lg font-bold text-amber-400 mb-4 border-b border-gray-700 pb-2", children: "Performance" }), (() => {
                                                    const portfolioEntry = playerData.privatePortfolio[selectedStock.ticker];
                                                    const sharesOwned = portfolioEntry ? portfolioEntry.shares : 0;
                                                    const totalInvested = portfolioEntry ? portfolioEntry.totalCost : 0;
                                                    const avgPrice = sharesOwned > 0 ? totalInvested / sharesOwned : 0;
                                                    const currentTotalValue = sharesOwned * selectedStock.price;
                                                    const profitLoss = currentTotalValue - totalInvested;
                                                    const profitLossPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;
                                                    const isProfit = profitLoss >= 0;
                                                    return (_jsxs("div", { className: "space-y-4 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-400", children: t.finanzen.portfolio.avgBuyPrice }), _jsx("span", { className: "font-mono text-white", children: formatCurrency(avgPrice) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-400", children: "Aktueller Kurs:" }), _jsx("span", { className: "font-mono text-white", children: formatCurrency(selectedStock.price) })] }), _jsx("hr", { className: "border-gray-700" }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-400", children: t.finanzen.portfolio.totalValue }), _jsx("span", { className: "font-mono font-bold text-white", children: formatCurrency(currentTotalValue) })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("span", { className: "text-gray-400", children: [t.finanzen.portfolio.profitOrLoss, ":"] }), _jsxs("div", { className: `text-right font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`, children: [_jsxs("div", { className: "font-mono", children: [isProfit ? '+' : '', formatCurrency(profitLoss)] }), _jsxs("div", { className: "text-xs", children: ["(", isProfit ? '+' : '', profitLossPercent.toFixed(2), "%)"] })] })] })] }));
                                                })()] })) : (
                                        /* Buy Section for Market */
                                        _jsxs("div", { className: "bg-gray-900/50 p-4 rounded-lg border border-gray-700 flex-1", children: [_jsx("h3", { className: "text-lg font-bold text-green-400 mb-2 border-b border-gray-700 pb-1", children: t.finanzen.stockMarket.buy }), _jsx("div", { className: "space-y-4", children: (() => {
                                                        const amountToBuy = buyAmounts[selectedStock.ticker] || 0;
                                                        const maxCanBuy = isTestMode ? 10000 : Math.floor(playerData.privateCapital / selectedStock.price);
                                                        const totalCost = amountToBuy * selectedStock.price;
                                                        return (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-xs text-gray-400 mb-1", children: [_jsx("span", { children: t.finanzen.stockMarket.quantity }), _jsx("span", { className: "text-white font-bold", children: amountToBuy })] }), _jsx("input", { type: "range", min: "0", max: maxCanBuy, value: amountToBuy, onChange: (e) => handleBuyAmountChange(selectedStock.ticker, e.target.value), className: "w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500 mb-2" }), _jsx("input", { type: "number", value: amountToBuy, onChange: (e) => handleBuyAmountChange(selectedStock.ticker, e.target.value), className: "w-full bg-gray-800 border border-gray-600 rounded p-1 text-white text-right", min: "0", max: maxCanBuy })] }), _jsxs("div", { className: "flex justify-between items-center text-sm", children: [_jsx("span", { className: "text-gray-400", children: t.finanzen.stockMarket.cost }), _jsx("span", { className: "font-bold text-white font-mono", children: formatCurrency(totalCost) })] }), _jsx("button", { onClick: () => handleBuyStock(selectedStock.ticker), disabled: amountToBuy <= 0 || (playerData.privateCapital < totalCost && !isTestMode), className: "w-full bg-green-600 text-white font-bold py-2 rounded uppercase hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors", children: t.finanzen.stockMarket.buy })] }));
                                                    })() })] })), _jsxs("div", { className: "bg-gray-900/50 p-4 rounded-lg border border-gray-700 flex-1", children: [_jsx("h3", { className: "text-lg font-bold text-red-400 mb-2 border-b border-gray-700 pb-1", children: t.finanzen.portfolio.sell }), _jsx("div", { className: "space-y-4", children: (() => {
                                                        const sharesOwned = playerData.privatePortfolio[selectedStock.ticker]?.shares || 0;
                                                        const amountToSell = sellAmounts[selectedStock.ticker] || 0;
                                                        const totalRevenue = amountToSell * selectedStock.price;
                                                        return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "text-sm text-gray-400 mb-2", children: [t.finanzen.portfolio.quantity, ": ", _jsx("span", { className: "text-white font-bold", children: sharesOwned.toLocaleString(locale, { maximumFractionDigits: 0 }) })] }), _jsxs("div", { children: [_jsx("input", { type: "range", min: "0", max: sharesOwned, step: "1", value: amountToSell, onChange: (e) => handleSellAmountChange(selectedStock.ticker, e.target.value), className: "w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500 mb-2", disabled: sharesOwned <= 0 }), _jsx("input", { type: "number", value: Math.round(amountToSell), onChange: (e) => handleSellAmountChange(selectedStock.ticker, e.target.value), className: "w-full bg-gray-800 border border-gray-600 rounded p-1 text-white text-right", min: "0", max: Math.floor(sharesOwned), disabled: sharesOwned <= 0 })] }), _jsxs("div", { className: "flex justify-between items-center text-sm", children: [_jsx("span", { className: "text-gray-400", children: t.finanzen.portfolio.revenue }), _jsx("span", { className: "font-bold text-white font-mono", children: formatCurrency(totalRevenue) })] }), _jsx("button", { onClick: () => handleSellStock(selectedStock.ticker), disabled: amountToSell <= 0, className: "w-full bg-red-600 text-white font-bold py-2 rounded uppercase hover:bg-red-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors", children: t.finanzen.portfolio.sell })] }));
                                                    })() })] })] })] }), _jsx("div", { className: "mt-6 text-center", children: _jsx("button", { onClick: () => setSelectedStockTicker(null), className: "text-gray-400 hover:text-white underline text-sm", children: t.common.close }) })] }) })), showDonationConfirm && (_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-gray-800 border border-green-500 rounded-lg p-6 max-w-sm w-full text-center", children: [_jsx("h3", { className: "text-xl font-bold text-green-400 mb-4", children: t.privatelife.status.donateConfirmTitle }), _jsx("p", { className: "text-gray-300 mb-4", children: t.privatelife.status.donateConfirmText.replace('{amount}', formatCurrency(donationAmount)) }), _jsxs("div", { className: "flex justify-center gap-4", children: [_jsx("button", { onClick: () => setShowDonationConfirm(false), className: "bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded", children: t.common.cancel }), _jsx("button", { onClick: confirmDonation, className: "bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded", children: t.common.confirm })] })] }) }))] }));
};
