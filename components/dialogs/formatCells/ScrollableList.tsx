
import React, { useRef, useEffect } from 'react';
import { cn } from '../../../utils';

interface ScrollableListProps {
    items: (string | number)[];
    selected: string | number;
    onSelect: (val: any) => void;
    className?: string;
    itemStyle?: (item: any) => React.CSSProperties;
}

const ScrollableList: React.FC<ScrollableListProps> = ({ 
    items, 
    selected, 
    onSelect, 
    className, 
    itemStyle 
}) => {
    const selectedRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (selectedRef.current) {
            selectedRef.current.scrollIntoView({ block: 'nearest' });
        }
    }, [selected]);

    return (
        <div className={cn("border border-slate-200 bg-white/50 overflow-y-auto flex flex-col h-full shadow-inner select-none rounded-lg scrollbar-thin", className)}>
            {items.map(item => {
                const isSelected = selected === item;
                return (
                    <div 
                        key={item} 
                        ref={isSelected ? selectedRef : null}
                        className={cn(
                            "px-4 py-2 text-[12px] cursor-pointer whitespace-nowrap transition-all",
                            isSelected ? "bg-primary-600 text-white font-semibold shadow-md z-10 scale-[1.02]" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                        style={itemStyle ? itemStyle(item) : {}}
                        onClick={() => onSelect(item)}
                    >
                        {item}
                    </div>
                );
            })}
        </div>
    );
};

export default ScrollableList;
