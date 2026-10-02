import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../utils';
import { FUNCTION_DEFINITIONS } from '../app/constants/functionDefinitions';
import { CornerDownLeft, Sparkles } from 'lucide-react';

interface AutocompleteListProps {
    suggestions: string[];
    selectedIndex: number;
    onSelect: (suggestion: string) => void;
    position: { top: number; left: number } | null;
}

const AutocompleteList: React.FC<AutocompleteListProps> = ({ 
    suggestions, 
    selectedIndex, 
    onSelect, 
    position 
}) => {
    const listRef = useRef<HTMLDivElement>(null);
    const activeItemRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to selected suggestion
    useEffect(() => {
        if (activeItemRef.current) {
            activeItemRef.current.scrollIntoView({ block: 'nearest' });
        }
    }, [selectedIndex]);

    if (!suggestions.length || !position) return null;

    const currentFnName = suggestions[selectedIndex] || suggestions[0];
    const activeDef = FUNCTION_DEFINITIONS[currentFnName];

    // Constrain position within window viewport
    const left = Math.max(8, Math.min(window.innerWidth - 380, position.left));
    const top = Math.min(window.innerHeight - 260, position.top);

    return createPortal(
        <div 
            className="fixed z-[9999] bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl rounded-xl flex flex-col md:flex-row overflow-hidden ring-1 ring-black/5 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-100 w-[360px] md:w-[460px] max-h-[280px]"
            style={{ top, left }}
            onMouseDown={(e) => e.preventDefault()} // Prevent blur from input
        >
            {/* Left: Functions List */}
            <div 
                ref={listRef}
                className="w-full md:w-[220px] max-h-[180px] md:max-h-[240px] overflow-y-auto scrollbar-thin divide-y divide-slate-100 flex-shrink-0"
            >
                {suggestions.map((suggestion, index) => {
                    const isSelected = index === selectedIndex;
                    const def = FUNCTION_DEFINITIONS[suggestion];
                    return (
                        <div
                            key={suggestion}
                            ref={isSelected ? activeItemRef : null}
                            className={cn(
                                "px-3 py-2 cursor-pointer flex items-center justify-between transition-colors select-none",
                                isSelected 
                                    ? "bg-emerald-50/90 text-emerald-900 border-l-[3px] border-emerald-600 font-semibold" 
                                    : "hover:bg-slate-50 text-slate-700 border-l-[3px] border-transparent"
                            )}
                            onClick={() => onSelect(suggestion)}
                        >
                            <div className="flex items-center gap-2 truncate">
                                <span className={cn(
                                    "w-5 h-5 rounded flex items-center justify-center font-serif italic font-bold text-[10px] flex-shrink-0 shadow-xs",
                                    isSelected ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                                )}>
                                    fx
                                </span>
                                <span className="font-mono text-[12px]">{suggestion}</span>
                            </div>
                            {def?.category && (
                                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-sans font-medium px-1 bg-slate-100 rounded">
                                    {def.category}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Right: Function Syntax & Description Pane */}
            <div className="flex-1 bg-slate-50/70 border-t md:border-t-0 md:border-l border-slate-200/80 p-3 flex flex-col justify-between overflow-hidden">
                {activeDef ? (
                    <div className="flex flex-col gap-2 overflow-y-auto pr-1">
                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
                                <Sparkles size={11} className="text-emerald-500" />
                                Function Syntax
                            </div>
                            <div className="font-mono font-bold text-[12px] text-slate-900 bg-white border border-slate-200/70 rounded-md px-2 py-1 select-all shadow-2xs">
                                {activeDef.syntax}
                            </div>
                        </div>

                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                                Description
                            </div>
                            <p className="text-[11px] leading-relaxed text-slate-600 font-normal">
                                {activeDef.description}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="text-xs text-slate-400 italic flex items-center justify-center h-full">
                        Excel Formula
                    </div>
                )}

                {/* Footer keyboard guide */}
                <div className="pt-2 border-t border-slate-200/60 mt-2 flex items-center justify-between text-[10px] text-slate-500 flex-shrink-0">
                    <span className="flex items-center gap-1">
                        Press <kbd className="px-1 py-0.5 bg-white border border-slate-300 rounded shadow-2xs font-mono text-[9px] text-slate-700">Tab</kbd> to insert
                    </span>
                    <span className="hidden md:flex items-center gap-1 text-slate-400">
                        <CornerDownLeft size={10} /> Enter
                    </span>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AutocompleteList;
