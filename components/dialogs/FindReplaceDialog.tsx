
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Search, Replace, ArrowRight, Check, MapPin, List, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils';

interface SearchResult {
    id: string;
    content: string;
}

interface FindReplaceDialogProps {
  isOpen: boolean;
  initialMode: 'find' | 'replace' | 'goto';
  onClose: () => void;
  onFind: (query: string, matchCase: boolean, matchEntire: boolean) => void;
  onReplace: (query: string, replaceWith: string, matchCase: boolean, matchEntire: boolean, replaceAll: boolean) => void;
  onGoTo: (reference: string) => void;
  // New props for preview
  onSearchAll?: (query: string, matchCase: boolean) => SearchResult[];
  onGetCellData?: (id: string) => { value: string, raw: string } | null;
  onHighlight?: (id: string) => void;
}

const FindReplaceDialog: React.FC<FindReplaceDialogProps> = ({ 
  isOpen, initialMode, onClose, onFind, onReplace, onGoTo,
  onSearchAll, onGetCellData, onHighlight
}) => {
  const [activeTab, setActiveTab] = useState(initialMode);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [matchEntire, setMatchEntire] = useState(false);
  const [gotoRef, setGotoRef] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [gotoPreview, setGotoPreview] = useState<{ id: string, value: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
        setActiveTab(initialMode);
        // Clear previous state
        setFindText('');
        setResults([]);
        setGotoRef('');
        setGotoPreview(null);
        setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, initialMode]);

  // Debounced Search for Find/Replace
  useEffect(() => {
      if ((activeTab === 'find' || activeTab === 'replace') && onSearchAll) {
          const timer = setTimeout(() => {
              if (findText.trim().length > 0) {
                  const matches = onSearchAll(findText, matchCase);
                  // Filter for matchEntire if needed (though typically user hits Find Next for strictness, preview can be loose)
                  const filtered = matchEntire 
                    ? matches.filter(m => matchCase ? m.content === findText : m.content.toLowerCase() === findText.toLowerCase())
                    : matches;
                  setResults(filtered);
              } else {
                  setResults([]);
              }
          }, 300);
          return () => clearTimeout(timer);
      }
  }, [findText, matchCase, matchEntire, activeTab, onSearchAll]);

  // Debounced Preview for Go To
  useEffect(() => {
      if (activeTab === 'goto' && onGetCellData) {
          const timer = setTimeout(() => {
              // Basic validation for A1 notation
              if (/^[A-Z]+[0-9]+$/i.test(gotoRef)) {
                  const data = onGetCellData(gotoRef.toUpperCase());
                  if (data) {
                      setGotoPreview({ id: gotoRef.toUpperCase(), value: data.value });
                  } else {
                      // Valid coord but empty
                      setGotoPreview({ id: gotoRef.toUpperCase(), value: '(Empty)' });
                  }
              } else {
                  setGotoPreview(null);
              }
          }, 200);
          return () => clearTimeout(timer);
      }
  }, [gotoRef, activeTab, onGetCellData]);

  if (!isOpen) return null;

  const TABS = [
      { id: 'find', label: 'Find', icon: Search },
      { id: 'replace', label: 'Replace', icon: Replace },
      { id: 'goto', label: 'Go To', icon: ArrowRight },
  ];

  const highlightMatch = (text: string, query: string) => {
      if (!query) return text;
      const parts = text.split(new RegExp(`(${query})`, 'gi'));
      return parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() 
            ? <span key={i} className="bg-yellow-200 text-yellow-900 font-semibold rounded-[2px] px-0.5 border border-yellow-300">{part}</span> 
            : part
      );
  };

  const handleResultClick = (id: string) => {
      if (onHighlight) onHighlight(id);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                    className="bg-white w-full max-w-[480px] rounded-2xl shadow-2xl overflow-hidden ring-1 ring-black/5 flex flex-col relative max-h-[85vh]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white/50 backdrop-blur-md sticky top-0 z-10 flex-shrink-0">
                        <span className="text-lg font-bold text-slate-800 tracking-tight">Find & Select</span>
                        <button 
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Segmented Control */}
                    <div className="px-5 pt-5 pb-2 flex-shrink-0">
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
                    <div className="p-6 flex flex-col gap-6 overflow-y-auto scrollbar-thin">
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
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-medium focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all placeholder:text-slate-400 text-slate-800 uppercase"
                                                    placeholder="e.g. A1, SalesData..."
                                                    onKeyDown={(e) => e.key === 'Enter' && onGoTo(gotoRef)}
                                                />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-200 rounded text-[10px] font-bold text-slate-500 hidden sm:block pointer-events-none select-none">
                                                    ENTER
                                                </div>
                                            </div>
                                        </div>

                                        {/* Go To Preview Card */}
                                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm min-h-[100px] flex items-center justify-center transition-all">
                                            {gotoPreview ? (
                                                <div className="flex items-center gap-4 w-full animate-in fade-in zoom-in duration-200">
                                                    <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center border border-primary-100 flex-shrink-0">
                                                        <MapPin size={24} className="text-primary-600" />
                                                    </div>
                                                    <div className="flex flex-col flex-1 min-w-0">
                                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Target Cell</span>
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-lg font-black text-slate-800">{gotoPreview.id}</span>
                                                            <span className="text-sm text-slate-500 truncate border-l border-slate-200 pl-2">{gotoPreview.value}</span>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => onGoTo(gotoRef)} className="p-2 hover:bg-slate-50 rounded-lg text-primary-600 transition-colors">
                                                        <ArrowRight size={20} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="text-center text-slate-400 text-sm flex flex-col items-center gap-2">
                                                    <MapPin size={24} className="opacity-20" />
                                                    <span>Enter a coordinate to preview</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        {/* Search Input */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Find what</label>
                                            <div className="relative group">
                                                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
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

                                        {/* Replace Input */}
                                        {activeTab === 'replace' && (
                                            <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-200">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Replace with</label>
                                                <div className="relative group">
                                                    <Replace size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
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

                                        {/* Options */}
                                        <div className="flex gap-4 pt-1 px-1">
                                            <label className="flex items-center gap-2 cursor-pointer group select-none">
                                                <div className={cn("w-4 h-4 rounded border flex items-center justify-center transition-all", matchCase ? "bg-primary-500 border-primary-500" : "bg-white border-slate-300 group-hover:border-primary-400")}>
                                                    {matchCase && <Check size={10} className="text-white stroke-[4]" />}
                                                </div>
                                                <span className="text-xs text-slate-600 font-medium group-hover:text-slate-800">Match case</span>
                                                <input type="checkbox" className="hidden" checked={matchCase} onChange={(e) => setMatchCase(e.target.checked)} />
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer group select-none">
                                                <div className={cn("w-4 h-4 rounded border flex items-center justify-center transition-all", matchEntire ? "bg-primary-500 border-primary-500" : "bg-white border-slate-300 group-hover:border-primary-400")}>
                                                    {matchEntire && <Check size={10} className="text-white stroke-[4]" />}
                                                </div>
                                                <span className="text-xs text-slate-600 font-medium group-hover:text-slate-800">Whole cell</span>
                                                <input type="checkbox" className="hidden" checked={matchEntire} onChange={(e) => setMatchEntire(e.target.checked)} />
                                            </label>
                                        </div>

                                        {/* Live Preview List */}
                                        <div className="flex-1 mt-2 min-h-[160px] max-h-[220px] bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex flex-col">
                                            <div className="px-3 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                                    <List size={12} />
                                                    Results {results.length > 0 && <span className="bg-white px-1.5 rounded-full text-slate-700 shadow-sm border border-slate-200">{results.length}</span>}
                                                </span>
                                            </div>
                                            <div className="overflow-y-auto scrollbar-thin flex-1 bg-white p-1">
                                                {results.length > 0 ? (
                                                    <div className="flex flex-col">
                                                        {results.map((res, i) => (
                                                            <div 
                                                                key={`${res.id}-${i}`}
                                                                onClick={() => handleResultClick(res.id)}
                                                                className="flex items-center gap-3 p-2 hover:bg-primary-50 rounded-lg cursor-pointer group transition-colors border-b border-slate-50 last:border-0"
                                                            >
                                                                <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 group-hover:bg-white group-hover:border-primary-200 group-hover:text-primary-700 transition-colors w-10 text-center flex-shrink-0">
                                                                    {res.id}
                                                                </span>
                                                                <span className="text-sm text-slate-700 truncate flex-1">
                                                                    {highlightMatch(res.content, findText)}
                                                                </span>
                                                                <button className="opacity-0 group-hover:opacity-100 p-1 text-primary-500 hover:bg-white rounded transition-all">
                                                                    <Eye size={14} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        {results.length === 50 && (
                                                            <div className="text-center py-2 text-[10px] text-slate-400 italic">
                                                                Showing first 50 matches...
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 opacity-60">
                                                        <Search size={24} />
                                                        <span className="text-xs">{findText ? "No matches found" : "Type to preview matches"}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer / Actions */}
                    <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
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
