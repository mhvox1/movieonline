


import React, { useState, useMemo } from 'react';
import { useGame } from '../../../contexts/GameContext';
import { ALL_PROPERTIES, ALL_LUXURY_GOODS, Property, LuxuryGood, LuxuryCategory } from '../../privateLifeData';
import { PROPERTY_IMAGES } from '../../images/propertyImages';
import { LUXURY_IMAGES } from '../../images/luxuryImages';
import CarIcon from '../../icons/CarIcon';
import WardrobeIcon from '../../icons/WardrobeIcon';
import StarIcon from '../../icons/StarIcon';
import ArrowLeftIcon from '../../icons/ArrowLeftIcon';
import ArrowRightIcon from '../../icons/ArrowRightIcon';
import { useTranslation } from '../../../hooks/useTranslation';

// Icons for the room view (fallbacks if specific icons aren't imported)
const ArtIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4-2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128a2.25 2.25 0 012.4-2.245 4.5 4.5 0 00-8.4-2.245c0 .399.078.78.22 1.128a2.25 2.25 0 00-2.4 2.245 4.5 4.5 0 008.4 2.245 2.25 2.25 0 012.4 2.245c.141.348.22.73.22 1.128a3 3 0 005.78-1.128 2.25 2.25 0 012.4-2.245 4.5 4.5 0 00-8.4-2.245c0-.399-.078-.78-.22-1.128a2.25 2.25 0 00-2.4-2.245 4.5 4.5 0 008.4 2.245 2.25 2.25 0 012.4 2.245c.141.348.22.73.22 1.128a3 3 0 00-5.78 1.128z" />
    </svg>
);

const TransportIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
);

type AssetSubTab = 'properties' | 'luxury';

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

interface PropertyModalProps {
    property: Property;
    onClose: () => void;
    onAction: (action: string, property: Property) => void;
    playerData: any;
    allProperties: Property[];
    onSwitch: (newProp: Property) => void;
    t: any;
}

const PropertyModal: React.FC<PropertyModalProps> = ({ property, onClose, onAction, playerData, allProperties, onSwitch, t }) => {
    const isGerman = t.common?.locale === 'de-DE';
    const isOwned = playerData.ownedProperties.includes(property.id);
    const isCurrent = playerData.activePropertyId === property.id;
    const isRentedOut = playerData.rentedProperties.includes(property.id);
    const canAfford = playerData.privateCapital >= property.cost;

    const backgroundUrl = PROPERTY_IMAGES[property.id] || PROPERTY_IMAGES['prop_rental'];
    const formatCurrency = (value: number) => new Intl.NumberFormat(t.common.locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

    const currentIndex = allProperties.findIndex(p => p.id === property.id);

    // Translations
    const translatedName = t.privatelife.properties[property.id]?.name || property.name;
    const translatedDesc = t.privatelife.properties[property.id]?.description || property.description;


    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        const prevIndex = (currentIndex - 1 + allProperties.length) % allProperties.length;
        onSwitch(allProperties[prevIndex]);
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        const nextIndex = (currentIndex + 1) % allProperties.length;
        onSwitch(allProperties[nextIndex]);
    };

    return (
        <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4 gap-4" onClick={onClose}>
            <button
                onClick={handlePrev}
                className="p-3 bg-gray-800/50 rounded-full hover:bg-gray-700/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-white hidden md:block"
                aria-label={isGerman ? 'Vorherige Immobilie' : 'Previous Property'}
            >
                <ArrowLeftIcon className="h-8 w-8" />
            </button>
            
            <div className="bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col relative" onClick={e => e.stopPropagation()}>
                 <div className="h-80 w-full relative flex-shrink-0">
                    <img src={backgroundUrl} alt={translatedName} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                    <h2 className="absolute bottom-4 left-6 text-3xl font-bold font-cinzel text-white drop-shadow-md">{translatedName}</h2>
                 </div>
                 
                 <div className="p-6 space-y-4">
                     <p className="text-gray-300">{translatedDesc}</p>
                     
                     <div className="grid grid-cols-2 gap-4 bg-gray-900/50 p-4 rounded-lg">
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">{isGerman ? 'Kosten / Wert' : 'Cost / Value'}</p>
                            <p className="text-xl font-bold text-white">{property.cost > 0 ? formatCurrency(property.cost) : (isGerman ? 'Kostenlos' : 'Free')}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">{isGerman ? 'Unterhalt' : 'Maintenance'}</p>
                            <p className="text-xl font-bold text-red-400">-{formatCurrency(property.monthlyCost)} / {isGerman ? 'Mon.' : 'Month'}</p>
                        </div>
                        <div>
                             <p className="text-xs text-gray-400 uppercase tracking-wider">{isGerman ? 'Mögliche Miete' : 'Potential Rent'}</p>
                             <p className="text-xl font-bold text-green-400">+{formatCurrency(property.rentalIncome || 0)} / {isGerman ? 'Mon.' : 'Month'}</p>
                        </div>
                        <div>
                             <p className="text-xs text-gray-400 uppercase tracking-wider">{isGerman ? 'Boni' : 'Bonuses'}</p>
                             <div className="flex flex-col text-sm font-bold text-amber-300">
                                 <span>+{property.reputationBonus} {isGerman ? 'Ruf' : 'Reputation'}</span>
                                 <span>+{property.recoveryBonus || 0} {isGerman ? 'Erholung' : 'Recovery'}</span>
                             </div>
                        </div>
                     </div>
                     
                     <div className="flex gap-4 pt-4 border-t border-gray-700">
                        {isCurrent ? (
                             <button disabled className="w-full bg-gray-700 text-gray-400 font-bold py-3 rounded-sm uppercase cursor-default">
                                {t.privatelife.assets.status.currentResidence}
                            </button>
                        ) : isOwned ? (
                            <>
                                {isRentedOut ? (
                                     <button onClick={() => onAction('stop_rent', property)} className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 rounded-sm uppercase transition-colors">
                                        {t.privatelife.assets.action.stopRent}
                                    </button>
                                ) : (
                                    <>
                                        <button onClick={() => onAction('move_in', property)} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-sm uppercase transition-colors">
                                            {t.privatelife.assets.action.moveIn}
                                        </button>
                                        <button onClick={() => onAction('rent_out', property)} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-sm uppercase transition-colors">
                                            {t.privatelife.assets.action.rentOut}
                                        </button>
                                    </>
                                )}
                                
                                {!isRentedOut && property.id !== 'prop_rental' && (
                                     <button onClick={() => onAction('sell', property)} className="flex-1 bg-red-800 hover:bg-red-700 text-white font-bold py-3 rounded-sm uppercase transition-colors">
                                        {t.privatelife.assets.action.sell}
                                    </button>
                                )}
                            </>
                        ) : (
                             <button 
                                onClick={() => onAction('buy', property)} 
                                disabled={!canAfford}
                                className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-sm uppercase transition-colors"
                            >
                                {t.privatelife.assets.action.buyFor} {formatCurrency(property.cost)}
                            </button>
                        )}
                     </div>
                 </div>
                 
                 {/* Mobile Arrows inside card */}
                 <div className="md:hidden flex justify-between px-4 pb-4">
                    <button onClick={handlePrev} className="p-2 bg-gray-700 rounded-full text-white"><ArrowLeftIcon className="h-6 w-6" /></button>
                    <button onClick={handleNext} className="p-2 bg-gray-700 rounded-full text-white"><ArrowRightIcon className="h-6 w-6" /></button>
                 </div>

                 <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                 </button>
            </div>
            
            <button
                onClick={handleNext}
                className="p-3 bg-gray-800/50 rounded-full hover:bg-gray-700/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-white hidden md:block"
                aria-label={isGerman ? 'Nächste Immobilie' : 'Next Property'}
            >
                <ArrowRightIcon className="h-8 w-8" />
            </button>
        </div>
    );
};

interface LuxuryModalProps {
    good: LuxuryGood;
    onClose: () => void;
    onBuy: (good: LuxuryGood) => void;
    playerData: any;
    allGoods: LuxuryGood[];
    onSwitch: (newGood: LuxuryGood) => void;
    t: any;
    skillNameMap: Record<string, string>;
}

const LuxuryModal: React.FC<LuxuryModalProps> = ({ good, onClose, onBuy, playerData, allGoods, onSwitch, t, skillNameMap }) => {
    const isGerman = t.common?.locale === 'de-DE';
    const isOwned = playerData.ownedLuxuryGoods.includes(good.id);
    const canAfford = playerData.privateCapital >= good.cost;

    const backgroundUrl = LUXURY_IMAGES[good.id] || 'https://www.schnoxcore.com/media/images/luxury_placeholder.png'; // Fallback
    const formatCurrency = (value: number) => new Intl.NumberFormat(t.common.locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

    const currentIndex = allGoods.findIndex(g => g.id === good.id);
    
    // Translations
    const translatedName = t.privatelife.luxury[good.id]?.name || good.name;
    const translatedDesc = t.privatelife.luxury[good.id]?.description || good.description;

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        const prevIndex = (currentIndex - 1 + allGoods.length) % allGoods.length;
        onSwitch(allGoods[prevIndex]);
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        const nextIndex = (currentIndex + 1) % allGoods.length;
        onSwitch(allGoods[nextIndex]);
    };

    return (
        <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4 gap-4" onClick={onClose}>
            <button
                onClick={handlePrev}
                className="p-3 bg-gray-800/50 rounded-full hover:bg-gray-700/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-white hidden md:block"
                aria-label={isGerman ? 'Vorheriges Luxusgut' : 'Previous Luxury Item'}
            >
                <ArrowLeftIcon className="h-8 w-8" />
            </button>
            
            <div className="bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col relative" onClick={e => e.stopPropagation()}>
                 <div className="h-80 w-full relative flex-shrink-0">
                    <img src={backgroundUrl} alt={translatedName} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                    <h2 className="absolute bottom-4 left-6 text-3xl font-bold font-cinzel text-white drop-shadow-md">{translatedName}</h2>
                 </div>
                 
                 <div className="p-6 space-y-4">
                     <p className="text-gray-300">{translatedDesc}</p>
                     
                     <div className="grid grid-cols-2 gap-4 bg-gray-900/50 p-4 rounded-lg">
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">{isGerman ? 'Kosten / Wert' : 'Cost / Value'}</p>
                            <p className="text-xl font-bold text-white">{formatCurrency(good.cost)}</p>
                        </div>
                        <div>
                             <p className="text-xs text-gray-400 uppercase tracking-wider">{isGerman ? 'Boni' : 'Bonuses'}</p>
                             <div className="flex flex-col text-sm font-bold">
                                 <span className="text-amber-300">+{good.reputationBonus} {isGerman ? 'Ruf' : 'Reputation'}</span>
                                 {good.skillBonus && (
                                     <span className="text-cyan-400">+{good.skillBonus.amount} {skillNameMap[good.skillBonus.skill]}</span>
                                 )}
                             </div>
                        </div>
                     </div>
                     
                     <div className="flex gap-4 pt-4 border-t border-gray-700">
                        {isOwned ? (
                             <button disabled className="w-full bg-green-800 text-green-200 font-bold py-3 rounded-sm uppercase cursor-default border border-green-700">
                                {t.privatelife.assets.status.bought}
                            </button>
                        ) : (
                             <button 
                                onClick={() => { onBuy(good); onClose(); }} 
                                disabled={!canAfford}
                                className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-sm uppercase transition-colors"
                            >
                                {t.privatelife.assets.action.buyFor} {formatCurrency(good.cost)}
                            </button>
                        )}
                     </div>
                 </div>

                 {/* Mobile Arrows inside card */}
                 <div className="md:hidden flex justify-between px-4 pb-4">
                    <button onClick={handlePrev} className="p-2 bg-gray-700 rounded-full text-white"><ArrowLeftIcon className="h-6 w-6" /></button>
                    <button onClick={handleNext} className="p-2 bg-gray-700 rounded-full text-white"><ArrowRightIcon className="h-6 w-6" /></button>
                 </div>

                 <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                 </button>
            </div>
            
            <button
                onClick={handleNext}
                className="p-3 bg-gray-800/50 rounded-full hover:bg-gray-700/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-white hidden md:block"
                aria-label={isGerman ? 'Nächstes Luxusgut' : 'Next Luxury Item'}
            >
                <ArrowRightIcon className="h-8 w-8" />
            </button>
        </div>
    );
};

export const AssetsTab: React.FC = () => {
    const { playerData, setPlayerData } = useGame();
    const { t } = useTranslation();
    const [assetTab, setAssetTab] = useState<AssetSubTab>('properties');
    const [luxuryCategoryFilter, setLuxuryCategoryFilter] = useState<LuxuryCategory | 'all'>('all');
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [selectedLuxuryGood, setSelectedLuxuryGood] = useState<LuxuryGood | null>(null);

    if (!playerData) return null;

    const formatCurrency = (value: number) => new Intl.NumberFormat(t.common.locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

    // Map skills to translated names
    const skillNameMap: Record<string, string> = {
        negotiationSkill: t.newGame.skillNegotiation,
        charisma: t.newGame.skillCharisma,
        financialSense: t.newGame.skillFinance,
        filmSense: t.newGame.skillFilmSense,
        organizationTalent: t.newGame.skillOrganization
    };

    // Property Actions
    const handleAction = (action: string, property: Property) => {
        setPlayerData(prev => {
            if (!prev) return null;
            let newState = { ...prev };
            
            switch(action) {
                case 'buy':
                    if (prev.privateCapital >= property.cost && !prev.ownedProperties.includes(property.id)) {
                        newState.privateCapital -= property.cost;
                        newState.ownedProperties = [...prev.ownedProperties, property.id];
                        newState.personalReputation = Math.min(100, newState.personalReputation + property.reputationBonus);
                        newState.activePropertyId = property.id; // Move in automatically
                    }
                    break;
                case 'sell':
                     if (prev.activePropertyId !== property.id && prev.ownedProperties.includes(property.id)) {
                        const sellPrice = Math.floor(property.cost * 0.75);
                        newState.privateCapital += sellPrice;
                        newState.ownedProperties = prev.ownedProperties.filter(id => id !== property.id);
                        newState.rentedProperties = prev.rentedProperties.filter(id => id !== property.id);
                     }
                     break;
                case 'move_in':
                    if (prev.ownedProperties.includes(property.id) || property.id === 'prop_rental') {
                         newState.activePropertyId = property.id;
                    }
                    break;
                case 'rent_out':
                    if (prev.ownedProperties.includes(property.id) && prev.activePropertyId !== property.id && !prev.rentedProperties.includes(property.id)) {
                        newState.rentedProperties = [...prev.rentedProperties, property.id];
                    }
                    break;
                case 'stop_rent':
                    if (prev.rentedProperties.includes(property.id)) {
                        newState.rentedProperties = prev.rentedProperties.filter(id => id !== property.id);
                    }
                    break;
            }
            return newState;
        });
        setSelectedProperty(null);
    };
    
    // Luxury Goods Actions
    const handleBuyLuxuryGood = (good: LuxuryGood) => {
        if (playerData.privateCapital >= good.cost && !playerData.ownedLuxuryGoods.includes(good.id)) {
            setPlayerData(prev => {
                if (!prev) return null;
                let updatedPlayer = {
                    ...prev,
                    privateCapital: prev.privateCapital - good.cost,
                    ownedLuxuryGoods: [...prev.ownedLuxuryGoods, good.id],
                    personalReputation: Math.min(100, prev.personalReputation + good.reputationBonus),
                };
    
                if (good.skillBonus) {
                    const skillKey = good.skillBonus.skill;
                    const bonus = good.skillBonus.amount;
                    if (typeof updatedPlayer[skillKey] === 'number') {
                        updatedPlayer = {
                            ...updatedPlayer,
                            [skillKey]: Math.min(100, (updatedPlayer[skillKey] as number) + bonus)
                        };
                    }
                }
    
                return updatedPlayer;
            });
        }
    };

    const filteredLuxuryGoods = useMemo(() => {
        if (luxuryCategoryFilter === 'all') return ALL_LUXURY_GOODS;
        return ALL_LUXURY_GOODS.filter(g => g.category === luxuryCategoryFilter);
    }, [luxuryCategoryFilter]);

    // Split properties into current residence and others
    const currentResidence = ALL_PROPERTIES.find(p => p.id === playerData.activePropertyId) || ALL_PROPERTIES[0];
    const otherProperties = ALL_PROPERTIES.filter(p => p.id !== playerData.activePropertyId);

    const getPropertyStatus = (propId: string) => {
        if (propId === 'prop_rental') return { label: t.privatelife.assets.status.standard, color: 'text-gray-400' };
        if (playerData.rentedProperties.includes(propId)) return { label: t.privatelife.assets.status.rented, color: 'text-blue-400' };
        if (playerData.ownedProperties.includes(propId)) return { label: t.privatelife.assets.status.owned, color: 'text-green-400' };
        return { label: t.privatelife.assets.status.forSale, color: 'text-amber-400' };
    };

    return (
        <div className="w-full h-full flex flex-col bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700 bg-gray-800/60 flex items-center justify-between flex-shrink-0">
                <h2 className="text-2xl font-bold font-cinzel text-amber-400">{t.privatelife.screen.nav.assets}</h2>
                <div className="text-sm text-gray-400">{t.privatelife.status.privateCapital}: <span className="font-bold text-white ml-2">{formatCurrency(playerData.privateCapital)}</span></div>
            </div>
            
            <div className="px-6 pt-4 border-b border-gray-700 bg-gray-800/30 flex-shrink-0">
                <TabButton title={t.privatelife.assets.tabs.properties} isActive={assetTab === 'properties'} onClick={() => setAssetTab('properties')} />
                <TabButton title={t.privatelife.assets.tabs.luxury} isActive={assetTab === 'luxury'} onClick={() => setAssetTab('luxury')} />
            </div>

            <div className="flex-grow min-h-0 relative">
                {assetTab === 'properties' && (
                    <div className="absolute inset-0 flex flex-col p-6 gap-6">
                        {/* Current Residence Section - Fixed Top */}
                        <div className="flex-shrink-0">
                            <div className="bg-gray-800 rounded-lg border-2 border-amber-500 overflow-hidden shadow-lg relative group cursor-pointer" onClick={() => setSelectedProperty(currentResidence)}>
                                 <div className="absolute top-0 right-0 bg-amber-500 text-black font-bold px-4 py-1 rounded-bl-lg z-10 shadow">{t.privatelife.assets.status.currentResidence}</div>
                                 <div className="h-64 w-full relative">
                                    <img src={PROPERTY_IMAGES[currentResidence.id]} alt={currentResidence.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
                                    <div className="absolute bottom-6 left-6 right-6">
                                         <h3 className="text-3xl font-bold font-cinzel text-white mb-2">{t.privatelife.properties[currentResidence.id]?.name || currentResidence.name}</h3>
                                         <div className="flex gap-6 text-sm">
                                            <span className="text-gray-300">{t.common.locale === 'de-DE' ? 'Unterhalt' : 'Maintenance'}: <span className="text-red-400 font-bold">-{formatCurrency(currentResidence.monthlyCost)}</span></span>
                                            <span className="text-gray-300">{t.common.locale === 'de-DE' ? 'Erholung' : 'Recovery'}: <span className="text-blue-400 font-bold">+{currentResidence.recoveryBonus || 0}</span></span>
                                            <span className="text-gray-300">{t.common.locale === 'de-DE' ? 'Ruf' : 'Reputation'}: <span className="text-green-400 font-bold">+{currentResidence.reputationBonus}</span></span>
                                         </div>
                                    </div>
                                 </div>
                            </div>
                        </div>

                        {/* Other Properties List - Scrollable */}
                        <div className="flex-grow min-h-0 bg-gray-800/50 rounded-lg border border-gray-700 flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-gray-700 flex-shrink-0">
                                <h4 className="text-lg font-bold text-gray-400">{t.privatelife.assets.tabs.properties}</h4>
                            </div>
                            <div className="overflow-y-auto p-4 custom-scrollbar">
                                <div className="grid grid-cols-1 gap-2">
                                    {otherProperties.map(prop => {
                                        const status = getPropertyStatus(prop.id);
                                        const transName = t.privatelife.properties[prop.id]?.name || prop.name;
                                        const transDesc = t.privatelife.properties[prop.id]?.description || prop.description;
                                        
                                        return (
                                            <div 
                                                key={prop.id} 
                                                onClick={() => setSelectedProperty(prop)}
                                                className="flex items-center p-3 rounded bg-gray-900/60 hover:bg-gray-700 cursor-pointer transition-colors border border-transparent hover:border-gray-600 group"
                                            >
                                                <div className="w-24 h-16 mr-4 rounded overflow-hidden flex-shrink-0 relative">
                                                    <img src={PROPERTY_IMAGES[prop.id]} className="w-full h-full object-cover" alt="" />
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <div className="flex justify-between items-baseline mb-1">
                                                        <h5 className="font-bold text-white group-hover:text-amber-300 transition-colors truncate">{transName}</h5>
                                                        <span className={`text-xs font-bold uppercase tracking-wider ${status.color}`}>{status.label}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs text-gray-400">
                                                        <span className="truncate pr-4">{transDesc}</span>
                                                        <span className="font-mono text-white whitespace-nowrap">{playerData.ownedProperties.includes(prop.id) ? t.privatelife.assets.status.owned : formatCurrency(prop.cost)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {assetTab === 'luxury' && (
                    <div className="absolute inset-0 flex flex-col p-6">
                        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 flex-shrink-0">
                            <button onClick={() => setLuxuryCategoryFilter('all')} className={`px-4 py-1.5 text-sm font-bold rounded-full transition-colors whitespace-nowrap ${luxuryCategoryFilter === 'all' ? 'bg-amber-500 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Alle</button>
                            <button onClick={() => setLuxuryCategoryFilter('fashion')} className={`px-4 py-1.5 text-sm font-bold rounded-full transition-colors whitespace-nowrap ${luxuryCategoryFilter === 'fashion' ? 'bg-amber-500 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Mode</button>
                            <button onClick={() => setLuxuryCategoryFilter('vehicle')} className={`px-4 py-1.5 text-sm font-bold rounded-full transition-colors whitespace-nowrap ${luxuryCategoryFilter === 'vehicle' ? 'bg-amber-500 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Fahrzeuge</button>
                            <button onClick={() => setLuxuryCategoryFilter('art')} className={`px-4 py-1.5 text-sm font-bold rounded-full transition-colors whitespace-nowrap ${luxuryCategoryFilter === 'art' ? 'bg-amber-500 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Kunst</button>
                            <button onClick={() => setLuxuryCategoryFilter('transport')} className={`px-4 py-1.5 text-sm font-bold rounded-full transition-colors whitespace-nowrap ${luxuryCategoryFilter === 'transport' ? 'bg-amber-500 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Transport</button>
                        </div>

                        {/* Luxury Goods List - Similar to Properties */}
                        <div className="flex-grow bg-gray-800/50 rounded-lg border border-gray-700 flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-gray-700 flex-shrink-0">
                                <h4 className="text-lg font-bold text-gray-400">{t.privatelife.assets.tabs.luxury}</h4>
                            </div>
                            <div className="overflow-y-auto p-4 custom-scrollbar">
                                <div className="grid grid-cols-1 gap-2">
                                    {filteredLuxuryGoods.map(good => {
                                        const isOwned = playerData.ownedLuxuryGoods.includes(good.id);
                                        const transName = t.privatelife.luxury[good.id]?.name || good.name;
                                        const transDesc = t.privatelife.luxury[good.id]?.description || good.description;
                                        
                                        return (
                                            <div 
                                                key={good.id} 
                                                onClick={() => setSelectedLuxuryGood(good)}
                                                className="flex items-center p-3 rounded bg-gray-900/60 hover:bg-gray-700 cursor-pointer transition-colors border border-transparent hover:border-gray-600 group"
                                            >
                                                <div className="w-24 h-16 mr-4 rounded overflow-hidden flex-shrink-0 relative bg-black/40">
                                                    <img 
                                                        src={LUXURY_IMAGES[good.id] || 'https://www.schnoxcore.com/media/images/luxury_placeholder.png'} 
                                                        className="w-full h-full object-cover" 
                                                        alt={transName} 
                                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Luxus'; }}
                                                    />
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <div className="flex justify-between items-baseline mb-1">
                                                        <h5 className="font-bold text-white group-hover:text-amber-300 transition-colors truncate">{transName}</h5>
                                                        <span className={`text-xs font-bold uppercase tracking-wider ${isOwned ? 'text-green-400' : 'text-amber-400'}`}>
                                                            {isOwned ? t.privatelife.assets.status.bought : t.privatelife.assets.action.buy}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-xs text-gray-400">
                                                        <span className="truncate pr-4">{transDesc}</span>
                                                        <span className="font-mono text-white whitespace-nowrap">{isOwned ? t.privatelife.assets.status.bought : formatCurrency(good.cost)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Property Detail Modal */}
            {selectedProperty && (
                <PropertyModal 
                    property={selectedProperty} 
                    onClose={() => setSelectedProperty(null)}
                    onAction={handleAction}
                    playerData={playerData}
                    allProperties={ALL_PROPERTIES}
                    onSwitch={setSelectedProperty}
                    t={t}
                />
            )}

             {/* Luxury Good Modal */}
             {selectedLuxuryGood && (
                <LuxuryModal 
                    good={selectedLuxuryGood} 
                    onClose={() => setSelectedLuxuryGood(null)}
                    onBuy={handleBuyLuxuryGood}
                    playerData={playerData}
                    allGoods={filteredLuxuryGoods}
                    onSwitch={setSelectedLuxuryGood}
                    t={t}
                    skillNameMap={skillNameMap}
                />
            )}
        </div>
    );
};
