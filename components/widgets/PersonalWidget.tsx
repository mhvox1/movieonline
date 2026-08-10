
import React, { useMemo } from 'react';
import DashboardWidget from '../DashboardWidget';
import { useGame } from '../../contexts/GameContext';
import { useTranslation } from '../../hooks/useTranslation';
import { ALL_PROPERTIES } from '../privateLifeData';
import StarRating from '../StarRating';

interface PersonalWidgetProps {
    onClick: () => void;
}

// Helper to calculate portrait URL based on age
const getPlayerPortraitUrl = (baseId: string | undefined | null, birthDate: Date, gameDate: Date): string | null => {
    if (!baseId) return null;
    
    // Support for custom uploaded images (Base64 Data URLs)
    if (baseId.startsWith('data:image')) {
        return baseId;
    }
    
    const birth = new Date(birthDate);
    const today = new Date(gameDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    let ageSuffix: 'k' | 'j' | 'm' | 'a';
    if (age <= 15) {
        ageSuffix = 'k';
    } else if (age >= 16 && age <= 34) {
        ageSuffix = 'j';
    } else if (age >= 35 && age <= 59) {
        ageSuffix = 'm';
    } else { // age >= 60
        ageSuffix = 'a';
    }
    
    return `https://www.schnoxcore.com/media/portraits/${baseId}${ageSuffix}.png`;
};

const PersonalWidget: React.FC<PersonalWidgetProps> = ({ onClick }) => {
    const { playerData } = useGame();
    const { t } = useTranslation();
    
    if (!playerData) return null;

    const energy = playerData.energy !== undefined ? playerData.energy : 100;

    // Determine energy color
    let energyBarColor = "bg-yellow-500";
    if (energy >= 80) {
        energyBarColor = "bg-green-500";
    } else if (energy < 30) {
        energyBarColor = "bg-red-500";
    }
    
    const playerPortraitUrl = getPlayerPortraitUrl(playerData.playerPortraitId, playerData.playerBirthDate, playerData.gameDate);

    const statusKeyMap: Record<string, string> = {
        'Single': 'Single',
        'Bekanntschaft': 'Acquaintance',
        'In einer Beziehung': 'Dating',
        'Verlobt': 'Engaged',
        'Verheiratet': 'Married',
        'Geschieden': 'Divorced',
        'Verwitwet': 'Widowed'
    };
    const maritalStatusKey = statusKeyMap[playerData.maritalStatus] || 'Single';
    const maritalStatusLabel = t.privatelife.family.status[maritalStatusKey] || playerData.maritalStatus;

    // Circular progress bar constants
    const size = 96; // Corresponds to w-24, h-24
    const strokeWidth = 6;
    const center = size / 2;
    const radius = center - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    const energyOffset = circumference - (energy / 100) * circumference;

    return (
        <div onClick={onClick} className="cursor-pointer group">
            <DashboardWidget title={t.privatelife.overview.personal}>
                <div className="flex flex-col gap-4">
                    {/* Header: Avatar with circular vitality, Name, Status, Reputation */}
                    <div className="flex items-center gap-4">
                        <div className="relative w-24 h-24 flex-shrink-0" title={`${t.privatelife.overview.vitality}: ${Math.round(energy)}%`}>
                            <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
                                <circle
                                    className="text-gray-700"
                                    stroke="currentColor"
                                    strokeWidth={strokeWidth}
                                    fill="transparent"
                                    r={radius}
                                    cx={center}
                                    cy={center}
                                />
                                <circle
                                    className={energyBarColor.replace('bg-', 'text-')}
                                    stroke="currentColor"
                                    strokeWidth={strokeWidth}
                                    strokeDasharray={circumference}
                                    strokeDashoffset={energyOffset}
                                    strokeLinecap="round"
                                    fill="transparent"
                                    r={radius}
                                    cx={center}
                                    cy={center}
                                    style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                                />
                            </svg>
                            <div className="absolute inset-0 p-1.5 rounded-full">
                                <div className="w-full h-full bg-gray-700 rounded-full flex items-center justify-center border-2 border-gray-900 shadow-inner overflow-hidden">
                                    {playerPortraitUrl ? (
                                        <img src={playerPortraitUrl} alt={t.privatelife.overview.personal} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl">{playerData.gender === 'weiblich' ? '♀' : '♂'}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="min-w-0 flex-grow">
                            <p className="text-xl font-bold text-white truncate group-hover:text-amber-300 transition-colors">{playerData.playerName}</p>
                            <p className="text-gray-400 text-sm truncate mt-1">
                                {t.privatelife.overview.status}: <span className="text-amber-300">{maritalStatusLabel}</span>
                            </p>
                            <div className="flex justify-between items-center mt-3 text-sm">
                                <span className="text-gray-400">{t.privatelife.overview.reputation}:</span>
                                <StarRating rating={playerData.personalReputation} />
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardWidget>
        </div>
    );
};

export default PersonalWidget;
