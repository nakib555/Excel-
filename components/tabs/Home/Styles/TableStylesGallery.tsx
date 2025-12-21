
import React from 'react';
import { TABLE_STYLES } from './tableData';
import { cn } from '../../../../utils';
import { Plus, LayoutTemplate } from 'lucide-react';
import { TableStylePreset } from '../../../../types';

export const StylePreviewItem: React.FC<{ style: TableStylePreset, onClick: () => void, selected?: boolean }> = ({ style, onClick, selected }) => {
    return (
        <button 
            onClick={onClick}
            className={cn(
                "group relative w-full aspect-[5/3] rounded-lg transition-all duration-200 outline-none isolate",
                "hover:scale-105 hover:z-20 hover:shadow-xl",
                selected 
                    ? "ring-2 ring-primary-500 ring-offset-2 z-10 shadow-md" 
                    : "hover:ring-2 hover:ring-primary-200 hover:ring-offset-2"
            )}
            title={style.name}
        >
            <div className="w-full h-full flex flex-col overflow-hidden rounded-[6px] shadow-sm bg-white ring-1 ring-black/5 group-hover:ring-black/10">
                {/* Header Row */}
                <div 
                    className="h-[32%] w-full flex items-center justify-center relative"
                    style={{ backgroundColor: style.headerBg }}
                >
                    {/* Abstract Text Line */}
                    <div className="w-[60%] h-[2px] rounded-full opacity-60" style={{ backgroundColor: style.headerColor === '#ffffff' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.2)' }} />
                </div>
                
                {/* Body Rows */}
                <div className="flex-1 flex flex-col">
                    <div className="flex-1 w-full flex items-center px-1" style={{ backgroundColor: style.rowOddBg }}>
                        <div className="w-[30%] h-[1.5px] bg-slate-900/5 rounded-full" />
                    </div>
                    <div className="flex-1 w-full flex items-center px-1" style={{ backgroundColor: style.rowEvenBg }}>
                        <div className="w-[30%] h-[1.5px] bg-slate-900/5 rounded-full" />
                    </div>
                    <div className="flex-1 w-full flex items-center px-1" style={{ backgroundColor: style.rowOddBg }}>
                        <div className="w-[30%] h-[1.5px] bg-slate-900/5 rounded-full" />
                    </div>
                    <div className="flex-1 w-full flex items-center px-1" style={{ backgroundColor: style.rowEvenBg }}>
                        <div className="w-[30%] h-[1.5px] bg-slate-900/5 rounded-full" />
                    </div>
                </div>
            </div>
        </button>
    );
};

interface TableStylesGalleryProps {
    onSelect: (style: TableStylePreset) => void;
}

const TableStylesGallery: React.FC<TableStylesGalleryProps> = ({ onSelect }) => {
    const renderCategory = (cat: string) => {
        const styles = TABLE_STYLES.filter(s => s.category === cat);
        if (styles.length === 0) return null;
        return (
            <div className="flex flex-col mb-5">
                <div className="px-5 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white/95 backdrop-blur-sm sticky top-0 z-10 flex items-center gap-2 border-b border-slate-50 mb-3">
                    <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        cat === 'Light' ? "bg-slate-300" : cat === 'Medium' ? "bg-slate-400" : "bg-slate-600"
                    )} />
                    {cat}
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-3 gap-y-3 px-5">
                    {styles.map((s, i) => (
                        <StylePreviewItem key={i} style={s} onClick={() => onSelect(s)} />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col bg-white max-h-[70vh] overflow-y-auto scrollbar-thin rounded-xl">
            <div className="pt-2 pb-4">
                {renderCategory('Light')}
                {renderCategory('Medium')}
                {renderCategory('Dark')}
            </div>
            
            <div className="border-t border-slate-100 p-2 bg-slate-50/50 sticky bottom-0 z-20 backdrop-blur-sm flex flex-col gap-1">
                <button className="w-full text-left px-4 py-2 text-[11px] font-bold text-slate-700 hover:bg-white hover:text-emerald-700 hover:shadow-sm border border-transparent hover:border-slate-200 rounded-lg transition-all flex items-center gap-3 group">
                    <div className="w-5 h-5 flex items-center justify-center rounded-md bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                        <Plus size={14} />
                    </div>
                    New Table Style...
                </button>
                <button className="w-full text-left px-4 py-2 text-[11px] font-bold text-slate-700 hover:bg-white hover:text-blue-700 hover:shadow-sm border border-transparent hover:border-slate-200 rounded-lg transition-all flex items-center gap-3 group">
                    <div className="w-5 h-5 flex items-center justify-center rounded-md bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                        <LayoutTemplate size={14} />
                    </div>
                    New PivotTable Style...
                </button>
            </div>
        </div>
    );
};

export default TableStylesGallery;
