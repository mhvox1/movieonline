import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import MoneyBagIcon from './icons/MoneyBagIcon';
import CalculatorIcon from './icons/CalculatorIcon';
import UebersichtIcon from './icons/UebersichtIcon';
import { useTranslation } from '../hooks/useTranslation';
const StatCard = ({ label, value, icon }) => (_jsxs("div", { className: "flex items-center gap-4 bg-gray-900 p-4 rounded-lg", children: [_jsx("div", { className: "text-amber-400", children: icon }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-400", children: label }), _jsx("p", { className: "text-xl font-bold", children: value })] })] }));
const TransactionList = ({ title, transactions, titleColor }) => {
    const { t, language } = useTranslation();
    const locale = language === 'de' ? 'de-DE' : 'en-US';
    const getTranslatedCategory = (category) => {
        return t.transactionCategories[category] || category;
    };
    const getTranslatedDescription = (transaction) => {
        if (transaction.descriptionKey && t.transactionDescriptions[transaction.descriptionKey]) {
            let desc = t.transactionDescriptions[transaction.descriptionKey];
            if (transaction.descriptionVars) {
                Object.keys(transaction.descriptionVars).forEach(key => {
                    const placeholder = new RegExp(`{${key}}`, 'g');
                    desc = desc.replace(placeholder, String(transaction.descriptionVars[key]));
                });
            }
            return desc;
        }
        return transaction.description;
    };
    const grouped = useMemo(() => {
        const acc = {};
        transactions.forEach(t => {
            if (!acc[t.category]) {
                acc[t.category] = [];
            }
            acc[t.category].push(t);
        });
        return acc;
    }, [transactions]);
    const formatCurrency = (val) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(val);
    return (_jsxs("div", { className: "bg-gray-900/50 p-4 rounded-lg h-full", children: [_jsx("h3", { className: `text-2xl font-cinzel mb-4 text-center ${titleColor}`, children: title }), _jsx("div", { className: "space-y-4 text-sm max-h-96 overflow-y-auto pr-2", children: Object.keys(grouped).length > 0 ? Object.keys(grouped).map((category) => {
                    const translatedCategory = getTranslatedCategory(category);
                    const categoryTransactions = grouped[category];
                    // --- Aggregation Logic ---
                    let renderedItems = [];
                    // 1. Aggregation für "Personal" (inkl. CEO)
                    if (category === 'Personal') {
                        const totalSalary = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
                        renderedItems.push(_jsxs("li", { className: "flex justify-between font-bold", children: [_jsx("span", { className: "text-gray-300", children: t.monthlyReport.personnelCostsTotal }), _jsx("span", { className: "font-mono whitespace-nowrap", children: formatCurrency(totalSalary) })] }, "personnel_agg"));
                    }
                    // 2. Aggregation für "Filmproduktion" -> "Wöchentliche Fixkosten" (Pro Film)
                    else if (category === 'Filmproduktion') {
                        const fixedCostsMap = {};
                        const otherProductionItems = [];
                        categoryTransactions.forEach(item => {
                            // Check for weekly costs using key or description fallback
                            if (item.descriptionKey === 'weeklyProductionCosts' && item.descriptionVars?.filmTitle) {
                                const title = item.descriptionVars.filmTitle;
                                fixedCostsMap[title] = (fixedCostsMap[title] || 0) + item.amount;
                            }
                            else if (item.description.startsWith('Wöchentliche Fixkosten') || item.description.startsWith('Weekly fixed costs')) {
                                // Fallback for old logs or missing keys
                                const titleMatch = item.description.match(/"([^"]+)"/);
                                const title = titleMatch ? titleMatch[1] : (language === 'de' ? 'Unbekannt' : 'Unknown');
                                fixedCostsMap[title] = (fixedCostsMap[title] || 0) + item.amount;
                            }
                            else {
                                otherProductionItems.push(item);
                            }
                        });
                        // Add Aggregated Fixed Costs
                        Object.entries(fixedCostsMap).forEach(([filmTitle, amount]) => {
                            const fixedCostsText = t.transactionDescriptions.weeklyProductionCosts.replace('{filmTitle}', filmTitle);
                            renderedItems.push(_jsxs("li", { className: "flex justify-between font-semibold", children: [_jsx("span", { className: "text-gray-300 truncate pr-2", children: fixedCostsText }), _jsx("span", { className: "font-mono whitespace-nowrap", children: formatCurrency(amount) })] }, `weekly_${filmTitle}`));
                        });
                        // Add remaining items individually
                        otherProductionItems.forEach((item, index) => {
                            renderedItems.push(_jsxs("li", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-300 truncate pr-2", children: getTranslatedDescription(item) }), _jsx("span", { className: "font-mono whitespace-nowrap", children: formatCurrency(item.amount) })] }, `prod_${index}`));
                        });
                    }
                    // 3. Aggregation für "Studiogelände" (Nur Kosten/Ausgaben)
                    else if (category === 'Studiogelände') {
                        // Prüfen, ob es sich um Ausgaben handelt (anhand des ersten Elements, da Gruppen sortenrein sein sollten in diesem Kontext)
                        // Sicherheitshalber filtern wir.
                        const isExpense = categoryTransactions[0].type === 'Ausgabe';
                        if (isExpense) {
                            const totalAmount = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
                            renderedItems.push(_jsxs("li", { className: "flex justify-between font-bold", children: [_jsx("span", { className: "text-gray-300", children: t.monthlyReport.studioCostsTotal }), _jsx("span", { className: "font-mono whitespace-nowrap", children: formatCurrency(totalAmount) })] }, "studio_agg"));
                        }
                        else {
                            // Einnahmen (z.B. Kino) bleiben detailliert, da hier die Quelle interessant ist
                            renderedItems = categoryTransactions.map((item, index) => (_jsxs("li", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-300 truncate pr-2", children: getTranslatedDescription(item) }), _jsx("span", { className: "font-mono whitespace-nowrap", children: formatCurrency(item.amount) })] }, index)));
                        }
                    }
                    // 4. Aggregation für "Filmverleih" (Kino-Umsatzbeteiligung)
                    else if (category === 'Filmverleih') {
                        const revenueShareMap = {};
                        const otherDistributionItems = [];
                        categoryTransactions.forEach(item => {
                            // Check for cinema revenue key (old format or new format check)
                            // NEW CHECK: Look for "Umsatzbeteiligung (Kino)" string start
                            if (item.description.startsWith('Umsatzbeteiligung (Kino)') || item.description.startsWith('Cinema revenue share') || item.descriptionKey === 'cinemaRevenue') {
                                // Extract Title
                                let title = language === 'de' ? 'Unbekannt' : 'Unknown';
                                if (item.descriptionVars?.filmTitle) {
                                    title = item.descriptionVars.filmTitle;
                                }
                                else {
                                    // Fallback parse from description string: Umsatzbeteiligung (Kino): "TITEL"
                                    const titleMatch = item.description.match(/: "([^"]+)"/);
                                    if (titleMatch)
                                        title = titleMatch[1];
                                }
                                revenueShareMap[title] = (revenueShareMap[title] || 0) + item.amount;
                            }
                            else {
                                otherDistributionItems.push(item);
                            }
                        });
                        // Add Aggregated Revenue Shares (Using the new requested text format)
                        Object.entries(revenueShareMap).forEach(([filmTitle, amount]) => {
                            const revenueText = t.transactionDescriptions.cinemaRevenue.replace('{filmTitle}', filmTitle);
                            renderedItems.push(_jsxs("li", { className: "flex justify-between font-semibold", children: [_jsx("span", { className: "text-gray-300 truncate pr-2", children: revenueText }), _jsxs("span", { className: "font-mono whitespace-nowrap text-green-400", children: ["+", formatCurrency(amount)] })] }, `rev_${filmTitle}`));
                        });
                        // Add remaining items
                        otherDistributionItems.forEach((item, index) => {
                            renderedItems.push(_jsxs("li", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-300 truncate pr-2", children: getTranslatedDescription(item) }), _jsxs("span", { className: "font-mono whitespace-nowrap text-green-400", children: ["+", formatCurrency(item.amount)] })] }, `dist_${index}`));
                        });
                    }
                    // 5. Standard-Anzeige für alle anderen Kategorien
                    else {
                        renderedItems = categoryTransactions.map((item, index) => (_jsxs("li", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-300 truncate pr-2", children: getTranslatedDescription(item) }), _jsx("span", { className: "font-mono whitespace-nowrap", children: formatCurrency(item.amount) })] }, index)));
                    }
                    return (_jsxs("div", { children: [_jsx("h4", { className: "font-bold text-amber-300 border-b border-gray-700 pb-1 mb-1", children: translatedCategory }), _jsx("ul", { className: "space-y-1", children: renderedItems })] }, category));
                }) : _jsx("p", { className: "text-gray-500 text-center italic mt-8", children: t.monthlyReport.noEntries }) })] }));
};
const MonthlyReportModal = ({ reportData, onClose }) => {
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
    const formatCurrency = (val) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(val);
    return (_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4", "aria-modal": "true", role: "dialog", children: _jsxs("div", { className: "bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-6xl p-6 text-white animate-fade-in", children: [_jsx("h2", { className: "text-4xl font-bold font-cinzel text-amber-400 mb-6 text-center", children: reportTitle }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6", children: [_jsx(StatCard, { label: t.monthlyReport.totalIncome, value: formatCurrency(totalIncome), icon: _jsx(MoneyBagIcon, { className: "h-8 w-8 text-green-400" }) }), _jsx(StatCard, { label: t.monthlyReport.totalExpenses, value: formatCurrency(totalExpenses), icon: _jsx(CalculatorIcon, { className: "h-8 w-8 text-red-400" }) }), _jsx(StatCard, { label: t.monthlyReport.netResult, value: formatCurrency(netProfit), icon: _jsx(UebersichtIcon, { className: `h-8 w-8 ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}` }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-6", children: [_jsx(TransactionList, { title: t.monthlyReport.income, transactions: income, titleColor: "text-green-400" }), _jsx(TransactionList, { title: t.monthlyReport.expenses, transactions: expenses, titleColor: "text-red-400" })] }), _jsx("div", { className: "text-center", children: _jsx("button", { onClick: onClose, className: "bg-amber-500 text-gray-900 font-bold py-2 px-12 rounded-sm uppercase tracking-wider hover:bg-amber-400 transition-all", children: t.common.close }) })] }) }));
};
export default MonthlyReportModal;
