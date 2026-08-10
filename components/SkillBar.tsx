
import React from 'react';

interface SkillBarProps {
    label: string;
    value: number;
    color?: string;
    showValue?: boolean;
}

const SkillBar: React.FC<SkillBarProps> = ({ label, value, color = 'bg-blue-500', showValue = true }) => {
    return (
        <div className="mb-2">
            <div className="flex justify-between items-end mb-1">
                <span className="text-xs text-gray-300 font-semibold uppercase">{label}</span>
                {showValue && <span className="text-xs font-mono text-white">{Math.round(value)}/100</span>}
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden border border-gray-600">
                <div 
                    className={`${color} h-full rounded-full transition-all duration-500 ease-out`} 
                    style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                ></div>
            </div>
        </div>
    );
};

export default SkillBar;
