
import React, { useState, useMemo, useEffect } from 'react';
import { PlayerData, Loan, Stock, GameSpeed, Transaction } from '../types';
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

export type FinanzenTab = 'take_loan' | 'current_loans' | 'stock_market' | 'portfolio' | 'overview';
type TimeRange = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';

interface FinanzenScreenProps {
  onBack: () => void;
  gameSpeed: GameSpeed;
  setGameSpeed: (speed: GameSpeed) => void;
  initialTab?: FinanzenTab;
}

// Helper component for mini sparkline chart
const StockSparkline: React.FC<{ data: number[]; color: string; height?: number; noDataText?: string }> = ({ data, color, height = 40, noDataText }) => {
    const { t } = useTranslation();
    const text = noDataText || t.finanzen.stockMarket.noData;

    if (!data || data.length < 2) return <div className={`h-[${height}px] w-full bg-gray-900/30 rounded flex items-center justify-center text-xs text-gray-500`}>{text}</div>;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 100; 
    
    const points = data.map((val, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="opacity-80">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                points={points}
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    );
};

const SidebarButton: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ title, description, icon, isActive, onClick }) => {
  const activeClasses = 'border-amber-500 ring-2 ring-amber-500 bg-gray-700/50';
  const defaultClasses = 'border-gray-700 hover:border-amber-500/50 hover:-translate-y-1';

  return (
    <button
      onClick={onClick}
      className={`bg-black bg-opacity-60 backdrop-blur-md border rounded-lg p-4 text-left transform transition-all duration-300 ease-in-out group w-full ${
        isActive ? activeClasses : defaultClasses
      }`}
    >
      <div className="flex items-start">
        <div className={`bg-gray-800 p-2 rounded-md mr-3 mt-1 group-hover:bg-amber-500 transition-colors duration-300 ${isActive && 'bg-amber-500'}`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className={`text-md font-bold font-cinzel ${isActive ? 'text-amber-300' : 'text-amber-400'} group-hover:text-amber-300 transition-colors`}>
            {title}
          </h3>
          <p className="text-xs text-gray-300 mt-1">{description}</p>
        </div>
      </div>
    </button>
  );
};

const FinanzenScreen: React.FC<FinanzenScreenProps> = ({ onBack, gameSpeed, setGameSpeed, initialTab }) => {
    const { playerData, setPlayerData } = useGame();
    const { t, language } = useTranslation();
    const locale = language === 'de' ? 'de-DE' : 'en-US';
    const [activeTab, setActiveTab] = useState<FinanzenTab>(initialTab || 'stock_market');
    const [loanAmount, setLoanAmount] = useState(0);
    const [loanTerm, setLoanTerm] = useState(1); // in years
    const [buyAmounts, setBuyAmounts] = useState<Record<string, number>>({});
    const [sellAmounts, setSellAmounts] = useState<Record<string, number>>({});
    const [financialTab, setFinancialTab] = useState<'monthly' | 'yearly'>('monthly');
    const [timeRange, setTimeRange] = useState<TimeRange>('1Y');
    
    // Confirmation Modals State
    const [showTakeLoanConfirm, setShowTakeLoanConfirm] = useState(false);
    const [loanToRepay, setLoanToRepay] = useState<Loan | null>(null);

    // New State for Stock Detail Modal
    const [selectedStockTicker, setSelectedStockTicker] = useState<string | null>(null);

    if (!playerData) return null;

    const isTestMode = playerData.playerName === 'Max Mustermann' && playerData.studioName === 'Teststudio';
    const totalDebt = useMemo(() => playerData.loans.reduce((sum, loan) => sum + loan.totalOwed, 0), [playerData.loans]);
    
    const formatCurrency = (value: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

    const creditLimit = useMemo(() => {
        const prestige = playerData.reputation;
        if (prestige <= 9) return 250000;
        if (prestige <= 19) return 1000000;
        if (prestige <= 29) return 2500000;
        if (prestige <= 39) return 5000000;
        if (prestige <= 49) return 7500000;
        if (prestige <= 59) return 10000000;
        if (prestige <= 69) return 15000000;
        if (prestige <= 79) return 25000000;
        if (prestige <= 89) return 50000000;
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
        if (loanAmount <= 0) return 0;
        const monthlyRate = (annualInterestRate / 100) / 12;
        const numberOfPayments = loanTerm * 12;
        if (monthlyRate === 0) return loanAmount / numberOfPayments;
        const payment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
        return payment;
    }, [loanAmount, annualInterestRate, loanTerm]);

    const totalInterest = useMemo(() => {
        if (loanAmount <= 0) return 0;
        const numberOfPayments = loanTerm * 12;
        const totalPaid = monthlyPayment * numberOfPayments;
        return totalPaid - loanAmount;
    }, [monthlyPayment, loanTerm, loanAmount]);

    // Initial click handler - Shows modal
    const handleTakeLoanClick = () => {
        if (loanAmount <= 0) return;
        setShowTakeLoanConfirm(true);
    };

    // Actual Logic Execution after Confirmation
    const executeTakeLoan = () => {
        const newLoan: Loan = {
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
            if (!prev) return null;
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
    const handleRepayLoanClick = (loan: Loan) => {
        setLoanToRepay(loan);
    };

    // Actual Logic Execution after Confirmation
    const executeRepayLoan = () => {
        if (!loanToRepay) return;
        
        // 1% Prepayment Penalty
        const penalty = loanToRepay.totalOwed * 0.01;
        const totalToPay = loanToRepay.totalOwed + penalty;

        if (playerData.capital < totalToPay && !isTestMode) return;

        setPlayerData(prev => {
            if (!prev) return null;
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

    const handleBuyAmountChange = (ticker: string, value: string) => {
        const stock = playerData.stocks.find(s => s.ticker === ticker);
        if (!stock) return;
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

    const handleBuyStock = (ticker: string) => {
        const stock = playerData.stocks.find(s => s.ticker === ticker);
        const amount = buyAmounts[ticker] || 0;
        if (!stock || amount <= 0) return;
        const cost = stock.price * amount;
        if (playerData.capital < cost && !isTestMode) return;

        setPlayerData(prev => {
            if (!prev) return null;
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

    const handleSellAmountChange = (ticker: string, value: string) => {
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

    const handleSellStock = (ticker: string) => {
        const stock = playerData.stocks.find(s => s.ticker === ticker);
        const amount = sellAmounts[ticker] || 0;
        const sharesOwned = playerData.portfolio[ticker]?.shares || 0;
        if (!stock || sharesOwned < amount || amount <= 0) return;
        
        const revenue = stock.price * amount;

        setPlayerData(prev => {
            if (!prev) return null;
            const oldPortfolioData = prev.portfolio[ticker];
            const avgPrice = oldPortfolioData.shares > 0 ? oldPortfolioData.totalCost / oldPortfolioData.shares : 0;
            const costOfSoldShares = avgPrice * amount;
            const newShares = oldPortfolioData.shares - amount;
            
            const newPortfolio = { ...prev.portfolio };
            if (newShares <= 0.001) {
                delete newPortfolio[ticker];
            } else {
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
        const summary: { [year: number]: { year: number; income: number; expense: number; profit: number } } = {};
    
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

    
    const getVisibleHistory = (history: number[]) => {
        if (!history || history.length === 0) return [];
        // history array contains weekly data points
        switch(timeRange) {
             case '1Y': return history.slice(-52); // 1 Jahr = 52 Wochen
             case '6M': return history.slice(-26); // 6 Monate approx 26 Wochen
             case '3M': return history.slice(-13); // 3 Monate approx 13 Wochen
             case '1M': return history.slice(-4);  // 1 Monat approx 4 Wochen
             case '1W': return history.slice(-2);  // 1 Woche (zeigt Start und Ende der Woche)
             case '1D': return history.slice(-2);  // 1 Tag (Fallback auf Woche, da keine Tagesdaten)
             default: return history;
        }
    };

    const calculateTrendPercent = (history: number[], range: TimeRange, currentPrice: number) => {
        if (!history || history.length < 2) return 0;

        let weeksBack = 1;
        switch (range) {
            case '1Y': weeksBack = 52; break;
            case '6M': weeksBack = 26; break;
            case '3M': weeksBack = 13; break;
            case '1M': weeksBack = 4; break;
            case '1W': weeksBack = 1; break;
            case '1D': weeksBack = 1; break;
        }

        const startIndex = Math.max(0, history.length - 1 - weeksBack);
        const startPrice = history[startIndex];

        if (!startPrice) return 0; // Should not happen if history.length >= 2

        return ((currentPrice - startPrice) / startPrice) * 100;
    };

    const selectedStock = useMemo(() => {
        if (!selectedStockTicker) return null;
        return playerData.stocks.find(s => s.ticker === selectedStockTicker);
    }, [selectedStockTicker, playerData.stocks]);

    return (
        <div className="w-full h-full relative">
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: `url(${finanzenBackgroundImage})`,
                    filter: 'brightness(1.3)',
                }}
                aria-hidden="true"
            />
            <div className="w-full h-full flex flex-col bg-black bg-opacity-0 relative">
                <GameHeader gameSpeed={gameSpeed} setGameSpeed={setGameSpeed} disabled />
                
                <div className="flex-grow w-full flex flex-row overflow-hidden">
                    <aside className="w-80 flex-shrink-0 bg-black bg-opacity-50 border-r border-gray-700 flex flex-col">
                        <header className="p-6 text-center border-b border-gray-700">
                            <h1 className="text-3xl font-bold font-cinzel text-amber-400">{t.finanzen.screen.title}</h1>
                        </header>
                        <nav className="flex-grow p-4 flex flex-col gap-4 overflow-y-auto">
                           <SidebarButton
                                title={t.finanzen.screen.nav.takeLoan}
                                description={t.finanzen.screen.nav.takeLoanDesc}
                                icon={<KreditIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />}
                                isActive={activeTab === 'take_loan'}
                                onClick={() => setActiveTab('take_loan')}
                            />
                             <SidebarButton
                                title={t.finanzen.screen.nav.currentLoans}
                                description={t.finanzen.screen.nav.currentLoansDesc}
                                icon={<LaufendeKrediteIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />}
                                isActive={activeTab === 'current_loans'}
                                onClick={() => setActiveTab('current_loans')}
                            />
                            <SidebarButton
                                title={t.finanzen.screen.nav.stockMarket}
                                description={t.finanzen.screen.nav.stockMarketDesc}
                                icon={<FinanzenIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />}
                                isActive={activeTab === 'stock_market'}
                                onClick={() => setActiveTab('stock_market')}
                            />
                            <SidebarButton
                                title={t.finanzen.screen.nav.portfolio}
                                description={t.finanzen.screen.nav.portfolioDesc}
                                icon={<PortfolioIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />}
                                isActive={activeTab === 'portfolio'}
                                onClick={() => setActiveTab('portfolio')}
                            />
                             <SidebarButton
                                title={t.finanzen.screen.nav.overview}
                                description={t.finanzen.screen.nav.overviewDesc}
                                icon={<BarChartIcon className="h-5 w-5 bg-gray-400 group-hover:bg-black transition-colors" />}
                                isActive={activeTab === 'overview'}
                                onClick={() => setActiveTab('overview')}
                            />
                        </nav>
                        <footer className="p-4 border-t border-gray-700">
                            <button
                                onClick={onBack}
                                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-sm text-sm uppercase"
                            >
                                {t.finanzen.screen.backToMain}
                            </button>
                        </footer>
                    </aside>
                    
                    <main className="flex-grow p-4 overflow-y-auto">
                        {activeTab === 'take_loan' && (
                           <div className="text-white max-w-3xl mx-auto space-y-4">
                                <div className="bg-gray-800/90 p-4 rounded-lg border border-gray-700/50">
                                    <h3 className="text-xl font-cinzel text-amber-400 mb-2">{t.finanzen.takeLoan.creditLimitTitle}</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                        <div>
                                            <p className="text-xs text-gray-400">{t.finanzen.takeLoan.prestige}</p>
                                            <div className="flex justify-center mt-1"><StarRating rating={playerData.reputation} size="md" showValue={false} /></div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">{t.finanzen.takeLoan.limit}</p>
                                            <p className="text-2xl font-bold">{formatCurrency(creditLimit)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">{t.finanzen.takeLoan.used}</p>
                                            <p className="text-2xl font-bold">{formatCurrency(totalDebt)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">{t.finanzen.takeLoan.available}</p>
                                            <p className="text-2xl font-bold">{formatCurrency(availableCredit)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-800/90 p-4 rounded-lg border border-gray-700/50">
                                    <h3 className="text-xl font-cinzel text-amber-400 mb-4">💡 {t.finanzen.takeLoan.newLoanTitle}</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between items-baseline mb-1">
                                                <label className="text-sm font-bold">{t.finanzen.takeLoan.amount}</label>
                                                <span className="text-lg font-mono font-bold">{formatCurrency(loanAmount)}</span>
                                            </div>
                                            <input 
                                                type="range"
                                                min="0"
                                                max={availableCredit}
                                                step={availableCredit > 100000 ? 1000 : 100}
                                                value={loanAmount}
                                                onChange={(e) => setLoanAmount(Number(e.target.value))}
                                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                            />
                                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                                <span>{formatCurrency(0)}</span>
                                                <span>{formatCurrency(availableCredit)}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-baseline mb-1">
                                                <label className="text-sm font-bold">{t.finanzen.takeLoan.term}</label>
                                                <span className="text-lg font-mono font-bold">{loanTerm} {loanTerm > 1 ? t.finanzen.takeLoan.years : t.finanzen.takeLoan.year}</span>
                                            </div>
                                            <input 
                                                type="range"
                                                min="1"
                                                max="10"
                                                step="1"
                                                value={loanTerm}
                                                onChange={(e) => setLoanTerm(Number(e.target.value))}
                                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                            />
                                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                                <span>1 {t.finanzen.takeLoan.year}</span>
                                                <span>10 {t.finanzen.takeLoan.years}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-gray-800/90 p-4 rounded-lg border border-gray-700/50">
                                    <h3 className="text-xl font-cinzel text-gray-300 mb-2">{t.finanzen.takeLoan.conditionsTitle}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                                        <div>
                                            <p className="text-xs text-gray-400">{t.finanzen.takeLoan.interestRate}</p>
                                            <p className="text-2xl font-bold">{annualInterestRate.toFixed(2)}%</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">{t.finanzen.takeLoan.monthlyPayment}</p>
                                            <p className="text-2xl font-bold">{formatCurrency(monthlyPayment)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">{t.finanzen.takeLoan.totalInterest}</p>
                                            <p className="text-2xl font-bold">{formatCurrency(totalInterest)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button 
                                        onClick={handleTakeLoanClick}
                                        disabled={loanAmount <= 0}
                                        className="w-full bg-gray-300 text-gray-900 font-bold py-3 text-lg rounded-sm uppercase tracking-wider hover:bg-white disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400 transition-all"
                                    >
                                        {t.finanzen.takeLoan.applyButton.replace('{amount}', formatCurrency(loanAmount))}
                                    </button>
                                </div>
                            </div>
                        )}
                         {activeTab === 'current_loans' && (
                             <div>
                                {playerData.loans.length > 0 ? (
                                    <>
                                        <h2 className="text-2xl font-cinzel text-amber-400 mb-4">{t.finanzen.currentLoans.title}</h2>
                                        <div className="space-y-4">
                                            {playerData.loans.map(loan => {
                                                const totalMonths = loan.termInYears * 12;
                                                const monthsPassed = Math.round(((new Date(playerData.gameDate).getTime() - new Date(loan.dateTaken).getTime()) / (1000 * 3600 * 24 * 30.44)));
                                                const remainingMonths = Math.max(0, totalMonths - monthsPassed);
                                                const interestForMonth = loan.totalOwed * (loan.interestRate / 12);
                                                const principalForMonth = loan.monthlyPayment - interestForMonth;

                                                return (
                                                <div key={loan.id} className="bg-gray-800/90 p-4 rounded-lg border border-gray-700/50">
                                                    <div className="flex justify-between items-baseline border-b border-gray-700 pb-2 mb-3">
                                                        <h3 className="font-bold text-lg text-white">{loan.name}</h3>
                                                        <div className="text-sm text-gray-300">{t.finanzen.currentLoans.remainingTerm}: <span className="font-bold">{remainingMonths} {t.finanzen.currentLoans.months}</span></div>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                                                        <div><span className="text-gray-400">{t.finanzen.currentLoans.originalAmount}</span></div><div className="text-right font-mono">{formatCurrency(loan.principal)}</div>
                                                        <div><span className="text-gray-400">{t.finanzen.currentLoans.currentDebt}</span></div><div className="text-right font-mono text-red-400 font-bold">{formatCurrency(loan.totalOwed)}</div>
                                                        <div><span className="text-gray-400">{t.finanzen.currentLoans.interestRate}</span></div><div className="text-right font-mono">{(loan.interestRate * 100).toFixed(2)}%</div>
                                                    </div>

                                                    <div className="mt-3 pt-3 border-t border-gray-700">
                                                        <div className="flex justify-between items-baseline text-lg">
                                                            <span className="text-gray-300">{t.finanzen.currentLoans.monthlyPayment}</span>
                                                            <span className="font-bold text-amber-400 font-mono">{formatCurrency(loan.monthlyPayment)}</span>
                                                        </div>
                                                        <div className="text-xs text-gray-400 pl-4">
                                                            <div className="flex justify-between"><span>{t.finanzen.currentLoans.ofWhichInterest}</span> <span className="font-mono">{formatCurrency(interestForMonth)}</span></div>
                                                            <div className="flex justify-between"><span>{t.finanzen.currentLoans.ofWhichPrincipal}</span> <span className="font-mono">{formatCurrency(principalForMonth)}</span></div>
                                                        </div>
                                                    </div>

                                                    <button onClick={() => handleRepayLoanClick(loan)} disabled={(playerData.capital < loan.totalOwed * 1.01) && !isTestMode} className="w-full mt-4 bg-red-800 text-white font-bold py-2 rounded-sm text-sm uppercase hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed">
                                                        {t.finanzen.currentLoans.repayFully}
                                                    </button>
                                                </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                ) : (
                                    <div className="bg-gray-800/90 p-8 rounded-lg border border-gray-700/50 max-w-xl mx-auto text-center mt-16">
                                        <h2 className="text-3xl font-cinzel text-amber-400 mb-4">{t.finanzen.currentLoans.title}</h2>
                                        <p className="text-gray-400 text-lg">{t.finanzen.currentLoans.noLoans}</p>
                                    </div>
                                )}
                            </div>
                         )}
                        {activeTab === 'stock_market' && (
                            <div className="flex flex-col h-full bg-gray-900/90 rounded-lg border border-gray-700 overflow-hidden">
                                <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
                                    <h2 className="text-xl font-cinzel text-amber-400">{t.finanzen.stockMarket.buy}</h2>
                                    <select 
                                        value={timeRange} 
                                        onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                                        className="bg-gray-800 border border-gray-600 rounded-md p-1 text-white text-sm focus:ring-amber-500 focus:border-amber-500"
                                    >
                                        <option value="1D">{t.finanzen.stockMarket.ranges["1D"]}</option>
                                        <option value="1W">{t.finanzen.stockMarket.ranges["1W"]}</option>
                                        <option value="1M">{t.finanzen.stockMarket.ranges["1M"]}</option>
                                        <option value="3M">{t.finanzen.stockMarket.ranges["3M"]}</option>
                                        <option value="6M">{t.finanzen.stockMarket.ranges["6M"]}</option>
                                        <option value="1Y">{t.finanzen.stockMarket.ranges["1Y"]}</option>
                                    </select>
                                </div>
                                <div className="overflow-y-auto flex-grow p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {playerData.stocks.map(stock => {
                                            const trendPercent = calculateTrendPercent(stock.history, timeRange, stock.price);
                                            const isTrendPositive = trendPercent >= 0;

                                            return (
                                                <div 
                                                    key={stock.ticker} 
                                                    onClick={() => setSelectedStockTicker(stock.ticker)}
                                                    className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-700/50 transition-colors flex flex-col justify-between"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="font-bold text-white text-lg">{stock.name}</div>
                                                        <div className="text-right font-mono text-white text-lg">{formatCurrency(stock.price)}</div>
                                                    </div>
                                                    <div className="flex justify-between items-end">
                                                         <div>
                                                            <div className="text-xs text-gray-500 font-mono">{t.finanzen.stockMarket.industries[stock.industry as keyof typeof t.finanzen.stockMarket.industries]}</div>
                                                            <div className="text-xs text-gray-400 font-mono">{stock.ticker}</div>
                                                         </div>
                                                        <div className={`font-bold text-sm ${isTrendPositive ? 'text-green-400' : 'text-red-400'}`}>
                                                            {isTrendPositive ? '+' : ''}{trendPercent.toFixed(2)}%
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'portfolio' && (
                            <div className="flex flex-col h-full bg-gray-900/90 rounded-lg border border-gray-700 overflow-hidden">
                                <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
                                     <div>
                                        <h2 className="text-xl font-cinzel text-amber-400">{t.finanzen.portfolio.title}</h2>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {t.finanzen.portfolio.totalValue} <span className="text-green-400 font-mono font-bold text-sm">{formatCurrency(totalPortfolioValue)}</span>
                                        </p>
                                     </div>
                                    <select 
                                        value={timeRange} 
                                        onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                                        className="bg-gray-800 border border-gray-600 rounded-md p-1 text-white text-sm focus:ring-amber-500 focus:border-amber-500"
                                    >
                                        <option value="1D">{t.finanzen.stockMarket.ranges["1D"]}</option>
                                        <option value="1W">{t.finanzen.stockMarket.ranges["1W"]}</option>
                                        <option value="1M">{t.finanzen.stockMarket.ranges["1M"]}</option>
                                        <option value="3M">{t.finanzen.stockMarket.ranges["3M"]}</option>
                                        <option value="6M">{t.finanzen.stockMarket.ranges["6M"]}</option>
                                        <option value="1Y">{t.finanzen.stockMarket.ranges["1Y"]}</option>
                                    </select>
                                </div>
                                <div className="overflow-y-auto flex-grow p-4">
                                {portfolioStocks.length > 0 ? (
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {portfolioStocks.map(ticker => {
                                                const stock = playerData.stocks.find(s => s.ticker === ticker);
                                                if (!stock) return null;
                                                
                                                const portfolioData = playerData.portfolio[ticker];
                                                const shares = portfolioData.shares;
                                                const totalCost = portfolioData.totalCost;
                                                const currentValue = stock.price * shares;
                                                const profitLoss = currentValue - totalCost;
                                                const profitLossPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;
                                                const isProfit = profitLoss >= 0;

                                                return (
                                                    <div 
                                                        key={ticker} 
                                                        onClick={() => setSelectedStockTicker(ticker)}
                                                        className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-700/50 transition-colors flex flex-col justify-between"
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="font-bold text-white text-lg">{stock.name}</div>
                                                            <div className="text-right font-mono text-white text-lg">{formatCurrency(currentValue)}</div>
                                                        </div>
                                                        <div className="flex justify-between items-end">
                                                             <div>
                                                                <div className="text-xs text-gray-500 font-mono">{shares.toLocaleString(locale, {maximumFractionDigits: 0})} {t.finanzen.portfolio.quantity.replace(':','')}</div>
                                                                <div className="text-xs text-gray-400 font-mono">{stock.ticker}</div>
                                                             </div>
                                                            <div className={`font-bold text-sm ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                                                                {isProfit ? '+' : ''}{formatCurrency(profitLoss)} ({isProfit ? '+' : ''}{profitLossPercent.toFixed(2)}%)
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <p className="text-gray-400 text-lg">{t.finanzen.portfolio.noStocks}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                         {activeTab === 'overview' && (
                            <div className="bg-gray-900 bg-opacity-80 p-6 rounded-lg border border-gray-700">
                                <div className="flex mb-6 border-b border-gray-700">
                                    <button 
                                        onClick={() => setFinancialTab('monthly')}
                                        className={`py-2 px-6 font-bold text-lg transition-colors duration-200 ${financialTab === 'monthly' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        {t.finanzen.overview.monthly}
                                    </button>
                                    <button 
                                        onClick={() => setFinancialTab('yearly')}
                                        className={`py-2 px-6 font-bold text-lg transition-colors duration-200 ${financialTab === 'yearly' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        {t.finanzen.overview.yearly}
                                    </button>
                                </div>

                                {financialTab === 'monthly' && (
                                    <>
                                        {/* Year Summary Box */}
                                        <div className="mb-4 bg-gray-800 p-4 rounded-lg border border-amber-500/30 flex justify-between items-center">
                                            <span className="font-bold text-amber-400 uppercase tracking-wider">
                                                {t.finanzen.overview.yearTotal}
                                            </span>
                                            <div className="flex gap-6 text-sm">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-gray-400 text-xs">{t.finanzen.overview.income}</span>
                                                    <span className="text-green-400 font-mono">{formatCurrency(last12MonthsStats.income)}</span>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-gray-400 text-xs">{t.finanzen.overview.expenses}</span>
                                                    <span className="text-red-400 font-mono">{formatCurrency(last12MonthsStats.expense)}</span>
                                                </div>
                                                <div className="flex flex-col items-end border-l border-gray-600 pl-6">
                                                    <span className="text-gray-300 font-bold text-xs">{t.finanzen.overview.profit}</span>
                                                    <span className={`font-mono font-bold text-lg ${last12MonthsStats.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {formatCurrency(last12MonthsStats.profit)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <table className="w-full text-left">
                                            <thead className="border-b border-gray-600 text-sm text-gray-400 uppercase">
                                                <tr>
                                                    <th className="p-3">{t.finanzen.overview.month}</th>
                                                    <th className="p-3 text-right">{t.finanzen.overview.income}</th>
                                                    <th className="p-3 text-right">{t.finanzen.overview.expenses}</th>
                                                    <th className="p-3 text-right">{t.finanzen.overview.profit}</th>
                                                    {/* Details header removed */}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {playerData.monthlyHistory.length > 0 ? (
                                                    playerData.monthlyHistory.slice(-12).reverse().map(entry => (
                                                        <tr key={`${entry.year}-${entry.month}`} className="border-b border-gray-800 hover:bg-gray-800/50">
                                                            <td className="p-3 font-bold text-white">{`${monthNames[entry.month]} ${entry.year}`}</td>
                                                            <td className="p-3 text-right font-mono text-green-400">{formatCurrency(entry.income)}</td>
                                                            <td className="p-3 text-right font-mono text-red-400">{formatCurrency(entry.expense)}</td>
                                                            <td className={`p-3 text-right font-mono font-bold ${entry.profit >= 0 ? 'text-green-300' : 'text-red-300'}`}>{formatCurrency(entry.profit)}</td>
                                                            {/* Details button cell removed */}
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={4} className="text-center p-8 text-gray-500 italic">
                                                            {t.finanzen.overview.noMonthlyData}
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </>
                                )}

                                {financialTab === 'yearly' && (
                                    <table className="w-full text-left">
                                        <thead className="border-b border-gray-600 text-sm text-gray-400 uppercase">
                                            <tr>
                                                <th className="p-3">{t.finanzen.overview.year}</th>
                                                <th className="p-3 text-right">{t.finanzen.overview.income}</th>
                                                <th className="p-3 text-right">{t.finanzen.overview.expenses}</th>
                                                <th className="p-3 text-right">{t.finanzen.overview.profit}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {yearlySummary.length > 0 ? (
                                                yearlySummary.map(entry => (
                                                    <tr key={entry.year} className="border-b border-gray-800 hover:bg-gray-800/50">
                                                        <td className="p-3 font-bold text-white">{entry.year}</td>
                                                        <td className="p-3 text-right font-mono text-green-400">{formatCurrency(entry.income)}</td>
                                                        <td className="p-3 text-right font-mono text-red-400">{formatCurrency(entry.expense)}</td>
                                                        <td className={`p-3 text-right font-mono font-bold ${entry.profit >= 0 ? 'text-green-300' : 'text-red-300'}`}>{formatCurrency(entry.profit)}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="text-center p-8 text-gray-500 italic">
                                                        {t.finanzen.overview.noYearlyData}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}
                    </main>
                </div>
                
                {/* Take Loan Confirmation Modal */}
                {showTakeLoanConfirm && (
                    <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center" onClick={e => e.stopPropagation()}>
                            <h2 className="text-3xl font-bold font-cinzel text-amber-400 mb-4">{t.finanzen.takeLoan.confirmTitle}</h2>
                            <p className="text-gray-300 text-lg mb-6">
                                {t.finanzen.takeLoan.confirmText.replace('{amount}', formatCurrency(loanAmount)).replace('{term}', loanTerm.toString()).replace('{rate}', annualInterestRate.toFixed(2))}
                            </p>
                            <div className="flex justify-center gap-4">
                                <button onClick={() => setShowTakeLoanConfirm(false)} className="bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all">{t.common.cancel}</button>
                                <button onClick={executeTakeLoan} className="bg-green-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-green-500 transition-all">{t.common.confirm}</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Repay Loan Confirmation Modal */}
                {loanToRepay && (
                    <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center" onClick={e => e.stopPropagation()}>
                            <h2 className="text-3xl font-bold font-cinzel text-amber-400 mb-4">{t.finanzen.currentLoans.confirmRepayTitle}</h2>
                            <p className="text-gray-300 text-lg mb-6">
                                {t.finanzen.currentLoans.confirmRepayText.replace('{name}', loanToRepay.name)}
                            </p>
                            <div className="bg-gray-900/50 p-4 rounded-lg mb-6 text-sm text-left border border-gray-600">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-400">{t.finanzen.currentLoans.currentDebt}</span>
                                    <span className="font-mono text-white">{formatCurrency(loanToRepay.totalOwed)}</span>
                                </div>
                                <div className="flex justify-between mb-2 pb-2 border-b border-gray-600">
                                    <span className="text-red-400">{t.finanzen.currentLoans.penalty}</span>
                                    <span className="font-mono text-red-400">+{formatCurrency(loanToRepay.totalOwed * 0.01)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg">
                                    <span className="text-white">{t.finanzen.currentLoans.totalRepay}</span>
                                    <span className="font-mono text-amber-400">{formatCurrency(loanToRepay.totalOwed * 1.01)}</span>
                                </div>
                            </div>
                            <div className="flex justify-center gap-4">
                                <button onClick={() => setLoanToRepay(null)} className="bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all">{t.common.cancel}</button>
                                <button onClick={executeRepayLoan} className="bg-red-800 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-red-700 transition-all">{t.common.confirm}</button>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Stock Detail Modal */}
                {selectedStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedStockTicker(null)}>
                        <div className="bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-6xl p-6 relative overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-start mb-6 border-b border-gray-700 pb-4">
                                <div>
                                    <h2 className="text-3xl font-bold font-cinzel text-amber-400">{selectedStock.name} <span className="text-gray-500 text-xl">({selectedStock.ticker})</span></h2>
                                    <p className="text-gray-400">{t.finanzen.stockMarket.industries[selectedStock.industry as keyof typeof t.finanzen.stockMarket.industries]}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-mono text-white font-bold">{formatCurrency(selectedStock.price)}</p>
                                    <div className="mt-1">
                                        {(() => {
                                            const trend = calculateTrendPercent(selectedStock.history, timeRange, selectedStock.price);
                                            const isPos = trend >= 0;
                                            return (
                                                <span className={`text-lg font-bold ${isPos ? 'text-green-400' : 'text-red-400'}`}>
                                                    {isPos ? '▲' : '▼'} {Math.abs(trend).toFixed(2)}% ({t.finanzen.stockMarket.ranges[timeRange]})
                                                </span>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Column: Chart & Time Controls */}
                                <div className="lg:col-span-2 flex flex-col">
                                    <div className="bg-gray-900/50 rounded-lg p-4 mb-4 border border-gray-700 flex-grow">
                                        <StockSparkline 
                                            data={getVisibleHistory(selectedStock.history)} 
                                            color={calculateTrendPercent(selectedStock.history, timeRange, selectedStock.price) >= 0 ? '#10b981' : '#ef4444'} 
                                            height={300}
                                            noDataText={t.finanzen.stockMarket.noData}
                                        />
                                    </div>
                                    <div className="flex justify-center gap-2">
                                         {(['1D', '1W', '1M', '3M', '6M', '1Y'] as TimeRange[]).map(range => (
                                             <button 
                                                key={range}
                                                onClick={() => setTimeRange(range)}
                                                className={`px-4 py-2 text-sm font-bold rounded-full transition-colors ${timeRange === range ? 'bg-amber-500 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                                             >
                                                 {t.finanzen.stockMarket.ranges[range]}
                                             </button>
                                         ))}
                                    </div>
                                </div>

                                {/* Right Column: Trading Controls */}
                                <div className="flex flex-col gap-6">
                                    {activeTab === 'portfolio' ? (
                                        /* Performance View for Portfolio */
                                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 flex-1">
                                            <h3 className="text-lg font-bold text-amber-400 mb-4 border-b border-gray-700 pb-2">Performance</h3>
                                            {(() => {
                                                const portfolioEntry = playerData.portfolio[selectedStock.ticker];
                                                const sharesOwned = portfolioEntry ? portfolioEntry.shares : 0;
                                                const totalInvested = portfolioEntry ? portfolioEntry.totalCost : 0;
                                                const avgPrice = sharesOwned > 0 ? totalInvested / sharesOwned : 0;
                                                const currentTotalValue = sharesOwned * selectedStock.price;
                                                const profitLoss = currentTotalValue - totalInvested;
                                                const profitLossPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;
                                                const isProfit = profitLoss >= 0;

                                                return (
                                                    <div className="space-y-4 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-400">{t.finanzen.portfolio.avgBuyPrice}</span>
                                                            <span className="font-mono text-white">{formatCurrency(avgPrice)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-400">Aktueller Kurs:</span>
                                                            <span className="font-mono text-white">{formatCurrency(selectedStock.price)}</span>
                                                        </div>
                                                        <hr className="border-gray-700"/>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-400">{t.finanzen.portfolio.totalValue}</span>
                                                            <span className="font-mono font-bold text-white">{formatCurrency(currentTotalValue)}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-400">{t.finanzen.portfolio.profitOrLoss}:</span>
                                                            <div className={`text-right font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                                                                <div className="font-mono">{isProfit ? '+' : ''}{formatCurrency(profitLoss)}</div>
                                                                <div className="text-xs">({isProfit ? '+' : ''}{profitLossPercent.toFixed(2)}%)</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    ) : (
                                        /* Buy Section */
                                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 flex-1">
                                            <h3 className="text-lg font-bold text-green-400 mb-2 border-b border-gray-700 pb-1">{t.finanzen.stockMarket.buy}</h3>
                                            <div className="space-y-4">
                                                {(() => {
                                                     const amountToBuy = buyAmounts[selectedStock.ticker] || 0;
                                                     const maxCanBuy = isTestMode ? 10000 : Math.floor(playerData.capital / selectedStock.price);
                                                     const totalCost = amountToBuy * selectedStock.price;
                                                     
                                                     return (
                                                         <>
                                                            <div>
                                                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                                                    <span>{t.finanzen.stockMarket.quantity}</span>
                                                                    <span className="text-white font-bold">{amountToBuy}</span>
                                                                </div>
                                                                <input 
                                                                    type="range" min="0" max={maxCanBuy} value={amountToBuy}
                                                                    onChange={(e) => handleBuyAmountChange(selectedStock.ticker, e.target.value)}
                                                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500 mb-2"
                                                                />
                                                                <input
                                                                    type="number" value={amountToBuy} onChange={(e) => handleBuyAmountChange(selectedStock.ticker, e.target.value)}
                                                                    className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-white text-right"
                                                                    min="0" max={maxCanBuy}
                                                                />
                                                            </div>
                                                            <div className="flex justify-between items-center text-sm">
                                                                <span className="text-gray-400">{t.finanzen.stockMarket.cost}</span>
                                                                <span className="font-bold text-white font-mono">{formatCurrency(totalCost)}</span>
                                                            </div>
                                                            <button 
                                                                onClick={() => handleBuyStock(selectedStock.ticker)} 
                                                                disabled={amountToBuy <= 0 || (playerData.capital < totalCost && !isTestMode)} 
                                                                className="w-full bg-green-600 text-white font-bold py-2 rounded uppercase hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
                                                            >
                                                                {t.finanzen.stockMarket.buy}
                                                            </button>
                                                         </>
                                                     );
                                                })()}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Sell Section */}
                                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 flex-1">
                                        <h3 className="text-lg font-bold text-red-400 mb-2 border-b border-gray-700 pb-1">{t.finanzen.portfolio.sell}</h3>
                                        <div className="space-y-4">
                                            {(() => {
                                                 const sharesOwned = playerData.portfolio[selectedStock.ticker]?.shares || 0;
                                                 const amountToSell = sellAmounts[selectedStock.ticker] || 0;
                                                 const totalRevenue = amountToSell * selectedStock.price;
                                                 
                                                 return (
                                                     <>
                                                        <div className="text-sm text-gray-400 mb-2">
                                                            {t.finanzen.portfolio.quantity}: <span className="text-white font-bold">{sharesOwned.toLocaleString(locale, {maximumFractionDigits: 0})}</span>
                                                        </div>
                                                        <div>
                                                            <input 
                                                                type="range" min="0" max={sharesOwned} step="1" value={amountToSell}
                                                                onChange={(e) => handleSellAmountChange(selectedStock.ticker, e.target.value)}
                                                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500 mb-2"
                                                                disabled={sharesOwned <= 0}
                                                            />
                                                            <input
                                                                type="number" value={Math.round(amountToSell)} onChange={(e) => handleSellAmountChange(selectedStock.ticker, e.target.value)}
                                                                className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-white text-right"
                                                                min="0" max={Math.floor(sharesOwned)}
                                                                disabled={sharesOwned <= 0}
                                                            />
                                                        </div>
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="text-gray-400">{t.finanzen.portfolio.revenue}</span>
                                                            <span className="font-bold text-white font-mono">{formatCurrency(totalRevenue)}</span>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleSellStock(selectedStock.ticker)} 
                                                            disabled={amountToSell <= 0} 
                                                            className="w-full bg-red-600 text-white font-bold py-2 rounded uppercase hover:bg-red-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            {t.finanzen.portfolio.sell}
                                                        </button>
                                                     </>
                                                 );
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-6 text-center">
                                <button 
                                    onClick={() => setSelectedStockTicker(null)} 
                                    className="text-gray-400 hover:text-white underline text-sm"
                                >
                                    {t.common.close}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FinanzenScreen;
