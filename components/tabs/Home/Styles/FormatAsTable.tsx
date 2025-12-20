
import React, { useState } from 'react';
import { Table, Plus, LayoutTemplate } from 'lucide-react';
import { RibbonButton, SmartDropdown } from '../../shared';
import { cn } from '../../../../utils';

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

// Extensive list to match Excel's variety
const TABLE_STYLES: TableStylePreset[] = [
    // --- LIGHT ---
    createStyle('None', 'Light', '#ffffff', '#000000', '#ffffff', '#ffffff'),
    createStyle('Light 1', 'Light', '#ffffff', '#000000', '#ffffff', '#ffffff', '#e2e8f0'), // White w/ border
    createStyle('Light 2', 'Light', '#eff6ff', '#000000', '#eff6ff', '#ffffff'), // Blue tint
    createStyle('Light 3', 'Light', '#fff7ed', '#000000', '#fff7ed', '#ffffff'), // Orange tint
    createStyle('Light 4', 'Light', '#f8fafc', '#000000', '#f8fafc', '#ffffff'), // Gray tint
    createStyle('Light 5', 'Light', '#fefce8', '#000000', '#fefce8', '#ffffff'), // Yellow tint
    createStyle('Light 6', 'Light', '#f0fdf4', '#000000', '#f0fdf4', '#ffffff'), // Green tint
    createStyle('Light 7', 'Light', '#ecfeff', '#000000', '#ecfeff', '#ffffff'), // Cyan tint
    
    createStyle('Light 8', 'Light', '#ffffff', '#000000', '#ffffff', '#f1f5f9', '#cbd5e1'), // White Header, Gray Banding
    createStyle('Light 9', 'Light', '#ffffff', '#000000', '#ffffff', '#e0f2fe', '#bfdbfe'), // Blue Banding
    createStyle('Light 10', 'Light', '#ffffff', '#000000', '#ffffff', '#ffedd5', '#fed7aa'), // Orange Banding
    createStyle('Light 11', 'Light', '#ffffff', '#000000', '#ffffff', '#f1f5f9', '#cbd5e1'), // Gray Banding
    createStyle('Light 12', 'Light', '#ffffff', '#000000', '#ffffff', '#fef9c3', '#fde047'), // Yellow Banding
    createStyle('Light 13', 'Light', '#ffffff', '#000000', '#ffffff', '#dcfce7', '#86efac'), // Green Banding
    createStyle('Light 14', 'Light', '#ffffff', '#000000', '#ffffff', '#fae8ff', '#d8b4fe'), // Purple Banding

    createStyle('Light 15', 'Light', '#f1f5f9', '#000000', '#ffffff', '#f1f5f9', '#cbd5e1'), // Gray Header
    createStyle('Light 16', 'Light', '#e0f2fe', '#000000', '#ffffff', '#e0f2fe', '#bfdbfe'), // Blue Header
    createStyle('Light 17', 'Light', '#ffedd5', '#000000', '#ffffff', '#ffedd5', '#fed7aa'), // Orange Header
    createStyle('Light 18', 'Light', '#f1f5f9', '#000000', '#ffffff', '#f1f5f9', '#cbd5e1'), // Gray Header
    createStyle('Light 19', 'Light', '#fef9c3', '#000000', '#ffffff', '#fef9c3', '#fde047'), // Yellow Header
    createStyle('Light 20', 'Light', '#dcfce7', '#000000', '#ffffff', '#dcfce7', '#86efac'), // Green Header
    createStyle('Light 21', 'Light', '#fae8ff', '#000000', '#ffffff', '#fae8ff', '#d8b4fe'), // Purple Header

    // --- MEDIUM ---
    createStyle('Medium 1', 'Medium', '#64748b', '#ffffff', '#f1f5f9', '#ffffff'), // Slate Header
    createStyle('Medium 2', 'Medium', '#3b82f6', '#ffffff', '#eff6ff', '#ffffff'), // Blue Header
    createStyle('Medium 3', 'Medium', '#f97316', '#ffffff', '#fff7ed', '#ffffff'), // Orange Header
    createStyle('Medium 4', 'Medium', '#6b7280', '#ffffff', '#f9fafb', '#ffffff'), // Gray Header
    createStyle('Medium 5', 'Medium', '#eab308', '#ffffff', '#fefce8', '#ffffff'), // Yellow Header
    createStyle('Medium 6', 'Medium', '#22c55e', '#ffffff', '#f0fdf4', '#ffffff'), // Green Header
    createStyle('Medium 7', 'Medium', '#06b6d4', '#ffffff', '#ecfeff', '#ffffff'), // Cyan Header
    
    createStyle('Medium 8', 'Medium', '#1e293b', '#ffffff', '#cbd5e1', '#f1f5f9'), // Dark Slate
    createStyle('Medium 9', 'Medium', '#1d4ed8', '#ffffff', '#bfdbfe', '#eff6ff'), // Dark Blue
    createStyle('Medium 10', 'Medium', '#c2410c', '#ffffff', '#fed7aa', '#fff7ed'), // Dark Orange
    createStyle('Medium 11', 'Medium', '#374151', '#ffffff', '#d1d5db', '#f3f4f6'), // Dark Gray
    createStyle('Medium 12', 'Medium', '#a16207', '#ffffff', '#fef08a', '#fefce8'), // Dark Yellow
    createStyle('Medium 13', 'Medium', '#15803d', '#ffffff', '#bbf7d0', '#f0fdf4'), // Dark Green
    createStyle('Medium 14', 'Medium', '#0e7490', '#ffffff', '#a5f3fc', '#ecfeff'), // Dark Cyan

    createStyle('Medium 15', 'Medium', '#334155', '#ffffff', '#e2e8f0', '#ffffff'), // Solid Banding Slate
    createStyle('Medium 16', 'Medium', '#2563eb', '#ffffff', '#dbeafe', '#ffffff'), // Solid Banding Blue
    createStyle('Medium 17', 'Medium', '#ea580c', '#ffffff', '#ffedd5', '#ffffff'), // Solid Banding Orange
    createStyle('Medium 18', 'Medium', '#4b5563', '#ffffff', '#e5e7eb', '#ffffff'), // Solid Banding Gray
    createStyle('Medium 19', 'Medium', '#ca8a04', '#ffffff', '#fef9c3', '#ffffff'), // Solid Banding Yellow
    createStyle('Medium 20', 'Medium', '#16a34a', '#ffffff', '#dcfce7', '#ffffff'), // Solid Banding Green
    createStyle('Medium 21', 'Medium', '#0891b2', '#ffffff', '#cffafe', '#ffffff'), // Solid Banding Cyan

    createStyle('Medium 22', 'Medium', '#0f172a', '#ffffff', '#94a3b8', '#cbd5e1'), // Intense Slate
    createStyle('Medium 23', 'Medium', '#1e3a8a', '#ffffff', '#60a5fa', '#93c5fd'), // Intense Blue
    createStyle('Medium 24', 'Medium', '#9a3412', '#ffffff', '#fb923c', '#fdba74'), // Intense Orange
    createStyle('Medium 25', 'Medium', '#111827', '#ffffff', '#6b7280', '#9ca3af'), // Intense Gray
    createStyle('Medium 26', 'Medium', '#854d0e', '#ffffff', '#facc15', '#fde047'), // Intense Yellow
    createStyle('Medium 27', 'Medium', '#14532d', '#ffffff', '#4ade80', '#86efac'), // Intense Green
    createStyle('Medium 28', 'Medium', '#164e63', '#ffffff', '#22d3ee', '#67e8f9'), // Intense Cyan

    // --- DARK ---
    createStyle('Dark 1', 'Dark', '#000000', '#ffffff', '#333333', '#171717'), // Black
    createStyle('Dark 2', 'Dark', '#172554', '#ffffff', '#1e40af', '#1e3a8a'), // Navy
    createStyle('Dark 3', 'Dark', '#450a0a', '#ffffff', '#991b1b', '#7f1d1d'), // Dark Red
    createStyle('Dark 4', 'Dark', '#111827', '#ffffff', '#374151', '#1f2937'), // Dark Gray
    createStyle('Dark 5', 'Dark', '#422006', '#ffffff', '#a16207', '#713f12'), // Dark Yellow
    createStyle('Dark 6', 'Dark', '#052e16', '#ffffff', '#166534', '#14532d'), // Dark Green
    createStyle('Dark 7', 'Dark', '#083344', '#ffffff', '#155e75', '#0e7490'), // Dark Cyan
    createStyle('Dark 8', 'Dark', '#020617', '#ffffff', '#1e293b', '#0f172a'), // Dark Slate
    createStyle('Dark 9', 'Dark', '#1e1b4b', '#ffffff', '#4338ca', '#3730a3'), // Dark Indigo
    createStyle('Dark 10', 'Dark', '#2e1065', '#ffffff', '#6d28d9', '#5b21b6'), // Dark Violet
    createStyle('Dark 11', 'Dark', '#4a044e', '#ffffff', '#a21caf', '#86198f'), // Dark Fuchsia
];

const StylePreviewItem: React.FC<{ style: TableStylePreset, onClick: () => void }> = ({ style, onClick }) => {
    // Determine borders for CSS
    const borderColor = style.border || 'transparent'; 
    const hasBorder = !!style.border;

    return (
        <button 
            onClick={onClick}
            className="group box-border p-[3px] border border-transparent hover:border-[#f29423] hover:bg-[#ffeec2] rounded-[2px] transition-all w-[38px] h-[30px]"
            title={style.name}
        >
            <div 
                className="w-full h-full flex flex-col overflow-hidden"
                style={{ 
                    border: hasBorder ? `1px solid ${borderColor}` : (style.name === 'None' ? '1px solid #cbd5e1' : 'none') 
                }}
            >
                {/* Header Row */}
                <div 
                    className="h-[25%] w-full flex items-center gap-[1px] px-[1px]"
                    style={{ backgroundColor: style.headerBg }}
                >
                    {/* Tiny visual representation of text in header */}
                    <div className="flex-1 h-[2px] rounded-full opacity-60" style={{ backgroundColor: style.headerColor }} />
                    <div className="flex-1 h-[2px] rounded-full opacity-60" style={{ backgroundColor: style.headerColor }} />
                </div>
                
                {/* Body Rows (3 rows to show banding pattern: Odd, Even, Odd) */}
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
            <div className="flex flex-col mb-1">
                <div className="px-2.5 py-1 text-[11px] font-bold text-[#444444] select-none">{cat}</div>
                <div className="grid grid-cols-7 gap-x-1 gap-y-1 px-2">
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
            contentWidth="w-[325px]"
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
            <div className="flex flex-col py-1 bg-white max-h-[500px] overflow-y-auto scrollbar-thin shadow-xl border border-[#b1b1b1]">
                {renderCategory('Light')}
                {renderCategory('Medium')}
                {renderCategory('Dark')}
                
                <div className="border-t border-slate-200 mt-2 pt-1 pb-1">
                    <button className="w-full text-left px-9 py-1.5 text-[11px] text-slate-800 hover:bg-[#ffeec2] hover:border-[#f29423] border border-transparent transition-colors flex items-center gap-2 group relative">
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                            <Plus size={14} className="text-emerald-600" />
                        </div>
                        New Table Style...
                    </button>
                    <button className="w-full text-left px-9 py-1.5 text-[11px] text-slate-800 hover:bg-[#ffeec2] hover:border-[#f29423] border border-transparent transition-colors flex items-center gap-2 group relative">
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                            <LayoutTemplate size={14} className="text-blue-600" />
                        </div>
                        New PivotTable Style...
                    </button>
                </div>
            </div>
        </SmartDropdown>
    );
};

export default FormatAsTable;
