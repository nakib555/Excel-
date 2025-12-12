
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils';

// Reusable shiny skeleton component
const Skel = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <div className={cn("skeleton-shine rounded-sm", className)} style={style} />
);

export const CellSkeleton = ({ width, height }: { width: number; height: number }) => (
  <div 
    style={{ 
      width, 
      height, 
      minWidth: width, 
      minHeight: height 
    }} 
    className="border-r border-b border-slate-100 bg-white box-border overflow-hidden select-none relative p-1"
  >
    <Skel className="w-full h-full rounded-sm opacity-50" />
  </div>
);

export const TabItemSkeleton = () => (
    <div className="flex items-center px-4 py-1.5 min-w-[100px] h-full justify-center bg-transparent border-t-2 border-transparent">
        <Skel className="w-16 h-4" />
    </div>
);

const GroupSkeleton = () => (
  <div className="flex flex-col h-full px-3 border-r border-slate-200/60 last:border-r-0 flex-shrink-0">
    <div className="flex-1 flex gap-2 items-center justify-center py-1">
       {/* Mock Large Button */}
       <div className="flex flex-col items-center gap-1.5 min-w-[50px]">
          <Skel className="w-9 h-9 rounded-md" />
          <Skel className="w-12 h-2.5" />
       </div>
       
       {/* Mock Column of small buttons */}
       <div className="flex flex-col gap-1.5 h-full justify-center min-w-[80px]">
          <div className="flex items-center gap-2">
             <Skel className="w-4 h-4 rounded-sm" />
             <Skel className="w-16 h-2.5" />
          </div>
          <div className="flex items-center gap-2">
             <Skel className="w-4 h-4 rounded-sm" />
             <Skel className="w-14 h-2.5" />
          </div>
          <div className="flex items-center gap-2">
             <Skel className="w-4 h-4 rounded-sm" />
             <Skel className="w-10 h-2.5" />
          </div>
       </div>

        {/* Mock Large Button 2 */}
       <div className="flex flex-col items-center gap-1.5 min-w-[50px] ml-1">
          <Skel className="w-9 h-9 rounded-md" />
          <Skel className="w-10 h-2.5" />
       </div>
    </div>
    
    {/* Group Label */}
    <div className="h-[18px] flex items-center justify-center pb-1 mt-auto">
         <Skel className="w-14 h-2" />
    </div>
  </div>
);

export const RibbonSkeleton = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-full w-full items-center gap-0 overflow-hidden px-1 pointer-events-none select-none"
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
    <div className="h-11 bg-[#0f172a] flex items-center justify-between px-4 w-full border-b border-slate-700/50">
       <div className="flex items-center gap-4">
          <Skel className="w-9 h-9 rounded bg-white/10" />
          <Skel className="w-24 h-4 bg-white/10" />
          <div className="flex gap-2 ml-4">
              <Skel className="w-6 h-6 rounded-full bg-white/10" />
              <Skel className="w-6 h-6 rounded-full bg-white/10" />
              <div className="w-[1px] h-4 bg-slate-700 mx-1"></div>
              <Skel className="w-16 h-6 rounded-full bg-white/10" />
          </div>
       </div>
       <div className="flex items-center gap-3">
           <Skel className="w-48 h-8 rounded bg-slate-800 hidden md:block" />
           <Skel className="w-8 h-8 rounded-full bg-indigo-600/50" />
       </div>
    </div>
    
    {/* Tabs Bar */}
    <div className="h-[37px] bg-[#0f172a] px-4 flex items-end gap-1 pt-1 overflow-hidden">
        {['Home', 'Insert', 'Draw', 'Page Layout', 'Formulas', 'Data'].map((tab, i) => (
            <div key={i} className={`w-16 h-8 rounded-t-md mb-1 skeleton-shine ${i === 0 ? 'bg-slate-100 opacity-90' : 'bg-white/10'}`} />
        ))}
    </div>

    {/* Ribbon Area */}
    <div className="h-[100px] bg-[#f8fafc] border-b border-slate-200 flex items-center px-4 py-2 gap-2 overflow-hidden">
        <div className="flex flex-col h-full gap-2 justify-center px-2 border-r border-slate-200">
             <div className="flex gap-2">
                 <Skel className="w-10 h-10 rounded-md" />
                 <div className="flex flex-col gap-1 justify-center">
                     <Skel className="w-8 h-3" />
                     <Skel className="w-6 h-3" />
                 </div>
             </div>
             <Skel className="w-12 h-2.5 mx-auto mt-1" />
        </div>
        
        <div className="flex flex-col h-full gap-2 justify-center px-4 border-r border-slate-200 min-w-[200px]">
             <div className="flex gap-2 w-full mb-1">
                 <Skel className="w-28 h-7 rounded-sm" />
                 <Skel className="w-12 h-7 rounded-sm" />
             </div>
             <div className="flex gap-1 w-full justify-between">
                 <Skel className="w-6 h-6 rounded-sm" />
                 <Skel className="w-6 h-6 rounded-sm" />
                 <Skel className="w-6 h-6 rounded-sm" />
                 <div className="w-[1px] h-6 bg-slate-200 mx-1"></div>
                 <Skel className="w-6 h-6 rounded-sm" />
                 <Skel className="w-6 h-6 rounded-sm" />
                 <Skel className="w-6 h-6 rounded-sm" />
             </div>
             <Skel className="w-12 h-2.5 mx-auto mt-auto" />
        </div>

        <div className="flex flex-col h-full gap-2 justify-center px-2 border-r border-slate-200 flex-1">
             <div className="flex gap-4 h-full items-center pl-2">
                 <Skel className="w-12 h-12 rounded-lg" />
                 <Skel className="w-12 h-12 rounded-lg" />
                 <Skel className="w-12 h-12 rounded-lg" />
             </div>
             <Skel className="w-16 h-2.5 mx-auto" />
        </div>
    </div>
  </div>
);

export const FormulaBarSkeleton = () => (
  <div className="flex items-center h-12 px-4 border-b border-slate-200 bg-white gap-3 shadow-sm z-30 select-none">
    <Skel className="w-14 h-8 bg-slate-100 border border-slate-200" />
    <div className="w-[1px] h-5 bg-slate-300 hidden md:block" />
    <div className="flex items-center gap-2 text-slate-300">
        <Skel className="w-4 h-4 rounded-sm bg-slate-100" />
        <Skel className="w-4 h-4 rounded-sm bg-slate-100" />
        <Skel className="w-4 h-4 rounded-sm bg-slate-100" />
    </div>
    <Skel className="flex-1 h-8 bg-slate-50 border border-transparent" />
  </div>
);

export const SheetTabsSkeleton = () => (
    <div className="flex items-center h-10 bg-slate-100 border-t border-slate-300 px-2 gap-1 select-none z-40">
        <div className="flex gap-1 mr-2">
             <Skel className="w-5 h-5 rounded-sm" />
             <Skel className="w-5 h-5 rounded-sm" />
        </div>
        <div className="flex items-end gap-1 h-full pt-1">
            <div className="w-24 h-full bg-white border-t-2 border-slate-300 rounded-t-md shadow-sm relative overflow-hidden">
                <div className="absolute top-2 left-3 w-16 h-3 bg-slate-200 rounded skeleton-shine" />
            </div>
            <div className="w-24 h-full bg-slate-200/50 rounded-t-md relative overflow-hidden border-t-2 border-transparent">
                <div className="absolute top-2 left-3 w-16 h-3 bg-slate-300/50 rounded skeleton-shine" />
            </div>
             <div className="w-24 h-full bg-slate-200/50 rounded-t-md relative overflow-hidden border-t-2 border-transparent">
                <div className="absolute top-2 left-3 w-16 h-3 bg-slate-300/50 rounded skeleton-shine" />
            </div>
        </div>
        <Skel className="ml-2 w-6 h-6 rounded-full" />
    </div>
);

export const StatusBarSkeleton = () => (
    <div className="h-9 bg-[#0f172a] border-t border-slate-700 flex items-center justify-between px-4 select-none z-50">
        <div className="flex items-center gap-3">
             <Skel className="w-16 h-3 bg-white/10" />
        </div>
        <div className="flex items-center gap-3">
             <Skel className="w-16 h-3 bg-white/10 hidden md:block" />
             <Skel className="w-24 h-3 bg-white/10" />
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
                 <div key={i} className="min-w-[100px] h-full border-r border-slate-300 bg-slate-50 flex items-center justify-center p-1">
                    <Skel className="w-12 h-3 bg-slate-200/50" />
                 </div>
             ))}
          </div>
      </div>
      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
          <div className="w-[46px] border-r border-slate-300 bg-slate-50 flex flex-col h-full overflow-hidden">
              {[...Array(40)].map((_, i) => (
                  <div key={i} className="h-[28px] border-b border-slate-300 flex-shrink-0 flex items-center justify-center">
                     <Skel className="w-4 h-3 bg-slate-200/50" />
                  </div>
              ))}
          </div>
          <div className="flex-1 relative bg-white">
              {/* Background Grid Pattern */}
              <div 
                  className="absolute inset-0 opacity-50" 
                  style={{
                      backgroundImage: 'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)',
                      backgroundSize: '100px 28px'
                  }}
              />
              {/* Scattered Ghost Cells */}
              <div className="absolute inset-0 p-2 grid grid-cols-6 gap-y-12 gap-x-8 opacity-60">
                  <Skel className="w-full h-4 col-start-2 row-start-2 bg-slate-100" />
                  <Skel className="w-2/3 h-4 col-start-3 row-start-4 bg-slate-100" />
                  <Skel className="w-full h-4 col-start-1 row-start-6 bg-slate-100" />
                  <Skel className="w-3/4 h-4 col-start-4 row-start-8 bg-slate-100" />
                  <Skel className="w-full h-4 col-start-2 row-start-10 bg-slate-100" />
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
