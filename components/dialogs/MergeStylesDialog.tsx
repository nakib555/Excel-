
import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MergeStylesDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const MergeStylesDialog: React.FC<MergeStylesDialogProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                    className="bg-white w-[340px] shadow-2xl border border-slate-300 rounded-sm flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-3 py-1.5 bg-white border-b border-slate-100 select-none cursor-default">
                        <span className="text-[13px] font-normal text-slate-800">Merge Styles</span>
                        <button 
                            onClick={onClose}
                            className="text-slate-400 hover:bg-red-500 hover:text-white px-2 py-0.5 rounded text-[10px] transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 bg-white">
                        <div className="mb-2 text-[13px] text-slate-700">Merge styles from:</div>
                        <div className="border border-slate-300 h-28 overflow-y-auto bg-white p-1 mb-6 shadow-inner">
                            {/* Replicating the empty state from the visual reference */}
                            <div className="text-slate-500 italic px-2 text-[13px] py-1">
                                {'<No Workbooks Open>'}
                            </div>
                        </div>
                        
                        {/* Buttons */}
                        <div className="flex justify-end gap-2">
                            <button 
                                onClick={onClose}
                                className="px-5 py-1.5 bg-[#e1e1e1] hover:bg-[#d1d1d1] border border-slate-300 rounded-[2px] text-xs text-black min-w-[70px] transition-colors active:scale-95"
                            >
                                OK
                            </button>
                            <button 
                                onClick={onClose}
                                className="px-5 py-1.5 bg-white border border-slate-300 rounded-[2px] text-xs text-black hover:bg-slate-50 hover:border-slate-400 min-w-[70px] transition-colors active:scale-95"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default MergeStylesDialog;
