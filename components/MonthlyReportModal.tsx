










import React, { useMemo } from 'react';
import { Transaction } from '../types';
import MoneyBagIcon from './icons/MoneyBagIcon';
import CalculatorIcon from './icons/CalculatorIcon';
import UebersichtIcon from './icons/UebersichtIcon';
import { useTranslation } from '../hooks/useTranslation';

interface MonthlyReportModalProps {
  reportData: {
    transactions: Transaction[];
    month: number;
    year: number;
  };
  onClose: () => void;
}

const StatCard: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="flex items-center gap-4 bg-gray-900 p-4 rounded-lg">
        <div className="text-amber-400">{icon}</div>
        <div>
            <p className="text-sm text-gray-400">{label}</p>
            <p className="text-xl font-bold">{value}</p>
        </div>
    </div>
);

const TransactionList: React.FC<{ title: string; transactions: Transaction[]; titleColor: string }> = ({ title, transactions, titleColor }) => {
    const { t, language } = useTranslation();
    const locale = language === 'de' ? 'de-DE' : 'en-US';

    const getTranslatedCategory = (category: Transaction['category']) => {
        return t.transactionCategories[category] || category;
    };

    const getTranslatedDescription = (transaction: Transaction): string => {
        if (transaction.descriptionKey && t.transactionDescriptions[transaction.descriptionKey]) {
            let desc = t.transactionDescriptions[transaction.descriptionKey];
            if (transaction.descriptionVars) {
                Object.keys(transaction.descriptionVars).forEach(key => {
                    const placeholder = new RegExp(`{${key}}`, 'g');
                    desc = desc.replace(placeholder, String(transaction.descriptionVars![key]));
                });
            }
            return desc;
        }
        return transaction.description;
    };


    const grouped = useMemo(() => {
        const acc: Record<string, Transaction[]> = {};

        transactions.forEach(t => {
            if (!acc[t.category]) {
                acc[t.category] = [];
            }
            acc[t.category].push(t);
        });
        
        return acc;
    }, [transactions]);

    const formatCurrency = (val: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(val);

    return (
        <div className="bg-gray-900/50 p-4 rounded-lg h-full">
            <h3 className={`text-2xl font-cinzel mb-4 text-center ${titleColor}`}>{title}</h3>
            <div className="space-y-4 text-sm max-h-96 overflow-y-auto pr-2">
                {Object.keys(grouped).length > 0 ? Object.keys(grouped).map((category) => {
                    const translatedCategory = getTranslatedCategory(category as Transaction['category']);
                    const categoryTransactions = grouped[category];
                    
                    // --- Aggregation Logic ---
                    let renderedItems: React.ReactNode[] = [];
                    
                    // 1. Aggregation für "Personal" (inkl. CEO)
                    if (category === 'Personal') {
                        const totalSalary = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
                        renderedItems.push(
                             <li key="personnel_agg" className="flex justify-between font-bold">
                                <span className="text-gray-300">{t.monthlyReport.personnelCostsTotal}</span>
                                <span className="font-mono whitespace-nowrap">{formatCurrency(totalSalary)}</span>
                            </li>
                        );
                    } 
                    // 2. Aggregation für "Filmproduktion" -> "Wöchentliche Fixkosten" (Pro Film)
                    else if (category === 'Filmproduktion') {
                         const fixedCostsMap: Record<string, number> = {};
                         const otherProductionItems: Transaction[] = [];
                         
                         categoryTransactions.forEach(item => {
                             // Check for weekly costs using key or description fallback
                             if (item.descriptionKey === 'weeklyProductionCosts' && item.descriptionVars?.filmTitle) {
                                 const title = item.descriptionVars.filmTitle as string;
                                 fixedCostsMap[title] = (fixedCostsMap[title] || 0) + item.amount;
                             } else if (item.description.startsWith('Wöchentliche Fixkosten') || item.description.startsWith('Weekly fixed costs')) {
                                 // Fallback for old logs or missing keys
                                 const titleMatch = item.description.match(/"([^"]+)"/);
                                 const title = titleMatch ? titleMatch[1] : (language === 'de' ? 'Unbekannt' : 'Unknown');
                                 fixedCostsMap[title] = (fixedCostsMap[title] || 0) + item.amount;
                             } else {
                                 otherProductionItems.push(item);
                             }
                         });

                         // Add Aggregated Fixed Costs
                         Object.entries(fixedCostsMap).forEach(([filmTitle, amount]) => {
                             const fixedCostsText = t.transactionDescriptions.weeklyProductionCosts.replace('{filmTitle}', filmTitle);
                             renderedItems.push(
                                <li key={`weekly_${filmTitle}`} className="flex justify-between font-semibold">
                                    <span className="text-gray-300 truncate pr-2">{fixedCostsText}</span>
                                    <span className="font-mono whitespace-nowrap">{formatCurrency(amount)}</span>
                                </li>
                             );
                         });
                         
                         // Add remaining items individually
                         otherProductionItems.forEach((item, index) => {
                             renderedItems.push(
                                <li key={`prod_${index}`} className="flex justify-between">
                                    <span className="text-gray-300 truncate pr-2">{getTranslatedDescription(item)}</span>
                                    <span className="font-mono whitespace-nowrap">{formatCurrency(item.amount)}</span>
                                </li>
                             );
                         });

                    }
                    // 3. Aggregation für "Studiogelände" (Nur Kosten/Ausgaben)
                    else if (category === 'Studiogelände') {
                        // Prüfen, ob es sich um Ausgaben handelt (anhand des ersten Elements, da Gruppen sortenrein sein sollten in diesem Kontext)
                        // Sicherheitshalber filtern wir.
                        const isExpense = categoryTransactions[0].type === 'Ausgabe';
                        
                        if (isExpense) {
                            const totalAmount = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
                            renderedItems.push(
                                <li key="studio_agg" className="flex justify-between font-bold">
                                    <span className="text-gray-300">{t.monthlyReport.studioCostsTotal}</span>
                                    <span className="font-mono whitespace-nowrap">{formatCurrency(totalAmount)}</span>
                                </li>
                            );
                        } else {
                            // Einnahmen (z.B. Kino) bleiben detailliert, da hier die Quelle interessant ist
                             renderedItems = categoryTransactions.map((item, index) => (
                                <li key={index} className="flex justify-between">
                                    <span className="text-gray-300 truncate pr-2">{getTranslatedDescription(item)}</span>
                                    <span className="font-mono whitespace-nowrap">{formatCurrency(item.amount)}</span>
                                </li>
                            ));
                        }
                    }
                    // 4. Aggregation für "Filmverleih" (Kino-Umsatzbeteiligung)
                    else if (category === 'Filmverleih') {
                        const revenueShareMap: Record<string, number> = {};
                        const otherDistributionItems: Transaction[] = [];

                        categoryTransactions.forEach(item => {
                            // Check for cinema revenue key (old format or new format check)
                            // NEW CHECK: Look for "Umsatzbeteiligung (Kino)" string start
                            if (item.description.startsWith('Umsatzbeteiligung (Kino)') || item.description.startsWith('Cinema revenue share') || item.descriptionKey === 'cinemaRevenue') {
                                // Extract Title
                                let title = language === 'de' ? 'Unbekannt' : 'Unknown';
                                if (item.descriptionVars?.filmTitle) {
                                    title = item.descriptionVars.filmTitle as string;
                                } else {
                                     // Fallback parse from description string: Umsatzbeteiligung (Kino): "TITEL"
                                     const titleMatch = item.description.match(/: "([^"]+)"/);
                                     if (titleMatch) title = titleMatch[1];
                                }
                                revenueShareMap[title] = (revenueShareMap[title] || 0) + item.amount;
                            } else {
                                otherDistributionItems.push(item);
                            }
                        });

                        // Add Aggregated Revenue Shares (Using the new requested text format)
                        Object.entries(revenueShareMap).forEach(([filmTitle, amount]) => {
                            const revenueText = t.transactionDescriptions.cinemaRevenue.replace('{filmTitle}', filmTitle);
                            renderedItems.push(
                            <li key={`rev_${filmTitle}`} className="flex justify-between font-semibold">
                                <span className="text-gray-300 truncate pr-2">{revenueText}</span>
                                <span className="font-mono whitespace-nowrap text-green-400">+{formatCurrency(amount)}</span>
                            </li>
                            );
                        });

                        // Add remaining items
                        otherDistributionItems.forEach((item, index) => {
                            renderedItems.push(
                            <li key={`dist_${index}`} className="flex justify-between">
                                <span className="text-gray-300 truncate pr-2">{getTranslatedDescription(item)}</span>
                                <span className="font-mono whitespace-nowrap text-green-400">+{formatCurrency(item.amount)}</span>
                            </li>
                            );
                        });
                    }
                    // 5. Standard-Anzeige für alle anderen Kategorien
                    else {
                        renderedItems = categoryTransactions.map((item, index) => (
                            <li key={index} className="flex justify-between">
                                <span className="text-gray-300 truncate pr-2">{getTranslatedDescription(item)}</span>
                                <span className="font-mono whitespace-nowrap">{formatCurrency(item.amount)}</span>
                            </li>
                        ));
                    }


                    return (
                        <div key={category}>
                            <h4 className="font-bold text-amber-300 border-b border-gray-700 pb-1 mb-1">{translatedCategory}</h4>
                            <ul className="space-y-1">
                                {renderedItems}
                            </ul>
                        </div>
                    );
                }) : <p className="text-gray-500 text-center italic mt-8">{t.monthlyReport.noEntries}</p>}
            </div>
        </div>
    );
};


const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({ reportData, onClose }) => {
  const { t, language } = useTranslation();
  const locale = language === 'de' ? 'de-DE' : 'en-US';
  const { transactions, month, year } = reportData;

  const reportTitle = t.monthlyReport.title.replace('{month}', t.monthlyReport.months[month]).replace('{year}', year.toString());

  const { income, expenses, totalIncome, totalExpenses, netProfit } = useMemo(() => {
    const incomeList = transactions.filter(t => t.type === 'Einnahme');
    const expenseList = transactions.filter(t => t.type === 'Ausgabe');
    
    // Calculate totals excluding loan principle transfers if marked (though usually handled in finance loop)
    // Here we just sum up everything passed to the report
    const totalIncomeValue = transactions.filter(t => t.type === 'Einnahme').reduce((sum, t) => sum + t.amount, 0);
    const totalExpensesValue = transactions.filter(t => t.type === 'Ausgabe').reduce((sum, t) => sum + t.amount, 0);
    const netProfitValue = totalIncomeValue - totalExpensesValue;
    
    return { income: incomeList, expenses: expenseList, totalIncome: totalIncomeValue, totalExpenses: totalExpensesValue, netProfit: netProfitValue };
  }, [transactions]);

  const formatCurrency = (val: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-6xl p-6 text-white animate-fade-in">
        <h2 className="text-4xl font-bold font-cinzel text-amber-400 mb-6 text-center">{reportTitle}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard label={t.monthlyReport.totalIncome} value={formatCurrency(totalIncome)} icon={<MoneyBagIcon className="h-8 w-8 text-green-400" />} />
            <StatCard label={t.monthlyReport.totalExpenses} value={formatCurrency(totalExpenses)} icon={<CalculatorIcon className="h-8 w-8 text-red-400" />} />
            <StatCard label={t.monthlyReport.netResult} value={formatCurrency(netProfit)} icon={<UebersichtIcon className={`h-8 w-8 ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`} />} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <TransactionList title={t.monthlyReport.income} transactions={income} titleColor="text-green-400" />
            <TransactionList title={t.monthlyReport.expenses} transactions={expenses} titleColor="text-red-400" />
        </div>
        
        <div className="text-center">
          <button
            onClick={onClose}
            className="bg-amber-500 text-gray-900 font-bold py-2 px-12 rounded-sm uppercase tracking-wider hover:bg-amber-400 transition-all"
          >
            {t.common.close}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReportModal;
