import React from 'react';
import { motion } from 'framer-motion';

export const CellSkeleton = ({ width, height }: { width: number; height: number }) => (
  <div 
    style={{ 
      width, 
      height, 
      minWidth: width, 
      minHeight: height 
    }} 
    className="border-r border-b border-slate-100 bg-white box-border overflow-hidden select-none relative"
  >
    <div className="absolute inset-0 shimmer" />
  </div>
);

export const TabItemSkeleton = () => (
    <div className="flex items-center px-4 py-1.5 min-w-[100px] h-full justify-center bg-transparent border-t-2 border-transparent">
        <div className="w-16 h-4 bg-slate-200 rounded animate-pulse" />
    </div>
);

const GroupSkeleton = () => (
  <div className="flex flex-col h-full px-3 border-r border-slate-200/60 last:border-r-0 flex-shrink-0">
    <div className="flex-1 flex gap-2 items-center justify-center py-1">
       {/* Mock Large Button */}
       <div className="flex flex-col items-center gap-1.5 min-w-[50px]">
          <div className="w-9 h-9 bg-slate-200 rounded-md" />
          <div className="w-12 h-2.5 bg-slate-200 rounded-sm" />
       </div>
       
       {/* Mock Column of small buttons */}
       <div className="flex flex-col gap-1.5 h-full justify-center min-w-[80px]">
          <div className="flex items-center gap-2">
             <div className="w-4 h-4 bg-slate-200 rounded-sm" />
             <div className="w-16 h-2.5 bg-slate-200 rounded-sm" />
          </div>
          <div className="flex items-center gap-2">
             <div className="w-4 h-4 bg-slate-200 rounded-sm" />
             <div className="w-14 h-2.5 bg-slate-200 rounded-sm" />
          </div>
          <div className="flex items-center gap-2">
             <div className="w-4 h-4 bg-slate-200 rounded-sm" />
             <div className="w-10 h-2.5 bg-slate-200 rounded-sm" />
          </div>
       </div>

        {/* Mock Large Button 2 */}
       <div className="flex flex-col items-center gap-1.5 min-w-[50px] ml-1">
          <div className="w-9 h-9 bg-slate-200 rounded-md" />
          <div className="w-10 h-2.5 bg-slate-200 rounded-sm" />
       </div>
    </div>
    
    {/* Group Label */}
    <div className="h-[18px] flex items-center justify-center pb-1 mt-auto">
         <div className="w-14 h-2 bg-slate-200 rounded-sm" />
    </div>
  </div>
);

export const RibbonSkeleton = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-full w-full items-center gap-0 animate-pulse overflow-hidden px-1 pointer-events-none select-none"
    >
      <GroupSkeleton />
      <GroupSkeleton />
      <GroupSkeleton />
      <GroupSkeleton />
      <GroupSkeleton />
    </motion.div>
  );
};

export const ToolbarSkeleton = () => (
  <div className="flex flex-col w-full bg-[#f8fafc] border-b border-slate-200 shadow-sm z-40 select-none">
    {/* Title Bar */}
    <div className="h-11 bg-[#0f172a] flex items-center justify-between px-4 w-full">
       <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded bg-white/10 animate-pulse" />
          <div className="w-24 h-4 bg-white/10 rounded animate-pulse" />
          <div className="flex gap-2 ml-4">
              <div className="w-6 h-6 rounded-full bg-white/10 animate-pulse" />
              <div className="w-6 h-6 rounded-full bg-white/10 animate-pulse" />
              <div className="w-[1px] h-4 bg-slate-700 mx-1"></div>
              <div className="w-16 h-6 rounded-full bg-white/10 animate-pulse" />
          </div>
       </div>
       <div className="flex items-center gap-3">
           <div className="w-48 h-8 rounded bg-slate-800 animate-pulse hidden md:block" />
           <div className="w-8 h-8 rounded-full bg-indigo-600/50 animate-pulse" />
       </div>
    </div>
    
    {/* Tabs Bar */}
    <div className="h-[37px] bg-[#0f172a] px-4 flex items-end gap-1 pt-1 overflow-hidden">
        {['Home', 'Insert', 'Draw', 'Page Layout', 'Formulas', 'Data'].map((tab, i) => (
            <div key={i} className={`w-16 h-8 rounded-t-md animate-pulse mb-1 ${i === 0 ? 'bg-slate-100' : 'bg-white/5'}`} />
        ))}
    </div>

    {/* Ribbon Area */}
    <div className="h-[100px] bg-[#f8fafc] border-b border-slate-200 flex items-center px-4 py-2 gap-2 overflow-hidden">
        <div className="flex flex-col h-full gap-2 justify-center px-2 border-r border-slate-200">
             <div className="flex gap-2">
                 <div className="w-10 h-10 bg-slate-200 rounded animate-pulse" />
                 <div className="flex flex-col gap-1">
                     <div className="w-6 h-4 bg-slate-200 rounded animate-pulse" />
                     <div className="w-6 h-4 bg-slate-200 rounded animate-pulse" />
                 </div>
             </div>
             <div className="w-12 h-3 bg-slate-200 rounded animate-pulse mx-auto" />
        </div>
        
        <div className="flex flex-col h-full gap-2 justify-center px-4 border-r border-slate-200 w-64">
             <div className="flex gap-2 w-full">
                 <div className="w-full h-8 bg-slate-200 rounded animate-pulse" />
                 <div className="w-12 h-8 bg-slate-200 rounded animate-pulse" />
             </div>
             <div className="flex gap-1 w-full">
                 <div className="w-6 h-6 bg-slate-200 rounded animate-pulse" />
                 <div className="w-6 h-6 bg-slate-200 rounded animate-pulse" />
                 <div className="w-6 h-6 bg-slate-200 rounded animate-pulse" />
                 <div className="w-full h-6 bg-slate-200 rounded animate-pulse" />
             </div>
             <div className="w-12 h-3 bg-slate-200 rounded animate-pulse mx-auto mt-auto" />
        </div>

        <div className="flex flex-col h-full gap-2 justify-center px-2 border-r border-slate-200 flex-1">
             <div className="flex gap-4 h-full items-center">
                 <div className="w-12 h-12 bg-slate-200 rounded animate-pulse" />
                 <div className="w-12 h-12 bg-slate-200 rounded animate-pulse" />
                 <div className="w-12 h-12 bg-slate-200 rounded animate-pulse" />
             </div>
             <div className="w-16 h-3 bg-slate-200 rounded animate-pulse mx-auto" />
        </div>
    </div>
  </div>
);

export const FormulaBarSkeleton = () => (
  <div className="flex items-center h-12 px-4 border-b border-slate-200 bg-white gap-3 shadow-sm z-30 select-none">
    <div className="w-14 h-8 bg-slate-100 rounded animate-pulse border border-slate-200" />
    <div className="w-[1px] h-5 bg-slate-300 hidden md:block" />
    <div className="flex items-center gap-2 text-slate-300">
        <div className="w-4 h-4 rounded bg-slate-100 animate-pulse" />
        <div className="w-4 h-4 rounded bg-slate-100 animate-pulse" />
        <div className="w-4 h-4 rounded bg-slate-100 animate-pulse" />
    </div>
    <div className="flex-1 h-8 bg-slate-50 rounded animate-pulse border border-transparent" />
  </div>
);

export const SheetTabsSkeleton = () => (
    <div className="flex items-center h-10 bg-slate-100 border-t border-slate-300 px-2 gap-1 select-none z-40">
        <div className="flex gap-1 mr-2">
             <div className="w-6 h-6 bg-slate-200 rounded animate-pulse" />
             <div className="w-6 h-6 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="flex items-end gap-1 h-full pt-1">
            <div className="w-24 h-full bg-white border-t-2 border-slate-300 rounded-t-md animate-pulse shadow-sm" />
            <div className="w-24 h-full bg-slate-200/50 rounded-t-md animate-pulse border-t-2 border-transparent" />
            <div className="w-24 h-full bg-slate-200/50 rounded-t-md animate-pulse border-t-2 border-transparent" />
        </div>
        <div className="ml-2 w-6 h-6 bg-slate-200 rounded-full animate-pulse" />
    </div>
);

export const StatusBarSkeleton = () => (
    <div className="h-9 bg-[#0f172a] border-t border-slate-700 flex items-center justify-between px-4 select-none z-50">
        <div className="flex items-center gap-3">
             <div className="w-16 h-3 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
             <div className="w-16 h-3 bg-white/10 rounded animate-pulse hidden md:block" />
             <div className="w-24 h-3 bg-white/10 rounded animate-pulse" />
        </div>
    </div>
);

export const GridSkeleton = () => (
  <div className="flex-1 overflow-hidden relative w-full h-full bg-white flex flex-col select-none">
      {/* Header Row */}
      <div className="flex h-[28px] border-b border-slate-300 bg-slate-50">
          <div className="w-[46px] h-full border-r border-slate-300 flex-shrink-0 bg-slate-100" />
          <div className="flex-1 flex overflow-hidden">
             {[...Array(20)].map((_, i) => (
                 <div key={i} className="min-w-[100px] h-full border-r border-slate-300 bg-slate-50 flex items-center justify-center">
                    <div className="w-8 h-3 bg-slate-200/50 rounded animate-pulse" />
                 </div>
             ))}
          </div>
      </div>
      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
          <div className="w-[46px] border-r border-slate-300 bg-slate-50 flex flex-col h-full overflow-hidden">
              {[...Array(40)].map((_, i) => (
                  <div key={i} className="h-[28px] border-b border-slate-300 flex-shrink-0 flex items-center justify-center">
                     <div className="w-4 h-3 bg-slate-200/50 rounded animate-pulse" />
                  </div>
              ))}
          </div>
          <div className="flex-1 relative bg-white">
              <div 
                  className="absolute inset-0 opacity-50" 
                  style={{
                      backgroundImage: 'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)',
                      backgroundSize: '100px 28px'
                  }}
              />
              <div className="absolute inset-0 p-2 grid grid-cols-6 gap-8 opacity-30">
                  <div className="w-32 h-4 bg-slate-200 rounded animate-pulse col-start-2 row-start-2" />
                  <div className="w-24 h-4 bg-slate-200 rounded animate-pulse col-start-3 row-start-4" />
                  <div className="w-40 h-4 bg-slate-200 rounded animate-pulse col-start-1 row-start-10" />
                  <div className="w-20 h-4 bg-slate-200 rounded animate-pulse col-start-4 row-start-6" />
              </div>
          </div>
      </div>
  </div>
);

export const AppSkeleton = () => (
  <div className="flex flex-col h-[100dvh] bg-slate-50 font-sans text-slate-900 overflow-hidden">
    <ToolbarSkeleton />
    <FormulaBarSkeleton />
    <div className="flex-1 overflow-hidden relative flex flex-col z-0">
       <GridSkeleton />
    </div>
    <SheetTabsSkeleton />
    <StatusBarSkeleton />
  </div>
);