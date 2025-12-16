import React, { useState, memo, lazy, Suspense } from 'react';
import { 
  Sparkles 
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { DraggableScrollContainer } from './tabs/shared';
import { cn } from '../utils';
import { RibbonSkeleton } from './Skeletons';

// Lazy imports for Tabs using relative paths to avoid alias resolution issues
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
      
      {/* 2. Tab Navigation */}
      <div className="bg-[#0f172a] px-2 md:px-4 flex items-end justify-between pt-2">
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