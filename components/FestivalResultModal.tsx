
import React, { useState, useEffect, useMemo } from 'react';
import { useGame } from '../contexts/GameContext';
import { getCoverPath } from './coverConfig';
import DirectorIcon from './icons/DirectorIcon';
import ActorIcon from './icons/ActorIcon';
import TrophyIcon from './icons/TrophyIcon';
import { festivalBackgroundImage } from './backgrounds/FestivalBackgroundImage';
import { AwardCategory, NomineeData, ProjectData } from '../types';
import { AwardKey } from './festivalData';
import { useTranslation } from '../hooks/useTranslation';

interface FestivalResultModalProps {
  results: {
    festivalId: string;
    festivalName: string;
    awards: AwardCategory[];
  };
  playerStudioName: string;
  onClose: () => void;
}

const getPositionClass = (pos: string | undefined) => {
    switch (pos) {
        case 'top': return 'justify-start pt-2';
        case 'top-center': return 'justify-start pt-[25%]';
        case 'center': return 'justify-center';
        case 'bottom-center': return 'justify-end pb-[25%]';
        case 'bottom': return 'justify-end pb-2';
        default: return 'justify-end pb-2';
    }
};

const MoviePosterWithOverlay: React.FC<{ film: ProjectData; title: string; isWinner: boolean; forceFontSize?: number }> = ({ film, title, isWinner, forceFontSize }) => {
    const { playerData } = useGame();
    if (!playerData) return null;

    const {
        coverImageId = 1,
        coverTitlePosition = 'bottom',
        coverTitleFontSize = 30,
        coverTitleFontFamily = 'Cinzel',
        coverTitleColor = '#FFFFFF',
        directorId,
        mainActorId
    } = film;

    // Helper to resolve name including family
    const resolveName = (id: number | undefined) => {
        if (id === undefined) return 'Unbekannt';
        if (id === -1) return playerData.playerName;
        if (id === 99901) return playerData.partnerName || 'Partner';
        if (id >= 99910) return playerData.children[id - 99910]?.name || 'Kind';
        
        const director = playerData.directors.find(d => d.id === id);
        if (director) return director.name;
        
        const actor = playerData.actors.find(a => a.id === id);
        if (actor) return actor.name;
        
        return 'Unbekannt';
    };

    const directorName = resolveName(directorId);
    const actorName = resolveName(mainActorId);

    const namesPositionClass = (coverTitlePosition === 'top' || coverTitlePosition === 'top-center' || coverTitlePosition === 'center') ? 'bottom-2' : 'top-2';
    const directorNameUpper = directorName.toUpperCase();
    const actorNameUpper = actorName.toUpperCase();
    const combinedLength = directorNameUpper.length + actorNameUpper.length;

    let nameFontSize = 9;
    if (combinedLength > 35) nameFontSize = 6;
    else if (combinedLength > 25) nameFontSize = 7;
    else if (combinedLength > 18) nameFontSize = 8;
    
    // Determine actual font size to use (proportional to cover width 224px relative to 300px standard)
    const displayFontSize = forceFontSize ? forceFontSize : (coverTitleFontSize || 30) * 0.747;

    return (
        <div className="relative w-full h-full bg-gray-800">
            <img 
                src={getCoverPath(film.genre, coverImageId)} 
                alt={title} 
                className="w-full h-full object-cover" 
            />
            {/* Title Overlay */}
            <div className={`absolute inset-0 flex flex-col pointer-events-none p-2 ${getPositionClass(coverTitlePosition)}`}>
                <h3 className="text-white text-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]"
                    style={{ 
                        fontFamily: coverTitleFontFamily, 
                        fontSize: `${displayFontSize}px`, 
                        lineHeight: 1.2, 
                        color: coverTitleColor 
                    }}>
                    {title}
                </h3>
            </div>
            {/* Cast Names Overlay */}
            <div 
                className={`absolute left-0 right-0 ${namesPositionClass} text-center drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)] px-1 pointer-events-none`}
                style={{
                    color: coverTitleColor,
                    fontSize: `${nameFontSize}px`,
                    lineHeight: '1.2'
                }}
            >
                <p>{directorNameUpper} <span className="mx-1">•</span> {actorNameUpper}</p>
            </div>
        </div>
    );
};

const NomineeCard: React.FC<{ nominee: NomineeData; category: string; isRevealed: boolean; isWinner: boolean; isLoser: boolean }> = ({ nominee, category, isRevealed, isWinner, isLoser }) => {
    const isFilmAward = category === 'best_film';
    const transitionClasses = 'transition-all duration-700 ease-in-out';
    
    // Unified Card Size for all categories in the main ceremony
    const cardWidth = 'w-56';
    const cardHeight = 'h-84';

    const cardContainerClasses = `relative ${cardWidth} ${cardHeight} rounded-lg overflow-hidden border-2 bg-gray-900 ${transitionClasses} ${isRevealed ? 'opacity-100 scale-100' : 'opacity-0 scale-90'} ${isWinner ? 'border-amber-400 shadow-2xl shadow-amber-400/50 scale-110 z-10' : 'border-gray-600'} ${isLoser ? 'opacity-40 scale-95 grayscale' : ''}`;

    let content;

    if (isFilmAward && nominee.film) {
        content = (
            <div className="flex flex-col h-full w-full">
                <MoviePosterWithOverlay film={nominee.film} title={nominee.filmTitle} isWinner={isWinner} />
            </div>
        );
    } else { // Talent Award
        content = (
            <div className="flex flex-col h-full">
                <div className="relative w-full h-64 bg-gray-800 flex-shrink-0">
                    {nominee.portraitUrl ? (
                        <img src={nominee.portraitUrl} alt={nominee.talentName} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            {category === 'best_director' ? <DirectorIcon className="w-24 h-24 text-gray-500 bg-gray-500" /> : <ActorIcon className="w-24 h-24 text-gray-500 bg-gray-500" />}
                        </div>
                    )}
                </div>
                <div className="flex-grow flex flex-col justify-center p-3 text-center bg-gray-900 border-t border-gray-800">
                    <p className={`font-bold truncate text-lg ${isWinner ? 'text-amber-300' : 'text-white'}`}>{nominee.talentName}</p>
                    <p className="text-sm text-gray-400 truncate mt-1 italic">"{nominee.filmTitle}"</p>
                </div>
            </div>
        );
    }

    return (
        <div className="className={cardContainerClasses}">
            <div className={cardContainerClasses}>
            {content}
            {isWinner && (
                <div className="absolute top-2 right-2 bg-amber-400 p-2 rounded-full shadow-lg z-20">
                    <TrophyIcon className="w-6 h-6 text-black" />
                </div>
            )}
            </div>
        </div>
    );
};

const FestivalResultModal: React.FC<FestivalResultModalProps> = ({ results, playerStudioName, onClose }) => {
    const { playerData } = useGame();
    const { t } = useTranslation();
    const [phase, setPhase] = useState<'welcome' | 'announce' | 'nominees' | 'winner' | 'summary'>('welcome');
    const [currentAwardIndex, setCurrentAwardIndex] = useState(0);
    const [revealedNominees, setRevealedNominees] = useState(0);
    const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const awardYear = playerData ? playerData.gameDate.getFullYear() - 1 : 1990;

    const openingText = useMemo(() => {
        const texts = t.marketing.festivals.ceremonyOpenings;
        // Fallback to single string if array is not available or empty (e.g. older translation file)
        if (!texts || !Array.isArray(texts) || texts.length === 0) {
             return t.marketing.festivals.ceremonyBegins || "Die Zeremonie beginnt...";
        }
        
        // Pick random text based on year to be consistent during a single ceremony but different each year
        // We use Math.random() here seeded by year is tricky in JS without lib, 
        // so we just pick random which is fine as this component mounts only once per event
        const randomIndex = Math.floor(Math.random() * texts.length);
        return texts[randomIndex].replace('{year}', awardYear.toString());
    }, [t, awardYear]);


    const sortedAwards = useMemo(() => {
        const order: AwardKey[] = ['best_director', 'best_actor', 'best_film'];
        return [...results.awards].sort((a, b) => {
            const indexA = order.indexOf(a.category as AwardKey);
            const indexB = order.indexOf(b.category as AwardKey);
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
    }, [results.awards]);

    const currentAward = sortedAwards[currentAwardIndex];

    useEffect(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        if (phase === 'announce') {
            timerRef.current = setTimeout(() => setPhase('nominees'), 2500);
        } else if (phase === 'nominees') {
            if (revealedNominees < (currentAward?.nominees.length || 0)) {
                timerRef.current = setTimeout(() => setRevealedNominees(prev => prev + 1), 1500);
            } else {
                timerRef.current = setTimeout(() => setPhase('winner'), 2000);
            }
        } else if (phase === 'winner') {
            timerRef.current = setTimeout(() => {
                if (currentAwardIndex < sortedAwards.length - 1) {
                    setCurrentAwardIndex(prev => prev + 1);
                    setRevealedNominees(0);
                    setPhase('announce');
                } else {
                    setPhase('summary');
                }
            }, 6000);
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [phase, revealedNominees, currentAwardIndex, sortedAwards, currentAward]);

    const startCeremony = () => {
        setPhase('announce');
    };
    
    const handleSkip = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        setPhase('summary');
    };

    const renderContent = () => {
        const windowClasses = "bg-gray-900/95 border-2 border-amber-500/80 p-8 rounded-xl shadow-[0_0_50px_rgba(245,158,11,0.3)] backdrop-blur-md";

        switch (phase) {
            case 'welcome':
                return (
                    <div className={`${windowClasses} text-center max-w-2xl animate-fade-in`}>
                        <TrophyIcon className="w-24 h-24 mx-auto text-amber-400 drop-shadow-lg" />
                        <h2 className="text-5xl font-cinzel text-white mt-4 text-shadow-lg">{results.festivalName}</h2>
                        <p className="text-gray-300 mt-4 text-lg italic leading-relaxed">
                            "{openingText}"
                        </p>
                        <button onClick={startCeremony} className="mt-8 bg-amber-500 text-gray-900 font-bold py-3 px-12 rounded-sm uppercase tracking-wider hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20">
                            {t.marketing.festivals.startCeremony}
                        </button>
                    </div>
                );
            case 'announce':
                return (
                    <div className={`${windowClasses} text-center min-w-[600px] py-16 animate-fade-in`}>
                        <h3 className="text-xl text-gray-300 font-serif italic">{t.marketing.festivals.andTheAwardFor}</h3>
                        <div className="my-6 py-2 border-t border-b border-gray-700">
                            <h2 className="text-5xl font-cinzel text-amber-400 animate-pulse tracking-wide">{t.marketing.awardCategories[currentAward.category as AwardKey]}</h2>
                        </div>
                        <h3 className="text-xl text-gray-300 font-serif italic">{t.marketing.festivals.goesTo}</h3>
                    </div>
                );
            case 'nominees':
            case 'winner':
                 return (
                    <div className={`${windowClasses} text-center w-full max-w-6xl`}>
                        <h2 className="text-4xl font-cinzel text-amber-400 mb-8 border-b border-gray-700 pb-4 inline-block px-12">{t.marketing.awardCategories[currentAward.category as AwardKey]}</h2>
                        <div className="flex justify-center items-center gap-8 flex-wrap">
                            {currentAward.nominees.map((nominee, index) => {
                                const winnerIdentifier = currentAward.winnerIdentifier;
                                const isWinner = phase === 'winner' && (nominee.talentName === winnerIdentifier || nominee.filmTitle === winnerIdentifier);
                                
                                return (
                                    <NomineeCard
                                        key={index}
                                        nominee={nominee}
                                        category={currentAward.category}
                                        isRevealed={index < revealedNominees}
                                        isWinner={isWinner}
                                        isLoser={phase === 'winner' && !isWinner}
                                    />
                                );
                            })}
                        </div>
                        {phase === 'winner' && (
                             <div className="mt-12 text-center animate-bounce">
                                <p className="text-2xl text-white font-bold">
                                    {t.marketing.festivals.winner}: <span className="text-amber-400">{currentAward.winnerIdentifier}</span>
                                </p>
                             </div>
                        )}
                    </div>
                 );
            case 'summary':
                return (
                     <div className={`${windowClasses} text-center w-full max-w-5xl animate-fade-in flex flex-col max-h-[85vh]`}>
                        <h2 className="text-4xl font-cinzel text-white mb-6 border-b border-gray-700 pb-4">{t.marketing.festivals.winner}</h2>
                        <div className="overflow-y-auto pr-2 custom-scrollbar flex-grow">
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
                                {sortedAwards.map(award => {
                                    const winner = award.nominees.find(n => n.talentName === award.winnerIdentifier || n.filmTitle === award.winnerIdentifier);
                                    if (!winner || !playerData) return <div key={award.category} />;

                                    const isFilmAward = award.category === 'best_film';
                                    const filmData = winner.film;
                                    
                                    // Unified summary card size
                                    const sumCardWidth = 'w-48';
                                    const sumCardHeight = 'h-72';

                                    return (
                                        <div key={award.category} className="flex flex-col items-center">
                                            <h3 className="text-lg font-cinzel text-amber-300 mb-2 h-12 flex items-center justify-center">{t.marketing.awardCategories[award.category as AwardKey]}</h3>
                                            <div className={`relative ${sumCardWidth} ${sumCardHeight} rounded-lg overflow-hidden border-2 bg-gray-900 border-amber-400 shadow-lg shadow-amber-500/30 flex flex-col`}>
                                                {isFilmAward ? (
                                                    filmData ? (
                                                        <MoviePosterWithOverlay 
                                                            film={filmData} 
                                                            title={winner.filmTitle} 
                                                            isWinner={true}
                                                            forceFontSize={14} // Fixed font size for summary
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-gray-800">
                                                            <TrophyIcon className="w-12 h-12 text-gray-500 mb-2" />
                                                            <p className="text-white text-xs">{winner.filmTitle}</p>
                                                        </div>
                                                    )
                                                ) : (
                                                    <>
                                                        <div className="relative w-full h-52 bg-gray-800 flex-shrink-0">
                                                            {winner.portraitUrl ? (
                                                                <img src={winner.portraitUrl} alt={winner.talentName} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                                                    {award.category === 'best_director' ? <DirectorIcon className="w-20 h-20 text-gray-500 bg-gray-500"/> : <ActorIcon className="w-20 h-20 text-gray-500 bg-gray-500"/>}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-grow flex flex-col justify-center p-2 text-center bg-gray-900 text-xs border-t border-gray-800">
                                                            <p className="font-bold text-amber-300 truncate text-sm">{winner.talentName}</p>
                                                            <p className="text-gray-400 truncate mt-1 italic" title={winner.filmTitle}>"{winner.filmTitle}"</p>
                                                        </div>
                                                    </>
                                                )}
                                                <div className="absolute top-1 right-1 bg-amber-400 p-1 rounded-full shadow z-10 scale-75">
                                                    <TrophyIcon className="w-4 h-4 text-black" />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-700">
                            <button onClick={onClose} className="bg-gray-600 text-white font-bold py-3 px-12 rounded-sm uppercase tracking-wider hover:bg-gray-500 transition-all shadow-lg">
                                {t.common.close}
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-none flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{ backgroundImage: `url(${festivalBackgroundImage})` }}
            />
            
            <div className="relative w-full h-full flex items-center justify-center z-10">
                 {renderContent()}
            </div>

            {(phase === 'announce' || phase === 'nominees' || phase === 'winner') && (
                <button
                    onClick={handleSkip}
                    className="absolute bottom-8 right-8 bg-gray-900/80 text-white font-bold py-2 px-6 rounded-sm uppercase text-sm hover:bg-gray-800 transition-colors border border-gray-600 z-20"
                >
                    {t.marketing.festivals.skip}
                </button>
            )}
        </div>
    );
};

export default FestivalResultModal;
