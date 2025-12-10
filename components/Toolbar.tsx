import React, { useState, memo, Suspense } from 'react';
import { 
  FileSpreadsheet, Undo, Redo, Download, Search, Loader2 
} from 'lucide-react';
import { CellStyle } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { DraggableScrollContainer, TabProps } from './toolbar/shared';

// Lazy loaded tabs
const HomeTab = React.lazy(() => import('./toolbar/HomeTab'));
const InsertTab = React.lazy(() => import('./toolbar/InsertTab'));
const DrawTab = React.lazy(() => import('./toolbar/DrawTab'));
const PageLayoutTab = React.lazy(() => import('./toolbar/PageLayoutTab'));
const FormulasTab = React.lazy(() => import('./toolbar/FormulasTab'));
const DataTab = React.lazy(() => import('./toolbar/DataTab'));
const ReviewTab = React.lazy(() => import('./toolbar/ReviewTab'));
const ViewTab = React.lazy(() => import('./toolbar/ViewTab'));
const AutomateTab = React.lazy(() => import('./toolbar/AutomateTab'));

const TABS = ['File', 'Home', 'Insert', 'Draw', 'Page Layout', 'Formulas', 'Data', 'Review', 'View', 'Automate'];

const TabLoading = () => (
    <div className="flex h-full w-full items-center justify-center p-4">
        <Loader2 className="animate-spin text-slate-300" size={24} />
    </div>
);

const Toolbar: React.FC<TabProps> = (props) => {
  const [activeTab, setActiveTab] = useState('Home');

  return (
    <div className="flex flex-col bg-white border-b border-slate-200 z-40 select-none shadow-soft transition-all">
      
      {/* 1. Window / Quick Access Bar */}
      <div className="flex items-center justify-between px-3 md:px-4 h-10 bg-primary-700 text-white shadow-md z-10">
         <div className="flex items-center gap-4">
             <div className="flex items-center gap-2.5">
               <div className="p-1 bg-white/10 rounded">
                 <FileSpreadsheet size={18} className="text-white" />
               </div>
               <span className="text-sm font-semibold tracking-wide hidden sm:block">Book1</span>
            </div>
            <div className="h-5 w-[1px] bg-white/20 mx-1 hidden sm:block"></div>
            <div className="flex items-center gap-1">
                <button title="Undo" className="p-1.5 hover:bg-primary-600 rounded text-white/90 transition-colors"><Undo size={16} /></button>
                <button title="Redo" className="p-1.5 hover:bg-primary-600 rounded text-white/90 transition-colors"><Redo size={16} /></button>
                <div className="w-[1px] h-4 bg-white/20 mx-1"></div>
                <button onClick={props.onExport} title="Save/Export" className="p-1.5 hover:bg-primary-600 rounded text-white/90 flex items-center gap-1.5 transition-colors">
                     <Download size={16} />
                     <span className="text-xs font-medium hidden md:block">Save</span>
                </button>
            </div>
         </div>
         
         <div className="flex items-center gap-2">
            <div className="relative group">
                <Search size={14} className="absolute left-2.5 top-2 text-primary-200 group-focus-within:text-white transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search" 
                    className="h-8 w-32 md:w-56 bg-primary-800/60 border border-primary-600/30 rounded-md text-xs text-white placeholder-primary-300 pl-8 pr-3 focus:outline-none focus:bg-primary-800 focus:border-primary-400 focus:ring-1 focus:ring-primary-400/50 transition-all"
                />
            </div>
             <div className="w-8 h-8 rounded-full bg-primary-600 border border-primary-500 flex items-center justify-center text-xs font-bold text-white shadow-sm ml-2 cursor-pointer hover:bg-primary-500">
                JD
             </div>
         </div>
      </div>

      {/* 2. Tab Navigation */}
      <div className="border-b border-slate-200 bg-white">
        <DraggableScrollContainer className="flex items-center px-2 md:px-4">
            {TABS.map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`
                        relative px-3 md:px-4 py-2.5 text-[13px] font-medium transition-colors whitespace-nowrap flex-shrink-0 select-none
                        ${activeTab === tab 
                            ? 'text-primary-700' 
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }
                    `}
                >
                    {tab}
                    {activeTab === tab && (
                        <motion.div 
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary-600 rounded-t-sm z-10" 
                        />
                    )}
                </button>
            ))}
        </DraggableScrollContainer>
      </div>

      {/* 3. The Ribbon */}
      <div className="bg-slate-50/80 border-b border-slate-200">
      <DraggableScrollContainer className="h-[100px] flex items-start px-2 md:px-4 py-1 w-full">
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