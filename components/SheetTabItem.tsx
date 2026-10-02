import React, { memo, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Tooltip } from './shared';
import { Edit2, Trash2, Copy, MoreHorizontal } from 'lucide-react';

interface SheetTabItemProps {
    id: string;
    name: string;
    isActive: boolean;
    canDelete: boolean;
    isMenuOpen?: boolean;
    menuPos?: { x: number, y: number } | null;
    onOpenMenu?: (pos: { x: number, y: number }) => void;
    onCloseMenu?: () => void;
    onClick: (id: string) => void;
    onRename?: (id: string, newName: string) => void;
    onDelete?: (id: string) => void;
    onDuplicate?: (id: string) => void;
}

const SheetTabItem = ({ 
    id, 
    name, 
    isActive, 
    canDelete, 
    isMenuOpen = false,
    menuPos = null,
    onOpenMenu,
    onCloseMenu,
    onClick, 
    onRename, 
    onDelete, 
    onDuplicate 
}: SheetTabItemProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(name);
    const inputRef = useRef<HTMLInputElement>(null);
    const tabRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setEditValue(name);
    }, [name]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleCommitRename = () => {
        setIsEditing(false);
        const trimmed = editValue.trim();
        if (trimmed && trimmed !== name && onRename) {
            onRename(id, trimmed);
        } else {
            setEditValue(name);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleCommitRename();
        } else if (e.key === 'Escape') {
            setEditValue(name);
            setIsEditing(false);
        }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onClick(id);
        if (onOpenMenu) {
            onOpenMenu({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMoreClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClick(id);
        const rect = tabRef.current?.getBoundingClientRect();
        const pos = rect ? { x: rect.left, y: rect.top - 10 } : { x: e.clientX, y: e.clientY };
        if (onOpenMenu) {
            onOpenMenu(pos);
        }
    };

    return (
        <>
            <Tooltip content={isEditing ? '' : `${name} (Double-click to rename, right-click for options)`} side="top" delayDuration={600}>
                <motion.div
                  ref={tabRef}
                  onClick={() => !isEditing && onClick(id)}
                  onDoubleClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                      setEditValue(name);
                  }}
                  onContextMenu={handleContextMenu}
                  className={`
                    group flex items-center px-3 py-1.5 text-xs font-medium transition-all flex-shrink-0
                    min-w-[100px] justify-between relative cursor-pointer gap-1.5
                    rounded-t-md border-t-2 select-none
                    ${isActive 
                      ? 'bg-white text-emerald-700 shadow-soft border-t-emerald-500' 
                      : 'bg-transparent text-slate-600 hover:bg-slate-200 hover:text-slate-800 border-t-transparent'
                    }
                  `}
                >
                  {isEditing ? (
                      <input 
                          ref={inputRef}
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleCommitRename}
                          onKeyDown={handleKeyDown}
                          className="bg-white border border-emerald-500 rounded px-1 py-0.5 text-xs text-slate-900 outline-none w-24 font-medium shadow-sm"
                          onClick={(e) => e.stopPropagation()}
                      />
                  ) : (
                      <>
                          <span className="truncate max-w-[120px] pointer-events-none">{name}</span>
                          <button
                              onClick={handleMoreClick}
                              className={`p-0.5 rounded hover:bg-slate-300/60 text-slate-400 hover:text-slate-700 transition-opacity ${
                                  isActive ? 'opacity-70 group-hover:opacity-100' : 'opacity-0 group-hover:opacity-100'
                              }`}
                              title="Sheet options"
                          >
                              <MoreHorizontal size={13} />
                          </button>
                      </>
                  )}
                </motion.div>
            </Tooltip>

            {/* Context / Options Menu via Portal */}
            {isMenuOpen && menuPos && createPortal(
                <div 
                    className="fixed z-[9999] bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-200/90 py-1.5 w-48 text-xs font-normal text-slate-700 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100 p-1"
                    style={{
                        top: Math.max(10, Math.min(window.innerHeight - 160, menuPos.y - 120)),
                        left: Math.max(10, Math.min(window.innerWidth - 200, menuPos.x)),
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                        {name}
                    </div>
                    <button
                        onClick={() => {
                            if (onCloseMenu) onCloseMenu();
                            setIsEditing(true);
                            setEditValue(name);
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors text-left cursor-pointer"
                    >
                        <Edit2 size={13} className="text-emerald-600" />
                        <span>Rename</span>
                    </button>
                    <button
                        onClick={() => {
                            if (onCloseMenu) onCloseMenu();
                            if (onDuplicate) onDuplicate(id);
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors text-left cursor-pointer"
                    >
                        <Copy size={13} className="text-blue-600" />
                        <span>Duplicate</span>
                    </button>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                        disabled={!canDelete}
                        onClick={() => {
                            if (onCloseMenu) onCloseMenu();
                            if (onDelete && canDelete) onDelete(id);
                        }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 text-left rounded-lg transition-colors ${
                            canDelete 
                                ? 'text-red-600 hover:bg-red-50 cursor-pointer' 
                                : 'text-slate-400 opacity-50 cursor-not-allowed'
                        }`}
                        title={canDelete ? 'Delete sheet' : 'Cannot delete the only sheet in workbook'}
                    >
                        <Trash2 size={13} />
                        <span>Delete Sheet</span>
                    </button>
                </div>,
                document.body
            )}
        </>
    );
};

export default memo(SheetTabItem);
