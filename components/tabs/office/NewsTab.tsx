
import React, { useMemo } from 'react';
import { useGame } from '../../../contexts/GameContext';
import { useTranslation } from '../../../hooks/useTranslation';

const NewsTab: React.FC = () => {
    const { playerData } = useGame();
    const { t, language } = useTranslation();
    const locale = language === 'de' ? 'de-DE' : 'en-US';

    if (!playerData) return null;

    const sortedEvents = useMemo(() => {
        if (!playerData.eventLog) return [];
        // Filter out 'Studio' events and sort by date, newest first
        return [...playerData.eventLog]
            .filter(event => event.category !== 'Studio')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [playerData.eventLog]);

    return (
        <div className="bg-gray-900/80 p-6 rounded-lg border border-gray-700 h-full flex flex-col">
            <h2 className="text-4xl font-bold text-center mb-8 font-cinzel text-amber-400">{t.office.news.title}</h2>
            <div className="flex-grow overflow-y-auto pr-4 space-y-4">
                {sortedEvents.length > 0 ? (
                    sortedEvents.map((event, index) => (
                        <div key={index} className="bg-gray-800/80 p-4 rounded-lg border border-gray-700">
                            <div className="flex justify-between items-baseline mb-2">
                                <h3 className="font-bold text-lg text-amber-400">{event.title}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-400 font-mono">
                                        {new Date(event.date).toLocaleDateString(locale)}
                                    </span>
                                </div>
                            </div>
                            <p className="text-gray-300 text-sm whitespace-pre-wrap">{event.text}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 italic py-16">{t.office.news.noEvents}</p>
                )}
            </div>
        </div>
    );
};

export default NewsTab;
