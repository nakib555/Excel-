import React, { useRef, useEffect } from 'react';
import { 
  Scissors, Copy, Clipboard, Trash2, Eraser, 
  ArrowRight, ArrowDown, X, Rows, Columns
} from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onAction: (action: string) => void;
  targetInfo?: string; // e.g., "Cell A1" or "Row 1"
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, onAction, targetInfo }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    const handleScroll = () => onClose();

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('scroll', handleScroll, { capture: true });
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [onClose]);

  // Prevent menu from going off-screen
  const style = {
    top: Math.min(y, window.innerHeight - 350),
    left: Math.min(x, window.innerWidth - 250),
  };

  const MenuItem = ({ icon: Icon, label, action, shortcut, danger = false }: any) => (
    <button
      onClick={() => { onAction(action); onClose(); }}
      className={`
        w-full flex items-center gap-3 px-3 py-1.5 text-sm hover:bg-slate-100 transition-colors text-left
        ${danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-700'}
      `}
    >
      <Icon size={14} className={danger ? 'text-red-500' : 'text-slate-500'} />
      <span className="flex-1">{label}</span>
      {shortcut && <span className="text-xs text-slate-400 font-sans">{shortcut}</span>}
    </button>
  );

  const Divider = () => <div className="h-[1px] bg-slate-200 my-1" />;

  return (
    <div 
      ref={menuRef}
      className="fixed z-[100] w-56 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 animate-in fade-in zoom-in-95 duration-100"
      style={style}
      onContextMenu={(e) => e.preventDefault()}
    >
      {targetInfo && (
        <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 border-b border-slate-100 pb-1.5">
          {targetInfo}
        </div>
      )}

      <MenuItem icon={Scissors} label="Cut" action="cut" shortcut="Ctrl+X" />
      <MenuItem icon={Copy} label="Copy" action="copy" shortcut="Ctrl+C" />
      <MenuItem icon={Clipboard} label="Paste" action="paste" shortcut="Ctrl+V" />
      
      <Divider />
      
      <MenuItem icon={ArrowDown} label="Insert Row" action="insert_row" />
      <MenuItem icon={ArrowRight} label="Insert Column" action="insert_col" />
      <MenuItem icon={Rows} label="Delete Row" action="delete_row" danger />
      <MenuItem icon={Columns} label="Delete Column" action="delete_col" danger />
      
      <Divider />
      
      <MenuItem icon={Eraser} label="Clear Contents" action="clear" />
    </div>
  );
};

export default ContextMenu;