
import React, { useState, memo } from 'react';
import { X, Clock, Plus, RotateCcw, Trash2, CalendarDays, Save, RefreshCw, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Revision } from '../types';
import { cn } from '../utils';
import { Tooltip } from './shared';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  revisions: Revision[];
  onCreateRevision: (name: string) => void;
  onRestoreRevision: (id: string) => void;
  onDeleteRevision: (id: string) => void;
  onPreviewRevision: (id: string | null) => void;
  activePreviewId: string | null;
}

const RevisionItem = memo(({ 
    revision, 
    idx, 
    isLast, 
    onRestore, 
    onDelete,
    onPreview,
    isPreviewing
}: { 
    revision: Revision, 
    idx: number, 
    isLast: boolean, 
    onRestore: (id: string) => void, 
    onDelete: (id: string) => void,
    onPreview: (id: string) => void,
    isPreviewing: boolean
}) => {
    const formatTime = (ts: number) => {
        const date = new Date(ts);
        const now = new Date();
        const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return date.toLocaleDateString();
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete(revision.id);
    };

    const handleRestore = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onRestore(revision.id);
    };

    const handlePreview = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onPreview(revision.id);
    };

    const isAuto = revision.source === 'Auto';

    return (
        <div 
            className={cn(
                "group relative pl-4 pr-3 py-3 transition-all border-b border-slate-100 last:border-0",
                isPreviewing ? "bg-indigo-50/60" : "hover:bg-slate-50"
            )}
        >
            {/* Timeline Line */}
            <div className="absolute left-[19px] top-0 bottom-0 w-[1px] bg-slate-200 -z-10 group-hover:bg-slate-300 transition-colors" />
            
            <div className="flex items-start gap-3">
                {/* Timeline Dot / Icon */}
                <div className={cn(
                    "mt-1 w-5 h-5 rounded-full flex items-center justify-center border-2 shadow-sm z-10 bg-white transition-colors relative",
                    isPreviewing ? "border-indigo-500 text-indigo-600 scale-110" : (isAuto ? "border-slate-300 text-slate-400" : "border-emerald-500 text-emerald-600")
                )}>
                    {isAuto ? <RefreshCw size={10} /> : <Save size={10} />}
                    {isPreviewing && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-white" />
                    )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                        <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-[4px]",
                            isPreviewing ? "bg-indigo-100 text-indigo-700" : (isAuto ? "bg-slate-100 text-slate-500" : "bg-emerald-100 text-emerald-700")
                        )}>
                            {isAuto ? "Auto-Save" : "Manual Save"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium tabular-nums">{formatTime(revision.timestamp)}</span>
                    </div>
                    
                    <h4 className={cn("text-[13px] font-semibold truncate leading-snug pl-0.5", isPreviewing ? "text-indigo-900" : "text-slate-800")}>
                        {revision.name}
                    </h4>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center justify-between mt-2">
                        {isPreviewing ? (
                            <span className="text-[10px] font-bold text-indigo-500 flex items-center gap-1">
                                <Eye size={12} /> Previewing
                            </span>
                        ) : (
                            <button 
                                onClick={handlePreview}
                                className="text-[11px] font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0"
                            >
                                <Eye size={12} /> Preview
                            </button>
                        )}

                        <div className={cn(
                            "flex gap-1 transition-all duration-200",
                            isPreviewing ? "opacity-100" : "opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0"
                        )}>
                            <Tooltip content="Delete Version">
                                <button 
                                    type="button"
                                    onClick={handleDelete}
                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white hover:shadow-sm rounded-md transition-all"
                                >
                                    <Trash2 size={13} />
                                </button>
                            </Tooltip>
                            <Tooltip content="Restore Version">
                                <button 
                                    type="button"
                                    onClick={handleRestore}
                                    className={cn(
                                        "flex items-center gap-1.5 px-2.5 py-1.5 text-white text-[10px] font-bold rounded-md shadow-sm active:scale-95 transition-all",
                                        isPreviewing ? "bg-indigo-600 hover:bg-indigo-700" : "bg-slate-900 hover:bg-slate-800"
                                    )}
                                >
                                    <RotateCcw size={11} />
                                    Restore
                                </button>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen,
  onClose,
  revisions,
  onCreateRevision,
  onRestoreRevision,
  onDeleteRevision,
  onPreviewRevision,
  activePreviewId
}) => {
  const [newVersionName, setNewVersionName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = () => {
      onCreateRevision(newVersionName.trim() || `Snapshot ${revisions.length + 1}`);
      setNewVersionName('');
      setIsCreating(false);
  };

  return (
    <>
        {/* Backdrop for mobile */}
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/20 z-[90] md:hidden backdrop-blur-sm"
                />
            )}
        </AnimatePresence>

        {/* Sidebar Panel */}
        <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: isOpen ? 0 : '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-[320px] bg-white shadow-2xl z-[100] border-l border-slate-200 flex flex-col"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white flex-shrink-0">
                <div className="flex items-center gap-2.5 text-slate-800">
                    <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Clock size={18} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-[14px] leading-tight">Version History</span>
                        <span className="text-[10px] text-slate-400 font-medium">Manage snapshots</span>
                    </div>
                </div>
                <Tooltip content="Close">
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={16} />
                    </button>
                </Tooltip>
            </div>

            {/* Current Status Banner */}
            {!activePreviewId ? (
                <div className="px-5 py-3 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-800">Viewing Current Version</span>
                </div>
            ) : (
                <div className="px-5 py-3 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                        <Eye size={14} className="text-indigo-600" />
                        <span className="text-xs font-semibold text-indigo-800">Preview Mode</span>
                    </div>
                    <button 
                        onClick={() => onPreviewRevision(null)}
                        className="text-[10px] font-bold text-indigo-600 hover:bg-indigo-100 px-2 py-1 rounded transition-colors"
                    >
                        Exit
                    </button>
                </div>
            )}

            {/* Create Section */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex-shrink-0">
                {!isCreating ? (
                    <button 
                        onClick={() => setIsCreating(true)}
                        disabled={!!activePreviewId}
                        className={cn(
                            "w-full flex items-center justify-center gap-2 py-2.5 font-semibold rounded-lg border shadow-sm transition-all active:scale-95 text-xs group",
                            activePreviewId 
                                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                        )}
                    >
                        <Plus size={14} className="group-hover:scale-110 transition-transform" />
                        <span>Create Named Version</span>
                    </button>
                ) : (
                    <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-1">
                        <input 
                            autoFocus
                            type="text" 
                            value={newVersionName}
                            onChange={(e) => setNewVersionName(e.target.value)}
                            placeholder="Version name (e.g. Before Audit)"
                            className="w-full px-3 py-2 bg-white border border-slate-300 focus:border-indigo-500 rounded-md text-sm outline-none shadow-sm"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCreate();
                                if (e.key === 'Escape') setIsCreating(false);
                            }}
                        />
                        <div className="flex gap-2">
                            <button 
                                onClick={handleCreate}
                                className="flex-1 py-1.5 bg-slate-900 text-white text-xs font-bold rounded hover:bg-slate-800 transition-colors shadow-sm"
                            >
                                Save
                            </button>
                            <button 
                                onClick={() => setIsCreating(false)}
                                className="flex-1 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin bg-white p-0 relative">
                {revisions.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3 opacity-60">
                        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                            <CalendarDays size={28} strokeWidth={1.5} />
                        </div>
                        <span className="text-xs font-medium">No versions saved yet</span>
                    </div>
                ) : (
                    <div className="flex flex-col pb-4">
                        {revisions.map((rev, idx) => (
                            <RevisionItem 
                                key={rev.id} 
                                revision={rev} 
                                idx={idx} 
                                isLast={idx === revisions.length - 1}
                                onRestore={onRestoreRevision}
                                onDelete={onDeleteRevision}
                                onPreview={onPreviewRevision}
                                isPreviewing={activePreviewId === rev.id}
                            />
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    </>
  );
};

export default HistorySidebar;
