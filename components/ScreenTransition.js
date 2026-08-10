import { jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
const ScreenTransition = ({ children, childKey }) => {
    const [displayChild, setDisplayChild] = useState(children);
    const [displayKey, setDisplayKey] = useState(childKey);
    const [isFading, setIsFading] = useState(true);
    // Effect for initial page load fade-in
    useEffect(() => {
        const timer = setTimeout(() => setIsFading(false), 50); // Small delay to ensure initial styles are applied
        return () => clearTimeout(timer);
    }, []);
    // Effect for screen changes and prop updates
    useEffect(() => {
        // If the key for the new children is different from the key of what's currently displayed
        if (displayKey !== childKey) {
            setIsFading(true); // Start fading out
            const timer = setTimeout(() => {
                // After fading out, update the child and key, then fade in
                setDisplayKey(childKey);
                setDisplayChild(children);
                setIsFading(false);
            }, 300); // This duration must match the CSS fade-out time
            return () => clearTimeout(timer);
        }
        else {
            // If the key is the same, the screen component might have received new props.
            // Update the displayed child directly without a transition to reflect the new state.
            // This fixes the issue of the date not updating on the MainScreen.
            setDisplayChild(children);
        }
    }, [childKey, children]);
    return (_jsx("div", { className: `w-full h-full transition-opacity duration-300 ease-in-out ${isFading ? 'opacity-0' : 'opacity-100'}`, children: displayChild }));
};
export default ScreenTransition;
