
import React, { useState, useEffect, useRef } from 'react';
import { X, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CommentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialComment: string;
  cellId: string | null;
  onSave: (comment: string) => void;
  onDelete: () => void;
}

const CommentDialog: React.FC<CommentDialogProps> = ({ 
  isOpen, onClose, initialComment, cellId, onSave, onDelete 
}) => {
  const [comment, setComment] = useState(initialComment);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setComment(initialComment);
      // Focus textarea after animation
      setTimeout(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
        }
      }, 100);
    }
  }, [isOpen, initialComment]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2002] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4">
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
                    className="bg-white w-full max-w-[320px] shadow-2xl rounded-2xl flex flex-col overflow-hidden ring-1 ring-black/5"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-[#fdfdfd]">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-yellow-50 border border-yellow-100 flex items-center justify-center text-yellow-600">
                                <MessageSquare size={14} fill="currentColor" className="text-yellow-500/50" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[13px] font-bold text-slate-800 tracking-tight leading-none">Edit Comment</span>
                                <span className="text-[10px] text-slate-400 font-medium">{cellId || 'Cell'}</span>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 bg-white">
                        <textarea 
                            ref={textareaRef}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full h-32 px-3 py-2 bg-yellow-50/30 border border-yellow-200 rounded-lg text-[13px] text-slate-800 focus:outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-500/10 transition-all resize-none placeholder:text-slate-400"
                            placeholder="Start a conversation..."
                        />
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-100">
                        <button 
                            onClick={() => { onDelete(); onClose(); }}
                            className="text-[11px] font-semibold text-red-500 hover:text-red-700 hover:underline px-1 transition-colors"
                            title="Delete this comment"
                        >
                            Delete
                        </button>
                        <div className="flex gap-2">
                            <button 
                                onClick={onClose}
                                className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => { onSave(comment); onClose(); }}
                                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[12px] font-bold rounded-lg shadow-sm active:scale-95 transition-all"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default CommentDialog;
