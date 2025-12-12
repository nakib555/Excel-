import React from 'react';
import { Skeleton } from '../ui/Skeleton';

export const AppSkeleton = () => {
  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 overflow-hidden font-sans">
      {/* 1. Window / Quick Access Bar */}
      <div className="flex items-center justify-between px-4 h-11 bg-[#0f172a] shrink-0 z-50">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
               <Skeleton className="w-9 h-9 rounded bg-white/10" shimmer={false} />
               <Skeleton className="w-16 h-4 bg-white/10" shimmer={false} />
            </div>
            <div className="flex items-center gap-2 ml-4">
                <Skeleton className="w-6 h-6 rounded-full bg-white/10" shimmer={false} />
                <Skeleton className="w-6 h-6 rounded-full bg-white/10" shimmer={false} />
                <div className="w-[1px] h-4 bg-slate-700 mx-1"></div>
                <Skeleton className="w-16 h-6 rounded bg-white/10" shimmer={false} />
            </div>
         </div>
         <div className="flex items-center gap-3">
             <Skeleton className="w-48 h-7 bg-white/10 rounded-md hidden md:block" shimmer={false} />
             <Skeleton className="w-8 h-8 rounded-full bg-indigo-600/50" shimmer={false} />
         </div>
      </div>

      {/* 2. Tab Navigation */}
      <div className="bg-[#0f172a] px-2 md:px-4 flex items-end pt-1 gap-1 shrink-0">
         {['Home', 'Insert', 'Draw', 'Page Layout', 'Formulas'].map((t, i) => (
             <div key={t} className={`h-8 w-16 md:w-20 rounded-t-md relative top-[1px] ${i === 0 ? 'bg-slate-50' : 'bg-white/5'}`}>
                 {i === 0 && <div className="absolute inset-0 bg-white/50 animate-pulse rounded-t-md opacity-20"></div>}
             </div>
         ))}
      </div>

      {/* 3. The Ribbon */}
      <div className="bg-[#f8fafc] border-b border-slate-200 h-[100px] shrink-0 p-2 flex gap-1 overflow-hidden">
          {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-full border-r border-slate-200 px-2 flex flex-col items-center justify-center gap-2 min-w-[80px]">
                  <div className="flex gap-2">
                      <Skeleton className="w-10 h-10 rounded-md" />
                      {i % 2 === 0 && <Skeleton className="w-10 h-10 rounded-md" />}
                  </div>
                  <Skeleton className="w-12 h-2.5" />
              </div>
          ))}
      </div>

      {/* 4. Formula Bar */}
      <div className="flex items-center h-12 px-2 md:px-4 border-b border-slate-200 bg-white gap-3 shrink-0">
          <Skeleton className="w-14 h-8 rounded-sm" />
          <div className="w-[1px] h-5 bg-slate-300 hidden md:block"></div>
          <Skeleton className="w-6 h-6 rounded-full hidden md:block" />
          <Skeleton className="w-6 h-6 rounded-full hidden md:block" />
          <Skeleton className="flex-1 h-8 rounded-sm" />
      </div>

      {/* 5. Grid Area */}
      <div className="flex-1 bg-white relative overflow-hidden flex flex-col">
          {/* Header Row */}
          <div className="flex h-7 border-b border-slate-300 bg-slate-50 shrink-0">
              <div className="w-12 border-r border-slate-300 bg-slate-100 shrink-0" />
              {Array.from({length: 12}).map((_, i) => (
                  <div key={i} className="flex-1 border-r border-slate-300 min-w-[80px] flex items-center justify-center">
                      <Skeleton className="w-4 h-3 bg-slate-200/50" />
                  </div>
              ))}
          </div>
          {/* Rows */}
          <div className="flex-1 overflow-hidden">
              {Array.from({length: 15}).map((_, r) => (
                  <div key={r} className="flex h-7 border-b border-slate-200">
                      <div className="w-12 border-r border-slate-300 bg-slate-50 shrink-0 flex items-center justify-center">
                          <Skeleton className="w-3 h-3 bg-slate-200/50" />
                      </div>
                      {Array.from({length: 12}).map((_, c) => (
                          <div key={c} className="flex-1 border-r border-slate-100 min-w-[80px] p-1">
                               {(r === 1 && c === 2) && <Skeleton className="w-16 h-4" />}
                               {(r === 3 && c === 1) && <Skeleton className="w-12 h-4" />}
                               {(r === 5 && c === 4) && <Skeleton className="w-20 h-4" />}
                          </div>
                      ))}
                  </div>
              ))}
          </div>
      </div>

      {/* 6. Footer Tabs & Status */}
      <div className="flex items-center h-9 bg-slate-100 border-t border-slate-300 px-1 shrink-0 justify-between">
          <div className="flex items-end h-full gap-1">
              <div className="w-24 h-7 bg-white border-t-2 border-emerald-500 rounded-t shadow-sm flex items-center justify-center">
                   <Skeleton className="w-16 h-3" />
              </div>
              <Skeleton className="w-6 h-6 rounded-full ml-2" />
          </div>
          <div className="flex items-center gap-4 px-4">
              <Skeleton className="w-16 h-3" />
              <Skeleton className="w-24 h-3" />
          </div>
      </div>
    </div>
  );
};