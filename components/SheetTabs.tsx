import React, { useRef } from 'react';
import { Plus, LayoutGrid } from 'lucide-react';
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
  
  return (
    <div className="flex items-center h-12 md:h-11 bg-white border-t border-slate-200 select-none px-2 shadow-sm z-30">
      
      {/* Menu / All Sheets Icon */}
      <button className="p-2 md:p-2 mr-1 md:mr-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors flex-shrink-0">
        <LayoutGrid size={18} />
      </button>

      {/* Tabs Container */}
      <div 
        ref={scrollRef}
        className="flex-1 flex overflow-x-auto no-scrollbar gap-1.5 md:gap-1 items-center"
      >
        {sheets.map((sheet) => {
          const isActive = sheet.id === activeSheetId;
          return (
            <motion.div
              key={sheet.id}
              onClick={() => onSwitch(sheet.id)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.95 }}
              className={`
                group flex items-center px-4 py-2 md:py-1.5 cursor-pointer text-xs font-medium rounded-full transition-all border flex-shrink-0
                min-w-[80px] justify-center
                ${isActive 
                  ? 'bg-primary-50 text-primary-700 border-primary-200 shadow-sm' 
                  : 'bg-white text-slate-600 border-transparent hover:bg-slate-50 hover:border-slate-200'
                }
              `}
            >
              <span className="truncate max-w-[100px] md:max-w-[120px]">{sheet.name}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Add Button */}
      <div className="flex items-center pl-2 flex-shrink-0">
        <motion.button 
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onAdd}
          className="p-2 md:p-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-md transition-colors"
          title="New Sheet"
        >
          <Plus size={16} />
        </motion.button>
      </div>
    </div>
  );
};

export default SheetTabs;