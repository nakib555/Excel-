
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  ArrowDownAZ, ArrowUpAZ, ChevronRight, Search, FilterX, 
  Check
} from 'lucide-react';
import { cn, useSmartPosition } from '../../utils';

interface FilterMenuProps {
    isOpen: boolean;
    onClose: () => void;
    triggerRef: React.RefObject<HTMLElement | null>;
}

interface SmartSubMenuContentProps {
    children?: React.ReactNode;
    parentRef: React.RefObject<HTMLElement | null>;
}

// Smart Submenu Component using the shared hook
const SmartSubMenuContent = ({ children, parentRef }: SmartSubMenuContentProps) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const position = useSmartPosition(true, parentRef, menuRef, { axis: 'horizontal', gap: -2 });

    return createPortal(
        <div 
            ref={menuRef}
            className="z-[2020] bg-white border border-slate-200 shadow-xl rounded-xl py-1.5 min-w-[max-content] animate-in fade-in zoom-in-95 duration-100 flex flex-col fixed scrollbar-thin ring-1 ring-black/5"
            style={{
                top: position?.top ?? 0,
                left: position?.left ?? 0,
                opacity: position ? 1 : 0,
                maxHeight: position?.maxHeight,
                transformOrigin: position?.transformOrigin,
                maxWidth: 'calc(100vw - 16px)'
            }}
            onMouseDown={(e) => e.stopPropagation()} 
        >
            {children}
        </div>,
        document.body
    );
};

const SubMenuItem = ({ 
    label, 
    icon, 
    hasSubMenu, 
    onMouseEnter,
    onClick,
    children, 
    isActive,
    shortcut
}: { 
    label: string; 
    icon?: React.ReactNode; 
    hasSubMenu?: boolean; 
    onMouseEnter?: () => void;
    onClick?: () => void;
    children?: React.ReactNode; 
    isActive?: boolean;
    shortcut?: string;
}) => {
    const itemRef = useRef<HTMLButtonElement>(null);

    const handleInteraction = (e: React.MouseEvent) => {
        if (hasSubMenu && onClick) {
            e.preventDefault();
            e.stopPropagation();
            onClick();
        }
    };

    return (
        <div 
            className="relative"
            onMouseEnter={onMouseEnter}
        >
            <button 
                ref={itemRef}
                className={cn(
                    "flex items-center w-full px-4 py-2 text-[13px] text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-left transition-colors gap-3 group relative select-none whitespace-nowrap",
                    isActive && "bg-slate-50 text-slate-900 font-medium"
                )}
                onClick={handleInteraction}
            >
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-blue-500 rounded-r-full" />}
                
                <div className={cn("w-5 flex justify-center items-center transition-colors flex-shrink-0", isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")}>
                    {icon}
                </div>
                <span className="flex-1 truncate">{label}</span>
                {shortcut && <span className="text-[10px] text-slate-400 ml-2">{shortcut}</span>}
                {hasSubMenu && <ChevronRight size={14} className={cn("transition-colors ml-2", isActive ? "text-blue-500" : "text-slate-300 group-hover:text-slate-500")} />}
            </button>
            
            {isActive && children && (
                <SmartSubMenuContent parentRef={itemRef}>
                    {children}
                </SmartSubMenuContent>
            )}
        </div>
    );
};

const Separator = () => <div className="h-[1px] bg-slate-100 my-1.5 mx-0" />;

const FilterMenu: React.FC<FilterMenuProps> = ({ isOpen, onClose, triggerRef }) => {
    const menuRef = useRef<HTMLDivElement>(null);
    // Use fixedWidth to help smartPosition calculate better before render, or at least provide a constraint.
    const position = useSmartPosition(isOpen, triggerRef, menuRef, { fixedWidth: 300, gap: 4 });
    
    const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
    const [searchText, setSearchText] = useState('');

    const filterItems = [
        { label: '(Select All)', checked: true, bold: true },
        { label: '2', checked: true },
        { label: '4', checked: true },
        { label: '5', checked: true },
        { label: 'Grand Total', checked: true },
        { label: 'Qty', checked: true },
        { label: '(Blanks)', checked: true },
    ];

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent | TouchEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node) && 
                triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
                // If clicking a submenu (which is portal), it won't be contained in menuRef.
                // But the submenu stops propagation on mousedown, so this might not be triggered if clicking submenu.
                // However, SmartSubMenuContent doesn't block click events on document body unless we explicitly do so.
                // Actually SmartSubMenuContent does onMouseDown e.stopPropagation().
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isOpen, onClose, triggerRef]);

    if (!isOpen) return null;

    const toggleSubMenu = (id: string) => {
        setActiveSubMenu(prev => prev === id ? null : id);
    };

    return createPortal(
        <div 
            ref={menuRef}
            className="fixed z-[2005] bg-white border border-slate-200 shadow-2xl rounded-xl w-[300px] flex flex-col font-sans text-slate-800 animate-in fade-in zoom-in-95 duration-100 overflow-hidden ring-1 ring-black/5"
            style={{ 
                top: position?.top ?? 0,
                left: position?.left ?? 0,
                opacity: position ? 1 : 0,
                maxHeight: position?.maxHeight,
                transformOrigin: position?.transformOrigin
            }}
        >
            <div className="py-2 flex-shrink-0">
                <SubMenuItem 
                    label="Sort Smallest to Largest" 
                    icon={<ArrowDownAZ size={16} />} 
                    onMouseEnter={() => setActiveSubMenu(null)}
                />
                <SubMenuItem 
                    label="Sort Largest to Smallest" 
                    icon={<ArrowUpAZ size={16} />} 
                    onMouseEnter={() => setActiveSubMenu(null)}
                />
                <SubMenuItem 
                    label="Sort by Color" 
                    hasSubMenu 
                    isActive={activeSubMenu === 'color_sort'}
                    onMouseEnter={() => setActiveSubMenu('color_sort')}
                    onClick={() => toggleSubMenu('color_sort')}
                    icon={<div className="w-4 h-4 bg-gradient-to-br from-red-400 to-blue-500 rounded-full opacity-80" />}
                >
                    <div className="py-1 min-w-[180px]">
                        <div className="px-4 py-2 text-[11px] text-slate-400 font-bold uppercase tracking-wider">Cell Color</div>
                        <button className="w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 flex items-center gap-3 transition-colors">
                            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded-[2px] shadow-sm"></div>
                            <span>Light Red</span>
                        </button>
                        <button className="w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 flex items-center gap-3 transition-colors">
                            <div className="w-4 h-4 bg-white border border-slate-200 rounded-[2px] shadow-sm"></div>
                            <span>No Fill</span>
                        </button>
                    </div>
                </SubMenuItem>
                
                <Separator />
                
                <SubMenuItem 
                    label='Clear Filter From "Column"' 
                    icon={<FilterX size={16} />} 
                    onMouseEnter={() => setActiveSubMenu(null)}
                />
                
                <SubMenuItem 
                    label="Filter by Color" 
                    hasSubMenu 
                    isActive={activeSubMenu === 'color_filter'}
                    onMouseEnter={() => setActiveSubMenu('color_filter')}
                    onClick={() => toggleSubMenu('color_filter')}
                    icon={<div className="w-4 h-4 border-2 border-slate-400 rounded-full opacity-60" />}
                >
                     <div className="py-1 min-w-[180px]">
                        <div className="px-4 py-2 text-[11px] text-slate-400 font-bold uppercase tracking-wider">Cell Color</div>
                        <button className="w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 flex items-center gap-3 transition-colors">
                            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded-[2px]"></div>
                            <span>Light Red</span>
                        </button>
                        <button className="w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 flex items-center gap-3 transition-colors">
                            <div className="w-4 h-4 bg-white border border-slate-200 rounded-[2px]"></div>
                            <span>No Fill</span>
                        </button>
                    </div>
                </SubMenuItem>
                
                <SubMenuItem 
                    label="Number Filters" 
                    hasSubMenu 
                    isActive={activeSubMenu === 'number_filter'}
                    onMouseEnter={() => setActiveSubMenu('number_filter')}
                    onClick={() => toggleSubMenu('number_filter')}
                    icon={<span className="font-mono font-bold text-[10px] bg-slate-100 px-1 py-0.5 rounded border border-slate-200 text-slate-600">123</span>}
                >
                    <div className="py-1 w-[220px]">
                        {[
                            'Equals...', 'Does Not Equal...', 'Greater Than...', 'Greater Than Or Equal To...',
                            'Less Than...', 'Less Than Or Equal To...', 'Between...', 'Top 10...', 
                            'Above Average', 'Below Average'
                        ].map((label, i) => (
                            <button key={i} className="w-full text-left px-4 py-2 text-[13px] text-slate-700 hover:bg-slate-50 transition-colors">
                                {label}
                            </button>
                        ))}
                        <Separator />
                        <button className="w-full text-left px-4 py-2 text-[13px] text-slate-700 hover:bg-slate-50 font-medium">Custom Filter...</button>
                    </div>
                </SubMenuItem>
            </div>

            <div className="px-3 pb-3 pt-2 bg-slate-50/50 border-t border-slate-100 flex flex-col gap-2 flex-1 min-h-0" onMouseEnter={() => setActiveSubMenu(null)}>
                <div className="relative group">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search" 
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-[13px] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none placeholder:text-slate-400 bg-white transition-all shadow-sm"
                    />
                </div>

                <div className="flex-1 overflow-y-auto min-h-[150px] border border-slate-200 rounded-lg bg-white shadow-inner p-1">
                    {filterItems.map((item, idx) => (
                        <label key={idx} className="flex items-center gap-3 px-3 py-1.5 hover:bg-slate-50 cursor-pointer select-none rounded-md transition-colors group">
                            <div className="relative flex items-center justify-center">
                                <input 
                                    type="checkbox" 
                                    checked={item.checked} 
                                    readOnly
                                    className="peer appearance-none w-4 h-4 border border-slate-300 rounded checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer bg-white" 
                                />
                                <Check size={10} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" strokeWidth={4} />
                            </div>
                            <span className={cn("text-[13px] text-slate-700 group-hover:text-slate-900", item.bold && "font-semibold")}>{item.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-white" onMouseEnter={() => setActiveSubMenu(null)}>
                <label className="flex items-center gap-2 cursor-pointer select-none group min-w-0 flex-1 mr-4">
                    <div className="relative flex items-center justify-center flex-shrink-0">
                        <input 
                            type="checkbox" 
                            className="peer appearance-none w-3.5 h-3.5 border border-slate-300 rounded-[3px] checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer bg-white"
                        />
                        <Check size={9} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" strokeWidth={4} />
                    </div>
                    <span className="text-[11px] text-slate-600 group-hover:text-slate-800 truncate">Add selection to filter</span>
                </label>
                <div className="flex gap-2 flex-shrink-0">
                    <button 
                        onClick={onClose}
                        className="px-3 py-1.5 rounded-md text-[13px] font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onClose}
                        className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-[13px] font-bold shadow-md shadow-slate-900/10 active:scale-95 transition-all"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    , document.body);
};

export default FilterMenu;
