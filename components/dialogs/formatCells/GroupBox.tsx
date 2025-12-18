
import React from 'react';
import { cn } from '../../../utils';

interface GroupBoxProps {
    label: string;
    children?: React.ReactNode;
    className?: string;
}

const GroupBox: React.FC<GroupBoxProps> = ({ label, children, className }) => (
    <div className={cn("border border-slate-200 rounded-2xl p-6 relative pt-8 bg-white/40 backdrop-blur-sm shadow-soft transition-all", className)}>
        <span className="absolute -top-3 left-6 bg-white border border-slate-200 rounded-full px-4 py-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] shadow-sm">{label}</span>
        {children}
    </div>
);

export default GroupBox;
