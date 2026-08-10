import React from 'react';
import { WriterEvent, WriterEventChoice } from '../types';

interface WritingEventModalProps {
  event: WriterEvent;
  onClose: (choice: WriterEventChoice) => void;
}

const WritingEventModal: React.FC<WritingEventModalProps> = ({ event, onClose }) => {
  return (
    <div
      className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-gray-800 bg-opacity-95 border border-amber-500 rounded-lg shadow-2xl w-full max-w-xl p-8 text-center"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-3xl font-bold font-cinzel text-amber-400 mb-4">{event.title}</h2>
        <p className="text-gray-300 text-lg mb-6 whitespace-pre-wrap">{event.text}</p>
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
            {event.actions.map(action => (
                <button
                    key={action.value}
                    onClick={() => onClose(action)}
                    className={action.className || "bg-amber-500 text-gray-900 font-bold py-3 px-6 rounded-sm uppercase tracking-wider transform hover:bg-amber-400 transition-all duration-300 ease-in-out shadow-lg shadow-amber-500/20"}
                >
                    {action.text}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default WritingEventModal;
