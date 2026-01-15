
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
  ChevronRight,
  Save,
  Undo2,
  Redo2,
  Search,
  UserCircle2,
  ChevronDown
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { DraggableScrollContainer, TabProps, Tooltip } from './shared';
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
    onToggleHistory?: () => void;
}

const QuickAccessBtn = ({ onClick, disabled, icon, title, active }: { onClick?: () => void, disabled?: boolean, icon: React.ReactNode, title: string, active?: boolean }) => (
    <Tooltip content={title} side="bottom">
        <button 
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "w-7 h-7 flex items-center justify-center rounded-[3px] transition-colors",
                disabled ? "opacity-30 cursor-default" : "hover:bg-white/10 active:bg-white/20 text-white",
                active && "bg-white/10"
            )}
        >
            {icon}
        </button>
    </Tooltip>
);

const Toolbar: React.FC<ToolbarProps> = (props) => {
  const [activeTab, setActiveTab] = useState('Home');
  const { onToggleAI, onToggleHistory, activeTable, onSave, onToggleAutoSave, isAutoSave, onUndo, onRedo, canUndo, canRedo, ...tabProps } = props;
  
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
      
      {/* Top Title Bar & Quick Access Toolbar */}
      <div className="h-9 flex items-center justify-between px-2 md:px-4 bg-[#0f172a] text-white gap-4 relative z-50">
          
          {/* Quick Access */}
          <div className="flex items-center gap-1">
              <div className="flex items-center mr-2 gap-2">
                  {/* AutoSave Toggle */}
                  <Tooltip content={isAutoSave ? "AutoSave On" : "AutoSave Off"}>
                      <button 
                        onClick={onToggleAutoSave}
                        className="flex flex-col gap-[2px] items-start group cursor-pointer"
                      >
                          <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-slate-300 group-hover:text-white uppercase tracking-wider">AutoSave</span>
                              <div className={cn(
                                  "w-6 h-3 rounded-full relative transition-colors",
                                  isAutoSave ? "bg-emerald-500" : "bg-slate-600"
                              )}>
                                  <div className={cn(
                                      "absolute top-0.5 w-2 h-2 bg-white rounded-full shadow-sm transition-all",
                                      isAutoSave ? "left-3.5" : "left-0.5"
                                  )} />
                              </div>
                          </div>
                      </button>
                  </Tooltip>
              </div>

              {/* Action Buttons */}
              <QuickAccessBtn 
                  icon={<Save size={16} />} 
                  title="Save (Ctrl+S)" 
                  onClick={onSave} 
              />
              <div className="h-4 w-[1px] bg-slate-700 mx-1" />
              <div className="flex items-center gap-0">
                  <QuickAccessBtn 
                      icon={<Undo2 size={16} />} 
                      title="Undo (Ctrl+Z)" 
                      onClick={onUndo} 
                      disabled={!canUndo} 
                  />
                  <button className="w-3 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-[3px] disabled:opacity-30 disabled:hover:bg-transparent">
                      <ChevronDown size={10} />
                  </button>
              </div>
              <div className="flex items-center gap-0">
                  <QuickAccessBtn 
                      icon={<Redo2 size={16} />} 
                      title="Redo (Ctrl+Y)" 
                      onClick={onRedo} 
                      disabled={!canRedo} 
                  />
                  <button className="w-3 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-[3px] disabled:opacity-30 disabled:hover:bg-transparent">
                      <ChevronDown size={10} />
                  </button>
              </div>
          </div>

          {/* Title - Centered */}
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 text-center hidden sm:flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">Book1 - Excel</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700 cursor-pointer hover:bg-slate-700 hover:text-slate-200 transition-colors">
                  Saved
              </span>
          </div>

          {/* Search & Account - Right */}
          <div className="flex items-center gap-3">
              <div className="hidden md:flex relative group">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <Search size={12} className="text-slate-400 group-focus-within:text-slate-200" />
                  </div>
                  <input 
                      type="text" 
                      placeholder="Search" 
                      className="bg-slate-800/50 border border-slate-700 hover:bg-slate-800 hover:border-slate-600 focus:bg-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md py-1 pl-7 pr-2 text-xs text-slate-200 placeholder:text-slate-500 outline-none w-32 focus:w-64 transition-all duration-300"
                  />
              </div>
              <div className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center text-emerald-100 font-bold text-xs cursor-pointer hover:ring-2 hover:ring-white/20 hover:bg-emerald-600 transition-all">
                  JD
              </div>
          </div>
      </div>

      {/* Tabs Row */}
      <div className="bg-[#0f172a] px-2 md:px-4 flex items-end justify-between pt-0 relative border-t border-white/5">
        
        {/* Tabs Scroll Container Wrapper */}
        <div className="flex-1 relative overflow-hidden">
            
            {/* Left Fade/Button */}
            <div 
                className={cn(
                    "absolute left-0 top-0 bottom-0 z-20 flex items-center pr-6 bg-gradient-to-r from-[#0f172a] via-[#0f172a] to-transparent transition-opacity duration-300 pointer-events-none",
                    showLeftArrow ? 'opacity-100' : 'opacity-0'
                )}
            >
                <Tooltip content="Scroll Left">
                    <button 
                        onClick={() => scrollTabs('left')}
                        className="pointer-events-auto w-6 h-6 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 shadow-md border border-slate-700 backdrop-blur-sm transition-all active:scale-95 ml-0.5"
                    >
                        <ChevronLeft size={14} strokeWidth={2.5} />
                    </button>
                </Tooltip>
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
                        <Tooltip key={tab.id} content={tab.label} delayDuration={500}>
                            <button
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
                        </Tooltip>
                    );
                })}
                {/* Spacer for right gradient/arrow clearance */}
                <div className="w-12 flex-shrink-0" />
            </div>

            {/* Right Fade/Button */}
            <div 
                className={cn(
                    "absolute right-0 top-0 bottom-0 z-20 flex items-center pl-6 bg-gradient-to-l from-[#0f172a] via-[#0f172a] to-transparent transition-opacity duration-300 pointer-events-none",
                    showRightArrow ? 'opacity-100' : 'opacity-0'
                )}
            >
                <Tooltip content="Scroll Right">
                    <button 
                        onClick={() => scrollTabs('right')}
                        className="pointer-events-auto w-6 h-6 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 shadow-md border border-slate-700 backdrop-blur-sm transition-all active:scale-95 mr-0.5"
                    >
                        <ChevronRight size={14} strokeWidth={2.5} />
                    </button>
                </Tooltip>
            </div>
        </div>
      </div>

      <div className="bg-[#f8fafc] border-b border-slate-200 shadow-sm z-0 relative">
        <DraggableScrollContainer className="h-[100px] flex items-stretch px-2 md:px-4 w-full">
          <AnimatePresence mode='wait'>
                {activeTab === 'Home' && (
                    <Suspense key="home-suspense" fallback={<RibbonSkeleton />}>
                        <HomeTab 
                            {...tabProps} 
                            onUndo={onUndo} onRedo={onRedo} canUndo={canUndo} canRedo={canRedo} 
                        />
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
                        <FileTab 
                            {...tabProps} 
                            onToggleHistory={onToggleHistory} 
                            onSave={onSave}
                            onToggleAutoSave={onToggleAutoSave}
                            isAutoSave={isAutoSave}
                        />
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
