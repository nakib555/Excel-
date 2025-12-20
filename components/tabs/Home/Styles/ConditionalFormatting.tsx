
import React, { useState, useRef, useEffect } from 'react';
import { LayoutList, ChevronRight, Check, Highlighter, Percent, BarChart, Palette, Shapes, Trash2, Settings2 } from 'lucide-react';
import { RibbonButton, SmartDropdown } from '../../shared';
import { createPortal } from 'react-dom';
import { cn, useSmartPosition } from '../../../../utils';
import { 
  HighlightCellsMenu, 
  TopBottomRulesMenu, 
  DataBarsMenu, 
  ColorScalesMenu, 
  IconSetsMenu 
} from './CFMenus';

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
                        onClick={() => setActiveSubMenu('highlight')}
                        isMobile={isMobile}
                    >
                        <HighlightCellsMenu />
                    </CFMenuItem>

                    <CFMenuItem 
                        label="Top/Bottom Rules" 
                        icon={<Percent size={16} className="text-indigo-500" />}
                        hasSubMenu
                        isActive={activeSubMenu === 'topbottom'}
                        onMouseEnter={() => !isMobile && setActiveSubMenu('topbottom')}
                        onClick={() => setActiveSubMenu('topbottom')}
                        isMobile={isMobile}
                    >
                        <TopBottomRulesMenu />
                    </CFMenuItem>

                    <CFMenuItem 
                        label="Data Bars" 
                        icon={<BarChart size={16} className="text-blue-500" />}
                        hasSubMenu
                        isActive={activeSubMenu === 'databars'}
                        onMouseEnter={() => !isMobile && setActiveSubMenu('databars')}
                        onClick={() => setActiveSubMenu('databars')}
                        isMobile={isMobile}
                    >
                        <DataBarsMenu />
                    </CFMenuItem>

                    <CFMenuItem 
                        label="Color Scales" 
                        icon={<Palette size={16} className="text-emerald-500" />}
                        hasSubMenu
                        isActive={activeSubMenu === 'colorscales'}
                        onMouseEnter={() => !isMobile && setActiveSubMenu('colorscales')}
                        onClick={() => setActiveSubMenu('colorscales')}
                        isMobile={isMobile}
                    >
                        <ColorScalesMenu />
                    </CFMenuItem>

                    <CFMenuItem 
                        label="Icon Sets" 
                        icon={<Shapes size={16} className="text-amber-500" />}
                        hasSubMenu
                        isActive={activeSubMenu === 'iconsets'}
                        onMouseEnter={() => !isMobile && setActiveSubMenu('iconsets')}
                        onClick={() => setActiveSubMenu('iconsets')}
                        isMobile={isMobile}
                    >
                        <IconSetsMenu />
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
                        onClick={() => setActiveSubMenu('clear')}
                        isMobile={isMobile}
                    >
                        <div className="flex flex-col py-1 min-w-[max-content]">
                            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 mb-1">Clear</div>
                            <button className="flex items-center gap-3 px-4 py-2 text-[13px] text-slate-700 hover:bg-red-50 hover:text-red-700 transition-all text-left w-full group whitespace-nowrap">
                                <span>Clear Rules from Selected Cells</span>
                            </button>
                            <button className="flex items-center gap-3 px-4 py-2 text-[13px] text-slate-700 hover:bg-red-50 hover:text-red-700 transition-all text-left w-full group whitespace-nowrap">
                                <span>Clear Rules from Entire Sheet</span>
                            </button>
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
    menuWidth?: string;
    isMobile?: boolean;
}

const CFMenuItem: React.FC<CFMenuItemProps> = ({ label, icon, hasSubMenu, isActive, onMouseEnter, onClick, children, menuWidth, isMobile }) => {
    const itemRef = useRef<HTMLButtonElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    
    // Position the submenu using horizontal axis smart positioning
    const position = useSmartPosition(isActive || false, itemRef, contentRef, { 
        axis: 'horizontal', 
        widthClass: isMobile ? `w-[${window.innerWidth - 32}px]` : undefined, 
        gap: -6 
    });

    return (
        <>
            <button
                ref={itemRef}
                className={cn(
                    "flex items-center justify-between px-3 py-2 text-[13px] text-slate-700 transition-all w-full border border-transparent outline-none relative rounded-md mx-1",
                    isActive ? "bg-slate-100 text-slate-900 font-medium" : "hover:bg-slate-50 hover:text-slate-900",
                    "w-[calc(100%-8px)]"
                )}
                onMouseEnter={onMouseEnter}
                onClick={onClick}
            >
                <div className="flex items-center gap-3">
                    <div className={cn("w-6 h-6 rounded-md flex justify-center items-center transition-colors", isActive ? "bg-white shadow-sm" : "bg-transparent")}>
                        {icon}
                    </div>
                    <span>{label}</span>
                </div>
                {hasSubMenu && <ChevronRight size={14} className={cn("transition-colors", isActive ? "text-slate-600" : "text-slate-300")} />}
            </button>

            {isActive && hasSubMenu && position && createPortal(
                <div 
                    ref={contentRef}
                    data-submenu-portal="true"
                    className={cn(
                        "fixed z-[9999] bg-white shadow-xl border border-slate-200 py-1.5 rounded-lg ring-1 ring-black/5 min-w-[max-content]",
                        "overflow-y-auto scrollbar-thin",
                        position.ready && "animate-in fade-in zoom-in-95 slide-in-from-left-1 duration-150"
                    )}
                    style={{ 
                        top: position.top, 
                        bottom: position.bottom,
                        left: position.left,
                        maxHeight: position.maxHeight,
                        transformOrigin: position.transformOrigin,
                        // Ensure it overrides default width if mobile
                        width: isMobile ? 'calc(100vw - 32px)' : (position.width ? position.width : undefined),
                        maxWidth: '100vw',
                        opacity: position.ready ? 1 : 0
                    }}
                    onMouseEnter={() => {}} 
                >
                    {children}
                </div>,
                document.body
            )}
        </>
    );
};

export default ConditionalFormatting;
