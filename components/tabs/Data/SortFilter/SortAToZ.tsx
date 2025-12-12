
import React from 'react';
import { ArrowDown } from 'lucide-react';
import { RibbonButton } from '../../shared';

interface SortProps {
    onSort?: (direction: 'asc' | 'desc') => void;
}

const SortAToZ: React.FC<SortProps> = ({ onSort }) => (
    <RibbonButton 
        variant="small" 
        icon={<div className="flex flex-col text-[8px] font-bold leading-none text-slate-700"><span>A</span><span>Z</span><ArrowDown size={8}/></div>} 
        label="" 
        onClick={() => onSort && onSort('asc')} 
        title="Sort A to Z" 
    />
);

export default SortAToZ;