import React, { useRef, useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { CellStyle } from '../../types';

export interface TabProps {
  currentStyle: CellStyle;
  onToggleStyle: (key: keyof CellStyle, value?: any) => void;
  onExport: () => void;
  onClear: () => void;
  onResetLayout: () => void;
}

export const DraggableScrollContainer = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => {
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
};

export const RibbonGroup: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({ label, children, className = "" }) => (
  <div className={`flex flex-col h-full px-2 md:px-3 border-r border-slate-200 last:border-r-0 flex-shrink-0 items-center ${className}`}>
    <div className="flex-1 flex gap-1 items-center justify-center content-center">
       {children}
    </div>
    <div className="h-5 flex items-center justify-center text-[10px] md:text-[11px] text-slate-400 font-medium whitespace-nowrap pb-1">{label}</div>
  </div>
);

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

export const RibbonButton: React.FC<RibbonButtonProps> = ({ 
  icon, label, subLabel, onClick, active, variant = 'small', hasDropdown, className = "", title, disabled 
}) => {
  const baseClass = `flex items-center justify-center rounded-[4px] transition-all duration-150 select-none ${
    active 
      ? 'bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-200' 
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200'
  } ${disabled ? 'opacity-40 cursor-default pointer-events-none' : 'cursor-pointer'} ${className}`;

  if (variant === 'large') {
    return (
      <button onClick={onClick} title={title} disabled={disabled} className={`${baseClass} flex-col px-1.5 py-1 h-full min-w-[48px] md:min-w-[56px] gap-1`}>
        <div className="p-1.5">{icon}</div>
        <div className="text-[10px] md:text-[11px] font-medium leading-tight text-center flex flex-col items-center">
            {label}
            {subLabel && <span>{subLabel}</span>}
            {hasDropdown && <ChevronDown size={10} className="mt-0.5 opacity-50 stroke-[3]" />}
        </div>
      </button>
    );
  }

  if (variant === 'small') {
    return (
      <button onClick={onClick} title={title} disabled={disabled} className={`${baseClass} flex-row px-2 py-1 w-full justify-start gap-2 text-left`}>
        <div className="transform scale-90 flex-shrink-0">{icon}</div>
        {label && <span className="text-[11px] font-medium whitespace-nowrap">{label}</span>}
        {hasDropdown && <ChevronDown size={10} className="ml-auto opacity-50 stroke-[3]" />}
      </button>
    );
  }

  // Icon only
  return (
    <button onClick={onClick} title={title} disabled={disabled} className={`${baseClass} p-1 w-7 h-7 md:w-8 md:h-8 relative`}>
      {icon}
      {hasDropdown && <ChevronDown size={8} className="absolute bottom-0.5 right-0.5 opacity-60 stroke-[3]" />}
    </button>
  );
};

export const ColorPicker: React.FC<{ 
    icon: React.ReactNode; 
    color: string; 
    onChange: (c: string) => void;
    colors: string[];
    title: string;
}> = ({ icon, color, onChange, colors, title }) => {
    return (
        <div className="relative group">
            <RibbonButton 
                variant="icon-only"
                onClick={() => {}}
                title={title}
                hasDropdown
                icon={
                    <div className="relative flex flex-col items-center justify-center h-full w-full">
                        {icon}
                        <div className="h-1 w-5 mt-0.5 rounded-sm shadow-sm" style={{ backgroundColor: color, border: color === 'transparent' ? '1px solid #e2e8f0' : 'none' }} />
                    </div>
                }
            />
             <div className="fixed mt-1 p-3 bg-white shadow-elevation rounded-lg border border-slate-200 hidden group-hover:grid grid-cols-5 gap-1.5 z-[100] w-40 left-auto animate-in fade-in zoom-in-95 duration-100">
                {colors.map(c => (
                    <button
                        key={c}
                        className="w-6 h-6 rounded border border-slate-200 hover:scale-110 hover:border-slate-400 hover:shadow-sm transition-all relative overflow-hidden"
                        style={{ backgroundColor: c === 'transparent' ? 'white' : c }}
                        onClick={() => onChange(c)}
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
        </div>
    )
}

export const Separator = () => <div className="h-3/4 w-[1px] bg-slate-200 mx-1 flex-shrink-0 my-auto" />;
