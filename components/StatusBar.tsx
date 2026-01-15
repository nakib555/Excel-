
import React, { memo } from 'react';
import {
  CheckCircle2,
  Grid3X3,
  FileSpreadsheet,
  Layout,
  Minus,
  Plus,
  Scaling,
  Undo2,
  Redo2
} from 'lucide-react';
import { Tooltip } from './shared';

interface StatusBarProps {
  selectionCount: number;
  stats: { sum: number; count: number; average: number; hasNumeric: boolean } | null;
  zoom: number;
  onZoomChange: (value: number) => void;
  onToggleMobileResize?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const StatusBarIconBtn = ({ onClick, disabled, children, title, className }: any) => (
    <Tooltip content={title} side="top">
        <button 
            onClick={onClick}
            disabled={disabled}
            className={className}
        >
            {children}
        </button>
    </Tooltip>
);

const StatusBar: React.FC<StatusBarProps> = ({ 
  selectionCount, 
  stats, 
  zoom, 
  onZoomChange, 
  onToggleMobileResize,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}) => {
  const displayZoom = Math.round(zoom * 100);

  // Limit min zoom to 25% to avoid DOM explosion on large grids
  const handleZoomIn = () => onZoomChange(Math.min(4, (displayZoom + 10) / 100));
  const handleZoomOut = () => onZoomChange(Math.max(0.25, (displayZoom - 10) / 100));

  return (
    <div className="h-10 bg-[#0f172a] text-slate-300 border-t border-slate-800 flex items-center justify-between px-3 md:px-4 text-[11px] select-none z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] relative">
      
      {/* Decorative top highlight for depth */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

      {/* Left Section - History & Status */}
      <div className="flex items-center gap-4 overflow-hidden">
        
        {/* Undo/Redo Controls - Styled Pill */}
        <div className="flex items-center bg-slate-900/50 rounded-full p-0.5 border border-slate-700/50 shadow-sm group">
            <StatusBarIconBtn 
                onClick={onUndo}
                disabled={!canUndo}
                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-full transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400 active:scale-95"
                title="Undo (Ctrl+Z)"
            >
                <Undo2 size={15} strokeWidth={2} className="relative -ml-0.5" />
            </StatusBarIconBtn>
            <div className="w-[1px] h-3 bg-slate-700/30 mx-0.5 group-hover:bg-slate-700/50 transition-colors"></div>
            <StatusBarIconBtn 
                onClick={onRedo}
                disabled={!canRedo}
                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-full transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400 active:scale-95"
                title="Redo (Ctrl+Y)"
            >
                <Redo2 size={15} strokeWidth={2} className="relative -mr-0.5" />
            </StatusBarIconBtn>
        </div>

        <Tooltip content="Accessibility Check">
            <div className="hidden lg:flex items-center gap-2 px-2 py-1 rounded-md hover:bg-white/5 cursor-pointer transition-colors text-slate-400 hover:text-slate-200 group/status">
              <CheckCircle2 size={14} className="text-emerald-500/80 group-hover/status:text-emerald-400 transition-colors" />
              <span className="font-medium tracking-tight">Ready</span>
            </div>
        </Tooltip>
      </div>

      {/* Center/Right Section - Stats & Tools */}
      <div className="flex items-center gap-4 flex-1 justify-end">
        
        {/* Contextual Stats (Sum, Avg, Count) */}
        {stats && (
           <div className="flex items-center gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 mr-2 md:mr-4">
              <div className="flex md:hidden items-center gap-1.5 text-slate-400 bg-slate-800/50 px-2 py-1 rounded-md border border-slate-700/30">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Count</span>
                  <span className="font-mono font-medium text-slate-200">{stats.count}</span>
              </div>

              <div className="hidden md:flex items-center gap-3 text-slate-300">
                  {stats.hasNumeric && (
                      <Tooltip content="Average of selected cells">
                          <div className="flex items-center gap-2 hover:bg-white/5 px-2 py-1 rounded-md cursor-pointer transition-colors border border-transparent hover:border-slate-700/50">
                              <span className="text-slate-500 uppercase text-[10px] font-bold tracking-wider">Avg</span>
                              <span className="font-mono font-medium tracking-tight text-emerald-400">{stats.average.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                          </div>
                      </Tooltip>
                  )}
                  <Tooltip content="Count of selected cells">
                      <div className="flex items-center gap-2 hover:bg-white/5 px-2 py-1 rounded-md cursor-pointer transition-colors border border-transparent hover:border-slate-700/50">
                          <span className="text-slate-500 uppercase text-[10px] font-bold tracking-wider">Count</span>
                          <span className="font-mono font-medium tracking-tight text-blue-400">{stats.count}</span>
                      </div>
                  </Tooltip>
                  {stats.hasNumeric && (
                      <Tooltip content="Sum of selected cells">
                          <div className="flex items-center gap-2 hover:bg-white/5 px-2 py-1 rounded-md cursor-pointer transition-colors border border-transparent hover:border-slate-700/50">
                              <span className="text-slate-500 uppercase text-[10px] font-bold tracking-wider">Sum</span>
                              <span className="font-mono font-medium tracking-tight text-white">{stats.sum.toLocaleString()}</span>
                          </div>
                      </Tooltip>
                  )}
              </div>
           </div>
        )}

        {/* Mobile Resize Toggle */}
        <div className="lg:hidden flex items-center border-l border-slate-700 pl-3">
            <StatusBarIconBtn 
                onClick={onToggleMobileResize}
                className="p-1.5 text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20 border border-emerald-400/20 rounded-md transition-all active:scale-95"
                title="Resize Cells"
            >
                <Scaling size={16} />
            </StatusBarIconBtn>
        </div>

        {/* View Controls - Desktop Only */}
        <div className="hidden lg:flex items-center gap-1 mr-2 pl-4 border-l border-slate-800">
            <StatusBarIconBtn className="p-1.5 hover:bg-white/10 rounded transition-colors text-white bg-white/10 shadow-sm" title="Normal View">
              <Grid3X3 size={14} />
            </StatusBarIconBtn>
            <StatusBarIconBtn className="p-1.5 hover:bg-white/10 rounded transition-colors text-slate-500 hover:text-white" title="Page Layout">
              <Layout size={14} />
            </StatusBarIconBtn>
            <StatusBarIconBtn className="p-1.5 hover:bg-white/10 rounded transition-colors text-slate-500 hover:text-white" title="Page Break Preview">
              <FileSpreadsheet size={14} />
            </StatusBarIconBtn>
        </div>
        
        {/* Zoom Controls */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800 h-6">
             <StatusBarIconBtn
                onClick={handleZoomOut}
                className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors active:scale-90 disabled:opacity-30 cursor-pointer"
                title="Zoom Out"
                disabled={zoom <= 0.25}
            >
                <Minus size={14} strokeWidth={2.5} />
            </StatusBarIconBtn>

             {/* Slider */}
            <div className="hidden sm:flex items-center w-24 md:w-28 group relative py-2 cursor-pointer">
                   <div className="absolute left-0 right-0 h-1 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-slate-500 group-hover:bg-blue-500 transition-colors" 
                            style={{ width: `${((displayZoom - 25) / 375) * 100}%` }}
                        />
                   </div>
                   <input
                      type="range"
                      min="25"
                      max="400"
                      step="1" 
                      value={displayZoom}
                      onChange={(e) => onZoomChange(Number(e.target.value) / 100)}
                      className="w-full h-4 opacity-0 cursor-pointer z-10"
                   />
                   <Tooltip content={`Zoom: ${displayZoom}%`}>
                       <div 
                            className="absolute h-3 w-3 bg-slate-300 rounded-full shadow-md top-1/2 -translate-y-1/2 pointer-events-none transition-transform group-hover:scale-110 group-active:scale-125"
                            style={{ left: `calc(${((displayZoom - 25) / 375) * 100}% - 6px)` }}
                       />
                   </Tooltip>
            </div>
            
            <StatusBarIconBtn 
                onClick={() => onZoomChange(1)}
                className="min-w-[3rem] text-center font-bold text-slate-300 tabular-nums text-xs hover:bg-white/10 hover:text-white rounded py-0.5 transition-colors select-none"
                title="Reset to 100%"
            >
                {displayZoom}%
            </StatusBarIconBtn>

            <StatusBarIconBtn
                onClick={handleZoomIn}
                className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors active:scale-90 disabled:opacity-30 cursor-pointer"
                title="Zoom In"
                disabled={zoom >= 4}
            >
                <Plus size={14} strokeWidth={2.5} />
            </StatusBarIconBtn>
        </div>
      </div>
    </div>
  );
};

export default memo(StatusBar);
