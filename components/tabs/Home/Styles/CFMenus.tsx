
import React from 'react';
import { cn } from '../../../../utils';

// --- HELPER COMPONENTS ---

const SubMenuItem = ({ label, icon, shortcut, onClick }: { label: string, icon?: React.ReactNode, shortcut?: string, onClick?: () => void }) => (
    <button 
        onClick={onClick}
        className="flex items-center gap-3 px-3 py-1.5 text-[12px] text-slate-700 hover:bg-[#e6f2ff] hover:border-[#cce8ff] border border-transparent transition-all text-left w-full whitespace-nowrap min-w-[180px] group"
    >
        {icon && <div className="w-5 flex justify-center items-center opacity-80 group-hover:opacity-100">{icon}</div>}
        <span className="flex-1">{label}</span>
        {shortcut && <span className="text-[10px] text-slate-400">{shortcut}</span>}
    </button>
);

const MenuHeader = ({ label }: { label: string }) => (
    <div className="px-3 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100 mb-1">
        {label}
    </div>
);

// --- 1. HIGHLIGHT CELLS RULES ---

export const HighlightCellsMenu = () => {
    return (
        <div className="flex flex-col py-1">
            <SubMenuItem label="Greater Than..." icon={<span className="font-serif font-bold text-slate-500 text-[13px]">&gt;</span>} />
            <SubMenuItem label="Less Than..." icon={<span className="font-serif font-bold text-slate-500 text-[13px]">&lt;</span>} />
            <SubMenuItem label="Between..." icon={<span className="font-serif font-bold text-slate-500 text-[10px] border border-slate-400 px-0.5 rounded-sm">...</span>} />
            <SubMenuItem label="Equal To..." icon={<span className="font-serif font-bold text-slate-500 text-[13px]">=</span>} />
            <SubMenuItem label="Text that Contains..." icon={<span className="font-serif text-slate-500 text-[10px] border border-slate-300 px-0.5 bg-white">ab</span>} />
            <SubMenuItem label="A Date Occurring..." icon={<div className="w-3.5 h-3.5 border border-slate-400 rounded-[1px] relative"><div className="absolute top-0 w-full h-1 bg-red-400"></div></div>} />
            <SubMenuItem label="Duplicate Values..." icon={<div className="flex text-[8px] border border-slate-300 rounded-[1px] divide-x divide-slate-300"><span className="px-0.5 bg-red-100">1</span><span className="px-0.5 bg-red-100">1</span></div>} />
            <div className="h-[1px] bg-slate-200 my-1 mx-3" />
            <SubMenuItem label="More Rules..." />
        </div>
    );
};

// --- 2. TOP/BOTTOM RULES ---

export const TopBottomRulesMenu = () => {
    return (
        <div className="flex flex-col py-1">
            <SubMenuItem label="Top 10 Items..." icon={<div className="w-4 h-4 border border-slate-300 flex items-center justify-center bg-white"><div className="w-2 h-2 bg-blue-200 border-t-2 border-blue-500"></div></div>} />
            <SubMenuItem label="Top 10%..." icon={<div className="w-4 h-4 border border-slate-300 flex items-center justify-center bg-white text-[9px] font-bold text-blue-500">%</div>} />
            <SubMenuItem label="Bottom 10 Items..." icon={<div className="w-4 h-4 border border-slate-300 flex items-center justify-center bg-white"><div className="w-2 h-2 bg-blue-200 border-b-2 border-blue-500"></div></div>} />
            <SubMenuItem label="Bottom 10%..." icon={<div className="w-4 h-4 border border-slate-300 flex items-center justify-center bg-white text-[9px] font-bold text-blue-500">%</div>} />
            <SubMenuItem label="Above Average..." icon={<div className="w-4 h-4 border-b-2 border-slate-300 flex items-end justify-center gap-[1px] pb-[1px]"><div className="w-1 h-2 bg-slate-300"></div><div className="w-1 h-3 bg-green-500"></div><div className="w-1 h-1.5 bg-slate-300"></div></div>} />
            <SubMenuItem label="Below Average..." icon={<div className="w-4 h-4 border-b-2 border-slate-300 flex items-end justify-center gap-[1px] pb-[1px]"><div className="w-1 h-3 bg-slate-300"></div><div className="w-1 h-1 bg-red-500"></div><div className="w-1 h-2 bg-slate-300"></div></div>} />
            <div className="h-[1px] bg-slate-200 my-1 mx-3" />
            <SubMenuItem label="More Rules..." />
        </div>
    );
};

// --- 3. DATA BARS ---

const BarPreview: React.FC<{ color: string, gradient?: boolean }> = ({ color, gradient = false }) => (
    <button className="p-1 hover:bg-slate-200 hover:scale-110 transition-all rounded-sm border border-transparent hover:border-slate-300 group" title={color}>
        <div className="w-8 h-8 bg-white border border-slate-200 p-1 flex flex-col justify-center gap-[2px] shadow-sm">
            {[0.8, 0.6, 0.4, 0.9].map((w, i) => (
                <div 
                    key={i} 
                    className="h-1 rounded-[1px]" 
                    style={{ 
                        width: `${w * 100}%`,
                        background: gradient 
                            ? `linear-gradient(to right, ${color}, white)` 
                            : color
                    }} 
                />
            ))}
        </div>
    </button>
);

const BAR_COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#06b6d4', '#d946ef'];

export const DataBarsMenu = () => {
    return (
        <div className="flex flex-col py-1 w-[260px]">
            <MenuHeader label="Gradient Fill" />
            <div className="grid grid-cols-6 gap-1 px-3 pb-2">
                {BAR_COLORS.map(c => <BarPreview key={`grad-${c}`} color={c} gradient />)}
            </div>
            
            <MenuHeader label="Solid Fill" />
            <div className="grid grid-cols-6 gap-1 px-3 pb-2">
                {BAR_COLORS.map(c => <BarPreview key={`solid-${c}`} color={c} />)}
            </div>
            
            <div className="h-[1px] bg-slate-200 my-1 mx-3" />
            <SubMenuItem label="More Rules..." />
        </div>
    );
};

// --- 4. COLOR SCALES ---

const ScalePreview: React.FC<{ colors: string[] }> = ({ colors }) => (
    <button className="p-1 hover:bg-slate-200 hover:scale-110 transition-all rounded-sm border border-transparent hover:border-slate-300 group">
        <div className="w-8 h-8 bg-white border border-slate-200 p-[2px] grid grid-cols-2 gap-[1px] shadow-sm">
            {colors.map((c, i) => (
                <div key={i} className="w-full h-full" style={{ backgroundColor: c }} />
            ))}
        </div>
    </button>
);

const SCALES = [
    ['#86efac', '#fef08a', '#fca5a5', '#ffffff'], // Green-Yellow-Red
    ['#fca5a5', '#fef08a', '#86efac', '#ffffff'], // Red-Yellow-Green
    ['#86efac', '#ffffff', '#fca5a5', '#ffffff'], // Green-White-Red
    ['#fca5a5', '#ffffff', '#86efac', '#ffffff'], // Red-White-Green
    ['#93c5fd', '#ffffff', '#fca5a5', '#ffffff'], // Blue-White-Red
    ['#fca5a5', '#ffffff', '#93c5fd', '#ffffff'], // Red-White-Blue
    ['#ffffff', '#fca5a5', '#ffffff', '#ffffff'], // White-Red
    ['#fca5a5', '#ffffff', '#ffffff', '#ffffff'], // Red-White
    ['#86efac', '#ffffff', '#ffffff', '#ffffff'], // Green-White
    ['#ffffff', '#86efac', '#ffffff', '#ffffff'], // White-Green
    ['#86efac', '#fef08a', '#ffffff', '#ffffff'], // Green-Yellow
    ['#fef08a', '#86efac', '#ffffff', '#ffffff'], // Yellow-Green
];

export const ColorScalesMenu = () => {
    return (
        <div className="flex flex-col py-1 w-[200px]">
            <MenuHeader label="Color Scales" />
            <div className="grid grid-cols-4 gap-1 px-3 pb-2">
                {SCALES.map((s, i) => <ScalePreview key={i} colors={s} />)}
            </div>
            <div className="h-[1px] bg-slate-200 my-1 mx-3" />
            <SubMenuItem label="More Rules..." />
        </div>
    );
};

// --- 5. ICON SETS ---

const IconSetPreview: React.FC<{ icons: React.ReactNode[] }> = ({ icons }) => (
    <button className="flex items-center gap-2 px-2 py-1 hover:bg-slate-200 hover:border-slate-300 border border-transparent rounded-sm transition-all w-full group">
        <div className="flex items-center justify-around w-full">
            {icons.map((icon, i) => (
                <div key={i} className="transform scale-75">{icon}</div>
            ))}
        </div>
    </button>
);

// Basic Shapes for icons
const ArrowUp = ({ color = "text-green-600" }) => <span className={`font-bold ${color}`}>↑</span>;
const ArrowDown = ({ color = "text-red-600" }) => <span className={`font-bold ${color}`}>↓</span>;
const ArrowRight = ({ color = "text-yellow-500" }) => <span className={`font-bold ${color}`}>→</span>;
const ArrowUpRight = ({ color = "text-yellow-500" }) => <span className={`font-bold ${color}`}>↗</span>;
const ArrowDownRight = ({ color = "text-yellow-500" }) => <span className={`font-bold ${color}`}>↘</span>;

const Circle = ({ color = "bg-green-500" }) => <div className={`w-3 h-3 rounded-full ${color} border border-black/10`}></div>;
const Flag = ({ color = "text-green-600" }) => <span className={`${color} text-xs`}>⚑</span>;
const Check = () => <span className="text-green-600 font-bold">✓</span>;
const Exclamation = () => <span className="text-yellow-600 font-bold">!</span>;
const Cross = () => <span className="text-red-600 font-bold">✕</span>;

export const IconSetsMenu = () => {
    return (
        <div className="flex flex-col py-1 w-[240px]">
            <MenuHeader label="Directional" />
            <div className="flex flex-col gap-1 px-3 pb-2">
                <IconSetPreview icons={[<ArrowUp />, <ArrowRight />, <ArrowDown />]} />
                <IconSetPreview icons={[<ArrowUp />, <ArrowUpRight />, <ArrowDownRight />, <ArrowDown />]} />
                <IconSetPreview icons={[<ArrowUp color="text-slate-500" />, <ArrowRight color="text-slate-500" />, <ArrowDown color="text-slate-500" />]} />
            </div>

            <MenuHeader label="Shapes" />
            <div className="flex flex-col gap-1 px-3 pb-2">
                <IconSetPreview icons={[<Circle />, <Circle color="bg-yellow-400" />, <Circle color="bg-red-500" />]} />
                <IconSetPreview icons={[<Circle />, <Circle color="bg-yellow-400" />, <Circle color="bg-red-500" />, <Circle color="bg-black" />]} />
            </div>

            <MenuHeader label="Indicators" />
            <div className="flex flex-col gap-1 px-3 pb-2">
                <IconSetPreview icons={[<Check />, <Exclamation />, <Cross />]} />
                <IconSetPreview icons={[<Flag />, <Flag color="text-yellow-500" />, <Flag color="text-red-600" />]} />
            </div>

            <div className="h-[1px] bg-slate-200 my-1 mx-3" />
            <SubMenuItem label="More Rules..." />
        </div>
    );
};
