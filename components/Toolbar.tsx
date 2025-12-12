import React, { useState, memo, lazy, Suspense } from 'react';
import { 
  Undo, Redo, Download, Search, Sparkles, Grid3X3 
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { DraggableScrollContainer } from './tabs/shared';
import { cn } from '../utils';
import { RibbonSkeleton } from './Skeletons';

// Lazy imports for Tabs from the new 'tabs' directory
const HomeTab = lazy(() => import('./tabs/Home/HomeTab'));
const InsertTab = lazy(() => import('./tabs/Insert/InsertTab'));
const DrawTab = lazy(() => import('./tabs/Draw/DrawTab'));
const PageLayoutTab = lazy(() => import('./tabs/PageLayout/PageLayoutTab'));
const FormulasTab = lazy(() => import('./tabs/Formulas/FormulasTab'));
const DataTab = lazy(() => import('./tabs/Data/DataTab'));
const ReviewTab = lazy(() => import('./tabs/Review/ReviewTab'));
const ViewTab = lazy(() => import('./tabs/View/ViewTab'));
const AutomateTab = lazy(() => import('./tabs/Automate/AutomateTab'));
const FileTab = lazy(() => import('./tabs/File/FileTab'));

const TABS = ['File', 'Home', 'Insert', 'Draw', 'Page Layout', 'Formulas', 'Data', 'Review', 'View', 'Automate'];

const Toolbar: React.FC<any> = (props) => {
  const [activeTab, setActiveTab] = useState('Home');

  return (
    <div className="flex flex-col bg-[#0f172a] z-40 select-none shadow-soft transition-all">
      
      {/* 1. Window / Quick Access Bar */}
      <div className="flex items-center justify-between px-4 h-11 bg-[#0f172a] text-white z-10">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
               <div className="grid place-items-center w-9 h-9 rounded hover:bg-white/10 transition-colors cursor-pointer">
                 <Grid3X3 size={20} className="text-emerald-400" />
               </div>
               <span className="text-sm font-semibold tracking-wide text-white">Excel</span>
            </div>
            
             <div className="flex items-center gap-2 ml-4">
                <button title="Undo" className="p-1.5 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors"><Undo size={16} className="text-blue-300" /></button>
                <button title="Redo" className="p-1.5 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors"><Redo size={16} className="text-blue-300" /></button>
                <div className="w-[1px] h-4 bg-slate-700 mx-1"></div>
                <button onClick={props.onExport} title="Save/Export" className="p-1.5 px-3 hover:bg-white/10 rounded-full text-slate-300 hover:text-white flex items-center gap-2 transition-colors">
                     <Download size={16} className="text-green-400" />
                     <span className="text-xs font-medium hidden md:block">Save</span>
                </button>
                
                <div className="hidden md:flex items-center bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-md transition-colors cursor-pointer border border-white/5 ml-2">
                    <span className="text-xs font-medium text-slate-200">Book1</span>
                    <span className="mx-2 text-slate-500 text-[10px]">•</span>
                    <span className="text-[10px] text-slate-400">Saved</span>
                </div>
            </div>
         </div>
         
         <div className="flex items-center gap-3">
            <div className="relative group hidden lg:block">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search" 
                    className="h-8 w-64 bg-slate-800/50 border border-slate-700/50 rounded-md text-xs text-white placeholder-slate-400 pl-9 pr-4 focus:outline-none focus:bg-slate-800 focus:border-blue-500/50 transition-all"
                />
            </div>
             <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-md ring-2 ring-[#0f172a] ml-2 cursor-pointer hover:bg-indigo-500 transition-colors">
                JD
             </div>
         </div>
      </div>

      {/* 2. Tab Navigation */}
      <div className="bg-[#0f172a] px-2 md:px-4 flex items-end justify-between pt-1">
        <DraggableScrollContainer className="flex items-end gap-1">
            {TABS.map(tab => {
                const isActive = activeTab === tab;
                return (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "relative px-4 py-2 text-[13px] transition-all duration-150 whitespace-nowrap flex-shrink-0 select-none rounded-t-md outline-none",
                            isActive 
                                ? "bg-[#f8fafc] text-[#4f46e5] font-bold shadow-none z-10 pb-2.5 -mb-0.5" 
                                : "text-slate-200 hover:bg-white/10 hover:text-white mb-1 font-medium"
                        )}
                    >
                        {tab}
                    </button>
                );
            })}
        </DraggableScrollContainer>

        <button
            className="hidden md:flex relative px-4 py-2 mb-1 text-[12px] font-medium text-indigo-300 hover:text-white hover:bg-white/5 rounded-md transition-all whitespace-nowrap flex-shrink-0 select-none items-center gap-1.5"
        >
            <Sparkles size={14} className="text-yellow-400" />
            <span>AI Assistant</span>
        </button>
      </div>

      {/* 3. The Ribbon */}
      <div className="bg-[#f8fafc] border-b border-slate-200 shadow-sm z-0 relative">
      <DraggableScrollContainer className="h-[100px] flex items-stretch px-2 md:px-4 w-full">
          <AnimatePresence mode='wait'>
                {activeTab === 'Home' && (
                    <Suspense key="home-suspense" fallback={<RibbonSkeleton />}>
                        <HomeTab {...props} key="home" />
                    </Suspense>
                )}
                {activeTab === 'Insert' && (
                    <Suspense key="insert-suspense" fallback={<RibbonSkeleton />}>
                        <InsertTab {...props} key="insert" />
                    </Suspense>
                )}
                {activeTab === 'Draw' && (
                    <Suspense key="draw-suspense" fallback={<RibbonSkeleton />}>
                        <DrawTab {...props} key="draw" />
                    </Suspense>
                )}
                {activeTab === 'Page Layout' && (
                    <Suspense key="page-layout-suspense" fallback={<RibbonSkeleton />}>
                        <PageLayoutTab {...props} key="page-layout" />
                    </Suspense>
                )}
                {activeTab === 'Formulas' && (
                    <Suspense key="formulas-suspense" fallback={<RibbonSkeleton />}>
                        <FormulasTab {...props} key="formulas" />
                    </Suspense>
                )}
                {activeTab === 'Data' && (
                    <Suspense key="data-suspense" fallback={<RibbonSkeleton />}>
                        <DataTab {...props} key="data" />
                    </Suspense>
                )}
                {activeTab === 'Review' && (
                    <Suspense key="review-suspense" fallback={<RibbonSkeleton />}>
                        <ReviewTab {...props} key="review" />
                    </Suspense>
                )}
                {activeTab === 'View' && (
                    <Suspense key="view-suspense" fallback={<RibbonSkeleton />}>
                        <ViewTab {...props} key="view" />
                    </Suspense>
                )}
                {activeTab === 'Automate' && (
                    <Suspense key="automate-suspense" fallback={<RibbonSkeleton />}>
                        <AutomateTab {...props} key="automate" />
                    </Suspense>
                )}
                {activeTab === 'File' && (
                    <Suspense key="file-suspense" fallback={<RibbonSkeleton />}>
                        <FileTab {...props} key="file" />
                    </Suspense>
                )}
          </AnimatePresence>
      </DraggableScrollContainer>
      </div>
    </div>
  );
};

export default memo(Toolbar);