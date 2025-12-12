import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { 
  FilePlus, FolderOpen, Save, FileDown, Printer, Share2, Info, History, 
  Shield, Settings, LogOut 
} from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../shared';

const FileTab: React.FC<TabProps> = ({ onExport }) => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full min-w-max gap-1"
    >
        <RibbonGroup label="Workbook">
            <div className="flex items-center gap-1 h-full">
                <RibbonButton 
                    variant="large" 
                    icon={<FilePlus size={20} className="text-emerald-600" />} 
                    label="New" 
                    subLabel="Blank" 
                    onClick={() => {
                        if (confirm('Create new blank workbook? Unsaved changes will be lost.')) {
                            window.location.reload();
                        }
                    }} 
                />
                <RibbonButton variant="large" icon={<FolderOpen size={20} className="text-blue-600" />} label="Open" onClick={() => {}} />
                <RibbonButton variant="large" icon={<Save size={20} className="text-slate-600" />} label="Save" subLabel="As" onClick={onExport} />
            </div>
        </RibbonGroup>

        <RibbonGroup label="Export">
             <div className="flex items-center gap-1 h-full">
                 <RibbonButton variant="large" icon={<FileDown size={20} className="text-emerald-600" />} label="Export" subLabel="CSV" onClick={onExport} />
                 <RibbonButton variant="large" icon={<Printer size={20} className="text-slate-600" />} label="Print" onClick={() => window.print()} />
                 <RibbonButton variant="large" icon={<Share2 size={20} className="text-purple-600" />} label="Share" onClick={() => {}} />
             </div>
        </RibbonGroup>

        <RibbonGroup label="Info">
             <div className="flex items-center gap-1 h-full">
                 <RibbonButton variant="large" icon={<Info size={20} className="text-blue-500" />} label="Info" onClick={() => {}} />
                 <RibbonButton variant="large" icon={<History size={20} className="text-purple-500" />} label="Version" subLabel="History" onClick={() => {}} />
                 <RibbonButton variant="large" icon={<Shield size={20} className="text-orange-600" />} label="Protect" subLabel="Workbook" onClick={() => {}} />
             </div>
        </RibbonGroup>

        <RibbonGroup label="Account">
             <div className="flex items-center gap-1 h-full">
                 <RibbonButton variant="large" icon={<Settings size={20} className="text-slate-500" />} label="Options" onClick={() => {}} />
                 <RibbonButton variant="large" icon={<LogOut size={20} className="text-red-500" />} label="Close" onClick={() => {}} />
             </div>
        </RibbonGroup>
    </motion.div>
  );
};

export default memo(FileTab);
