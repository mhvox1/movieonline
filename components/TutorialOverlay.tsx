
import React, { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { GameState, ProjectPhase } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface TutorialOverlayProps {
  gameState: GameState;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ gameState }) => {
    const { playerData, setPlayerData } = useGame();
    const { t } = useTranslation();
    
    // Zentrierte Startposition basierend auf 1920x1080 Auflösung
    // Breite: 32rem ~= 512px
    // Höhe (geschätzt): ~400px
    // x: (1920 - 512) / 2 = 704
    // y: (1080 - 400) / 2 = 340
    const [position, setPosition] = useState({ x: 704, y: 340 });
    const [isDragging, setIsDragging] = useState(false);
    const [rel, setRel] = useState({ x: 0, y: 0 });
    
    // Neuer State für die Sicherheitsabfrage
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);

    const currentStep = playerData?.tutorialStep || 0;
    const isActive = playerData?.tutorialActive;

    // Check conditions to auto-advance or update text
    useEffect(() => {
        if (!playerData || !setPlayerData || !isActive) return;

        // Wenn das Bestätigungsfenster offen ist, keine automatischen Schritte machen
        if (showCloseConfirm) return;

        // Helper to advance
        const nextStep = () => {
             setPlayerData(prev => prev ? { ...prev, tutorialStep: (prev.tutorialStep || 0) + 1 } : null);
        };

        // --- STEP LOGIC ---
        
        // 1: Welcome -> Manual click "Weiter"
        
        // --- TOUR PHASE ---
        
        // 2: Click Projects -> Check if in Projects
        if (currentStep === 2 && gameState === GameState.Projects) {
            nextStep();
        }
        
        // 3: Explain Projects -> Return to Main -> Check if MainScreen
        if (currentStep === 3 && gameState === GameState.MainScreen) {
            nextStep();
        }

        // 4: Click Marketing -> Check if in Marketing
        if (currentStep === 4 && gameState === GameState.Marketing) {
            nextStep();
        }
        
        // 5: Explain Marketing -> Return to Main -> Check if MainScreen
        if (currentStep === 5 && gameState === GameState.MainScreen) {
            nextStep();
        }

        // 6: Click Office -> Check if in Office
        if (currentStep === 6 && gameState === GameState.Office) {
            nextStep();
        }
        
        // 7: Explain Office -> Return to Main -> Check if MainScreen
        if (currentStep === 7 && gameState === GameState.MainScreen) {
            nextStep();
        }

        // 8: Click Lot -> Check if in Studiogelaende
        if (currentStep === 8 && gameState === GameState.Studiogelaende) {
            nextStep();
        }
        
        // 9: Explain Lot -> Return to Main -> Check if MainScreen
        if (currentStep === 9 && gameState === GameState.MainScreen) {
            nextStep();
        }

        // 10: Click Research -> Check if in Research
        if (currentStep === 10 && gameState === GameState.Research) {
            nextStep();
        }
        
        // 11: Explain Research -> Return to Main -> Check if MainScreen
        if (currentStep === 11 && gameState === GameState.MainScreen) {
            nextStep();
        }

        // 12: Click Finance -> Check if in Finanzen
        if (currentStep === 12 && gameState === GameState.Finanzen) {
            nextStep();
        }
        
        // 13: Explain Finance -> Return to Main -> Check if MainScreen
        if (currentStep === 13 && gameState === GameState.MainScreen) {
            nextStep();
        }

        // 14: Click Private -> Check if in Privatleben
        if (currentStep === 14 && gameState === GameState.Privatleben) {
            nextStep();
        }
        
        // 15: Explain Private -> Return to Main -> Check if MainScreen
        if (currentStep === 15 && gameState === GameState.MainScreen) {
            nextStep();
        }

        // 16: Go back to Projects to start -> Check if in Projects
        if (currentStep === 16 && gameState === GameState.Projects) {
            nextStep();
        }
        
        // --- PRODUCTION PHASE ---
        
        // 17: Buy Script -> Check availableScripts.length > 0
        if (currentStep === 17 && playerData.availableScripts.length > 0) {
            nextStep();
        }
        
        // 18: Start Planning -> Check if activePlanning is set
        if (currentStep === 18 && playerData.activePlanning) {
            nextStep();
        }

        // 19: Wait for Planning -> Advance when activePlanning is finished (becomes null)
        if (currentStep === 19 && !playerData.activePlanning) {
             nextStep();
        }
        
        // 20: Load Project -> Check if any project is in activeProjects list
        if (currentStep === 20) {
             const hasActiveProject = playerData.activeProjects.length > 0;
             if (hasActiveProject) {
                 nextStep();
             }
        }
        
        // 21: Start Casting -> Check if any project is in Casting Phase
        if (currentStep === 21) {
            const hasCasting = playerData.activeProjects.some(p => p.phase === 'Casting');
            if (hasCasting) nextStep();
        }

        // 22: Wait for Casting -> Check if CastingFinished
        if (currentStep === 22) {
            const castingDone = playerData.activeProjects.some(p => p.phase === 'CastingFinished' || p.phase === 'ProductionSetup');
            if (castingDone) nextStep();
        }

        // 23: Talent Selection -> Check if ProductionSetup
        if (currentStep === 23) {
             const prodSetup = playerData.activeProjects.some(p => p.phase === 'ProductionSetup' || p.phase === 'Production');
             if (prodSetup) nextStep();
        }

        // 24: Production Board -> Check if Production
        if (currentStep === 24) {
             const inProduction = playerData.activeProjects.some(p => p.phase === 'Production');
             if (inProduction) nextStep();
        }
        
        // 25: Wait for Production -> Check if PostProductionSetup
        if (currentStep === 25) {
             const postProdSetup = playerData.activeProjects.some(p => p.phase === 'PostProductionSetup' || p.phase === 'PostProduction');
             if (postProdSetup) nextStep();
        }

        // 26: Post Production -> Check if PostProduction running
        if (currentStep === 26) {
             const inPostProd = playerData.activeProjects.some(p => p.phase === 'PostProduction');
             if (inPostProd) nextStep();
        }

         // 27: Wait for Completion -> Check if Completed
        if (currentStep === 27) {
             const completed = playerData.activeProjects.some(p => p.phase === 'Completed') || 
                               (playerData.completedFilms.length > 0 && playerData.completedFilms[playerData.completedFilms.length-1].phase === 'Completed');
             if (completed) nextStep();
        }
        
    }, [playerData, gameState, isActive, currentStep, setPlayerData, showCloseConfirm]);

    // Attach global listeners for drag
    useEffect(() => {
        const onGlobalMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            setPosition({
                x: e.pageX - rel.x,
                y: e.pageY - rel.y
            });
            e.stopPropagation();
            e.preventDefault();
        };

        const onGlobalMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', onGlobalMouseMove);
            window.addEventListener('mouseup', onGlobalMouseUp);
        } else {
            window.removeEventListener('mousemove', onGlobalMouseMove);
            window.removeEventListener('mouseup', onGlobalMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', onGlobalMouseMove);
            window.removeEventListener('mouseup', onGlobalMouseUp);
        };
    }, [isDragging, rel]);


    if (!isActive || !playerData) return null;

    const onMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return;
        setIsDragging(true);
        setRel({
            x: e.pageX - position.x,
            y: e.pageY - position.y
        });
        e.stopPropagation();
        e.preventDefault();
    };

    const handleNextClick = () => {
        setPlayerData(prev => prev ? { ...prev, tutorialStep: (prev.tutorialStep || 0) + 1 } : null);
    };

    const handleCloseRequest = (e: React.MouseEvent) => {
         e.stopPropagation(); 
         setShowCloseConfirm(true);
    };

    const confirmClose = () => {
         setPlayerData(prev => prev ? { ...prev, tutorialActive: false } : null);
    };

    const cancelClose = () => {
        setShowCloseConfirm(false);
    };
    
    // Content Logic from Translations
    // Note: t.tutorial.steps uses numeric keys, so we access them directly
    const stepData = t.tutorial.steps[currentStep as keyof typeof t.tutorial.steps];
    
    let title = `${t.tutorial.actions.step} ${currentStep}`;
    let content = "";
    
    if (stepData) {
        title = stepData.title;
        content = stepData.content;
    }
    
    // Special logic for "Next" button visibility (same as before)
    let showNextButton = false;
    let isFinished = false;

    if (currentStep === 1) showNextButton = true;
    if (currentStep === 28) isFinished = true; // Last step

    return (
        <div 
            className="fixed bg-gray-900/95 border-2 border-amber-500 rounded-lg shadow-2xl text-white overflow-hidden flex flex-col z-[9999]"
            style={{ 
                left: position.x, 
                top: position.y,
                width: '32rem',
                maxWidth: '90vw',
                boxShadow: '0 10px 40px rgba(0,0,0,0.7)'
            }}
        >
            {/* Header (Draggable) */}
            <div 
                className="bg-gradient-to-r from-amber-600 to-amber-700 p-3 cursor-move flex justify-between items-center select-none"
                onMouseDown={onMouseDown}
            >
                <span className="font-bold font-cinzel text-base text-black uppercase tracking-wider flex items-center gap-2">
                    <span className="text-xl">★</span> {showCloseConfirm ? t.tutorial.actions.closeTitle : title}
                </span>
                {!showCloseConfirm && (
                    <button onClick={handleCloseRequest} className="text-black hover:text-white font-bold px-2 text-xl leading-none">×</button>
                )}
            </div>

            {/* Body */}
            <div className="p-6 text-base text-gray-200 leading-relaxed font-sans">
                {showCloseConfirm ? (
                    <div className="text-center">
                        <p className="mb-6 text-amber-200 text-lg">{t.tutorial.actions.reallyClose}</p>
                        <div className="flex justify-center gap-4">
                            <button 
                                onClick={cancelClose}
                                className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded uppercase transition-colors"
                            >
                                {t.tutorial.actions.cancelClose}
                            </button>
                            <button 
                                onClick={confirmClose}
                                className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded uppercase transition-colors"
                            >
                                {t.tutorial.actions.confirmClose}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="whitespace-pre-wrap">
                        {content}
                    </div>
                )}
            </div>

            {/* Footer (Nur anzeigen wenn NICHT im Bestätigungsmodus) */}
            {!showCloseConfirm && (
                <div className="p-4 bg-gray-800 border-t border-gray-700 flex justify-between items-center">
                    <span className="text-xs text-gray-500">{t.tutorial.actions.step} {currentStep} / 28</span>
                    {(showNextButton || isFinished) && (
                        <button 
                            onClick={isFinished ? confirmClose : handleNextClick}
                            className="bg-amber-500 hover:bg-amber-400 text-black font-bold py-2 px-6 rounded uppercase transition-colors shadow-lg"
                        >
                            {isFinished ? t.tutorial.actions.start : t.tutorial.actions.next}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default TutorialOverlay;
