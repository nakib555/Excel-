
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  ArrowDownAZ, ArrowUpAZ, ChevronRight, Search, FilterX, 
  Check, ArrowDown, ArrowUp, Palette, PaintBucket, Calculator
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
    const position = useSmartPosition(true, parentRef, menuRef, { axis: 'horizontal', gap: -4 });

    if (!position) return null;

    return createPortal(
        <div 
            ref={menuRef}
            data-submenu-portal="true"
            className={cn(
                "z-[2020] bg-white border border-slate-200 shadow-xl rounded-lg py-1.5 flex flex-col fixed scrollbar-thin ring-1 ring-black/5 overflow-y-auto",
                "min-w-[max-content]", // Auto width based on content
                position.ready && "animate-in fade-in zoom-in-95 slide-in-from-left-1 duration-100"
            )}
            style={{
                top: position.top ?? 0,
                left: position.left ?? 0,
                opacity: position.ready ? 1 : 0,
                maxHeight: position.maxHeight,
                transformOrigin: position.transformOrigin,
                maxWidth: 'calc(100vw - 16px)',
                width: position.width // Apply calculated width if constrained
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
    shortcut,
    disabled
}: { 
    label: string; 
    icon?: React.ReactNode; 
    hasSubMenu?: boolean; 
    onMouseEnter?: () => void;
    onClick?: () => void;
    children?: React.ReactNode; 
    isActive?: boolean;
    shortcut?: string;
    disabled?: boolean;
}) => {
    const itemRef = useRef<HTMLButtonElement>(null);

    const handleInteraction = (e: React.MouseEvent) => {
        if (disabled) return;
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
                disabled={disabled}
                className={cn(
                    "flex items-center w-full px-4 py-2 text-[13px] text-slate-700 text-left transition-all gap-3 group relative select-none whitespace-nowrap",
                    isActive ? "bg-blue-50 text-slate-900 font-medium" : "hover:bg-slate-50 hover:text-slate-900",
                    disabled && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-slate-700"
                )}
                onClick={handleInteraction}
            >
                <div className={cn("w-4 flex justify-center items-center transition-colors flex-shrink-0", isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")}>
                    {icon}
                </div>
                <span className="flex-1 truncate leading-none pt-0.5">{label}</span>
                {shortcut && <span className="text-[10px] text-slate-400 ml-2">{shortcut}</span>}
                {hasSubMenu && <ChevronRight size={12} className={cn("transition-colors ml-2", isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />}
            </button>
            
            {isActive && children && (
                <SmartSubMenuContent parentRef={itemRef}>
                    {children}
                </SmartSubMenuContent>
            )}
        </div>
    );
};

const Separator = () => <div className="h-[1px] bg-slate-100 my-1 mx-4" />;

const FilterMenu: React.FC<FilterMenuProps> = ({ isOpen, onClose, triggerRef }) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const position = useSmartPosition(isOpen, triggerRef, menuRef, { fixedWidth: 320, gap: 4 });
    
    const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
    const [searchText, setSearchText] = useState('');

    const [filterItems, setFilterItems] = useState([
        { id: 'all', label: '(Select All)', checked: true, bold: true },
        { id: '2', label: '2', checked: true },
        { id: '4', label: '4', checked: true },
        { id: '5', label: '5', checked: true },
        { id: 'total', label: 'Grand Total', checked: true },
        { id: 'qty', label: 'Qty', checked: true },
        { id: 'blanks', label: '(Blanks)', checked: true },
    ]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent | TouchEvent) => {
            const target = e.target as HTMLElement;
            // Ignore clicks inside the menu, the trigger, OR any open submenu portals
            if (menuRef.current && !menuRef.current.contains(target) && 
                triggerRef.current && !triggerRef.current.contains(target) &&
                !target.closest('[data-submenu-portal="true"]')) {
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

    if (!isOpen || !position) return null;

    // Modified to be idempotent (clicking open menu keeps it open)
    const openSubMenu = (id: string) => {
        setActiveSubMenu(id);
    };

    const toggleItem = (id: string) => {
        setFilterItems(prev => {
            if (id === 'all') {
                const newState = !prev.find(i => i.id === 'all')?.checked;
                return prev.map(i => ({ ...i, checked: newState }));
            }
            const next = prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i);
            
            // Update select all state
            const allChecked = next.filter(i => i.id !== 'all').every(i => i.checked);
            const someChecked = next.filter(i => i.id !== 'all').some(i => i.checked);
            
            return next.map(i => i.id === 'all' ? { ...i, checked: allChecked, indeterminate: !allChecked && someChecked } : i);
        });
    };

    return createPortal(
        <div 
            ref={menuRef}
            className={cn(
                "fixed z-[2005] bg-white border border-slate-200 shadow-2xl rounded-xl w-[320px] flex flex-col font-sans text-slate-800 overflow-hidden ring-1 ring-slate-900/5",
                position.ready && "animate-in fade-in zoom-in-95 duration-150 ease-out"
            )}
            style={{ 
                top: position.top ?? 0,
                left: position.left ?? 0,
                opacity: position.ready ? 1 : 0,
                maxHeight: position.maxHeight,
                transformOrigin: position.transformOrigin
            }}
        >
            <div className="py-2 flex-shrink-0">
                <SubMenuItem 
                    label="Sort Smallest to Largest" 
                    icon={<ArrowDownAZ size={16} className="text-slate-600" />} 
                    onMouseEnter={() => setActiveSubMenu(null)}
                />
                <SubMenuItem 
                    label="Sort Largest to Smallest" 
                    icon={<ArrowUpAZ size={16} className="text-slate-600" />} 
                    onMouseEnter={() => setActiveSubMenu(null)}
                />
                <SubMenuItem 
                    label="Sort by Color" 
                    hasSubMenu 
                    isActive={activeSubMenu === 'color_sort'}
                    onMouseEnter={() => setActiveSubMenu('color_sort')}
                    onClick={() => openSubMenu('color_sort')}
                    icon={<Palette size={16} className="text-pink-500" />}
                >
                    <div className="py-2 w-48">
                        <div className="px-4 py-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cell Color</div>
                        <button className="w-full text-left px-4 py-2 text-[13px] hover:bg-blue-50 text-slate-700 flex items-center gap-3 transition-colors">
                            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded-[3px] shadow-sm"></div>
                            <span>Light Red</span>
                        </button>
                        <button className="w-full text-left px-4 py-2 text-[13px] hover:bg-blue-50 text-slate-700 flex items-center gap-3 transition-colors">
                            <div className="w-4 h-4 bg-white border border-slate-200 rounded-[3px] shadow-sm"></div>
                            <span>No Fill</span>
                        </button>
                    </div>
                </SubMenuItem>
                
                <Separator />
                
                <SubMenuItem 
                    label='Clear Filter From "Column"' 
                    icon={<FilterX size={16} className="text-red-400" />} 
                    onMouseEnter={() => setActiveSubMenu(null)}
                    disabled
                />
                
                <SubMenuItem 
                    label="Filter by Color" 
                    hasSubMenu 
                    isActive={activeSubMenu === 'color_filter'}
                    onMouseEnter={() => setActiveSubMenu('color_filter')}
                    onClick={() => openSubMenu('color_filter')}
                    icon={<PaintBucket size={16} className="text-orange-500" />}
                >
                     <div className="py-2 w-48">
                        <div className="px-4 py-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cell Color</div>
                        <button className="w-full text-left px-4 py-2 text-[13px] hover:bg-blue-50 text-slate-700 flex items-center gap-3 transition-colors">
                            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded-[3px]"></div>
                            <span>Light Red</span>
                        </button>
                        <button className="w-full text-left px-4 py-2 text-[13px] hover:bg-blue-50 text-slate-700 flex items-center gap-3 transition-colors">
                            <div className="w-4 h-4 bg-white border border-slate-200 rounded-[3px]"></div>
                            <span>No Fill</span>
                        </button>
                    </div>
                </SubMenuItem>
                
                <SubMenuItem 
                    label="Number Filters" 
                    hasSubMenu 
                    isActive={activeSubMenu === 'number_filter'}
                    onMouseEnter={() => setActiveSubMenu('number_filter')}
                    onClick={() => openSubMenu('number_filter')}
                    icon={<Calculator size={16} className="text-cyan-600" />}
                >
                    <div className="py-1 w-56">
                        {[
                            'Equals...', 'Does Not Equal...', 'Greater Than...', 'Greater Than Or Equal To...',
                            'Less Than...', 'Less Than Or Equal To...', 'Between...', 'Top 10...', 
                            'Above Average', 'Below Average'
                        ].map((label, i) => (
                            <button key={i} className="w-full text-left px-4 py-2 text-[13px] text-slate-700 hover:bg-blue-50 transition-colors whitespace-nowrap">
                                {label}
                            </button>
                        ))}
                        <Separator />
                        <button className="w-full text-left px-4 py-2 text-[13px] text-slate-700 hover:bg-blue-50 font-medium whitespace-nowrap">Custom Filter...</button>
                    </div>
                </SubMenuItem>
            </div>

            {/* Middle Section: Search and List */}
            <div className="px-4 pb-2 flex flex-col gap-3 flex-1 min-h-0 bg-slate-50/50 border-t border-slate-100 pt-3" onMouseEnter={() => setActiveSubMenu(null)}>
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

                <div className="flex-1 overflow-y-auto min-h-[180px] max-h-[250px] border border-slate-200 rounded-lg bg-white p-1 shadow-inner scrollbar-thin">
                    {filterItems.map((item) => (
                        <div 
                            key={item.id} 
                            onClick={() => toggleItem(item.id)}
                            className="flex items-center gap-3 px-3 py-1.5 hover:bg-blue-50 cursor-pointer select-none rounded-md transition-colors group"
                        >
                            <div className={cn(
                                "w-4 h-4 rounded border flex items-center justify-center transition-all shadow-sm",
                                item.checked ? "bg-blue-600 border-blue-600" : "bg-white border-slate-300 group-hover:border-blue-400"
                            )}>
                                {item.checked && <Check size={10} className="text-white stroke-[4]" />}
                            </div>
                            <span className="text-[13px] text-slate-700 leading-none pt-0.5 font-medium">
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end px-4 py-3 border-t border-slate-100 bg-slate-50 gap-3" onMouseEnter={() => setActiveSubMenu(null)}>
                <button 
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg text-[13px] font-semibold text-slate-600 hover:bg-slate-200/50 hover:text-slate-800 transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={onClose}
                    className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[13px] font-bold shadow-lg shadow-slate-900/10 active:scale-95 transition-all"
                >
                    OK
                </button>
            </div>
        </div>
    , document.body);
};

export default FilterMenu;
