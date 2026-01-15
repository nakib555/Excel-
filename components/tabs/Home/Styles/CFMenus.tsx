
import React from 'react';
import { 
    ChevronRight, ChevronLeft, ArrowLeftRight, Equal, 
    Type, Calendar, Copy, ArrowUp, ArrowDown, Percent,
    TrendingUp, TrendingDown
} from 'lucide-react';
import { cn } from '../../../../utils';
import { Tooltip } from '../../shared';

// --- HELPER COMPONENTS ---

const SubMenuItem = ({ label, icon, shortcut, onClick }: { label: string, icon?: React.ReactNode, shortcut?: string, onClick?: () => void }) => (
    <Tooltip content={label} side="right" sideOffset={5} delayDuration={500}>
        <button 
            onClick={onClick}
            className="flex items-center gap-3 px-4 py-2 text-[13px] text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-transparent transition-all text-left w-full whitespace-nowrap group"
        >
            {icon && <div className="w-5 flex justify-center items-center opacity-80 group-hover:opacity-100">{icon}</div>}
            <span className="flex-1 font-medium">{label}</span>
            {shortcut && <span className="text-[10px] text-slate-400">{shortcut}</span>}
        </button>
    </Tooltip>
);

const MenuHeader = ({ label }: { label: string }) => (
    <div className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 mb-1 mt-1 first:mt-0">
        {label}
    </div>
);

// --- 1. HIGHLIGHT CELLS RULES ---

export const HighlightCellsMenu = () => {
    return (
        <div className="flex flex-col py-1">
            <MenuHeader label="Highlight Rules" />
            <SubMenuItem label="Greater Than..." icon={<ChevronRight size={14} className="text-rose-500 stroke-[3]" />} />
            <SubMenuItem label="Less Than..." icon={<ChevronLeft size={14} className="text-rose-500 stroke-[3]" />} />
            <SubMenuItem label="Between..." icon={<ArrowLeftRight size={14} className="text-rose-500 stroke-[2.5]" />} />
            <SubMenuItem label="Equal To..." icon={<Equal size={14} className="text-rose-500 stroke-[3]" />} />
            <SubMenuItem label="Text that Contains..." icon={<Type size={14} className="text-rose-500 stroke-[2.5]" />} />
            <SubMenuItem label="A Date Occurring..." icon={<Calendar size={14} className="text-rose-500 stroke-[2.5]" />} />
            <SubMenuItem label="Duplicate Values..." icon={<Copy size={14} className="text-rose-500 stroke-[2.5]" />} />
            <div className="h-[1px] bg-slate-100 my-1 mx-4" />
            <SubMenuItem label="More Rules..." />
        </div>
    );
};

// --- 2. TOP/BOTTOM RULES ---

export const TopBottomRulesMenu = () => {
    return (
        <div className="flex flex-col py-1">
            <MenuHeader label="Top / Bottom" />
            <SubMenuItem label="Top 10 Items..." icon={<ArrowUp size={14} className="text-blue-500 stroke-[3]" />} />
            <SubMenuItem label="Top 10%..." icon={<Percent size={14} className="text-blue-500 stroke-[3]" />} />
            <SubMenuItem label="Bottom 10 Items..." icon={<ArrowDown size={14} className="text-red-500 stroke-[3]" />} />
            <SubMenuItem label="Bottom 10%..." icon={<Percent size={14} className="text-red-500 stroke-[3]" />} />
            <div className="h-[1px] bg-slate-100 my-1 mx-4" />
            <MenuHeader label="Average" />
            <SubMenuItem label="Above Average..." icon={<TrendingUp size={14} className="text-emerald-500 stroke-[2.5]" />} />
            <SubMenuItem label="Below Average..." icon={<TrendingDown size={14} className="text-orange-500 stroke-[2.5]" />} />
            <div className="h-[1px] bg-slate-100 my-1 mx-4" />
            <SubMenuItem label="More Rules..." />
        </div>
    );
};

// --- 3. DATA BARS ---

const BarPreview: React.FC<{ color: string, gradient?: boolean }> = ({ color, gradient = false }) => (
    <Tooltip content={gradient ? `Gradient Fill - ${color}` : `Solid Fill - ${color}`} delayDuration={300}>
        <button className="p-1 hover:bg-slate-100 hover:scale-110 transition-all rounded-md border border-transparent hover:border-slate-200 group">
            <div className="w-10 h-10 bg-white border border-slate-200 p-1 flex flex-col justify-center gap-[3px] shadow-sm rounded-sm">
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
    </Tooltip>
);

const BAR_COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#06b6d4', '#d946ef'];

export const DataBarsMenu = () => {
    return (
        <div className="flex flex-col py-1 w-max">
            <MenuHeader label="Gradient Fill" />
            <div className="grid grid-cols-6 gap-2 px-4 pb-3">
                {BAR_COLORS.map(c => <BarPreview key={`grad-${c}`} color={c} gradient />)}
            </div>
            
            <MenuHeader label="Solid Fill" />
            <div className="grid grid-cols-6 gap-2 px-4 pb-3">
                {BAR_COLORS.map(c => <BarPreview key={`solid-${c}`} color={c} />)}
            </div>
            
            <div className="h-[1px] bg-slate-100 my-1 mx-4" />
            <SubMenuItem label="More Rules..." />
        </div>
    );
};

// --- 4. COLOR SCALES ---

const ScalePreview: React.FC<{ colors: string[] }> = ({ colors }) => (
    <Tooltip content="Color Scale" delayDuration={300}>
        <button className="p-1 hover:bg-slate-100 hover:scale-110 transition-all rounded-md border border-transparent hover:border-slate-200 group">
            <div className="w-10 h-10 bg-white border border-slate-200 p-[2px] grid grid-cols-2 gap-[1px] shadow-sm rounded-sm overflow-hidden">
                {colors.map((c, i) => (
                    <div key={i} className="w-full h-full" style={{ backgroundColor: c }} />
                ))}
            </div>
        </button>
    </Tooltip>
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
        <div className="flex flex-col py-1 w-max">
            <MenuHeader label="Color Scales" />
            <div className="grid grid-cols-4 gap-2 px-4 pb-3">
                {SCALES.map((s, i) => <ScalePreview key={i} colors={s} />)}
            </div>
            <div className="h-[1px] bg-slate-100 my-1 mx-4" />
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
        <svg width="12" height="12" viewBox="0 0 24 24" fill={gray ? "#9ca3af" : "currentColor"} className={gray ? "" : color} style={{ transform: `rotate(${r}deg)` }}>
            <path d="M12 3L12 21M12 3L4 11M12 3L20 11" stroke={gray ? "#9ca3af" : "currentColor"} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
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
    <button className="flex items-center justify-around w-full py-2 hover:bg-slate-50 hover:border-slate-200 border border-transparent rounded-md transition-all group">
        {children}
    </button>
);

const SetGroup = ({ label, children }: { label: string, children?: React.ReactNode }) => (
    <div className="flex flex-col pb-2">
        <MenuHeader label={label} />
        <div className="px-2 flex flex-col gap-0.5">
            {children}
        </div>
    </div>
);

export const IconSetsMenu = () => {
    return (
        <div className="flex flex-col py-1 w-max max-h-[600px] overflow-y-auto">
            
            <SetGroup label="Directional">
                <div className="flex gap-4">
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
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-0.5">
                        <SetRow>
                            <Circle color="text-green-500" /><Circle color="text-yellow-400" /><Circle color="text-red-500" />
                        </SetRow>
                        <SetRow>
                            <Circle color="text-green-500" border /><Circle color="text-yellow-400" border /><Circle color="text-red-500" border />
                        </SetRow>
                        <SetRow>
                            <Circle color="text-green-500" /><Triangle dir="up" color="text-yellow-500" /><Diamond color="text-red-500" />
                        </SetRow>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <SetRow>
                            <Circle color="text-green-500" border /><Circle color="text-yellow-400" border /><Circle color="text-red-500" border /><Circle color="text-slate-800" />
                        </SetRow>
                        <SetRow>
                            <Circle color="text-red-500" /><Circle color="text-rose-300" /><Circle color="text-slate-300" /><Circle color="text-slate-500" />
                        </SetRow>
                    </div>
                </div>
            </SetGroup>

            <SetGroup label="Indicators">
                <div className="flex gap-4">
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
                <div className="flex gap-4">
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

            <div className="h-[1px] bg-slate-100 my-1 mx-4" />
            <SubMenuItem label="More Rules..." />
        </div>
    );
};