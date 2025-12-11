import React, { useState, memo, Suspense } from 'react';
import { 
  FileSpreadsheet, Undo, Redo, Download, Search, Loader2, Sparkles, Grid3X3 
} from 'lucide-react';
import { CellStyle } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { DraggableScrollContainer, TabProps } from './toolbar/shared';
import { cn } from '../utils';

// Lazy loaded tabs
const HomeTab = React.lazy(() => import('./toolbar/HomeTab/index'));
const InsertTab = React.lazy(() => import('./toolbar/InsertTab/index'));
const DrawTab = React.lazy(() => import('./toolbar/DrawTab/index'));
const PageLayoutTab = React.lazy(() => import('./toolbar/PageLayoutTab/index'));
const FormulasTab = React.lazy(() => import('./toolbar/FormulasTab/index'));
const DataTab = React.lazy(() => import('./toolbar/DataTab/index'));
const ReviewTab = React.lazy(() => import('./toolbar/ReviewTab/index'));
const ViewTab = React.lazy(() => import('./toolbar/ViewTab/index'));
const AutomateTab = React.lazy(() => import('./toolbar/AutomateTab/index'));

const TABS = ['File', 'Home', 'Insert', 'Draw', 'Page Layout', 'Formulas', 'Data', 'Review', 'View', 'Automate'];

const TabLoading = () => (
    <div className="flex h-full w-full items-center justify-center p-4">
        <Loader2 className="animate-spin text-slate-300" size={24} />
    </div>
);

const Toolbar: React.FC<TabProps> = (props) => {
  const [activeTab, setActiveTab] = useState('Home');

  return (
    <div className="flex flex-col bg-[#0f172a] z-40 select-none shadow-soft transition-all">
      
      {/* 1. Window / Quick Access Bar */}
      <div className="flex items-center justify-between px-4 h-11 bg-[#0f172a] text-white z-10">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
               <div className="grid place-items-center w-9 h-9 rounded hover:bg-white/10 transition-colors cursor-pointer">
                 <Grid3X3 size={20} className="text-white" />
               </div>
               <span className="text-sm font-semibold tracking-wide text-white">Excel</span>
            </div>
            
             <div className="flex items-center gap-2 ml-4">
                <button title="Undo" className="p-1.5 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors"><Undo size={16} /></button>
                <button title="Redo" className="p-1.5 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors"><Redo size={16} /></button>
                <div className="w-[1px] h-4 bg-slate-700 mx-1"></div>
                <button onClick={props.onExport} title="Save/Export" className="p-1.5 px-3 hover:bg-white/10 rounded-full text-slate-300 hover:text-white flex items-center gap-2 transition-colors">
                     <Download size={16} />
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
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-200 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search" 
                    className="h-8 w-64 bg-slate-800/50 border border-slate-700/50 rounded-md text-xs text-white placeholder-slate-400 pl-9 pr-4 focus:outline-none focus:bg-slate-800 focus:border-slate-600 transition-all"
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
                            "relative px-4 py-2 text-[13px] font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 select-none rounded-t-lg",
                            isActive 
                                ? "bg-[#f8fafc] text-[#4f46e5] shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-10 pb-2.5 -mb-0.5" 
                                : "text-slate-300 hover:bg-slate-800 hover:text-white mb-1"
                        )}
                    >
                        {tab}
                        {isActive && (
                             <motion.div 
                                layoutId="activeTabIndicator"
                                className="absolute top-0 left-0 right-0 h-0.5 bg-[#4f46e5] rounded-t-lg opacity-0" 
                             />
                        )}
                    </button>
                );
            })}
        </DraggableScrollContainer>

        <button
            className="hidden md:flex relative px-4 py-2 mb-1 text-[12px] font-medium text-indigo-300 hover:text-white hover:bg-white/5 rounded-md transition-all whitespace-nowrap flex-shrink-0 select-none items-center gap-1.5"
        >
            <Sparkles size={14} />
            <span>AI Assistant</span>
        </button>
      </div>

      {/* 3. The Ribbon */}
      <div className="bg-[#f8fafc] border-b border-slate-200 shadow-sm z-0 relative">
      <DraggableScrollContainer className="h-[100px] flex items-stretch px-2 md:px-4 w-full">
          <AnimatePresence mode='wait'>
            <Suspense fallback={<TabLoading />}>
                {activeTab === 'Home' && <HomeTab {...props} key="home" />}
                {activeTab === 'Insert' && <InsertTab {...props} key="insert" />}
                {activeTab === 'Draw' && <DrawTab {...props} key="draw" />}
                {activeTab === 'Page Layout' && <PageLayoutTab {...props} key="page-layout" />}
                {activeTab === 'Formulas' && <FormulasTab {...props} key="formulas" />}
                {activeTab === 'Data' && <DataTab {...props} key="data" />}
                {activeTab === 'Review' && <ReviewTab {...props} key="review" />}
                {activeTab === 'View' && <ViewTab {...props} key="view" />}
                {activeTab === 'Automate' && <AutomateTab {...props} key="automate" />}
                
                {activeTab === 'File' && (
                     <motion.div 
                        key="file"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center w-full h-full text-slate-400 gap-3"
                    >
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                            <FileSpreadsheet size={24} className="opacity-50" />
                        </div>
                        <div className="text-sm">
                            <span className="font-semibold text-slate-600">Backstage View</span> is not implemented in this demo.
                        </div>
                    </motion.div>
                )}
            </Suspense>
          </AnimatePresence>
      </DraggableScrollContainer>
      </div>
    </div>
  );
};

export default memo(Toolbar);