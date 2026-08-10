import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { useGame } from '../../../contexts/GameContext';
import { ALL_PROPERTIES, ALL_LUXURY_GOODS } from '../../privateLifeData';
import { PROPERTY_IMAGES } from '../../images/propertyImages';
import { LUXURY_IMAGES } from '../../images/luxuryImages';
import ArrowLeftIcon from '../../icons/ArrowLeftIcon';
import ArrowRightIcon from '../../icons/ArrowRightIcon';
import { useTranslation } from '../../../hooks/useTranslation';
// Icons for the room view (fallbacks if specific icons aren't imported)
const ArtIcon = ({ className }) => (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: className, children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4-2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128a2.25 2.25 0 012.4-2.245 4.5 4.5 0 00-8.4-2.245c0 .399.078.78.22 1.128a2.25 2.25 0 00-2.4 2.245 4.5 4.5 0 008.4 2.245 2.25 2.25 0 012.4 2.245c.141.348.22.73.22 1.128a3 3 0 005.78-1.128 2.25 2.25 0 012.4-2.245 4.5 4.5 0 00-8.4-2.245c0-.399-.078-.78-.22-1.128a2.25 2.25 0 00-2.4-2.245 4.5 4.5 0 008.4 2.245 2.25 2.25 0 012.4 2.245c.141.348.22.73.22 1.128a3 3 0 00-5.78 1.128z" }) }));
const TransportIcon = ({ className }) => (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: className, children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" }) }));
const TabButton = ({ title, isActive, onClick }) => (_jsx("button", { onClick: onClick, className: `py-2 px-6 font-bold text-base transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-amber-500/50 relative top-px
            ${isActive
        ? 'bg-gray-800/80 text-amber-400 border-gray-700 border-t border-x rounded-t-lg'
        : 'bg-gray-900/50 text-gray-300 hover:text-amber-400 hover:bg-gray-800/50 border-b border-gray-700'}`, children: title }));
const PropertyModal = ({ property, onClose, onAction, playerData, allProperties, onSwitch, t }) => {
    const isGerman = t.common?.locale === 'de-DE';
    const isOwned = playerData.ownedProperties.includes(property.id);
    const isCurrent = playerData.activePropertyId === property.id;
    const isRentedOut = playerData.rentedProperties.includes(property.id);
    const canAfford = playerData.privateCapital >= property.cost;
    const backgroundUrl = PROPERTY_IMAGES[property.id] || PROPERTY_IMAGES['prop_rental'];
    const formatCurrency = (value) => new Intl.NumberFormat(t.common.locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
    const currentIndex = allProperties.findIndex(p => p.id === property.id);
    // Translations
    const translatedName = t.privatelife.properties[property.id]?.name || property.name;
    const translatedDesc = t.privatelife.properties[property.id]?.description || property.description;
    const handlePrev = (e) => {
        e.stopPropagation();
        const prevIndex = (currentIndex - 1 + allProperties.length) % allProperties.length;
        onSwitch(allProperties[prevIndex]);
    };
    const handleNext = (e) => {
        e.stopPropagation();
        const nextIndex = (currentIndex + 1) % allProperties.length;
        onSwitch(allProperties[nextIndex]);
    };
    return (_jsxs("div", { className: "absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4 gap-4", onClick: onClose, children: [_jsx("button", { onClick: handlePrev, className: "p-3 bg-gray-800/50 rounded-full hover:bg-gray-700/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-white hidden md:block", "aria-label": isGerman ? 'Vorherige Immobilie' : 'Previous Property', children: _jsx(ArrowLeftIcon, { className: "h-8 w-8" }) }), _jsxs("div", { className: "bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col relative", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "h-80 w-full relative flex-shrink-0", children: [_jsx("img", { src: backgroundUrl, alt: translatedName, className: "w-full h-full object-cover" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" }), _jsx("h2", { className: "absolute bottom-4 left-6 text-3xl font-bold font-cinzel text-white drop-shadow-md", children: translatedName })] }), _jsxs("div", { className: "p-6 space-y-4", children: [_jsx("p", { className: "text-gray-300", children: translatedDesc }), _jsxs("div", { className: "grid grid-cols-2 gap-4 bg-gray-900/50 p-4 rounded-lg", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-400 uppercase tracking-wider", children: isGerman ? 'Kosten / Wert' : 'Cost / Value' }), _jsx("p", { className: "text-xl font-bold text-white", children: property.cost > 0 ? formatCurrency(property.cost) : (isGerman ? 'Kostenlos' : 'Free') })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-400 uppercase tracking-wider", children: isGerman ? 'Unterhalt' : 'Maintenance' }), _jsxs("p", { className: "text-xl font-bold text-red-400", children: ["-", formatCurrency(property.monthlyCost), " / ", isGerman ? 'Mon.' : 'Month'] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-400 uppercase tracking-wider", children: isGerman ? 'Mögliche Miete' : 'Potential Rent' }), _jsxs("p", { className: "text-xl font-bold text-green-400", children: ["+", formatCurrency(property.rentalIncome || 0), " / ", isGerman ? 'Mon.' : 'Month'] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-400 uppercase tracking-wider", children: isGerman ? 'Boni' : 'Bonuses' }), _jsxs("div", { className: "flex flex-col text-sm font-bold text-amber-300", children: [_jsxs("span", { children: ["+", property.reputationBonus, " ", isGerman ? 'Ruf' : 'Reputation'] }), _jsxs("span", { children: ["+", property.recoveryBonus || 0, " ", isGerman ? 'Erholung' : 'Recovery'] })] })] })] }), _jsx("div", { className: "flex gap-4 pt-4 border-t border-gray-700", children: isCurrent ? (_jsx("button", { disabled: true, className: "w-full bg-gray-700 text-gray-400 font-bold py-3 rounded-sm uppercase cursor-default", children: t.privatelife.assets.status.currentResidence })) : isOwned ? (_jsxs(_Fragment, { children: [isRentedOut ? (_jsx("button", { onClick: () => onAction('stop_rent', property), className: "flex-1 bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 rounded-sm uppercase transition-colors", children: t.privatelife.assets.action.stopRent })) : (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => onAction('move_in', property), className: "flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-sm uppercase transition-colors", children: t.privatelife.assets.action.moveIn }), _jsx("button", { onClick: () => onAction('rent_out', property), className: "flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-sm uppercase transition-colors", children: t.privatelife.assets.action.rentOut })] })), !isRentedOut && property.id !== 'prop_rental' && (_jsx("button", { onClick: () => onAction('sell', property), className: "flex-1 bg-red-800 hover:bg-red-700 text-white font-bold py-3 rounded-sm uppercase transition-colors", children: t.privatelife.assets.action.sell }))] })) : (_jsxs("button", { onClick: () => onAction('buy', property), disabled: !canAfford, className: "w-full bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-sm uppercase transition-colors", children: [t.privatelife.assets.action.buyFor, " ", formatCurrency(property.cost)] })) })] }), _jsxs("div", { className: "md:hidden flex justify-between px-4 pb-4", children: [_jsx("button", { onClick: handlePrev, className: "p-2 bg-gray-700 rounded-full text-white", children: _jsx(ArrowLeftIcon, { className: "h-6 w-6" }) }), _jsx("button", { onClick: handleNext, className: "p-2 bg-gray-700 rounded-full text-white", children: _jsx(ArrowRightIcon, { className: "h-6 w-6" }) })] }), _jsx("button", { onClick: onClose, className: "absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors z-10", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }), _jsx("button", { onClick: handleNext, className: "p-3 bg-gray-800/50 rounded-full hover:bg-gray-700/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-white hidden md:block", "aria-label": isGerman ? 'Nächste Immobilie' : 'Next Property', children: _jsx(ArrowRightIcon, { className: "h-8 w-8" }) })] }));
};
const LuxuryModal = ({ good, onClose, onBuy, playerData, allGoods, onSwitch, t, skillNameMap }) => {
    const isGerman = t.common?.locale === 'de-DE';
    const isOwned = playerData.ownedLuxuryGoods.includes(good.id);
    const canAfford = playerData.privateCapital >= good.cost;
    const backgroundUrl = LUXURY_IMAGES[good.id] || './images/luxury_placeholder.png'; // Fallback
    const formatCurrency = (value) => new Intl.NumberFormat(t.common.locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
    const currentIndex = allGoods.findIndex(g => g.id === good.id);
    // Translations
    const translatedName = t.privatelife.luxury[good.id]?.name || good.name;
    const translatedDesc = t.privatelife.luxury[good.id]?.description || good.description;
    const handlePrev = (e) => {
        e.stopPropagation();
        const prevIndex = (currentIndex - 1 + allGoods.length) % allGoods.length;
        onSwitch(allGoods[prevIndex]);
    };
    const handleNext = (e) => {
        e.stopPropagation();
        const nextIndex = (currentIndex + 1) % allGoods.length;
        onSwitch(allGoods[nextIndex]);
    };
    return (_jsxs("div", { className: "absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4 gap-4", onClick: onClose, children: [_jsx("button", { onClick: handlePrev, className: "p-3 bg-gray-800/50 rounded-full hover:bg-gray-700/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-white hidden md:block", "aria-label": isGerman ? 'Vorheriges Luxusgut' : 'Previous Luxury Item', children: _jsx(ArrowLeftIcon, { className: "h-8 w-8" }) }), _jsxs("div", { className: "bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col relative", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "h-80 w-full relative flex-shrink-0", children: [_jsx("img", { src: backgroundUrl, alt: translatedName, className: "w-full h-full object-cover" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" }), _jsx("h2", { className: "absolute bottom-4 left-6 text-3xl font-bold font-cinzel text-white drop-shadow-md", children: translatedName })] }), _jsxs("div", { className: "p-6 space-y-4", children: [_jsx("p", { className: "text-gray-300", children: translatedDesc }), _jsxs("div", { className: "grid grid-cols-2 gap-4 bg-gray-900/50 p-4 rounded-lg", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-400 uppercase tracking-wider", children: isGerman ? 'Kosten / Wert' : 'Cost / Value' }), _jsx("p", { className: "text-xl font-bold text-white", children: formatCurrency(good.cost) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-400 uppercase tracking-wider", children: isGerman ? 'Boni' : 'Bonuses' }), _jsxs("div", { className: "flex flex-col text-sm font-bold", children: [_jsxs("span", { className: "text-amber-300", children: ["+", good.reputationBonus, " ", isGerman ? 'Ruf' : 'Reputation'] }), good.skillBonus && (_jsxs("span", { className: "text-cyan-400", children: ["+", good.skillBonus.amount, " ", skillNameMap[good.skillBonus.skill]] }))] })] })] }), _jsx("div", { className: "flex gap-4 pt-4 border-t border-gray-700", children: isOwned ? (_jsx("button", { disabled: true, className: "w-full bg-green-800 text-green-200 font-bold py-3 rounded-sm uppercase cursor-default border border-green-700", children: t.privatelife.assets.status.bought })) : (_jsxs("button", { onClick: () => { onBuy(good); onClose(); }, disabled: !canAfford, className: "w-full bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-sm uppercase transition-colors", children: [t.privatelife.assets.action.buyFor, " ", formatCurrency(good.cost)] })) })] }), _jsxs("div", { className: "md:hidden flex justify-between px-4 pb-4", children: [_jsx("button", { onClick: handlePrev, className: "p-2 bg-gray-700 rounded-full text-white", children: _jsx(ArrowLeftIcon, { className: "h-6 w-6" }) }), _jsx("button", { onClick: handleNext, className: "p-2 bg-gray-700 rounded-full text-white", children: _jsx(ArrowRightIcon, { className: "h-6 w-6" }) })] }), _jsx("button", { onClick: onClose, className: "absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors z-10", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }), _jsx("button", { onClick: handleNext, className: "p-3 bg-gray-800/50 rounded-full hover:bg-gray-700/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-white hidden md:block", "aria-label": isGerman ? 'Nächstes Luxusgut' : 'Next Luxury Item', children: _jsx(ArrowRightIcon, { className: "h-8 w-8" }) })] }));
};
export const AssetsTab = () => {
    const { playerData, setPlayerData } = useGame();
    const { t } = useTranslation();
    const [assetTab, setAssetTab] = useState('properties');
    const [luxuryCategoryFilter, setLuxuryCategoryFilter] = useState('all');
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [selectedLuxuryGood, setSelectedLuxuryGood] = useState(null);
    if (!playerData)
        return null;
    const formatCurrency = (value) => new Intl.NumberFormat(t.common.locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
    // Map skills to translated names
    const skillNameMap = {
        negotiationSkill: t.newGame.skillNegotiation,
        charisma: t.newGame.skillCharisma,
        financialSense: t.newGame.skillFinance,
        filmSense: t.newGame.skillFilmSense,
        organizationTalent: t.newGame.skillOrganization
    };
    // Property Actions
    const handleAction = (action, property) => {
        setPlayerData(prev => {
            if (!prev)
                return null;
            let newState = { ...prev };
            switch (action) {
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
    const handleBuyLuxuryGood = (good) => {
        if (playerData.privateCapital >= good.cost && !playerData.ownedLuxuryGoods.includes(good.id)) {
            setPlayerData(prev => {
                if (!prev)
                    return null;
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
                            [skillKey]: Math.min(100, updatedPlayer[skillKey] + bonus)
                        };
                    }
                }
                return updatedPlayer;
            });
        }
    };
    const filteredLuxuryGoods = useMemo(() => {
        if (luxuryCategoryFilter === 'all')
            return ALL_LUXURY_GOODS;
        return ALL_LUXURY_GOODS.filter(g => g.category === luxuryCategoryFilter);
    }, [luxuryCategoryFilter]);
    // Split properties into current residence and others
    const currentResidence = ALL_PROPERTIES.find(p => p.id === playerData.activePropertyId) || ALL_PROPERTIES[0];
    const otherProperties = ALL_PROPERTIES.filter(p => p.id !== playerData.activePropertyId);
    const getPropertyStatus = (propId) => {
        if (propId === 'prop_rental')
            return { label: t.privatelife.assets.status.standard, color: 'text-gray-400' };
        if (playerData.rentedProperties.includes(propId))
            return { label: t.privatelife.assets.status.rented, color: 'text-blue-400' };
        if (playerData.ownedProperties.includes(propId))
            return { label: t.privatelife.assets.status.owned, color: 'text-green-400' };
        return { label: t.privatelife.assets.status.forSale, color: 'text-amber-400' };
    };
    return (_jsxs("div", { className: "w-full h-full flex flex-col bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden", children: [_jsxs("div", { className: "p-4 border-b border-gray-700 bg-gray-800/60 flex items-center justify-between flex-shrink-0", children: [_jsx("h2", { className: "text-2xl font-bold font-cinzel text-amber-400", children: t.privatelife.screen.nav.assets }), _jsxs("div", { className: "text-sm text-gray-400", children: [t.privatelife.status.privateCapital, ": ", _jsx("span", { className: "font-bold text-white ml-2", children: formatCurrency(playerData.privateCapital) })] })] }), _jsxs("div", { className: "px-6 pt-4 border-b border-gray-700 bg-gray-800/30 flex-shrink-0", children: [_jsx(TabButton, { title: t.privatelife.assets.tabs.properties, isActive: assetTab === 'properties', onClick: () => setAssetTab('properties') }), _jsx(TabButton, { title: t.privatelife.assets.tabs.luxury, isActive: assetTab === 'luxury', onClick: () => setAssetTab('luxury') })] }), _jsxs("div", { className: "flex-grow min-h-0 relative", children: [assetTab === 'properties' && (_jsxs("div", { className: "absolute inset-0 flex flex-col p-6 gap-6", children: [_jsx("div", { className: "flex-shrink-0", children: _jsxs("div", { className: "bg-gray-800 rounded-lg border-2 border-amber-500 overflow-hidden shadow-lg relative group cursor-pointer", onClick: () => setSelectedProperty(currentResidence), children: [_jsx("div", { className: "absolute top-0 right-0 bg-amber-500 text-black font-bold px-4 py-1 rounded-bl-lg z-10 shadow", children: t.privatelife.assets.status.currentResidence }), _jsxs("div", { className: "h-64 w-full relative", children: [_jsx("img", { src: PROPERTY_IMAGES[currentResidence.id], alt: currentResidence.name, className: "w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" }), _jsxs("div", { className: "absolute bottom-6 left-6 right-6", children: [_jsx("h3", { className: "text-3xl font-bold font-cinzel text-white mb-2", children: t.privatelife.properties[currentResidence.id]?.name || currentResidence.name }), _jsxs("div", { className: "flex gap-6 text-sm", children: [_jsxs("span", { className: "text-gray-300", children: [t.common.locale === 'de-DE' ? 'Unterhalt' : 'Maintenance', ": ", _jsxs("span", { className: "text-red-400 font-bold", children: ["-", formatCurrency(currentResidence.monthlyCost)] })] }), _jsxs("span", { className: "text-gray-300", children: [t.common.locale === 'de-DE' ? 'Erholung' : 'Recovery', ": ", _jsxs("span", { className: "text-blue-400 font-bold", children: ["+", currentResidence.recoveryBonus || 0] })] }), _jsxs("span", { className: "text-gray-300", children: [t.common.locale === 'de-DE' ? 'Ruf' : 'Reputation', ": ", _jsxs("span", { className: "text-green-400 font-bold", children: ["+", currentResidence.reputationBonus] })] })] })] })] })] }) }), _jsxs("div", { className: "flex-grow min-h-0 bg-gray-800/50 rounded-lg border border-gray-700 flex flex-col overflow-hidden", children: [_jsx("div", { className: "p-4 border-b border-gray-700 flex-shrink-0", children: _jsx("h4", { className: "text-lg font-bold text-gray-400", children: t.privatelife.assets.tabs.properties }) }), _jsx("div", { className: "overflow-y-auto p-4 custom-scrollbar", children: _jsx("div", { className: "grid grid-cols-1 gap-2", children: otherProperties.map(prop => {
                                                const status = getPropertyStatus(prop.id);
                                                const transName = t.privatelife.properties[prop.id]?.name || prop.name;
                                                const transDesc = t.privatelife.properties[prop.id]?.description || prop.description;
                                                return (_jsxs("div", { onClick: () => setSelectedProperty(prop), className: "flex items-center p-3 rounded bg-gray-900/60 hover:bg-gray-700 cursor-pointer transition-colors border border-transparent hover:border-gray-600 group", children: [_jsx("div", { className: "w-24 h-16 mr-4 rounded overflow-hidden flex-shrink-0 relative", children: _jsx("img", { src: PROPERTY_IMAGES[prop.id], className: "w-full h-full object-cover", alt: "" }) }), _jsxs("div", { className: "flex-grow min-w-0", children: [_jsxs("div", { className: "flex justify-between items-baseline mb-1", children: [_jsx("h5", { className: "font-bold text-white group-hover:text-amber-300 transition-colors truncate", children: transName }), _jsx("span", { className: `text-xs font-bold uppercase tracking-wider ${status.color}`, children: status.label })] }), _jsxs("div", { className: "flex justify-between text-xs text-gray-400", children: [_jsx("span", { className: "truncate pr-4", children: transDesc }), _jsx("span", { className: "font-mono text-white whitespace-nowrap", children: playerData.ownedProperties.includes(prop.id) ? t.privatelife.assets.status.owned : formatCurrency(prop.cost) })] })] })] }, prop.id));
                                            }) }) })] })] })), assetTab === 'luxury' && (_jsxs("div", { className: "absolute inset-0 flex flex-col p-6", children: [_jsxs("div", { className: "flex gap-2 mb-4 overflow-x-auto pb-2 flex-shrink-0", children: [_jsx("button", { onClick: () => setLuxuryCategoryFilter('all'), className: `px-4 py-1.5 text-sm font-bold rounded-full transition-colors whitespace-nowrap ${luxuryCategoryFilter === 'all' ? 'bg-amber-500 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`, children: "Alle" }), _jsx("button", { onClick: () => setLuxuryCategoryFilter('fashion'), className: `px-4 py-1.5 text-sm font-bold rounded-full transition-colors whitespace-nowrap ${luxuryCategoryFilter === 'fashion' ? 'bg-amber-500 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`, children: "Mode" }), _jsx("button", { onClick: () => setLuxuryCategoryFilter('vehicle'), className: `px-4 py-1.5 text-sm font-bold rounded-full transition-colors whitespace-nowrap ${luxuryCategoryFilter === 'vehicle' ? 'bg-amber-500 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`, children: "Fahrzeuge" }), _jsx("button", { onClick: () => setLuxuryCategoryFilter('art'), className: `px-4 py-1.5 text-sm font-bold rounded-full transition-colors whitespace-nowrap ${luxuryCategoryFilter === 'art' ? 'bg-amber-500 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`, children: "Kunst" }), _jsx("button", { onClick: () => setLuxuryCategoryFilter('transport'), className: `px-4 py-1.5 text-sm font-bold rounded-full transition-colors whitespace-nowrap ${luxuryCategoryFilter === 'transport' ? 'bg-amber-500 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`, children: "Transport" })] }), _jsxs("div", { className: "flex-grow bg-gray-800/50 rounded-lg border border-gray-700 flex flex-col overflow-hidden", children: [_jsx("div", { className: "p-4 border-b border-gray-700 flex-shrink-0", children: _jsx("h4", { className: "text-lg font-bold text-gray-400", children: t.privatelife.assets.tabs.luxury }) }), _jsx("div", { className: "overflow-y-auto p-4 custom-scrollbar", children: _jsx("div", { className: "grid grid-cols-1 gap-2", children: filteredLuxuryGoods.map(good => {
                                                const isOwned = playerData.ownedLuxuryGoods.includes(good.id);
                                                const transName = t.privatelife.luxury[good.id]?.name || good.name;
                                                const transDesc = t.privatelife.luxury[good.id]?.description || good.description;
                                                return (_jsxs("div", { onClick: () => setSelectedLuxuryGood(good), className: "flex items-center p-3 rounded bg-gray-900/60 hover:bg-gray-700 cursor-pointer transition-colors border border-transparent hover:border-gray-600 group", children: [_jsx("div", { className: "w-24 h-16 mr-4 rounded overflow-hidden flex-shrink-0 relative bg-black/40", children: _jsx("img", { src: LUXURY_IMAGES[good.id] || './images/luxury_placeholder.png', className: "w-full h-full object-cover", alt: transName, onError: (e) => { e.target.src = 'https://via.placeholder.com/150?text=Luxus'; } }) }), _jsxs("div", { className: "flex-grow min-w-0", children: [_jsxs("div", { className: "flex justify-between items-baseline mb-1", children: [_jsx("h5", { className: "font-bold text-white group-hover:text-amber-300 transition-colors truncate", children: transName }), _jsx("span", { className: `text-xs font-bold uppercase tracking-wider ${isOwned ? 'text-green-400' : 'text-amber-400'}`, children: isOwned ? t.privatelife.assets.status.bought : t.privatelife.assets.action.buy })] }), _jsxs("div", { className: "flex justify-between text-xs text-gray-400", children: [_jsx("span", { className: "truncate pr-4", children: transDesc }), _jsx("span", { className: "font-mono text-white whitespace-nowrap", children: isOwned ? t.privatelife.assets.status.bought : formatCurrency(good.cost) })] })] })] }, good.id));
                                            }) }) })] })] }))] }), selectedProperty && (_jsx(PropertyModal, { property: selectedProperty, onClose: () => setSelectedProperty(null), onAction: handleAction, playerData: playerData, allProperties: ALL_PROPERTIES, onSwitch: setSelectedProperty, t: t })), selectedLuxuryGood && (_jsx(LuxuryModal, { good: selectedLuxuryGood, onClose: () => setSelectedLuxuryGood(null), onBuy: handleBuyLuxuryGood, playerData: playerData, allGoods: filteredLuxuryGoods, onSwitch: setSelectedLuxuryGood, t: t, skillNameMap: skillNameMap }))] }));
};
