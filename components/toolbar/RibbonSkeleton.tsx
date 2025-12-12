import React from 'react';
import { motion } from 'framer-motion';

export const RibbonSkeleton: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-full min-w-max gap-1 px-1 items-center w-full overflow-hidden"
    >
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex flex-col h-full px-3 border-r border-slate-200/60 flex-shrink-0 min-w-[110px]">
          <div className="flex-1 flex gap-3 items-center justify-center py-2">
            
            {/* Fake Large Button */}
            <div className="flex flex-col items-center gap-2 justify-center h-full">
               <div className="w-9 h-9 bg-slate-200/70 rounded-[4px] animate-pulse" />
               <div className="w-12 h-2 bg-slate-200/70 rounded-sm animate-pulse" />
            </div>
            
             {/* Fake Small Buttons Stack */}
            <div className="flex flex-col gap-1.5 h-full justify-center">
               <div className="flex items-center gap-2">
                   <div className="w-3.5 h-3.5 bg-slate-200/70 rounded animate-pulse" />
                   <div className="w-20 h-2 bg-slate-200/70 rounded-sm animate-pulse" />
               </div>
               <div className="flex items-center gap-2">
                   <div className="w-3.5 h-3.5 bg-slate-200/70 rounded animate-pulse" />
                   <div className="w-14 h-2 bg-slate-200/70 rounded-sm animate-pulse" />
               </div>
               <div className="flex items-center gap-2">
                   <div className="w-3.5 h-3.5 bg-slate-200/70 rounded animate-pulse" />
                   <div className="w-16 h-2 bg-slate-200/70 rounded-sm animate-pulse" />
               </div>
            </div>

          </div>
          {/* Group Label Ghost */}
          <div className="h-2.5 w-14 bg-slate-200/60 rounded-sm mx-auto mb-1 mt-auto animate-pulse" />
        </div>
      ))}
    </motion.div>
  );
};