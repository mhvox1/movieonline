
import React, { useState, useMemo, useEffect } from 'react';
import { ProjectData, ProjectPhase, Genre, MovieSize, Era, MarketingTab } from '../../types';
import DashboardWidget from '../DashboardWidget';
import StarRating from '../StarRating';
import { useGame } from '../../contexts/GameContext';
import { MOVIE_SIZE_CONFIG } from '../constants';
import { useTranslation } from '../../hooks/useTranslation';

interface TestModeWidgetProps {
    isTestMode: boolean;
    onFilmCreated: (filmTitle: string) => void;
}

const TestModeWidget: React.FC<TestModeWidgetProps> = ({ isTestMode, onFilmCreated }) => {
    const { playerData, setPlayerData } = useGame();
    const { t } = useTranslation();
    const [testFilmQuality, setTestFilmQuality] = useState(75);
    const [testMovieSize, setTestMovieSize] = useState<MovieSize>(MovieSize.A);
    const [testGenre, setTestGenre] = useState<Genre>(Genre.Action);

    const maxQualityForSize = useMemo(() => MOVIE_SIZE_CONFIG[testMovieSize]?.qualityCap || 100, [testMovieSize]);

    useEffect(() => {
        if (testFilmQuality > maxQualityForSize) {
            setTestFilmQuality(maxQualityForSize);
        }
    }, [testMovieSize, maxQualityForSize, testFilmQuality]);

    const calculateTestCost = (quality: number) => {
        const costMap = [
            { q: 0, c: 50000 },     // Fallback für sehr niedrige Werte
            { q: 10, c: 200000 },
            { q: 20, c: 300000 },
            { q: 30, c: 500000 },
            { q: 40, c: 800000 },
            { q: 50, c: 2200000 },
            { q: 60, c: 5400000 },
            { q: 70, c: 10000000 },
            { q: 80, c: 20000000 },
            { q: 90, c: 50000000 },
            { q: 100, c: 100000000 },
        ];

        for (let i = 0; i < costMap.length - 1; i++) {
            if (quality >= costMap[i].q && quality <= costMap[i+1].q) {
                const lower = costMap[i];
                const upper = costMap[i+1];
                const range = upper.q - lower.q;
                const progress = (quality - lower.q) / range;
                return Math.round(lower.c + (upper.c - lower.c) * progress);
            }
        }
        return 100000000;
    };

    const handleCreateTestFilm = () => {
        if (!setPlayerData || !playerData) return;

        const testFilmRegex = /^Testfilm (\d+)$/;
        let maxTestFilmNum = 0;
        [...playerData.completedFilms, playerData.currentProject].forEach(film => {
            if(!film) return;
            const match = film.workingTitle.match(testFilmRegex);
            if (match && match[1]) {
                const num = parseInt(match[1], 10);
                if (num > maxTestFilmNum) maxTestFilmNum = num;
            }
        });

        const newTestFilmNum = maxTestFilmNum + 1;
        const newTitle = `Testfilm ${newTestFilmNum}`;

        const randomDirector = playerData.directors[Math.floor(Math.random() * playerData.directors.length)];
        const randomActor = playerData.actors[Math.floor(Math.random() * playerData.actors.length)];
        
        const movieSizeConfig = MOVIE_SIZE_CONFIG[testMovieSize];
        
        // Kostenberechnung basierend auf Qualität
        const totalCost = calculateTestCost(testFilmQuality);
        
        // Aufteilung der Kosten für die Statistik (ca. Werte)
        const scriptCost = Math.round(totalCost * 0.1);
        const castingCost = Math.round(totalCost * 0.2);
        const productionCost = Math.round(totalCost * 0.7);

        const newFilm: ProjectData = {
            workingTitle: newTitle,
            phase: ProjectPhase.Completed,
            finalQuality: testFilmQuality,
            genre: testGenre,
            era: Era.Present,
            directorId: randomDirector.id,
            mainActorId: randomActor.id,
            scriptBudget: scriptCost,
            scriptQuality: testFilmQuality,
            scriptStartDate: new Date(playerData.gameDate),
            scriptEndDate: new Date(playerData.gameDate),
            castingCost: castingCost,
            productionCost: productionCost,
            totalCost: totalCost,
            isArchived: false,
            movieSize: testMovieSize,
            movieSizeBudget: movieSizeConfig.budgetSteps[1],
            hype: 50, // Standard Hype for test films
            // WICHTIG: Setze das Datum für das nächste Angebot auf HEUTE, damit der OfferLoop sofort anspringt.
            nextOfferDate: new Date(playerData.gameDate),
        };

        setPlayerData(currentData => {
            if (!currentData) return null;
            return {
                ...currentData,
                completedFilms: [...currentData.completedFilms, newFilm],
            };
        });
        
        onFilmCreated(newTitle);
    };

    if (!isTestMode || !playerData) return null;
    
    const currentCost = calculateTestCost(testFilmQuality);
    const formatCurrency = (val: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);

    return (
        <DashboardWidget title="TEST MODUS: Film-Generator" className="mt-6 border-2 border-dashed border-red-500">
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label htmlFor="testQuality" className="block text-sm font-medium text-gray-300">Qualität</label>
                        <StarRating rating={testFilmQuality} isTestMode={true}/>
                    </div>
                    <input
                        type="range"
                        id="testQuality"
                        min="1"
                        max={maxQualityForSize}
                        value={testFilmQuality}
                        onChange={(e) => setTestFilmQuality(Number(e.target.value))}
                        className="w-full"
                    />
                    <p className="text-xs text-right text-gray-400 mt-1">Kosten: {formatCurrency(currentCost)}</p>
                </div>
                <div>
                    <label htmlFor="testGenre" className="block text-sm font-medium text-gray-300 mb-1">Genre</label>
                    <select
                        id="testGenre"
                        value={testGenre}
                        onChange={(e) => setTestGenre(e.target.value as Genre)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-white"
                    >
                        {Object.values(Genre).map(g => (
                            <option key={g} value={g}>{t.genres[g]}</option>
                        ))}
                    </select>
                </div>
                 <div>
                    <label htmlFor="movieSize" className="block text-sm font-medium text-gray-300 mb-1">Filmgröße</label>
                    <select
                        id="movieSize"
                        value={testMovieSize}
                        onChange={(e) => setTestMovieSize(e.target.value as MovieSize)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-white"
                    >
                        {Object.values(MovieSize).map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={handleCreateTestFilm}
                    className="w-full bg-red-700 text-white font-bold py-2 px-4 rounded-sm text-sm uppercase hover:bg-red-600 transition-all"
                >
                    Testfilm erstellen
                </button>
            </div>
        </DashboardWidget>
    );
};

export default TestModeWidget;
