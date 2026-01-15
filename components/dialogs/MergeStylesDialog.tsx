
import React from 'react';
import { X, Copy, AlertCircle, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip } from '../shared';

interface MergeStylesDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const MergeStylesDialog: React.FC<MergeStylesDialogProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2002] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
                    className="bg-white w-full max-w-[420px] shadow-2xl rounded-2xl flex flex-col overflow-hidden ring-1 ring-black/5"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                                <Copy size={16} strokeWidth={2.5} />
                            </div>
                            <span className="text-[15px] font-bold text-slate-800 tracking-tight">Merge Styles</span>
                        </div>
                        <Tooltip content="Close">
                            <button 
                                onClick={onClose}
                                className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </Tooltip>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-[13px] font-semibold text-slate-700">Source Workbook</h3>
                            <p className="text-[12px] text-slate-500">Select an open workbook to copy styles from.</p>
                        </div>

                        {/* List Box - Empty State */}
                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl h-40 flex flex-col items-center justify-center text-center p-6 gap-2">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-1">
                                <BookOpen size={20} className="text-slate-400" />
                            </div>
                            <span className="text-sm font-semibold text-slate-600">No workbooks open</span>
                            <span className="text-xs text-slate-400 leading-relaxed max-w-[200px]">
                                Open another workbook in a new tab to merge its styles here.
                            </span>
                        </div>
                        
                        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg text-amber-800">
                            <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-amber-600" />
                            <span className="text-[11px] leading-relaxed">
                                Merging styles will overwrite any styles with the same name in the current workbook.
                            </span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 px-5 py-4 bg-slate-50 border-t border-slate-100">
                        <button 
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-[13px] font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={onClose}
                            disabled
                            className="px-6 py-2 bg-slate-200 text-slate-400 text-[13px] font-bold rounded-xl cursor-not-allowed"
                        >
                            OK
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default MergeStylesDialog;
