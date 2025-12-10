import React, { useRef, useState, useEffect } from 'react';
import { Plus, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';
import { Sheet } from '../types';
import { motion } from 'framer-motion';

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
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

  // Mouse Drag to Scroll Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    setHasMoved(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
    if (Math.abs(walk) > 5) {
        setHasMoved(true);
    }
  };

  const handleTabClick = (sheetId: string) => {
      if (!hasMoved) {
          onSwitch(sheetId);
      }
  };
  
  return (
    <div className="flex items-center h-10 bg-slate-100 border-t border-slate-300 select-none px-1 md:px-2 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] z-40">
      
      {/* Scroll Controls (Left/Right) - Desktop only visual, functional on all */}
      <div className="flex items-center gap-0.5 mr-2">
           <button className="p-1 text-slate-500 hover:bg-slate-200 rounded disabled:opacity-30">
               <ChevronLeft size={14} />
           </button>
           <button className="p-1 text-slate-500 hover:bg-slate-200 rounded disabled:opacity-30">
               <ChevronRight size={14} />
           </button>
      </div>

      {/* Tabs Container */}
      <div 
        ref={scrollRef}
        className={`
            flex-1 flex overflow-x-auto overflow-y-hidden gap-1 items-end h-full pt-1
            no-scrollbar cursor-grab active:cursor-grabbing
        `}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {sheets.map((sheet) => {
          const isActive = sheet.id === activeSheetId;
          return (
            <motion.div
              key={sheet.id}
              onClick={() => handleTabClick(sheet.id)}
              className={`
                group flex items-center px-4 py-1.5 text-xs font-medium transition-all flex-shrink-0
                min-w-[100px] justify-center relative cursor-pointer
                rounded-t-md border-t-2
                ${isActive 
                  ? 'bg-white text-emerald-700 shadow-soft border-t-emerald-500' 
                  : 'bg-transparent text-slate-600 hover:bg-slate-200 hover:text-slate-800 border-t-transparent'
                }
              `}
            >
              <span className="truncate max-w-[120px] pointer-events-none">{sheet.name}</span>
            </motion.div>
          );
        })}
        {/* Spacer */}
        <div className="w-2 flex-shrink-0"></div>
      </div>

      {/* Add Button */}
      <div className="flex items-center pl-2 flex-shrink-0 border-l border-slate-300 ml-1 h-3/5">
        <button 
          onClick={onAdd}
          className="p-1.5 ml-2 bg-transparent hover:bg-slate-200 text-slate-600 hover:text-emerald-600 rounded-full transition-all"
          title="New Sheet"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
};

export default SheetTabs;