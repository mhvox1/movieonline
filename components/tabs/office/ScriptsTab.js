import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo, useEffect } from 'react';
import { Genre, EmployeeType, BuildingType, ProjectPhase } from '../../../types';
import StarRating from '../../StarRating';
import { useGame } from '../../../contexts/GameContext';
import ScriptDossierModal from '../../ScriptDossierModal';
import { useTranslation } from '../../../hooks/useTranslation';
import { getTranslatedScriptTitle, getTranslatedScriptDescription } from '../../scriptGenerator';
const TabButton = ({ title, isActive, onClick, disabled }) => (_jsx("button", { onClick: onClick, disabled: disabled, className: `py-3 px-6 font-bold text-base transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-amber-500/50 relative top-px
            ${isActive
        ? 'bg-gray-800/80 text-amber-400 border-gray-700 border-t border-x rounded-t-lg'
        : 'bg-gray-900/50 text-gray-300 hover:text-amber-400 hover:bg-gray-800/50 border-b border-gray-700'} ${disabled
        ? 'opacity-50 cursor-not-allowed'
        : ''}`, children: title }));
const ScriptsTab = () => {
    const { playerData, setPlayerData } = useGame();
    const { t, language } = useTranslation();
    const [scriptSubTab, setScriptSubTab] = useState('market');
    const [scriptTitle, setScriptTitle] = useState("");
    const [scriptGenre, setScriptGenre] = useState(Genre.Action);
    const [formError, setFormError] = useState('');
    const [scriptMarketGenreFilter, setScriptMarketGenreFilter] = useState('all');
    const [scriptToSell, setScriptToSell] = useState(null);
    const [selectedScriptForModal, setSelectedScriptForModal] = useState(null);
    if (!playerData)
        return null;
    const isTestMode = playerData.playerName === 'Max Mustermann' && playerData.studioName === 'Teststudio';
    const writers = useMemo(() => {
        if (!playerData)
            return [];
        const employeeWriters = playerData.employees.filter(e => e.type === EmployeeType.Autor);
        // Add Partner if applicable
        if (playerData.partnerIsEmployed && playerData.partnerEmployedAs === EmployeeType.Autor) {
            const partnerWriter = {
                id: 99901,
                name: `${playerData.partnerName} (${language === 'de' ? 'Partner' : 'Partner'})`,
                type: EmployeeType.Autor,
                talent: playerData.partnerSkills?.writing || 0,
                salary: 0,
                experience: 0,
                satisfaction: 100,
                portraitUrl: playerData.partnerPortraitId ? `./portrait/${playerData.partnerPortraitId}.png` : undefined
            };
            employeeWriters.push(partnerWriter);
        }
        // Add Children if applicable
        playerData.children.forEach((child, index) => {
            if (child.isEmployed && child.employedAs === EmployeeType.Autor) {
                employeeWriters.push({
                    id: 99910 + index,
                    name: `${child.name} (${language === 'de' ? 'Kind' : 'Child'})`,
                    type: EmployeeType.Autor,
                    talent: child.skills?.writing || 0,
                    salary: 0,
                    experience: 0,
                    satisfaction: 100,
                    portraitUrl: child.portraitId ? `./kinder/${child.portraitId}.png` : undefined
                });
            }
        });
        return employeeWriters;
    }, [playerData, language]);
    const [selectedWriterId, setSelectedWriterId] = useState(writers[0]?.id || 0);
    const hasWritersBungalow = playerData.buildings.some(b => b.type === BuildingType.Autorenbuero && b.level > 0);
    useEffect(() => {
        if (writers.length > 0 && (selectedWriterId === 0 || !writers.some(w => w.id === selectedWriterId))) {
            setSelectedWriterId(writers[0].id);
        }
    }, [writers, selectedWriterId]);
    const formatCurrency = (value) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
    const getDaysRemaining = (endDate) => {
        return Math.max(0, Math.ceil((new Date(endDate).getTime() - new Date(playerData.gameDate).getTime()) / (1000 * 3600 * 24)));
    };
    const unlockedGenres = useMemo(() => Object.values(Genre), []);
    const filteredScriptMarket = useMemo(() => {
        let market = playerData.scriptMarket;
        if (scriptMarketGenreFilter === 'all') {
            return market;
        }
        return market.filter(script => script.genre === scriptMarketGenreFilter);
    }, [playerData.scriptMarket, scriptMarketGenreFilter]);
    const isPlayerBusy = useMemo(() => {
        if (!playerData)
            return false;
        // Is the player attending a course?
        if (playerData.activeCourse) {
            return true;
        }
        // Is the player scouting for talent?
        if (playerData.activeTalentScouting && playerData.activeTalentScouting.scoutId === -1) {
            return true;
        }
        // Is the player acting or directing in an *active* project?
        if (playerData.currentProject) {
            const proj = playerData.currentProject;
            const isPlayerInvolved = proj.directorId === -1 || proj.mainActorId === -1 || proj.supportingActorId === -1;
            const isActivePhase = proj.phase === ProjectPhase.Casting || proj.phase === ProjectPhase.Production;
            if (isPlayerInvolved && isActivePhase) {
                return true;
            }
        }
        return false;
    }, [playerData]);
    const handleBuyScript = (scriptToBuy) => {
        if (!scriptToBuy.price || (playerData.capital < scriptToBuy.price && !isTestMode)) {
            return;
        }
        setPlayerData(prev => {
            if (!prev)
                return null;
            const newMarket = prev.scriptMarket.filter(s => s.id !== scriptToBuy.id);
            const newOwnedScripts = [...prev.availableScripts, { ...scriptToBuy, price: scriptToBuy.price }];
            return {
                ...prev,
                capital: prev.capital - scriptToBuy.price,
                scriptMarket: newMarket,
                availableScripts: newOwnedScripts,
                transactionLog: [
                    ...prev.transactionLog,
                    {
                        date: new Date(prev.gameDate),
                        type: 'Ausgabe',
                        category: 'Filmproduktion',
                        description: language === 'de'
                            ? `Drehbuch gekauft: "${getTranslatedScriptTitle(scriptToBuy, t)}"`
                            : `Script purchased: "${getTranslatedScriptTitle(scriptToBuy, t)}"`,
                        descriptionKey: 'scriptBuy',
                        descriptionVars: { title: getTranslatedScriptTitle(scriptToBuy, t) },
                        amount: scriptToBuy.price,
                    }
                ]
            };
        });
        setSelectedScriptForModal(null);
    };
    const handleStartWriting = () => {
        setFormError('');
        if (!scriptTitle.trim()) {
            setFormError(language === 'de' ? 'Bitte Titel eingeben.' : 'Please enter a title.');
            return;
        }
        if (selectedWriterId === 0 && writers.length > 0) {
            setFormError(language === 'de' ? 'Bitte einen Autor auswählen.' : 'Please select a writer.');
            return;
        }
        if (writers.length === 0) {
            setFormError(language === 'de' ? 'Keine Autoren verfügbar.' : 'No writers available.');
            return;
        }
        const writer = writers.find(w => w.id === selectedWriterId);
        if (!writer) {
            setFormError(language === 'de' ? 'Ausgewählter Autor nicht gefunden.' : 'Selected writer not found.');
            return;
        }
        const settings = { cost: 25000, durationMod: 1.0 };
        if (playerData.capital < settings.cost && !isTestMode) {
            setFormError(language === 'de' ? 'Nicht genügend Kapital.' : 'Not enough capital.');
            return;
        }
        // CONCEPT IMPLEMENTATION: WRITING SPEED BASED ON TALENT
        // Calculate Effective Talent
        const effTalent = writer.talent * (writer.satisfaction / 100);
        // Speed Multiplier: 1 + (EffectiveTalent / 200) -> Max 1.5x speed boost
        const talentSpeedBoost = 1 + (effTalent / 200);
        const baseDuration = 40;
        const duration = Math.round(baseDuration * settings.durationMod / ((writer.speed || 1.0) * talentSpeedBoost));
        const startDate = new Date(playerData.gameDate);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + duration);
        const nextEventInDays = 7 + Math.floor(Math.random() * 8);
        const nextEventDate = new Date(startDate);
        nextEventDate.setDate(startDate.getDate() + nextEventInDays);
        const newWritingProject = {
            script: {
                id: `script_dev_${Date.now()}`,
                title: scriptTitle,
                genre: scriptGenre,
                quality: 0,
                description: language === 'de' ? 'In Entwicklung...' : 'In development...',
                baseQuality: 0,
                cost: settings.cost
            },
            writerId: selectedWriterId,
            startDate,
            endDate,
            qualityModifier: 0,
            eventLog: [],
            nextEventDate: nextEventDate,
        };
        setPlayerData(prev => ({
            ...prev,
            capital: prev.capital - settings.cost,
            activeWriting: newWritingProject,
            transactionLog: [
                ...prev.transactionLog,
                {
                    date: startDate,
                    type: 'Ausgabe',
                    category: 'Filmproduktion',
                    description: language === 'de'
                        ? `Drehbuch-Entwicklung: "${scriptTitle}"`
                        : `Script development: "${scriptTitle}"`,
                    descriptionKey: 'scriptDev',
                    descriptionVars: { title: scriptTitle },
                    amount: settings.cost
                }
            ]
        }));
        setScriptTitle("");
    };
    const handleSellScriptClick = (script) => {
        const basePrice = 5000 + (script.quality * script.quality * 25);
        const sellMultiplier = 0.25 + Math.random() * 0.30; // 25% to 55%
        const sellPrice = Math.round((basePrice * sellMultiplier) / 1000) * 1000; // Round to nearest 1000
        setScriptToSell({ script, price: sellPrice });
    };
    const confirmSellScript = () => {
        if (!scriptToSell)
            return;
        setPlayerData(prev => {
            if (!prev)
                return null;
            const newOwnedScripts = prev.availableScripts.filter(s => s.id !== scriptToSell.script.id);
            return {
                ...prev,
                capital: prev.capital + scriptToSell.price,
                availableScripts: newOwnedScripts,
                transactionLog: [
                    ...prev.transactionLog,
                    {
                        date: new Date(prev.gameDate),
                        type: 'Einnahme',
                        category: 'Filmproduktion',
                        description: language === 'de'
                            ? `Drehbuch verkauft: "${getTranslatedScriptTitle(scriptToSell.script, t)}"`
                            : `Script sold: "${getTranslatedScriptTitle(scriptToSell.script, t)}"`,
                        descriptionKey: 'scriptSell',
                        descriptionVars: { title: getTranslatedScriptTitle(scriptToSell.script, t) },
                        amount: scriptToSell.price,
                    }
                ]
            };
        });
        setScriptToSell(null);
    };
    const renderWriteTab = () => {
        if (playerData.activeWriting) {
            const { script, startDate, endDate, writerId } = playerData.activeWriting;
            // Lookup writer in enhanced list
            const writer = writers.find(w => w.id === writerId);
            const writerName = writer ? writer.name : (writerId === -1 ? `${playerData.playerName} (${language === 'de' ? 'Du' : 'You'})` : (language === 'de' ? 'Unbekannt' : 'Unknown'));
            const totalDuration = (new Date(endDate).getTime() - new Date(startDate).getTime());
            const elapsed = (new Date(playerData.gameDate).getTime() - new Date(startDate).getTime());
            const progress = totalDuration > 0 ? Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100))) : 100;
            const daysRemaining = getDaysRemaining(endDate);
            return (_jsxs("div", { className: "text-center space-y-3", children: [_jsxs("p", { className: "text-lg font-bold text-white", children: ["\"", script.title, "\""] }), _jsxs("p", { className: "text-gray-400", children: [language === 'de' ? 'Autor' : 'Writer', ": ", writerName] }), _jsxs("p", { className: "text-gray-400", children: [language === 'de' ? 'Verbleibende Zeit' : 'Remaining Time', ": ", daysRemaining, " ", language === 'de' ? 'Tage' : 'days'] }), _jsx("div", { className: "w-full bg-gray-700 rounded-full h-5 overflow-hidden border border-gray-600", children: _jsxs("div", { className: "bg-purple-500 h-full rounded-full flex items-center justify-center text-sm font-bold text-black", style: { width: `${progress}%` }, children: [progress, "%"] }) })] }));
        }
        if (!hasWritersBungalow) {
            return (_jsxs("div", { className: "text-center p-8 bg-gray-900/50 rounded-lg max-w-2xl mx-auto", children: [_jsx("h3", { className: "text-xl text-amber-300 font-bold", children: t.project.scripts.writersOfficeRequired }), _jsx("p", { className: "text-gray-400 mt-2", children: language === 'de' ? 'Um Drehbücher schreiben zu können, müssen Sie zuerst ein Autorenbüro auf Ihrem Studiogelände bauen.' : 'To write scripts, you must first build a writers office on your studio lot.' })] }));
        }
        if (writers.length === 0) {
            return (_jsxs("div", { className: "text-center p-8 bg-gray-900/50 rounded-lg max-w-2xl mx-auto", children: [_jsx("h3", { className: "text-xl text-amber-300 font-bold", children: t.project.scripts.noWriters }), _jsx("p", { className: "text-gray-400 mt-2", children: language === 'de' ? 'Sie haben ein Autorenbüro, aber keinen Autor angestellt.' : 'You have a writers office, but no writer is employed.' })] }));
        }
        const isPlayerSelectedAndBusy = selectedWriterId === -1 && isPlayerBusy;
        return (_jsxs("div", { className: "space-y-3 max-w-md mx-auto", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs text-gray-400", children: t.project.scripts.workTitle }), _jsx("input", { type: "text", value: scriptTitle, onChange: e => setScriptTitle(e.target.value), className: "w-full bg-gray-900 border border-gray-600 rounded-md p-1.5 text-sm" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs text-gray-400", children: t.project.scripts.genre }), _jsx("div", { className: "flex items-center gap-2", children: _jsx("select", { value: scriptGenre, onChange: e => setScriptGenre(e.target.value), className: "w-full bg-gray-900 border border-gray-600 rounded-md p-1.5 text-sm", children: unlockedGenres.map(g => _jsx("option", { value: g, children: t.genres[g] }, g)) }) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs text-gray-400", children: t.project.scripts.assignWriter }), _jsx("select", { value: selectedWriterId, onChange: e => setSelectedWriterId(Number(e.target.value)), className: "w-full bg-gray-900 border border-gray-600 rounded-md p-1.5 text-sm", disabled: writers.length === 0, children: writers.length > 0 ? writers.map(w => _jsxs("option", { value: w.id, children: [w.name, " (", language === 'de' ? 'Talent' : 'Talent', ": ", w.talent, ")"] }, w.id)) : _jsx("option", { children: language === 'de' ? 'Keine Autoren verfügbar' : 'No writers available' }) })] }), formError && _jsx("p", { className: "text-red-400 text-xs text-center", children: formError }), _jsx("div", { title: isPlayerSelectedAndBusy ? (language === 'de' ? 'Du bist bereits mit einer anderen Aufgabe beschäftigt.' : 'You are already busy with another task.') : '', children: _jsx("button", { onClick: handleStartWriting, disabled: writers.length === 0 || !!playerData.activeWriting || isPlayerSelectedAndBusy, className: "w-full mt-4 bg-purple-600 text-white font-bold py-2 rounded-sm uppercase hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed", children: t.project.scripts.startWriting }) })] }));
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "w-full h-full flex flex-col", children: [_jsxs("div", { className: "flex-shrink-0 flex items-end", children: [_jsx(TabButton, { title: t.project.scripts.buy, isActive: scriptSubTab === 'market', onClick: () => setScriptSubTab('market') }), _jsx(TabButton, { title: t.project.scripts.owned, isActive: scriptSubTab === 'owned', onClick: () => setScriptSubTab('owned') }), _jsx(TabButton, { title: t.project.scripts.write, isActive: scriptSubTab === 'write', onClick: () => setScriptSubTab('write') })] }), _jsxs("div", { className: "flex-grow bg-gray-800/80 p-4 rounded-b-lg rounded-tr-lg shadow-2xl border border-gray-700 border-t-0 overflow-y-auto", children: [scriptSubTab === 'owned' && (_jsx("div", { className: "space-y-3", children: playerData.availableScripts.length > 0 ? playerData.availableScripts.map(script => {
                                    const title = getTranslatedScriptTitle(script, t);
                                    return (_jsxs("div", { className: "bg-gray-800/80 p-3 rounded-lg border border-gray-700 flex justify-between items-center", children: [_jsxs("div", { className: "flex-grow", children: [_jsx("h4", { className: "font-bold text-white", children: title }), _jsxs("div", { className: "flex justify-between items-center text-sm text-gray-300", children: [_jsx("span", { className: "text-sm text-gray-300", children: t.genres[script.genre] }), _jsx(StarRating, { rating: script.quality })] })] }), _jsx("button", { onClick: () => handleSellScriptClick(script), className: "ml-4 bg-yellow-600 text-white font-bold py-2 px-4 rounded-sm text-xs uppercase hover:bg-yellow-500 transition-colors", children: t.project.scripts.sell })] }, script.id));
                                }) : _jsx("p", { className: "text-center text-gray-500 italic py-8", children: t.project.scripts.noOwned }) })), scriptSubTab === 'write' && (_jsxs("div", { className: " p-4 rounded-lg", children: [_jsx("h3", { className: "text-xl font-cinzel text-amber-400 mb-4 text-center", children: t.project.scripts.newScript }), renderWriteTab()] })), scriptSubTab === 'market' && (_jsxs("div", { children: [_jsxs("div", { className: "mb-6", children: [_jsxs("label", { htmlFor: "genre-filter", className: "block text-sm font-medium text-gray-300 mb-1 tracking-wider", children: [t.project.scripts.filterGenre, ":"] }), _jsxs("select", { id: "genre-filter", value: scriptMarketGenreFilter, onChange: (e) => setScriptMarketGenreFilter(e.target.value), className: "w-full max-w-xs bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-amber-500 outline-none transition", children: [_jsx("option", { value: "all", children: t.project.scripts.allGenres }), Object.values(Genre).map(g => _jsx("option", { value: g, children: t.genres[g] }, g))] })] }), _jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4", children: filteredScriptMarket.map(script => {
                                            const title = getTranslatedScriptTitle(script, t);
                                            const desc = getTranslatedScriptDescription(script, t);
                                            return (_jsxs("div", { className: "bg-gray-800/80 p-4 rounded-lg border border-gray-700 flex flex-col", children: [_jsx("h4", { className: "font-bold text-white text-lg", children: title }), _jsx("div", { className: "text-sm text-amber-300", children: t.genres[script.genre] }), _jsxs("p", { className: "text-xs text-gray-400 my-2 flex-grow italic", children: ["\"", desc, "\""] }), _jsxs("div", { className: "flex justify-between items-center mt-2 text-sm", children: [_jsx(StarRating, { rating: script.quality }), _jsx("span", { className: "font-bold text-amber-400 text-base", children: formatCurrency(script.price) })] }), _jsx("button", { onClick: () => setSelectedScriptForModal(script), className: "w-full mt-3 bg-amber-400 text-gray-900 font-bold py-2 rounded-sm text-sm uppercase hover:bg-amber-500 transition-colors", children: t.project.scripts.details })] }, script.id));
                                        }) })] }))] })] }), scriptToSell && (_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center", children: [_jsx("h2", { className: "text-3xl font-bold font-cinzel text-amber-400 mb-4", children: t.project.scripts.sellConfirmTitle }), _jsx("p", { className: "text-gray-300 text-lg mb-6", children: t.project.scripts.sellConfirmText.replace('{title}', getTranslatedScriptTitle(scriptToSell.script, t)).replace('{price}', formatCurrency(scriptToSell.price)) }), _jsxs("div", { className: "flex justify-center gap-4", children: [_jsx("button", { onClick: () => setScriptToSell(null), className: "bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all", children: t.common.cancel }), _jsx("button", { onClick: confirmSellScript, className: "bg-green-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-green-500 transition-all", children: t.common.confirm })] })] }) })), selectedScriptForModal && (_jsx(ScriptDossierModal, { script: selectedScriptForModal, onClose: () => setSelectedScriptForModal(null), onBuy: handleBuyScript, playerCapital: playerData.capital, isTestMode: isTestMode }))] }));
};
export default ScriptsTab;
