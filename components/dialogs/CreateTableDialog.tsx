
import React, { useState, useEffect } from 'react';
import { X, Table, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils';
import { Tooltip } from '../shared';

interface CreateTableDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialRange: string;
  onConfirm: (range: string, hasHeaders: boolean) => void;
}

const CreateTableDialog: React.FC<CreateTableDialogProps> = ({ 
  isOpen, onClose, initialRange, onConfirm
}) => {
  const [range, setRange] = useState(initialRange);
  const [hasHeaders, setHasHeaders] = useState(true);

  useEffect(() => {
    if (isOpen) {
        setRange(initialRange);
        setHasHeaders(true);
    }
  }, [isOpen, initialRange]);

  if (!isOpen) return null;

  const handleConfirm = () => {
      onConfirm(range, hasHeaders);
      onClose();
  };

  return (
    <div className="fixed inset-0 z-[2002] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4">
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
                    className="bg-white w-full max-w-[380px] shadow-2xl rounded-2xl flex flex-col overflow-hidden ring-1 ring-black/5"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                                <Table size={16} strokeWidth={2.5} />
                            </div>
                            <span className="text-[15px] font-bold text-slate-800 tracking-tight">Create Table</span>
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
                    <div className="p-6 flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-[13px] font-semibold text-slate-700">Where is the data for your table?</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-slate-400 font-bold text-xs">REF:</span>
                                </div>
                                <input 
                                    type="text" 
                                    value={range}
                                    onChange={(e) => setRange(e.target.value.toUpperCase())}
                                    className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-mono font-medium text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all uppercase shadow-sm"
                                    placeholder="A1:C5"
                                />
                                <button className="absolute right-1 top-1 bottom-1 w-7 bg-white border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-50 hover:border-emerald-300 transition-colors group-focus-within:border-emerald-200 shadow-sm">
                                    <ArrowUp size={14} className="text-slate-500" />
                                </button>
                            </div>
                        </div>
                        
                        <label className="flex items-center gap-3 cursor-pointer group select-none p-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors">
                            <div className={cn(
                                "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                                hasHeaders ? "bg-emerald-500 border-emerald-500" : "bg-white border-slate-300 group-hover:border-emerald-400"
                            )}>
                                {hasHeaders && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><ArrowUp size={12} className="text-white rotate-45 stroke-[4]" /></motion.div>}
                            </div>
                            <input 
                                type="checkbox" 
                                checked={hasHeaders} 
                                onChange={(e) => setHasHeaders(e.target.checked)}
                                className="hidden"
                            />
                            <span className="text-[13px] font-medium text-slate-700">My table has headers</span>
                        </label>
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
                            onClick={handleConfirm}
                            className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-bold rounded-xl shadow-lg shadow-slate-900/20 active:scale-95 transition-all"
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

export default CreateTableDialog;
