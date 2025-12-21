
import React from 'react';
import { cn } from '../utils';

/**
 * Robust Skeletons for React 19
 * Removed memo and framer-motion to prevent potential "undefined" component 
 * references that cause Minified React Error #306.
 */

// Simple shining overlay using CSS (defined in index.css as .skeleton-shine)
const Skel = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <div className={cn("skeleton-shine rounded-sm", className)} style={style} />
);

export const CellSkeleton = ({ width, height, className }: { width: number; height: number; className?: string }) => (
  <div 
    style={{ 
      width, 
      height, 
      minWidth: width, 
      minHeight: height,
      contain: 'strict'
    }} 
    className={cn(
      "border-r border-b border-slate-200 box-border overflow-hidden bg-white flex items-center justify-center p-1",
      className
    )}
  >
    <div className="w-full h-full bg-slate-100 rounded-sm" />
  </div>
);

export const GroupSkeleton = ({ width, className }: { width?: number | string; className?: string }) => (
  <div 
    className={cn("flex flex-col h-full border-r border-slate-200/50 last:border-r-0 flex-shrink-0 p-1 bg-white/5", className)}
    style={{ minWidth: width || 80, width }}
  >
    <div className="flex-1 w-full p-1.5 flex items-center justify-center">
       <div className="w-full h-full bg-slate-100 rounded border border-slate-200/50 skeleton-shine" />
    </div>
    <div className="h-[14px] w-full flex items-center justify-center mt-0.5 pb-0.5">
         <Skel className="h-1.5 w-12 opacity-30" />
    </div>
  </div>
);

export const RibbonSkeleton = () => {
  return (
    <div className="flex h-full w-full items-center gap-0 overflow-hidden px-1 pointer-events-none">
      <GroupSkeleton width={80} />
      <GroupSkeleton width={120} />
      <GroupSkeleton width={200} />
      <GroupSkeleton width={140} />
      <GroupSkeleton width={100} />
    </div>
  );
};

export const ToolbarSkeleton = () => (
  <div className="flex flex-col w-full bg-[#f8fafc] border-b border-slate-200 shadow-sm z-40">
    <div className="h-[37px] bg-[#0f172a] px-4 flex items-end gap-1 pt-1 overflow-hidden">
        {[...Array(6)].map((_, i) => (
            <div key={i} className={cn("w-16 h-8 rounded-t-md mb-1", i === 0 ? "bg-slate-100" : "bg-white/10")} />
        ))}
    </div>
    <div className="h-[100px] bg-[#f8fafc] border-b border-slate-200 flex items-center px-4 py-2 gap-2 overflow-hidden">
         <RibbonSkeleton />
    </div>
  </div>
);

export const FormulaBarSkeleton = () => (
  <div className="flex items-center h-12 px-4 border-b border-slate-200 bg-white gap-3 shadow-sm z-30">
    <Skel className="w-14 h-8 bg-slate-100 border border-slate-200" />
    <div className="w-[1px] h-5 bg-slate-300 hidden md:block" />
    <div className="flex-1 h-8 bg-slate-50 border border-transparent rounded-sm" />
  </div>
);

export const SheetTabsSkeleton = () => (
    <div className="flex items-center h-10 bg-slate-100 border-t border-slate-300 px-2 gap-1 z-40">
        <div className="flex gap-1 mr-2">
             <div className="w-5 h-5 bg-slate-200 rounded-sm" />
             <div className="w-5 h-5 bg-slate-200 rounded-sm" />
        </div>
        <div className="flex items-end gap-1 h-full pt-1">
            <div className="w-24 h-full bg-white border-t-2 border-emerald-500 rounded-t-md" />
            <div className="w-24 h-full bg-slate-200/50 rounded-t-md" />
        </div>
    </div>
);

export const StatusBarSkeleton = () => (
    <div className="h-9 bg-[#0f172a] border-t border-slate-700 flex items-center justify-between px-4 z-50">
        <div className="w-24 h-3 bg-white/10 rounded-full" />
        <div className="w-48 h-3 bg-white/10 rounded-full" />
    </div>
);

export const GridSkeleton = () => (
  <div className="flex-1 overflow-hidden relative w-full h-full bg-white flex flex-col">
      <div className="flex h-[28px] border-b border-slate-300 bg-slate-50">
          <div className="w-[46px] h-full border-r border-slate-300 flex-shrink-0 bg-slate-100" />
          <div className="flex-1 flex overflow-hidden">
             {[...Array(15)].map((_, i) => (
                 <div key={i} className="min-w-[100px] h-full border-r border-slate-300 bg-slate-50" />
             ))}
          </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
          <div className="w-[46px] border-r border-slate-300 bg-slate-50 h-full" />
          <div className="flex-1 relative bg-white skeleton-shine opacity-20" />
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

// --- Dropdown Skeletons ---

export const DropdownItemSkeleton = () => (
  <div className="flex items-center gap-3 px-4 py-2.5 w-full border-b border-slate-50 last:border-0">
    <Skel className="w-4 h-4 rounded-sm" />
    <Skel className="h-3 w-24 rounded-sm" />
  </div>
);

export const DropdownListSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="flex flex-col py-1 min-w-[180px] bg-white">
     {[...Array(count)].map((_, i) => <DropdownItemSkeleton key={i} />)}
  </div>
);

export const DropdownGridSkeleton = () => (
    <div className="p-4 grid grid-cols-4 gap-3 w-full min-w-[300px]">
        {[...Array(12)].map((_, i) => (
            <div key={i} className="skeleton-shine w-full h-10 rounded-md bg-slate-100" />
        ))}
    </div>
);
