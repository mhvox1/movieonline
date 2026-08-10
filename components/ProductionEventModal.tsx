
import React from 'react';
import { ProductionEvent, ProductionEventChoice } from '../types';
import { useGame } from '../contexts/GameContext';
import { getTalentPortraitUrl } from './TalentDossierModal';
import DirectorIcon from './icons/DirectorIcon';
import ActorIcon from './icons/ActorIcon';
import { useTranslation } from '../hooks/useTranslation';

interface ProductionEventModalProps {
  event: ProductionEvent;
  onClose: (choice: ProductionEventChoice) => void;
  resolvedEffects?: Record<string, { cost?: number; duration?: number; quality?: number; hype?: number; reputation?: number }>;
}

const ProductionEventModal: React.FC<ProductionEventModalProps> = ({ event, onClose, resolvedEffects }) => {
  const { playerData } = useGame();
  const { t, language } = useTranslation();
  
  const locale = language === 'de' ? 'de-DE' : 'en-US';
  
  const talent = event.talentId && playerData
    ? [...playerData.directors, ...playerData.actors].find(t => t.id === event.talentId)
    : null;

  const portraitUrl = talent && playerData ? getTalentPortraitUrl(talent, playerData.gameDate) : null;

  // Translation Logic
  const translatedEvent = t.productionEvents[event.id];
  const displayTitle = translatedEvent?.title || (language === 'de' ? event.title : 'Production Event');
  const rawText = translatedEvent?.text || (language === 'de' ? event.text : '');
  const displayText = talent ? rawText.replace(/{talentName}/g, talent.name) : rawText;

  const generateTooltipText = (choiceValue: string, effect: ProductionEventChoice['effect']): string => {
    const resolved = resolvedEffects ? resolvedEffects[choiceValue] : null;
    const parts: string[] = [];
    
    const txt = t.productionEvents.effects || {
        quality: 'Quality',
        hype: 'Hype',
        reputation: 'Reputation',
        duration: 'Duration',
        cost: 'Cost',
        days: 'days'
    };
    
    // Use resolved values if available, otherwise fall back to definitions (or defaults)
    const quality = resolved?.quality ?? effect.qualityModifier;
    const hype = resolved?.hype ?? effect.hypeModifier;
    const reputation = resolved?.reputation ?? effect.reputationModifier;
    const duration = resolved?.duration ?? effect.durationModifier;
    const cost = resolved?.cost ?? effect.costModifier;

    if (quality) {
      parts.push(quality > 0 ? `${txt.quality} +${quality}` : `${txt.quality} ${quality}`);
    }
    if (hype) {
        parts.push(`${txt.hype}: ${hype > 0 ? '+' : ''}${hype}`);
    }
    if (reputation) {
      parts.push(reputation > 0 ? `${txt.reputation} +${reputation}` : `${txt.reputation} ${reputation}`);
    }
    if (duration) {
      parts.push(`${txt.duration}: ${duration > 0 ? '+' : ''}${duration} ${txt.days}`);
    }
    if (cost) {
        const formattedCost = new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(Math.abs(cost));
        parts.push(`${txt.cost}: ${cost > 0 ? '+' : '-'}${formattedCost}`);
    }
    
    if (parts.length === 0) return "";
    return parts.join(' | ');
  };

  return (
    <div
      className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-gray-800 bg-opacity-95 border border-amber-500 rounded-lg shadow-2xl w-full max-w-2xl p-8"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-3xl font-bold font-cinzel text-amber-400 mb-6 text-center">{displayTitle}</h2>
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Talent-Portrait entfernt, kein Cover mehr unten anzeigen */}
          
          <div className="flex-grow text-center md:text-left w-full">
            <p className="text-gray-300 text-lg mb-6 whitespace-pre-wrap">{displayText}</p>
            <div className="mt-6 flex flex-col gap-4 w-full">
              {event.actions.map(action => {
                  const effectText = generateTooltipText(action.value, action.effect);
                  // Get translated button label
                  const buttonLabel = translatedEvent?.actions?.[action.value] || (language === 'de' ? action.text : action.value);

                  return (
                    <div key={action.value} className="relative group w-full">
                        <button
                          onClick={() => onClose(action)}
                          className={`${action.className || "bg-amber-500 text-gray-900 font-bold py-3 px-6 rounded-sm uppercase tracking-wider transform hover:bg-amber-400 transition-all duration-300 ease-in-out shadow-lg shadow-amber-500/20"} w-full flex items-center justify-center`}
                        >
                          {buttonLabel}
                        </button>
                        
                        {/* Tooltip */}
                        {effectText && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-2 bg-gray-900 border border-gray-600 text-white text-xs font-medium rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                                {effectText}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
                            </div>
                        )}
                    </div>
                  );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionEventModal;