import React from 'react';
import { useGame } from '../../../contexts/GameContext';

const CompetitionTab: React.FC = () => {
    const { playerData } = useGame();

    if (!playerData) return null;

    return (
        <div>
            <h2 className="text-4xl font-bold text-center mb-8 font-cinzel text-amber-400">Konkurrenz-Übersicht</h2>
            <div className="space-y-4">
                {playerData.competitors.map(studio => (
                    <div key={studio.id} className="bg-gray-800/80 p-4 rounded-lg border border-gray-700">
                        <h3 className="font-bold text-xl text-white">{studio.name}</h3>
                        <div className="mt-2 text-sm">
                            <span className="text-gray-400">Aktuelle Aktivität: </span>
                            {studio.currentActivity.type === 'producing' && `Produziert "${studio.currentActivity.filmTitle}" (fertig am ${new Date(studio.currentActivity.endDate).toLocaleDateString('de-DE')})`}
                            {studio.currentActivity.type === 'break' && `Macht eine Pause (bis ${new Date(studio.currentActivity.endDate).toLocaleDateString('de-DE')})`}
                            {studio.currentActivity.type === 'pending_release' && `Film "${studio.currentActivity.filmTitle}" ist fertiggestellt`}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CompetitionTab;
