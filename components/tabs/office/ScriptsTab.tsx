
import React, { useState, useMemo, useEffect } from 'react';
import { Script, Genre, EmployeeType, ActiveWriting, Employee, BuildingType, ProjectPhase } from '../../../types';
import StarRating from '../../StarRating';
import { useGame } from '../../../contexts/GameContext';
import { GENRE_UNLOCKS } from '../../constants';
import ScriptDossierModal from '../../ScriptDossierModal';
import { useTranslation } from '../../../hooks/useTranslation';
import { getTranslatedScriptTitle, getTranslatedScriptDescription } from '../../scriptGenerator';

type ScriptSubTab = 'owned' | 'write' | 'market';

const TabButton: React.FC<{ title: string, isActive: boolean, onClick: () => void, disabled?: boolean }> = ({ title, isActive, onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`py-3 px-6 font-bold text-base transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-amber-500/50 relative top-px
            ${isActive 
                ? 'bg-gray-800/80 text-amber-400 border-gray-700 border-t border-x rounded-t-lg' 
                : 'bg-gray-900/50 text-gray-300 hover:text-amber-400 hover:bg-gray-800/50 border-b border-gray-700'
            } ${
            disabled 
                ? 'opacity-50 cursor-not-allowed' 
                : ''
            }`}
    >
        {title}
    </button>
);

const ScriptsTab: React.FC = () => {
    const { playerData, setPlayerData } = useGame();
    const { t, language } = useTranslation();
    const [scriptSubTab, setScriptSubTab] = useState<ScriptSubTab>('market');
    const [scriptTitle, setScriptTitle] = useState("");
    const [scriptGenre, setScriptGenre] = useState<Genre>(Genre.Action);
    
    const [formError, setFormError] = useState('');
    const [scriptMarketGenreFilter, setScriptMarketGenreFilter] = useState<Genre | 'all'>('all');
    const [scriptToSell, setScriptToSell] = useState<{ script: Script; price: number } | null>(null);
    const [selectedScriptForModal, setSelectedScriptForModal] = useState<Script | null>(null);

    if (!playerData) return null;

    const isTestMode = playerData.playerName === 'Max Mustermann' && playerData.studioName === 'Teststudio';
    const writers = useMemo(() => {
        if (!playerData) return [];
        const employeeWriters = playerData.employees.filter(e => e.type === EmployeeType.Autor);
        
        // Add Partner if applicable
        if (playerData.partnerIsEmployed && playerData.partnerEmployedAs === EmployeeType.Autor) {
            const partnerWriter: Employee = {
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
                    portraitUrl: child.portraitId ? `https://www.schnoxcore.com/media/kinder/${child.portraitId}.png` : undefined 
                 });
             }
        });

        return employeeWriters;
    }, [playerData, language]);

    const [selectedWriterId, setSelectedWriterId] = useState<number>(writers[0]?.id || 0);
    const hasWritersBungalow = playerData.buildings.some(b => b.type === BuildingType.Autorenbuero && b.level > 0);

    useEffect(() => {
        if (writers.length > 0 && (selectedWriterId === 0 || !writers.some(w => w.id === selectedWriterId))) {
            setSelectedWriterId(writers[0].id);
        }
    }, [writers, selectedWriterId]);
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
    
    const getDaysRemaining = (endDate: Date) => {
        return Math.max(0, Math.ceil((new Date(endDate).getTime() - new Date(playerData.gameDate).getTime()) / (1000 * 3600 * 24)));
    }

    const unlockedGenres = useMemo(() => Object.values(Genre), []);
    
    const filteredScriptMarket = useMemo(() => {
        let market = playerData.scriptMarket;
        if (scriptMarketGenreFilter === 'all') {
            return market;
        }
        return market.filter(script => script.genre === scriptMarketGenreFilter);
    }, [playerData.scriptMarket, scriptMarketGenreFilter]);
    
    const isPlayerBusy = useMemo(() => {
        if (!playerData) return false;
    
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

    const handleBuyScript = (scriptToBuy: Script) => {
        if (!scriptToBuy.price || (playerData.capital < scriptToBuy.price && !isTestMode)) {
            return;
        }
        
        setPlayerData(prev => {
            if (!prev) return null;
            
            const newMarket = prev.scriptMarket.filter(s => s.id !== scriptToBuy.id);
            const newOwnedScripts = [...prev.availableScripts, { ...scriptToBuy, price: scriptToBuy.price }];
            
            return {
                ...prev,
                capital: prev.capital - scriptToBuy.price!,
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
                        amount: scriptToBuy.price!,
                    }
                ]
            };
        });
        setSelectedScriptForModal(null);
    };

    const handleStartWriting = () => {
        setFormError('');
        if (!scriptTitle.trim()) { setFormError(language === 'de' ? 'Bitte Titel eingeben.' : 'Please enter a title.'); return; }
        if (selectedWriterId === 0 && writers.length > 0) { setFormError(language === 'de' ? 'Bitte einen Autor auswählen.' : 'Please select a writer.'); return; }
        if (writers.length === 0) { setFormError(language === 'de' ? 'Keine Autoren verfügbar.' : 'No writers available.'); return; }
    
        const writer = writers.find(w => w.id === selectedWriterId);
        if (!writer) { setFormError(language === 'de' ? 'Ausgewählter Autor nicht gefunden.' : 'Selected writer not found.'); return; }
    
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

        const newWritingProject: ActiveWriting = {
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
            ...prev!,
            capital: prev!.capital - settings.cost,
            activeWriting: newWritingProject,
            transactionLog: [
                ...prev!.transactionLog,
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

    const handleSellScriptClick = (script: Script) => {
        const basePrice = 5000 + (script.quality * script.quality * 25);
        const sellMultiplier = 0.25 + Math.random() * 0.30; // 25% to 55%
        const sellPrice = Math.round((basePrice * sellMultiplier) / 1000) * 1000; // Round to nearest 1000
        setScriptToSell({ script, price: sellPrice });
    };

    const confirmSellScript = () => {
        if (!scriptToSell) return;

        setPlayerData(prev => {
            if (!prev) return null;
            
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
            const { script, startDate, endDate, writerId } = playerData.activeWriting!;
            // Lookup writer in enhanced list
            const writer = writers.find(w => w.id === writerId);
            const writerName = writer ? writer.name : (writerId === -1 ? `${playerData.playerName} (${language === 'de' ? 'Du' : 'You'})` : (language === 'de' ? 'Unbekannt' : 'Unknown'));
            
            const totalDuration = (new Date(endDate).getTime() - new Date(startDate).getTime());
            const elapsed = (new Date(playerData.gameDate).getTime() - new Date(startDate).getTime());
            const progress = totalDuration > 0 ? Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100))) : 100;
            const daysRemaining = getDaysRemaining(endDate);
            return (
                <div className="text-center space-y-3">
                    <p className="text-lg font-bold text-white">"{script.title}"</p>
                    <p className="text-gray-400">{language === 'de' ? 'Autor' : 'Writer'}: {writerName}</p>
                    <p className="text-gray-400">{language === 'de' ? 'Verbleibende Zeit' : 'Remaining Time'}: {daysRemaining} {language === 'de' ? 'Tage' : 'days'}</p>
                    <div className="w-full bg-gray-700 rounded-full h-5 overflow-hidden border border-gray-600">
                        <div className="bg-purple-500 h-full rounded-full flex items-center justify-center text-sm font-bold text-black" style={{ width: `${progress}%` }}>{progress}%</div>
                    </div>
                </div>
            );
        }

        if (!hasWritersBungalow) {
            return (
                <div className="text-center p-8 bg-gray-900/50 rounded-lg max-w-2xl mx-auto">
                    <h3 className="text-xl text-amber-300 font-bold">{t.project.scripts.writersOfficeRequired}</h3>
                    <p className="text-gray-400 mt-2">{language === 'de' ? 'Um Drehbücher schreiben zu können, müssen Sie zuerst ein Autorenbüro auf Ihrem Studiogelände bauen.' : 'To write scripts, you must first build a writers office on your studio lot.'}</p>
                </div>
            );
        }

        if (writers.length === 0) {
            return (
                 <div className="text-center p-8 bg-gray-900/50 rounded-lg max-w-2xl mx-auto">
                    <h3 className="text-xl text-amber-300 font-bold">{t.project.scripts.noWriters}</h3>
                    <p className="text-gray-400 mt-2">{language === 'de' ? 'Sie haben ein Autorenbüro, aber keinen Autor angestellt.' : 'You have a writers office, but no writer is employed.'}</p>
                </div>
            );
        }

        const isPlayerSelectedAndBusy = selectedWriterId === -1 && isPlayerBusy;

        return (
            <div className="space-y-3 max-w-md mx-auto">
                <div>
                    <label className="text-xs text-gray-400">{t.project.scripts.workTitle}</label>
                    <input type="text" value={scriptTitle} onChange={e => setScriptTitle(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-md p-1.5 text-sm" />
                </div>
                <div>
                    <label className="text-xs text-gray-400">{t.project.scripts.genre}</label>
                    <div className="flex items-center gap-2">
                        <select value={scriptGenre} onChange={e => setScriptGenre(e.target.value as Genre)} className="w-full bg-gray-900 border border-gray-600 rounded-md p-1.5 text-sm">
                            {unlockedGenres.map(g => <option key={g} value={g}>{t.genres[g]}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="text-xs text-gray-400">{t.project.scripts.assignWriter}</label>
                    <select value={selectedWriterId} onChange={e => setSelectedWriterId(Number(e.target.value))} className="w-full bg-gray-900 border border-gray-600 rounded-md p-1.5 text-sm" disabled={writers.length === 0}>
                        {writers.length > 0 ? writers.map(w => <option key={w.id} value={w.id}>{w.name} ({language === 'de' ? 'Talent' : 'Talent'}: {w.talent})</option>) : <option>{language === 'de' ? 'Keine Autoren verfügbar' : 'No writers available'}</option>}
                    </select>
                </div>
                {formError && <p className="text-red-400 text-xs text-center">{formError}</p>}
                <div title={isPlayerSelectedAndBusy ? (language === 'de' ? 'Du bist bereits mit einer anderen Aufgabe beschäftigt.' : 'You are already busy with another task.') : ''}>
                    <button onClick={handleStartWriting} disabled={writers.length === 0 || !!playerData.activeWriting || isPlayerSelectedAndBusy} className="w-full mt-4 bg-purple-600 text-white font-bold py-2 rounded-sm uppercase hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed">
                        {t.project.scripts.startWriting}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="w-full h-full flex flex-col">
                <div className="flex-shrink-0 flex items-end">
                    <TabButton title={t.project.scripts.buy} isActive={scriptSubTab === 'market'} onClick={() => setScriptSubTab('market')} />
                    <TabButton title={t.project.scripts.owned} isActive={scriptSubTab === 'owned'} onClick={() => setScriptSubTab('owned')} />
                    <TabButton title={t.project.scripts.write} isActive={scriptSubTab === 'write'} onClick={() => setScriptSubTab('write')} />
                </div>
                <div className="flex-grow bg-gray-800/80 p-4 rounded-b-lg rounded-tr-lg shadow-2xl border border-gray-700 border-t-0 overflow-y-auto">
                    {scriptSubTab === 'owned' && (
                        <div className="space-y-3">
                            {playerData.availableScripts.length > 0 ? playerData.availableScripts.map(script => {
                                const title = getTranslatedScriptTitle(script, t);
                                return (
                                <div key={script.id} className="bg-gray-800/80 p-3 rounded-lg border border-gray-700 flex justify-between items-center">
                                    <div className="flex-grow">
                                        <h4 className="font-bold text-white">{title}</h4>
                                        <div className="flex justify-between items-center text-sm text-gray-300">
                                            <span className="text-sm text-gray-300">{t.genres[script.genre]}</span>
                                            <StarRating rating={script.quality}/>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleSellScriptClick(script)}
                                        className="ml-4 bg-yellow-600 text-white font-bold py-2 px-4 rounded-sm text-xs uppercase hover:bg-yellow-500 transition-colors"
                                    >
                                        {t.project.scripts.sell}
                                    </button>
                                </div>
                            )}) : <p className="text-center text-gray-500 italic py-8">{t.project.scripts.noOwned}</p>}
                        </div>
                    )}
                    {scriptSubTab === 'write' && (
                        <div className=" p-4 rounded-lg">
                            <h3 className="text-xl font-cinzel text-amber-400 mb-4 text-center">{t.project.scripts.newScript}</h3>
                            {renderWriteTab()}
                        </div>
                    )}
                    {scriptSubTab === 'market' && (
                        <div>
                                <div className="mb-6">
                                <label htmlFor="genre-filter" className="block text-sm font-medium text-gray-300 mb-1 tracking-wider">{t.project.scripts.filterGenre}:</label>
                                <select
                                    id="genre-filter"
                                    value={scriptMarketGenreFilter}
                                    onChange={(e) => setScriptMarketGenreFilter(e.target.value as Genre | 'all')}
                                    className="w-full max-w-xs bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-amber-500 outline-none transition"
                                >
                                    <option value="all">{t.project.scripts.allGenres}</option>
                                    {Object.values(Genre).map(g => <option key={g} value={g}>{t.genres[g]}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                {filteredScriptMarket.map(script => {
                                    const title = getTranslatedScriptTitle(script, t);
                                    const desc = getTranslatedScriptDescription(script, t);
                                    
                                    return (
                                    <div key={script.id} className="bg-gray-800/80 p-4 rounded-lg border border-gray-700 flex flex-col">
                                        <h4 className="font-bold text-white text-lg">{title}</h4>
                                        <div className="text-sm text-amber-300">
                                            {t.genres[script.genre]}
                                        </div>
                                        <p className="text-xs text-gray-400 my-2 flex-grow italic">"{desc}"</p>
                                        <div className="flex justify-between items-center mt-2 text-sm">
                                            <StarRating rating={script.quality}/>
                                            <span className="font-bold text-amber-400 text-base">{formatCurrency(script.price!)}</span>
                                        </div>
                                        <button 
                                            onClick={() => setSelectedScriptForModal(script)}
                                            className="w-full mt-3 bg-amber-400 text-gray-900 font-bold py-2 rounded-sm text-sm uppercase hover:bg-amber-500 transition-colors"
                                        >
                                            {t.project.scripts.details}
                                        </button>
                                    </div>
                                )})}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {scriptToSell && (
                <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center">
                        <h2 className="text-3xl font-bold font-cinzel text-amber-400 mb-4">{t.project.scripts.sellConfirmTitle}</h2>
                        <p className="text-gray-300 text-lg mb-6">
                            {t.project.scripts.sellConfirmText.replace('{title}', getTranslatedScriptTitle(scriptToSell.script, t)).replace('{price}', formatCurrency(scriptToSell.price))}
                        </p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setScriptToSell(null)} className="bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all">{t.common.cancel}</button>
                            <button onClick={confirmSellScript} className="bg-green-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-green-500 transition-all">{t.common.confirm}</button>
                        </div>
                    </div>
                </div>
            )}
            {selectedScriptForModal && (
                <ScriptDossierModal
                    script={selectedScriptForModal}
                    onClose={() => setSelectedScriptForModal(null)}
                    onBuy={handleBuyScript}
                    playerCapital={playerData.capital}
                    isTestMode={isTestMode}
                />
            )}
        </>
    );
};

export default ScriptsTab;
