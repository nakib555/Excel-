
import React from 'react';
import { ArrowDown } from 'lucide-react';
import { RibbonButton } from '../../shared';

interface SortProps {
    onSort?: (direction: 'asc' | 'desc') => void;
}

const SortZToA: React.FC<SortProps> = ({ onSort }) => (
    <RibbonButton 
        variant="small" 
        icon={<div className="flex flex-col text-[8px] font-bold leading-none text-slate-700"><span>Z</span><span>A</span><ArrowDown size={8}/></div>} 
        label="" 
        onClick={() => onSort && onSort('desc')} 
        title="Sort Z to A" 
    />
);

export default SortZToA;