import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { RibbonGroup, TabProps } from '../shared';

import NewScript from './OfficeScripts/NewScript';
import ViewScripts from './OfficeScripts/ViewScripts';
import ScriptsGallery from './OfficeScripts/ScriptsGallery';
import FlowTemplates from './PowerAutomate/FlowTemplates';

const AutomateTab: React.FC<TabProps> = () => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full min-w-max gap-1"
    >
        <RibbonGroup label="Office Scripts">
             <div className="flex items-center gap-1 h-full">
                 <NewScript />
                 <ViewScripts />
             </div>
        </RibbonGroup>
        
        <RibbonGroup label="Office Scripts Gallery">
            <ScriptsGallery />
        </RibbonGroup>

        <RibbonGroup label="Power Automate">
             <div className="flex items-center gap-1 h-full">
                 <FlowTemplates />
             </div>
        </RibbonGroup>
    </motion.div>
  );
};

export default memo(AutomateTab);