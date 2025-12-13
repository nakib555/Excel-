
import React, { memo } from 'react';
import {
  CheckCircle2,
  Grid3X3,
  FileSpreadsheet,
  Layout,
  Minus,
  Plus,
  Scaling
} from 'lucide-react';

interface StatusBarProps {
  selectionCount: number;
  stats: { sum: number; count: number; average: number; hasNumeric: boolean } | null;
  zoom: number;
  onZoomChange: (value: number) => void;
  onToggleMobileResize?: () => void;
}

const StatusBar: React.FC<StatusBarProps> = ({ selectionCount, stats, zoom, onZoomChange, onToggleMobileResize }) => {
  const displayZoom = Math.round(zoom * 100);

  // Limit min zoom to 25% to avoid DOM explosion on large grids
  const handleZoomIn = () => onZoomChange(Math.min(4, (displayZoom + 10) / 100));
  const handleZoomOut = () => onZoomChange(Math.max(0.25, (displayZoom - 10) / 100));

  return (
    <div className="h-9 bg-[#0f172a] text-white/90 border-t border-slate-700/50 flex items-center justify-between px-2 md:px-4 text-[11px] select-none z-50 shadow-[0_-1px_3px_rgba(0,0,0,0.1)]">
      {/* Left Section - Status */}
      <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
        <div className="font-semibold text-emerald-400 flex items-center gap-2 flex-shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Ready
        </div>
        
        <div className="hidden lg:flex items-center gap-1.5 hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer transition-colors text-slate-300" title="Accessibility Check">
          <CheckCircle2 size={13} className="text-slate-400" />
          <span className="font-medium">Accessibility: Good to go</span>
        </div>
      </div>

      {/* Center/Right Section - Stats & Tools */}
      <div className="flex items-center gap-4 flex-1 justify-end">
        
        {/* Contextual Stats (Sum, Avg, Count) */}
        {stats && (
           <div className="flex items-center gap-3 md:gap-4 animate-in fade-in duration-300 mr-2 md:mr-4">
              <div className="flex md:hidden items-center gap-1 text-slate-300">
                  <span className="text-slate-400">Count:</span>
                  <span className="font-mono font-medium">{stats.count}</span>
              </div>

              <div className="hidden md:flex items-center gap-3 text-slate-300">
                  {stats.hasNumeric && (
                      <div className="flex items-center gap-1.5 hover:bg-white/10 px-1 py-0.5 rounded cursor-pointer transition-colors">
                          <span className="text-slate-400">Average:</span>
                          <span className="font-mono font-medium tracking-tight">{stats.average.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      </div>
                  )}
                  <div className="flex items-center gap-1.5 hover:bg-white/10 px-1 py-0.5 rounded cursor-pointer transition-colors">
                      <span className="text-slate-400">Count:</span>
                      <span className="font-mono font-medium tracking-tight">{stats.count}</span>
                  </div>
                  {stats.hasNumeric && (
                      <div className="flex items-center gap-1.5 hover:bg-white/10 px-1 py-0.5 rounded cursor-pointer transition-colors">
                          <span className="text-slate-400">Sum:</span>
                          <span className="font-mono font-medium tracking-tight">{stats.sum.toLocaleString()}</span>
                      </div>
                  )}
              </div>
           </div>
        )}

        {/* Mobile Resize Toggle */}
        <div className="md:hidden flex items-center border-l border-slate-600/50 pl-3">
            <button 
                onClick={onToggleMobileResize}
                className="p-1 text-emerald-400 hover:bg-white/10 rounded transition-colors active:scale-95"
                title="Resize Cells"
            >
                <Scaling size={16} />
            </button>
        </div>

        {/* View Controls - Desktop Only */}
        <div className="hidden lg:flex items-center gap-1 mr-2 pl-4">
            <button className="p-1.5 hover:bg-white/10 rounded transition-colors text-white bg-white/10" title="Normal View">
              <Grid3X3 size={14} />
            </button>
            <button className="p-1.5 hover:bg-white/10 rounded transition-colors text-slate-400 hover:text-white" title="Page Layout">
              <Layout size={14} />
            </button>
            <button className="p-1.5 hover:bg-white/10 rounded transition-colors text-slate-400 hover:text-white" title="Page Break Preview">
              <FileSpreadsheet size={14} />
            </button>
        </div>
        
        {/* Separator */}
        <div className="h-4 w-[1px] bg-slate-600/50 hidden md:block mx-1"></div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2 md:gap-3 pl-1">
             <button
                onClick={handleZoomOut}
                className="p-1 text-slate-400 hover:text-white transition-colors active:scale-95 disabled:opacity-30 cursor-pointer"
                title="Zoom Out"
                disabled={zoom <= 0.25}
            >
                <Minus size={16} strokeWidth={2} />
            </button>

             {/* Slider */}
            <div className="hidden sm:flex items-center w-24 md:w-28 group">
                   <input
                      type="range"
                      min="25"
                      max="400"
                      step="1" 
                      value={displayZoom}
                      onChange={(e) => onZoomChange(Number(e.target.value) / 100)}
                      className="w-full h-1 bg-transparent rounded-lg appearance-none cursor-pointer range-slider focus:outline-none"
                   />
            </div>
            
            <button 
                onClick={() => onZoomChange(1)}
                className="min-w-[3.5rem] text-center font-bold text-white tabular-nums text-xs hover:bg-white/10 rounded py-0.5 transition-colors select-none"
                title="Reset to 100%"
            >
                {displayZoom.toFixed(0)}%
            </button>

            <button
                onClick={handleZoomIn}
                className="p-1 text-slate-400 hover:text-white transition-colors active:scale-95 disabled:opacity-30 cursor-pointer"
                title="Zoom In"
                disabled={zoom >= 4}
            >
                <Plus size={16} strokeWidth={2} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default memo(StatusBar);
