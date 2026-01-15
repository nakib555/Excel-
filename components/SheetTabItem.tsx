
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Tooltip } from './shared';

interface SheetTabItemProps {
    id: string;
    name: string;
    isActive: boolean;
    onClick: (id: string) => void;
}

const SheetTabItem = ({ id, name, isActive, onClick }: SheetTabItemProps) => {
    return (
        <Tooltip content={name} side="top" delayDuration={500}>
            <motion.div
              onClick={() => onClick(id)}
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
              <span className="truncate max-w-[120px] pointer-events-none">{name}</span>
            </motion.div>
        </Tooltip>
    );
};

export default memo(SheetTabItem);
