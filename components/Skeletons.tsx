import React from 'react';
import { Skeleton } from './ui/Skeleton';

export const RibbonSkeleton = () => {
  // mimics the layout of a typical ribbon tab (e.g. Home tab)
  return (
    <div className="flex items-stretch h-full px-2 md:px-4 py-2 gap-2 overflow-hidden">
      {/* Group 1: Clipboard-like */}
      <div className="flex flex-col gap-1 pr-2 border-r border-slate-200/60 min-w-[60px]">
        <div className="flex gap-1 h-full">
           <Skeleton className="w-14 h-full rounded-md" /> {/* Large Paste button */}
           <div className="flex flex-col gap-1 justify-center">
             <Skeleton className="w-16 h-5" />
             <Skeleton className="w-16 h-5" />
             <Skeleton className="w-16 h-5" />
           </div>
        </div>
      </div>

      {/* Group 2: Font-like */}
      <div className="flex flex-col gap-1 px-2 border-r border-slate-200/60 min-w-[140px]">
        <div className="flex gap-1 mb-1">
           <Skeleton className="w-28 h-7" /> {/* Font Family */}
           <Skeleton className="w-12 h-7" /> {/* Font Size */}
        </div>
        <div className="flex gap-1">
           <Skeleton className="w-7 h-7" />
           <Skeleton className="w-7 h-7" />
           <Skeleton className="w-7 h-7" />
           <div className="w-[1px] h-6 bg-slate-200 mx-1" />
           <Skeleton className="w-7 h-7" />
           <Skeleton className="w-7 h-7" />
        </div>
      </div>

      {/* Group 3: Alignment-like */}
      <div className="flex gap-2 px-2 border-r border-slate-200/60">
         <div className="flex flex-col gap-1 justify-center">
            <div className="flex gap-1">
              <Skeleton className="w-7 h-5" />
              <Skeleton className="w-7 h-5" />
              <Skeleton className="w-7 h-5" />
            </div>
            <div className="flex gap-1">
              <Skeleton className="w-7 h-5" />
              <Skeleton className="w-7 h-5" />
              <Skeleton className="w-7 h-5" />
            </div>
         </div>
         <div className="flex flex-col gap-1 justify-center">
            <Skeleton className="w-24 h-6" />
            <Skeleton className="w-24 h-6" />
         </div>
      </div>

      {/* Group 4: Styles (Large buttons) */}
      <div className="hidden md:flex gap-1 px-2 border-r border-slate-200/60 items-center">
         <Skeleton className="w-14 h-[80%] rounded-md" />
         <Skeleton className="w-14 h-[80%] rounded-md" />
         <Skeleton className="w-14 h-[80%] rounded-md" />
      </div>

      {/* Group 5: Cells (Small buttons stack) */}
      <div className="hidden lg:flex flex-col gap-1 justify-center px-2">
         <Skeleton className="w-20 h-5" />
         <Skeleton className="w-20 h-5" />
         <Skeleton className="w-20 h-5" />
      </div>
    </div>
  );
};

export const ToolbarSkeleton = () => {
  return (
    <div className="flex flex-col bg-[#0f172a] shadow-soft z-50">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 h-11 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
             <Skeleton className="w-9 h-9 rounded bg-white/10" />
             <Skeleton className="w-16 h-4 bg-white/10" />
          </div>
          <div className="flex items-center gap-2 ml-4">
             <Skeleton className="w-8 h-8 rounded-full bg-white/5" />
             <Skeleton className="w-8 h-8 rounded-full bg-white/5" />
             <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
             <Skeleton className="w-20 h-8 rounded-full bg-white/10" />
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Skeleton className="w-64 h-8 rounded bg-white/10 hidden lg:block" />
           <Skeleton className="w-8 h-8 rounded-full bg-indigo-600/50" />
        </div>
      </div>

      {/* Tab Headers */}
      <div className="flex items-end px-4 pt-1 gap-1">
          {[1, 2, 3, 4, 5, 6].map((i) => (
             <Skeleton key={i} className={`h-8 rounded-t-md ${i === 1 ? 'bg-[#f8fafc] w-16' : 'bg-white/5 w-16 mb-1'}`} />
          ))}
      </div>

      {/* Ribbon Body */}
      <div className="h-[100px] bg-[#f8fafc] border-b border-slate-200">
         <RibbonSkeleton />
      </div>
    </div>
  );
};

export const FormulaBarSkeleton = () => {
  return (
    <div className="flex items-center h-12 px-4 border-b border-slate-200 bg-white gap-3">
       <Skeleton className="w-14 h-8 rounded-[4px]" />
       <div className="w-[1px] h-5 bg-slate-200 hidden md:block"></div>
       <div className="flex items-center gap-1 hidden md:flex">
          <Skeleton className="w-6 h-6 rounded" />
          <Skeleton className="w-6 h-6 rounded" />
          <Skeleton className="w-6 h-6 rounded ml-1" />
       </div>
       <Skeleton className="flex-1 h-8 rounded-sm" />
    </div>
  );
};

export const GridSkeleton = () => {
  return (
    <div className="flex-1 overflow-hidden bg-white relative w-full h-full flex flex-col">
       {/* Header Row */}
       <div className="flex h-7 border-b border-slate-200 w-full">
          <div className="w-[46px] h-full bg-slate-100 border-r border-slate-300 flex-shrink-0" />
          <div className="flex-1 flex overflow-hidden">
             {Array.from({ length: 15 }).map((_, i) => (
                 <div key={i} className="w-[100px] h-full border-r border-slate-200 bg-slate-50 flex items-center justify-center">
                    <Skeleton className="w-4 h-3 bg-slate-200/50" />
                 </div>
             ))}
          </div>
       </div>
       
       {/* Body */}
       <div className="flex-1 flex overflow-hidden">
          {/* Row Headers */}
          <div className="w-[46px] h-full flex flex-col border-r border-slate-200 bg-slate-50 flex-shrink-0 overflow-hidden">
             {Array.from({ length: 25 }).map((_, i) => (
                <div key={i} className="h-7 border-b border-slate-200 flex items-center justify-center">
                   <Skeleton className="w-3 h-3 bg-slate-200/50" />
                </div>
             ))}
          </div>
          {/* Grid Cells Pattern */}
          <div className="flex-1 flex flex-col overflow-hidden">
             {Array.from({ length: 25 }).map((_, r) => (
                <div key={r} className="h-7 flex border-b border-slate-100">
                   {Array.from({ length: 10 }).map((_, c) => (
                      <div key={c} className="w-[100px] border-r border-slate-100 h-full p-1">
                          {/* Randomly place some fake content ghosts to look active */}
                          {(r + c) % 7 === 0 && <Skeleton className="w-16 h-3 rounded-sm mt-1" />}
                      </div>
                   ))}
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};

export const FooterSkeleton = () => {
    return (
        <div className="flex flex-col">
            {/* Sheet Tabs */}
            <div className="h-10 bg-slate-100 border-t border-slate-300 flex items-end px-2 gap-1">
                <div className="flex items-center gap-0.5 mr-2 mb-2">
                    <Skeleton className="w-4 h-4 rounded" />
                    <Skeleton className="w-4 h-4 rounded" />
                </div>
                <div className="w-24 h-8 bg-white rounded-t-md shadow-sm border-t-2 border-emerald-500 relative -mb-[1px] z-10 flex items-center justify-center">
                     <Skeleton className="w-16 h-3" />
                </div>
                <div className="w-24 h-7 bg-transparent rounded-t-md mb-0.5 flex items-center justify-center">
                     <Skeleton className="w-16 h-3 bg-slate-200" />
                </div>
                <div className="ml-2 mb-2">
                    <Skeleton className="w-6 h-6 rounded-full" />
                </div>
            </div>
            
            {/* Status Bar */}
            <div className="h-8 bg-[#f8f9fa] border-t border-slate-300 flex items-center justify-between px-4">
                 <div className="flex items-center gap-4">
                     <Skeleton className="w-16 h-3" />
                     <Skeleton className="w-24 h-3 hidden md:block" />
                 </div>
                 <div className="flex items-center gap-4">
                     <div className="hidden lg:flex gap-1">
                         <Skeleton className="w-6 h-6 rounded" />
                         <Skeleton className="w-6 h-6 rounded" />
                         <Skeleton className="w-6 h-6 rounded" />
                     </div>
                     <div className="flex items-center gap-2">
                         <Skeleton className="w-4 h-4 rounded-full" />
                         <Skeleton className="w-24 h-2 rounded-full" />
                         <Skeleton className="w-4 h-4 rounded-full" />
                         <Skeleton className="w-10 h-4 rounded ml-2" />
                     </div>
                 </div>
            </div>
        </div>
    )
}

export const AppSkeleton = () => {
  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 font-sans text-slate-900 overflow-hidden">
        <ToolbarSkeleton />
        <FormulaBarSkeleton />
        <GridSkeleton />
        <FooterSkeleton />
    </div>
  );
};
