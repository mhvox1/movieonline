
import React from 'react';
import { RandomEvent } from '../types';
import HeartIcon from './icons/HeartIcon';
import TrashIcon from './icons/TrashIcon'; // Using TrashIcon as a symbol for breakup/end

interface RandomEventModalProps {
  event: RandomEvent;
  deltas?: {
    capitalChange: number;
    reputationChange: number;
    researchPointsChange: number;
  };
  onClose: (actionValue?: string) => void;
}

const RandomEventModal: React.FC<RandomEventModalProps> = ({ event, deltas, onClose }) => {
  const formatCurrency = (val: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val);

  const hasEffects = deltas && (deltas.capitalChange !== 0 || deltas.reputationChange !== 0 || deltas.researchPointsChange !== 0);

  // Check for custom portraits (e.g. Wedding)
  const hasWeddingPortraits = event.customVariables && event.customVariables.playerPortraitUrl && event.customVariables.partnerPortraitUrl;
  const playerPortrait = event.customVariables?.playerPortraitUrl as string;
  const partnerPortrait = event.customVariables?.partnerPortraitUrl as string;

  // Check for Breakup Portrait
  const breakupPortrait = event.customVariables?.breakupPortraitUrl as string;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      onClick={() => !event.actions && onClose()}
    >
      {/* Background Handling */}
      {event.backgroundImage ? (
          <div className="absolute inset-0 z-0">
              <img src={event.backgroundImage} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          </div>
      ) : (
          <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-0"></div>
      )}

      <div 
        className="relative z-10 bg-gray-800 bg-opacity-95 border border-amber-500 rounded-lg shadow-2xl w-full max-w-xl p-8 text-center"
        onClick={e => e.stopPropagation()}
      >
        {hasWeddingPortraits && (
            <div className="flex justify-center items-center gap-6 mb-6">
                 <div className="w-36 h-36 rounded-full border-4 border-amber-500 overflow-hidden shadow-lg bg-gray-700">
                    <img src={playerPortrait} alt="Player" className="w-full h-full object-cover" />
                 </div>
                 <HeartIcon className="w-12 h-12 text-rose-500 animate-pulse" filled={true} />
                 <div className="w-36 h-36 rounded-full border-4 border-pink-500 overflow-hidden shadow-lg bg-gray-700">
                    <img src={partnerPortrait} alt="Partner" className="w-full h-full object-cover" />
                 </div>
            </div>
        )}

        {breakupPortrait && (
             <div className="flex justify-center items-center mb-6 relative">
                <div className="w-32 h-32 rounded-full border-4 border-red-500 overflow-hidden shadow-lg bg-gray-700 grayscale">
                   <img src={breakupPortrait} alt="Ex-Partner" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-2 bg-red-900 text-white text-xs px-2 py-1 rounded border border-red-500 font-bold">
                    Ex-Partner
                </div>
           </div>
        )}

        <h2 className="text-3xl font-bold font-cinzel text-amber-400 mb-4">{event.title}</h2>
        <p className="text-gray-300 text-lg mb-6 whitespace-pre-wrap">{event.text}</p>
        
        {hasEffects && (
            <div className="my-6 py-4 border-t border-b border-gray-600 space-y-2 text-lg">
                <p className="font-bold text-amber-300 uppercase text-sm tracking-wider">Auswirkungen:</p>
                {deltas.capitalChange !== 0 && (
                    <p className={`font-semibold ${deltas.capitalChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        Kapital: {deltas.capitalChange > 0 ? '+' : ''}{formatCurrency(deltas.capitalChange)}
                    </p>
                )}
                {deltas.reputationChange !== 0 && (
                     <p className={`font-semibold ${deltas.reputationChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        Ruf: {deltas.reputationChange > 0 ? '+' : ''}{deltas.reputationChange} Punkte
                    </p>
                )}
                 {deltas.researchPointsChange !== 0 && (
                     <p className={`font-semibold ${deltas.researchPointsChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        Forschungsfortschritt: {deltas.researchPointsChange > 0 ? '+' : ''}{deltas.researchPointsChange} FP
                    </p>
                )}
            </div>
        )}

        <div className="mt-6 flex justify-center gap-4">
            {event.actions ? (
                event.actions.map(action => (
                    <div key={action.value} className="relative group">
                        <button
                            onClick={() => onClose(action.value)}
                            className={action.className || "bg-amber-500 text-gray-900 font-bold py-3 px-12 rounded-sm uppercase tracking-wider transform hover:bg-amber-400 transition-all duration-300 ease-in-out shadow-lg shadow-amber-500/20"}
                        >
                            {action.text}
                        </button>
                        {/* Tooltip */}
                        {action.tooltip && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-1.5 bg-black/90 text-white text-xs rounded border border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
                                {action.tooltip}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-black/90"></div>
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <button
                onClick={() => onClose()}
                className="bg-amber-500 text-gray-900 font-bold py-3 px-12 rounded-sm uppercase tracking-wider transform hover:bg-amber-400 transition-all duration-300 ease-in-out shadow-lg shadow-amber-500/20"
                >
                OK
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default RandomEventModal;
