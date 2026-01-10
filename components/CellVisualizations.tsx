
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
    if (data.length === 0) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    // Padding
    const p = 4;
    const drawHeight = height - (p * 2);
    const drawWidth = width - (p * 2);

    if (config.subtype === 'column' || config.subtype === 'winloss') {
        const barWidth = (drawWidth / data.length) - 2;
        // Zero baseline logic
        // If all positive, baseline is bottom. If mixed, baseline is proportional.
        const baseline = max <= 0 ? 0 : min >= 0 ? drawHeight : (max / range) * drawHeight;
        
        return (
            <div className="w-full h-full flex items-end justify-between px-1 pb-1 pt-1 gap-[1px]">
               <svg width="100%" height="100%">
                   {data.map((d, i) => {
                       // Normalize
                       const normalized = config.subtype === 'winloss' 
                            ? (d > 0 ? 1 : d < 0 ? -1 : 0) 
                            : d;
                       
                       // For simple column (all positive assumed for simplicity or relative to min)
                       // Robust Logic:
                       // h = (val / max) * height
                       const h = Math.abs(d) / Math.max(Math.abs(min), Math.abs(max)) * drawHeight;
                       const x = i * (drawWidth / data.length);
                       const y = d >= 0 ? (drawHeight / 2) - h : (drawHeight / 2);
                       
                       // Simplified "Column" for positive data usually:
                       const barH = ((d - min) / range) * drawHeight;
                       
                       return (
                           <rect 
                                key={i}
                                x={x}
                                y={drawHeight - barH}
                                width={drawWidth / data.length - 1}
                                height={Math.max(1, barH)}
                                fill={d < 0 ? '#ef4444' : (config.color || '#3b82f6')}
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
        const y = height - p - ((d - min) / range) * drawHeight;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width="100%" height="100%" className="overflow-visible">
            <polyline 
                points={points} 
                fill="none" 
                stroke={config.color || "#2563eb"} 
                strokeWidth={1.5} 
                strokeLinecap="round" 
                strokeLinejoin="round" 
            />
            {/* End Dot */}
            {data.length > 0 && (
                <circle 
                    cx={(data.length > 1 ? drawWidth : 0) + p} 
                    cy={height - p - ((data[data.length-1] - min) / range) * drawHeight} 
                    r={2} 
                    fill={config.color || "#2563eb"} 
                />
            )}
        </svg>
    );
};

export const DataBar: React.FC<Props> = ({ value, config, width }) => {
    const val = parseFloat(value);
    if (isNaN(val)) return null;

    const max = config.max || 100;
    const min = 0; // Assume 0 baseline for simple data bars
    const percent = Math.min(100, Math.max(0, (val / max) * 100));
    
    return (
        <div className="absolute inset-0 z-0 flex items-center px-1">
            <div 
                className="h-[80%] rounded-[2px] opacity-30 transition-all duration-300"
                style={{ 
                    width: `${percent}%`, 
                    backgroundColor: config.color || '#3b82f6' 
                }} 
            />
        </div>
    );
};

export const RatingStars: React.FC<Props> = ({ value, config }) => {
    const val = Math.min(5, Math.max(0, parseInt(value) || 0));
    return (
        <div className="flex items-center gap-0.5 h-full px-1">
            {[1, 2, 3, 4, 5].map(i => (
                <Star 
                    key={i} 
                    size={10} 
                    className={i <= val ? "fill-yellow-400 text-yellow-500" : "fill-slate-100 text-slate-200"} 
                />
            ))}
        </div>
    );
};
