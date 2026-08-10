import React from 'react';

const DashboardWidget: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={`bg-black bg-opacity-60 backdrop-blur-sm border border-gray-700/50 rounded-lg ${className}`}>
    <h3 className="text-lg font-bold font-cinzel text-amber-400 border-b border-gray-700/50 px-4 py-2">{title}</h3>
    <div className="p-4 text-sm">
      {children}
    </div>
  </div>
);

export default DashboardWidget;
