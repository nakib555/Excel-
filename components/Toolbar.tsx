import React, { useState } from 'react';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  Type, Download, Trash2, Plus, Undo, Redo, Printer,
  ChevronDown, Palette, FileSpreadsheet, Layout
} from 'lucide-react';
import { CellStyle } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface ToolbarProps {
  currentStyle: CellStyle;
  onToggleStyle: (key: keyof CellStyle, value?: any) => void;
  onExport: () => void;
  onClear: () => void;
  onResetLayout: () => void;
}

interface ButtonProps {
  active?: boolean;
  onClick: () => void;
  children?: React.ReactNode;
  title?: string;
  className?: string;
  hasDropdown?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  active, 
  onClick, 
  children, 
  title,
  className = '',
  hasDropdown
}) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    title={title}
    onClick={onClick}
    className={`
      relative p-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-1
      ${active 
        ? 'bg-primary-50 text-primary-600 shadow-sm ring-1 ring-primary-200' 
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      } 
      ${className}
    `}
  >
    {children}
    {hasDropdown && <ChevronDown size={10} className="opacity-50 ml-0.5" />}
  </motion.button>
);

const Separator = () => <div className="h-6 w-px bg-slate-200 mx-1 md:mx-1.5 flex-shrink-0" />;

const TABS = ['Home', 'Insert', 'Data', 'View'];

const Toolbar: React.FC<ToolbarProps> = ({ currentStyle, onToggleStyle, onExport, onClear, onResetLayout }) => {
  const [activeTab, setActiveTab] = useState('Home');

  return (
    <div className="flex flex-col bg-white border-b border-slate-200 shadow-soft z-40">
      
      {/* Top Navigation & Branding Area */}
      <div className="flex items-center justify-between px-2 md:px-4 h-12 border-b border-slate-100">
         <div className="flex items-center gap-2 md:gap-6 overflow-hidden">
            <div className="flex items-center gap-2 text-primary-600 flex-shrink-0">
               <div className="p-1.5 bg-primary-50 rounded-lg">
                 <FileSpreadsheet size={20} />
               </div>
               <span className="font-bold text-slate-800 tracking-tight hidden md:block">React Sheets</span>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar mask-gradient">
                {TABS.map(tab => (
                    <button
                       key={tab}
                       onClick={() => setActiveTab(tab)}
                       className={`
                          relative px-2 md:px-3 py-1.5 text-xs md:text-sm font-medium rounded-md transition-colors whitespace-nowrap
                          ${activeTab === tab ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}
                       `}
                    >
                        {tab}
                        {activeTab === tab && (
                            <motion.div 
                                layoutId="tab-indicator"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full mx-2"
                            />
                        )}
                    </button>
                ))}
            </div>
         </div>

         {/* Document Actions */}
         <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
             {/* Visual group for Undo/Redo on mobile */}
             <div className="flex gap-0.5 md:gap-1 items-center bg-slate-50 md:bg-transparent p-0.5 md:p-0 rounded-md border border-slate-200 md:border-transparent">
                <Button onClick={() => {}} title="Undo" className="p-1.5 md:p-2 hover:bg-white md:hover:bg-slate-100"><Undo size={16}/></Button>
                <Button onClick={() => {}} title="Redo" className="p-1.5 md:p-2 hover:bg-white md:hover:bg-slate-100"><Redo size={16}/></Button>
             </div>
             
             {/* Hide separator on mobile to save space */}
             <div className="hidden md:block">
                <Separator />
             </div>

             <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onExport}
                className="flex items-center gap-2 px-2 md:px-3 py-1.5 bg-primary-600 text-white text-xs font-medium rounded-md shadow-sm hover:bg-primary-700 transition-colors"
             >
                <Download size={14} />
                <span className="hidden md:inline">Export</span>
             </motion.button>
         </div>
      </div>

      {/* Contextual Toolbar (The Ribbon) */}
      <div className="h-14 bg-white flex items-center px-2 md:px-4 overflow-x-auto no-scrollbar w-full">
          <AnimatePresence mode='wait'>
            {activeTab === 'Home' && (
                <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center min-w-max"
                >
                    {/* Font Styles */}
                    <div className="flex items-center gap-1">
                        <Button 
                        active={currentStyle.bold} 
                        onClick={() => onToggleStyle('bold', !currentStyle.bold)}
                        title="Bold (Ctrl+B)"
                        >
                        <Bold size={18} />
                        </Button>
                        <Button 
                        active={currentStyle.italic} 
                        onClick={() => onToggleStyle('italic', !currentStyle.italic)}
                        title="Italic (Ctrl+I)"
                        >
                        <Italic size={18} />
                        </Button>
                        <Button 
                        active={currentStyle.underline} 
                        onClick={() => onToggleStyle('underline', !currentStyle.underline)}
                        title="Underline (Ctrl+U)"
                        >
                        <Underline size={18} />
                        </Button>
                    </div>

                    <Separator />

                    {/* Colors */}
                    <div className="flex items-center gap-1">
                        <div className="relative group">
                            <Button onClick={() => {}} title="Text Color" hasDropdown>
                                <Type size={18} />
                                <div className="absolute bottom-1.5 right-1.5 w-3 h-3 rounded-full border border-white" style={{ backgroundColor: currentStyle.color || 'black' }}></div>
                            </Button>
                            <div className="fixed md:absolute left-0 md:left-auto mt-2 p-3 bg-white shadow-medium rounded-xl border border-slate-100 hidden group-hover:grid grid-cols-5 gap-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                                {['#0f172a', '#dc2626', '#10b981', '#2563eb', '#d97706', '#9333ea', '#db2777', '#ca8a04', '#4b5563', '#059669'].map(color => (
                                <button 
                                    key={color}
                                    className="w-6 h-6 rounded-full border border-slate-100 hover:scale-110 transition-transform shadow-sm"
                                    style={{ backgroundColor: color }}
                                    onClick={() => onToggleStyle('color', color)}
                                />
                                ))}
                            </div>
                        </div>

                        <div className="relative group">
                            <Button onClick={() => {}} title="Background Color" hasDropdown>
                                <Palette size={18} />
                                <div className="absolute bottom-1.5 right-1.5 w-3 h-3 rounded-full border border-white" style={{ backgroundColor: currentStyle.bg || 'transparent' }}></div>
                            </Button>
                            <div className="fixed md:absolute left-10 md:left-auto mt-2 p-3 bg-white shadow-medium rounded-xl border border-slate-100 hidden group-hover:grid grid-cols-5 gap-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                                {['transparent', '#fee2e2', '#d1fae5', '#dbeafe', '#fef3c7', '#f3f4f6', '#fce7f3', '#ede9fe', '#e0f2fe', '#fff7ed'].map(color => (
                                <button 
                                    key={color}
                                    className="w-6 h-6 rounded-md border border-slate-100 hover:scale-110 transition-transform shadow-sm relative"
                                    style={{ backgroundColor: color === 'transparent' ? '#fff' : color }}
                                    onClick={() => onToggleStyle('bg', color)}
                                >
                                    {color === 'transparent' && <div className="absolute inset-0 flex items-center justify-center text-red-500 text-[10px]">✕</div>}
                                </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Alignment */}
                    <div className="flex items-center gap-1">
                        <Button 
                        active={currentStyle.align === 'left'} 
                        onClick={() => onToggleStyle('align', 'left')}
                        >
                        <AlignLeft size={18} />
                        </Button>
                        <Button 
                        active={currentStyle.align === 'center'} 
                        onClick={() => onToggleStyle('align', 'center')}
                        >
                        <AlignCenter size={18} />
                        </Button>
                        <Button 
                        active={currentStyle.align === 'right'} 
                        onClick={() => onToggleStyle('align', 'right')}
                        >
                        <AlignRight size={18} />
                        </Button>
                    </div>

                    <Separator />

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                         <Button onClick={onResetLayout} title="Insert Cells">
                            <Layout size={18} />
                         </Button>
                         <Button onClick={onClear} title="Delete Content" className="hover:text-red-600 hover:bg-red-50">
                            <Trash2 size={18} />
                         </Button>
                    </div>
                </motion.div>
            )}
            
            {activeTab !== 'Home' && (
                 <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center w-full text-sm text-slate-400 italic"
                >
                    <span className="flex items-center gap-2"><div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div> Coming soon</span>
                </motion.div>
            )}
          </AnimatePresence>
      </div>
    </div>
  );
};

export default Toolbar;