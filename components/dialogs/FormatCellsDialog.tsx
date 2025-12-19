
import React, { useState, useEffect, useRef } from 'react';
import { X, MousePointer2, Hash, AlignLeft, Type, Grid3X3, PaintBucket, Shield } from 'lucide-react';
import { CellStyle } from '../../types';
import { cn } from '../../utils';
import { motion, AnimatePresence } from 'framer-motion';

// Import modular tabs
import NumberTab from './formatCells/NumberTab';
import AlignmentTab from './formatCells/AlignmentTab';
import FontTab from './formatCells/FontTab';
import BorderTab from './formatCells/BorderTab';
import FillTab from './formatCells/FillTab';
import ProtectionTab from './formatCells/ProtectionTab';

interface FormatCellsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialStyle: CellStyle;
  onApply: (style: CellStyle) => void;
  initialTab?: string;
}

const TABS = [
    { id: 'Number', label: 'Number', icon: Hash, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { id: 'Alignment', label: 'Alignment', icon: AlignLeft, color: 'text-orange-500', bg: 'bg-orange-50' },
    { id: 'Font', label: 'Font', icon: Type, color: 'text-rose-500', bg: 'bg-rose-50' },
    { id: 'Border', label: 'Border', icon: Grid3X3, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 'Fill', label: 'Fill', icon: PaintBucket, color: 'text-violet-500', bg: 'bg-violet-50' },
    { id: 'Protection', label: 'Protection', icon: Shield, color: 'text-amber-500', bg: 'bg-amber-50' },
];

const FormatCellsDialog: React.FC<FormatCellsDialogProps> = ({ isOpen, onClose, initialStyle, onApply, initialTab = 'Number' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [style, setStyle] = useState<CellStyle>(initialStyle);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
      if (isOpen) {
          setStyle(JSON.parse(JSON.stringify(initialStyle)));
          // Validate initialTab exists, fallback if not
          const tabExists = TABS.find(t => t.id === initialTab);
          setActiveTab(tabExists ? initialTab : 'Number');
          // Reset position when opening
          setPosition({ x: 0, y: 0 });
      }
  }, [isOpen, initialStyle, initialTab]);

  useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
          if (!isDragging || isMobile) return;
          setPosition(prev => ({ x: prev.x + e.movementX, y: prev.y + e.movementY }));
      };
      const handleMouseUp = () => setIsDragging(false);
      if (isDragging) {
          window.addEventListener('mousemove', handleMouseMove);
          window.addEventListener('mouseup', handleMouseUp);
      }
      return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
      };
  }, [isDragging, isMobile]);

  const updateStyle = (key: keyof CellStyle, value: any) => {
      setStyle(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
      onApply(style);
      onClose();
  };

  if (!isOpen) return null;

  const floatingClass = isMobile 
    ? "fixed bottom-4 left-4 right-4 z-[2001] bg-white flex flex-col overflow-hidden rounded-[32px] shadow-2xl border border-slate-200" 
    : "relative w-[680px] h-[680px] rounded-[40px] shadow-2xl z-[2001] bg-white border border-slate-200 overflow-hidden flex flex-col";

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md">
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={isMobile ? { y: '100%', opacity: 0 } : { scale: 0.9, opacity: 0 }}
                    animate={isMobile ? { y: 0, opacity: 1 } : { scale: 1, opacity: 1, x: position.x, y: position.y }}
                    exit={isMobile ? { y: '100%', opacity: 0 } : { scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className={cn(floatingClass)}
                    style={{
                        ...( isMobile ? { height: '80vh' } : {} )
                    }}
                >
                    <div 
                        ref={dragRef}
                        className={cn("h-20 flex items-center justify-between px-8 select-none flex-shrink-0 relative", !isMobile && "cursor-move")}
                        onMouseDown={(e) => {
                            if (!isMobile && (e.target === dragRef.current || (e.target as HTMLElement).tagName === 'SPAN')) {
                                setIsDragging(true);
                            }
                        }}
                    >
                        {isMobile && <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-200 rounded-full opacity-50" />}
                        <div className="flex items-center gap-4 mt-2">
                             <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-900/20">
                                <MousePointer2 size={20} className="fill-white" />
                             </div>
                             <div className="flex flex-col">
                                <span className="text-[17px] font-black text-slate-900 tracking-tight">Format Cells</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Properties</span>
                             </div>
                        </div>
                        <button onClick={onClose} className="mt-2 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="px-6 md:px-10 py-1 flex-shrink-0">
                        <div className="w-fit mx-auto max-w-full flex bg-slate-50/50 p-1.5 rounded-[22px] gap-1 overflow-x-auto no-scrollbar border border-slate-100 shadow-inner snap-x scroll-smooth items-center">
                            {TABS.map(tab => {
                                const active = activeTab === tab.id;
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            "pl-3 pr-4 md:pl-3 md:pr-5 py-2.5 md:py-2.5 text-[12px] md:text-[13px] font-bold rounded-[18px] transition-all whitespace-nowrap flex-shrink-0 snap-center min-w-max flex items-center gap-2 group",
                                            active 
                                                ? "bg-white text-slate-800 shadow-sm border border-slate-200/60 scale-[1.02]" 
                                                : "text-slate-400 hover:text-slate-600 hover:bg-white/40"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-7 h-7 rounded-full flex items-center justify-center transition-all",
                                            active ? tab.bg : "bg-white/50 group-hover:bg-white"
                                        )}>
                                            <Icon size={14} className={cn(active ? tab.color : "text-slate-400 group-hover:text-slate-500", "stroke-[2.5]")} />
                                        </div>
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex-1 bg-white px-6 md:px-10 py-6 md:py-10 overflow-y-auto scrollbar-thin">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className="h-full"
                            >
                                {activeTab === 'Number' && <NumberTab style={style} onChange={updateStyle} isMobile={isMobile} />}
                                {activeTab === 'Alignment' && <AlignmentTab style={style} onChange={updateStyle} isMobile={isMobile} />}
                                {activeTab === 'Font' && <FontTab style={style} onChange={updateStyle} isMobile={isMobile} />}
                                {activeTab === 'Border' && <BorderTab style={style} onChange={updateStyle} isMobile={isMobile} />}
                                {activeTab === 'Fill' && <FillTab style={style} onChange={updateStyle} isMobile={isMobile} />}
                                {activeTab === 'Protection' && <ProtectionTab style={style} onChange={updateStyle} isMobile={isMobile} />}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="h-24 md:h-28 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end px-6 md:px-10 gap-3 md:gap-5 flex-shrink-0 pb-2 md:pb-4">
                        <button 
                            onClick={onClose} 
                            className="px-6 md:px-8 py-3 rounded-2xl text-[13px] font-black text-slate-400 hover:text-slate-900 transition-colors"
                        >
                            Discard
                        </button>
                        <button 
                            onClick={handleApply} 
                            className="px-10 md:px-14 py-3 bg-slate-900 rounded-[22px] text-[14px] font-black text-white hover:bg-slate-800 shadow-xl active:scale-95 transition-all"
                        >
                            Save Changes
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default FormatCellsDialog;
