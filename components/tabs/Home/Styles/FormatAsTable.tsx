
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
    border?: string; // Border color for header bottom or general structure
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

// Authentic Excel Colors
const C = {
    // Basic
    Black: '#000000',
    White: '#FFFFFF',
    
    // Theme Primary
    Blue: '#4472C4',
    Orange: '#ED7D31',
    Gray: '#A5A5A5',
    Gold: '#FFC000',
    Cyan: '#5B9BD5',
    Green: '#70AD47',
    
    // Light / Banding Colors
    LightBlue: '#D9E1F2',
    LightOrange: '#FCE4D6',
    LightGray: '#EDEDED',
    LightGold: '#FFF2CC',
    LightCyan: '#DDEBF7',
    LightGreen: '#E2EFDA',
    
    // Medium / Intense Banding
    MedBlue: '#B4C6E7',
    MedOrange: '#F8CBAD',
    MedGray: '#DBDBDB',
    MedGold: '#FFE699',
    MedCyan: '#BDD7EE',
    MedGreen: '#C6E0B4',
    
    // Dark / Header Colors
    DarkGray: '#595959',
    DarkBlue: '#2F75B5',
    DarkOrange: '#C65911',
    DarkGold: '#BF8F00',
    DarkCyan: '#1F4E78',
    DarkGreen: '#548235',
    
    // Borders
    BorderLight: '#e2e8f0',
    BorderDark: '#000000',
};

const TABLE_STYLES: TableStylePreset[] = [
    // --- LIGHT (White headers usually, or very light) ---
    // 1. None / Plain
    createStyle('None', 'Light', '#ffffff', '#000000', '#ffffff', '#ffffff'),
    // 2. Light 1 (Simple white with border hint)
    createStyle('Light 1', 'Light', '#ffffff', '#000000', '#ffffff', '#ffffff', '#bfbfbf'),
    // 3. Banded Whites (Simulated with very faint grays or just colors)
    createStyle('Light 2', 'Light', '#ffffff', '#000000', C.LightBlue, '#ffffff', C.Blue),
    createStyle('Light 3', 'Light', '#ffffff', '#000000', C.LightOrange, '#ffffff', C.Orange),
    createStyle('Light 4', 'Light', '#ffffff', '#000000', C.LightGray, '#ffffff', C.Gray),
    createStyle('Light 5', 'Light', '#ffffff', '#000000', C.LightGold, '#ffffff', C.Gold),
    createStyle('Light 6', 'Light', '#ffffff', '#000000', C.LightCyan, '#ffffff', C.Cyan),
    createStyle('Light 7', 'Light', '#ffffff', '#000000', C.LightGreen, '#ffffff', C.Green),
    
    // 4. Light Style with Header Fill
    createStyle('Light 8', 'Light', C.LightGray, '#000000', '#ffffff', '#ffffff'),
    createStyle('Light 9', 'Light', C.LightBlue, '#000000', '#ffffff', '#ffffff'),
    createStyle('Light 10', 'Light', C.LightOrange, '#000000', '#ffffff', '#ffffff'),
    createStyle('Light 11', 'Light', C.LightGray, '#000000', '#ffffff', '#ffffff'),
    createStyle('Light 12', 'Light', C.LightGold, '#000000', '#ffffff', '#ffffff'),
    createStyle('Light 13', 'Light', C.LightCyan, '#000000', '#ffffff', '#ffffff'),
    createStyle('Light 14', 'Light', C.LightGreen, '#000000', '#ffffff', '#ffffff'),

    // 5. Light Style with Header Fill + Banding
    createStyle('Light 15', 'Light', C.LightGray, '#000000', C.LightGray, '#ffffff'),
    createStyle('Light 16', 'Light', C.LightBlue, '#000000', C.LightBlue, '#ffffff'),
    createStyle('Light 17', 'Light', C.LightOrange, '#000000', C.LightOrange, '#ffffff'),
    createStyle('Light 18', 'Light', C.LightGray, '#000000', C.LightGray, '#ffffff'),
    createStyle('Light 19', 'Light', C.LightGold, '#000000', C.LightGold, '#ffffff'),
    createStyle('Light 20', 'Light', C.LightCyan, '#000000', C.LightCyan, '#ffffff'),
    createStyle('Light 21', 'Light', C.LightGreen, '#000000', C.LightGreen, '#ffffff'),

    // --- MEDIUM (Solid colored headers) ---
    // 1. Medium Style (Header Color + White Body)
    createStyle('Medium 1', 'Medium', C.DarkGray, '#ffffff', '#ffffff', '#ffffff'),
    createStyle('Medium 2', 'Medium', C.Blue, '#ffffff', C.LightBlue, '#ffffff'), // Excel Default-ish
    createStyle('Medium 3', 'Medium', C.Orange, '#ffffff', C.LightOrange, '#ffffff'),
    createStyle('Medium 4', 'Medium', C.Gray, '#ffffff', C.LightGray, '#ffffff'),
    createStyle('Medium 5', 'Medium', C.Gold, '#ffffff', C.LightGold, '#ffffff'),
    createStyle('Medium 6', 'Medium', C.Cyan, '#ffffff', C.LightCyan, '#ffffff'),
    createStyle('Medium 7', 'Medium', C.Green, '#ffffff', C.LightGreen, '#ffffff'),
    
    // 2. Medium Style (Darker Header + Banding)
    createStyle('Medium 8', 'Medium', '#595959', '#ffffff', '#bfbfbf', '#ffffff'),
    createStyle('Medium 9', 'Medium', '#2F75B5', '#ffffff', '#BDD7EE', '#ffffff'),
    createStyle('Medium 10', 'Medium', '#C65911', '#ffffff', '#F8CBAD', '#ffffff'),
    createStyle('Medium 11', 'Medium', '#7B7B7B', '#ffffff', '#DBDBDB', '#ffffff'), 
    createStyle('Medium 12', 'Medium', '#BF8F00', '#ffffff', '#FFE699', '#ffffff'),
    createStyle('Medium 13', 'Medium', '#1F4E78', '#ffffff', '#9BC2E6', '#ffffff'),
    createStyle('Medium 14', 'Medium', '#548235', '#ffffff', '#C6E0B4', '#ffffff'),

    // 3. Medium Style 3 (Intense)
    createStyle('Medium 15', 'Medium', '#000000', '#ffffff', '#7F7F7F', '#D9D9D9'),
    createStyle('Medium 16', 'Medium', '#4472C4', '#ffffff', '#B4C6E7', '#D9E1F2'),
    createStyle('Medium 17', 'Medium', '#ED7D31', '#ffffff', '#F8CBAD', '#FCE4D6'),
    createStyle('Medium 18', 'Medium', '#A5A5A5', '#ffffff', '#DBDBDB', '#EDEDED'),
    createStyle('Medium 19', 'Medium', '#FFC000', '#ffffff', '#FFE699', '#FFF2CC'),
    createStyle('Medium 20', 'Medium', '#5B9BD5', '#ffffff', '#BDD7EE', '#DDEBF7'),
    createStyle('Medium 21', 'Medium', '#70AD47', '#ffffff', '#C6E0B4', '#E2EFDA'),

    // --- DARK ---
    createStyle('Dark 1', 'Dark', '#000000', '#ffffff', '#595959', '#262626'),
    createStyle('Dark 2', 'Dark', '#203764', '#ffffff', '#4472C4', '#2F75B5'),
    createStyle('Dark 3', 'Dark', '#833C0C', '#ffffff', '#ED7D31', '#C65911'),
    createStyle('Dark 4', 'Dark', '#525252', '#ffffff', '#A5A5A5', '#7F7F7F'),
    createStyle('Dark 5', 'Dark', '#806000', '#ffffff', '#FFC000', '#BF8F00'),
    createStyle('Dark 6', 'Dark', '#203764', '#ffffff', '#5B9BD5', '#2F75B5'),
    createStyle('Dark 7', 'Dark', '#375623', '#ffffff', '#70AD47', '#548235'),
    createStyle('Dark 8', 'Dark', '#000000', '#ffffff', '#262626', '#000000'),
    createStyle('Dark 9', 'Dark', '#2F75B5', '#ffffff', '#1F4E78', '#203764'),
    createStyle('Dark 10', 'Dark', '#7030A0', '#ffffff', '#56257E', '#3F1B5C'),
    createStyle('Dark 11', 'Dark', '#C00000', '#ffffff', '#800000', '#630000'),
];

const StylePreviewItem: React.FC<{ style: TableStylePreset, onClick: () => void }> = ({ style, onClick }) => {
    // Determine borders for CSS visual
    const hasBorder = !!style.border;
    const borderColor = style.border || 'transparent';

    return (
        <button 
            onClick={onClick}
            className="group box-border p-[3px] border-[3px] border-transparent hover:border-[#fbbf24] hover:bg-[#fff7ed] rounded-[2px] transition-all w-[56px] h-[40px] flex items-center justify-center relative"
            title={style.name}
        >
            <div 
                className="w-full h-full flex flex-col shadow-[0_0_0_1px_rgba(0,0,0,0.1)] overflow-hidden"
                style={{ 
                    // Simulate the table border look
                    border: hasBorder ? `1px solid ${borderColor}` : undefined 
                }}
            >
                {/* Header Row */}
                <div 
                    className="h-[30%] w-full flex items-center justify-start px-[2px] gap-[1px]"
                    style={{ backgroundColor: style.headerBg }}
                >
                    {/* Tiny visual representation of text in header */}
                    <div className="w-[30%] h-[2px] opacity-70" style={{ backgroundColor: style.headerColor }} />
                    <div className="w-[30%] h-[2px] opacity-70" style={{ backgroundColor: style.headerColor }} />
                </div>
                
                {/* Body Rows (4 rows: Odd, Even, Odd, Even) */}
                <div className="flex-1 flex flex-col">
                    {/* Row 1 (Odd) */}
                    <div className="flex-1 w-full flex items-center justify-start px-[2px] gap-[2px]" style={{ backgroundColor: style.rowOddBg }}>
                        <div className="w-[20%] h-[1px] bg-black/10" />
                        <div className="w-[20%] h-[1px] bg-black/10" />
                    </div>
                    {/* Row 2 (Even) */}
                    <div className="flex-1 w-full flex items-center justify-start px-[2px] gap-[2px]" style={{ backgroundColor: style.rowEvenBg }}>
                        <div className="w-[20%] h-[1px] bg-black/10" />
                        <div className="w-[20%] h-[1px] bg-black/10" />
                    </div>
                    {/* Row 3 (Odd) */}
                    <div className="flex-1 w-full flex items-center justify-start px-[2px] gap-[2px]" style={{ backgroundColor: style.rowOddBg }}>
                        <div className="w-[20%] h-[1px] bg-black/10" />
                        <div className="w-[20%] h-[1px] bg-black/10" />
                    </div>
                    {/* Row 4 (Even) */}
                    <div className="flex-1 w-full flex items-center justify-start px-[2px] gap-[2px]" style={{ backgroundColor: style.rowEvenBg }}>
                        <div className="w-[20%] h-[1px] bg-black/10" />
                        <div className="w-[20%] h-[1px] bg-black/10" />
                    </div>
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
            <div className="flex flex-col mb-3">
                <div className="px-3 py-1 text-[11px] font-bold text-[#555555] bg-white select-none sticky top-0 z-10">{cat}</div>
                <div className="grid grid-cols-7 gap-x-1 gap-y-1.5 px-3">
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
            contentWidth="w-[440px]"
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
            <div className="flex flex-col py-2 bg-white max-h-[500px] overflow-y-auto scrollbar-thin shadow-xl border border-slate-300">
                {renderCategory('Light')}
                {renderCategory('Medium')}
                {renderCategory('Dark')}
                
                <div className="border-t border-slate-200 mt-2 pt-2 pb-1">
                    <button className="w-full text-left px-9 py-1.5 text-[12px] font-medium text-slate-800 hover:bg-[#ffeec2] hover:border-[#f29423] border border-transparent transition-colors flex items-center gap-2 group relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                            <Plus size={16} className="text-emerald-600" />
                        </div>
                        New Table Style...
                    </button>
                    <button className="w-full text-left px-9 py-1.5 text-[12px] font-medium text-slate-800 hover:bg-[#ffeec2] hover:border-[#f29423] border border-transparent transition-colors flex items-center gap-2 group relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                            <LayoutTemplate size={16} className="text-blue-600" />
                        </div>
                        New PivotTable Style...
                    </button>
                </div>
            </div>
        </SmartDropdown>
    );
};

export default FormatAsTable;
