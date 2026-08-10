
import React, { useMemo } from 'react';
import DashboardWidget from '../DashboardWidget';
import MailIcon from '../icons/MailIcon';
import { useGame } from '../../contexts/GameContext';
import { OfficeTabType } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface NachrichtenWidgetProps {
    onNavigateToOfficeTab: (tab: OfficeTabType) => void;
}

const NachrichtenWidget: React.FC<NachrichtenWidgetProps> = ({ onNavigateToOfficeTab }) => {
    const { playerData } = useGame();
    const { t, language } = useTranslation();

    // Helper to access nested translation keys
    const getTranslationValue = (key: string) => {
        return key.split('.').reduce((obj, part) => obj && obj[part], t as any);
    };

    // Helper for deterministic random strings (so the widget shows the same text as the tab)
    const getDeterministicString = (options: string[], seed: string): string => {
        if (!options || options.length === 0) return "";
        if (options.length === 1) return options[0];
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            const char = seed.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        const index = Math.abs(hash) % options.length;
        return options[index];
    };

    // Helper to render the subject template
    const renderTemplate = (template?: { key: string; variables?: any }, fallback?: string, messageId?: string): string => {
        if (!template) return fallback || '';
        const { key, variables } = template;
        const rawValue = getTranslationValue(key);
        let templateString = "";

        if (Array.isArray(rawValue)) {
            templateString = getDeterministicString(rawValue, messageId || key);
        } else if (typeof rawValue === 'string') {
            templateString = rawValue;
        } else {
            return fallback || key;
        }

        Object.entries(variables || {}).forEach(([varName, value]) => {
            const placeholder = new RegExp(`{${varName}}`, 'g');
            templateString = templateString.replace(placeholder, String(value));
        });
        return templateString;
    };

    const labels: Record<string, { sender: string; subject: string }> = {
        de: { sender: 'Absender:', subject: 'Betreff:' },
        en: { sender: 'Sender:', subject: 'Subject:' },
        fr: { sender: 'Expéditeur :', subject: 'Sujet :' },
        es: { sender: 'Remitente:', subject: 'Asunto:' },
        it: { sender: 'Mittente:', subject: 'Oggetto:' },
    };

    const currentLabels = labels[language] || labels['en'];

    const { hasUnreadMessages, latestSubject, latestSender, unreadCount, latestDateString } = useMemo(() => {
        if (!playerData) return { hasUnreadMessages: false, latestSubject: '', latestSender: '', unreadCount: 0, latestDateString: '' };
        
        const unread = playerData.messages
            .filter(m => !m.read && !m.isArchived)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            
        const hasUnread = unread.length > 0;
        let subject = '';
        let sender = '';
        let dateStr = '';
        
        if (hasUnread) {
            const latest = unread[0];
            subject = renderTemplate(latest.subjectTemplate, latest.subject, latest.id);
            sender = latest.sender || t.office.messages.system;
            
            const locale = language === 'de' ? 'de-DE' : 'en-US';
            dateStr = new Date(latest.date).toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
        }

        return { 
            hasUnreadMessages: hasUnread, 
            latestSubject: subject, 
            latestSender: sender,
            unreadCount: unread.length,
            latestDateString: dateStr
        };
    }, [playerData, t, language]); // t dependency ensures update on language change

    if (!playerData) return null;

    return (
        <div onClick={() => onNavigateToOfficeTab('nachrichten')} className="cursor-pointer group">
            <DashboardWidget title={t.widgets.news.title}>
                <div className="flex flex-row items-center p-2 min-h-[80px] gap-6">
                    {/* Left: Icon & Badge */}
                    <div className="relative flex-shrink-0 ml-1">
                        <MailIcon className={`h-8 w-8 transition-transform group-hover:scale-110 ${hasUnreadMessages ? 'text-amber-400 animate-pulse' : 'text-gray-500'}`} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1.5 -right-2.5 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-gray-900 shadow-sm min-w-[18px] flex items-center justify-center z-10">
                                {unreadCount}
                            </span>
                        )}
                    </div>

                    {/* Right: Content */}
                    <div className="flex-grow min-w-0">
                        {hasUnreadMessages ? (
                            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 items-baseline">
                                {/* Sender Row */}
                                <span className="text-[10px] text-gray-400 font-bold uppercase text-right">{currentLabels.sender}</span>
                                <div className="flex justify-between items-baseline min-w-0">
                                    <span className="text-xs font-bold text-amber-400 truncate">{latestSender}</span>
                                    <span className="text-[10px] text-gray-500 flex-shrink-0 ml-2">{latestDateString}</span>
                                </div>

                                {/* Subject Row */}
                                <span className="text-[10px] text-gray-400 font-bold uppercase text-right">{currentLabels.subject}</span>
                                <span className="text-sm font-semibold text-white truncate leading-tight" title={latestSubject}>
                                    {latestSubject}
                                </span>
                            </div>
                        ) : (
                             <p className="text-gray-400 text-sm italic text-left">{t.widgets.news.noMessages}</p>
                        )}
                    </div>
                </div>
            </DashboardWidget>
        </div>
    );
};

export default NachrichtenWidget;
