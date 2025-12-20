
import React, { useState, useRef, useEffect } from 'react';
import { LayoutList, ChevronRight, Check } from 'lucide-react';
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
            <div className="flex flex-col py-1 bg-white" ref={menuRef}>
                <CFMenuItem 
                    label="Highlight Cells Rules" 
                    icon={<div className="w-4 h-4 border border-slate-300 bg-white flex items-center justify-center text-[10px] text-red-500 font-bold shadow-sm rounded-[2px]">&lt;</div>}
                    hasSubMenu 
                    isActive={activeSubMenu === 'highlight'}
                    onMouseEnter={() => !isMobile && setActiveSubMenu('highlight')}
                    onClick={() => isMobile && setActiveSubMenu(activeSubMenu === 'highlight' ? null : 'highlight')}
                    isMobile={isMobile}
                >
                    <HighlightCellsMenu />
                </CFMenuItem>

                <CFMenuItem 
                    label="Top/Bottom Rules" 
                    icon={<div className="w-4 h-4 border border-slate-300 bg-white flex items-center justify-center text-[8px] text-blue-500 font-bold shadow-sm rounded-[2px]">%</div>}
                    hasSubMenu
                    isActive={activeSubMenu === 'topbottom'}
                    onMouseEnter={() => !isMobile && setActiveSubMenu('topbottom')}
                    onClick={() => isMobile && setActiveSubMenu(activeSubMenu === 'topbottom' ? null : 'topbottom')}
                    isMobile={isMobile}
                >
                    <TopBottomRulesMenu />
                </CFMenuItem>

                <div className="h-[1px] bg-slate-200 my-1 mx-8" />

                <CFMenuItem 
                    label="Data Bars" 
                    icon={<div className="w-4 h-4 flex items-end gap-[1px] opacity-80"><div className="w-1 h-2 bg-blue-400 rounded-[1px]"></div><div className="w-1 h-3 bg-blue-400 rounded-[1px]"></div><div className="w-1 h-1.5 bg-blue-400 rounded-[1px]"></div></div>}
                    hasSubMenu
                    isActive={activeSubMenu === 'databars'}
                    onMouseEnter={() => !isMobile && setActiveSubMenu('databars')}
                    onClick={() => isMobile && setActiveSubMenu(activeSubMenu === 'databars' ? null : 'databars')}
                    isMobile={isMobile}
                >
                    <DataBarsMenu />
                </CFMenuItem>

                <CFMenuItem 
                    label="Color Scales" 
                    icon={<div className="w-4 h-4 bg-gradient-to-br from-red-400 via-yellow-300 to-green-400 rounded-[2px] shadow-sm border border-slate-200"></div>}
                    hasSubMenu
                    isActive={activeSubMenu === 'colorscales'}
                    onMouseEnter={() => !isMobile && setActiveSubMenu('colorscales')}
                    onClick={() => isMobile && setActiveSubMenu(activeSubMenu === 'colorscales' ? null : 'colorscales')}
                    isMobile={isMobile}
                >
                    <ColorScalesMenu />
                </CFMenuItem>

                <CFMenuItem 
                    label="Icon Sets" 
                    icon={
                        <div className="flex gap-[1px] items-center justify-center w-4 h-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                        </div>
                    }
                    hasSubMenu
                    isActive={activeSubMenu === 'iconsets'}
                    onMouseEnter={() => !isMobile && setActiveSubMenu('iconsets')}
                    onClick={() => isMobile && setActiveSubMenu(activeSubMenu === 'iconsets' ? null : 'iconsets')}
                    isMobile={isMobile}
                >
                    <IconSetsMenu />
                </CFMenuItem>

                <div className="h-[1px] bg-slate-200 my-1 mx-8" />

                <CFMenuItem 
                    label="New Rule..." 
                    icon={<div className="w-4 h-4 border border-slate-300 rounded-[2px] bg-white text-slate-400 flex items-center justify-center text-[10px] shadow-sm">+</div>}
                    onMouseEnter={() => setActiveSubMenu(null)}
                />
                
                {/* Clear Rules Submenu */}
                <CFMenuItem 
                    label="Clear Rules" 
                    icon={<div className="w-4 h-4 border border-transparent rounded-[2px] flex items-center justify-center text-slate-400 relative">
                        <div className="w-3 h-4 border border-slate-300 bg-white"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-red-500 font-bold text-[10px]">×</div>
                    </div>}
                    hasSubMenu
                    isActive={activeSubMenu === 'clear'}
                    onMouseEnter={() => !isMobile && setActiveSubMenu('clear')}
                    onClick={() => isMobile && setActiveSubMenu(activeSubMenu === 'clear' ? null : 'clear')}
                    isMobile={isMobile}
                >
                    <div className="flex flex-col py-1 min-w-[260px]">
                        <button className="flex items-center gap-3 px-6 py-1.5 text-[12px] text-slate-700 hover:bg-[#e6f2ff] hover:border-[#cce8ff] border border-transparent transition-all text-left w-full group whitespace-nowrap">
                            <span>Clear Rules from <span className="underline">S</span>elected Cells</span>
                        </button>
                        <button className="flex items-center gap-3 px-6 py-1.5 text-[12px] text-slate-700 hover:bg-[#e6f2ff] hover:border-[#cce8ff] border border-transparent transition-all text-left w-full group whitespace-nowrap">
                            <span>Clear Rules from <span className="underline">E</span>ntire Sheet</span>
                        </button>
                        <button disabled className="flex items-center gap-3 px-6 py-1.5 text-[12px] text-slate-400 cursor-default border border-transparent text-left w-full whitespace-nowrap">
                            <span>Clear Rules from <span className="underline">T</span>his Table</span>
                        </button>
                        <button disabled className="flex items-center gap-3 px-6 py-1.5 text-[12px] text-slate-400 cursor-default border border-transparent text-left w-full whitespace-nowrap">
                            <span>Clear Rules from This <span className="underline">P</span>ivotTable</span>
                        </button>
                    </div>
                </CFMenuItem>

                <CFMenuItem 
                    label="Manage Rules..." 
                    icon={<div className="w-4 h-4 border border-slate-300 rounded-[2px] bg-white flex flex-col gap-[1px] p-[2px]">
                        <div className="h-[2px] w-full bg-slate-300"></div>
                        <div className="h-[2px] w-full bg-slate-300"></div>
                        <div className="h-[2px] w-full bg-slate-300"></div>
                    </div>}
                    onMouseEnter={() => setActiveSubMenu(null)}
                />
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
    // We pass undefined/null for widthClass to let useSmartPosition determine width naturally from DOM
    // but we add a min-w class for aesthetics.
    const position = useSmartPosition(isActive || false, itemRef, contentRef, { 
        axis: 'horizontal', 
        widthClass: isMobile ? `w-[${window.innerWidth - 32}px]` : undefined, 
        gap: -2 
    });

    return (
        <>
            <button
                ref={itemRef}
                className={cn(
                    "flex items-center justify-between px-3 py-1.5 text-[12px] text-slate-700 transition-colors w-full border border-transparent outline-none relative",
                    isActive ? "bg-[#e6f2ff] border-[#cce8ff]" : "hover:bg-[#f3f9ff] hover:border-[#e6f2ff]"
                )}
                onMouseEnter={onMouseEnter}
                onClick={onClick}
            >
                <div className="flex items-center gap-3">
                    <div className="w-5 flex justify-center items-center opacity-80">{icon}</div>
                    <span className="font-normal">{label}</span>
                </div>
                {hasSubMenu && <ChevronRight size={10} className="text-slate-400" />}
            </button>

            {isActive && hasSubMenu && position && createPortal(
                <div 
                    ref={contentRef}
                    className={cn(
                        "fixed z-[9999] bg-white shadow-xl border border-slate-300 py-1 animate-in fade-in zoom-in-95 duration-100 rounded-md ring-1 ring-black/5 min-w-[max-content]",
                        // Fallback min-width if not mobile to ensure it doesn't look too skinny
                        !isMobile && "min-w-[200px]"
                    )}
                    style={{ 
                        top: position.top, 
                        bottom: position.bottom,
                        left: position.left,
                        maxHeight: position.maxHeight,
                        transformOrigin: position.transformOrigin,
                        // Ensure it overrides default width if mobile
                        width: isMobile ? 'calc(100vw - 20px)' : (position.width ? position.width : undefined),
                        maxWidth: '100vw'
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
