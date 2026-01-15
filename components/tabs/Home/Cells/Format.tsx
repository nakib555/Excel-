import React, { useState } from 'react';
import { 
    Layout, ArrowUpDown, ArrowLeftRight, EyeOff, Eye, Type, Lock, Shield, 
    MoveHorizontal, MoveVertical, ArrowRight
} from 'lucide-react';
import { RibbonButton, SmartDropdown, TabProps, Tooltip } from '../../shared';

interface FormatProps extends Pick<TabProps, 
    'onFormatRowHeight' | 'onFormatColWidth' | 'onAutoFitRowHeight' | 'onAutoFitColWidth' |
    'onHideRow' | 'onHideCol' | 'onUnhideRow' | 'onUnhideCol' | 
    'onRenameSheet' | 'onMoveCopySheet' | 'onProtectSheet' | 'onLockCell' | 'onOpenFormatDialog'
> {}

const Format: React.FC<FormatProps> = ({ 
    onFormatRowHeight, onFormatColWidth, onAutoFitRowHeight, onAutoFitColWidth,
    onHideRow, onHideCol, onUnhideRow, onUnhideCol,
    onRenameSheet, onMoveCopySheet, onProtectSheet, onLockCell, onOpenFormatDialog
}) => {
    const [open, setOpen] = useState(false);

    const handleAction = (action: (() => void) | undefined) => {
        if (action) action();
        setOpen(false);
    };

    return (
        <SmartDropdown
            open={open}
            onToggle={() => setOpen(!open)}
            contentWidth="w-64"
            trigger={
                <RibbonButton 
                    variant="small" 
                    icon={<Layout size={14} className="text-orange-600" />} 
                    label="Format" 
                    hasDropdown 
                    onClick={() => {}} 
                    title="Format Cells"
                />
            }
        >
            <div className="flex flex-col py-1">
                {/* Cell Size */}
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase bg-slate-50 mb-1 border-b border-slate-100">
                    Cell Size
                </div>
                <Tooltip content="Change row height" side="right">
                    <button onClick={() => handleAction(onFormatRowHeight)} className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group">
                        <MoveVertical size={14} className="text-blue-500 group-hover:scale-110 transition-transform" />
                        <span>Row Height...</span>
                    </button>
                </Tooltip>
                <Tooltip content="Autofit row height" side="right">
                    <button onClick={() => handleAction(onAutoFitRowHeight)} className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group">
                        <ArrowUpDown size={14} className="text-blue-400 group-hover:scale-110 transition-transform" />
                        <span>AutoFit Row Height</span>
                    </button>
                </Tooltip>
                <Tooltip content="Change column width" side="right">
                    <button onClick={() => handleAction(onFormatColWidth)} className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group">
                        <MoveHorizontal size={14} className="text-purple-500 group-hover:scale-110 transition-transform" />
                        <span>Column Width...</span>
                    </button>
                </Tooltip>
                <Tooltip content="Autofit column width" side="right">
                    <button onClick={() => handleAction(onAutoFitColWidth)} className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group">
                        <ArrowLeftRight size={14} className="text-purple-400 group-hover:scale-110 transition-transform" />
                        <span>AutoFit Column Width</span>
                    </button>
                </Tooltip>

                {/* Visibility */}
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase bg-slate-50 my-1 border-y border-slate-100">
                    Visibility
                </div>
                <Tooltip content="Hide selected rows" side="right">
                    <button onClick={() => handleAction(onHideRow)} className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group">
                        <EyeOff size={14} className="text-slate-400 group-hover:text-slate-600" />
                        <span>Hide Rows</span>
                    </button>
                </Tooltip>
                <Tooltip content="Hide selected columns" side="right">
                    <button onClick={() => handleAction(onHideCol)} className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group">
                        <EyeOff size={14} className="text-slate-400 rotate-90 group-hover:text-slate-600" />
                        <span>Hide Columns</span>
                    </button>
                </Tooltip>
                <Tooltip content="Unhide rows" side="right">
                    <button onClick={() => handleAction(onUnhideRow)} className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group">
                        <Eye size={14} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                        <span>Unhide Rows</span>
                    </button>
                </Tooltip>
                <Tooltip content="Unhide columns" side="right">
                    <button onClick={() => handleAction(onUnhideCol)} className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group">
                        <Eye size={14} className="text-emerald-500 rotate-90 group-hover:scale-110 transition-transform" />
                        <span>Unhide Columns</span>
                    </button>
                </Tooltip>

                {/* Organize Sheets */}
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase bg-slate-50 my-1 border-y border-slate-100">
                    Organize Sheets
                </div>
                <Tooltip content="Rename current sheet" side="right">
                    <button onClick={() => handleAction(onRenameSheet)} className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group">
                        <Type size={14} className="text-pink-500 group-hover:scale-110 transition-transform" />
                        <span>Rename Sheet</span>
                    </button>
                </Tooltip>
                <Tooltip content="Move or copy sheet" side="right">
                    <button onClick={() => handleAction(onMoveCopySheet)} className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group">
                        <ArrowRight size={14} className="text-cyan-500 group-hover:scale-110 transition-transform" />
                        <span>Move or Copy Sheet...</span>
                    </button>
                </Tooltip>

                {/* Protection */}
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase bg-slate-50 my-1 border-y border-slate-100">
                    Protection
                </div>
                <Tooltip content="Protect sheet" side="right">
                    <button onClick={() => handleAction(onProtectSheet)} className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group">
                        <Shield size={14} className="text-amber-500 group-hover:scale-110 transition-transform" />
                        <span>Protect Sheet...</span>
                    </button>
                </Tooltip>
                <Tooltip content="Lock cells" side="right">
                    <button onClick={() => handleAction(onLockCell)} className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group">
                        <Lock size={14} className="text-rose-500 group-hover:scale-110 transition-transform" />
                        <span>Lock Cell</span>
                    </button>
                </Tooltip>

                <div className="border-t border-slate-100 mt-1 pt-1">
                    <Tooltip content="Open Format Cells dialog" side="right">
                        <button onClick={() => handleAction(onOpenFormatDialog)} className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left w-full group">
                            <Layout size={14} className="text-indigo-600 group-hover:scale-110 transition-transform" />
                            <span>Format Cells...</span>
                        </button>
                    </Tooltip>
                </div>
            </div>
        </SmartDropdown>
    );
};

export default Format;