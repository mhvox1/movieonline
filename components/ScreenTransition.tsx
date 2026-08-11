import React, { useState, useEffect, useRef } from 'react';

interface ScreenTransitionProps {
  children: React.ReactNode;
  childKey: any; 
}

const ScreenTransition: React.FC<ScreenTransitionProps> = ({ children, childKey }) => {
  const [displayChild, setDisplayChild] = useState(children);
  const [displayKey, setDisplayKey] = useState(childKey);
  const [isFading, setIsFading] = useState(true);

  // Always keep a ref to the latest children so the fade timer can
  // pick them up without being in the dependency array (which would
  // restart the timer on every game-loop re-render → black screen).
  const latestChildrenRef = useRef(children);
  latestChildrenRef.current = children;

  // Effect for initial page load fade-in
  useEffect(() => {
    const timer = setTimeout(() => setIsFading(false), 50);
    return () => clearTimeout(timer);
  }, []);

  // Effect for screen KEY changes only (fade transition).
  // Intentionally does NOT include `children` in the dependency array so
  // that rapid game-loop re-renders don't restart the 300 ms timer and
  // keep the screen stuck at opacity-0 (black screen).
  useEffect(() => {
    if (displayKey !== childKey) {
      setIsFading(true);
      const timer = setTimeout(() => {
        setDisplayKey(childKey);
        setDisplayChild(latestChildrenRef.current);
        setIsFading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childKey, displayKey]);

  // Separate effect: live prop updates for the SAME screen (no transition).
  // This keeps the displayed content (e.g. game date, capital) current while
  // we are already showing that screen.
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