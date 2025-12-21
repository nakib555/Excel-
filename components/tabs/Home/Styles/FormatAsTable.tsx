
import React, { useState, lazy, Suspense } from 'react';
import { Table } from 'lucide-react';
import { RibbonButton, SmartDropdown } from '../../shared';
import { TableStylePreset } from '../../../../types';
import { DropdownGridSkeleton } from '../../../Skeletons';

// Import data needed for props/types
export { TABLE_STYLES } from './tableData';
export { StylePreviewItem } from './TableStylesGallery';
export type { TableStylePreset } from '../../../../types';

// Lazy load the gallery content
const TableStylesGallery = lazy(() => import('./TableStylesGallery'));

interface FormatAsTableProps {
    onFormatAsTable?: (style: TableStylePreset) => void;
}

const FormatAsTable: React.FC<FormatAsTableProps> = ({ onFormatAsTable }) => {
    const [open, setOpen] = useState(false);

    const handleSelect = (style: TableStylePreset) => {
        if (onFormatAsTable) onFormatAsTable(style);
        setOpen(false);
    };

    return (
        <SmartDropdown
            open={open}
            onToggle={() => setOpen(!open)}
            contentWidth="w-[90vw] md:w-[480px] max-w-[640px]"
            triggerClassName="h-full"
            trigger={
                <RibbonButton 
                    variant="large" 
                    icon={<Table size={20} className="text-amber-500" />} 
                    label="Format as" 
                    subLabel="Table" 
                    onClick={() => {}} 
                    hasDropdown 
                    active={open}
                />
            }
        >
            <Suspense fallback={<DropdownGridSkeleton />}>
                <TableStylesGallery onSelect={handleSelect} />
            </Suspense>
        </SmartDropdown>
    );
};

export default FormatAsTable;
