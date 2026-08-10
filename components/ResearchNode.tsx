
import React from 'react';
import { Technology } from '../types';
import DrehbuchIcon from './icons/DrehbuchIcon';
import ProduktionIcon from './icons/ProduktionIcon';
import FinanzenIcon from './icons/FinanzenIcon';
import OfficeIcon from './icons/OfficeIcon';
import NeuesProjektIcon from './icons/NeuesProjektIcon';
import KameraIcon from './icons/KameraIcon';
import SoundIcon from './icons/SoundIcon';
import LightIcon from './icons/LightIcon';
import SFXIcon from './icons/SFXIcon';
import AusstattungIcon from './icons/AusstattungIcon';
import LocationIcon from './icons/LocationIcon';
import MarketingIcon from './icons/MarketingIcon';
import StarIcon from './icons/StarIcon';
import CastingIcon from './icons/CastingIcon';
import TrophyIcon from './icons/TrophyIcon';
import ForschungIcon from './icons/ForschungIcon';
import { useTranslation } from '../hooks/useTranslation';

// Layout Constants exported for use in ResearchScreen (Connection Lines)
export const NODE_WIDTH = 220;
export const NODE_HEIGHT = 100;
export const GRID_GAP_X = 80;
export const GRID_GAP_Y = 40;
export const PADDING = 50;

// Helper for Icons based on category string
const TechIcon: React.FC<{ category?: string, className?: string }> = ({ category, className }) => {
    switch (category) {
        case 'film_reel': return <NeuesProjektIcon className={className} />;
        case 'script': return <DrehbuchIcon className={className} />;
        case 'casting': return <CastingIcon className={className} />;
        case 'theory': return <DrehbuchIcon className={className} />;
        
        // Genres
        case 'genre_action':
        case 'genre_adventure':
        case 'genre_western':
        case 'genre_scifi':
        case 'genre_fantasy':
        case 'genre_drama':
        case 'genre_romance':
        case 'genre_comedy':
        case 'genre_musical':
        case 'genre_horror':
        case 'genre_thriller':
        case 'genre_crime':
        case 'genre_documentary':
        case 'genre_war':
            return <TrophyIcon className={className} />;

        // Production
        case 'camera': return <KameraIcon className={className} />;
        case 'sound': return <SoundIcon className={className} />;
        case 'sfx': return <SFXIcon className={className} />;
        case 'crew': return <AusstattungIcon className={className} />;
        case 'postprod': return <ProduktionIcon className={className} />;
        case 'music': return <SoundIcon className={className} />;
        case 'location': return <LocationIcon className={className} />;
        case 'light': return <LightIcon className={className} />;

        // Marketing
        case 'ads': return <MarketingIcon className={className} />;
        case 'distribution': return <FinanzenIcon className={className} />;
        case 'merch': return <StarIcon className={className} />;

        // Management
        case 'building': return <OfficeIcon className={className} />;
        case 'efficiency': return <OfficeIcon className={className} />;
        case 'finance': return <FinanzenIcon className={className} />;
        
        default: return <ForschungIcon className={className} />;
    }
};

interface ResearchNodeProps {
    tech: Technology;
    status: 'locked' | 'available' | 'researched' | 'researching';
    onClick: () => void;
}

const ResearchNode: React.FC<ResearchNodeProps> = ({ tech, status, onClick }) => {
    const { t, language } = useTranslation();
    const x = (tech.position?.x || 0) * (NODE_WIDTH + GRID_GAP_X) + PADDING;
    const y = (tech.position?.y || 0) * (NODE_HEIGHT + GRID_GAP_Y) + PADDING;

    // Default style (Locked) - now clickable with visual feedback
    let bgClass = "bg-gray-800 border-gray-600 text-gray-500 cursor-pointer hover:bg-gray-750 hover:border-gray-500";
    let iconColor = "text-gray-600";
    let borderClass = "border-2";
    let pulseClass = "";

    if (status === 'available') {
        bgClass = "bg-gray-800 hover:bg-gray-700 cursor-pointer shadow-lg shadow-cyan-900/20";
        borderClass = "border-2 border-cyan-500";
        iconColor = "text-cyan-400";
    } else if (status === 'researched') {
        bgClass = "bg-green-900/30 cursor-pointer hover:bg-green-900/50";
        borderClass = "border-2 border-green-500";
        iconColor = "text-green-400";
    } else if (status === 'researching') {
        bgClass = "bg-amber-900/30 cursor-pointer hover:bg-amber-900/50";
        borderClass = "border-2 border-amber-500";
        iconColor = "text-amber-400";
        pulseClass = "animate-pulse";
    }

    return (
        <div
            onClick={onClick}
            className={`absolute rounded-lg p-3 flex flex-col justify-between transition-all duration-200 ${bgClass} ${borderClass} ${pulseClass}`}
            style={{
                width: NODE_WIDTH,
                height: NODE_HEIGHT,
                left: x,
                top: y,
                zIndex: 10
            }}
        >
            <div className="flex justify-between items-start">
                <h4 className={`text-sm font-bold leading-tight ${status === 'locked' ? 'text-gray-500' : 'text-white'}`}>
                    {t.research.techs[tech.id]?.name || tech.name}
                </h4>
                <TechIcon category={tech.category} className={`h-6 w-6 ${iconColor}`} />
            </div>
            
            <div className="mt-auto pt-2 border-t border-white/10 flex justify-between items-end text-xs">
                {status === 'researched' ? (
                    <span className="text-green-400 font-bold uppercase">{t.research.screen.modal.researched}</span>
                ) : status === 'researching' ? (
                    <span className="text-amber-400 font-bold uppercase">{t.research.screen.modal.researching}</span>
                ) : (
                    <>
                        <div className="flex flex-col">
                             <span className={status === 'available' ? 'text-cyan-300' : 'text-gray-600'}>{tech.cost} FP</span>
                             {tech.monetaryCost && <span className="text-[10px] text-gray-500">{new Intl.NumberFormat(language === 'de' ? 'de-DE' : 'en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(tech.monetaryCost)}</span>}
                        </div>
                        <span className="text-gray-500">{tech.duration} {t.research.screen.modal.days}</span>
                    </>
                )}
            </div>
        </div>
    );
};

export default ResearchNode;
