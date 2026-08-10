import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
const Scratchpad = () => {
    const { playerData, setPlayerData } = useGame();
    // Default position: Centered on a 1920x1080 screen approx
    const defaultPos = { x: 700, y: 300 };
    const [position, setPosition] = useState(playerData?.scratchpadPosition || defaultPos);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [content, setContent] = useState(playerData?.scratchpadContent || "");
    // Update local content state if playerData changes externally (e.g. load)
    useEffect(() => {
        if (playerData?.scratchpadContent !== undefined) {
            setContent(playerData.scratchpadContent);
        }
    }, [playerData?.scratchpadContent]);
    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
        e.preventDefault(); // Prevent text selection during drag start
    };
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging)
                return;
            const newX = e.clientX - dragOffset.x;
            const newY = e.clientY - dragOffset.y;
            // Allow unrestricted movement, but maybe keep some part on screen
            setPosition({ x: newX, y: newY });
        };
        const handleMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
                // Save position on drag end
                setPlayerData(prev => prev ? { ...prev, scratchpadPosition: position } : null);
            }
        };
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset, position, setPlayerData]);
    const handleChange = (e) => {
        const newText = e.target.value;
        setContent(newText);
        // Persist content immediately (or debounce if needed, but direct update is fine for local text)
        setPlayerData(prev => prev ? { ...prev, scratchpadContent: newText } : null);
    };
    const handleClose = () => {
        setPlayerData(prev => prev ? { ...prev, isScratchpadOpen: false } : null);
    };
    return (_jsxs("div", { className: "fixed flex flex-col shadow-2xl z-[9999]", style: {
            left: position.x,
            top: position.y,
            width: '450px', // Increased by 50% from 300px
            height: '525px', // Increased by 50% from 350px
            transform: 'rotate(-1deg)', // Slight tilt for realism
            transition: isDragging ? 'none' : 'transform 0.2s',
        }, children: [_jsxs("div", { className: "bg-yellow-300 p-2 cursor-move flex justify-between items-center border-b border-yellow-400 rounded-t-lg", onMouseDown: handleMouseDown, children: [_jsx("span", { className: "text-yellow-800 font-bold text-xs uppercase tracking-wider ml-2" }), _jsx("button", { onClick: handleClose, className: "text-yellow-800 hover:text-red-600 font-bold px-2 text-lg leading-none", title: "Schlie\u00DFen", children: "\u00D7" })] }), _jsx("textarea", { value: content, onChange: handleChange, className: "flex-grow p-6 bg-yellow-100 text-gray-800 font-sans text-xl resize-none focus:outline-none rounded-b-lg shadow-inner leading-relaxed", placeholder: "", spellCheck: false, style: { fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif' } }), _jsx("div", { className: "absolute bottom-0 right-0 w-8 h-8 pointer-events-none bg-gradient-to-tl from-black/20 to-transparent rounded-br-lg" })] }));
};
export default Scratchpad;
