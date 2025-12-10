import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { 
  Undo, RotateCcw, MousePointer2, BoxSelect, Eraser, PenTool, Highlighter, 
  PlusCircle, Shapes, Pi, PlayCircle 
} from 'lucide-react';
import { RibbonGroup, RibbonButton, Separator, TabProps } from './shared';

const DrawTab: React.FC<TabProps> = () => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full min-w-max gap-1"
    >
         <RibbonGroup label="Undo">
            <div className="flex flex-col gap-0 h-full justify-center">
                <RibbonButton variant="icon-only" icon={<Undo size={16} />} onClick={() => {}} />
                <RibbonButton variant="icon-only" icon={<RotateCcw size={16} className="rotate-180 scale-x-[-1]" />} onClick={() => {}} />
            </div>
        </RibbonGroup>

        <RibbonGroup label="Drawing Tools">
            <div className="flex items-center gap-1 h-full">
                <RibbonButton variant="large" icon={<MousePointer2 size={24} />} label="Select" onClick={() => {}} />
                <RibbonButton variant="large" icon={<BoxSelect size={24} className="stroke-dashed" />} label="Lasso" onClick={() => {}} />
                <Separator />
                <RibbonButton variant="large" icon={<Eraser size={24} />} label="Eraser" hasDropdown onClick={() => {}} />
                <div className="flex gap-1 items-center px-1">
                    <RibbonButton variant="large" icon={<PenTool size={24} color="#000" fill="#000" />} label="Black" hasDropdown onClick={() => {}} />
                    <RibbonButton variant="large" icon={<PenTool size={24} color="#ef4444" fill="#ef4444" />} label="Red" hasDropdown onClick={() => {}} />
                    <RibbonButton variant="large" icon={<PenTool size={24} className="text-purple-500" />} label="Galaxy" hasDropdown onClick={() => {}} />
                    <RibbonButton variant="large" icon={<Highlighter size={24} className="text-yellow-400" />} label="Highlight" hasDropdown onClick={() => {}} />
                    <RibbonButton variant="large" icon={<PenTool size={24} color="#059669" fill="#059669" />} label="Green" hasDropdown onClick={() => {}} />
                </div>
                <RibbonButton variant="large" icon={<PlusCircle size={22} className="text-green-600" />} label="Add" hasDropdown onClick={() => {}} />
            </div>
        </RibbonGroup>

        <RibbonGroup label="Convert">
            <div className="flex items-center gap-1 h-full">
                <RibbonButton variant="large" icon={<Shapes size={22} className="text-blue-500" />} label="Ink to" subLabel="Shape" onClick={() => {}} />
                <RibbonButton variant="large" icon={<Pi size={22} className="text-blue-500" />} label="Ink to" subLabel="Math" onClick={() => {}} />
            </div>
        </RibbonGroup>

        <RibbonGroup label="Replay">
            <RibbonButton variant="large" icon={<PlayCircle size={22} className="text-green-600" />} label="Ink" subLabel="Replay" onClick={() => {}} />
        </RibbonGroup>
    </motion.div>
  );
};

export default memo(DrawTab);
