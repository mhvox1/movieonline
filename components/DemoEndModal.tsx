
import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface DemoEndModalProps {
    onBackToMenu: () => void;
}

const DemoEndModal: React.FC<DemoEndModalProps> = ({ onBackToMenu }) => {
    const { language } = useTranslation();
    return (
        <div className="absolute inset-0 bg-black bg-opacity-90 backdrop-blur-md flex items-center justify-center z-[100] p-6 animate-fade-in">
            <div className="bg-gray-900 border-2 border-amber-500 rounded-lg shadow-[0_0_50px_rgba(245,158,11,0.5)] w-full max-w-2xl p-10 text-center relative overflow-hidden">
                
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
                
                <h2 className="text-5xl font-bold font-cinzel text-amber-400 mb-6 drop-shadow-lg">
                    {language === 'de' ? 'Danke fürs Spielen!' : 'Thanks for playing!'}
                </h2>
                
                <p className="text-gray-300 text-xl mb-8 leading-relaxed font-light">
                    {language === 'de'
                        ? <>Du hast das Ende der Demo von <span className="font-bold text-white">Movie Business</span> erreicht. Wir hoffen, der erste Einblick in die harte, aber faszinierende Welt des Film-Business hat Dir gefallen.</>
                        : <>You have reached the end of the <span className="font-bold text-white">Movie Business</span> demo. We hope you enjoyed this first glimpse into the demanding but fascinating world of the movie business.</>}
                </p>

                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 mb-8">
                    <p className="text-lg text-gray-400 mb-2">{language === 'de' ? 'Die Vollversion erscheint am:' : 'The full version releases on:'}</p>
                    <p className="text-3xl font-bold text-white tracking-widest mb-1">25.02.2026</p>
                    <p className="text-sm text-cyan-400 font-bold uppercase tracking-wider">{language === 'de' ? 'Auf Steam' : 'On Steam'}</p>
                </div>

                <p className="text-gray-400 italic mb-10">
                    {language === 'de'
                        ? '"Wir freuen uns darauf, Dich bald wieder als legendären Produzenten zu sehen!"'
                        : '"We look forward to seeing you again soon as a legendary producer!"'}
                </p>

                <button 
                    onClick={onBackToMenu}
                    className="bg-amber-600 hover:bg-amber-500 text-white text-xl font-bold py-4 px-12 rounded-sm uppercase tracking-wider transition-all shadow-lg transform hover:scale-105"
                >
                    {language === 'de' ? 'Zurück zum Hauptmenü' : 'Back to Main Menu'}
                </button>
            </div>
        </div>
    );
};

export default DemoEndModal;
