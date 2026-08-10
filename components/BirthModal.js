import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { maleFirstNames, femaleFirstNames } from './privateLifeData';
import { useGame } from '../contexts/GameContext';
import { BABY_PORTRAITS, getGeneticChildPortrait } from './portraits';
import { birthBackgroundImage } from './backgrounds/BirthBackgroundImage';
import { useTranslation } from '../hooks/useTranslation';
const BirthModal = ({ data, onClose }) => {
    const { playerData, setPlayerData } = useGame();
    const { t } = useTranslation();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [portraitId, setPortraitId] = useState(null);
    const initializedRef = useRef(false);
    useEffect(() => {
        if (!playerData || initializedRef.current)
            return;
        // 1. Nachnamen ermitteln (vom Spieler)
        const currentLastName = playerData.playerName.split(' ').pop() || 'Springer';
        setLastName(currentLastName);
        // 2. Zufälligen Vornamen generieren
        if (data.gender === 'Junge') {
            const randomName = maleFirstNames[Math.floor(Math.random() * maleFirstNames.length)];
            setFirstName(randomName);
        }
        else {
            const randomName = femaleFirstNames[Math.floor(Math.random() * femaleFirstNames.length)];
            setFirstName(randomName);
        }
        // 3. Portrait generieren (Genetisch oder Zufall bei Adoption)
        let newPortraitId = "";
        if (data.isAdoption) {
            // Bei Adoption komplett zufällig aus dem Baby-Pool
            if (BABY_PORTRAITS && BABY_PORTRAITS.length > 0) {
                newPortraitId = BABY_PORTRAITS[Math.floor(Math.random() * BABY_PORTRAITS.length)];
            }
            else {
                // Fallback (sollte nicht passieren wenn portraits.ts korrekt ist)
                newPortraitId = "b1";
            }
        }
        else {
            // Genetisch basierend auf Eltern
            newPortraitId = getGeneticChildPortrait(playerData.playerPortraitId, playerData.partnerPortraitId);
        }
        setPortraitId(newPortraitId);
        initializedRef.current = true;
    }, [data, playerData]); // Reduced deps for safety, managed by ref
    const handleConfirmName = () => {
        if (!playerData || firstName.trim() === '')
            return;
        // Fallback if portrait didn't generate for some reason
        const finalPortraitId = portraitId || 'b1';
        // Vollen Namen zusammensetzen
        const fullName = `${firstName.trim()} ${lastName}`;
        const newChild = {
            id: `child_${Date.now()}`,
            name: fullName,
            gender: data.gender,
            birthDate: new Date(playerData.gameDate),
            relationship: 100, // Start with full relationship
            isAdopted: data.isAdoption,
            portraitId: finalPortraitId,
            skills: undefined // No skills at birth
        };
        setPlayerData(prev => {
            if (!prev)
                return null;
            return {
                ...prev,
                children: [...prev.children, newChild],
                partnerPregnancy: null,
                personalReputation: Math.min(100, prev.personalReputation + 10),
            };
        });
        onClose();
    };
    if (!playerData)
        return null;
    // Translation Logic
    const genderTerm = data.gender === 'Junge' ? t.privatelife.birthModal.boy : t.privatelife.birthModal.girl;
    const title = data.isAdoption ? t.privatelife.birthModal.titleAdoption : t.privatelife.birthModal.titleBirth;
    const rawText = data.isAdoption ? t.privatelife.birthModal.textAdoption : t.privatelife.birthModal.textBirth;
    const text = rawText.replace('{gender}', genderTerm);
    return (_jsxs("div", { className: "absolute inset-0 z-50 flex items-center justify-center p-4", children: [_jsx("div", { className: "absolute inset-0 bg-cover bg-center", style: { backgroundImage: `url(${birthBackgroundImage})` } }), _jsx("div", { className: "absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" }), _jsxs("div", { className: "relative z-10 bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center flex flex-col items-center animate-fade-in", children: [_jsx("h2", { className: "text-4xl font-bold font-cinzel text-amber-400 mb-4", children: title }), portraitId && (_jsx("div", { className: "w-48 h-48 bg-gray-700 rounded-full border-4 border-amber-400 overflow-hidden mb-4 shadow-lg flex-shrink-0", children: _jsx("img", { src: `./kinder/babys/${portraitId}.png`, alt: "Baby", className: "w-full h-full object-cover" }) })), _jsx("p", { className: "text-gray-300 text-lg mb-6", children: text }), _jsxs("div", { className: "my-4 w-full", children: [_jsx("label", { htmlFor: "childName", className: "block text-sm font-medium text-gray-300 mb-2", children: t.privatelife.birthModal.nameLabel }), _jsx("div", { className: "flex items-center justify-center gap-2 bg-gray-900/50 p-2 rounded-lg border border-gray-700", children: _jsx("input", { type: "text", id: "childName", value: firstName, onChange: (e) => setFirstName(e.target.value), className: "w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white text-center text-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition", placeholder: t.privatelife.birthModal.placeholder, autoFocus: true }) })] }), _jsx("button", { onClick: handleConfirmName, disabled: !firstName.trim(), className: "bg-amber-500 text-gray-900 font-bold py-3 px-12 rounded-sm uppercase tracking-wider transform hover:bg-amber-400 transition-all duration-300 ease-in-out shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed", children: t.privatelife.birthModal.welcomeButton })] })] }));
};
export default BirthModal;
