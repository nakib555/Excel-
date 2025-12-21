
import React, { useRef, useState, useEffect, memo, useCallback } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Sheet } from '../types';
import SheetTabItem from './SheetTabItem';
import { cn } from '../utils';

interface SheetTabsProps {
  sheets: Sheet[];
  activeSheetId: string;
  onSwitch: (id: string) => void;
  onAdd: () => void;
}

const SheetTabs: React.FC<SheetTabsProps> = ({ 
  sheets, 
  activeSheetId, 
  onSwitch, 
  onAdd 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // --- Scroll Logic ---
  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      // Small buffer for float inaccuracies
      setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 1); 
    }
  }, []);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 150;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Convert Vertical Wheel to Horizontal
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      if (el.scrollWidth > el.clientWidth) {
          e.preventDefault();
          el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    
    // Initial check
    checkScroll();

    // Auto-scroll to active sheet on mount or change
    const activeEl = document.getElementById(`sheet-tab-${activeSheetId}`);
    if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }

    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, sheets.length]); // Re-run when sheets added

  useEffect(() => {
      // Keep active sheet in view when switched
      const activeEl = document.getElementById(`sheet-tab-${activeSheetId}`);
      if (activeEl && scrollRef.current) {
          // Simple check if out of bounds
          const container = scrollRef.current;
          const elRect = activeEl.getBoundingClientRect();
          const cRect = container.getBoundingClientRect();
          if (elRect.left < cRect.left || elRect.right > cRect.right) {
              activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
          }
      }
  }, [activeSheetId]);

  return (
    <div className="flex items-center h-10 bg-slate-100 border-t border-slate-300 select-none px-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] z-40 relative">
      
      {/* Scroll Controls (Persistent on Left like Excel, but with our logic) */}
      <div className="flex items-center gap-0.5 mr-1 flex-shrink-0">
           <button 
                onClick={() => scrollTabs('left')}
                className="p-1 text-slate-500 hover:bg-slate-200 rounded disabled:opacity-30 transition-colors"
                disabled={!showLeftArrow}
                title="Scroll Left"
           >
               <ChevronLeft size={14} />
           </button>
           <button 
                onClick={() => scrollTabs('right')}
                className="p-1 text-slate-500 hover:bg-slate-200 rounded disabled:opacity-30 transition-colors"
                disabled={!showRightArrow}
                title="Scroll Right"
           >
               <ChevronRight size={14} />
           </button>
      </div>

      {/* Tabs Container */}
      <div className="relative flex-1 overflow-hidden h-full flex items-end">
          
          {/* Left Gradient Overlay (Subtle) */}
          <div 
             className={cn(
                 "absolute left-0 top-0 bottom-0 z-20 w-6 bg-gradient-to-r from-slate-100 to-transparent pointer-events-none transition-opacity duration-200",
                 showLeftArrow ? "opacity-100" : "opacity-0"
             )}
          />

          <div 
            ref={scrollRef}
            className={`
                flex-1 flex overflow-x-auto overflow-y-hidden gap-1 items-end h-full pt-1 px-1
                no-scrollbar cursor-default scroll-smooth
            `}
          >
            {sheets.map((sheet) => {
              const isActive = sheet.id === activeSheetId;
              return (
                <div key={sheet.id} id={`sheet-tab-${sheet.id}`}>
                    <SheetTabItem 
                        id={sheet.id}
                        name={sheet.name}
                        isActive={isActive}
                        onClick={onSwitch}
                    />
                </div>
              );
            })}
            {/* Spacer */}
            <div className="w-8 flex-shrink-0" />
          </div>

          {/* Right Gradient Overlay */}
          <div 
             className={cn(
                 "absolute right-0 top-0 bottom-0 z-20 w-8 bg-gradient-to-l from-slate-100 to-transparent pointer-events-none transition-opacity duration-200",
                 showRightArrow ? "opacity-100" : "opacity-0"
             )}
          />
      </div>

      {/* Add Button */}
      <div className="flex items-center pl-1 flex-shrink-0 border-l border-slate-300 ml-1 h-3/5 bg-slate-100 z-30">
        <button 
          onClick={onAdd}
          className="p-1.5 ml-1 bg-transparent hover:bg-slate-200 text-slate-600 hover:text-emerald-600 rounded-full transition-all"
          title="New Sheet"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
};

export default memo(SheetTabs);
