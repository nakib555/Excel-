import React from 'react';
import { MousePointer2, BoxSelect, Eraser, PenTool, Highlighter, PlusCircle } from 'lucide-react';
import { RibbonGroup, RibbonButton, Separator, TabProps } from '../../shared';

const DrawingToolsGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Drawing Tools">
        <div className="flex items-center gap-1 h-full">
            <RibbonButton variant="large" icon={<MousePointer2 size={20} className="text-slate-700" />} label="Select" onClick={() => {}} />
            <RibbonButton variant="large" icon={<BoxSelect size={20} className="stroke-dashed text-slate-700" />} label="Lasso" onClick={() => {}} />
            <Separator />
            <RibbonButton variant="large" icon={<Eraser size={20} className="text-pink-500" />} label="Eraser" hasDropdown onClick={() => {}} />
            <div className="flex gap-1 items-center px-1">
                <RibbonButton variant="large" icon={<PenTool size={20} color="#000" fill="#000" />} label="Black" hasDropdown onClick={() => {}} />
                <RibbonButton variant="large" icon={<PenTool size={20} color="#ef4444" fill="#ef4444" />} label="Red" hasDropdown onClick={() => {}} />
                <RibbonButton variant="large" icon={<PenTool size={20} className="text-purple-500" />} label="Galaxy" hasDropdown onClick={() => {}} />
                <RibbonButton variant="large" icon={<Highlighter size={20} className="text-yellow-400" />} label="Highlight" hasDropdown onClick={() => {}} />
                <RibbonButton variant="large" icon={<PenTool size={20} color="#059669" fill="#059669" />} label="Green" hasDropdown onClick={() => {}} />
            </div>
            <RibbonButton variant="large" icon={<PlusCircle size={20} className="text-green-600" />} label="Add" hasDropdown onClick={() => {}} />
        </div>
    </RibbonGroup>
  );
};

export default DrawingToolsGroup;