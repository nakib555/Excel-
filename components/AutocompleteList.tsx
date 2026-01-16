
import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../utils';

interface AutocompleteListProps {
    suggestions: string[];
    selectedIndex: number;
    onSelect: (suggestion: string) => void;
    position: { top: number; left: number } | null;
}

const AutocompleteList: React.FC<AutocompleteListProps> = ({ suggestions, selectedIndex, onSelect, position }) => {
    if (!suggestions.length || !position) return null;

    // Use portal to break out of overflow hidden containers
    return createPortal(
        <div 
            className="fixed z-[9999] bg-white border border-slate-200 shadow-xl rounded-md flex flex-col min-w-[150px] max-h-[200px] overflow-y-auto ring-1 ring-black/5 font-mono text-sm"
            style={{
                top: position.top,
                left: position.left,
            }}
        >
            {suggestions.map((suggestion, index) => (
                <div
                    key={suggestion}
                    className={cn(
                        "px-3 py-1.5 cursor-pointer flex items-center justify-between",
                        index === selectedIndex ? "bg-blue-100 text-blue-800" : "hover:bg-slate-50 text-slate-700"
                    )}
                    onMouseDown={(e) => {
                        e.preventDefault(); // Prevent blur
                        onSelect(suggestion);
                    }}
                >
                    <span className="font-semibold">{suggestion}</span>
                    <span className="text-[10px] text-slate-400 opacity-50 uppercase">Func</span>
                </div>
            ))}
        </div>,
        document.body
    );
};

export default AutocompleteList;
