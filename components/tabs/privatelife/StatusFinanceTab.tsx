
import React, { useState, useMemo } from 'react';
import { useGame } from '../../../contexts/GameContext';
import { MaritalStatus, Stock } from '../../../types';
import { ALL_PROPERTIES, SCHOOL_TYPES, SECONDARY_SCHOOL_TYPES, UNIVERSITY_TYPES } from '../../privateLifeData';
import { useTranslation } from '../../../hooks/useTranslation';

type PrivateFinanceSubTab = 'finance' | 'stock_market' | 'portfolio';
type TimeRange = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';

const TabButton: React.FC<{ title: string, isActive: boolean, onClick: () => void }> = ({ title, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`py-2 px-6 font-bold text-base transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-amber-500/50 relative top-px
            ${isActive 
                ? 'bg-gray-800/80 text-amber-400 border-gray-700 border-t border-x rounded-t-lg' 
                : 'bg-gray-900/50 text-gray-300 hover:text-amber-400 hover:bg-gray-800/50 border-b border-gray-700'
            }`}
    >
        {title}
    </button>
);

// Helper component for mini sparkline chart (Replicated here for self-containment)
const StockSparkline: React.FC<{ data: number[]; color: string; height?: number; noDataText: string }> = ({ data, color, height = 40, noDataText }) => {
    if (!data || data.length < 2) return <div className={`h-[${height}px] w-full bg-gray-900/30 rounded flex items-center justify-center text-xs text-gray-500`}>{noDataText}</div>;

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

export const StatusFinanceTab: React.FC = () => {
    const { playerData, setPlayerData } = useGame();
    const { t, language } = useTranslation();
    const locale = language === 'de' ? 'de-DE' : 'en-US';
    
    const [subTab, setSubTab] = useState<PrivateFinanceSubTab>('finance');
    const [timeRange, setTimeRange] = useState<TimeRange>('1Y');
    const [selectedStockTicker, setSelectedStockTicker] = useState<string | null>(null);
    const [buyAmounts, setBuyAmounts] = useState<Record<string, number>>({});
    const [sellAmounts, setSellAmounts] = useState<Record<string, number>>({});
    
    // Donation State
    const [donationAmount, setDonationAmount] = useState(0);
    const [showDonationConfirm, setShowDonationConfirm] = useState(false);

    if (!playerData) return null;

    const formatCurrency = (value: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

    const isTestMode = playerData.playerName === 'Max Mustermann' && playerData.studioName === 'Teststudio';

    // Stock Market Helpers
    const getVisibleHistory = (history: number[]) => {
        if (!history || history.length === 0) return [];
        switch(timeRange) {
             case '1Y': return history.slice(-52);
             case '6M': return history.slice(-26);
             case '3M': return history.slice(-13);
             case '1M': return history.slice(-4);
             case '1W': return history.slice(-2);
             case '1D': return history.slice(-2);
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
        if (!startPrice) return 0;
        return ((currentPrice - startPrice) / startPrice) * 100;
    };

    const handleBuyAmountChange = (ticker: string, value: string) => {
        const stock = playerData.stocks.find(s => s.ticker === ticker);
        if (!stock) return;
        const maxCanBuy = isTestMode ? 10000 : Math.floor(playerData.privateCapital / stock.price);
        let numValue = parseInt(value, 10);
        if (isNaN(numValue) || numValue < 0) numValue = 0;
        if (numValue > maxCanBuy) numValue = maxCanBuy;
        setBuyAmounts(p => ({ ...p, [ticker]: numValue }));
    };

    const handleBuyStock = (ticker: string) => {
        const stock = playerData.stocks.find(s => s.ticker === ticker);
        const amount = buyAmounts[ticker] || 0;
        if (!stock || amount <= 0) return;
        const cost = stock.price * amount;
        if (playerData.privateCapital < cost && !isTestMode) return;

        setPlayerData(prev => {
            if (!prev) return null;
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

    const handleSellAmountChange = (ticker: string, value: string) => {
        const sharesOwned = playerData.privatePortfolio[ticker]?.shares || 0;
        let numValue = parseInt(value, 10);
        if (isNaN(numValue) || numValue < 0) numValue = 0;
        if (numValue > sharesOwned) numValue = Math.floor(sharesOwned);
        setSellAmounts(p => ({ ...p, [ticker]: numValue }));
    };

    const handleSellStock = (ticker: string) => {
        const stock = playerData.stocks.find(s => s.ticker === ticker);
        const amount = sellAmounts[ticker] || 0;
        const sharesOwned = playerData.privatePortfolio[ticker]?.shares || 0;
        if (!stock || sharesOwned < amount || amount <= 0) return;
        
        const revenue = stock.price * amount;

        setPlayerData(prev => {
            if (!prev) return null;
            const oldPortfolioData = prev.privatePortfolio[ticker];
            const avgPrice = oldPortfolioData.shares > 0 ? oldPortfolioData.totalCost / oldPortfolioData.shares : 0;
            const costOfSoldShares = avgPrice * amount;
            const newShares = oldPortfolioData.shares - amount;
            
            const newPortfolio = { ...prev.privatePortfolio };
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
                privateCapital: prev.privateCapital + revenue,
                privatePortfolio: newPortfolio
            };
        });
        setSellAmounts(prev => ({ ...prev, [ticker]: 0 }));
    };

    const selectedStock = useMemo(() => {
        if (!selectedStockTicker) return null;
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
             } else {
                 const employee = playerData.employees.find(e => e.name === playerData.partnerName);
                 if (employee) partnerContribution = employee.salary;
             }
        } else if (playerData.partnerSalary) {
            partnerContribution = playerData.partnerSalary;
        }
    }

    // Real Estate Calculation
    let realEstateIncome = 0;
    let realEstateExpenses = 0;

    // Income from rented properties
    playerData.rentedProperties.forEach(id => {
        const p = ALL_PROPERTIES.find(prop => prop.id === id);
        if (p) realEstateIncome += (p.rentalIncome || 0);
    });

    // Expenses (Upkeep of owned + Rent of current if not owned)
    playerData.ownedProperties.forEach(id => {
        const p = ALL_PROPERTIES.find(prop => prop.id === id);
        if (p) realEstateExpenses += p.monthlyCost;
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
             if (school && school.monthlyCost > 0) educationExpenses += school.monthlyCost;
        }
    });

    // Updated Household Income Formula (subtracting education expenses)
    const householdIncome = playerData.ceoSalary + partnerContribution + realEstateIncome - realEstateExpenses - educationExpenses;

    const handleDonationSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value);
        if (val > playerData.privateCapital) {
            setDonationAmount(playerData.privateCapital);
        } else {
            setDonationAmount(val);
        }
    };

    const confirmDonation = () => {
        if (donationAmount <= 0) return;
        
        setPlayerData(prev => {
            if (!prev) return null;
            if (prev.privateCapital < donationAmount) return prev; // Safety check

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
            }
        });
        setDonationAmount(0);
        setShowDonationConfirm(false);
    };

    return (
        <div className="w-full h-full flex flex-col bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden">
             <div className="p-4 border-b border-gray-700 bg-gray-800/60 flex items-center justify-between">
                <h2 className="text-2xl font-bold font-cinzel text-amber-400">{t.privatelife.screen.nav.status}</h2>
                <div className="text-sm text-gray-400">{t.privatelife.status.privateCapital}: <span className="font-bold text-white ml-2">{formatCurrency(playerData.privateCapital)}</span></div>
            </div>

            <div className="flex-shrink-0 px-6 pt-4 border-b border-gray-700 bg-gray-800/30">
                <TabButton title={t.privatelife.status.tabs.finance} isActive={subTab === 'finance'} onClick={() => setSubTab('finance')} />
                <TabButton title={t.privatelife.status.tabs.stockMarket} isActive={subTab === 'stock_market'} onClick={() => setSubTab('stock_market')} />
                <TabButton title={t.privatelife.status.tabs.portfolio} isActive={subTab === 'portfolio'} onClick={() => setSubTab('portfolio')} />
            </div>

            <div className="flex-grow p-6 overflow-y-auto">
                
                {/* FINANCE SUB-TAB */}
                {subTab === 'finance' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="text-left bg-gray-800/60 p-4 rounded-lg border border-gray-700">
                                <p className="text-sm text-amber-400 uppercase tracking-wider mb-2">{t.privatelife.status.householdIncome}</p>
                                <div className="space-y-2 mb-4">
                                     <div className="flex justify-between">
                                         <span className="text-gray-400">{t.privatelife.status.yourSalary}:</span>
                                         <span className="text-white font-bold">{formatCurrency(playerData.ceoSalary)}</span>
                                     </div>
                                     {partnerContribution > 0 && (
                                         <div className="flex justify-between">
                                             <span className="text-gray-400">{t.privatelife.status.partner} ({playerData.partnerJob || (playerData.partnerIsEmployed ? playerData.partnerEmployedAs : t.privatelife.status.unemployed)}):</span>
                                             <span className="text-white font-bold">{formatCurrency(partnerContribution)}</span>
                                         </div>
                                     )}
                                     {realEstateIncome > 0 && (
                                         <div className="flex justify-between">
                                             <span className="text-gray-400">{t.privatelife.status.realEstateIncome}:</span>
                                             <span className="text-green-400 font-bold">+{formatCurrency(realEstateIncome)}</span>
                                         </div>
                                     )}
                                     {realEstateExpenses > 0 && (
                                         <div className="flex justify-between">
                                             <span className="text-gray-400">{t.privatelife.status.realEstateCost}:</span>
                                             <span className="text-red-400 font-bold">-{formatCurrency(realEstateExpenses)}</span>
                                         </div>
                                     )}
                                     {educationExpenses > 0 && (
                                         <div className="flex justify-between">
                                             <span className="text-gray-400">{t.privatelife.status.educationCosts}:</span>
                                             <span className="text-red-400 font-bold">-{formatCurrency(educationExpenses)}</span>
                                         </div>
                                     )}
                                     <div className="border-t border-gray-600 pt-2 flex justify-between">
                                         <span className="text-white font-bold">{t.privatelife.status.totalNet}:</span>
                                         <span className={`${householdIncome >= 0 ? 'text-green-400' : 'text-red-400'} font-bold text-xl`}>{formatCurrency(householdIncome)}</span>
                                     </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">{t.privatelife.status.salaryDesc}</p>
                            </div>
                            
                            <div className="text-left bg-gray-800/60 p-4 rounded-lg border border-gray-700 flex flex-col justify-between">
                                <div>
                                    <p className="text-sm text-amber-400 uppercase tracking-wider mb-2">{t.privatelife.status.privateCapital}</p>
                                    <p className="text-3xl font-bold text-white">{formatCurrency(playerData.privateCapital)}</p>
                                    <p className="text-xs text-gray-500 mt-2">{t.privatelife.status.privateCapitalDesc}</p>
                                </div>
                                
                                {/* DONATION SECTION */}
                                <div className="mt-6 pt-4 border-t border-gray-600">
                                    <p className="text-sm text-amber-400 uppercase tracking-wider mb-2 font-bold">{t.privatelife.status.donateToStudio}</p>
                                    <p className="text-xs text-gray-400 mb-3">{t.privatelife.status.donateToStudioDesc}</p>
                                    
                                    <div className="flex items-center gap-4 mb-2">
                                        <input 
                                            type="range" 
                                            min="0" 
                                            max={playerData.privateCapital} 
                                            step={100}
                                            value={donationAmount} 
                                            onChange={handleDonationSliderChange} 
                                            className="flex-grow h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                                            disabled={playerData.privateCapital <= 0}
                                        />
                                        <div className="w-24 text-right font-mono font-bold text-white">
                                            {formatCurrency(donationAmount)}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setShowDonationConfirm(true)}
                                        disabled={donationAmount <= 0}
                                        className="w-full bg-green-700 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-2 rounded uppercase text-xs transition-colors"
                                    >
                                        {t.privatelife.status.donateAction}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Bonus History */}
                        <div className="bg-gray-800/60 p-6 rounded-lg border border-gray-700">
                             <h3 className="text-lg font-bold text-white mb-4">{t.privatelife.status.bonusHistory}</h3>
                             {playerData.ceoBonusHistory && playerData.ceoBonusHistory.length > 0 ? (
                                <table className="w-full text-left text-sm">
                                    <thead className="text-gray-400 uppercase border-b border-gray-600">
                                        <tr>
                                            <th className="py-2">{t.privatelife.status.year}</th>
                                            <th className="py-2 text-right">{t.privatelife.status.amount}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-300">
                                        {[...playerData.ceoBonusHistory].reverse().map((entry, index) => (
                                            <tr key={index} className="border-b border-gray-700/50">
                                                <td className="py-2">{entry.year}</td>
                                                <td className="py-2 text-right font-mono text-green-400">+{formatCurrency(entry.amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             ) : (
                                 <p className="text-gray-500 italic text-center py-4">{t.privatelife.status.noBonuses}</p>
                             )}
                        </div>
                    </div>
                )}

                {/* STOCK MARKET SUB-TAB */}
                {subTab === 'stock_market' && (
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

                {/* PORTFOLIO SUB-TAB */}
                {subTab === 'portfolio' && (
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
                                        
                                        const portfolioData = playerData.privatePortfolio[ticker];
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
            </div>
            
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

                            {/* Right Column: Trading Controls or Performance */}
                            <div className="flex flex-col gap-6">
                                {subTab === 'portfolio' ? (
                                    /* Performance View for Portfolio */
                                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 flex-1">
                                         <h3 className="text-lg font-bold text-amber-400 mb-4 border-b border-gray-700 pb-2">Performance</h3>
                                         {(() => {
                                             const portfolioEntry = playerData.privatePortfolio[selectedStock.ticker];
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
                                    /* Buy Section for Market */
                                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 flex-1">
                                        <h3 className="text-lg font-bold text-green-400 mb-2 border-b border-gray-700 pb-1">{t.finanzen.stockMarket.buy}</h3>
                                        <div className="space-y-4">
                                            {(() => {
                                                    const amountToBuy = buyAmounts[selectedStock.ticker] || 0;
                                                    const maxCanBuy = isTestMode ? 10000 : Math.floor(playerData.privateCapital / selectedStock.price);
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
                                                            disabled={amountToBuy <= 0 || (playerData.privateCapital < totalCost && !isTestMode)} 
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
                                
                                {/* Sell Section (Always visible if owned, managed by logic inside) */}
                                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 flex-1">
                                    <h3 className="text-lg font-bold text-red-400 mb-2 border-b border-gray-700 pb-1">{t.finanzen.portfolio.sell}</h3>
                                    <div className="space-y-4">
                                        {(() => {
                                                const sharesOwned = playerData.privatePortfolio[selectedStock.ticker]?.shares || 0;
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
            
            {/* Donation Confirmation Modal */}
            {showDonationConfirm && (
                <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 border border-green-500 rounded-lg p-6 max-w-sm w-full text-center">
                        <h3 className="text-xl font-bold text-green-400 mb-4">{t.privatelife.status.donateConfirmTitle}</h3>
                        <p className="text-gray-300 mb-4">
                            {t.privatelife.status.donateConfirmText.replace('{amount}', formatCurrency(donationAmount))}
                        </p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setShowDonationConfirm(false)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded">{t.common.cancel}</button>
                            <button onClick={confirmDonation} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded">{t.common.confirm}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
