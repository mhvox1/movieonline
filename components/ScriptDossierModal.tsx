
import React, { useState } from 'react';
import { Script, ActorAge } from '../types';
import StarRating from './StarRating';
import DrehbuchIcon from './icons/DrehbuchIcon';
import { useTranslation } from '../hooks/useTranslation';
import { TranslationType } from '../translations/types';
import { getTranslatedScriptTitle, getTranslatedScriptDescription } from './scriptGenerator';

interface ScriptDossierModalProps {
  script: Script;
  onClose: () => void;
  onBuy: (script: Script) => void;
  playerCapital: number;
  isTestMode: boolean;
}

const getAgeString = (gender: 'männlich' | 'weiblich', age: ActorAge, t: TranslationType): string => {
    const genderKey = gender === 'männlich' ? 'male' : 'female';
    let ageKey: keyof typeof t.actorAge;

    switch(age) {
      case ActorAge.Child: ageKey = 'child'; break;
      case ActorAge.Young: ageKey = 'young'; break;
      case ActorAge.MiddleAged: ageKey = 'middleAged'; break;
      case ActorAge.Old: ageKey = 'old'; break;
      default: ageKey = 'middleAged';
    }

    return `${t.newGame[genderKey]}, ${t.actorAge[ageKey]}`;
};

const ScriptDossierModal: React.FC<ScriptDossierModalProps> = ({ script, onClose, onBuy, playerCapital, isTestMode }) => {
  const [showBuyConfirm, setShowBuyConfirm] = useState(false);
  const { t, language } = useTranslation();
  const locale = language === 'de' ? 'de-DE' : 'en-US';
  
  const formatCurrency = (value: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

  const canAfford = playerCapital >= (script.price || 0) || isTestMode;

  const handleConfirmBuy = () => {
    onBuy(script);
    setShowBuyConfirm(false);
  }

  const displayTitle = getTranslatedScriptTitle(script, t);
  const displayDescription = getTranslatedScriptDescription(script, t);
  const genreLabel = t.genres[script.genre] || script.genre;

  return (
    <>
      <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="relative bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-2xl text-white animate-fade-in flex flex-col" onClick={e => e.stopPropagation()}>
          
          {/* Header */}
          <div className="bg-gray-900/50 p-6 border-b border-gray-700 text-center">
            <DrehbuchIcon className="h-16 w-16 text-amber-300 mx-auto mb-4 bg-gray-400" />
            <h2 className="text-3xl font-bold font-cinzel text-amber-400">{displayTitle}</h2>
            <p className="text-lg text-gray-400">{genreLabel}</p>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4 flex-grow">
            <div className="bg-gray-900/50 p-4 rounded-md border border-gray-700">
              <h3 className="font-bold text-amber-300 mb-2">{t.scriptDossier.plot}</h3>
              <p className="text-sm text-gray-300 italic h-24 overflow-y-auto pr-2">"{displayDescription}"</p>
            </div>

            {(script.mainRole || script.supportingRole) && (
                <div className="bg-gray-900/50 p-4 rounded-md border border-gray-700">
                    <h3 className="font-bold text-amber-300 mb-2">{t.scriptDossier.castSuggestions}</h3>
                    <div className="text-sm space-y-1">
                        {script.mainRole && (
                            <div className="flex justify-between">
                                <span className="text-gray-400">{t.scriptDossier.mainRole}:</span>
                                <span className="font-semibold text-white">{getAgeString(script.mainRole.gender, script.mainRole.age, t)}</span>
                            </div>
                        )}
                        {script.supportingRole && (
                            <div className="flex justify-between">
                                <span className="text-gray-400">{t.scriptDossier.supportingRole}:</span>
                                <span className="font-semibold text-white">{getAgeString(script.supportingRole.gender, script.supportingRole.age, t)}</span>
                            </div>
                        )}
                    </div>
                </div>
              )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900/50 p-4 rounded-md border border-gray-700 text-center">
                <p className="text-sm text-gray-400">{t.scriptDossier.quality}</p>
                <div className="flex justify-center mt-1">
                  <StarRating rating={script.quality} size="md" isTestMode={isTestMode} />
                </div>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-md border border-gray-700 text-center">
                <p className="text-sm text-gray-400">{t.scriptDossier.price}</p>
                <p className="text-2xl font-bold text-amber-400">{formatCurrency(script.price || 0)}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-700 flex justify-end gap-4">
            <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider transition-colors">
              {t.common.close}
            </button>
            <button 
              onClick={() => setShowBuyConfirm(true)}
              disabled={!canAfford}
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {t.scriptDossier.buy}
            </button>
          </div>
        </div>
      </div>
      {showBuyConfirm && (
        <div className="absolute inset-0 bg-black bg-opacity-80 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-amber-500 rounded-lg shadow-2xl w-full max-w-lg p-8 text-center">
                <h2 className="text-3xl font-bold font-cinzel text-amber-400 mb-4">{t.scriptDossier.buyConfirmTitle}</h2>
                <p className="text-gray-300 text-lg mb-6">
                    {t.scriptDossier.buyConfirmText.replace('{title}', displayTitle).replace('{price}', formatCurrency(script.price || 0))}
                </p>
                <div className="flex justify-center gap-4">
                    <button onClick={() => setShowBuyConfirm(false)} className="bg-gray-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all">{t.common.cancel}</button>
                    <button onClick={handleConfirmBuy} className="bg-green-600 text-white font-bold py-2 px-8 rounded-sm uppercase tracking-wider hover:bg-green-500 transition-all">{t.common.confirm}</button>
                </div>
            </div>
        </div>
      )}
    </>
  );
};

export default ScriptDossierModal;
