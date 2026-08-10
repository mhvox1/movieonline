
import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface BetaFeedbackModalProps {
    onClose: () => void;
}

const BetaFeedbackModal: React.FC<BetaFeedbackModalProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const [type, setType] = useState('bug');
    const [message, setMessage] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const handleSend = () => {
        const subject = "Movie Business Feedback";
        
        let typeText = t.beta.typeBug;
        if (type === 'idea') typeText = t.beta.typeIdea;
        if (type === 'other') typeText = t.beta.typeOther;

        const body = `Typ: ${typeText}\nName: ${name}\nEmail: ${email}\n\nNachricht:\n${message}`;
        const mailtoLink = `mailto:info@schnoxcore.de?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        window.location.href = mailtoLink;
        onClose();
    };

    return (
        <div className="absolute inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="bg-gray-800 border border-red-500 rounded-lg shadow-2xl w-full max-w-lg p-6 relative" onClick={e => e.stopPropagation()}>
                <h2 className="text-3xl font-bold font-cinzel text-red-500 mb-6 text-center">{t.beta.modalTitle}</h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">{t.beta.typeLabel}</label>
                        <select 
                            value={type} 
                            onChange={(e) => setType(e.target.value)} 
                            className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                        >
                            <option value="bug">{t.beta.typeBug}</option>
                            <option value="idea">{t.beta.typeIdea}</option>
                            <option value="other">{t.beta.typeOther}</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">{t.beta.messageLabel}</label>
                        <textarea 
                            value={message} 
                            onChange={(e) => setMessage(e.target.value.slice(0, 2500))} 
                            className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white h-40 resize-none focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                            placeholder="..."
                        />
                        <div className="text-right text-xs text-gray-500 mt-1">
                            {message.length} / 2500 {t.beta.characters}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">{t.beta.nameLabel}</label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">{t.beta.emailLabel}</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 mt-8">
                    <button onClick={onClose} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded-sm uppercase tracking-wider transition-colors">
                        {t.common.cancel}
                    </button>
                    <button onClick={handleSend} disabled={!message.trim()} className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-gray-600 disabled:text-gray-500 text-white font-bold py-2 rounded-sm uppercase tracking-wider transition-colors">
                        {t.beta.send}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BetaFeedbackModal;
