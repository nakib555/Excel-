
import React, { useState, useEffect } from 'react';
import { X, Search, Replace, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils';

interface FindReplaceDialogProps {
  isOpen: boolean;
  initialMode: 'find' | 'replace' | 'goto';
  onClose: () => void;
  onFind: (query: string, matchCase: boolean, matchEntire: boolean) => void;
  onReplace: (query: string, replaceWith: string, matchCase: boolean, matchEntire: boolean, replaceAll: boolean) => void;
  onGoTo: (reference: string) => void;
}

const FindReplaceDialog: React.FC<FindReplaceDialogProps> = ({ 
  isOpen, initialMode, onClose, onFind, onReplace, onGoTo 
}) => {
  const [activeTab, setActiveTab] = useState(initialMode);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [matchEntire, setMatchEntire] = useState(false);
  const [gotoRef, setGotoRef] = useState('');

  // Sync tab with props when opened
  useEffect(() => {
    if (isOpen) setActiveTab(initialMode);
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col mx-4"
            >
                {/* Header / Tabs */}
                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-2 pt-2">
                    <div className="flex gap-1">
                        <button 
                            onClick={() => setActiveTab('find')}
                            className={cn(
                                "px-4 py-2 text-xs font-semibold rounded-t-md transition-colors",
                                activeTab === 'find' ? "bg-white border-x border-t border-slate-200 text-slate-900 -mb-[1px] pb-2.5 z-10" : "text-slate-500 hover:text-slate-800"
                            )}
                        >
                            Find
                        </button>
                        <button 
                            onClick={() => setActiveTab('replace')}
                            className={cn(
                                "px-4 py-2 text-xs font-semibold rounded-t-md transition-colors",
                                activeTab === 'replace' ? "bg-white border-x border-t border-slate-200 text-slate-900 -mb-[1px] pb-2.5 z-10" : "text-slate-500 hover:text-slate-800"
                            )}
                        >
                            Replace
                        </button>
                        <button 
                            onClick={() => setActiveTab('goto')}
                            className={cn(
                                "px-4 py-2 text-xs font-semibold rounded-t-md transition-colors",
                                activeTab === 'goto' ? "bg-white border-x border-t border-slate-200 text-slate-900 -mb-[1px] pb-2.5 z-10" : "text-slate-500 hover:text-slate-800"
                            )}
                        >
                            Go To
                        </button>
                    </div>
                    <button onClick={onClose} className="p-1.5 mb-1 hover:bg-slate-200 rounded-full text-slate-500">
                        <X size={16} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 bg-white min-h-[200px]">
                    {activeTab === 'goto' ? (
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Reference:</label>
                                <input 
                                    type="text" 
                                    value={gotoRef}
                                    onChange={(e) => setGotoRef(e.target.value)}
                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                                    placeholder="e.g. A1, Z100, SalesData"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && onGoTo(gotoRef)}
                                />
                            </div>
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-500">
                                Enter a cell reference (A1) or a named range to jump immediately.
                            </div>
                            <div className="flex justify-end pt-2">
                                <button 
                                    onClick={() => onGoTo(gotoRef)}
                                    className="px-6 py-2 bg-primary-600 text-white text-sm font-medium rounded hover:bg-primary-700 transition-colors"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-[80px_1fr] gap-3 items-center">
                                <label className="text-xs font-medium text-slate-600 text-right">Find what:</label>
                                <input 
                                    type="text" 
                                    value={findText}
                                    onChange={(e) => setFindText(e.target.value)}
                                    className="border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-primary-500"
                                    autoFocus
                                />
                            </div>
                            
                            {activeTab === 'replace' && (
                                <div className="grid grid-cols-[80px_1fr] gap-3 items-center">
                                    <label className="text-xs font-medium text-slate-600 text-right">Replace with:</label>
                                    <input 
                                        type="text" 
                                        value={replaceText}
                                        onChange={(e) => setReplaceText(e.target.value)}
                                        className="border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-primary-500"
                                    />
                                </div>
                            )}

                            <div className="ml-[80px] flex flex-col gap-2 mt-1">
                                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                                    <input type="checkbox" checked={matchCase} onChange={(e) => setMatchCase(e.target.checked)} className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                                    Match case
                                </label>
                                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                                    <input type="checkbox" checked={matchEntire} onChange={(e) => setMatchEntire(e.target.checked)} className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                                    Match entire cell contents
                                </label>
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-2">
                                {activeTab === 'replace' && (
                                    <button 
                                        onClick={() => onReplace(findText, replaceText, matchCase, matchEntire, true)}
                                        className="px-3 py-1.5 border border-slate-300 text-slate-700 text-xs font-medium rounded hover:bg-slate-50 transition-colors"
                                    >
                                        Replace All
                                    </button>
                                )}
                                {activeTab === 'replace' && (
                                    <button 
                                        onClick={() => onReplace(findText, replaceText, matchCase, matchEntire, false)}
                                        className="px-3 py-1.5 border border-slate-300 text-slate-700 text-xs font-medium rounded hover:bg-slate-50 transition-colors"
                                    >
                                        Replace
                                    </button>
                                )}
                                <button 
                                    onClick={() => onFind(findText, matchCase, matchEntire)}
                                    className="px-4 py-1.5 bg-primary-600 text-white text-xs font-medium rounded hover:bg-primary-700 transition-colors min-w-[80px]"
                                >
                                    Find Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    </div>
  );
};

export default FindReplaceDialog;
