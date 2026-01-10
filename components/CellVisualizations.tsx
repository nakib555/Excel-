
import React, { useMemo } from 'react';
import { CellVisualization } from '../types';
import { Star } from 'lucide-react';

interface Props {
    value: string;
    config: CellVisualization;
    width: number;
    height: number;
}

// Helper to parse series data "10, 20, 5"
const parseSeries = (val: string): number[] => {
    if (!val) return [];
    return val.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
};

export const Sparkline: React.FC<Props> = ({ value, config, width, height }) => {
    const data = useMemo(() => parseSeries(value), [value]);
    if (data.length < 2) return null; // Need at least 2 points for a line

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    // Padding
    const p = 4;
    const drawHeight = height - (p * 2);
    const drawWidth = width - (p * 2);

    // Column / WinLoss Logic
    if (config.subtype === 'column' || config.subtype === 'winloss') {
        // Zero baseline logic
        // If all positive, baseline is bottom. If mixed, baseline is proportional.
        const zeroY = max <= 0 ? 0 : min >= 0 ? drawHeight : (max / range) * drawHeight;
        
        return (
            <div className="w-full h-full flex items-end justify-between px-1 pb-1 pt-1 gap-[1px]">
               <svg width="100%" height="100%">
                   {/* Zero Line */}
                   <line x1="0" y1={zeroY + p} x2="100%" y2={zeroY + p} stroke="#cbd5e1" strokeWidth="1" />
                   
                   {data.map((d, i) => {
                       const isWinLoss = config.subtype === 'winloss';
                       const normalized = isWinLoss ? (d > 0 ? 1 : d < 0 ? -1 : 0) : d;
                       
                       // Calculate bar height relative to zero line
                       // d positive: goes up from zeroY
                       // d negative: goes down from zeroY
                       
                       let barHeight = 0;
                       let y = 0;

                       if (isWinLoss) {
                           // Fixed height for win/loss
                           barHeight = drawHeight / 2; 
                           y = normalized > 0 ? zeroY - barHeight : zeroY;
                           if (normalized === 0) barHeight = 0;
                       } else {
                           barHeight = (Math.abs(d) / range) * drawHeight;
                           y = d >= 0 ? zeroY - barHeight : zeroY;
                       }

                       const barWidth = (drawWidth / data.length) - 1;
                       const x = i * (drawWidth / data.length) + p;
                       
                       const color = d < 0 ? '#ef4444' : (d === max ? '#10b981' : (config.color || '#3b82f6'));

                       return (
                           <rect 
                                key={i}
                                x={x}
                                y={y + p}
                                width={Math.max(1, barWidth)}
                                height={Math.max(1, barHeight)}
                                fill={color}
                                rx={1}
                           />
                       );
                   })}
               </svg>
            </div>
        );
    }

    // Line Chart (Default)
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * drawWidth + p;
        const y = (height - p) - ((d - min) / range) * drawHeight;
        return `${x},${y}`;
    }).join(' ');

    // Find indices for markers
    const maxIdx = data.indexOf(max);
    const minIdx = data.indexOf(min);
    const lastIdx = data.length - 1;

    const getCoord = (idx: number, val: number) => ({
        cx: (idx / (data.length - 1)) * drawWidth + p,
        cy: (height - p) - ((val - min) / range) * drawHeight
    });

    const maxPoint = getCoord(maxIdx, max);
    const minPoint = getCoord(minIdx, min);
    const lastPoint = getCoord(lastIdx, data[lastIdx]);

    return (
        <svg width="100%" height="100%" className="overflow-visible">
            {/* Smooth curve approximation or Polyline */}
            <polyline 
                points={points} 
                fill="none" 
                stroke={config.color || "#2563eb"} 
                strokeWidth={1.5} 
                strokeLinecap="round" 
                strokeLinejoin="round" 
            />
            
            {/* Markers */}
            {/* Max (Green) */}
            <circle cx={maxPoint.cx} cy={maxPoint.cy} r={2.5} fill="#10b981" stroke="white" strokeWidth={1} />
            {/* Min (Red) */}
            <circle cx={minPoint.cx} cy={minPoint.cy} r={2.5} fill="#ef4444" stroke="white" strokeWidth={1} />
            {/* Last (Blue/Theme) */}
            <circle cx={lastPoint.cx} cy={lastPoint.cy} r={2.5} fill={config.color || "#2563eb"} stroke="white" strokeWidth={1} />
        </svg>
    );
};

export const DataBar: React.FC<Props> = ({ value, config, width }) => {
    const val = parseFloat(value);
    if (isNaN(val)) return null;

    const max = config.max || 100;
    const min = 0;
    const rawPercent = (val / max) * 100;
    const percent = Math.min(100, Math.max(0, rawPercent));
    
    return (
        <div className="absolute inset-0 z-0 flex items-center px-1">
            <div 
                className="h-[70%] rounded-[3px] transition-all duration-300 relative overflow-hidden"
                style={{ 
                    width: `${percent}%`, 
                    backgroundColor: config.color ? `${config.color}33` : '#3b82f633', // transparent version
                    borderRight: `2px solid ${config.color || '#3b82f6'}`
                }} 
            >
                {/* Gradient Overlay */}
                <div 
                    className="absolute inset-0 opacity-20"
                    style={{ background: `linear-gradient(90deg, transparent, ${config.color || '#3b82f6'})` }}
                />
            </div>
        </div>
    );
};

export const RatingStars: React.FC<Props> = ({ value, config }) => {
    const val = Math.min(5, Math.max(0, parseFloat(value) || 0));
    
    return (
        <div className="flex items-center gap-0.5 h-full px-1">
            {[1, 2, 3, 4, 5].map(i => {
                const filled = i <= Math.floor(val);
                const partial = i === Math.ceil(val) && val % 1 !== 0; // if val is 3.5, i=4 is partial
                const percent = partial ? (val % 1) * 100 : 0;

                return (
                    <div key={i} className="relative w-3 h-3">
                        {/* Background Star (Gray) */}
                        <Star 
                            size={12} 
                            className="text-slate-200 fill-slate-200 absolute inset-0" 
                            strokeWidth={0}
                        />
                        
                        {/* Foreground Star (Yellow) - Masked for partial */}
                        <div 
                            className="absolute inset-0 overflow-hidden" 
                            style={{ width: filled ? '100%' : partial ? `${percent}%` : '0%' }}
                        >
                            <Star 
                                size={12} 
                                className="text-yellow-400 fill-yellow-400" 
                                strokeWidth={0}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
