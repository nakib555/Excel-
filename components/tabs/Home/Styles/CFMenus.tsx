
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

// --- 5. ICON SETS (Custom) ---

// SVG Icons
const Arrow = ({ dir, color, gray }: { dir: 'up'|'down'|'right'|'up-right'|'down-right', color: string, gray?: boolean }) => {
    let r = 0;
    if (dir === 'right') r = 90;
    if (dir === 'down') r = 180;
    if (dir === 'up-right') r = 45;
    if (dir === 'down-right') r = 135;
    
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill={gray ? "#6b7280" : "currentColor"} className={gray ? "" : color} style={{ transform: `rotate(${r}deg)` }}>
            <path d="M12 3L12 21M12 3L4 11M12 3L20 11" stroke={gray ? "#6b7280" : "currentColor"} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

const Triangle = ({ dir, color }: { dir: 'up'|'down', color: string }) => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className={color} style={{ transform: dir === 'down' ? 'rotate(180deg)' : 'none' }}>
        <path d="M12 2L2 22H22L12 2Z" />
    </svg>
);

const Rect = ({ color }: { color: string }) => (
    <div className={`w-2.5 h-1.5 ${color.replace('text-', 'bg-')}`} />
);

const Circle = ({ color, border }: { color: string, border?: boolean }) => (
    <div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", color.replace('text-', 'bg-'), border && "border border-slate-500 box-border")} />
);

const Diamond = ({ color }: { color: string }) => (
    <div className={cn("w-2 h-2 rotate-45 flex-shrink-0", color.replace('text-', 'bg-'))} />
);

const TrafficLight = ({ color, rim }: { color: string, rim?: boolean }) => (
    <div className={cn("w-3 h-3 rounded-full flex items-center justify-center bg-slate-800", rim ? "p-[1px]" : "bg-transparent")}>
        <div className={cn("w-full h-full rounded-full", color.replace('text-', 'bg-'), rim && "border border-black/30")} />
    </div>
);

const SignSymbol = ({ type, color, circle }: { type: 'check'|'exclamation'|'cross', color: string, circle?: boolean }) => {
    const Icon = type === 'check' ? CheckPath : type === 'cross' ? CrossPath : ExclamationPath;
    return (
        <div className={cn("flex items-center justify-center w-3 h-3 flex-shrink-0", circle ? "rounded-full border border-slate-300 bg-white" : "")}>
            <Icon className={color} />
        </div>
    )
};

const FlagIcon = ({ color }: { color: string }) => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className={color}>
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" y1="22" x2="4" y2="15" stroke="currentColor" strokeWidth="2" />
    </svg>
);

const CheckPath = ({ className }: { className?: string }) => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12" /></svg>;
const CrossPath = ({ className }: { className?: string }) => <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
const ExclamationPath = ({ className }: { className?: string }) => <svg width="4" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="2" x2="12" y2="14" /><line x1="12" y1="22" x2="12.01" y2="22" /></svg>;

const StarIcon = ({ fill }: { fill: 'full'|'half'|'empty' }) => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill={fill === 'empty' ? 'white' : '#fbbf24'} stroke={fill === 'empty' ? '#9ca3af' : '#d97706'} strokeWidth="2">
        {fill === 'half' && <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="url(#halfGrad)" />}
        <defs>
            <linearGradient id="halfGrad">
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="50%" stopColor="white" />
            </linearGradient>
        </defs>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

const PieIcon = ({ level }: { level: 0|1|2|3|4 }) => (
    <div className="w-2.5 h-2.5 rounded-full border border-slate-400 bg-white relative overflow-hidden">
        {level > 0 && <div className={cn("absolute bg-slate-800", level === 4 ? "inset-0" : level === 2 ? "inset-0 w-1/2" : level === 1 ? "bottom-0 right-0 w-1/2 h-1/2" : "inset-0")} style={{ clipPath: level === 3 ? 'polygon(0 0, 100% 0, 100% 100%, 50% 50%, 0 100%)' : undefined }} />}
        {level === 1 && <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-slate-800" style={{ transformOrigin: 'top right', transform: 'scale(0)' }} />} 
        {/* Simple approximation for quarters */}
        {level === 1 && <div className="absolute inset-0 bg-slate-800" style={{ clipPath: 'polygon(50% 50%, 100% 50%, 100% 100%)' }} />}
        {level === 2 && <div className="absolute inset-0 bg-slate-800" style={{ clipPath: 'polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%)' }} />}
        {level === 3 && <div className="absolute inset-0 bg-slate-800" style={{ clipPath: 'polygon(50% 50%, 100% 50%, 100% 100%, 0 100%, 0 50%)' }} />}
    </div>
);

const BoxIcon = ({ level }: { level: 0|1|2|3|4 }) => (
    <div className="w-2.5 h-2.5 border border-slate-300 grid grid-cols-2 grid-rows-2 gap-[1px] bg-white">
        <div className={level >= 1 ? "bg-slate-800" : "bg-transparent"} />
        <div className={level >= 2 ? "bg-slate-800" : "bg-transparent"} />
        <div className={level >= 3 ? "bg-slate-800" : "bg-transparent"} />
        <div className={level >= 4 ? "bg-slate-800" : "bg-transparent"} />
    </div>
);

const BarIcon = ({ level, max }: { level: number, max: number }) => (
    <div className="flex items-end gap-[1px] h-2.5">
        {[...Array(max)].map((_, i) => (
            <div key={i} className={cn("w-[2px] bg-slate-300", i < level ? "bg-slate-800" : "")} style={{ height: `${((i + 1) / max) * 100}%` }} />
        ))}
    </div>
);

// Section Wrapper
const SetRow = ({ children }: { children?: React.ReactNode }) => (
    <button className="flex items-center justify-around w-full py-1.5 hover:bg-slate-100 hover:border-slate-300 border border-transparent rounded-[2px] transition-all group">
        {children}
    </button>
);

const SetGroup = ({ label, children }: { label: string, children?: React.ReactNode }) => (
    <div className="flex flex-col pb-2">
        <div className="px-3 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/80 border-b border-slate-100 mb-1">
            {label}
        </div>
        <div className="px-1 flex flex-col">
            {children}
        </div>
    </div>
);

export const IconSetsMenu = () => {
    return (
        <div className="flex flex-col py-1 w-full max-h-[600px] overflow-y-auto">
            
            <SetGroup label="Directional">
                <div className="flex gap-2">
                    <div className="flex-1 flex flex-col gap-0.5">
                        <SetRow>
                            <Arrow dir="up" color="text-green-600" /><Arrow dir="right" color="text-yellow-500" /><Arrow dir="down" color="text-red-600" />
                        </SetRow>
                        <SetRow>
                            <Triangle dir="up" color="text-green-600" /><Rect color="text-yellow-500" /><Triangle dir="down" color="text-red-600" />
                        </SetRow>
                        <SetRow>
                            <Arrow dir="up" color="text-green-600" /><Arrow dir="up-right" color="text-yellow-500" /><Arrow dir="down-right" color="text-yellow-500" /><Arrow dir="down" color="text-red-600" />
                        </SetRow>
                        <SetRow>
                            <Arrow dir="up" color="text-green-600" /><Arrow dir="up-right" color="text-yellow-500" /><Arrow dir="right" color="text-yellow-500" /><Arrow dir="down-right" color="text-yellow-500" /><Arrow dir="down" color="text-red-600" />
                        </SetRow>
                    </div>
                    <div className="w-[1px] bg-slate-100 my-1" />
                    <div className="flex-1 flex flex-col gap-0.5">
                        <SetRow>
                            <Arrow dir="up" color="" gray /><Arrow dir="right" color="" gray /><Arrow dir="down" color="" gray />
                        </SetRow>
                        <SetRow>
                            <Arrow dir="up" color="" gray /><Arrow dir="up-right" color="" gray /><Arrow dir="down-right" color="" gray /><Arrow dir="down" color="" gray />
                        </SetRow>
                        <SetRow>
                            <Arrow dir="up" color="" gray /><Arrow dir="up-right" color="" gray /><Arrow dir="right" color="" gray /><Arrow dir="down-right" color="" gray /><Arrow dir="down" color="" gray />
                        </SetRow>
                    </div>
                </div>
            </SetGroup>

            <SetGroup label="Shapes">
                <div className="grid grid-cols-2 gap-2">
                    <SetRow>
                        <Circle color="text-green-500" /><Circle color="text-yellow-400" /><Circle color="text-red-500" />
                    </SetRow>
                    <SetRow>
                        <Circle color="text-green-500" border /><Circle color="text-yellow-400" border /><Circle color="text-red-500" border />
                    </SetRow>
                    <SetRow>
                        <Circle color="text-green-500" /><Triangle dir="up" color="text-yellow-500" /><Diamond color="text-red-500" />
                    </SetRow>
                    <SetRow>
                        <Circle color="text-green-500" border /><Circle color="text-yellow-400" border /><Circle color="text-red-500" border /><Circle color="text-slate-800" />
                    </SetRow>
                    <SetRow>
                        <Circle color="text-red-500" /><Circle color="text-rose-300" /><Circle color="text-slate-300" /><Circle color="text-slate-500" />
                    </SetRow>
                </div>
            </SetGroup>

            <SetGroup label="Indicators">
                <div className="flex gap-2">
                    <div className="flex-1 flex flex-col gap-0.5">
                        <SetRow>
                            <SignSymbol type="check" color="text-green-600" circle /><SignSymbol type="exclamation" color="text-yellow-600" circle /><SignSymbol type="cross" color="text-red-600" circle />
                        </SetRow>
                        <SetRow>
                            <FlagIcon color="text-green-600" /><FlagIcon color="text-yellow-500" /><FlagIcon color="text-red-600" />
                        </SetRow>
                    </div>
                    <div className="flex-1 flex flex-col gap-0.5">
                        <SetRow>
                            <SignSymbol type="check" color="text-green-600" /><SignSymbol type="exclamation" color="text-yellow-600" /><SignSymbol type="cross" color="text-red-600" />
                        </SetRow>
                    </div>
                </div>
            </SetGroup>

            <SetGroup label="Ratings">
                <div className="flex gap-2">
                    <div className="flex-1 flex flex-col gap-0.5">
                        <SetRow><StarIcon fill="full" /><StarIcon fill="half" /><StarIcon fill="empty" /></SetRow>
                        <SetRow><PieIcon level={4} /><PieIcon level={3} /><PieIcon level={2} /><PieIcon level={1} /><PieIcon level={0} /></SetRow>
                        <SetRow><BoxIcon level={4} /><BoxIcon level={3} /><BoxIcon level={2} /><BoxIcon level={1} /><BoxIcon level={0} /></SetRow>
                    </div>
                    <div className="flex-1 flex flex-col gap-0.5">
                        <SetRow><BarIcon level={4} max={4} /><BarIcon level={3} max={4} /><BarIcon level={2} max={4} /><BarIcon level={1} max={4} /></SetRow>
                        <SetRow><BarIcon level={5} max={5} /><BarIcon level={4} max={5} /><BarIcon level={3} max={5} /><BarIcon level={2} max={5} /><BarIcon level={1} max={5} /></SetRow>
                    </div>
                </div>
            </SetGroup>

            <div className="h-[1px] bg-slate-200 my-1 mx-3" />
            <SubMenuItem label="More Rules..." />
        </div>
    );
};
