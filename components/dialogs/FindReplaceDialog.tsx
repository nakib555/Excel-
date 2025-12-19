
import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Replace, ArrowRight, Check } from 'lucide-react';
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
        setActiveTab(initialMode);
        // Focus usually happens automatically via autoFocus but we can force it
        setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const TABS = [
      { id: 'find', label: 'Find', icon: Search },
      { id: 'replace', label: 'Replace', icon: Replace },
      { id: 'goto', label: 'Go To', icon: ArrowRight },
  ];

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                    className="bg-white w-full max-w-[420px] rounded-2xl shadow-2xl overflow-hidden ring-1 ring-black/5 flex flex-col relative"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white/50 backdrop-blur-md sticky top-0 z-10">
                        <span className="text-lg font-bold text-slate-800 tracking-tight">Find & Select</span>
                        <button 
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Segmented Control */}
                    <div className="px-5 pt-5 pb-2">
                        <div className="flex p-1 bg-slate-100/80 rounded-xl relative select-none">
                            {TABS.map(tab => {
                                const isActive = activeTab === tab.id;
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={cn(
                                            "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-semibold transition-all relative z-10",
                                            isActive ? "text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                        )}
                                    >
                                        <Icon size={14} className={isActive ? "text-primary-600" : "opacity-50"} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                            {/* Sliding Background */}
                            <motion.div 
                                className="absolute top-1 bottom-1 bg-white rounded-lg shadow-sm z-0"
                                layoutId="tab-bg"
                                initial={false}
                                animate={{ 
                                    left: `${(TABS.findIndex(t => t.id === activeTab) * (100 / TABS.length))}%`
                                }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                style={{ width: `${100 / TABS.length}%` }} 
                            />
                        </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-6 min-h-[220px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col gap-5"
                            >
                                {activeTab === 'goto' ? (
                                    <div className="flex flex-col gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Reference</label>
                                            <div className="relative">
                                                <input 
                                                    ref={inputRef}
                                                    type="text" 
                                                    value={gotoRef}
                                                    onChange={(e) => setGotoRef(e.target.value)}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-medium focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all placeholder:text-slate-400 text-slate-800"
                                                    placeholder="e.g. A1, SalesData..."
                                                    onKeyDown={(e) => e.key === 'Enter' && onGoTo(gotoRef)}
                                                />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-200 rounded text-[10px] font-bold text-slate-500 hidden sm:block pointer-events-none select-none">
                                                    ENTER
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-400 px-1 leading-relaxed">
                                                Jump to a specific cell, range, or named area in the workbook.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Find what</label>
                                            <div className="relative">
                                                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input 
                                                    ref={inputRef}
                                                    type="text" 
                                                    value={findText}
                                                    onChange={(e) => setFindText(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all text-slate-800"
                                                    placeholder="Search text or number..."
                                                    onKeyDown={(e) => e.key === 'Enter' && onFind(findText, matchCase, matchEntire)}
                                                />
                                            </div>
                                        </div>

                                        {activeTab === 'replace' && (
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Replace with</label>
                                                <div className="relative">
                                                    <Replace size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input 
                                                        type="text" 
                                                        value={replaceText}
                                                        onChange={(e) => setReplaceText(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all text-slate-800"
                                                        placeholder="Replacement text..."
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex flex-col gap-2.5 pt-1 px-1">
                                            <label className="flex items-center gap-3 cursor-pointer group select-none">
                                                <div className={cn("w-5 h-5 rounded border-2 flex items-center justify-center transition-all", matchCase ? "bg-primary-500 border-primary-500" : "bg-white border-slate-300 group-hover:border-primary-400")}>
                                                    {matchCase && <Check size={12} className="text-white stroke-[4]" />}
                                                </div>
                                                <span className="text-sm text-slate-600 font-medium group-hover:text-slate-800">Match case</span>
                                                <input type="checkbox" className="hidden" checked={matchCase} onChange={(e) => setMatchCase(e.target.checked)} />
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer group select-none">
                                                <div className={cn("w-5 h-5 rounded border-2 flex items-center justify-center transition-all", matchEntire ? "bg-primary-500 border-primary-500" : "bg-white border-slate-300 group-hover:border-primary-400")}>
                                                    {matchEntire && <Check size={12} className="text-white stroke-[4]" />}
                                                </div>
                                                <span className="text-sm text-slate-600 font-medium group-hover:text-slate-800">Match entire cell contents</span>
                                                <input type="checkbox" className="hidden" checked={matchEntire} onChange={(e) => setMatchEntire(e.target.checked)} />
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer / Actions */}
                    <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                        {activeTab === 'find' && (
                            <button 
                                onClick={() => onFind(findText, matchCase, matchEntire)}
                                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/20 active:scale-95 transition-all flex items-center gap-2"
                            >
                                Find Next
                            </button>
                        )}
                        {activeTab === 'replace' && (
                            <>
                                <button 
                                    onClick={() => onReplace(findText, replaceText, matchCase, matchEntire, true)}
                                    className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold shadow-sm active:scale-95 transition-all"
                                >
                                    Replace All
                                </button>
                                <button 
                                    onClick={() => onReplace(findText, replaceText, matchCase, matchEntire, false)}
                                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/20 active:scale-95 transition-all"
                                >
                                    Replace
                                </button>
                            </>
                        )}
                        {activeTab === 'goto' && (
                            <button 
                                onClick={() => onGoTo(gotoRef)}
                                className="px-8 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/20 active:scale-95 transition-all flex items-center gap-2"
                            >
                                Go <ArrowRight size={16} />
                            </button>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default FindReplaceDialog;
