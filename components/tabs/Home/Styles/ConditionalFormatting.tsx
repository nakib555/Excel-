import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { LayoutList, ChevronRight, Check, Highlighter, Percent, BarChart, Palette, Shapes, Trash2, Settings2 } from 'lucide-react';
import { RibbonButton, SmartDropdown, Tooltip } from '../../shared';
import { createPortal } from 'react-dom';
import { cn, useSmartPosition } from '../../../../utils';
import { DropdownListSkeleton } from '../../../Skeletons';

// Lazy load submenus
const HighlightCellsMenu = lazy(() => import('./CFMenus').then(m => ({ default: m.HighlightCellsMenu })));
const TopBottomRulesMenu = lazy(() => import('./CFMenus').then(m => ({ default: m.TopBottomRulesMenu })));
const DataBarsMenu = lazy(() => import('./CFMenus').then(m => ({ default: m.DataBarsMenu })));
const ColorScalesMenu = lazy(() => import('./CFMenus').then(m => ({ default: m.ColorScalesMenu })));
const IconSetsMenu = lazy(() => import('./CFMenus').then(m => ({ default: m.IconSetsMenu })));

const ConditionalFormatting = () => {
    const [open, setOpen] = useState(false);
    const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Close submenus when main menu closes
    useEffect(() => {
        if (!open) setActiveSubMenu(null);
    }, [open]);

    const toggleSubMenu = (id: string) => {
        setActiveSubMenu(prev => prev === id ? null : id);
    };

    return (
        <SmartDropdown
            open={open}
            onToggle={() => setOpen(!open)}
            contentWidth="w-64"
            triggerClassName="h-full"
            trigger={
                <RibbonButton 
                    variant="large" 
                    icon={<LayoutList size={20} className="text-pink-500" />} 
                    label="Conditional" 
                    subLabel="Formatting" 
                    hasDropdown 
                    onClick={() => {}} 
                    active={open}
                    title="Conditional Formatting"
                />
            }
        >
            <div className="flex flex-col py-2 bg-white rounded-lg" ref={menuRef}>
                <div className="px-4 py-2 mb-2 border-b border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Formatting Rules</span>
                </div>

                <div className="px-1 flex flex-col gap-0.5">
                    <CFMenuItem 
                        label="Highlight Cells Rules" 
                        icon={<Highlighter size={16} className="text-rose-500" />}
                        hasSubMenu 
                        isActive={activeSubMenu === 'highlight'}
                        onMouseEnter={() => !isMobile && setActiveSubMenu('highlight')}
                        onClick={() => toggleSubMenu('highlight')}
                    >
                        <Suspense fallback={<DropdownListSkeleton />}>
                            <HighlightCellsMenu />
                        </Suspense>
                    </CFMenuItem>

                    <CFMenuItem 
                        label="Top/Bottom Rules" 
                        icon={<Percent size={16} className="text-indigo-500" />}
                        hasSubMenu
                        isActive={activeSubMenu === 'topbottom'}
                        onMouseEnter={() => !isMobile && setActiveSubMenu('topbottom')}
                        onClick={() => toggleSubMenu('topbottom')}
                    >
                        <Suspense fallback={<DropdownListSkeleton />}>
                            <TopBottomRulesMenu />
                        </Suspense>
                    </CFMenuItem>

                    <CFMenuItem 
                        label="Data Bars" 
                        icon={<BarChart size={16} className="text-blue-500" />}
                        hasSubMenu
                        isActive={activeSubMenu === 'databars'}
                        onMouseEnter={() => !isMobile && setActiveSubMenu('databars')}
                        onClick={() => toggleSubMenu('databars')}
                    >
                        <Suspense fallback={<DropdownListSkeleton />}>
                            <DataBarsMenu />
                        </Suspense>
                    </CFMenuItem>

                    <CFMenuItem 
                        label="Color Scales" 
                        icon={<Palette size={16} className="text-emerald-500" />}
                        hasSubMenu
                        isActive={activeSubMenu === 'colorscales'}
                        onMouseEnter={() => !isMobile && setActiveSubMenu('colorscales')}
                        onClick={() => toggleSubMenu('colorscales')}
                    >
                        <Suspense fallback={<DropdownListSkeleton />}>
                            <ColorScalesMenu />
                        </Suspense>
                    </CFMenuItem>

                    <CFMenuItem 
                        label="Icon Sets" 
                        icon={<Shapes size={16} className="text-amber-500" />}
                        hasSubMenu
                        isActive={activeSubMenu === 'iconsets'}
                        onMouseEnter={() => !isMobile && setActiveSubMenu('iconsets')}
                        onClick={() => toggleSubMenu('iconsets')}
                    >
                        <Suspense fallback={<DropdownListSkeleton />}>
                            <IconSetsMenu />
                        </Suspense>
                    </CFMenuItem>
                </div>

                <div className="h-[1px] bg-slate-100 my-2 mx-3" />

                <div className="px-1 flex flex-col gap-0.5">
                    <CFMenuItem 
                        label="New Rule..." 
                        icon={<div className="w-5 h-5 border border-slate-200 rounded-md bg-slate-50 text-slate-500 flex items-center justify-center text-[12px] shadow-sm font-bold">+</div>}
                        onMouseEnter={() => setActiveSubMenu(null)}
                    />
                    
                    {/* Clear Rules Submenu */}
                    <CFMenuItem 
                        label="Clear Rules" 
                        icon={<Trash2 size={16} className="text-slate-400" />}
                        hasSubMenu
                        isActive={activeSubMenu === 'clear'}
                        onMouseEnter={() => !isMobile && setActiveSubMenu('clear')}
                        onClick={() => toggleSubMenu('clear')}
                    >
                        <div className="flex flex-col py-1 min-w-[max-content]">
                            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 mb-1">Clear</div>
                            <Tooltip content="Clear Rules from Selected Cells" side="right">
                                <button className="flex items-center gap-3 px-4 py-2 text-[13px] text-slate-700 hover:bg-red-50 hover:text-red-700 transition-all text-left w-full group whitespace-nowrap">
                                    <span>Clear Rules from Selected Cells</span>
                                </button>
                            </Tooltip>
                            <Tooltip content="Clear Rules from Entire Sheet" side="right">
                                <button className="flex items-center gap-3 px-4 py-2 text-[13px] text-slate-700 hover:bg-red-50 hover:text-red-700 transition-all text-left w-full group whitespace-nowrap">
                                    <span>Clear Rules from Entire Sheet</span>
                                </button>
                            </Tooltip>
                        </div>
                    </CFMenuItem>

                    <CFMenuItem 
                        label="Manage Rules..." 
                        icon={<Settings2 size={16} className="text-slate-400" />}
                        onMouseEnter={() => setActiveSubMenu(null)}
                    />
                </div>
            </div>
        </SmartDropdown>
    );
};

interface CFMenuItemProps {
    label: string;
    icon?: React.ReactNode;
    hasSubMenu?: boolean;
    isActive?: boolean;
    onMouseEnter?: () => void;
    onClick?: () => void;
    children?: React.ReactNode;
}

const CFMenuItem: React.FC<CFMenuItemProps> = ({ label, icon, hasSubMenu, isActive, onMouseEnter, onClick, children }) => {
    const itemRef = useRef<HTMLButtonElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    
    // Position the submenu using horizontal axis smart positioning
    // gap -4 ensures overlap just like FilterMenu
    const position = useSmartPosition(isActive || false, itemRef, contentRef, { 
        axis: 'horizontal', 
        gap: -4 
    });

    const handleInteraction = (e: React.MouseEvent) => {
        if (onClick) {
            e.preventDefault();
            e.stopPropagation();
            onClick();
        }
    };

    return (
        <div className="relative" onMouseEnter={onMouseEnter}>
            <Tooltip content={label} side="right" delayDuration={500}>
                <button
                    ref={itemRef}
                    className={cn(
                        "flex items-center justify-between px-3 py-2 text-[13px] text-slate-700 transition-all w-full border border-transparent outline-none relative rounded-md mx-1",
                        isActive ? "bg-blue-50 text-slate-900 font-medium" : "hover:bg-slate-50 hover:text-slate-900",
                        "w-[calc(100%-8px)]"
                    )}
                    onClick={handleInteraction}
                >
                    <div className="flex items-center gap-3">
                        <div className={cn("w-6 h-6 rounded-md flex justify-center items-center transition-colors", isActive ? "text-blue-600" : "bg-transparent")}>
                            {icon}
                        </div>
                        <span className="flex-1 text-left">{label}</span>
                    </div>
                    {hasSubMenu && <ChevronRight size={14} className={cn("transition-colors", isActive ? "text-blue-600" : "text-slate-300")} />}
                </button>
            </Tooltip>

            {isActive && hasSubMenu && position && createPortal(
                <div 
                    ref={contentRef}
                    data-submenu-portal="true"
                    className={cn(
                        "fixed z-[2020] bg-white shadow-xl border border-slate-200 py-1.5 rounded-lg ring-1 ring-black/5 flex flex-col",
                        "overflow-y-auto scrollbar-thin w-max", 
                        position.ready && "animate-in fade-in zoom-in-95 slide-in-from-left-1 duration-100"
                    )}
                    style={{ 
                        top: position.top, 
                        bottom: position.bottom,
                        left: position.left,
                        maxHeight: position.maxHeight,
                        transformOrigin: position.transformOrigin,
                        // Allow width to grow with content (w-max class), but constrain max-width to viewport
                        maxWidth: 'calc(100vw - 16px)',
                        // Use position.width if it was constrained by screen edges, otherwise undefined to let w-max take over
                        width: position.width, 
                        opacity: position.ready ? 1 : 0
                    }}
                    onMouseDown={(e) => e.stopPropagation()} 
                >
                    {children}
                </div>,
                document.body
            )}
        </div>
    );
};

export default ConditionalFormatting;