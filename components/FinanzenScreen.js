import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo, useEffect } from 'react';
import { finanzenBackgroundImage } from './backgrounds/FinanzenBackgroundImage';
import KreditIcon from './icons/KreditIcon';
import FinanzenIcon from './icons/FinanzenIcon';
import PortfolioIcon from './icons/PortfolioIcon';
import LaufendeKrediteIcon from './icons/LaufendeKrediteIcon';
import GameHeader from './GameHeader';
import BarChartIcon from './icons/BarChartIcon';
import StarRating from './StarRating';
import { useGame } from '../contexts/GameContext';
import { useTranslation } from '../hooks/useTranslation';
// Helper component for mini sparkline chart
const StockSparkline = ({ data, color, height = 40, noDataText }) => {
    const { t } = useTranslation();
    const text = noDataText || t.finanzen.stockMarket.noData;
    if (!data || data.length < 2)
        return _jsx("div", { className: `h-[${height}px] w-full bg-gray-900/30 rounded flex items-center justify-center text-xs text-gray-500`, children: text });
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
const SidebarButton = ({ title, description, icon, isActive, onClick }) => {
    const activeClasses = 'border-amber-500 ring-2 ring-amber-500 bg-gray-700/50';
    const defaultClasses = 'border-gray-700 hover:border-amber-500/50 hover:-translate-y-1';
    return (_jsx("button", { onClick: onClick, className: `bg-black bg-opacity-60 backdrop-blur-md border rounded-lg p-4 text-left transform transition-all duration-300 ease-in-out group w-full ${isActive ? activeClasses : defaultClasses}`, children: _jsxs("div", { className: "flex items-start", children: [_jsx("div", { className: `bg-gray-800 p-2 rounded-md mr-3 mt-1 group-hover:bg-amber-500 transition-colors duration-300 ${isActive && 'bg-amber-500'}`, children: icon }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: `text-md font-bold font-cinzel ${isActive ? 'text-amber-300' : 'text-amber-400'} group-hover:text-amber-300 transition-colors`, children: title }), _jsx("p", { className: "text-xs text-gray-300 mt-1", children: description })] })] }) }));
};
const FinanzenScreen = ({ onBack, gameSpeed, setGameSpeed, initialTab }) => {
    const { playerData, setPlayerData } = useGame();
    const { t, language } = useTranslation();
    const locale = language === 'de' ? 'de-DE' : 'en-US';
    const [activeTab, setActiveTab] = useState(initialTab || 'stock_market');
    const [loanAmount, setLoanAmount] = useState(0);
    const [loanTerm, setLoanTerm] = useState(1); // in years
    const [buyAmounts, setBuyAmounts] = useState({});
    const [sellAmounts, setSellAmounts] = useState({});
    const [financialTab, setFinancialTab] = useState('monthly');
    const [timeRange, setTimeRange] = useState('1Y');
    // Confirmation Modals State
    const [showTakeLoanConfirm, setShowTakeLoanConfirm] = useState(false);
    const [loanToRepay, setLoanToRepay] = useState(null);
    // New State for Stock Detail Modal
    const [selectedStockTicker, setSelectedStockTicker] = useState(null);
    if (!playerData)
        return null;
    const isTestMode = playerData.playerName === 'Max Mustermann' && playerData.studioName === 'Teststudio';
    const totalDebt = useMemo(() => playerData.loans.reduce((sum, loan) => sum + loan.totalOwed, 0), [playerData.loans]);
    const formatCurrency = (value) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
    const creditLimit = useMemo(() => {
        const prestige = playerData.reputation;
        if (prestige <= 9)
            return 250000;
        if (prestige <= 19)
            return 1000000;
        if (prestige <= 29)
            return 2500000;
        if (prestige <= 39)
            return 5000000;
        if (prestige <= 49)
            return 7500000;
        if (prestige <= 59)
            return 10000000;
        if (prestige <= 69)
            return 15000000;
        if (prestige <= 79)
            return 25000000;
        if (prestige <= 89)
            return 50000000;
        return 100000000; // 90-100+
    }, [playerData.reputation]);
    const availableCredit = useMemo(() => Math.max(0, creditLimit - totalDebt), [creditLimit, totalDebt]);
    useEffect(() => {
        if (loanAmount > availableCredit) {
            setLoanAmount(availableCredit);
        }
    }, [availableCredit, loanAmount]);
    const annualInterestRate = useMemo(() => {
        const baseRate = 4.5 + (loanTerm - 1) * (3.5 / 9);
        const reputationDiscount = (playerData.reputation / 50);
        const modifier = playerData.interestRateModifier || 0;
        const finalRate = baseRate - reputationDiscount - modifier;
        return Math.max(1.0, finalRate); // Min 1% interest rate
    }, [loanTerm, playerData.reputation, playerData.interestRateModifier]);
    const monthlyPayment = useMemo(() => {
        if (loanAmount <= 0)
            return 0;
        const monthlyRate = (annualInterestRate / 100) / 12;
        const numberOfPayments = loanTerm * 12;
        if (monthlyRate === 0)
            return loanAmount / numberOfPayments;
        const payment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
        return payment;
    }, [loanAmount, annualInterestRate, loanTerm]);
    const totalInterest = useMemo(() => {
        if (loanAmount <= 0)
            return 0;
        const numberOfPayments = loanTerm * 12;
        const totalPaid = monthlyPayment * numberOfPayments;
        return totalPaid - loanAmount;
    }, [monthlyPayment, loanTerm, loanAmount]);
    // Initial click handler - Shows modal
    const handleTakeLoanClick = () => {
        if (loanAmount <= 0)
            return;
        setShowTakeLoanConfirm(true);
    };
    // Actual Logic Execution after Confirmation
    const executeTakeLoan = () => {
        const newLoan = {
            id: `loan_${Date.now()}`,
            name: `${t.finanzen.takeLoan.newLoanTitle} (${loanTerm} ${loanTerm > 1 ? t.finanzen.takeLoan.years : t.finanzen.takeLoan.year})`,
            principal: loanAmount,
            interestRate: annualInterestRate / 100,
            dateTaken: new Date(playerData.gameDate),
            totalOwed: loanAmount,
            termInYears: loanTerm,
            monthlyPayment: monthlyPayment,
        };
        setPlayerData(prev => {
            if (!prev)
                return null;
            return {
                ...prev,
                capital: prev.capital + loanAmount,
                loans: [...prev.loans, newLoan],
                transactionLog: [
                    ...prev.transactionLog,
                    {
                        date: new Date(prev.gameDate),
                        type: 'Einnahme',
                        category: 'Finanzen',
                        description: `Kreditaufnahme: ${newLoan.name}`,
                        amount: loanAmount,
                        descriptionKey: 'loanTaken', // Used to exclude from profit calculation
                    }
                ]
            };
        });
        setLoanAmount(0);
        setLoanTerm(1);
        setShowTakeLoanConfirm(false);
    };
    // Initial click handler - Shows modal
    const handleRepayLoanClick = (loan) => {
        setLoanToRepay(loan);
    };
    // Actual Logic Execution after Confirmation
    const executeRepayLoan = () => {
        if (!loanToRepay)
            return;
        // 1% Prepayment Penalty
        const penalty = loanToRepay.totalOwed * 0.01;
        const totalToPay = loanToRepay.totalOwed + penalty;
        if (playerData.capital < totalToPay && !isTestMode)
            return;
        setPlayerData(prev => {
            if (!prev)
                return null;
            return {
                ...prev,
                capital: prev.capital - totalToPay,
                loans: prev.loans.filter(l => l.id !== loanToRepay.id),
                transactionLog: [
                    ...prev.transactionLog,
                    {
                        date: new Date(prev.gameDate),
                        type: 'Ausgabe',
                        category: 'Finanzen',
                        description: `Kredittilgung: ${loanToRepay.name} (inkl. Vorfälligkeitsentschädigung)`,
                        amount: totalToPay,
                        descriptionKey: 'loanRepaidFull', // Used to exclude from profit calculation (though fee is technically an expense)
                    }
                ]
            };
        });
        setLoanToRepay(null);
    };
    const handleBuyAmountChange = (ticker, value) => {
        const stock = playerData.stocks.find(s => s.ticker === ticker);
        if (!stock)
            return;
        const maxCanBuy = isTestMode ? 10000 : Math.floor(playerData.capital / stock.price);
        let numValue = parseInt(value, 10);
        if (isNaN(numValue) || numValue < 0) {
            numValue = 0;
        }
        if (numValue > maxCanBuy) {
            numValue = maxCanBuy;
        }
        setBuyAmounts(p => ({ ...p, [ticker]: numValue }));
    };
    const handleBuyStock = (ticker) => {
        const stock = playerData.stocks.find(s => s.ticker === ticker);
        const amount = buyAmounts[ticker] || 0;
        if (!stock || amount <= 0)
            return;
        const cost = stock.price * amount;
        if (playerData.capital < cost && !isTestMode)
            return;
        setPlayerData(prev => {
            if (!prev)
                return null;
            const oldPortfolioData = prev.portfolio[ticker] || { shares: 0, totalCost: 0 };
            const newPortfolioData = {
                shares: oldPortfolioData.shares + amount,
                totalCost: oldPortfolioData.totalCost + cost,
            };
            return {
                ...prev,
                capital: prev.capital - cost,
                portfolio: { ...prev.portfolio, [ticker]: newPortfolioData },
                transactionLog: [
                    ...prev.transactionLog,
                    { date: new Date(prev.gameDate), type: 'Ausgabe', category: 'Aktienhandel', description: `${t.finanzen.stockMarket.buy}: ${amount}x ${ticker}`, amount: cost }
                ]
            };
        });
        setBuyAmounts(prev => ({ ...prev, [ticker]: 0 }));
    };
    const handleSellAmountChange = (ticker, value) => {
        const sharesOwned = playerData.portfolio[ticker]?.shares || 0;
        let numValue = parseInt(value, 10);
        if (isNaN(numValue) || numValue < 0) {
            numValue = 0;
        }
        if (numValue > sharesOwned) {
            numValue = Math.floor(sharesOwned);
        }
        setSellAmounts(p => ({ ...p, [ticker]: numValue }));
    };
    const handleSellStock = (ticker) => {
        const stock = playerData.stocks.find(s => s.ticker === ticker);
        const amount = sellAmounts[ticker] || 0;
        const sharesOwned = playerData.portfolio[ticker]?.shares || 0;
        if (!stock || sharesOwned < amount || amount <= 0)
            return;
        const revenue = stock.price * amount;
        setPlayerData(prev => {
            if (!prev)
                return null;
            const oldPortfolioData = prev.portfolio[ticker];
            const avgPrice = oldPortfolioData.shares > 0 ? oldPortfolioData.totalCost / oldPortfolioData.shares : 0;
            const costOfSoldShares = avgPrice * amount;
            const newShares = oldPortfolioData.shares - amount;
            const newPortfolio = { ...prev.portfolio };
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
                capital: prev.capital + revenue,
                portfolio: newPortfolio,
                transactionLog: [
                    ...prev.transactionLog,
                    { date: new Date(prev.gameDate), type: 'Einnahme', category: 'Aktienhandel', description: `${t.finanzen.portfolio.sell}: ${amount}x ${ticker}`, amount: revenue }
                ]
            };
        });
        setSellAmounts(prev => ({ ...prev, [ticker]: 0 }));
    };
    const portfolioStocks = Object.keys(playerData.portfolio);
    // Calculate total portfolio value for Studio
    const totalPortfolioValue = useMemo(() => {
        return portfolioStocks.reduce((sum, ticker) => {
            const stock = playerData.stocks.find(s => s.ticker === ticker);
            const entry = playerData.portfolio[ticker];
            if (stock && entry) {
                return sum + (entry.shares * stock.price);
            }
            return sum;
        }, 0);
    }, [portfolioStocks, playerData.stocks, playerData.portfolio]);
    const monthNames = t.finanzen.overview.months;
    const yearlySummary = useMemo(() => {
        const summary = {};
        playerData.monthlyHistory.forEach(entry => {
            if (!summary[entry.year]) {
                summary[entry.year] = { year: entry.year, income: 0, expense: 0, profit: 0 };
            }
            summary[entry.year].income += entry.income;
            summary[entry.year].expense += entry.expense;
            summary[entry.year].profit += entry.profit;
        });
        return Object.values(summary).sort((a, b) => b.year - a.year);
    }, [playerData.monthlyHistory]);
    // NEW: Calculate Current Year Totals - CHANGED to Last 12 Months
    const last12MonthsStats = useMemo(() => {
        // Take the last 12 entries from monthly history
        const recentHistory = playerData.monthlyHistory.slice(-12);
        return recentHistory.reduce((acc, curr) => ({
            income: acc.income + curr.income,
            expense: acc.expense + curr.expense,
            profit: acc.profit + curr.profit
        }), { income: 0, expense: 0, profit: 0 });
    }, [playerData.monthlyHistory]);
    const getVisibleHistory = (history) => {
        if (!history || history.length === 0)
            return [];
        // history array contains weekly data points
        switch (timeRange) {
            case '1Y': return history.slice(-52); // 1 Jahr = 52 Wochen
            case '6M': return history.slice(-26); // 6 Monate approx 26 Wochen
            case '3M': return history.slice(-13); // 3 Monate approx 13 Wochen
            case '1M': return history.slice(-4); // 1 Monat approx 4 Wochen
            case '1W': return history.slice(-2); // 1 Woche (zeigt Start und Ende der Woche)
            case '1D': return history.slice(-2); // 1 Tag (Fallback auf Woche, da keine Tagesdaten)
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
            return 0; // Should not happen if history.length >= 2
        return ((currentPrice - startPrice) / startPrice) * 100;
    };
    const selectedStock = useMemo(() => {
        if (!selectedStockTicker)
            return null;
        return playerData.stocks.find(s => s.ticker === selectedStockTicker);
    }, [selectedStockTicker, playerData.stocks]);
    return (_jsxs("div", { className: "w-full h-full relative", children: [_jsx("div", { className: "absolute inset-0 bg-cover bg-center", style: {
                    backgroundImage: `url(${finanzenBackgroundImage})`,
                    filter: 'brightness(1.3)',
                }, "aria-hidden": "true" }), _jsxs("div", { className: "w-full h-full flex flex-col bg-black bg-opacity-0 relative", children: [_jsx(GameHeader, { gameSpeed: gameSpeed, setGameSpeed: setGameSpeed, disabled: true }), _jsxs("div", { className: "flex-grow w-full flex flex-row overflow-hidden", children: [_jsxs("aside", { className: "w-80 flex-shrink-0 bg-black bg-opacity-50 border-r border-gray-700 flex flex-col", children: [_jsx("header", { className: "p-6 text-center border-b border-gray-700", children: _jsx("h1", { className: "text-3xl font-bold font-cinzel text-amber-400", children: t.finanzen.screen.title }) }), _jsxs("nav", { className: "flex-grow p-4 flex flex-col gap-4 overflow-y-auto", children: [_jsx(SidebarButton, { title: t.finanzen.screen.nav.takeLoan, description: t.finanzen.screen.nav.takeLoanDesc, icon: _jsx(KreditIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" }), isActive: activeTab === 'take_loan', onClick: () => setActiveTab('take_loan') }), _jsx(SidebarButton, { title: t.finanzen.screen.nav.currentLoans, description: t.finanzen.screen.nav.currentLoansDesc, icon: _jsx(LaufendeKrediteIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" }), isActive: activeTab === 'current_loans', onClick: () => setActiveTab('current_loans') }), _jsx(SidebarButton, { title: t.finanzen.screen.nav.stockMarket, description: t.finanzen.screen.nav.stockMarketDesc, icon: _jsx(FinanzenIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" }), isActive: activeTab === 'stock_market', onClick: () => setActiveTab('stock_market') }), _jsx(SidebarButton, { title: t.finanzen.screen.nav.portfolio, description: t.finanzen.screen.nav.portfolioDesc, icon: _jsx(PortfolioIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" }), isActive: activeTab === 'portfolio', onClick: () => setActiveTab('portfolio') }), _jsx(SidebarButton, { title: t.finanzen.screen.nav.overview, description: t.finanzen.screen.nav.overviewDesc, icon: _jsx(BarChartIcon, { className: "h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" }), isActive: activeTab === 'overview', onClick: () => setActiveTab('overview') })] }), _jsx("footer", { className: "p-4 border-t border-gray-700", children: _jsx("button", { onClick: onBack, className: "w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-sm text-sm uppercase", children: t.finanzen.screen.backToMain }) })] }), _jsxs("main", { className: "flex-grow p-4 overflow-y-auto", children: [activeTab === 'take_loan' && (_jsxs("div", { className: "text-white max-w-3xl mx-auto space-y-4", children: [_jsxs("div", { className: "bg-gray-800/90 p-4 rounded-lg border border-gray-700/50", children: [_jsx("h3", { className: "text-xl font-cinzel text-amber-400 mb-2", children: t.finanzen.takeLoan.creditLimitTitle }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-center", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-400", children: t.finanzen.takeLoan.prestige }), _jsx("div", { className: "flex justify-center mt-1", children: _jsx(StarRating, { rating: playerData.reputation, size: "md", showValue: false }) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-400", children: t.finanzen.takeLoan.limit }), _jsx("p", { className: "text-2xl font-bold", children: formatCurrency(creditLimit) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-400", children: t.finanzen.takeLoan.used }), _jsx("p", { className: "text-2xl font-bold", children: formatCurrency(totalDebt) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-400", children: t.finanzen.takeLoan.available }), _jsx("p", { className: "text-2xl font-bold", children: formatCurrency(availableCredit) })] })] })] }), _jsxs("div", { className: "bg-gray-800/90 p-4 rounded-lg border border-gray-700/50", children: [_jsxs("h3", { className: "text-xl font-cinzel text-amber-400 mb-4", children: ["\uD83D\uDCA1 ", t.finanzen.takeLoan.newLoanTitle] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between items-baseline mb-1", children: [_jsx("label", { className: "text-sm font-bold", children: t.finanzen.takeLoan.amount }), _jsx("span", { className: "text-lg font-mono font-bold", children: formatCurrency(loanAmount) })] }), _jsx("input", { type: "range", min: "0", max: availableCredit, step: availableCredit > 100000 ? 1000 : 100, value: loanAmount, onChange: (e) => setLoanAmount(Number(e.target.value)), className: "w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500" }), _jsxs("div", { className: "flex justify-between text-xs text-gray-400 mt-1", children: [_jsx("span", { children: formatCurrency(0) }), _jsx("span", { children: formatCurrency(availableCredit) })] })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between items-baseline mb-1", children: [_jsx("label", { className: "text-sm font-bold", children: t.finanzen.takeLoan.term }), _jsxs("span", { className: "text-lg font-mono font-bold", children: [loanTerm, " ", loanTerm > 1 ? t.finanzen.takeLoan.years : t.finanzen.takeLoan.year] })] }), _jsx("input", { type: "range", min: "1", max: "10", step: "1", value: loanTerm, onChange: (e) => setLoanTerm(Number(e.target.value)), className: "w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500" }), _jsxs("div", { className: "flex justify-between text-xs text-gray-400 mt-1", children: [_jsxs("span", { children: ["1 ", t.finanzen.takeLoan.year] }), _jsxs("span", { children: ["10 ", t.finanzen.takeLoan.years] })] })] })] })] }), _jsxs("div", { className: "bg-gray-800/90 p-4 rounded-lg border border-gray-700/50", children: [_jsx("h3", { className: "text-xl font-cinzel text-gray-300 mb-2", children: t.finanzen.takeLoan.conditionsTitle }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 text-center", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-400", children: t.finanzen.takeLoan.interestRate }), _jsxs("p", { className: "text-2xl font-bold", children: [annualInterestRate.toFixed(2), "%"] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-400", children: t.finanzen.takeLoan.monthlyPayment }), _jsx("p", { className: "text-2xl font-bold", children: formatCurrency(monthlyPayment) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-400", children: t.finanzen.takeLoan.totalInterest }), _jsx("p", { className: "text-2xl font-bold", children: formatCurrency(totalInterest) })] })] })] }), _jsx("div", { className: "pt-2", children: _jsx("button", { onClick: handleTakeLoanClick, disabled: loanAmount <= 0, className: "w-full bg-gray-300 text-gray-900 font-bold py-3 text-lg rounded-sm uppercase tracking-wider hover:bg-white disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400 transition-all", children: t.finanzen.takeLoan.applyButton.replace('{amount}', formatCurrency(loanAmount)) }) })] })), activeTab === 'current_loans' && (_jsx("div", { children: playerData.loans.length > 0 ? (_jsxs(_Fragment, { children: [_jsx("h2", { className: "text-2xl font-cinzel text-amber-400 mb-4", children: t.finanzen.currentLoans.title }), _jsx("div", { className: "space-y-4", children: playerData.loans.map(loan => {
                                                        const totalMonths = loan.termInYears * 12;
                                                        const monthsPassed = Math.round(((new Date(playerData.gameDate).getTime() - new Date(loan.dateTaken).getTime()) / (1000 * 3600 * 24 * 30.44)));
                                                        const remainingMonths = Math.max(0, totalMonths - monthsPassed);
                                                        const interestForMonth = loan.totalOwed * (loan.interestRate / 12);
                                                        const principalForMonth = loan.monthlyPayment - interestForMonth;
                                                        return (_jsxs("div", { className: "bg-gray-800/90 p-4 rounded-lg border border-gray-700/50", children: [_jsxs("div", { className: "flex justify-between items-baseline border-b border-gray-700 pb-2 mb-3", children: [_jsx("h3", { className: "font-bold text-lg text-white", children: loan.name }), _jsxs("div", { className: "text-sm text-gray-300", children: [t.finanzen.currentLoans.remainingTerm, ": ", _jsxs("span", { className: "font-bold", children: [remainingMonths, " ", t.finanzen.currentLoans.months] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-x-8 gap-y-2 text-sm", children: [_jsx("div", { children: _jsx("span", { className: "text-gray-400", children: t.finanzen.currentLoans.originalAmount }) }), _jsx("div", { className: "text-right font-mono", children: formatCurrency(loan.principal) }), _jsx("div", { children: _jsx("span", { className: "text-gray-400", children: t.finanzen.currentLoans.currentDebt }) }), _jsx("div", { className: "text-right font-mono text-red-400 font-bold", children: formatCurrency(loan.totalOwed) }), _jsx("div", { children: _jsx("span", { className: "text-gray-400", children: t.finanzen.currentLoans.interestRate }) }), _jsxs("div", { className: "text-right font-mono", children: [(loan.interestRate * 100).toFixed(2), "%"] })] }), _jsxs("div", { className: "mt-3 pt-3 border-t border-gray-700", children: [_jsxs("div", { className: "flex justify-between items-baseline text-lg", children: [_jsx("span", { className: "text-gray-300", children: t.finanzen.currentLoans.monthlyPayment }), _jsx("span", { className: "font-bold text-amber-400 font-mono", children: formatCurrency(loan.monthlyPayment) })] }), _jsxs("div", { className: "text-xs text-gray-400 pl-4", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: t.finanzen.currentLoans.ofWhichInterest }), " ", _jsx("span", { className: "font-mono", children: formatCurrency(interestForMonth) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: t.finanzen.currentLoans.ofWhichPrincipal }), " ", _jsx("span", { className: "font-mono", children: formatCurrency(principalForMonth) })] })] })] }), _jsx("button", { onClick: () => handleRepayLoanClick(loan), disabled: (playerData.capital < loan.totalOwed * 1.01) && !isTestMode, className: "w-full mt-4 bg-red-800 text-white font-bold py-2 rounded-sm text-sm uppercase hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed", children: t.finanzen.currentLoans.repayFully })] }, loan.id));
                                                    }) })] })) : (_jsxs("div", { className: "bg-gray-800/90 p-8 rounded-lg border border-gray-700/50 max-w-xl mx-auto text-center mt-16", children: [_jsx("h2", { className: "text-3xl font-cinzel text-amber-400 mb-4", children: t.finanzen.currentLoans.title }), _jsx("p", { className: "text-gray-400 text-lg", children: t.finanzen.currentLoans.noLoans })] })) })), activeTab === 'stock_market' && (_jsxs("div", { className: "flex flex-col h-full bg-gray-900/90 rounded-lg border border-gray-700 overflow-hidden", children: [_jsxs("div", { className: "p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/50", children: [_jsx("h2", { className: "text-xl font-cinzel text-amber-400", children: t.finanzen.stockMarket.buy }), _jsxs("select", { value: timeRange, onChange: (e) => setTimeRange(e.target.value), className: "bg-gray-800 border border-gray-600 rounded-md p-1 text-white text-sm focus:ring-amber-500 focus:border-amber-500", children: [_jsx("option", { value: "1D", children: t.finanzen.stockMarket.ranges["1D"] }), _jsx("option", { value: "1W", children: t.finanzen.stockMarket.ranges["1W"] }), _jsx("option", { value: "1M", children: t.finanzen.stockMarket.ranges["1M"] }), _jsx("option", { value: "3M", children: t.finanzen.stockMarket.ranges["3M"] }), _jsx("option", { value: "6M", children: t.finanzen.stockMarket.ranges["6M"] }), _jsx("option", { value: "1Y", children: t.finanzen.stockMarket.ranges["1Y"] })] })] }), _jsx("div", { className: "overflow-y-auto flex-grow p-4", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: playerData.stocks.map(stock => {
                                                        const trendPercent = calculateTrendPercent(stock.history, timeRange, stock.price);
                                                        const isTrendPositive = trendPercent >= 0;
                                                        return (_jsxs("div", { onClick: () => setSelectedStockTicker(stock.ticker), className: "bg-gray-800/50 border border-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-700/50 transition-colors flex flex-col justify-between", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsx("div", { className: "font-bold text-white text-lg", children: stock.name }), _jsx("div", { className: "text-right font-mono text-white text-lg", children: formatCurrency(stock.price) })] }), _jsxs("div", { className: "flex justify-between items-end", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs text-gray-500 font-mono", children: t.finanzen.stockMarket.industries[stock.industry] }), _jsx("div", { className: "text-xs text-gray-400 font-mono", children: stock.ticker })] }), _jsxs("div", { className: `font-bold text-sm ${isTrendPositive ? 'text-green-400' : 'text-red-400'}`, children: [isTrendPositive ? '+' : '', trendPercent.toFixed(2), "%"] })] })] }, stock.ticker));
                                                    }) }) })] })), activeTab === 'portfolio' && (_jsxs("div", { className: "flex flex-col h-full bg-gray-900/90 rounded-lg border border-gray-700 overflow-hidden", children: [_jsxs("div", { className: "p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/50", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-cinzel text-amber-400", children: t.finanzen.portfolio.title }), _jsxs("p", { className: "text-xs text-gray-400 mt-1", children: [t.finanzen.portfolio.totalValue, " ", _jsx("span", { className: "text-green-400 font-mono font-bold text-sm", children: formatCurrency(totalPortfolioValue) })] })] }), _jsxs("select", { value: timeRange, onChange: (e) => setTimeRange(e.target.value), className: "bg-gray-800 border border-gray-600 rounded-md p-1 text-white text-sm focus:ring-amber-500 focus:border-amber-500", children: [_jsx("option", { value: "1D", children: t.finanzen.stockMarket.ranges["1D"] }), _jsx("option", { value: "1W", children: t.finanzen.stockMarket.ranges["1W"] }), _jsx("option", { value: "1M", children: t.finanzen.stockMarket.ranges["1M"] }), _jsx("option", { value: "3M", children: t.finanzen.stockMarket.ranges["3M"] }), _jsx("option", { value: "6M", children: t.finanzen.stockMarket.ranges["6M"] }), _jsx("option", { value: "1Y", children: t.finanzen.stockMarket.ranges["1Y"] })] })] }), _jsx("div", { className: "overflow-y-auto flex-grow p-4", children: portfolioStocks.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: portfolioStocks.map(ticker => {
                                                        const stock = playerData.stocks.find(s => s.ticker === ticker);
                                                        if (!stock)
                                                            return null;
                                                        const portfolioData = playerData.portfolio[ticker];
                                                        const shares = portfolioData.shares;
                                                        const totalCost = portfolioData.totalCost;
                                                        const currentValue = stock.price * shares;
                                                        const profitLoss = currentValue - totalCost;
                                                        const profitLossPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;
                                                        const isProfit = profitLoss >= 0;
                                                        return (_jsxs("div", { onClick: () => setSelectedStockTicker(ticker), className: "bg-gray-800/50 border border-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-700/50 transition-colors flex flex-col justify-between", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsx("div", { className: "font-bold text-white text-lg", children: stock.name }), _jsx("div", { className: "text-right font-mono text-white text-lg", children: formatCurrency(currentValue) })] }), _jsxs("div", { className: "flex justify-between items-end", children: [_jsxs("div", { children: [_jsxs("div", { className: "text-xs text-gray-500 font-mono", children: [shares.toLocaleString(locale, { maximumFractionDigits: 0 }), " ", t.finanzen.portfolio.quantity.replace(':', '')] }), _jsx("div", { className: "text-xs text-gray-400 font-mono", children: stock.ticker })] }), _jsxs("div", { className: `font-bold text-sm ${isProfit ? 'text-green-400' : 'text-red-400'}`, children: [isProfit ? '+' : '', formatCurrency(profitLoss), " (", isProfit ? '+' : '', profitLossPercent.toFixed(2), "%)"] })] })] }, ticker));
                                                    }) })) : (_jsx("div", { className: "flex items-center justify-center h-full", children: _jsx("p", { className: "text-gray-400 text-lg", children: t.finanzen.portfolio.noStocks }) })) })] })), activeTab === 'overview' && (_jsxs("div", { className: "bg-gray-900 bg-opacity-80 p-6 rounded-lg border border-gray-700", children: [_jsxs("div", { className: "flex mb-6 border-b border-gray-700", children: [_jsx("button", { onClick: () => setFinancialTab('monthly'), className: `py-2 px-6 font-bold text-lg transition-colors duration-200 ${financialTab === 'monthly' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400 hover:text-white'}`, children: t.finanzen.overview.monthly }), _jsx("button", { onClick: () => setFinancialTab('yearly'), className: `py-2 px-6 font-bold text-lg transition-colors duration-200 ${financialTab === 'yearly' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400 hover:text-white'}`, children: t.finanzen.overview.yearly })] }), financialTab === 'monthly' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "mb-4 bg-gray-800 p-4 rounded-lg border border-amber-500/30 flex justify-between items-center", children: [_jsx("span", { className: "font-bold text-amber-400 uppercase tracking-wider", children: t.finanzen.overview.yearTotal }), _jsxs("div", { className: "flex gap-6 text-sm", children: [_jsxs("div", { className: "flex flex-col items-end", children: [_jsx("span", { className: "text-gray-400 text-xs", children: t.finanzen.overview.income }), _jsx("span", { className: "text-green-400 font-mono", children: formatCurrency(last12MonthsStats.income) })] }), _jsxs("div", { className: "flex flex-col items-end", children: [_jsx("span", { className: "text-gray-400 text-xs", children: t.finanzen.overview.expenses }), _jsx("span", { className: "text-red-400 font-mono", children: formatCurrency(last12MonthsStats.expense) })] }), _jsxs("div", { className: "flex flex-col items-end border-l border-gray-600 pl-6", children: [_jsx("span", { className: "text-gray-300 font-bold text-xs", children: t.finanzen.overview.profit }), _jsx("span", { className: `font-mono font-bold text-lg ${last12MonthsStats.profit >= 0 ? 'text-green-400' : 'text-red-400'}`, children: formatCurrency(last12MonthsStats.profit) })] })] })] }), _jsxs("table", { className: "w-full text-left", children: [_jsx("thead", { className: "border-b border-gray-600 text-sm text-gray-400 uppercase", children: _jsxs("tr", { children: [_jsx("th", { className: "p-3", children: t.finanzen.overview.month }), _jsx("th", { className: "p-3 text-right", children: t.finanzen.overview.income }), _jsx("th", { className: "p-3 text-right", children: t.finanzen.overview.expenses }), _jsx("th", { className: "p-3 text-right", children: t.finanzen.overview.profit })] }) }), _jsx("tbody", { children: playerData.monthlyHistory.length > 0 ? (playerData.monthlyHistory.slice(-12).reverse().map(entry => (_jsxs("tr", { className: "border-b border-gray-800 hover:bg-gray-800/50", children: [_jsx("td", { className: "p-3 font-bold text-white", children: `${monthNames[entry.month]} ${entry.year}` }), _jsx("td", { className: "p-3 text-right font-mono text-green-400", children: formatCurrency(entry.income) }), _jsx("td", { className: "p-3 text-right font-mono text-red-400", children: formatCurrency(entry.expense) }), _jsx("td", { className: `p-3 text-right font-mono font-bold ${entry.profit >= 0 ? 'text-green-300' : 'text-red-300'}`, children: formatCurrency(entry.profit) })] }, `${entry.year}-${entry.month}`)))) : (_jsx("tr", { children: _jsx("td", { colSpan: 4, className: "text-center p-8 text-gray-500 italic", children: t.finanzen.overview.noMonthlyData }) })) })] })] })), financialTab === 'yearly' && (_jsxs("table", { className: "w-full text-left", children: [_jsx("thead", { className: "border-b border-gray-600 text-sm text-gray-400 uppercase", children: _jsxs("tr", { children: [_jsx("th", { className: "p-3", children: t.finanzen.overview.year }), _jsx("th", { className: "p-3 text-right", children: t.finanzen.overview.income }), _jsx("th", { className: "p-3 text-right", children: t.finanzen.overview.expenses }), _jsx("th", { className: "p-3 text-right", children: t.finanzen.overview.profit })] }) }), _jsx("tbody", { children: yearlySummary.length > 0 ? (yearlySummary.map(entry => (_jsxs("tr", { className: "border-b border-gray-800 hover:bg-gray-800/50", children: [_jsx("td", { className: "p-3 font-bold text-white", children: entry.year }), _jsx("td", { className: "p-3 text-right font-mono text-green-400", children: formatCurrency(entry.income) }), _jsx("td", { className: "p-3 text-right font-mono text-red-400", children: formatCurrency(entry.expense) }), _jsx("td", { className: `p-3 text-right font-mono font-bold ${entry.profit >= 0 ? 'text-green-300' : 'text-red-300'}`, children: formatCurrency(entry.profit) })] }, entry.year)))) : (_jsx("tr", { children: _jsx("td", { colSpan: 4, className: "text-center p-8 text-gray-500 italic", children: t.finanzen.overview.noYearlyData }) })) })] }))] }))] })] }), showTakeLoanConfirm && (_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center", onClick: e => e.stopPropagation(), children: [_jsx("h2", { className: "text-3xl font-bold font-cinzel text-amber-400 mb-4", children: t.finanzen.takeLoan.confirmTitle }), _jsx("p", { className: "text-gray-300 text-lg mb-6", children: t.finanzen.takeLoan.confirmText.replace('{amount}', formatCurrency(loanAmount)).replace('{term}', loanTerm.toString()).replace('{rate}', annualInterestRate.toFixed(2)) }), _jsxs("div", { className: "flex justify-center gap-4", children: [_jsx("button", { onClick: () => setShowTakeLoanConfirm(false), className: "bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all", children: t.common.cancel }), _jsx("button", { onClick: executeTakeLoan, className: "bg-green-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-green-500 transition-all", children: t.common.confirm })] })] }) })), loanToRepay && (_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center", onClick: e => e.stopPropagation(), children: [_jsx("h2", { className: "text-3xl font-bold font-cinzel text-amber-400 mb-4", children: t.finanzen.currentLoans.confirmRepayTitle }), _jsx("p", { className: "text-gray-300 text-lg mb-6", children: t.finanzen.currentLoans.confirmRepayText.replace('{name}', loanToRepay.name) }), _jsxs("div", { className: "bg-gray-900/50 p-4 rounded-lg mb-6 text-sm text-left border border-gray-600", children: [_jsxs("div", { className: "flex justify-between mb-2", children: [_jsx("span", { className: "text-gray-400", children: t.finanzen.currentLoans.currentDebt }), _jsx("span", { className: "font-mono text-white", children: formatCurrency(loanToRepay.totalOwed) })] }), _jsxs("div", { className: "flex justify-between mb-2 pb-2 border-b border-gray-600", children: [_jsx("span", { className: "text-red-400", children: t.finanzen.currentLoans.penalty }), _jsxs("span", { className: "font-mono text-red-400", children: ["+", formatCurrency(loanToRepay.totalOwed * 0.01)] })] }), _jsxs("div", { className: "flex justify-between font-bold text-lg", children: [_jsx("span", { className: "text-white", children: t.finanzen.currentLoans.totalRepay }), _jsx("span", { className: "font-mono text-amber-400", children: formatCurrency(loanToRepay.totalOwed * 1.01) })] })] }), _jsxs("div", { className: "flex justify-center gap-4", children: [_jsx("button", { onClick: () => setLoanToRepay(null), className: "bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all", children: t.common.cancel }), _jsx("button", { onClick: executeRepayLoan, className: "bg-red-800 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-red-700 transition-all", children: t.common.confirm })] })] }) })), selectedStock && (_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4", onClick: () => setSelectedStockTicker(null), children: _jsxs("div", { className: "bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-6xl p-6 relative overflow-y-auto max-h-[90vh]", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "flex justify-between items-start mb-6 border-b border-gray-700 pb-4", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-3xl font-bold font-cinzel text-amber-400", children: [selectedStock.name, " ", _jsxs("span", { className: "text-gray-500 text-xl", children: ["(", selectedStock.ticker, ")"] })] }), _jsx("p", { className: "text-gray-400", children: t.finanzen.stockMarket.industries[selectedStock.industry] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-3xl font-mono text-white font-bold", children: formatCurrency(selectedStock.price) }), _jsx("div", { className: "mt-1", children: (() => {
                                                        const trend = calculateTrendPercent(selectedStock.history, timeRange, selectedStock.price);
                                                        const isPos = trend >= 0;
                                                        return (_jsxs("span", { className: `text-lg font-bold ${isPos ? 'text-green-400' : 'text-red-400'}`, children: [isPos ? '▲' : '▼', " ", Math.abs(trend).toFixed(2), "% (", t.finanzen.stockMarket.ranges[timeRange], ")"] }));
                                                    })() })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "lg:col-span-2 flex flex-col", children: [_jsx("div", { className: "bg-gray-900/50 rounded-lg p-4 mb-4 border border-gray-700 flex-grow", children: _jsx(StockSparkline, { data: getVisibleHistory(selectedStock.history), color: calculateTrendPercent(selectedStock.history, timeRange, selectedStock.price) >= 0 ? '#10b981' : '#ef4444', height: 300, noDataText: t.finanzen.stockMarket.noData }) }), _jsx("div", { className: "flex justify-center gap-2", children: ['1D', '1W', '1M', '3M', '6M', '1Y'].map(range => (_jsx("button", { onClick: () => setTimeRange(range), className: `px-4 py-2 text-sm font-bold rounded-full transition-colors ${timeRange === range ? 'bg-amber-500 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`, children: t.finanzen.stockMarket.ranges[range] }, range))) })] }), _jsxs("div", { className: "flex flex-col gap-6", children: [activeTab === 'portfolio' ? (
                                                /* Performance View for Portfolio */
                                                _jsxs("div", { className: "bg-gray-900/50 p-4 rounded-lg border border-gray-700 flex-1", children: [_jsx("h3", { className: "text-lg font-bold text-amber-400 mb-4 border-b border-gray-700 pb-2", children: "Performance" }), (() => {
                                                            const portfolioEntry = playerData.portfolio[selectedStock.ticker];
                                                            const sharesOwned = portfolioEntry ? portfolioEntry.shares : 0;
                                                            const totalInvested = portfolioEntry ? portfolioEntry.totalCost : 0;
                                                            const avgPrice = sharesOwned > 0 ? totalInvested / sharesOwned : 0;
                                                            const currentTotalValue = sharesOwned * selectedStock.price;
                                                            const profitLoss = currentTotalValue - totalInvested;
                                                            const profitLossPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;
                                                            const isProfit = profitLoss >= 0;
                                                            return (_jsxs("div", { className: "space-y-4 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-400", children: t.finanzen.portfolio.avgBuyPrice }), _jsx("span", { className: "font-mono text-white", children: formatCurrency(avgPrice) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-400", children: "Aktueller Kurs:" }), _jsx("span", { className: "font-mono text-white", children: formatCurrency(selectedStock.price) })] }), _jsx("hr", { className: "border-gray-700" }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-400", children: t.finanzen.portfolio.totalValue }), _jsx("span", { className: "font-mono font-bold text-white", children: formatCurrency(currentTotalValue) })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("span", { className: "text-gray-400", children: [t.finanzen.portfolio.profitOrLoss, ":"] }), _jsxs("div", { className: `text-right font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`, children: [_jsxs("div", { className: "font-mono", children: [isProfit ? '+' : '', formatCurrency(profitLoss)] }), _jsxs("div", { className: "text-xs", children: ["(", isProfit ? '+' : '', profitLossPercent.toFixed(2), "%)"] })] })] })] }));
                                                        })()] })) : (
                                                /* Buy Section */
                                                _jsxs("div", { className: "bg-gray-900/50 p-4 rounded-lg border border-gray-700 flex-1", children: [_jsx("h3", { className: "text-lg font-bold text-green-400 mb-2 border-b border-gray-700 pb-1", children: t.finanzen.stockMarket.buy }), _jsx("div", { className: "space-y-4", children: (() => {
                                                                const amountToBuy = buyAmounts[selectedStock.ticker] || 0;
                                                                const maxCanBuy = isTestMode ? 10000 : Math.floor(playerData.capital / selectedStock.price);
                                                                const totalCost = amountToBuy * selectedStock.price;
                                                                return (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-xs text-gray-400 mb-1", children: [_jsx("span", { children: t.finanzen.stockMarket.quantity }), _jsx("span", { className: "text-white font-bold", children: amountToBuy })] }), _jsx("input", { type: "range", min: "0", max: maxCanBuy, value: amountToBuy, onChange: (e) => handleBuyAmountChange(selectedStock.ticker, e.target.value), className: "w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500 mb-2" }), _jsx("input", { type: "number", value: amountToBuy, onChange: (e) => handleBuyAmountChange(selectedStock.ticker, e.target.value), className: "w-full bg-gray-800 border border-gray-600 rounded p-1 text-white text-right", min: "0", max: maxCanBuy })] }), _jsxs("div", { className: "flex justify-between items-center text-sm", children: [_jsx("span", { className: "text-gray-400", children: t.finanzen.stockMarket.cost }), _jsx("span", { className: "font-bold text-white font-mono", children: formatCurrency(totalCost) })] }), _jsx("button", { onClick: () => handleBuyStock(selectedStock.ticker), disabled: amountToBuy <= 0 || (playerData.capital < totalCost && !isTestMode), className: "w-full bg-green-600 text-white font-bold py-2 rounded uppercase hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors", children: t.finanzen.stockMarket.buy })] }));
                                                            })() })] })), _jsxs("div", { className: "bg-gray-900/50 p-4 rounded-lg border border-gray-700 flex-1", children: [_jsx("h3", { className: "text-lg font-bold text-red-400 mb-2 border-b border-gray-700 pb-1", children: t.finanzen.portfolio.sell }), _jsx("div", { className: "space-y-4", children: (() => {
                                                                const sharesOwned = playerData.portfolio[selectedStock.ticker]?.shares || 0;
                                                                const amountToSell = sellAmounts[selectedStock.ticker] || 0;
                                                                const totalRevenue = amountToSell * selectedStock.price;
                                                                return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "text-sm text-gray-400 mb-2", children: [t.finanzen.portfolio.quantity, ": ", _jsx("span", { className: "text-white font-bold", children: sharesOwned.toLocaleString(locale, { maximumFractionDigits: 0 }) })] }), _jsxs("div", { children: [_jsx("input", { type: "range", min: "0", max: sharesOwned, step: "1", value: amountToSell, onChange: (e) => handleSellAmountChange(selectedStock.ticker, e.target.value), className: "w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500 mb-2", disabled: sharesOwned <= 0 }), _jsx("input", { type: "number", value: Math.round(amountToSell), onChange: (e) => handleSellAmountChange(selectedStock.ticker, e.target.value), className: "w-full bg-gray-800 border border-gray-600 rounded p-1 text-white text-right", min: "0", max: Math.floor(sharesOwned), disabled: sharesOwned <= 0 })] }), _jsxs("div", { className: "flex justify-between items-center text-sm", children: [_jsx("span", { className: "text-gray-400", children: t.finanzen.portfolio.revenue }), _jsx("span", { className: "font-bold text-white font-mono", children: formatCurrency(totalRevenue) })] }), _jsx("button", { onClick: () => handleSellStock(selectedStock.ticker), disabled: amountToSell <= 0, className: "w-full bg-red-600 text-white font-bold py-2 rounded uppercase hover:bg-red-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors", children: t.finanzen.portfolio.sell })] }));
                                                            })() })] })] })] }), _jsx("div", { className: "mt-6 text-center", children: _jsx("button", { onClick: () => setSelectedStockTicker(null), className: "text-gray-400 hover:text-white underline text-sm", children: t.common.close }) })] }) }))] })] }));
};
export default FinanzenScreen;
