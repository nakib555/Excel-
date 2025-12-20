
import React, { useState } from 'react';
import { Table, Plus } from 'lucide-react';
import { RibbonButton, SmartDropdown } from '../../shared';
import { cn } from '../../../utils';

interface TableStylePreset {
    name: string;
    headerBg: string;
    headerColor: string;
    rowEvenBg: string;
    rowOddBg: string;
    border?: string;
    category: 'Light' | 'Medium' | 'Dark';
}

interface FormatAsTableProps {
    onFormatAsTable?: (style: TableStylePreset) => void;
}

// Helper to generate styles
const createStyle = (
    name: string, 
    cat: 'Light' | 'Medium' | 'Dark', 
    hBg: string, 
    hCol: string, 
    oddBg: string, 
    evenBg: string, 
    border?: string
): TableStylePreset => ({
    name, category: cat, headerBg: hBg, headerColor: hCol, rowOddBg: oddBg, rowEvenBg: evenBg, border
});

const TABLE_STYLES: TableStylePreset[] = [
    // --- LIGHT ---
    createStyle('None', 'Light', '#ffffff', '#000000', '#ffffff', '#ffffff'),
    createStyle('Light 1', 'Light', '#ffffff', '#000000', '#ffffff', '#ffffff', '#e2e8f0'), // White with border
    createStyle('Light 2', 'Light', '#eff6ff', '#000000', '#ffffff', '#eff6ff', '#bfdbfe'), // Blue tint
    createStyle('Light 3', 'Light', '#fff7ed', '#000000', '#ffffff', '#fff7ed', '#fed7aa'), // Orange tint
    createStyle('Light 4', 'Light', '#f8fafc', '#000000', '#ffffff', '#f8fafc', '#cbd5e1'), // Gray tint
    createStyle('Light 5', 'Light', '#fefce8', '#000000', '#ffffff', '#fefce8', '#fef08a'), // Yellow tint
    createStyle('Light 6', 'Light', '#f0fdf4', '#000000', '#ffffff', '#f0fdf4', '#bbf7d0'), // Green tint
    createStyle('Light 7', 'Light', '#ecfeff', '#000000', '#ffffff', '#ecfeff', '#a5f3fc'), // Cyan tint
    
    createStyle('Light 8', 'Light', '#ffffff', '#000000', '#ffffff', '#f1f5f9'), // White Header, Gray Banding
    createStyle('Light 9', 'Light', '#e0f2fe', '#000000', '#ffffff', '#f0f9ff'), // Light Blue Header
    createStyle('Light 10', 'Light', '#ffedd5', '#000000', '#ffffff', '#fff7ed'), // Light Orange Header
    createStyle('Light 11', 'Light', '#e2e8f0', '#000000', '#ffffff', '#f8fafc'), // Light Gray Header
    createStyle('Light 12', 'Light', '#fef9c3', '#000000', '#ffffff', '#fefce8'), // Light Yellow Header
    createStyle('Light 13', 'Light', '#dcfce7', '#000000', '#ffffff', '#f0fdf4'), // Light Green Header
    createStyle('Light 14', 'Light', '#fae8ff', '#000000', '#ffffff', '#faf5ff'), // Light Purple Header

    // --- MEDIUM ---
    createStyle('Medium 1', 'Medium', '#94a3b8', '#ffffff', '#f1f5f9', '#ffffff'), // Slate Header
    createStyle('Medium 2', 'Medium', '#3b82f6', '#ffffff', '#eff6ff', '#ffffff'), // Blue Header
    createStyle('Medium 3', 'Medium', '#f97316', '#ffffff', '#fff7ed', '#ffffff'), // Orange Header
    createStyle('Medium 4', 'Medium', '#64748b', '#ffffff', '#f8fafc', '#ffffff'), // Gray Header
    createStyle('Medium 5', 'Medium', '#eab308', '#ffffff', '#fefce8', '#ffffff'), // Yellow Header
    createStyle('Medium 6', 'Medium', '#22c55e', '#ffffff', '#f0fdf4', '#ffffff'), // Green Header
    createStyle('Medium 7', 'Medium', '#06b6d4', '#ffffff', '#ecfeff', '#ffffff'), // Cyan Header
    
    createStyle('Medium 8', 'Medium', '#1e293b', '#ffffff', '#cbd5e1', '#e2e8f0'), // Dark Slate
    createStyle('Medium 9', 'Medium', '#1d4ed8', '#ffffff', '#bfdbfe', '#dbeafe'), // Dark Blue
    createStyle('Medium 10', 'Medium', '#c2410c', '#ffffff', '#fed7aa', '#ffedd5'), // Dark Orange
    createStyle('Medium 11', 'Medium', '#475569', '#ffffff', '#cbd5e1', '#e2e8f0'), // Dark Gray
    createStyle('Medium 12', 'Medium', '#a16207', '#ffffff', '#fef08a', '#fef9c3'), // Dark Yellow
    createStyle('Medium 13', 'Medium', '#15803d', '#ffffff', '#bbf7d0', '#dcfce7'), // Dark Green
    createStyle('Medium 14', 'Medium', '#0e7490', '#ffffff', '#a5f3fc', '#cffafe'), // Dark Cyan

    // --- DARK ---
    createStyle('Dark 1', 'Dark', '#000000', '#ffffff', '#333333', '#1a1a1a'), // Black
    createStyle('Dark 2', 'Dark', '#1e3a8a', '#ffffff', '#1e40af', '#172554'), // Navy
    createStyle('Dark 3', 'Dark', '#7f1d1d', '#ffffff', '#991b1b', '#450a0a'), // Dark Red
    createStyle('Dark 4', 'Dark', '#14532d', '#ffffff', '#166534', '#052e16'), // Dark Green
    createStyle('Dark 5', 'Dark', '#4c1d95', '#ffffff', '#5b21b6', '#2e1065'), // Dark Purple
    createStyle('Dark 6', 'Dark', '#78350f', '#ffffff', '#92400e', '#451a03'), // Dark Brown
    createStyle('Dark 7', 'Dark', '#134e4a', '#ffffff', '#115e59', '#042f2e'), // Dark Teal
];

const StylePreviewItem: React.FC<{ style: TableStylePreset, onClick: () => void }> = ({ style, onClick }) => {
    return (
        <button 
            onClick={onClick}
            className="group flex flex-col w-full aspect-[1.3] border-2 border-transparent hover:border-orange-400 hover:bg-orange-100 hover:shadow-sm p-[2px] transition-all rounded-[2px]"
            title={style.name}
        >
            <div className="w-full h-full flex flex-col border border-slate-300 overflow-hidden">
                {/* Header */}
                <div 
                    className="h-[25%] w-full flex items-center px-1"
                    style={{ backgroundColor: style.headerBg, color: style.headerColor, borderBottom: style.border ? `1px solid ${style.border}` : 'none' }}
                >
                    <div className="w-full h-[2px] bg-current opacity-40 rounded-full" />
                </div>
                {/* Body Rows */}
                <div className="flex-1 flex flex-col">
                    <div className="flex-1 w-full" style={{ backgroundColor: style.rowOddBg }} />
                    <div className="flex-1 w-full" style={{ backgroundColor: style.rowEvenBg }} />
                    <div className="flex-1 w-full" style={{ backgroundColor: style.rowOddBg }} />
                </div>
            </div>
        </button>
    );
};

const FormatAsTable: React.FC<FormatAsTableProps> = ({ onFormatAsTable }) => {
    const [open, setOpen] = useState(false);

    const handleSelect = (style: TableStylePreset) => {
        if (onFormatAsTable) onFormatAsTable(style);
        setOpen(false);
    };

    const renderCategory = (cat: string) => {
        const styles = TABLE_STYLES.filter(s => s.category === cat);
        if (styles.length === 0) return null;
        return (
            <div className="flex flex-col gap-1 mb-2">
                <div className="px-3 py-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{cat}</div>
                <div className="grid grid-cols-7 gap-1 px-3">
                    {styles.map((s, i) => (
                        <StylePreviewItem key={i} style={s} onClick={() => handleSelect(s)} />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <SmartDropdown
            open={open}
            onToggle={() => setOpen(!open)}
            contentWidth="w-[320px]"
            triggerClassName="h-full"
            trigger={
                <RibbonButton 
                    variant="large" 
                    icon={<Table size={20} className="text-amber-500" />} 
                    label="Format as" 
                    subLabel="Table" 
                    onClick={() => {}} 
                    hasDropdown 
                    active={open}
                />
            }
        >
            <div className="flex flex-col py-2 bg-white max-h-[450px] overflow-y-auto scrollbar-thin">
                {renderCategory('Light')}
                {renderCategory('Medium')}
                {renderCategory('Dark')}
                
                <div className="border-t border-slate-200 mt-2 pt-2 px-1">
                    <button className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors rounded-md flex items-center gap-2">
                        <div className="w-4 h-4 bg-slate-200 rounded flex items-center justify-center">
                            <Plus size={10} className="text-slate-600" />
                        </div>
                        New Table Style...
                    </button>
                    <button className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors rounded-md flex items-center gap-2">
                        <div className="w-4 h-4 bg-slate-200 rounded flex items-center justify-center">
                            <Plus size={10} className="text-slate-600" />
                        </div>
                        New PivotTable Style...
                    </button>
                </div>
            </div>
        </SmartDropdown>
    );
};

export default FormatAsTable;
