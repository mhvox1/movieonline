import React, { useState, useEffect, useRef } from 'react';

interface ScreenTransitionProps {
  children: React.ReactNode;
  childKey: any; 
}

const ScreenTransition: React.FC<ScreenTransitionProps> = ({ children, childKey }) => {
  const [displayChild, setDisplayChild] = useState(children);
  const [displayKey, setDisplayKey] = useState(childKey);
  const [isFading, setIsFading] = useState(true);
  const latestChildrenRef = useRef(children);

  useEffect(() => {
    latestChildrenRef.current = children;
  }, [children]);

  // Effect for initial page load fade-in
  useEffect(() => {
    const timer = setTimeout(() => setIsFading(false), 50); // Small delay to ensure initial styles are applied
    return () => clearTimeout(timer);
  }, []);

  // Only react to key changes here. Including `children` resets the timer
  // during frequent re-renders and can leave the app stuck at opacity-0.
  useEffect(() => {
    if (displayKey !== childKey) {
      setIsFading(true); // Start fading out
      const timer = setTimeout(() => {
        setDisplayKey(childKey);
        setDisplayChild(latestChildrenRef.current);
        setIsFading(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [childKey, displayKey]);

  // Update current screen content when only props/state changed (same screen key).
  useEffect(() => {
    if (displayKey === childKey) {
      setDisplayChild(children);
    }
  }, [children, childKey, displayKey]);

  return (
    <div className={`w-full h-full transition-opacity duration-300 ease-in-out ${isFading ? 'opacity-0' : 'opacity-100'}`}>
      {displayChild}
    </div>
  );
};

export default ScreenTransition;