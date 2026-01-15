import React, { useState, lazy, Suspense } from 'react';
import { Palette } from 'lucide-react';
import { RibbonButton, SmartDropdown } from '../../shared';
import { CellStyle } from '../../../../types';
import { DropdownGridSkeleton } from '../../../Skeletons';

const CellStylesGallery = lazy(() => import('./CellStylesGallery'));

interface CellStylesProps {
    onApplyStyle?: (style: CellStyle) => void;
    onMergeStyles?: () => void;
}

// Mimic type from gallery
interface StylePreset {
    name: string;
    style: CellStyle;
}

const CellStyles: React.FC<CellStylesProps> = ({ onApplyStyle, onMergeStyles }) => {
    const [open, setOpen] = useState(false);

    const handleSelect = (preset: StylePreset) => {
        if (onApplyStyle) {
            const finalStyle: CellStyle = { ...preset.style };
            
            // "Normal" acts as a reset
            if (preset.name === "Normal") {
                Object.assign(finalStyle, {
                    bg: undefined, color: undefined, bold: false, italic: false, underline: false,
                    borders: undefined, fontSize: 13, fontFamily: 'Inter'
                });
            }

            onApplyStyle(finalStyle);
        }
        setOpen(false);
    };

    return (
        <SmartDropdown
            open={open}
            onToggle={() => setOpen(!open)}
            contentWidth="w-[340px] md:w-[520px]"
            triggerClassName="h-full"
            trigger={
                <RibbonButton 
                    variant="large" 
                    icon={<Palette size={20} className="text-purple-500" />} 
                    label="Cell" 
                    subLabel="Styles" 
                    hasDropdown 
                    onClick={() => {}} 
                    active={open}
                    title="Cell Styles"
                />
            }
        >
            <Suspense fallback={<DropdownGridSkeleton />}>
                <CellStylesGallery 
                    onSelect={handleSelect} 
                    onMerge={() => { onMergeStyles?.(); setOpen(false); }} 
                />
            </Suspense>
        </SmartDropdown>
    );
};

export default CellStyles;