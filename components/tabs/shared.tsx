
import React, { useRef, useState, useEffect, useLayoutEffect, memo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, SquareArrowOutDownRight } from 'lucide-react';
import { CellStyle, Table } from '../../types';
import { cn, useSmartPosition } from '../../utils';

export interface TabProps {
  currentStyle: CellStyle;
  onToggleStyle: (key: keyof CellStyle, value?: any) => void;
  onApplyStyle?: (style: CellStyle) => void; 
  onExport: () => void;
  onClear: () => void;
  onResetLayout: () => void;
  onCopy?: () => void;
  onCut?: () => void;
  onPaste?: () => void;
  onAutoSum?: (func?: string) => void;
  
  // Enhanced Cells Group Props
  onInsertCells?: () => void;
  onInsertRow?: () => void;
  onInsertColumn?: () => void;
  onInsertSheet?: () => void;
  
  onDeleteCells?: () => void;
  onDeleteRow?: () => void;
  onDeleteColumn?: () => void;
  onDeleteSheet?: () => void;

  onSort?: (direction: 'asc' | 'desc') => void;
  onMergeCenter?: () => void;
  onDataValidation?: () => void;
  onOpenFormatDialog?: (tab?: string) => void;
  onToggleAI?: () => void;
  
  // Format Menu Props
  onFormatRowHeight?: () => void;
  onFormatColWidth?: () => void;
  onAutoFitRowHeight?: () => void;
  onAutoFitColWidth?: () => void;
  onHideRow?: () => void;
  onHideCol?: () => void;
  onUnhideRow?: () => void;
  onUnhideCol?: () => void;
  onRenameSheet?: () => void;
  onMoveCopySheet?: () => void;
  onProtectSheet?: () => void;
  onLockCell?: () => void;

  // Insert Tab Features
  onInsertTable?: () => void;
  onInsertCheckbox?: () => void;
  onInsertLink?: () => void;
  onInsertComment?: () => void;
  onDeleteComment?: () => void;
  // Find & Select
  onFindReplace?: (mode: 'find' | 'replace' | 'goto') => void;
  onSelectSpecial?: (type: 'formulas' | 'comments' | 'constants' | 'validation' | 'conditional' | 'blanks') => void;
  
  // Styles
  onMergeStyles?: () => void;
  onFormatAsTable?: (stylePreset: any) => void;

  // Table Design
  activeTable?: Table | null;
  onTableOptionChange?: (tableId: string, key: keyof Table, value: any) => void;
}

export const DraggableScrollContainer = memo(({ children, className = "" }: { children?: React.ReactNode, className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!ref.current) return;
    setIsDown(true);
    setIsDragging(false);
    setStartX(e.pageX - ref.current.offsetLeft);
    setScrollLeft(ref.current.scrollLeft);
  };

  const onMouseLeave = () => {
    setIsDown(false);
    setIsDragging(false);
  };

  const onMouseUp = () => {
    setIsDown(false);
    setTimeout(() => setIsDragging(false), 50);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX) * 1.5; 
    if (Math.abs(walk) > 5 && !isDragging) {
        setIsDragging(true);
    }
    ref.current.scrollLeft = scrollLeft - walk;
  };

  const onClickCapture = (e: React.MouseEvent) => {
      if (isDragging) {
          e.preventDefault();
          e.stopPropagation();
      }
  };

  return (
    <div
      ref={ref}
      className={`overflow-x-auto overflow-y-hidden no-scrollbar cursor-grab active:cursor-grabbing ${className}`}
      onMouseDown={onMouseDown}
      onMouseLeave={onMouseLeave}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      onClickCapture={onClickCapture}
    >
      {children}
    </div>
  );
});

export const RibbonGroup: React.FC<{ 
    label: string; 
    children: React.ReactNode; 
    className?: string; 
    showLauncher?: boolean; 
    onLaunch?: () => void;
}> = memo(({ label, children, className = "", showLauncher, onLaunch }) => (
  <div className={`flex flex-col h-full px-1.5 border-r border-slate-200 last:border-r-0 flex-shrink-0 relative group/ribbon ${className}`}>
    <div className="flex-1 flex gap-1 items-center justify-center min-h-0">
       {children}
    </div>
    <div className="h-[18px] flex items-center justify-center text-[10px] text-slate-400 font-medium whitespace-nowrap pb-1 cursor-default">{label}</div>
    {showLauncher && (
        <button 
            onClick={onLaunch}
            className="absolute bottom-0.5 right-0.5 p-[0.3rem] text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-sm transition-colors"
            title="See more options"
        >
            <SquareArrowOutDownRight size={10} />
        </button>
    )}
  </div>
));

interface RibbonButtonProps {
  icon: React.ReactNode;
  label?: string;
  subLabel?: string;
  onClick: () => void;
  active?: boolean;
  variant?: 'large' | 'small' | 'icon-only';
  hasDropdown?: boolean;
  className?: string;
  title?: string;
  disabled?: boolean;
}

export const RibbonButton: React.FC<RibbonButtonProps> = memo(({ 
  icon, label, subLabel, onClick, active, variant = 'small', hasDropdown, className = "", title, disabled 
}) => {
  const baseClass = `flex items-center justify-center rounded-md transition-all duration-150 select-none ${
    active 
      ? 'bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-200' 
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200'
  } ${disabled ? 'opacity-40 cursor-default pointer-events-none' : 'cursor-pointer'}`;

  const getIconConfig = () => {
    switch(variant) {
      case 'large': return { size: 24, strokeWidth: 1.5 };
      case 'small': return { size: 14, strokeWidth: 2 };
      case 'icon-only': return { size: 16, strokeWidth: 2 };
      default: return { size: 16, strokeWidth: 2 };
    }
  }
  const iconConfig = getIconConfig();

  const styledIcon = React.isValidElement(icon) 
    ? React.cloneElement(icon as React.ReactElement<any>, iconConfig) 
    : icon;

  if (variant === 'large') {
    return (
      <button onClick={onClick} title={title} disabled={disabled} className={cn(`${baseClass} flex-col px-1 py-1 h-full min-w-[52px] md:min-w-[60px] gap-0.5 justify-center`, className)}>
        <div className="p-1">{styledIcon}</div>
        <div className="text-[11px] font-medium leading-[1.1] text-center flex flex-col items-center text-slate-700">
            {label}
            {subLabel && <span>{subLabel}</span>}
            {hasDropdown && <ChevronDown size={10} className="mt-0.5 opacity-50 stroke-[3]" />}
        </div>
      </button>
    );
  }

  if (variant === 'small') {
    return (
      <button onClick={onClick} title={title} disabled={disabled} className={cn(`${baseClass} flex-row px-1.5 py-0.5 w-full justify-start gap-2 text-left h-6`, className)}>
        <div className="transform flex-shrink-0 text-slate-700 flex items-center">{styledIcon}</div>
        {label && <span className="text-[12px] text-slate-700 font-medium whitespace-nowrap leading-none pt-0.5">{label}</span>}
        {hasDropdown && <ChevronDown size={10} className="ml-auto opacity-50 stroke-[3]" />}
      </button>
    );
  }

  return (
    <button onClick={onClick} title={title} disabled={disabled} className={cn(`${baseClass} p-1 w-7 h-7 relative`, className)}>
      {styledIcon}
      {hasDropdown && (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="8" 
            height="8" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="lucide lucide-chevron-down absolute bottom-0.5 right-0.5 opacity-60 stroke-[3]"
        >
            <path d="m6 9 6 6 6-6"/>
        </svg>
      )}
    </button>
  );
});

export const SmartDropdown = ({ 
    trigger, 
    children, 
    contentWidth = 'w-48', 
    className = "",
    triggerClassName = "h-full",
    open,
    onToggle
}: {
    trigger: React.ReactNode;
    children?: React.ReactNode;
    contentWidth?: string; 
    className?: string;
    triggerClassName?: string;
    open: boolean;
    onToggle: () => void;
}) => {
    const triggerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    
    // Pass widthClass to allow CSS width or specific pixel width override
    const position = useSmartPosition(open, triggerRef, contentRef, { widthClass: contentWidth });

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent | TouchEvent) => {
             if (
                triggerRef.current && 
                !triggerRef.current.contains(e.target as Node) &&
                contentRef.current &&
                !contentRef.current.contains(e.target as Node)
            ) {
                if (open) onToggle();
            }
        };
        if(open) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside, { passive: true });
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [open, onToggle]);

    return (
        <>
            <div ref={triggerRef} onClick={onToggle} className={`inline-block select-none ${triggerClassName}`}>
                {trigger}
            </div>
            {open && position && createPortal(
                <div 
                    ref={contentRef}
                    className={cn(
                        "fixed z-[2000] bg-white shadow-xl border border-slate-200 rounded-lg p-1 flex flex-col",
                        contentWidth, 
                        className
                    )}
                    style={{ 
                        top: position.top, 
                        bottom: position.bottom,
                        left: position.left, 
                        // If width is calculated by smartPosition (auto), apply it. Otherwise let classes handle it.
                        width: position.width,
                        maxHeight: position.maxHeight,
                        transformOrigin: position.transformOrigin,
                        // Opacity transition to prevent jumping
                        opacity: position.ready ? 1 : 0,
                        // Only animate when ready
                        animation: position.ready ? 'fadeInScale 0.15s ease-out forwards' : 'none',
                        // Disable pointer events while measuring to prevent accidental clicks
                        pointerEvents: position.ready ? 'auto' : 'none'
                    }}
                >
                    <div className="overflow-y-auto min-h-0 flex-1 scrollbar-thin">
                        {children}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export const ColorPicker: React.FC<{ 
    icon: React.ReactNode; 
    color: string; 
    onChange: (c: string) => void;
    colors: string[];
    title: string;
}> = memo(({ icon, color, onChange, colors, title }) => {
    const [open, setOpen] = useState(false);
    
    const styledIcon = React.isValidElement(icon) 
        ? React.cloneElement(icon as React.ReactElement<any>, { size: 16, strokeWidth: 2 }) 
        : icon;

    return (
        <SmartDropdown
            open={open}
            onToggle={() => setOpen(!open)}
            contentWidth="w-40"
            trigger={
                <RibbonButton 
                    variant="icon-only" 
                    onClick={() => {}} 
                    title={title}
                    hasDropdown
                    icon={
                        <div className="relative flex flex-col items-center justify-center h-full w-full">
                            {styledIcon}
                            <div className="h-0.5 w-4 mt-0.5 rounded-sm shadow-sm" style={{ backgroundColor: color, border: color === 'transparent' ? '1px solid #e2e8f0' : 'none' }} />
                        </div>
                    }
                />
            }
        >
             <div className="grid grid-cols-5 gap-1.5 p-2">
                {colors.map(c => (
                    <button
                        key={c}
                        className="w-6 h-6 rounded border border-slate-200 hover:scale-110 hover:border-slate-400 hover:shadow-sm transition-all relative overflow-hidden"
                        style={{ backgroundColor: c === 'transparent' ? 'white' : c }}
                        onClick={() => { onChange(c); setOpen(false); }}
                        title={c}
                    >
                         {c === 'transparent' && (
                             <div className="absolute inset-0 flex items-center justify-center">
                                 <div className="w-full h-[1px] bg-red-500 rotate-45 transform" />
                             </div>
                         )}
                    </button>
                ))}
            </div>
        </SmartDropdown>
    )
});

export const Separator = memo(() => <div className="h-4/5 w-[1px] bg-slate-200 mx-1 flex-shrink-0 my-auto" />);
