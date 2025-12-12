import React from 'react';
import { motion } from 'framer-motion';

export const TabSkeleton = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex h-full min-w-max gap-1 items-center px-1"
    >
      {/* Simulate typical ribbon groups */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col h-full px-2 border-r border-slate-200 last:border-r-0 gap-1.5 min-w-[80px]">
          <div className="flex-1 flex gap-2 items-center justify-center pt-2">
            <div 
              className="h-8 w-8 bg-slate-200 rounded animate-pulse" 
              style={{ animationDelay: `${i * 100}ms` }} 
            />
            <div className="flex flex-col gap-1.5">
               <div 
                 className="h-2.5 w-12 bg-slate-200 rounded animate-pulse" 
                 style={{ animationDelay: `${i * 150}ms` }} 
               />
               <div 
                 className="h-2.5 w-8 bg-slate-200/70 rounded animate-pulse" 
                 style={{ animationDelay: `${i * 200}ms` }} 
               />
            </div>
          </div>
          <div className="h-3 w-12 mx-auto bg-slate-100 rounded animate-pulse mb-1" />
        </div>
      ))}

      {/* Simulate a complex group (like Styles or Charts) */}
      <div className="flex flex-col h-full px-2 border-r border-slate-200 gap-1 min-w-[140px]">
         <div className="flex-1 grid grid-cols-3 gap-1 content-center pt-1">
             {[1, 2, 3, 4, 5, 6].map(k => (
                <div key={k} className="h-6 w-full bg-slate-200/60 rounded animate-pulse" />
             ))}
         </div>
         <div className="h-3 w-16 mx-auto bg-slate-100 rounded animate-pulse mb-1" />
      </div>

      {/* Simulate large button group */}
      <div className="flex items-center h-full px-2 border-r border-slate-200 gap-1">
          <div className="flex flex-col items-center justify-center gap-1 h-full pt-1 px-1">
              <div className="h-9 w-9 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-10 bg-slate-100 rounded animate-pulse" />
          </div>
          <div className="flex flex-col items-center justify-center gap-1 h-full pt-1 px-1">
              <div className="h-9 w-9 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-10 bg-slate-100 rounded animate-pulse" />
          </div>
      </div>
      
      {/* Filler to fade out */}
      <div className="flex-1 flex items-center px-4 opacity-30">
         <div className="h-8 w-8 bg-slate-100 rounded-full animate-pulse mr-2" />
         <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
      </div>
    </motion.div>
  );
};