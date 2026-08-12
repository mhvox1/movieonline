import React from 'react';

interface ScreenTransitionProps {
  children: React.ReactNode;
  childKey: any; 
}

const ScreenTransition: React.FC<ScreenTransitionProps> = ({ children, childKey }) => {
  return (
    <div className="w-full h-full">
      {children}
    </div>
  );
};

export default ScreenTransition;