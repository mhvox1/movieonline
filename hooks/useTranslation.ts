
import { useGame } from '../contexts/GameContext';
import { translations } from '../translations';

export const useTranslation = () => {
    const { language } = useGame();
    // Fallback auf 'de', falls (theoretisch) eine Sprache fehlt, aber TypeScript sollte das verhindern.
    const t = translations[language] || translations['de'];
    
    return { t, language };
};
