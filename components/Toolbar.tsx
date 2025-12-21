
import React, { useState, memo, lazy, Suspense, useEffect, useRef, useCallback } from 'react';
import { 
  Sparkles, 
  File, 
  Home, 
  PlusCircle, 
  PenTool, 
  LayoutTemplate, 
  FunctionSquare, 
  Database, 
  CheckSquare, 
  Eye, 
  Workflow,
  TableProperties,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { DraggableScrollContainer, TabProps } from './tabs/shared';
import { cn } from '../utils';
import { RibbonSkeleton } from './Skeletons';

// Lazy imports for Tabs
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
const AIAssistantTab = lazy(() => import('./tabs/AIAssistant/AIAssistantTab'));
const TableDesignTab = lazy(() => import('./tabs/TableDesign/TableDesignTab'));

const TABS = [
  { id: 'File', label: 'File', icon: File, color: 'text-emerald-400' },
  { id: 'Home', label: 'Home', icon: Home, color: 'text-blue-400' },
  { id: 'Insert', label: 'Insert', icon: PlusCircle, color: 'text-orange-400' },
  { id: 'Draw', label: 'Draw', icon: PenTool, color: 'text-rose-400' },
  { id: 'Page Layout', label: 'Page Layout', icon: LayoutTemplate, color: 'text-cyan-400' },
  { id: 'Formulas', label: 'Formulas', icon: FunctionSquare, color: 'text-purple-400' },
  { id: 'Data', label: 'Data', icon: Database, color: 'text-green-400' },
  { id: 'Review', label: 'Review', icon: CheckSquare, color: 'text-yellow-400' },
  { id: 'View', label: 'View', icon: Eye, color: 'text-sky-400' },
  { id: 'Automate', label: 'Automate', icon: Workflow, color: 'text-teal-400' },
  { id: 'AI Assistant', label: 'AI Assistant', icon: Sparkles, color: 'text-indigo-400' },
];

interface ToolbarProps extends TabProps {
    onToggleAI?: () => void;
}

const Toolbar: React.FC<ToolbarProps> = (props) => {
  const [activeTab, setActiveTab] = useState('Home');
  const { onToggleAI, activeTable, ...tabProps } = props;
  
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const prevTableIdRef = useRef<string | null>(null);

  const displayedTabs = [...TABS];
  if (activeTable) {
      displayedTabs.push({ id: 'Table Design', label: 'Table Design', icon: TableProperties, color: 'text-emerald-600' });
  }

  // --- Auto-Switch Logic for Table Context ---
  useEffect(() => {
      // 1. If we lost table context and were on the Design tab, go Home
      if (!activeTable && activeTab === 'Table Design') {
          setActiveTab('Home');
      }
      
      // 2. If we entered a table context (or switched tables), Auto-Open the tab
      if (activeTable && activeTable.id !== prevTableIdRef.current) {
         setActiveTab('Table Design');
         // Ensure tab is visible by scrolling to end
         setTimeout(() => {
             if (tabsContainerRef.current) {
                 tabsContainerRef.current.scrollTo({ left: tabsContainerRef.current.scrollWidth, behavior: 'smooth' });
             }
         }, 100);
      }
  
      prevTableIdRef.current = activeTable ? activeTable.id : null;
  }, [activeTable, activeTab]);

  // --- Scroll Logic ---
  const checkScroll = useCallback(() => {
    if (tabsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  }, []);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      const scrollAmount = 200;
      tabsContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const el = tabsContainerRef.current;
    if (el) {
      const onWheel = (e: WheelEvent) => {
        if (e.deltaY === 0) return;
        if (el.scrollWidth > el.clientWidth) {
           e.preventDefault();
           el.scrollLeft += e.deltaY;
        }
      };

      el.addEventListener('wheel', onWheel, { passive: false });
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      
      checkScroll(); // Initial Check

      return () => {
        el.removeEventListener('wheel', onWheel);
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [checkScroll, displayedTabs.length]); // Re-run if tabs change

  return (
    <div className="flex flex-col bg-[#0f172a] z-40 select-none shadow-soft transition-all">
      <div className="bg-[#0f172a] px-2 md:px-4 flex items-end justify-between pt-2 relative">
        
        {/* Tabs Scroll Container Wrapper */}
        <div className="flex-1 relative overflow-hidden mr-2">
            
            {/* Left Fade/Button - Centered Vertically */}
            <div 
                className={cn(
                    "absolute left-0 top-0 bottom-0 z-20 flex items-center pr-8 bg-gradient-to-r from-[#0f172a] via-[#0f172a] to-transparent transition-opacity duration-300 pointer-events-none",
                    showLeftArrow ? 'opacity-100' : 'opacity-0'
                )}
            >
                <button 
                    onClick={() => scrollTabs('left')}
                    className="pointer-events-auto w-7 h-7 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 shadow-md border border-slate-700 backdrop-blur-sm transition-all active:scale-95 ml-1"
                >
                    <ChevronLeft size={16} strokeWidth={2.5} />
                </button>
            </div>

            {/* Scrollable List */}
            <div 
                ref={tabsContainerRef}
                className="flex items-end gap-1 overflow-x-auto no-scrollbar scroll-smooth relative"
            >
                {displayedTabs.map(tab => {
                    const isActive = activeTab === tab.id;
                    const isSpecial = tab.id === 'AI Assistant';
                    const isTable = tab.id === 'Table Design';
                    const Icon = tab.icon;
                    
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "relative px-3 md:px-4 py-2 text-[13px] transition-all duration-150 whitespace-nowrap flex-shrink-0 select-none rounded-t-md outline-none flex items-center gap-2 group",
                                isActive 
                                    ? "bg-[#f8fafc] text-slate-800 font-bold shadow-none z-10 pb-2.5 -mb-0.5" 
                                    : "text-slate-300 hover:bg-white/10 hover:text-white mb-1 font-medium",
                                isSpecial && !isActive && "text-indigo-300 hover:text-indigo-200",
                                isSpecial && isActive && "text-indigo-700",
                                isTable && !isActive && "text-emerald-300",
                                isTable && isActive && "text-emerald-700"
                            )}
                        >
                            <Icon 
                                size={14} 
                                className={cn(
                                    "mb-0.5 transition-colors", 
                                    isActive 
                                        ? (isSpecial ? "text-indigo-600 fill-indigo-100" : isTable ? "text-emerald-600" : tab.color.replace('400', '600')) 
                                        : (isSpecial ? "text-indigo-400" : isTable ? "text-emerald-400" : tab.color)
                                )} 
                            />
                            <span className={cn(
                                isActive && !isSpecial ? tab.color.replace('400', '700') : "",
                                isActive && isTable ? "text-emerald-700" : ""
                            )}>
                                {tab.label}
                            </span>
                            {isTable && !isActive && <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />}
                        </button>
                    );
                })}
                {/* Spacer for right gradient */}
                <div className="w-4 flex-shrink-0" />
            </div>

            {/* Right Fade/Button - Centered Vertically */}
            <div 
                className={cn(
                    "absolute right-0 top-0 bottom-0 z-20 flex items-center pl-8 bg-gradient-to-l from-[#0f172a] via-[#0f172a] to-transparent transition-opacity duration-300 pointer-events-none",
                    showRightArrow ? 'opacity-100' : 'opacity-0'
                )}
            >
                <button 
                    onClick={() => scrollTabs('right')}
                    className="pointer-events-auto w-7 h-7 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 shadow-md border border-slate-700 backdrop-blur-sm transition-all active:scale-95 mr-1"
                >
                    <ChevronRight size={16} strokeWidth={2.5} />
                </button>
            </div>
        </div>

        <button
            onClick={onToggleAI}
            className="hidden md:flex relative px-4 py-2 mb-1 text-[12px] font-medium text-indigo-300 hover:text-white hover:bg-white/5 rounded-md transition-all whitespace-nowrap flex-shrink-0 select-none items-center gap-1.5 group"
        >
            <Sparkles size={14} className="text-yellow-400 group-hover:animate-pulse" />
            <span>AI Copilot</span>
        </button>
      </div>

      <div className="bg-[#f8fafc] border-b border-slate-200 shadow-sm z-0 relative">
        <DraggableScrollContainer className="h-[100px] flex items-stretch px-2 md:px-4 w-full">
          <AnimatePresence mode='wait'>
                {activeTab === 'Home' && (
                    <Suspense key="home-suspense" fallback={<RibbonSkeleton />}>
                        <HomeTab {...tabProps} />
                    </Suspense>
                )}
                {activeTab === 'Insert' && (
                    <Suspense key="insert-suspense" fallback={<RibbonSkeleton />}>
                        <InsertTab {...tabProps} />
                    </Suspense>
                )}
                {activeTab === 'Draw' && (
                    <Suspense key="draw-suspense" fallback={<RibbonSkeleton />}>
                        <DrawTab {...tabProps} />
                    </Suspense>
                )}
                {activeTab === 'Page Layout' && (
                    <Suspense key="page-layout-suspense" fallback={<RibbonSkeleton />}>
                        <PageLayoutTab {...tabProps} />
                    </Suspense>
                )}
                {activeTab === 'Formulas' && (
                    <Suspense key="formulas-suspense" fallback={<RibbonSkeleton />}>
                        <FormulasTab {...tabProps} />
                    </Suspense>
                )}
                {activeTab === 'Data' && (
                    <Suspense key="data-suspense" fallback={<RibbonSkeleton />}>
                        <DataTab {...tabProps} />
                    </Suspense>
                )}
                {activeTab === 'Review' && (
                    <Suspense key="review-suspense" fallback={<RibbonSkeleton />}>
                        <ReviewTab {...tabProps} />
                    </Suspense>
                )}
                {activeTab === 'View' && (
                    <Suspense key="view-suspense" fallback={<RibbonSkeleton />}>
                        <ViewTab {...tabProps} />
                    </Suspense>
                )}
                {activeTab === 'Automate' && (
                    <Suspense key="automate-suspense" fallback={<RibbonSkeleton />}>
                        <AutomateTab {...tabProps} />
                    </Suspense>
                )}
                {activeTab === 'File' && (
                    <Suspense key="file-suspense" fallback={<RibbonSkeleton />}>
                        <FileTab {...tabProps} />
                    </Suspense>
                )}
                {activeTab === 'AI Assistant' && (
                    <Suspense key="ai-suspense" fallback={<RibbonSkeleton />}>
                        <AIAssistantTab {...tabProps} onToggleAI={onToggleAI} />
                    </Suspense>
                )}
                {activeTab === 'Table Design' && activeTable && (
                    <Suspense key="table-design-suspense" fallback={<RibbonSkeleton />}>
                        <TableDesignTab {...tabProps} activeTable={activeTable} onTableOptionChange={props.onTableOptionChange} />
                    </Suspense>
                )}
          </AnimatePresence>
        </DraggableScrollContainer>
      </div>
    </div>
  );
};

export default memo(Toolbar);
