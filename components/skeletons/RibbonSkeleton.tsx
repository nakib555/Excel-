import React from 'react';
import { Skeleton } from '../ui/Skeleton';

export const RibbonSkeleton = () => {
  return (
    <div className="flex h-full min-w-max gap-1 animate-in fade-in duration-300">
        {/* Mock Group 1 */}
        <div className="flex flex-col h-full px-2 border-r border-slate-200 gap-1 min-w-[100px] justify-center">
            <div className="flex items-center justify-center gap-2">
                 <Skeleton className="w-10 h-10 rounded-md" />
                 <div className="flex flex-col gap-1">
                    <Skeleton className="w-20 h-4 rounded-sm" />
                    <Skeleton className="w-16 h-4 rounded-sm" />
                 </div>
            </div>
            <Skeleton className="w-12 h-2.5 mx-auto mt-auto mb-1" />
        </div>

        {/* Mock Group 2 */}
        <div className="flex flex-col h-full px-2 border-r border-slate-200 gap-1 min-w-[140px]">
            <div className="flex items-center gap-1 h-full py-1">
                 <Skeleton className="w-8 h-full rounded-md" />
                 <Skeleton className="w-8 h-full rounded-md" />
                 <div className="flex flex-col gap-1 h-full justify-center">
                     <Skeleton className="w-24 h-6 rounded-sm" />
                     <div className="flex gap-1">
                        <Skeleton className="w-6 h-6 rounded-sm" />
                        <Skeleton className="w-6 h-6 rounded-sm" />
                        <Skeleton className="w-6 h-6 rounded-sm" />
                     </div>
                 </div>
            </div>
            <Skeleton className="w-16 h-2.5 mx-auto mt-auto mb-1" />
        </div>

        {/* Mock Group 3 */}
        <div className="flex flex-col h-full px-2 gap-1 min-w-[120px]">
            <div className="flex items-center gap-2 h-full justify-center">
                 <div className="flex flex-col gap-1">
                    <Skeleton className="w-8 h-8 rounded-md" />
                    <Skeleton className="w-8 h-2 rounded-sm" />
                 </div>
                 <div className="flex flex-col gap-1">
                    <Skeleton className="w-8 h-8 rounded-md" />
                    <Skeleton className="w-8 h-2 rounded-sm" />
                 </div>
                 <div className="flex flex-col gap-1">
                    <Skeleton className="w-8 h-8 rounded-md" />
                    <Skeleton className="w-8 h-2 rounded-sm" />
                 </div>
            </div>
            <Skeleton className="w-20 h-2.5 mx-auto mt-auto mb-1" />
        </div>
    </div>
  );
};