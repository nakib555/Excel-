
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="fixed inset-0 z-[2002] flex items-center justify-center bg-slate-900/20 backdrop-blur-[2px]">
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                    className="bg-white w-[340px] shadow-2xl border border-slate-300 rounded-[4px] flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-3 py-1.5 bg-white border-b border-slate-100 select-none cursor-default">
                        <span className="text-[13px] font-semibold text-slate-800">Create Table</span>
                        <button 
                            onClick={onClose}
                            className="text-slate-400 hover:bg-red-500 hover:text-white px-2 py-0.5 rounded text-[10px] transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 bg-white flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-[12px] text-slate-700">Where is the data for your table?</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={range}
                                    onChange={(e) => setRange(e.target.value.toUpperCase())}
                                    className="w-full border border-slate-300 px-2 py-1 text-[13px] font-mono text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                                />
                                <button className="absolute right-0 top-0 bottom-0 bg-slate-100 border-l border-slate-300 px-2 flex items-center justify-center hover:bg-slate-200">
                                    <span className="text-[10px] text-slate-600 font-bold">↑</span>
                                </button>
                            </div>
                        </div>
                        
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input 
                                type="checkbox" 
                                checked={hasHeaders} 
                                onChange={(e) => setHasHeaders(e.target.checked)}
                                className="w-3.5 h-3.5 border-slate-300 rounded-[2px] accent-emerald-600 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-[12px] text-slate-700">My table has headers</span>
                        </label>
                        
                        {/* Buttons */}
                        <div className="flex justify-end gap-2 mt-2">
                            <button 
                                onClick={handleConfirm}
                                className="px-5 py-1 bg-white hover:bg-emerald-50 border border-slate-300 hover:border-emerald-400 text-slate-700 text-xs rounded-[2px] min-w-[70px] transition-colors active:scale-95 shadow-sm font-medium"
                            >
                                OK
                            </button>
                            <button 
                                onClick={onClose}
                                className="px-5 py-1 bg-white border border-slate-300 rounded-[2px] text-xs text-black hover:bg-slate-50 hover:border-slate-400 min-w-[70px] transition-colors active:scale-95"
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

export default CreateTableDialog;
